import { requireAuth } from "@/lib/auth"
import { disconnectGoogleCalendar, isGoogleCalendarConfigured } from "@/lib/google-calendar"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

function unauthorized(error: unknown) {
  if (error instanceof Error && error.message === "Unauthorized") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }
  return null
}

export async function GET() {
  try {
    const session = await requireAuth()
    const connection = await prisma.googleCalendarConnection.findUnique({
      where: { adminId: session.id },
      select: { googleEmail: true, calendarId: true, createdAt: true, updatedAt: true },
    })

    return NextResponse.json({
      success: true,
      data: {
        configured: isGoogleCalendarConfigured(),
        connected: !!connection,
        googleEmail: connection?.googleEmail ?? null,
        calendarId: connection?.calendarId ?? null,
        connectedAt: connection?.updatedAt ?? null,
      },
    })
  } catch (error) {
    const authResponse = unauthorized(error)
    if (authResponse) return authResponse
    console.error("GET /api/admin/google-calendar", error)
    return NextResponse.json({ success: false, error: "Failed to load Google Calendar status" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const session = await requireAuth()
    await disconnectGoogleCalendar(session.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const authResponse = unauthorized(error)
    if (authResponse) return authResponse
    console.error("DELETE /api/admin/google-calendar", error)
    return NextResponse.json({ success: false, error: "Failed to disconnect Google Calendar" }, { status: 500 })
  }
}
