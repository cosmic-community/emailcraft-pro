import { NextRequest, NextResponse } from 'next/server'
import { sendCampaign } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaignId, selectedContactIds } = body

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { 
          error: 'Email service not configured. Please add RESEND_API_KEY to environment variables.',
          logs: ['RESEND_API_KEY environment variable is missing']
        },
        { status: 500 }
      )
    }

    const result = await sendCampaign(campaignId, selectedContactIds)

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.errors.join(', '),
          logs: result.logs,
          stats: {
            totalRecipients: result.totalRecipients,
            successfulSends: result.successfulSends,
            failedSends: result.failedSends
          }
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Campaign sent successfully to ${result.totalRecipients} recipients`,
      logs: result.logs,
      stats: {
        totalRecipients: result.totalRecipients,
        successfulSends: result.successfulSends,
        failedSends: result.failedSends
      }
    })

  } catch (error) {
    console.error('Error in send campaign API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        error: 'Internal server error',
        logs: [`API Error: ${errorMessage}`],
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}