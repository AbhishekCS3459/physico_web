import { getSession, getUserSession } from '@/lib/auth'
import { sendBookingConfirmationEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const bookingSchema = z.object({
  // Service Information
  serviceType: z.string().min(1),
  appointmentType: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  serviceLocation: z.string().min(1),
  fullAddress: z.string().min(1),
  
  // Personal Information
  firstName: z.string().min(1),
  lastName: z.string().optional().default(""),
  email: z.string().email(),
  phoneNumber: z.string().min(1),
  dateOfBirth: z.string().optional(),
  condition: z.string().min(1, "Condition / reason for treatment is required"),
  medicalHistory: z.string().optional(),
  
  // Insurance Information
  useDirectBilling: z.boolean().default(false),
  insuranceProvider: z.string().optional(),
  policyNumber: z.string().optional(),
  groupNumber: z.string().optional(),
  
  // Additional Information
  emergencyContact: z.string().optional(),
  specialInstructions: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Support both guest and registered user booking
    const userSession = await getUserSession()

    const body = await request.json()
    const validatedData = bookingSchema.parse(body)

    // Convert date strings to DateTime
    const preferredDate = new Date(validatedData.startDate)
    const endDate = new Date(validatedData.endDate)
    const dateOfBirth = validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null

    const booking = await prisma.therapyBooking.create({
      data: {
        serviceType: validatedData.serviceType,
        appointmentType: validatedData.appointmentType,
        preferredDate,
        endDate,
        preferredTime: null,
        serviceLocation: validatedData.serviceLocation,
        fullAddress: validatedData.fullAddress,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName?.trim() || "",
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber,
        dateOfBirth,
        condition: validatedData.condition,
        medicalHistory: validatedData.medicalHistory,
        useDirectBilling: validatedData.useDirectBilling,
        insuranceProvider: validatedData.insuranceProvider,
        policyNumber: validatedData.policyNumber,
        groupNumber: validatedData.groupNumber,
        emergencyContact: validatedData.emergencyContact,
        specialInstructions: validatedData.specialInstructions,
        userId: userSession?.id ?? null,
      } as any,
    })

    // Send confirmation emails (non-blocking)
    sendBookingConfirmationEmail({
      firstName: booking.firstName,
      lastName: booking.lastName,
      email: booking.email,
      phoneNumber: booking.phoneNumber,
      serviceType: booking.serviceType,
      appointmentType: booking.appointmentType,
      preferredDate: booking.preferredDate.toISOString(),
      preferredTime: booking.preferredTime || "",
      endDate: booking.endDate ? booking.endDate.toISOString() : null,
      serviceLocation: booking.serviceLocation,
      fullAddress: booking.fullAddress,
      condition: booking.condition,
      medicalHistory: booking.medicalHistory,
      useDirectBilling: booking.useDirectBilling,
      insuranceProvider: booking.insuranceProvider,
      policyNumber: booking.policyNumber,
      groupNumber: booking.groupNumber,
      emergencyContact: booking.emergencyContact,
      specialInstructions: booking.specialInstructions,
      dateOfBirth: booking.dateOfBirth ? booking.dateOfBirth.toISOString() : null,
    }).catch((error) => {
      console.error('Failed to send confirmation emails:', error)
      // Don't fail the request if email fails
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Booking request submitted successfully',
        bookingId: booking.id,
        data: {
          id: booking.id,
          serviceType: booking.serviceType,
          appointmentType: booking.appointmentType,
          preferredDate: booking.preferredDate.toISOString(),
          endDate: booking.endDate?.toISOString() ?? null,
          serviceLocation: booking.serviceLocation,
          fullAddress: booking.fullAddress,
          firstName: booking.firstName,
          lastName: booking.lastName,
          email: booking.email,
          phoneNumber: booking.phoneNumber,
          dateOfBirth: booking.dateOfBirth?.toISOString() ?? null,
          condition: booking.condition,
          useDirectBilling: booking.useDirectBilling,
          insuranceProvider: booking.insuranceProvider,
          status: booking.status,
          createdAt: booking.createdAt.toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Roles: 1) admin/super_admin – full admin privileges; 2) staff – can see all bookings; 3) patient – only their bookings.
    const adminSession = await getSession()   // staff or super_admin
    const userSession = await getUserSession() // patient (User)

    if (!userSession && !adminSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const where: any = status ? { status } : {}

    // Patient: only their bookings. Staff/super_admin: all bookings (no filter).
    if (userSession) {
      where.userId = userSession.id
    }

    const [bookings, total] = await Promise.all([
      prisma.therapyBooking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.therapyBooking.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
