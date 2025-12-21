import { getSession } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json(
        { success: false, authenticated: false },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      admin: session,
    })
  } catch (error) {
    console.error('Error checking session:', error)
    return NextResponse.json(
      { success: false, authenticated: false },
      { status: 500 }
    )
  }
}
