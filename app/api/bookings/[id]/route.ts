import { getSession, getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updateBookingSchema = z.object({
  // Service Information
  serviceType: z.string().min(1).optional(),
  appointmentType: z.string().min(1).optional(),
  preferredDate: z.string().optional(),
  preferredTime: z.string().min(1).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  serviceLocation: z.string().min(1).optional(),
  fullAddress: z.string().min(1).optional(),
  
  // Personal Information
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().min(1).optional(),
  dateOfBirth: z.string().optional().nullable(),
  condition: z.string().optional().nullable(),
  medicalHistory: z.string().optional().nullable(),
  
  // Insurance Information
  useDirectBilling: z.boolean().optional(),
  insuranceProvider: z.string().optional().nullable(),
  policyNumber: z.string().optional().nullable(),
  groupNumber: z.string().optional().nullable(),
  
  // Additional Information
  emergencyContact: z.string().optional().nullable(),
  specialInstructions: z.string().optional().nullable(),
  
  // Status
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const validatedData = updateBookingSchema.parse(body)

    // Check authentication
    const adminSession = await getSession()
    const userSession = await getUserSession()
    
    if (!adminSession && !userSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if booking exists and verify ownership (unless admin)
    const booking = await prisma.therapyBooking.findUnique({
      where: { id },
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // If user (not admin), verify booking belongs to them
    if (!adminSession && userSession) {
      if ((booking as any).userId !== userSession.id) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized - This booking does not belong to you' },
          { status: 403 }
        )
      }
    }

    // Build update data object
    const updateData: any = {}
    
    if (validatedData.serviceType) updateData.serviceType = validatedData.serviceType
    if (validatedData.appointmentType) updateData.appointmentType = validatedData.appointmentType
    if (validatedData.startDate) {
      updateData.preferredDate = new Date(validatedData.startDate)
    } else if (validatedData.preferredDate) {
      updateData.preferredDate = new Date(validatedData.preferredDate)
    }
    if (validatedData.endDate) {
      updateData.endDate = new Date(validatedData.endDate)
    }
    if (validatedData.preferredTime) updateData.preferredTime = validatedData.preferredTime
    if (validatedData.serviceLocation) updateData.serviceLocation = validatedData.serviceLocation
    if (validatedData.fullAddress) updateData.fullAddress = validatedData.fullAddress
    if (validatedData.firstName) updateData.firstName = validatedData.firstName
    if (validatedData.lastName) updateData.lastName = validatedData.lastName
    if (validatedData.email) updateData.email = validatedData.email
    if (validatedData.phoneNumber) updateData.phoneNumber = validatedData.phoneNumber
    if (validatedData.dateOfBirth !== undefined) {
      updateData.dateOfBirth = validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null
    }
    if (validatedData.condition !== undefined) updateData.condition = validatedData.condition
    if (validatedData.medicalHistory !== undefined) updateData.medicalHistory = validatedData.medicalHistory
    if (validatedData.useDirectBilling !== undefined) updateData.useDirectBilling = validatedData.useDirectBilling
    if (validatedData.insuranceProvider !== undefined) updateData.insuranceProvider = validatedData.insuranceProvider
    if (validatedData.policyNumber !== undefined) updateData.policyNumber = validatedData.policyNumber
    if (validatedData.groupNumber !== undefined) updateData.groupNumber = validatedData.groupNumber
    if (validatedData.emergencyContact !== undefined) updateData.emergencyContact = validatedData.emergencyContact
    if (validatedData.specialInstructions !== undefined) updateData.specialInstructions = validatedData.specialInstructions
    // Only admins can change status directly, users can only cancel
    if (validatedData.status) {
      if (adminSession || validatedData.status === 'cancelled') {
        updateData.status = validatedData.status
      }
    }

    const updatedBooking = await prisma.therapyBooking.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully',
      data: updatedBooking,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes('Record to update does not exist')) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    console.error('Error updating booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check authentication
    const adminSession = await getSession()
    const userSession = await getUserSession()
    
    if (!adminSession && !userSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if booking exists and verify ownership (unless admin)
    const booking = await prisma.therapyBooking.findUnique({
      where: { id },
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // If user (not admin), verify booking belongs to them
    if (!adminSession && userSession) {
      if ((booking as any).userId !== userSession.id) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized - This booking does not belong to you' },
          { status: 403 }
        )
      }
    }

    await prisma.therapyBooking.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully',
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
}

