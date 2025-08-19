import { NextRequest, NextResponse } from 'next/server'
import { getTemplates, createTemplate } from '@/lib/cosmic'

export async function GET(request: NextRequest) {
  try {
    const templates = await getTemplates()
    
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { template_name, subject_line, html_content, template_category, template_description } = body

    // Validate required fields
    if (!template_name || !subject_line || !html_content) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: template_name, subject_line, and html_content are required' 
        },
        { status: 400 }
      )
    }

    const template = await createTemplate({
      template_name,
      subject_line,
      html_content,
      template_category: template_category || 'newsletter',
      template_description: template_description || ''
    })

    return NextResponse.json({
      success: true,
      template
    })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create email template' 
      },
      { status: 500 }
    )
  }
}