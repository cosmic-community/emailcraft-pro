import { createBucketClient } from '@cosmicjs/sdk'
import { Contact, EmailTemplate, Campaign, CreateContactFormData, CreateTemplateFormData, CreateCampaignFormData } from '@/types'

const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
  apiEnvironment: "staging"
})

const cosmicRead = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  apiEnvironment: "staging"
})

// Contact functions
export async function getContacts(): Promise<Contact[]> {
  try {
    const { objects } = await cosmicRead.objects
      .find({ type: 'contacts' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)

    return objects as Contact[]
  } catch (error) {
    if (error.status === 404) {
      return []
    }
    throw error
  }
}

export async function createContact(data: CreateContactFormData): Promise<Contact> {
  const contactData = {
    title: data.title,
    type: 'contacts',
    metadata: {
      email: data.email,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      subscription_status: data.subscription_status, // Use string value directly
      tags: data.tags || null,
      date_subscribed: data.date_subscribed || '',
      notes: data.notes || ''
    }
  }

  const { object } = await cosmic.objects.insertOne(contactData)
  return object as Contact
}

// Template functions
export async function getTemplates(): Promise<EmailTemplate[]> {
  try {
    const { objects } = await cosmicRead.objects
      .find({ type: 'email-templates' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)

    return objects as EmailTemplate[]
  } catch (error) {
    if (error.status === 404) {
      return []
    }
    throw error
  }
}

export async function createTemplate(data: CreateTemplateFormData): Promise<EmailTemplate> {
  const templateData = {
    title: data.title,
    type: 'email-templates',
    metadata: {
      template_name: data.template_name,
      subject_line: data.subject_line,
      html_content: data.html_content,
      template_category: data.template_category || '', // Use string value directly
      template_description: data.template_description || ''
    }
  }

  const { object } = await cosmic.objects.insertOne(templateData)
  return object as EmailTemplate
}

// Campaign functions
export async function getCampaigns(): Promise<Campaign[]> {
  try {
    const { objects } = await cosmicRead.objects
      .find({ type: 'campaigns' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)

    return objects as Campaign[]
  } catch (error) {
    if (error.status === 404) {
      return []
    }
    throw error
  }
}

export async function createCampaign(data: CreateCampaignFormData): Promise<Campaign> {
  const campaignData = {
    title: data.title,
    type: 'campaigns',
    metadata: {
      campaign_name: data.campaign_name,
      email_template: data.email_template,
      campaign_status: data.campaign_status, // Use string value directly
      target_tags: data.target_tags && data.target_tags.length > 0 ? data.target_tags : null,
      send_date: data.send_date || null,
      campaign_notes: data.campaign_notes || null,
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

  const { object } = await cosmic.objects.insertOne(campaignData)
  return object as Campaign
}

export async function updateCampaign(id: string, data: any): Promise<Campaign> {
  const { object } = await cosmic.objects.updateOne(id, data)
  return object as Campaign
}

// Statistics functions
export async function getDashboardStats() {
  try {
    const [contactsResponse, templatesResponse, campaignsResponse] = await Promise.all([
      cosmicRead.objects.find({ type: 'contacts' }).props(['id']),
      cosmicRead.objects.find({ type: 'email-templates' }).props(['id']),
      cosmicRead.objects.find({ type: 'campaigns' }).props(['id', 'metadata'])
    ])

    const totalContacts = contactsResponse.objects?.length || 0
    const totalTemplates = templatesResponse.objects?.length || 0
    const totalCampaigns = campaignsResponse.objects?.length || 0
    
    // Calculate sent campaigns
    const sentCampaigns = campaignsResponse.objects?.filter(
      (campaign: any) => campaign.metadata?.campaign_status?.value === 'Sent' || campaign.metadata?.campaign_status === 'sent'
    ).length || 0

    return {
      totalContacts,
      totalTemplates,
      totalCampaigns,
      sentCampaigns
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      totalContacts: 0,
      totalTemplates: 0,
      totalCampaigns: 0,
      sentCampaigns: 0
    }
  }
}