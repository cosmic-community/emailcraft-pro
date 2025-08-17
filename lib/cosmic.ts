import { createBucketClient } from '@cosmicjs/sdk'
import { 
  Contact, 
  EmailTemplate, 
  Campaign, 
  CreateContactFormData, 
  CreateTemplateFormData, 
  CreateCampaignFormData,
  CosmicResponse 
} from '@/types'

// Initialize Cosmic SDK
const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
})

// Contacts
export async function getContacts(): Promise<Contact[]> {
  try {
    const { objects } = await cosmic.objects
      .find({ type: 'contacts' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
    
    return objects as Contact[]
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return []
  }
}

export async function createContact(data: CreateContactFormData): Promise<Contact> {
  const { title, subscription_status, ...metadataFields } = data
  
  const object = await cosmic.objects.insertOne({
    title,
    type: 'contacts',
    metadata: {
      ...metadataFields,
      subscription_status: {
        key: subscription_status,
        value: getSubscriptionStatusLabel(subscription_status)
      }
    }
  })
  
  return object as Contact
}

// Email Templates
export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  try {
    const { objects } = await cosmic.objects
      .find({ type: 'email-templates' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
    
    return objects as EmailTemplate[]
  } catch (error) {
    console.error('Error fetching email templates:', error)
    return []
  }
}

export async function createEmailTemplate(data: CreateTemplateFormData): Promise<EmailTemplate> {
  const { title, template_category, ...metadataFields } = data
  
  const metadata: any = { ...metadataFields }
  
  if (template_category) {
    metadata.template_category = {
      key: template_category,
      value: getTemplateCategoryLabel(template_category)
    }
  }
  
  const object = await cosmic.objects.insertOne({
    title,
    type: 'email-templates',
    metadata
  })
  
  return object as EmailTemplate
}

// Campaigns
export async function getCampaigns(): Promise<Campaign[]> {
  try {
    const { objects } = await cosmic.objects
      .find({ type: 'campaigns' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
    
    return objects as Campaign[]
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return []
  }
}

export async function createCampaign(data: CreateCampaignFormData): Promise<Campaign> {
  const { title, campaign_status, email_template, target_tags, ...metadataFields } = data
  
  const metadata: any = {
    ...metadataFields,
    campaign_status: {
      key: campaign_status,
      value: getCampaignStatusLabel(campaign_status)
    },
    email_template: email_template, // This should be the template ID
    campaign_stats: {
      recipients: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      open_rate: 0,
      click_rate: 0
    }
  }
  
  // Only include target_tags if it has values
  if (target_tags && target_tags.length > 0) {
    metadata.target_tags = target_tags
  }
  
  const object = await cosmic.objects.insertOne({
    title,
    type: 'campaigns',
    metadata
  })
  
  return object as Campaign
}

export async function updateCampaign(id: string, data: Partial<CreateCampaignFormData>): Promise<Campaign> {
  const { campaign_status, email_template, target_tags, ...metadataFields } = data
  
  const metadata: any = { ...metadataFields }
  
  if (campaign_status) {
    metadata.campaign_status = {
      key: campaign_status,
      value: getCampaignStatusLabel(campaign_status)
    }
  }
  
  if (email_template) {
    metadata.email_template = email_template
  }
  
  if (target_tags !== undefined) {
    metadata.target_tags = target_tags.length > 0 ? target_tags : null
  }
  
  const object = await cosmic.objects.updateOne(id, { metadata })
  
  return object as Campaign
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  try {
    const { object } = await cosmic.objects
      .findOne({ id })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
    
    return object as Campaign
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return null
  }
}

// Helper functions for label mapping
function getSubscriptionStatusLabel(key: string): string {
  const labels = {
    'subscribed': 'Subscribed',
    'unsubscribed': 'Unsubscribed',
    'pending': 'Pending Confirmation'
  }
  return labels[key as keyof typeof labels] || key
}

function getTemplateCategoryLabel(key: string): string {
  const labels = {
    'newsletter': 'Newsletter',
    'promotion': 'Promotional',
    'welcome': 'Welcome Series',
    'transactional': 'Transactional',
    'announcement': 'Announcement'
  }
  return labels[key as keyof typeof labels] || key
}

function getCampaignStatusLabel(key: string): string {
  const labels = {
    'draft': 'Draft',
    'scheduled': 'Scheduled',
    'sending': 'Sending',
    'sent': 'Sent',
    'paused': 'Paused'
  }
  return labels[key as keyof typeof labels] || key
}