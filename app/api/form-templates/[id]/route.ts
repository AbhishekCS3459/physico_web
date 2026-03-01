import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  schema: z.string().min(1).optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
    const { id } = await params

    const template = await prisma.formTemplate.findUnique({
      where: { id },
      include: { createdBy: { select: { id: true, email: true, name: true } } },
    })

    if (!template) {
      return NextResponse.json({ success: false, error: 'Form template not found' }, { status: 404 })
    }

    const data = {
      id: template.id,
      name: template.name,
      description: template.description,
      schema: template.schema,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
      createdBy: template.createdBy
        ? { id: template.createdBy.id, email: template.createdBy.email, name: template.createdBy.name }
        : null,
    }

    return NextResponse.json({ success: true, data })
  } catch (e: unknown) {
    const err = e as { message?: string }
    if (err.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Please sign in.', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    console.error('GET /api/form-templates/[id]', e)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch form template.' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
    const { id } = await params
    const body = await request.json()
    const parsed = updateSchema.parse(body)

    const template = await prisma.formTemplate.findUnique({ where: { id } })
    if (!template) {
      return NextResponse.json({ success: false, error: 'Form template not found' }, { status: 404 })
    }

    const updated = await prisma.formTemplate.update({
      where: { id },
      data: {
        ...(parsed.name !== undefined && { name: parsed.name }),
        ...(parsed.description !== undefined && { description: parsed.description }),
        ...(parsed.schema !== undefined && { schema: parsed.schema }),
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        schema: updated.schema,
        updatedAt: updated.updatedAt.toISOString(),
      },
    })
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
    console.error('PATCH /api/form-templates/[id]', e)
    return NextResponse.json(
      { success: false, error: 'Failed to update form template.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
    const { id } = await params

    const template = await prisma.formTemplate.findUnique({
      where: { id },
      include: { _count: { select: { patientCharts: true } } },
    })

    if (!template) {
      return NextResponse.json({ success: false, error: 'Form template not found' }, { status: 404 })
    }

    if (template._count.patientCharts > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `This template is used by ${template._count.patientCharts} chart(s). Remove it from those charts first or switch them to another template.`,
        },
        { status: 400 }
      )
    }

    await prisma.formTemplate.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const err = e as { message?: string }
    if (err.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Please sign in.', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    console.error('DELETE /api/form-templates/[id]', e)
    return NextResponse.json(
      { success: false, error: 'Failed to delete form template.' },
      { status: 500 }
    )
  }
}
