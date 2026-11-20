import { calendar, type calendar_v3 } from "@googleapis/calendar"
import { CodeChallengeMethod, OAuth2Client } from "google-auth-library"
import { randomBytes } from "crypto"
import { prisma } from "./prisma"
import { CLINIC_TIME_ZONE } from "./schedule"
import { decryptSecret, encryptSecret } from "./token-crypto"

const CALENDAR_EVENTS_SCOPE = "https://www.googleapis.com/auth/calendar.events"
const SCOPES = ["openid", "email", CALENDAR_EVENTS_SCOPE]

export type CalendarSyncResult =
  | { status: "synced"; message: string }
  | { status: "removed"; message: string }
  | { status: "skipped"; message: string }
  | { status: "error"; message: string }

type OAuthConfig = { clientId: string; clientSecret: string; redirectUri: string }

const CALLBACK_PATH = "/api/admin/google-calendar/callback"
const PRODUCTION_APP_URL = "https://www.physiorehabathome.ca"

/**
 * Resolves the OAuth redirect URI for the current environment.
 * Prefer an explicit GOOGLE_REDIRECT_URI, then the request origin (so production
 * never accidentally sends users back to localhost from a mis-set APP_URL).
 */
export function resolveGoogleRedirectUri(requestOrigin?: string): string | undefined {
  const explicit = process.env.GOOGLE_REDIRECT_URI?.trim().replace(/\/$/, "")
  if (explicit) return explicit.endsWith(CALLBACK_PATH) ? explicit : `${explicit}${CALLBACK_PATH}`

  const origin = requestOrigin?.replace(/\/$/, "")
  if (origin && !/localhost|127\.0\.0\.1/i.test(origin)) {
    return `${origin}${CALLBACK_PATH}`
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "")
  if (appUrl && !/localhost|127\.0\.0\.1/i.test(appUrl)) {
    return `${appUrl}${CALLBACK_PATH}`
  }

  // Production deploys sometimes leave NEXT_PUBLIC_APP_URL as localhost — never use that live.
  if (process.env.NODE_ENV === "production" || process.env.VERCEL === "1") {
    return `${PRODUCTION_APP_URL}${CALLBACK_PATH}`
  }

  if (origin) return `${origin}${CALLBACK_PATH}`
  if (appUrl) return `${appUrl}${CALLBACK_PATH}`
  return undefined
}

function getOAuthConfig(redirectUriOverride?: string): OAuthConfig | null {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = redirectUriOverride || resolveGoogleRedirectUri()

  if (!clientId || !clientSecret || !redirectUri || !process.env.GOOGLE_TOKEN_ENCRYPTION_KEY) return null
  return { clientId, clientSecret, redirectUri }
}

export function isGoogleCalendarConfigured(): boolean {
  return getOAuthConfig() !== null
}

function createOAuthClient(redirectUriOverride?: string): OAuth2Client {
  const config = getOAuthConfig(redirectUriOverride)
  if (!config) throw new Error("Google Calendar integration is not configured")
  return new OAuth2Client({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    redirectUri: config.redirectUri,
  })
}

export async function createAuthorizationRequest(requestOrigin?: string) {
  const redirectUri = resolveGoogleRedirectUri(requestOrigin)
  if (!redirectUri) throw new Error("Google Calendar redirect URI is not configured")

  const client = createOAuthClient(redirectUri)
  const state = randomBytes(32).toString("base64url")
  const { codeVerifier, codeChallenge } = await client.generateCodeVerifierAsync()

  const url = client.generateAuthUrl({
    access_type: "offline",
    // Always show consent so Google issues a refresh token even if the account authorized the app before.
    prompt: "consent",
    include_granted_scopes: true,
    scope: SCOPES,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: CodeChallengeMethod.S256,
  })

  return { url, state, codeVerifier, redirectUri }
}

