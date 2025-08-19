import { createBucketClient } from '@cosmicjs/sdk'
import type { 
  EmailTemplate, 
  Campaign, 
  Contact,
  CampaignStatusValue,
  CampaignStatusKey,
  TemplateCategoryKey,
  TemplateCategoryValue,
  SubscriptionStatusKey,
  SubscriptionStatusValue
} from '../types'

// Define Cosmic object interface for type safety
interface CosmicObject {
  id: string
  slug: string
  title: string
  content?: string
  bucket?: string
  created_at: string
  modified_at: string
  status: string
  published_at?: string
  type: string
  metadata?: Record<string, any>
}

const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG!,
  readKey: process.env.COSMIC_READ_KEY!,
  writeKey: process.env.COSMIC_WRITE_KEY!,
})

// Helper function to convert status string to proper format
function formatCampaignStatus(status: string): { key: CampaignStatusKey; value: CampaignStatusValue } {
  const statusMap: Record<string, { key: CampaignStatusKey; value: CampaignStatusValue }> = {
    'draft': { key: 'draft', value: 'Draft' },
    'scheduled': { key: 'scheduled', value: 'Scheduled' },
    'sending': { key: 'sending', value: 'Sending' },
    'sent': { key: 'sent', value: 'Sent' },
    'paused': { key: 'paused', value: 'Paused' },
    'Draft': { key: 'draft', value: 'Draft' },
    'Scheduled': { key: 'scheduled', value: 'Scheduled' },
    'Sending': { key: 'sending', value: 'Sending' },
    'Sent': { key: 'sent', value: 'Sent' },
    'Paused': { key: 'paused', value: 'Paused' }
  }
  return statusMap[status] || { key: 'draft', value: 'Draft' }
}

// Helper function to format template category
function formatTemplateCategory(category: string): { key: TemplateCategoryKey; value: TemplateCategoryValue } {
  const categoryMap: Record<string, { key: TemplateCategoryKey; value: TemplateCategoryValue }> = {
    'newsletter': { key: 'newsletter', value: 'Newsletter' },
    'promotion': { key: 'promotion', value: 'Promotional' },
    'welcome': { key: 'welcome', value: 'Welcome Series' },
    'transactional': { key: 'transactional', value: 'Transactional' },
    'announcement': { key: 'announcement', value: 'Announcement' },
    'Newsletter': { key: 'newsletter', value: 'Newsletter' },
    'Promotional': { key: 'promotion', value: 'Promotional' },
    'Welcome Series': { key: 'welcome', value: 'Welcome Series' },
    'Transactional': { key: 'transactional', value: 'Transactional' },
    'Announcement': { key: 'announcement', value: 'Announcement' }
  }
  return categoryMap[category] || { key: 'newsletter', value: 'Newsletter' }
}

// Helper function to format subscription status
function formatSubscriptionStatus(status: string): { key: SubscriptionStatusKey; value: SubscriptionStatusValue } {
  const statusMap: Record<string, { key: SubscriptionStatusKey; value: SubscriptionStatusValue }> = {
    'subscribed': { key: 'subscribed', value: 'Subscribed' },
    'unsubscribed': { key: 'unsubscribed', value: 'Unsubscribed' },
    'pending': { key: 'pending', value: 'Pending Confirmation' },
    'Subscribed': { key: 'subscribed', value: 'Subscribed' },
    'Unsubscribed': { key: 'unsubscribed', value: 'Unsubscribed' },
    'Pending Confirmation': { key: 'pending', value: 'Pending Confirmation' }
  }
  return statusMap[status] || { key: 'subscribed', value: 'Subscribed' }
}

