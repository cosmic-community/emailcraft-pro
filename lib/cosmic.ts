import { createBucketClient } from '@cosmicjs/sdk'
import { Contact, EmailTemplate, Campaign, CosmicResponse } from '@/types'

const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
  apiEnvironment: 'staging'
})

// Contact functions
export async function getContacts(): Promise<Contact[]> {
  try {
    const { objects } = await cosmic.objects
      .find({ type: 'contacts' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
    
    return objects as Contact[]
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      return []
    }
    throw error
  }
}

export async function getContactById(id: string): Promise<Contact | null> {
  try {
    const { object } = await cosmic.objects
      .findOne({ id })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
    
    return object as Contact
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      return null
    }
    throw error
  }
}

export async function createContact(data: any): Promise<Contact> {
  const response = await cosmic.objects.insertOne({
    type: 'contacts',
    title: data.email,
    slug: data.email.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(),
    metadata: {
      email: data.email,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      subscription_status: {
        key: data.subscription_status || 'subscribed',
        value: data.subscription_status === 'subscribed' ? 'Subscribed' : 
               data.subscription_status === 'unsubscribed' ? 'Unsubscribed' : 'Pending Confirmation'
      },
      tags: data.tags || [],
      date_subscribed: data.date_subscribed || new Date().toISOString().split('T')[0],
      notes: data.notes || ''
    }
  })
  
  return response.object as Contact
}

export async function updateContact(id: string, data: any): Promise<Contact> {
  const response = await cosmic.objects.updateOne(id, {
    metadata: data.metadata
  })
  
  return response.object as Contact
}

// Email Template functions
export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  try {
    const { objects } = await cosmic.objects
      .find({ type: 'email-templates' })
      .props(['id', 'title', 'slug', 'metadata', 'thumbnail'])
      .depth(1)
    
    return objects as EmailTemplate[]
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      return []
    }
    throw error
  }
}

export async function getEmailTemplateById(id: string): Promise<EmailTemplate | null> {
  try {
    const { object } = await cosmic.objects
      .findOne({ id })
      .props(['id', 'title', 'slug', 'metadata', 'thumbnail'])
      .depth(1)
    
    return object as EmailTemplate
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      return null
    }
    throw error
  }
}

export async function createEmailTemplate(data: any): Promise<EmailTemplate> {
  const response = await cosmic.objects.insertOne({
    type: 'email-templates',
    title: data.template_name,
    thumbnail: data.preview_image || '',
    metadata: {
      template_name: data.template_name,
      subject_line: data.subject_line,
      html_content: data.html_content,
      template_category: data.template_category ? {
        key: data.template_category,
        value: data.template_category.charAt(0).toUpperCase() + data.template_category.slice(1)
      } : { key: '', value: '' },
      template_description: data.template_description || ''
    }
  })
  
  return response.object as EmailTemplate
}

export async function updateEmailTemplate(id: string, data: any): Promise<EmailTemplate> {
  const updateData: any = {}
  
  if (data.title) updateData.title = data.title
  if (data.thumbnail) updateData.thumbnail = data.thumbnail
  if (data.metadata) updateData.metadata = data.metadata
  
  const response = await cosmic.objects.updateOne(id, updateData)
  return response.object as EmailTemplate
}

// Campaign functions
export async function getCampaigns(): Promise<Campaign[]> {
  try {
    const { objects } = await cosmic.objects
      .find({ type: 'campaigns' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
    
    return objects as Campaign[]
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      return []
    }
    throw error
  }
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  try {
    const { object } = await cosmic.objects
      .findOne({ id })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
    
    return object as Campaign
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      return null
    }
    throw error
  }
}

export async function createCampaign(data: any): Promise<Campaign> {
  const response = await cosmic.objects.insertOne({
    type: 'campaigns',
    title: data.campaign_name,
    metadata: {
      campaign_name: data.campaign_name,
      email_template: data.email_template,
      campaign_status: {
        key: data.campaign_status || 'draft',
        value: data.campaign_status === 'draft' ? 'Draft' :
               data.campaign_status === 'scheduled' ? 'Scheduled' :
               data.campaign_status === 'sending' ? 'Sending' :
               data.campaign_status === 'sent' ? 'Sent' : 'Paused'
      },
      target_tags: data.target_tags || [],
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
  })
  
  return response.object as Campaign
}

export async function updateCampaign(id: string, data: any): Promise<Campaign> {
  const updateData: any = {}
  
  if (data.title) updateData.title = data.title
  if (data.metadata) updateData.metadata = data.metadata
  
  const response = await cosmic.objects.updateOne(id, updateData)
  return response.object as Campaign
}

export async function deleteCampaign(id: string): Promise<void> {
  await cosmic.objects.deleteOne(id)
}