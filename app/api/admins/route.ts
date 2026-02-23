import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// List all admins (doctors) for share chart dropdown - admin only
export async function GET() {
  try {
    await requireAuth()

    const admins = await prisma.admin.findMany({
      select: { id: true, email: true, name: true, role: true },
      orderBy: { email: 'asc' },
    })

    return NextResponse.json({ success: true, data: admins })
  } catch (e: any) {
    if (e.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    console.error('GET /api/admins', e)
    return NextResponse.json({ success: false, error: 'Failed to fetch admins' }, { status: 500 })
  }
}
