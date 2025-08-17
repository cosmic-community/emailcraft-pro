import { NextRequest, NextResponse } from 'next/server'
import { createCampaign, getCampaigns } from '@/lib/cosmic'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.campaign_name) {
      return NextResponse.json(
        { success: false, error: 'Campaign name is required' },
        { status: 400 }
      )
    }
    
    if (!data.email_template) {
      return NextResponse.json(
        { success: false, error: 'Email template is required' },
        { status: 400 }
      )
    }
    
    // Create campaign using server-side Cosmic SDK
    const campaign = await createCampaign(data)
    
    return NextResponse.json({
      success: true,
      campaign
    })
    
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create campaign' },
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
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}