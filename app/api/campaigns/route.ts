import { NextRequest, NextResponse } from 'next/server'
import { createCampaign, getCampaigns } from '@/lib/cosmic'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log('Campaign creation request data:', JSON.stringify(data, null, 2))
    
    // Validate required fields
    if (!data.campaign_name) {
      console.error('Validation error: Campaign name is required')
      return NextResponse.json(
        { success: false, error: 'Campaign name is required' },
        { status: 400 }
      )
    }
    
    if (!data.email_template) {
      console.error('Validation error: Email template is required')
      return NextResponse.json(
        { success: false, error: 'Email template is required' },
        { status: 400 }
      )
    }
    
    // Create campaign using server-side Cosmic SDK
    const campaign = await createCampaign(data)
    console.log('Campaign created successfully:', campaign.id)
    
    return NextResponse.json({
      success: true,
      campaign
    })
    
  } catch (error) {
    console.error('Error creating campaign:', error)
    
    // Send detailed error information to frontend
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const campaigns = await getCampaigns()
    
    return NextResponse.json({
      success: true,
      campaigns
    })
    
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage
      },
      { status: 500 }
    )
  }
}