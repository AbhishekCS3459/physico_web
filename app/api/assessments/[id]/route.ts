import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updateAssessmentSchema = z.object({
  assessmentType: z.enum(['initial', 'followup']).optional(),
  
  // Initial Assessment Fields
  reasonForReferral: z.string().optional().nullable(),
  hpi: z.string().optional().nullable(),
  painDescription: z.string().optional().nullable(),
  painLevel: z.string().optional().nullable(),
  painType: z.string().optional().nullable(),
  whatMakesWorse: z.string().optional().nullable(),
  whatHelps: z.string().optional().nullable(),
  pmhx: z.string().optional().nullable(),
  associatedImaging: z.string().optional().nullable(),
  baselineActivity: z.string().optional().nullable(),
  observation: z.string().optional().nullable(),
  swellingCirculation: z.string().optional().nullable(),
  romInitial: z.string().optional().nullable(),
  strengthInitial: z.string().optional().nullable(),
  palpation: z.string().optional().nullable(),
  neuro: z.string().optional().nullable(),
  specialTests: z.string().optional().nullable(),
  clinicalImpression: z.string().optional().nullable(),
  goals: z.string().optional().nullable(),
  treatment: z.string().optional().nullable(),
  plan: z.string().optional().nullable(),
  
  // Follow-up Assessment Fields
  subjectivePain: z.string().optional().nullable(),
  subjectiveActivity: z.string().optional().nullable(),
  subjectiveExercises: z.string().optional().nullable(),
  subjectiveModalities: z.string().optional().nullable(),
  subjectiveMedications: z.string().optional().nullable(),
  objectiveFindings: z.string().optional().nullable(),
  romFollowupFlexion: z.string().optional().nullable(),
  romFollowupAbduction: z.string().optional().nullable(),
  strengthFollowupFlexion: z.string().optional().nullable(),
  strengthFollowupAbduction: z.string().optional().nullable(),
  assessmentModalities: z.string().optional().nullable(),
  assessmentROM: z.string().optional().nullable(),
  assessmentStrengthening: z.string().optional().nullable(),
  assessmentHEP: z.string().optional().nullable(),
  assessmentEducation: z.string().optional().nullable(),
  assessmentRestrictions: z.string().optional().nullable(),
  assessmentHandouts: z.string().optional().nullable(),
  treatmentModality: z.string().optional().nullable(),
  treatmentROM: z.string().optional().nullable(),
  treatmentStrengthening: z.string().optional().nullable(),
  treatmentStretching: z.string().optional().nullable(),
  treatmentHEP: z.string().optional().nullable(),
  treatmentEducation: z.string().optional().nullable(),
  treatmentRestrictions: z.string().optional().nullable(),
  treatmentHandouts: z.string().optional().nullable(),
  planAxStrength: z.string().optional().nullable(),
  planAxROM: z.string().optional().nullable(),
  planExerciseProgression: z.string().optional().nullable(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSession = await requireAuth()
    
    const assessment = await prisma.assessment.findUnique({
      where: { id: params.id },
      include: {
        booking: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            serviceType: true,
            appointmentType: true,
            preferredDate: true,
            endDate: true,
          },
        },
      },
    })

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: assessment,
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.error('Error fetching assessment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assessment' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSession = await requireAuth()

    const body = await request.json()
    const validatedData = updateAssessmentSchema.parse(body)

    // Check if assessment exists
    const existingAssessment = await prisma.assessment.findUnique({
      where: { id: params.id },
    })

    if (!existingAssessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      )
    }

    // Update assessment
    const assessment = await prisma.assessment.update({
      where: { id: params.id },
      data: validatedData,
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
    })

    return NextResponse.json({
      success: true,
      message: 'Assessment updated successfully',
      data: assessment,
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating assessment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update assessment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSession = await requireAuth()

    // Check if assessment exists
    const existingAssessment = await prisma.assessment.findUnique({
      where: { id: params.id },
    })

    if (!existingAssessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      )
    }

    // Delete assessment
    await prisma.assessment.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Assessment deleted successfully',
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.error('Error deleting assessment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete assessment' },
      { status: 500 }
    )
  }
}

