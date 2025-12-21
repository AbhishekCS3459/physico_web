import { deleteSession } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    await deleteSession()
    return NextResponse.json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    console.error('Error during logout:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to logout' },
      { status: 500 }
    )
  }
}
