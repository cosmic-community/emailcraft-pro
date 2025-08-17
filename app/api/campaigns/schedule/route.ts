import { NextRequest, NextResponse } from 'next/server'
import { scheduleCampaign } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaignId, scheduledDate, selectedContacts } = body

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    if (!scheduledDate) {
      return NextResponse.json(
        { error: 'Scheduled date is required' },
        { status: 400 }
      )
    }

    // Validate that scheduled date is in the future
    const scheduledDateTime = new Date(scheduledDate)
    if (scheduledDateTime <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled date must be in the future' },
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

    const result = await scheduleCampaign(campaignId, scheduledDateTime, selectedContacts)

    if (!result.success) {
      return NextResponse.json(
        { error: result.errors.join(', ') },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Campaign scheduled successfully for ${scheduledDateTime.toLocaleString()}. ${result.totalRecipients} recipients will be contacted.`,
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