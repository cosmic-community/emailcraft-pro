import { Contact, Campaign, EmailTemplate } from '@/types'
import { sendBulkEmails, SendEmailOptions } from './resend'
import { cosmic } from './cosmic'

export interface CampaignSendResult {
  success: boolean
  totalRecipients: number
  successfulSends: number
  failedSends: number
  errors: string[]
}

export async function sendCampaign(campaignId: string): Promise<CampaignSendResult> {
  try {
    // Get campaign details
    const campaignResponse = await cosmic.objects.findOne({
      id: campaignId
    }).depth(1)
    
    if (!campaignResponse.object) {
      throw new Error('Campaign not found')
    }

    const campaign = campaignResponse.object as Campaign

    // Check if campaign has required data
    if (!campaign.metadata.email_template) {
      throw new Error('Campaign has no email template assigned')
    }

    const template = campaign.metadata.email_template
    const targetTags = campaign.metadata.target_tags || []

    // Get contacts based on target tags
    const contacts = await getTargetedContacts(targetTags)

    if (contacts.length === 0) {
      throw new Error('No contacts found matching the target tags')
    }

    // Prepare emails for sending
    const emails: SendEmailOptions[] = contacts.map(contact => ({
      to: [contact.metadata.email],
      subject: template.metadata.subject_line,
      html: personalizeEmailContent(template.metadata.html_content, contact)
    }))

    // Send bulk emails
    const bulkResult = await sendBulkEmails(emails)

    // Update campaign status and stats
    await updateCampaignStats(campaignId, {
      recipients: contacts.length,
      delivered: bulkResult.successful,
      campaign_status: 'sent'
    })

    return {
      success: true,
      totalRecipients: contacts.length,
      successfulSends: bulkResult.successful,
      failedSends: bulkResult.failed,
      errors: bulkResult.results
        .filter(result => !result.success)
        .map(result => result.error || 'Unknown error')
    }

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

async function getTargetedContacts(targetTags: string[]): Promise<Contact[]> {
  try {
    // Get all subscribed contacts
    const response = await cosmic.objects.find({
      type: 'contacts',
      'metadata.subscription_status': 'subscribed'
    }).props(['id', 'title', 'slug', 'metadata']).depth(1)

    const allContacts = response.objects as Contact[]

    // If no target tags specified, send to all subscribed contacts
    if (targetTags.length === 0) {
      return allContacts
    }

    // Filter contacts by tags
    return allContacts.filter(contact => {
      const contactTags = contact.metadata.tags || []
      return targetTags.some(tag => contactTags.includes(tag))
    })

  } catch (error) {
    console.error('Error getting targeted contacts:', error)
    return []
  }
}

function personalizeEmailContent(htmlContent: string, contact: Contact): string {
  let personalizedContent = htmlContent

  // Replace common personalization tokens
  const firstName = contact.metadata.first_name || ''
  const lastName = contact.metadata.last_name || ''
  const fullName = `${firstName} ${lastName}`.trim() || 'Valued Subscriber'

  personalizedContent = personalizedContent.replace(/\{\{first_name\}\}/g, firstName)
  personalizedContent = personalizedContent.replace(/\{\{last_name\}\}/g, lastName)
  personalizedContent = personalizedContent.replace(/\{\{full_name\}\}/g, fullName)
  personalizedContent = personalizedContent.replace(/\{\{email\}\}/g, contact.metadata.email)

  return personalizedContent
}

async function updateCampaignStats(campaignId: string, stats: {
  recipients: number
  delivered: number
  campaign_status: string
}) {
  try {
    await cosmic.objects.updateOne(campaignId, {
      metadata: {
        campaign_status: stats.campaign_status,
        campaign_stats: {
          recipients: stats.recipients,
          delivered: stats.delivered,
          opened: 0,
          clicked: 0,
          open_rate: 0,
          click_rate: 0
        }
      }
    })
  } catch (error) {
    console.error('Error updating campaign stats:', error)
  }
}

// This function can be used on both client and server side for validation
export function validateCampaignForSending(campaign: Campaign): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!campaign.metadata.campaign_name) {
    errors.push('Campaign name is required')
  }

  if (!campaign.metadata.email_template) {
    errors.push('Email template is required')
  }

  if (campaign.metadata.campaign_status.key === 'sent') {
    errors.push('Campaign has already been sent')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}