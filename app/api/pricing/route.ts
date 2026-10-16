import { getPricing } from '@/lib/pricing'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const pricing = await getPricing()
  return NextResponse.json({ success: true, data: pricing })
}
