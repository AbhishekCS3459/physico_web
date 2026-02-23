import { hashPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
})

// Staff registration: creates Admin with role "staff" by default
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = registerSchema.parse(body)
    const normalizedEmail = email.toLowerCase().trim()

    const existing = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    const hashedPassword = await hashPassword(password)

    const admin = await prisma.admin.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: name?.trim() || null,
        role: 'staff',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Account created. You can now log in.',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: 'staff',
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0]?.message ?? 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error during staff registration:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
