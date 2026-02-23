import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * RBAC: 1) admin/super_admin – full admin (dashboard + charts); 2) staff – charts only, see all bookings; 3) patient – own bookings only.
 * Redirect staff from /admin (dashboard) to /admin/charts.
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Only redirect when visiting the dashboard exactly, not /admin/charts or /admin/...
  if (pathname !== '/admin') {
    return NextResponse.next()
  }

  const cookie = request.cookies.get('admin_session')?.value
  if (!cookie) {
    return NextResponse.next()
  }
  try {
    // Cookie is stored as JSON (not URL-encoded by Next.js set)
    const session = JSON.parse(cookie) as { role?: string }
    if (session.role === 'staff') {
      return NextResponse.redirect(new URL('/admin/charts', request.url))
    }
  } catch {
    // ignore invalid cookie
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin'],
}
