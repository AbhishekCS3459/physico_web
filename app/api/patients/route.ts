import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const createPatientSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
})

export async function GET() {
  try {
    await requireAuth()

    const patients = await prisma.patient.findMany({
      where: { chart: null },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const data = patients.map((p) => ({
      id: p.id,
      email: p.email,
      firstName: p.firstName,
      lastName: p.lastName ?? null,
      phoneNumber: p.phoneNumber ?? null,
      createdAt: p.createdAt.toISOString(),
    }))

    return NextResponse.json({ success: true, data })
  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    console.error('GET /api/patients', e)
    return NextResponse.json({ success: false, error: 'Failed to fetch patients' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    if (typeof prisma.patient?.findFirst !== 'function') {
      console.error('POST /api/patients: Prisma client missing patient model. Run: pnpm db:generate')
      return NextResponse.json(
        { success: false, error: 'Service misconfigured. Please try again later.' },
        { status: 503 }
      )
    }
    const body = await request.json()
    const { email, firstName, lastName, phoneNumber } = createPatientSchema.parse(body)

    const existing = await prisma.patient.findFirst({
      where: { email: email.trim().toLowerCase() },
      include: { chart: true },
    })
    if (existing?.chart) {
      return NextResponse.json(
        { success: false, error: 'A chart already exists for this patient email' },
        { status: 400 }
      )
    }
    // Patient exists but has no chart — return them so the client can create a chart
    if (existing) {
      const data = {
        id: existing.id,
        email: existing.email,
        firstName: existing.firstName,
        lastName: existing.lastName ?? null,
        phoneNumber: existing.phoneNumber ?? null,
        createdAt: existing.createdAt.toISOString(),
      }
      return NextResponse.json({ success: true, data }, { status: 200 })
    }

    const patient = await prisma.patient.create({
      data: {
        email: email.trim().toLowerCase(),
        firstName: firstName.trim(),
        lastName: lastName?.trim() ?? null,
        phoneNumber: phoneNumber?.trim() || null,
        createdById: session.id,
      },
    })

    const data = {
      id: patient.id,
      email: patient.email,
      firstName: patient.firstName,
      lastName: patient.lastName ?? null,
      phoneNumber: patient.phoneNumber ?? null,
      createdAt: patient.createdAt.toISOString(),
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (e instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Invalid input', details: e.errors }, { status: 400 })
    }
    console.error('POST /api/patients', e)
    return NextResponse.json({ success: false, error: 'Failed to create patient' }, { status: 500 })
  }
}
