import { NextRequest, NextResponse } from 'next/server'
import { getEmailTemplates } from '@/lib/cosmic'

export async function GET(request: NextRequest) {
  try {
    const templates = await getEmailTemplates()
    
    return NextResponse.json({
      success: true,
      templates
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch email templates' 
      },
      { status: 500 }
    )
  }
}