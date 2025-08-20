import { NextRequest, NextResponse } from 'next/server'
import { createBucketClient } from '@cosmicjs/sdk'
import { sendTestEmail } from '@/lib/email'

const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
  apiEnvironment: "staging"
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaignId, testEmail } = body

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    if (!testEmail) {
      return NextResponse.json(
        { error: 'Test email address is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
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

    // Get campaign details
    const { object: campaign } = await cosmic.objects.findOne({
      type: 'campaigns',
      id: campaignId
    }).depth(1)
    
    if (!campaign) {
      return NextResponse.json(
        { 
          error: 'Campaign not found',
          logs: [`Campaign with ID ${campaignId} not found in Cosmic CMS`]
        },
        { status: 404 }
      )
    }

    // Send test email using the campaign object directly
    const result = await sendTestEmail(campaign, testEmail)

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error,
          logs: result.logs
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${testEmail}`,
      logs: result.logs
    })

  } catch (error) {
    console.error('Error in test email API:', error)
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