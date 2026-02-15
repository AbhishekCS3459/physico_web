import { hashPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = resetPasswordSchema.parse(body)

    // Find admin by reset token
    const admin = await prisma.admin.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(), // Token must not be expired
        },
      },
    })

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired reset token. Please request a new password reset.',
        },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await hashPassword(password)

    // Update admin password and clear reset token fields
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    console.error('Error during admin password reset:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}


