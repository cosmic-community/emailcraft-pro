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
  logs: string[]
}

interface ContactQueryResult {
  objects: Contact[]
  total?: number
}

function addLog(logs: string[], message: string): void {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${message}`
  console.log(logMessage)
  logs.push(logMessage)
}

function handleDropdownValue(dropdownField: any): string {
  if (!dropdownField) return ''
  
  // Handle both {key: string, value: string} format and direct string values
  if (typeof dropdownField === 'object' && dropdownField.value) {
    return dropdownField.value
  }
  if (typeof dropdownField === 'object' && dropdownField.key) {
    return dropdownField.key
  }
  if (typeof dropdownField === 'string') {
    return dropdownField
  }
  
  return ''
}

export async function sendCampaign(campaignId: string, selectedContactIds?: string[]): Promise<SendResult> {
  const logs: string[] = []
  
  try {
    addLog(logs, `Starting email campaign send for campaign ID: ${campaignId}`)
    
    // Validate environment variables
    if (!process.env.RESEND_API_KEY) {
      const error = 'RESEND_API_KEY environment variable is not set'
      addLog(logs, `ERROR: ${error}`)
      return {
        success: false,
        totalRecipients: 0,
        successfulSends: 0,
        failedSends: 0,
        errors: [error],
        logs
      }
    }

    if (!process.env.COSMIC_BUCKET_SLUG || !process.env.COSMIC_READ_KEY || !process.env.COSMIC_WRITE_KEY) {
      const error = 'Cosmic CMS environment variables are not properly configured'
      addLog(logs, `ERROR: ${error}`)
      return {
        success: false,
        totalRecipients: 0,
        successfulSends: 0,
        failedSends: 0,
        errors: [error],
        logs
      }
    }

    // 1. Get campaign with template data
    addLog(logs, 'Fetching campaign data from Cosmic CMS...')
    const { object: campaign } = await cosmic.objects.findOne({
      type: 'campaigns',
      id: campaignId
    }).depth(1)

    if (!campaign) {
      const error = `Campaign not found with ID: ${campaignId}`
      addLog(logs, `ERROR: ${error}`)
      return {
        success: false,
        totalRecipients: 0,
        successfulSends: 0,
        failedSends: 0,
        errors: [error],
        logs
      }
    }

    addLog(logs, `Campaign found: ${campaign.title}`)

    // Validate campaign has template and content
    if (!campaign.metadata.email_template) {
      const error = 'No email template selected for campaign'
      addLog(logs, `ERROR: ${error}`)
      return {
        success: false,
        totalRecipients: 0,
        successfulSends: 0,
        failedSends: 0,
        errors: [error],
        logs
      }
    }

    const template = campaign.metadata.email_template
    addLog(logs, `Email template found: ${template.title}`)

    if (!template.metadata?.html_content || !template.metadata?.subject_line) {
      const error = 'Email template is missing content or subject line'
      addLog(logs, `ERROR: ${error}`)
      addLog(logs, `Template metadata: ${JSON.stringify({
        has_html_content: !!template.metadata?.html_content,
        has_subject_line: !!template.metadata?.subject_line,
        html_content_length: template.metadata?.html_content?.length || 0
      })}`)
      return {
        success: false,
        totalRecipients: 0,
        successfulSends: 0,
        failedSends: 0,
        errors: [error],
        logs
      }
    }

    // 2. Get target contacts
    addLog(logs, 'Fetching target contacts...')
    let targetContacts: Contact[] = []

    if (selectedContactIds && selectedContactIds.length > 0) {
      addLog(logs, `Using specific selected contacts: ${selectedContactIds.length} contacts`)
      // Use specific selected contacts
      try {
        const result: ContactQueryResult = await cosmic.objects.find({
          type: 'contacts'
        })
        
        const allContacts = result.objects || []
        addLog(logs, `Total contacts in system: ${allContacts.length}`)
        
        // Filter for selected contacts that are subscribed
        targetContacts = allContacts.filter((contact: Contact) => {
          const isSelected = selectedContactIds.includes(contact.id)
          const subscriptionStatus = handleDropdownValue(contact.metadata.subscription_status)
          const isSubscribed = subscriptionStatus.toLowerCase() === 'subscribed'
          
          return isSelected && isSubscribed
        })
        
        addLog(logs, `Filtered contacts (selected + subscribed): ${targetContacts.length}`)
      } catch (error) {
        addLog(logs, `Error fetching selected contacts: ${error}`)
        targetContacts = []
      }
    } else {
      // Use campaign target tags or all subscribed contacts
      const targetTags = campaign.metadata.target_tags
      addLog(logs, `Target tags: ${targetTags ? JSON.stringify(targetTags) : 'none (using all subscribed)'}`)

      try {
        const result: ContactQueryResult = await cosmic.objects.find({
          type: 'contacts'
        })
        
        const allContacts = result.objects || []
        addLog(logs, `Total contacts in system: ${allContacts.length}`)
        
        // Filter for subscribed contacts first
        const subscribedContacts = allContacts.filter((contact: Contact) => {
          const subscriptionStatus = handleDropdownValue(contact.metadata.subscription_status)
          return subscriptionStatus.toLowerCase() === 'subscribed'
        })
        
        addLog(logs, `Subscribed contacts: ${subscribedContacts.length}`)
        
        if (targetTags && targetTags.length > 0) {
          // Filter contacts that have at least one matching tag
          targetContacts = subscribedContacts.filter((contact: Contact) => {
            const contactTags = contact.metadata.tags || []
            const hasMatchingTag = targetTags.some((tag: string) => contactTags.includes(tag))
            return hasMatchingTag
          })
          addLog(logs, `Contacts matching target tags: ${targetContacts.length}`)
        } else {
          // Use all subscribed contacts
          targetContacts = subscribedContacts
          addLog(logs, `Using all subscribed contacts: ${targetContacts.length}`)
        }
      } catch (error) {
        addLog(logs, `Error fetching contacts: ${error}`)
        targetContacts = []
      }
    }

    if (targetContacts.length === 0) {
      const error = 'No target contacts found'
      addLog(logs, `ERROR: ${error}`)
      return {
        success: false,
        totalRecipients: 0,
        successfulSends: 0,
        failedSends: 0,
        errors: [error],
        logs
      }
    }

    // Log contact details for debugging
    addLog(logs, 'Target contact emails:')
    targetContacts.forEach((contact, index) => {
      addLog(logs, `  ${index + 1}. ${contact.metadata.email} (${contact.metadata.first_name} ${contact.metadata.last_name})`)
    })

    // 3. Update campaign status to "Sending"
    addLog(logs, 'Updating campaign status to "Sending"...')
    try {
      await cosmic.objects.updateOne(campaignId, {
        metadata: {
          campaign_status: 'Sending'
        }
      })
      addLog(logs, 'Campaign status updated to "Sending"')
    } catch (error) {
      addLog(logs, `Warning: Could not update campaign status: ${error}`)
    }

    // 4. Send emails
    addLog(logs, `Starting to send ${targetContacts.length} emails...`)
    const emailPromises = targetContacts.map(async (contact: Contact, index: number) => {
      try {
        addLog(logs, `Sending email ${index + 1}/${targetContacts.length} to ${contact.metadata.email}...`)
        
        const emailData = {
          from: 'EmailCraft <noreply@resend.dev>',
          to: contact.metadata.email,
          subject: template.metadata.subject_line,
          html: template.metadata.html_content,
          headers: {
            'X-Campaign-ID': campaignId,
            'X-Contact-ID': contact.id
          }
        }
        
        const response = await resend.emails.send(emailData)
        
        addLog(logs, `✅ Email sent successfully to ${contact.metadata.email}. Message ID: ${response.data?.id}`)
        return { success: true, contactId: contact.id, messageId: response.data?.id }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        addLog(logs, `❌ Failed to send to ${contact.metadata.email}: ${errorMessage}`)
        return { success: false, contactId: contact.id, error: errorMessage }
      }
    })

    const results = await Promise.all(emailPromises)
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)

    addLog(logs, `Email sending complete. Success: ${successful.length}, Failed: ${failed.length}`)

    // 5. Update campaign with final stats and status
    addLog(logs, 'Updating campaign with final stats...')
    const updatedStats = {
      recipients: targetContacts.length,
      delivered: successful.length,
      opened: campaign.metadata.campaign_stats?.opened || 0,
      clicked: campaign.metadata.campaign_stats?.clicked || 0,
      open_rate: campaign.metadata.campaign_stats?.open_rate || 0,
      click_rate: campaign.metadata.campaign_stats?.click_rate || 0
    }

    try {
      await cosmic.objects.updateOne(campaignId, {
        metadata: {
          campaign_status: 'Sent',
          campaign_stats: updatedStats,
          send_date: new Date().toISOString().split('T')[0]
        }
      })
      addLog(logs, 'Campaign updated with final stats and "Sent" status')
    } catch (error) {
      addLog(logs, `Warning: Could not update final campaign stats: ${error}`)
    }

    const finalResult = {
      success: successful.length > 0,
      totalRecipients: targetContacts.length,
      successfulSends: successful.length,
      failedSends: failed.length,
      errors: failed.map(f => f.error || 'Unknown error'),
      logs
    }

    addLog(logs, `Campaign send completed. Final result: ${JSON.stringify({
      success: finalResult.success,
      totalRecipients: finalResult.totalRecipients,
      successfulSends: finalResult.successfulSends,
      failedSends: finalResult.failedSends,
      errorCount: finalResult.errors.length
    })}`)

    return finalResult

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    addLog(logs, `CRITICAL ERROR in sendCampaign: ${errorMessage}`)
    addLog(logs, `Error stack: ${error instanceof Error ? error.stack : 'No stack available'}`)
    
    // Try to revert campaign status back to original on error
    try {
      await cosmic.objects.updateOne(campaignId, {
        metadata: {
          campaign_status: 'Draft'
        }
      })
      addLog(logs, 'Campaign status reverted to "Draft" due to error')
    } catch (revertError) {
      addLog(logs, `Error reverting campaign status: ${revertError}`)
    }

    return {
      success: false,
      totalRecipients: 0,
      successfulSends: 0,
      failedSends: 0,
      errors: [errorMessage],
      logs
    }
  }
}

export async function scheduleCampaign(
  campaignId: string, 
  scheduledDate: Date,
  selectedContactIds?: string[]
): Promise<SendResult> {
  const logs: string[] = []
  
  try {
    addLog(logs, `Scheduling campaign ${campaignId} for ${scheduledDate.toISOString()}`)
    
    // Get campaign details
    const { object: campaign } = await cosmic.objects.findOne({
      type: 'campaigns',
      id: campaignId
    }).depth(1)

    if (!campaign) {
      const error = 'Campaign not found'
      addLog(logs, `ERROR: ${error}`)
      return {
        success: false,
        totalRecipients: 0,
        successfulSends: 0,
        failedSends: 0,
        errors: [error],
        logs
      }
    }

    // Get target contacts count
    let targetContactsCount = 0
    try {
      if (selectedContactIds && selectedContactIds.length > 0) {
        targetContactsCount = selectedContactIds.length
        addLog(logs, `Using ${targetContactsCount} selected contacts`)
      } else {
        const result: ContactQueryResult = await cosmic.objects.find({
          type: 'contacts'
        })
        const allContacts = result.objects || []
        const subscribedContacts = allContacts.filter((contact: Contact) => {
          const subscriptionStatus = handleDropdownValue(contact.metadata.subscription_status)
          return subscriptionStatus.toLowerCase() === 'subscribed'
        })
        targetContactsCount = subscribedContacts.length
        addLog(logs, `Using ${targetContactsCount} subscribed contacts`)
      }
    } catch (error) {
      addLog(logs, `Error counting target contacts: ${error}`)
      targetContactsCount = 0
    }

    // Update campaign status to "Scheduled"
    await cosmic.objects.updateOne(campaignId, {
      metadata: {
        campaign_status: 'Scheduled',
        send_date: scheduledDate.toISOString().split('T')[0]
      }
    })

    addLog(logs, 'Campaign successfully scheduled')

    return {
      success: true,
      totalRecipients: targetContactsCount,
      successfulSends: 0,
      failedSends: 0,
      errors: [],
      logs
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    addLog(logs, `ERROR in scheduleCampaign: ${errorMessage}`)
    return {
      success: false,
      totalRecipients: 0,
      successfulSends: 0,
      failedSends: 0,
      errors: [errorMessage],
      logs
    }
  }
}

export async function sendTestEmail(
  campaignOrTemplateId: string | Campaign, 
  testEmail: string,
  campaignName?: string
): Promise<{ success: boolean; error?: string; logs: string[] }> {
  const logs: string[] = []
  
  try {
    addLog(logs, `Sending test email to ${testEmail}`)
    
    // Validate environment
    if (!process.env.RESEND_API_KEY) {
      const error = 'RESEND_API_KEY environment variable is not set'
      addLog(logs, `ERROR: ${error}`)
      return { success: false, error, logs }
    }

    let template: any

    if (typeof campaignOrTemplateId === 'string') {
      addLog(logs, `Fetching template by ID: ${campaignOrTemplateId}`)
      // Get the template by ID
      const { object: templateObj } = await cosmic.objects.findOne({
        type: 'email-templates',
        id: campaignOrTemplateId
      })
      template = templateObj
    } else {
      addLog(logs, 'Using campaign template')
      // Use campaign's template
      const campaign = campaignOrTemplateId as Campaign
      template = campaign.metadata.email_template
    }

    if (!template) {
      const error = 'Template not found'
      addLog(logs, `ERROR: ${error}`)
      return { success: false, error, logs }
    }

    addLog(logs, `Template found: ${template.title}`)

    if (!template.metadata?.html_content || !template.metadata?.subject_line) {
      const error = 'Template is missing content or subject line'
      addLog(logs, `ERROR: ${error}`)
      return { success: false, error, logs }
    }

    // Send test email
    addLog(logs, 'Sending test email via Resend...')
    const emailData = {
      from: 'EmailCraft <noreply@resend.dev>',
      to: testEmail,
      subject: `[TEST] ${template.metadata.subject_line}`,
      html: template.metadata.html_content,
      headers: {
        'X-Test-Email': 'true',
        'X-Template-ID': typeof campaignOrTemplateId === 'string' ? campaignOrTemplateId : template.id,
        ...(campaignName && { 'X-Campaign-Name': campaignName })
      }
    }

    const response = await resend.emails.send(emailData)
    addLog(logs, `✅ Test email sent successfully. Message ID: ${response.data?.id}`)

    return { success: true, logs }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    addLog(logs, `❌ Error sending test email: ${errorMessage}`)
    return { 
      success: false, 
      error: errorMessage,
      logs
    }
  }
}