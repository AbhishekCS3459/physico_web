import { createSession, createUserSession, verifyPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

/**
 * Unified sign-in: try Admin first, then User (patient).
 * Sets the appropriate session cookie and returns role so the client can redirect.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = signinSchema.parse(body)
    const normalizedEmail = email.toLowerCase().trim()

    // 1. Try Admin (staff / super_admin)
    const admin = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
    })

    if (admin) {
      const valid = await verifyPassword(password, admin.password)
      if (valid) {
        const role = (admin.role === 'super_admin' ? 'super_admin' : 'staff') as import('@/lib/auth').AdminRole
        await createSession(admin.id, admin.email, admin.name ?? undefined, role)
        return NextResponse.json({
          success: true,
          role: 'admin',
          message: 'Login successful',
          admin: {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role,
          },
        })
      }
    }

    // 2. Try User (patient)
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (user) {
      const valid = await verifyPassword(password, user.password)
      if (valid) {
        await createUserSession(user.id, user.email, user.firstName ?? undefined, user.lastName ?? undefined)
        return NextResponse.json({
          success: true,
          role: 'user',
          message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        })
      }
    }

    return NextResponse.json(
      { success: false, error: 'Invalid email or password' },
      { status: 401 }
    )
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: e.errors },
        { status: 400 }
      )
    }
    console.error('Sign-in error:', e)
    return NextResponse.json(
      { success: false, error: 'Failed to sign in' },
      { status: 500 }
    )
  }
}