// Get all templates
export async function getTemplates(): Promise<EmailTemplate[]> {
  try {
    const { objects } = await cosmic.objects
      .find({ type: 'email-templates' })
      .props(['id', 'slug', 'title', 'status', 'created_at', 'modified_at', 'metadata', 'bucket'])
      .depth(1)
    
    return objects.map((obj: CosmicObject) => ({
      id: obj.id,
      slug: obj.slug,
      title: obj.title,
      content: obj.content || '',
      bucket: obj.bucket || process.env.COSMIC_BUCKET_SLUG || '',
      created_at: obj.created_at,
      modified_at: obj.modified_at,
      status: obj.status,
      published_at: obj.published_at || undefined,
      type: 'email-templates' as const,
      metadata: {
        template_name: obj.metadata?.template_name || obj.title,
        subject_line: obj.metadata?.subject_line || '',
        html_content: obj.metadata?.html_content || '',
        template_category: obj.metadata?.template_category 
          ? formatTemplateCategory(obj.metadata.template_category) 
          : undefined,
        preview_image: obj.metadata?.preview_image || null,
        template_description: obj.metadata?.template_description || null
      }
    })) as EmailTemplate[]
  } catch (error) {
    console.error('Error fetching templates:', error)
    return []
  }
}

// Get template by ID
export async function getTemplate(id: string): Promise<EmailTemplate | null> {
  try {
    const { object } = await cosmic.objects
      .findOne({ id, type: 'email-templates' })
      .props(['id', 'slug', 'title', 'status', 'created_at', 'modified_at', 'metadata', 'bucket'])
      .depth(1)
    
    if (!object) return null

    return {
      id: object.id,
      slug: object.slug,
      title: object.title,
      content: object.content || '',
      bucket: object.bucket || process.env.COSMIC_BUCKET_SLUG || '',
      created_at: object.created_at,
      modified_at: object.modified_at,
      status: object.status,
      published_at: object.published_at || undefined,
      type: 'email-templates' as const,
      metadata: {
        template_name: object.metadata?.template_name || object.title,
        subject_line: object.metadata?.subject_line || '',
        html_content: object.metadata?.html_content || '',
        template_category: object.metadata?.template_category 
          ? formatTemplateCategory(object.metadata.template_category) 
          : undefined,
        preview_image: object.metadata?.preview_image || null,
        template_description: object.metadata?.template_description || null
      }
    } as EmailTemplate
  } catch (error) {
    console.error('Error fetching template:', error)
    return null
  }
}

// Create a new template
export async function createTemplate(templateData: {
  template_name: string
  subject_line: string
  html_content: string
  template_category: string
  template_description: string
}): Promise<EmailTemplate> {
  const { object } = await cosmic.objects.insertOne({
    type: 'email-templates',
    title: templateData.template_name,
    status: 'published',
    metadata: {
      template_name: templateData.template_name,
      subject_line: templateData.subject_line,
      html_content: templateData.html_content,
      template_category: templateData.template_category,
      template_description: templateData.template_description
    }
  })
  
  return {
    id: object.id,
    slug: object.slug,
    title: object.title,
    content: object.content || '',
    bucket: object.bucket || process.env.COSMIC_BUCKET_SLUG || '',
    created_at: object.created_at,
    modified_at: object.modified_at,
    status: object.status,
    published_at: object.published_at || undefined,
    type: 'email-templates' as const,
    metadata: {
      template_name: object.metadata?.template_name || object.title,
      subject_line: object.metadata?.subject_line || '',
      html_content: object.metadata?.html_content || '',
      template_category: object.metadata?.template_category 
        ? formatTemplateCategory(object.metadata.template_category) 
        : undefined,
      preview_image: object.metadata?.preview_image || null,
      template_description: object.metadata?.template_description || null
    }
  } as EmailTemplate
}

