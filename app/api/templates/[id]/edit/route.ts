// app/api/templates/[id]/edit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createBucketClient } from '@cosmicjs/sdk'

const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
  apiEnvironment: 'staging'
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { prompt, currentHtml, images = [] } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Edit prompt is required and must be a string' },
        { status: 400 }
      )
    }

    if (!currentHtml || typeof currentHtml !== 'string') {
      return NextResponse.json(
        { error: 'Current HTML content is required' },
        { status: 400 }
      )
    }

    // Build AI prompt for editing existing template
    let aiPrompt = `You are editing an existing HTML email template. Here is the current HTML:

${currentHtml}

Please make the following changes: ${prompt}

Keep the existing structure and styling where possible, only making the requested modifications.
Ensure the template remains email-client compatible with inline CSS styles.
Make it responsive and maintain professional email design standards.`

    if (images.length > 0) {
      aiPrompt += `\n\nInclude these uploaded images in the modifications:\n${images.map((url: string, index: number) => `${index + 1}. ${url}`).join('\n')}
      Use appropriate HTML img tags with these URLs and ensure they are optimized for email clients with proper max-width and responsive styling.`
    }

    aiPrompt += '\n\nReturn only the complete updated HTML code without any explanatory text. No backticks or code block formatting.'

    const response = await cosmic.ai.generateText({
      prompt: aiPrompt,
      max_tokens: 12000
    })

    return NextResponse.json({ html: response.text })
  } catch (error) {
    console.error('Error editing template with AI:', error)
    return NextResponse.json(
      { error: 'Failed to edit template with AI' },
      { status: 500 }
    )
  }
}