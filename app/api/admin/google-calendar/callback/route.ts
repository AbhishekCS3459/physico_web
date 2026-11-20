import { getSession } from "@/lib/auth"
import { CalendarConnectError, connectGoogleCalendar } from "@/lib/google-calendar"
import { timingSafeEqual } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { GOOGLE_OAUTH_COOKIE, GOOGLE_OAUTH_COOKIE_PATH } from "../oauth-cookie"

export const dynamic = "force-dynamic"

type PendingAuthorization = {
  state: string
  codeVerifier: string
  adminId: string
  redirectUri?: string
}

function readPending(raw: string | undefined): PendingAuthorization | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<PendingAuthorization>
    if (typeof parsed.state === "string" && typeof parsed.codeVerifier === "string" && typeof parsed.adminId === "string") {
      return {
        state: parsed.state,
        codeVerifier: parsed.codeVerifier,
        adminId: parsed.adminId,
        redirectUri: typeof parsed.redirectUri === "string" ? parsed.redirectUri : undefined,
      }
    }
  } catch {
    // fall through
  }
  return null
}

function statesMatch(expected: string, received: string) {
  const a = Buffer.from(expected)
  const b = Buffer.from(received)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function GET(request: NextRequest) {
  const finish = (query: string) => {
    const response = NextResponse.redirect(new URL(`/admin/calendar?${query}`, request.url))
    response.cookies.set(GOOGLE_OAUTH_COOKIE, "", { path: GOOGLE_OAUTH_COOKIE_PATH, maxAge: 0 })
    return response
  }

  const params = request.nextUrl.searchParams
  if (params.get("error")) {
    return finish(params.get("error") === "access_denied" ? "error=denied" : "error=connect_failed")
  }

  const pending = readPending(request.cookies.get(GOOGLE_OAUTH_COOKIE)?.value)
  const code = params.get("code")
  const state = params.get("state")
  if (!pending || !code || !state || !statesMatch(pending.state, state)) {
    return finish("error=invalid_state")
  }

  const session = await getSession()
  if (!session || session.id !== pending.adminId) {
    return finish("error=invalid_state")
  }

  try {
    // Must reuse the same redirect URI that started the OAuth request.
    await connectGoogleCalendar(session.id, code, pending.codeVerifier, pending.redirectUri)
    return finish("connected=1")
  } catch (error) {
    if (error instanceof CalendarConnectError) {
      return finish(`error=${error.code}`)
    }
    console.error("GET /api/admin/google-calendar/callback", error)
    return finish("error=connect_failed")
  }
}
