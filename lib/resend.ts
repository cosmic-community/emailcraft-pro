import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is required')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendEmailOptions {
  to: string[]
  subject: string
  html: string
  from?: string
}

export async function sendEmail(options: SendEmailOptions) {
  const { to, subject, html, from = 'EmailCraft <noreply@yourdomain.com>' } = options

  try {
    const response = await resend.emails.send({
      from,
      to,
      subject,
      html
    })

    return {
      success: true,
      messageId: response.data?.id,
      error: null
    }
  } catch (error) {
    console.error('Failed to send email:', error)
    return {
      success: false,
      messageId: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function sendBulkEmails(emails: SendEmailOptions[]) {
  const results = await Promise.allSettled(
    emails.map(email => sendEmail(email))
  )

  const successful = results.filter(result => 
    result.status === 'fulfilled' && result.value.success
  ).length

  const failed = results.length - successful

  return {
    total: results.length,
    successful,
    failed,
    results: results.map(result => 
      result.status === 'fulfilled' ? result.value : { success: false, error: 'Promise rejected' }
    )
  }
}