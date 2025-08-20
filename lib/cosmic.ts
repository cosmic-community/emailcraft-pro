import { createBucketClient } from '@cosmicjs/sdk'
import type { Contact, EmailTemplate, Campaign, CreateContactFormData, CreateTemplateFormData, CreateCampaignFormData, CampaignStatusKey, CampaignStatusValue } from '@/types'

// Initialize Cosmic SDK with environment variables
const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
  apiEnvironment: "staging"
})

// Read-only client for client-side operations
export const cosmicRead = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  apiEnvironment: "staging"
})

// Contact functions
export async function getContacts(): Promise<Contact[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'contacts' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)

    return response.objects as Contact[]
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return []
  }
}

export async function createContact(data: CreateContactFormData): Promise<Contact> {
  const contactData = {
    title: data.email, // Use email as title for contacts
    type: 'contacts',
    metadata: {
      email: data.email,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      subscription_status: {
        key: data.subscription_status,
        value: getSubscriptionStatusValue(data.subscription_status)
      },
      tags: data.tags || [],
      date_subscribed: data.date_subscribed || new Date().toISOString().split('T')[0],
      notes: data.notes || ''
    }
  }

  const response = await cosmic.objects.insertOne(contactData)
  return response.object as Contact
}

// Helper function to convert subscription status key to value
function getSubscriptionStatusValue(key: string): string {
  const statusMap: Record<string, string> = {
    'subscribed': 'Subscribed',
    'unsubscribed': 'Unsubscribed',  
    'pending': 'Pending Confirmation'
  }
  return statusMap[key] || 'Subscribed'
}

// Template functions
export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'email-templates' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)

    return response.objects as EmailTemplate[]
  } catch (error) {
    console.error('Error fetching email templates:', error)
    return []
  }
}

export async function getEmailTemplateById(id: string): Promise<EmailTemplate | null> {
  try {
    const response = await cosmic.objects
      .findOne({ id, type: 'email-templates' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)

    return response.object as EmailTemplate
  } catch (error) {
    console.error('Error fetching email template:', error)
    return null
  }
}

export async function createEmailTemplate(data: CreateTemplateFormData): Promise<EmailTemplate> {
  const templateData = {
    title: data.template_name,
    type: 'email-templates',
    metadata: {
      template_name: data.template_name,
      subject_line: data.subject_line,
      html_content: data.html_content,
      template_category: data.template_category ? {
        key: data.template_category,
        value: getTemplateCategoryValue(data.template_category)
      } : undefined,
      template_description: data.template_description || ''
    }
  }

  const response = await cosmic.objects.insertOne(templateData)
  return response.object as EmailTemplate
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

// Campaign functions
export async function getCampaigns(): Promise<Campaign[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'campaigns' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)

    return response.objects as Campaign[]
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return []
  }
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  try {
    const response = await cosmic.objects
      .findOne({ id, type: 'campaigns' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)

    return response.object as Campaign
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return null
  }
}

export async function createCampaign(data: CreateCampaignFormData | any): Promise<Campaign> {
  console.log('Creating campaign with data:', JSON.stringify(data, null, 2))
  
  try {
    // Get the email template to validate it exists
    const template = await getEmailTemplateById(data.email_template)
    if (!template) {
      throw new Error(`Email template with ID ${data.email_template} not found`)
    }
    console.log('Found template:', template.id, template.metadata.template_name)

    // Create campaign data matching the exact Cosmic CMS object type structure
    // For object-type metafields, Cosmic expects just the object ID as a string
    const campaignData = {
      title: data.campaign_name,
      type: 'campaigns',
      metadata: {
        campaign_name: data.campaign_name,
        email_template: data.email_template, // Just the template ID as string
        campaign_status: {
          key: getCampaignStatusKey(data.campaign_status || 'draft'),
          value: getCampaignStatusValue(data.campaign_status || 'draft')
        },
        target_tags: data.target_tags && data.target_tags.length > 0 ? data.target_tags : null,
        send_date: data.send_date || '',
        campaign_notes: data.campaign_notes || '',
        campaign_stats: {
          recipients: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          open_rate: 0,
          click_rate: 0
        }
      }
    }

    console.log('Sending campaign data to Cosmic:', JSON.stringify(campaignData, null, 2))

    const response = await cosmic.objects.insertOne(campaignData)
    console.log('Campaign created successfully:', response.object.id)
    
    return response.object as Campaign
    
  } catch (error) {
    console.error('Error in createCampaign function:', error)
    throw error
  }
}

function getCampaignStatusKey(statusValue: string): CampaignStatusKey {
  const statusMap: Record<string, CampaignStatusKey> = {
    'Draft': 'draft',
    'Scheduled': 'scheduled', 
    'Sending': 'sending',
    'Sent': 'sent',
    'Paused': 'paused',
    'draft': 'draft',
    'scheduled': 'scheduled',
    'sending': 'sending', 
    'sent': 'sent',
    'paused': 'paused'
  }
  return statusMap[statusValue] || 'draft'
}

function getCampaignStatusValue(statusKey: string): CampaignStatusValue {
  const statusMap: Record<string, CampaignStatusValue> = {
    'draft': 'Draft',
    'scheduled': 'Scheduled',
    'sending': 'Sending',
    'sent': 'Sent',
    'paused': 'Paused',
    'Draft': 'Draft',
    'Scheduled': 'Scheduled',
    'Sending': 'Sending',
    'Sent': 'Sent',
    'Paused': 'Paused'
  }
  return statusMap[statusKey] || 'Draft'
}

export async function updateCampaign(id: string, updates: Partial<Campaign['metadata']>): Promise<Campaign> {
  const response = await cosmic.objects.updateOne(id, {
    metadata: updates
  })
  return response.object as Campaign
}

export async function deleteCampaign(id: string): Promise<void> {
  await cosmic.objects.deleteOne(id)
}

// Analytics and dashboard functions
export async function getDashboardStats() {
  try {
    const [contacts, templates, campaigns] = await Promise.all([
      getContacts(),
      getEmailTemplates(), 
      getCampaigns()
    ])

    // Count subscribed contacts
    const subscribedContacts = contacts.filter(contact => {
      const status = contact.metadata.subscription_status
      return (typeof status === 'object' ? status.key : status) === 'subscribed'
    })

    // Count sent campaigns
    const sentCampaigns = campaigns.filter(campaign => {
      const status = campaign.metadata.campaign_status
      return (typeof status === 'object' ? status.key : status) === 'sent'
    })

    return {
      totalContacts: contacts.length,
      subscribedContacts: subscribedContacts.length,
      totalTemplates: templates.length,
      totalCampaigns: campaigns.length,
      sentCampaigns: sentCampaigns.length,
      recentContacts: contacts.slice(0, 5),
      recentCampaigns: campaigns.slice(0, 5)
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      totalContacts: 0,
      subscribedContacts: 0,
      totalTemplates: 0,
      totalCampaigns: 0,
      sentCampaigns: 0,
      recentContacts: [],
      recentCampaigns: []
    }
  }
}

// Utility functions
export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return 'Invalid Date'
  }
}

export function formatDateTime(dateString: string): string {
  try {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'Invalid Date'
  }
}

// Export aliases for backward compatibility
export const getTemplates = getEmailTemplates
export const createTemplate = createEmailTemplate