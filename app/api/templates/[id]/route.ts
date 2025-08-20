// app/api/templates/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getEmailTemplateById } from '@/lib/cosmic'
import { createBucketClient } from '@cosmicjs/sdk'

const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
  apiEnvironment: 'staging'
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const template = await getEmailTemplateById(id)
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      template
    })
  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { template_name, subject_line, html_content, template_category, template_description } = body

    // Validate required fields
    if (!template_name || !subject_line || !html_content) {
      return NextResponse.json(
        { error: 'Missing required fields: template_name, subject_line, and html_content are required' },
        { status: 400 }
      )
    }

    // Update the template
    const response = await cosmic.objects.updateOne(id, {
      title: template_name,
      metadata: {
        template_name,
        subject_line,
        html_content,
        template_category: template_category ? {
          key: template_category,
          value: getTemplateCategoryValue(template_category)
        } : undefined,
        template_description: template_description || ''
      }
    })

    return NextResponse.json({
      success: true,
      template: response.object
    })
  } catch (error) {
    console.error('Error updating template:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await cosmic.objects.deleteOne(id)

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    )
  }
}

function getTemplateCategoryValue(key: string): string {
  const categoryMap: Record<string, string> = {
    'newsletter': 'Newsletter',
    'promotion': 'Promotional',
    'welcome': 'Welcome Series',
    'transactional': 'Transactional',
    'announcement': 'Announcement'
  }
  return categoryMap[key] || 'Newsletter'
}