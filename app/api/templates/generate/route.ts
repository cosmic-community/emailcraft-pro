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
    const { prompt, images = [] } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      )
    }

    // Build AI prompt with image context if images are provided
    let aiPrompt = `Create a professional HTML email template with the following requirements: ${prompt}. 
    Include inline CSS styles, proper email HTML structure, header, main content area, footer.
    Make it responsive and compatible with email clients. Use modern design principles.`

    if (images.length > 0) {
      aiPrompt += `\n\nInclude the following uploaded images in the template design:\n${images.map((url: string, index: number) => `${index + 1}. ${url}`).join('\n')}
      Use appropriate HTML img tags with these URLs and ensure they are optimized for email clients with proper max-width and responsive styling.`
    }

    aiPrompt += '\n\nReturn only the HTML code without any explanatory text. No backticks or code block formatting.'

    const response = await cosmic.ai.generateText({
      prompt: aiPrompt,
      max_tokens: 12000
    })

    return NextResponse.json({ html: response.text })
  } catch (error) {
    console.error('Error generating template:', error)
    return NextResponse.json(
      { error: 'Failed to generate email template' },
      { status: 500 }
    )
  }
}