import { NextRequest, NextResponse } from 'next/server'
import { createBucketClient } from '@cosmicjs/sdk'

const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
  apiEnvironment: 'staging'
})

export async function POST(request: NextRequest) {
  try {
    const { 
      template_name, 
      subject_line, 
      html_content, 
      template_category, 
      template_description 
    } = await request.json()

    // Validate required fields
    if (!template_name || !subject_line || !html_content) {
      return NextResponse.json(
        { error: 'Template name, subject line, and HTML content are required' },
        { status: 400 }
      )
    }

    // Create the template object in Cosmic
    const { object } = await cosmic.objects.insertOne({
      title: template_name,
      type: 'email-templates',
      status: 'published',
      metafields: [
        {
          key: 'template_name',
          type: 'text',
          value: template_name
        },
        {
          key: 'subject_line',
          type: 'text',
          value: subject_line
        },
        {
          key: 'html_content',
          type: 'html-textarea',
          value: html_content
        },
        {
          key: 'template_category',
          type: 'select-dropdown',
          value: template_category || 'newsletter'
        },
        {
          key: 'template_description',
          type: 'textarea',
          value: template_description || ''
        }
      ]
    })

    return NextResponse.json({ 
      success: true, 
      template: object,
      message: 'Template created successfully' 
    })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { objects } = await cosmic.objects
      .find({ type: 'email-templates' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)

    return NextResponse.json({ templates: objects })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}