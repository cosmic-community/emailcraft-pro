import { NextRequest, NextResponse } from 'next/server'
import { sendCampaign } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaignId } = body

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    const result = await sendCampaign(campaignId)

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Failed to send campaign',
          details: result.errors
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Campaign sent successfully to ${result.successfulSends} of ${result.totalRecipients} recipients`,
      stats: {
        totalRecipients: result.totalRecipients,
        successfulSends: result.successfulSends,
        failedSends: result.failedSends
      }
    })

  } catch (error) {
    console.error('Campaign send API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}