import { requireAuth } from '@/lib/auth'
import {
  DEFAULT_INITIAL_ASSESSMENT_TEMPLATE_NAME,
  getDefaultInitialAssessmentFormSchema,
} from '@/lib/form-schema'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(2000).optional().nullable(),
  schema: z.string().min(1, 'Schema is required'),
})

export async function GET() {
  try {
    const session = await requireAuth()

    let templates = await prisma.formTemplate.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        schema: true,
        createdAt: true,
        updatedAt: true,
        createdBy: { select: { id: true, email: true, name: true } },
      },
    })

    const hasDefault = templates.some((t) => t.name === DEFAULT_INITIAL_ASSESSMENT_TEMPLATE_NAME)
    if (!hasDefault) {
      const defaultSchema = getDefaultInitialAssessmentFormSchema()
      await prisma.formTemplate.create({
        data: {
          name: DEFAULT_INITIAL_ASSESSMENT_TEMPLATE_NAME,
          description: 'Same structure as the default chart notes (Initial Assessment). Edit to customize sections and fields.',
          schema: JSON.stringify(defaultSchema),
          createdById: session.id,
        },
      })
      templates = await prisma.formTemplate.findMany({
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          schema: true,
          createdAt: true,
          updatedAt: true,
          createdBy: { select: { id: true, email: true, name: true } },
        },
      })
    }

    const data = templates.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      schema: t.schema,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      createdBy: t.createdBy
        ? { id: t.createdBy.id, email: t.createdBy.email, name: t.createdBy.name }
        : null,
    }))

    return NextResponse.json({ success: true, data })
  } catch (e: unknown) {
    const err = e as { message?: string }
    if (err.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Please sign in.', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    console.error('GET /api/form-templates', e)
    return NextResponse.json(
      { success: false, error: 'Failed to load form templates.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const { name, description, schema } = createSchema.parse(body)

    const template = await prisma.formTemplate.create({
      data: {
        name,
        description: description ?? null,
        schema,
        createdById: session.id,
      },
    })

    const data = {
      id: template.id,
      name: template.name,
      description: template.description,
      schema: template.schema,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (e: unknown) {
    const err = e as { message?: string }
    if (err.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Please sign in.', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: e.errors },
        { status: 400 }
      )
    }
    console.error('POST /api/form-templates', e)
    return NextResponse.json(
      { success: false, error: 'Failed to create form template.' },
      { status: 500 }
    )
  }
}
