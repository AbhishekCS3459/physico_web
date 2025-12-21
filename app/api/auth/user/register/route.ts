import { createUserSession, hashPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, phoneNumber } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await (prisma as any).user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await (prisma as any).user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        role: 'user',
      },
    })

    // Create session
    await createUserSession(user.id, user.email, user.firstName || undefined, user.lastName || undefined)

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    // Log detailed error for debugging
    console.error('Error during registration:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      // Prisma Client not generated
      if (error.message?.includes('Cannot find module') || error.message?.includes('@prisma/client') || error.message?.includes('PrismaClient')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Database client not initialized. Please run: pnpm db:generate and restart your dev server',
            details: error.message 
          },
          { status: 500 }
        )
      }
      
      // Database connection errors
      if (error.message.includes('P1001') || error.message.includes('connection')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Database connection failed. Please check your DATABASE_URL in .env.local',
            details: error.message 
          },
          { status: 500 }
        )
      }
      
      // Table doesn't exist
      if (error.message.includes('does not exist') || error.message.includes('P2001') || error.message.includes('P2025')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Database table not found. Please run: pnpm db:push',
            details: error.message 
          },
          { status: 500 }
        )
      }
      
      // Unique constraint violation (duplicate email)
      if (error.message.includes('Unique constraint') || error.message.includes('P2002')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'User with this email already exists',
            details: error.message 
          },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to register',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

