import { prisma } from '@/lib/prisma'
import { sendAdminPasswordResetEmail } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import * as crypto from 'crypto'

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Don't reveal if admin exists or not (security best practice)
    // Always return success message
    if (!admin) {
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
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry,
      },
    })

    // Send password reset email
    await sendAdminPasswordResetEmail(
      admin.email,
      resetToken,
      admin.name || undefined
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

    console.error('Error during admin forgot password:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
}