export async function connectGoogleCalendar(
  adminId: string,
  code: string,
  codeVerifier: string,
  redirectUriOverride?: string
) {
  const config = getOAuthConfig(redirectUriOverride)
  if (!config) throw new Error("Google Calendar integration is not configured")

  const client = createOAuthClient(config.redirectUri)
  const { tokens } = await client.getToken({ code, codeVerifier })

  const grantedScopes = (tokens.scope ?? "").split(" ")
  if (!grantedScopes.includes(CALENDAR_EVENTS_SCOPE)) {
    throw new CalendarConnectError("calendar_permission_missing")
  }
  if (!tokens.refresh_token) {
    throw new CalendarConnectError("no_refresh_token")
  }
  if (!tokens.id_token) {
    throw new CalendarConnectError("no_identity")
  }

  const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: config.clientId })
  const googleEmail = ticket.getPayload()?.email
  if (!googleEmail) {
    throw new CalendarConnectError("no_identity")
  }

  const existing = await prisma.googleCalendarConnection.findUnique({ where: { adminId } })
  const data = {
    googleEmail,
    encryptedRefreshToken: encryptSecret(tokens.refresh_token),
    scope: tokens.scope ?? CALENDAR_EVENTS_SCOPE,
  }
  await prisma.googleCalendarConnection.upsert({
    where: { adminId },
    create: { adminId, ...data },
    update: data,
  })

  if (existing) {
    const previousToken = safeDecrypt(existing.encryptedRefreshToken)
    if (previousToken && previousToken !== tokens.refresh_token) {
      await client.revokeToken(previousToken).catch(() => undefined)
    }
  }

  return { googleEmail }
}

export async function disconnectGoogleCalendar(adminId: string) {
  const connection = await prisma.googleCalendarConnection.findUnique({ where: { adminId } })
  if (!connection) return

  const refreshToken = safeDecrypt(connection.encryptedRefreshToken)
  if (refreshToken && isGoogleCalendarConfigured()) {
    await createOAuthClient()
      .revokeToken(refreshToken)
      .catch((error) => console.warn("Google token revoke failed; deleting local connection anyway", error))
  }
  await prisma.googleCalendarConnection.delete({ where: { adminId } })
}

export class CalendarConnectError extends Error {
  constructor(public readonly code: "calendar_permission_missing" | "no_refresh_token" | "no_identity") {
    super(code)
    this.name = "CalendarConnectError"
  }
}

function safeDecrypt(payload: string): string | null {
  try {
    return decryptSecret(payload)
  } catch {
    return null
  }
}

async function getCalendarForAdmin(adminId: string) {
  if (!isGoogleCalendarConfigured()) return null
  const connection = await prisma.googleCalendarConnection.findUnique({ where: { adminId } })
  if (!connection) return null

  const auth = createOAuthClient()
  auth.setCredentials({ refresh_token: decryptSecret(connection.encryptedRefreshToken) })
  return { api: calendar({ version: "v3", auth }), calendarId: connection.calendarId }
}

function httpStatusOf(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null) {
    const e = error as { status?: unknown; response?: { status?: unknown } }
    if (typeof e.status === "number") return e.status
    if (typeof e.response?.status === "number") return e.response.status
  }
  return undefined
}

function describeGoogleError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  if (/invalid_grant/i.test(message)) {
    return "Google access was revoked or expired. The assigned clinician needs to reconnect Google Calendar."
  }
  if (httpStatusOf(error) === 403) {
    return "Google refused access to this calendar. Reconnect Google Calendar and allow calendar access."
  }
  return `Google Calendar error: ${message}`
}

type BookingForEvent = {
  id: string
  firstName: string
  lastName: string
  phoneNumber: string
  serviceType: string
  appointmentType: string
  serviceLocation: string
  fullAddress: string
  specialInstructions: string | null
  scheduledStart: Date
  scheduledEnd: Date
}

function titleCase(slug: string) {
  return slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function buildEvent(booking: BookingForEvent): calendar_v3.Schema$Event {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "")
  // Clinical details (condition, medical history, insurance) are deliberately left out of the calendar event.
  const description = [
    `${titleCase(booking.serviceType)} — ${titleCase(booking.appointmentType)}`,
    `Patient: ${booking.firstName} ${booking.lastName}`,
    `Phone: ${booking.phoneNumber}`,
    `Location type: ${titleCase(booking.serviceLocation)}`,
    booking.specialInstructions ? `Notes: ${booking.specialInstructions}` : null,
    appUrl ? `Booking: ${appUrl}/admin` : null,
  ]
    .filter(Boolean)
    .join("\n")

  return {
    summary: `${titleCase(booking.serviceType)}: ${booking.firstName} ${booking.lastName}`,
    location: booking.fullAddress,
    description,
    start: { dateTime: booking.scheduledStart.toISOString(), timeZone: CLINIC_TIME_ZONE },
    end: { dateTime: booking.scheduledEnd.toISOString(), timeZone: CLINIC_TIME_ZONE },
    extendedProperties: { private: { physioRehabBookingId: booking.id } },
    reminders: { useDefault: true },
  }
}

