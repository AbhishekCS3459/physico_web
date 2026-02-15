import { sendPasswordResetEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import * as crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    // Find user by email
    const user = await (prisma as any).user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Don't reveal if user exists or not (security best practice)
    // Always return success message
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date()
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1) // Token expires in 1 hour

    // Save reset token to database
    await (prisma as any).user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry,
      },
    })

    // Send password reset email
    await sendPasswordResetEmail(
      user.email,
      resetToken,
      user.firstName || undefined
    )

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error during forgot password:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
}

