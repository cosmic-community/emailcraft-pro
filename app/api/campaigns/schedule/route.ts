import { NextRequest, NextResponse } from 'next/server'
import { scheduleCampaign } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaignId, sendDate, selectedContacts } = body

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    if (!sendDate) {
      return NextResponse.json(
        { error: 'Send date is required' },
        { status: 400 }
      )
    }

    // Validate that send date is in the future
    const sendDateTime = new Date(sendDate)
    if (sendDateTime <= new Date()) {
      return NextResponse.json(
        { error: 'Send date must be in the future' },
        { status: 400 }
      )
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { 
          error: 'Email service not configured. Please add RESEND_API_KEY to environment variables.' 
        },
        { status: 500 }
      )
    }

    const result = await scheduleCampaign(campaignId, sendDateTime, selectedContacts)

    if (!result.success) {
      return NextResponse.json(
        { error: result.errors.join(', ') },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Campaign scheduled successfully for ${sendDateTime.toLocaleString()}. ${result.totalRecipients} recipients will be contacted.`,
      stats: {
        totalRecipients: result.totalRecipients,
        successfulSends: 0,
        failedSends: 0
      }
    })

  } catch (error) {
    console.error('Error in schedule campaign API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}