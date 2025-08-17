import { Resend } from 'resend'
import { getCampaignById, getContacts, updateCampaign } from './cosmic'
import { Campaign, Contact } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendResult {
  success: boolean
  totalRecipients: number
  successfulSends: number
  failedSends: number
  errors: string[]
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function validateCampaignForSending(campaign: Campaign): ValidationResult {
  const errors: string[] = []

  if (!campaign.metadata.email_template) {
    errors.push('No email template selected')
  }

  if (!campaign.metadata.email_template?.metadata?.html_content) {
    errors.push('Email template has no content')
  }

  if (!campaign.metadata.email_template?.metadata?.subject_line) {
    errors.push('Email template has no subject line')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export async function sendCampaign(
  campaignId: string, 
  selectedContactIds?: string[]
): Promise<SendResult> {
  try {
    // Get campaign details
    const campaign = await getCampaignById(campaignId)
    if (!campaign) {
      return {
        success: false,
        totalRecipients: 0,
        successfulSends: 0,
        failedSends: 0,
        errors: ['Campaign not found']
      }
    }

    // Validate campaign
    const validation = validateCampaignForSending(campaign)
    if (!validation.isValid) {
      return {
        success: false,
        totalRecipients: 0,
        successfulSends: 0,
        failedSends: 0,
        errors: validation.errors
      }
    }

    // Get recipients
    const recipients = await getRecipients(campaign, selectedContactIds)
    
    if (recipients.length === 0) {
      return {
        success: false,
        totalRecipients: 0,
        successfulSends: 0,
        failedSends: 0,
        errors: ['No recipients found']
      }
    }

    // Send emails
    const sendResults = await sendEmailsToRecipients(campaign, recipients)

    // Update campaign status and stats
    await updateCampaignAfterSending(campaign, sendResults, recipients.length)

    return sendResults

  } catch (error) {
    console.error('Error sending campaign:', error)
    return {
      success: false,
      totalRecipients: 0,
      successfulSends: 0,
      failedSends: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error occurred']
    }
  }
}

export async function scheduleCampaign(
  campaignId: string,
  scheduledDate: Date,
  selectedContactIds?: string[]
): Promise<SendResult> {
  try {
    // Get campaign details
    const campaign = await getCampaignById(campaignId)
    if (!campaign) {
      return {
        success: false,
        totalRecipients: 0,
        successfulSends: 0,
        failedSends: 0,
        errors: ['Campaign not found']
      }
    }

    // Validate campaign
    const validation = validateCampaignForSending(campaign)
    if (!validation.isValid) {
      return {
        success: false,
        totalRecipients: 0,
        successfulSends: 0,
        failedSends: 0,
        errors: validation.errors
      }
    }

    // Get recipients count for scheduling
    const recipients = await getRecipients(campaign, selectedContactIds)
    
    if (recipients.length === 0) {
      return {
        success: false,
        totalRecipients: 0,
        successfulSends: 0,
        failedSends: 0,
        errors: ['No recipients found']
      }
    }

    // Update campaign status to scheduled - construct proper update data
    const updateData = {
      campaign_status: 'scheduled' as const,
      send_date: scheduledDate.toISOString().split('T')[0],
      campaign_name: campaign.metadata.campaign_name,
      email_template: campaign.metadata.email_template.id,
      target_tags: selectedContactIds || campaign.metadata.target_tags || [],
      campaign_notes: campaign.metadata.campaign_notes || ''
    }

    await updateCampaign(campaignId, updateData)

    return {
      success: true,
      totalRecipients: recipients.length,
      successfulSends: 0,
      failedSends: 0,
      errors: []
    }

  } catch (error) {
    console.error('Error scheduling campaign:', error)
    return {
      success: false,
      totalRecipients: 0,
      successfulSends: 0,
      failedSends: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error occurred']
    }
  }
}

export async function sendTestEmail(
  campaign: Campaign,
  testEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const validation = validateCampaignForSending(campaign)
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      }
    }

    const template = campaign.metadata.email_template
    const subjectLine = `[TEST] ${template.metadata.subject_line}`

    const data = await resend.emails.send({
      from: 'EmailCraft Pro <noreply@resend.dev>',
      to: [testEmail],
      subject: subjectLine,
      html: template.metadata.html_content,
      headers: {
        'X-Entity-Ref-ID': `test-${campaign.id}-${Date.now()}`
      }
    })

    return { success: true }

  } catch (error) {
    console.error('Error sending test email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

async function getRecipients(
  campaign: Campaign, 
  selectedContactIds?: string[]
): Promise<Contact[]> {
  // If specific contacts are selected, use those
  if (selectedContactIds && selectedContactIds.length > 0) {
    const allContacts = await getContacts()
    return allContacts.filter((contact: Contact) => 
      selectedContactIds.includes(contact.id) &&
      contact.metadata.subscription_status.key === 'subscribed'
    )
  }

  // Otherwise, get contacts based on target tags or all subscribed
  const allContacts = await getContacts()
  let recipients = allContacts.filter((contact: Contact) => 
    contact.metadata.subscription_status.key === 'subscribed'
  )

  // Filter by target tags if specified
  if (campaign.metadata.target_tags && campaign.metadata.target_tags.length > 0) {
    recipients = recipients.filter((contact: Contact) =>
      contact.metadata.tags &&
      campaign.metadata.target_tags!.some((tag: string) =>
        contact.metadata.tags?.includes(tag)
      )
    )
  }

  return recipients
}

async function sendEmailsToRecipients(
  campaign: Campaign,
  recipients: Contact[]
): Promise<SendResult> {
  const template = campaign.metadata.email_template
  let successfulSends = 0
  let failedSends = 0
  const errors: string[] = []

  // Send emails in batches to avoid rate limits
  const batchSize = 100
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize)
    
    const emailPromises = batch.map(async (contact: Contact) => {
      try {
        // Personalize the content
        let personalizedContent = template.metadata.html_content
        let personalizedSubject = template.metadata.subject_line

        // Basic personalization
        if (contact.metadata.first_name) {
          personalizedContent = personalizedContent.replace(
            /{{first_name}}/g, 
            contact.metadata.first_name
          )
          personalizedSubject = personalizedSubject.replace(
            /{{first_name}}/g, 
            contact.metadata.first_name
          )
        }

        // Add unsubscribe link placeholder
        personalizedContent = personalizedContent.replace(
          /{{unsubscribe_url}}/g,
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/unsubscribe?contact=${contact.id}`
        )

        const data = await resend.emails.send({
          from: 'EmailCraft Pro <noreply@resend.dev>',
          to: [contact.metadata.email],
          subject: personalizedSubject,
          html: personalizedContent,
          headers: {
            'X-Entity-Ref-ID': `campaign-${campaign.id}-${contact.id}`
          }
        })

        return { success: true, contact }
      } catch (error) {
        console.error(`Failed to send email to ${contact.metadata.email}:`, error)
        return { 
          success: false, 
          contact, 
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    })

    const results = await Promise.all(emailPromises)
    
    interface EmailResult {
      success: boolean;
      contact: Contact;
      error?: string;
    }
    
    results.forEach((result: EmailResult) => {
      if (result.success) {
        successfulSends++
      } else {
        failedSends++
        errors.push(`Failed to send to ${result.contact.metadata.email}: ${result.error}`)
      }
    })

    // Small delay between batches
    if (i + batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return {
    success: successfulSends > 0,
    totalRecipients: recipients.length,
    successfulSends,
    failedSends,
    errors
  }
}

async function updateCampaignAfterSending(
  campaign: Campaign,
  sendResults: SendResult,
  totalRecipients: number
): Promise<void> {
  const stats = {
    recipients: totalRecipients,
    delivered: sendResults.successfulSends,
    opened: 0,
    clicked: 0,
    open_rate: 0,
    click_rate: 0
  }

  // Construct proper update data that matches CreateCampaignFormData structure
  const updateData = {
    campaign_status: 'sent' as const,
    campaign_name: campaign.metadata.campaign_name,
    email_template: campaign.metadata.email_template.id,
    target_tags: campaign.metadata.target_tags || [],
    send_date: campaign.metadata.send_date || '',
    campaign_notes: campaign.metadata.campaign_notes || ''
  }

  await updateCampaign(campaign.id, updateData)
}