// Get all campaigns
export async function getCampaigns(): Promise<Campaign[]> {
  try {
    const { objects } = await cosmic.objects
      .find({ type: 'campaigns' })
      .props(['id', 'slug', 'title', 'status', 'created_at', 'modified_at', 'metadata', 'bucket'])
      .depth(2)
    
    return objects.map((obj: CosmicObject) => ({
      id: obj.id,
      slug: obj.slug,
      title: obj.title,
      content: obj.content || '',
      bucket: obj.bucket || process.env.COSMIC_BUCKET_SLUG || '',
      created_at: obj.created_at,
      modified_at: obj.modified_at,
      status: obj.status,
      published_at: obj.published_at || undefined,
      type: 'campaigns' as const,
      metadata: {
        campaign_name: obj.metadata?.campaign_name || obj.title,
        email_template: obj.metadata?.email_template || {} as EmailTemplate,
        campaign_status: obj.metadata?.campaign_status 
          ? formatCampaignStatus(obj.metadata.campaign_status)
          : formatCampaignStatus('draft'),
        target_tags: obj.metadata?.target_tags || null,
        send_date: obj.metadata?.send_date || undefined,
        campaign_notes: obj.metadata?.campaign_notes || null,
        campaign_stats: obj.metadata?.campaign_stats || undefined
      }
    })) as Campaign[]
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return []
  }
}

// Get campaign by ID
export async function getCampaign(id: string): Promise<Campaign | null> {
  try {
    const { object } = await cosmic.objects
      .findOne({ id, type: 'campaigns' })
      .props(['id', 'slug', 'title', 'status', 'created_at', 'modified_at', 'metadata', 'bucket'])
      .depth(2)
    
    if (!object) return null

    return {
      id: object.id,
      slug: object.slug,
      title: object.title,
      content: object.content || '',
      bucket: object.bucket || process.env.COSMIC_BUCKET_SLUG || '',
      created_at: object.created_at,
      modified_at: object.modified_at,
      status: object.status,
      published_at: object.published_at || undefined,
      type: 'campaigns' as const,
      metadata: {
        campaign_name: object.metadata?.campaign_name || object.title,
        email_template: object.metadata?.email_template || {} as EmailTemplate,
        campaign_status: object.metadata?.campaign_status 
          ? formatCampaignStatus(object.metadata.campaign_status)
          : formatCampaignStatus('draft'),
        target_tags: object.metadata?.target_tags || null,
        send_date: object.metadata?.send_date || undefined,
        campaign_notes: object.metadata?.campaign_notes || null,
        campaign_stats: object.metadata?.campaign_stats || undefined
      }
    } as Campaign
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return null
  }
}

// Create a new campaign
export async function createCampaign(campaignData: {
  campaign_name: string
  subject_line: string
  email_template: string
  recipient_contacts: string[]
  campaign_status: string
  scheduled_date?: string
}): Promise<Campaign> {
  const { object } = await cosmic.objects.insertOne({
    type: 'campaigns',
    title: campaignData.campaign_name,
    status: 'published',
    metadata: {
      campaign_name: campaignData.campaign_name,
      subject_line: campaignData.subject_line,
      email_template: campaignData.email_template,
      recipient_contacts: campaignData.recipient_contacts,
      campaign_status: campaignData.campaign_status,
      scheduled_date: campaignData.scheduled_date || '',
      sent_count: 0,
      open_count: 0,
      click_count: 0
    }
  })
  
  return {
    id: object.id,
    slug: object.slug,
    title: object.title,
    content: object.content || '',
    bucket: object.bucket || process.env.COSMIC_BUCKET_SLUG || '',
    created_at: object.created_at,
    modified_at: object.modified_at,
    status: object.status,
    published_at: object.published_at || undefined,
    type: 'campaigns' as const,
    metadata: {
      campaign_name: object.metadata?.campaign_name || object.title,
      email_template: object.metadata?.email_template || {} as EmailTemplate,
      campaign_status: object.metadata?.campaign_status 
        ? formatCampaignStatus(object.metadata.campaign_status)
        : formatCampaignStatus('draft'),
      target_tags: object.metadata?.target_tags || null,
      send_date: object.metadata?.send_date || undefined,
      campaign_notes: object.metadata?.campaign_notes || null,
      campaign_stats: object.metadata?.campaign_stats || undefined
    }
  } as Campaign
}

