import { getSession, getUserSession, requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const assessmentSchema = z.object({
  bookingId: z.string().min(1),
  assessmentType: z.enum(['initial', 'followup']),
  
  // Initial Assessment Fields
  reasonForReferral: z.string().optional(),
  hpi: z.string().optional(),
  painDescription: z.string().optional(),
  painLevel: z.string().optional(),
  painType: z.string().optional(),
  whatMakesWorse: z.string().optional(),
  whatHelps: z.string().optional(),
  pmhx: z.string().optional(),
  associatedImaging: z.string().optional(),
  baselineActivity: z.string().optional(),
  observation: z.string().optional(),
  swellingCirculation: z.string().optional(),
  romInitial: z.string().optional(),
  strengthInitial: z.string().optional(),
  palpation: z.string().optional(),
  neuro: z.string().optional(),
  specialTests: z.string().optional(),
  clinicalImpression: z.string().optional(),
  goals: z.string().optional(),
  treatment: z.string().optional(),
  plan: z.string().optional(),
  
  // Follow-up Assessment Fields
  subjectivePain: z.string().optional(),
  subjectiveActivity: z.string().optional(),
  subjectiveExercises: z.string().optional(),
  subjectiveModalities: z.string().optional(),
  subjectiveMedications: z.string().optional(),
  objectiveFindings: z.string().optional(),
  romFollowupFlexion: z.string().optional(),
  romFollowupAbduction: z.string().optional(),
  strengthFollowupFlexion: z.string().optional(),
  strengthFollowupAbduction: z.string().optional(),
  assessmentModalities: z.string().optional(),
  assessmentROM: z.string().optional(),
  assessmentStrengthening: z.string().optional(),
  assessmentHEP: z.string().optional(),
  assessmentEducation: z.string().optional(),
  assessmentRestrictions: z.string().optional(),
  assessmentHandouts: z.string().optional(),
  treatmentModality: z.string().optional(),
  treatmentROM: z.string().optional(),
  treatmentStrengthening: z.string().optional(),
  treatmentStretching: z.string().optional(),
  treatmentHEP: z.string().optional(),
  treatmentEducation: z.string().optional(),
  treatmentRestrictions: z.string().optional(),
  treatmentHandouts: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    let adminSession
    try {
      adminSession = await requireAuth()
    } catch (error: any) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }
      throw error
    }

    const body = await request.json()
    const validatedData = assessmentSchema.parse(body)

    // Verify booking exists
    const booking = await prisma.therapyBooking.findUnique({
      where: { id: validatedData.bookingId },
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Create assessment
    const assessment = await prisma.assessment.create({
      data: {
        bookingId: validatedData.bookingId,
        assessmentType: validatedData.assessmentType,
        reasonForReferral: validatedData.reasonForReferral,
        hpi: validatedData.hpi,
        painDescription: validatedData.painDescription,
        painLevel: validatedData.painLevel,
        painType: validatedData.painType,
        whatMakesWorse: validatedData.whatMakesWorse,
        whatHelps: validatedData.whatHelps,
        pmhx: validatedData.pmhx,
        associatedImaging: validatedData.associatedImaging,
        baselineActivity: validatedData.baselineActivity,
        observation: validatedData.observation,
        swellingCirculation: validatedData.swellingCirculation,
        romInitial: validatedData.romInitial,
        strengthInitial: validatedData.strengthInitial,
        palpation: validatedData.palpation,
        neuro: validatedData.neuro,
        specialTests: validatedData.specialTests,
        clinicalImpression: validatedData.clinicalImpression,
        goals: validatedData.goals,
        treatment: validatedData.treatment,
        plan: validatedData.plan,
        subjectivePain: validatedData.subjectivePain,
        subjectiveActivity: validatedData.subjectiveActivity,
        subjectiveExercises: validatedData.subjectiveExercises,
        subjectiveModalities: validatedData.subjectiveModalities,
        subjectiveMedications: validatedData.subjectiveMedications,
        objectiveFindings: validatedData.objectiveFindings,
        romFollowupFlexion: validatedData.romFollowupFlexion,
        romFollowupAbduction: validatedData.romFollowupAbduction,
        strengthFollowupFlexion: validatedData.strengthFollowupFlexion,
        strengthFollowupAbduction: validatedData.strengthFollowupAbduction,
        assessmentModalities: validatedData.assessmentModalities,
        assessmentROM: validatedData.assessmentROM,
        assessmentStrengthening: validatedData.assessmentStrengthening,
        assessmentHEP: validatedData.assessmentHEP,
        assessmentEducation: validatedData.assessmentEducation,
        assessmentRestrictions: validatedData.assessmentRestrictions,
        assessmentHandouts: validatedData.assessmentHandouts,
        treatmentModality: validatedData.treatmentModality,
        treatmentROM: validatedData.treatmentROM,
        treatmentStrengthening: validatedData.treatmentStrengthening,
        treatmentStretching: validatedData.treatmentStretching,
        treatmentHEP: validatedData.treatmentHEP,
        treatmentEducation: validatedData.treatmentEducation,
        treatmentRestrictions: validatedData.treatmentRestrictions,
        treatmentHandouts: validatedData.treatmentHandouts,
        createdBy: adminSession.id,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Assessment created successfully',
        assessment,
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

    console.error('Error creating assessment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create assessment' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check for admin or user session
    const adminSession = await getSession()
    const userSession = await getUserSession()

    if (!adminSession && !userSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')
    const assessmentType = searchParams.get('assessmentType')

    const where: any = {}

    if (bookingId) {
      // If fetching by booking, verify user has access
      const booking = await prisma.therapyBooking.findUnique({
        where: { id: bookingId },
      })

      if (!booking) {
        return NextResponse.json(
          { success: false, error: 'Booking not found' },
          { status: 404 }
        )
      }

      // Users can only see their own bookings
      if (userSession && booking.userId !== userSession.id) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 403 }
        )
      }

      where.bookingId = bookingId
    } else if (userSession) {
      // If user session, only show assessments for their bookings
      const userBookings = await prisma.therapyBooking.findMany({
        where: { userId: userSession.id },
        select: { id: true },
      })
      
      where.bookingId = {
        in: userBookings.map(b => b.id),
      }
    }

    if (assessmentType) {
      where.assessmentType = assessmentType
    }

    const assessments = await prisma.assessment.findMany({
      where,
      include: {
        booking: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            serviceType: true,
            appointmentType: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: assessments,
    })
  } catch (error) {
    console.error('Error fetching assessments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assessments' },
      { status: 500 }
    )
  }
}

