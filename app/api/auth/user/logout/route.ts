import { deleteUserSession } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    await deleteUserSession()
    return NextResponse.json({ success: true, message: 'Logout successful' })
  } catch (error) {
    console.error('Error during logout:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to logout' },
      { status: 500 }
    )
  }
}