async function deleteEvent(adminId: string, eventId: string) {
  const target = await getCalendarForAdmin(adminId)
  if (!target) return
  try {
    await target.api.events.delete({ calendarId: target.calendarId, eventId, sendUpdates: "none" })
  } catch (error) {
    const status = httpStatusOf(error)
    if (status !== 404 && status !== 410) throw error
  }
}

/**
 * Brings the Google Calendar event for a booking in line with its current state:
 * a confirmed, scheduled booking with an assigned clinician gets an event on that
 * clinician's calendar; anything else has its event removed.
 */
export async function syncBookingCalendarEvent(bookingId: string): Promise<CalendarSyncResult> {
  const booking = await prisma.therapyBooking.findUnique({
    where: { id: bookingId },
    include: { assignedAdmin: { select: { name: true, email: true } } },
  })
  if (!booking) return { status: "skipped", message: "Booking not found" }

  const wantsEvent =
    booking.status === "confirmed" &&
    !!booking.scheduledStart &&
    !!booking.scheduledEnd &&
    !!booking.assignedAdminId

  try {
    let eventId = booking.googleEventId
    if (eventId && booking.googleEventAdminId && (!wantsEvent || booking.googleEventAdminId !== booking.assignedAdminId)) {
      await deleteEvent(booking.googleEventAdminId, eventId)
      eventId = null
    }

    if (!wantsEvent) {
      await prisma.therapyBooking.update({
        where: { id: booking.id },
        data: { googleEventId: null, googleEventAdminId: null, calendarSyncError: null },
      })
      if (booking.googleEventId) return { status: "removed", message: "Removed from Google Calendar" }
      if (booking.status === "confirmed") {
        return { status: "skipped", message: "Set a visit time and clinician to add this booking to Google Calendar" }
      }
      return { status: "skipped", message: "No calendar event needed" }
    }

    const assigneeName = booking.assignedAdmin?.name || booking.assignedAdmin?.email || "The assigned clinician"
    const target = await getCalendarForAdmin(booking.assignedAdminId!)
    if (!target) {
      const message = isGoogleCalendarConfigured()
        ? `${assigneeName} hasn't connected Google Calendar yet`
        : "Google Calendar integration is not configured on the server"
      await prisma.therapyBooking.update({
        where: { id: booking.id },
        data: { googleEventId: null, googleEventAdminId: null, calendarSyncError: message },
      })
      return { status: "skipped", message }
    }

    const requestBody = buildEvent({
      ...booking,
      scheduledStart: booking.scheduledStart!,
      scheduledEnd: booking.scheduledEnd!,
    })

    let savedEventId: string | null | undefined
    if (eventId) {
      try {
        const res = await target.api.events.patch({
          calendarId: target.calendarId,
          eventId,
          requestBody,
          sendUpdates: "none",
        })
        savedEventId = res.data.id
      } catch (error) {
        const status = httpStatusOf(error)
        if (status !== 404 && status !== 410) throw error
      }
    }
    if (!savedEventId) {
      const res = await target.api.events.insert({ calendarId: target.calendarId, requestBody, sendUpdates: "none" })
      savedEventId = res.data.id
    }

    await prisma.therapyBooking.update({
      where: { id: booking.id },
      data: {
        googleEventId: savedEventId ?? null,
        googleEventAdminId: booking.assignedAdminId,
        calendarSyncedAt: new Date(),
        calendarSyncError: null,
      },
    })
    return { status: "synced", message: `Added to ${assigneeName}'s Google Calendar` }
  } catch (error) {
    console.error(`Google Calendar sync failed for booking ${booking.id}`, error)
    const message = describeGoogleError(error)
    await prisma.therapyBooking
      .update({ where: { id: booking.id }, data: { calendarSyncError: message } })
      .catch(() => undefined)
    return { status: "error", message }
  }
}

/** Removes a booking's calendar event before the booking itself is deleted. */
export async function removeBookingCalendarEvent(booking: {
  googleEventId: string | null
  googleEventAdminId: string | null
}): Promise<void> {
  if (!booking.googleEventId || !booking.googleEventAdminId) return
  try {
    await deleteEvent(booking.googleEventAdminId, booking.googleEventId)
  } catch (error) {
    console.error("Failed to remove Google Calendar event for deleted booking", error)
  }
}
