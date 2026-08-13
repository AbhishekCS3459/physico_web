import { prisma } from '@/lib/prisma'
import { findBestCoverageMatch, formatPostalCode, formatTravelFee } from '@/utils/postal-code'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code')?.trim() ?? ''
    const matchInput = formatPostalCode(code)

    if (code.replace(/[^A-Za-z0-9]/g, '').length < 3) {
      return NextResponse.json(
        { success: false, error: 'Enter at least the first 3 characters of your postal code (e.g. T2P).' },
        { status: 400 }
      )
    }

    const pincodes = await prisma.coveragePincode.findMany({
      select: { code: true, label: true, travelFee: true },
    })

    if (pincodes.length === 0) {
      return NextResponse.json({
        success: true,
        covered: false,
        code: matchInput,
        area: null,
        travelFee: null,
        message: 'Call us at (587) 586-5566 to confirm coverage in your area.',
      })
    }

    const match = findBestCoverageMatch(code, pincodes)

    if (!match) {
      return NextResponse.json({
        success: true,
        covered: false,
        code: matchInput,
        area: null,
        travelFee: null,
        message: `${matchInput} is outside our listed coverage. Call (587) 586-5566 — a travel fee may apply.`,
      })
    }

    const area =
      match.label && match.label !== formatPostalCode(match.code) ? match.label : null
    const fee = match.travelFee != null && match.travelFee > 0 ? match.travelFee : null

    return NextResponse.json({
      success: true,
      covered: true,
      code: matchInput,
      area,
      travelFee: fee,
      message: fee
        ? `We serve ${matchInput}${area ? ` (${area})` : ''}. Travel charge: ${formatTravelFee(fee)}.`
        : `We serve ${matchInput}${area ? ` (${area})` : ''}. No travel charge.`,
    })
  } catch (error) {
    console.error('GET /api/coverage', error)
    return NextResponse.json(
      { success: false, error: 'Unable to check coverage right now. Please try again.' },
      { status: 500 }
    )
  }
}
