import { createBucketClient } from '@cosmicjs/sdk'
import { Resend } from 'resend'
import { Campaign, Contact } from '@/types'

const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
  apiEnvironment: "staging"
})

// Initialize Resend
export const resend = new Resend(process.env.RESEND_API_KEY as string)

interface SendResult {
  success: boolean
  totalRecipients: number
  successfulSends: number
  failedSends: number
  errors: string[]
}

export async function sendCampaign(campaignId: string, selectedContactIds?: string[]): Promise<SendResult> {
  try {
    // 1. Get campaign with template data
    const { object: campaign } = await cosmic.objects.findOne({
      type: 'campaigns',
      id: campaignId
    }).depth(1)

    if (!campaign) {
      return {
        success: false,
        totalRecipients: 0,
        successfulSends: 0,
        failedSends: 0,
        errors: ['Campaign not found']
      }
    }

    // Validate campaign has template and content
    if (!campaign.metadata.email_template) {
      return {
        success: false,
        totalRecipients: 0,
        successfulSends: 0,
        failedSends: 0,
        errors: ['No email template selected for campaign']
      }
    }

    const template = campaign.metadata.email_template
    if (!template.metadata?.html_content || !template.metadata?.subject_line) {
      return {
        success: false,
        totalRecipients: 0,
        successfulSends: 0,
        failedSends: 0,
        errors: ['Email template is missing content or subject line']
      }
    }

    // 2. Get target contacts
    let targetContacts: Contact[] = []

    if (selectedContactIds && selectedContactIds.length > 0) {
      // Use specific selected contacts
      try {
        const { objects: contacts } = await cosmic.objects.find({
          type: 'contacts',
          'metadata.subscription_status': 'Subscribed' // Use the value, not the key
        })
        targetContacts = contacts.filter((contact: Contact) => selectedContactIds.includes(contact.id))
      } catch (error) {
        // Handle case where no contacts are found
        targetContacts = []
      }
    } else {
      // Use campaign target tags or all subscribed contacts
      const targetTags = campaign.metadata.target_tags

      try {
        if (targetTags && targetTags.length > 0) {
          // Get contacts that match target tags
          const { objects: contacts } = await cosmic.objects.find({
            type: 'contacts',
            'metadata.subscription_status': 'Subscribed'
          })
          
          // Filter contacts that have at least one matching tag
          targetContacts = contacts.filter((contact: Contact) => {
            const contactTags = contact.metadata.tags || []
            return targetTags.some((tag: string) => contactTags.includes(tag))
          })
        } else {
          // Get all subscribed contacts
          const { objects: contacts } = await cosmic.objects.find({
            type: 'contacts',
            'metadata.subscription_status': 'Subscribed'
          })
          targetContacts = contacts
        }
      } catch (error) {
        // Handle case where no contacts are found
        targetContacts = []
      }
    }

    if (targetContacts.length === 0) {
      return {
        success: false,
        totalRecipients: 0,
        successfulSends: 0,
        failedSends: 0,
        errors: ['No target contacts found']
      }
    }

    // 3. Update campaign status to "Sending"
    await cosmic.objects.updateOne(campaignId, {
      metadata: {
        campaign_status: 'Sending' // Use the value directly
      }
    })

    // 4. Send emails
    const emailPromises = targetContacts.map(async (contact: Contact) => {
      try {
        await resend.emails.send({
          from: 'Cosmic Support <support@cosmicjs.com>',
          to: contact.metadata.email,
          subject: template.metadata.subject_line,
          html: template.metadata.html_content,
          headers: {
            'X-Campaign-ID': campaignId,
            'X-Contact-ID': contact.id
          }
        })
        return { success: true, contactId: contact.id }
      } catch (error) {
        console.error(`Failed to send to ${contact.metadata.email}:`, error)
        return { success: false, contactId: contact.id, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    })

    const results = await Promise.all(emailPromises)
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)

    // 5. Update campaign with final stats and status
    const updatedStats = {
      recipients: targetContacts.length,
      delivered: successful.length,
      opened: campaign.metadata.campaign_stats?.opened || 0,
      clicked: campaign.metadata.campaign_stats?.clicked || 0,
      open_rate: campaign.metadata.campaign_stats?.open_rate || 0,
      click_rate: campaign.metadata.campaign_stats?.click_rate || 0
    }

    await cosmic.objects.updateOne(campaignId, {
      metadata: {
        campaign_status: 'Sent', // Use the value directly
        campaign_stats: updatedStats,
        send_date: new Date().toISOString().split('T')[0] // Update send date to today
      }
    })

    return {
      success: successful.length > 0,
      totalRecipients: targetContacts.length,
      successfulSends: successful.length,
      failedSends: failed.length,
      errors: failed.map(f => f.error || 'Unknown error')
    }

  } catch (error) {
    console.error('Error in sendCampaign:', error)
    
    // Try to revert campaign status back to original on error
    try {
      await cosmic.objects.updateOne(campaignId, {
        metadata: {
          campaign_status: 'Draft' // Revert to Draft on error
        }
      })
    } catch (revertError) {
      console.error('Error reverting campaign status:', revertError)
    }

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
    const { object: campaign } = await cosmic.objects.findOne({
      type: 'campaigns',
      id: campaignId
    }).depth(1)

    if (!campaign) {
      return {
        success: false,
        totalRecipients: 0,
        successfulSends: 0,
        failedSends: 0,
        errors: ['Campaign not found']
      }
    }

    // Get target contacts count
    let targetContactsCount = 0
    try {
      if (selectedContactIds && selectedContactIds.length > 0) {
        targetContactsCount = selectedContactIds.length
      } else {
        const { objects: contacts } = await cosmic.objects.find({
          type: 'contacts',
          'metadata.subscription_status': 'Subscribed'
        })
        targetContactsCount = contacts.length
      }
    } catch (error) {
      targetContactsCount = 0
    }

    // Update campaign status to "Scheduled"
    await cosmic.objects.updateOne(campaignId, {
      metadata: {
        campaign_status: 'Scheduled',
        send_date: scheduledDate.toISOString().split('T')[0]
      }
    })

    return {
      success: true,
      totalRecipients: targetContactsCount,
      successfulSends: 0,
      failedSends: 0,
      errors: []
    }

  } catch (error) {
    console.error('Error in scheduleCampaign:', error)
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
  campaignOrTemplateId: string | Campaign, 
  testEmail: string,
  campaignName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    let template: any

    if (typeof campaignOrTemplateId === 'string') {
      // Get the template by ID
      const { object: templateObj } = await cosmic.objects.findOne({
        type: 'email-templates',
        id: campaignOrTemplateId
      })
      template = templateObj
    } else {
      // Use campaign's template
      const campaign = campaignOrTemplateId as Campaign
      template = campaign.metadata.email_template
    }

    if (!template) {
      return { success: false, error: 'Template not found' }
    }

    if (!template.metadata?.html_content || !template.metadata?.subject_line) {
      return { success: false, error: 'Template is missing content or subject line' }
    }

    // Send test email
    await resend.emails.send({
      from: 'Cosmic Support <support@cosmicjs.com>',
      to: testEmail,
      subject: `[TEST] ${template.metadata.subject_line}`,
      html: template.metadata.html_content,
      headers: {
        'X-Test-Email': 'true',
        'X-Template-ID': typeof campaignOrTemplateId === 'string' ? campaignOrTemplateId : template.id,
        ...(campaignName && { 'X-Campaign-Name': campaignName })
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