import { getSession } from "@/lib/auth"
import { createAuthorizationRequest, isGoogleCalendarConfigured } from "@/lib/google-calendar"
import { NextRequest, NextResponse } from "next/server"
import { GOOGLE_OAUTH_COOKIE, GOOGLE_OAUTH_COOKIE_PATH } from "../oauth-cookie"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  if (!isGoogleCalendarConfigured()) {
    return NextResponse.redirect(new URL("/admin/calendar?error=not_configured", request.url))
  }

  try {
    // Use this request's origin so production never inherits a localhost APP_URL.
    const { url, state, codeVerifier, redirectUri } = await createAuthorizationRequest(request.nextUrl.origin)
    const response = NextResponse.redirect(url)
    response.cookies.set(
      GOOGLE_OAUTH_COOKIE,
      JSON.stringify({ state, codeVerifier, adminId: session.id, redirectUri }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" || request.nextUrl.protocol === "https:",
        sameSite: "lax",
        path: GOOGLE_OAUTH_COOKIE_PATH,
        maxAge: 10 * 60,
      }
    )
    return response
  } catch (error) {
    console.error("GET /api/admin/google-calendar/connect", error)
    return NextResponse.redirect(new URL("/admin/calendar?error=connect_failed", request.url))
  }
}