// Update campaign
export async function updateCampaign(id: string, updateData: Partial<Campaign['metadata']>): Promise<Campaign> {
  const { object } = await cosmic.objects.updateOne(id, {
    metadata: updateData
  })
  
  return {
    id: object.id,
    slug: object.slug,
    title: object.title,
    content: object.content || '',
    bucket: object.bucket || process.env.COSMIC_BUCKET_SLUG || '',
    created_at: object.created_at,
    modified_at: object.modified_at,
    status: object.status,
    published_at: object.published_at || undefined,
    type: 'campaigns' as const,
    metadata: {
      campaign_name: object.metadata?.campaign_name || object.title,
      email_template: object.metadata?.email_template || {} as EmailTemplate,
      campaign_status: object.metadata?.campaign_status 
        ? formatCampaignStatus(object.metadata.campaign_status)
        : formatCampaignStatus('draft'),
      target_tags: object.metadata?.target_tags || null,
      send_date: object.metadata?.send_date || undefined,
      campaign_notes: object.metadata?.campaign_notes || null,
      campaign_stats: object.metadata?.campaign_stats || undefined
    }
  } as Campaign
}

// Get all contacts
export async function getContacts(): Promise<Contact[]> {
  try {
    const { objects } = await cosmic.objects
      .find({ type: 'contacts' })
      .props(['id', 'slug', 'title', 'status', 'created_at', 'modified_at', 'metadata', 'bucket'])
      .depth(1)
    
    return objects.map((obj: CosmicObject) => ({
      id: obj.id,
      slug: obj.slug,
      title: obj.title,
      content: obj.content || '',
      bucket: obj.bucket || process.env.COSMIC_BUCKET_SLUG || '',
      created_at: obj.created_at,
      modified_at: obj.modified_at,
      status: obj.status,
      published_at: obj.published_at || undefined,
      type: 'contacts' as const,
      metadata: {
        email: obj.metadata?.email || '',
        first_name: obj.metadata?.first_name || undefined,
        last_name: obj.metadata?.last_name || undefined,
        subscription_status: obj.metadata?.subscription_status 
          ? formatSubscriptionStatus(obj.metadata.subscription_status)
          : formatSubscriptionStatus('subscribed'),
        tags: obj.metadata?.tags || null,
        date_subscribed: obj.metadata?.date_subscribed || undefined,
        notes: obj.metadata?.notes || null
      }
    })) as Contact[]
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return []
  }
}

// Create a new contact
export async function createContact(contactData: {
  name: string
  email: string
  tags?: string[]
}): Promise<Contact> {
  const { object } = await cosmic.objects.insertOne({
    type: 'contacts',
    title: contactData.name,
    status: 'published',
    metadata: {
      name: contactData.name,
      email: contactData.email,
      tags: contactData.tags || []
    }
  })
  
  return {
    id: object.id,
    slug: object.slug,
    title: object.title,
    content: object.content || '',
    bucket: object.bucket || process.env.COSMIC_BUCKET_SLUG || '',
    created_at: object.created_at,
    modified_at: object.modified_at,
    status: object.status,
    published_at: object.published_at || undefined,
    type: 'contacts' as const,
    metadata: {
      email: object.metadata?.email || contactData.email,
      first_name: object.metadata?.first_name || undefined,
      last_name: object.metadata?.last_name || undefined,
      subscription_status: object.metadata?.subscription_status 
        ? formatSubscriptionStatus(object.metadata.subscription_status)
        : formatSubscriptionStatus('subscribed'),
      tags: object.metadata?.tags || contactData.tags || null,
      date_subscribed: object.metadata?.date_subscribed || undefined,
      notes: object.metadata?.notes || null
    }
  } as Contact
}