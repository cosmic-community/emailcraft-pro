import { createBucketClient } from '@cosmicjs/sdk'

const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG!,
  readKey: process.env.COSMIC_READ_KEY!,
  writeKey: process.env.COSMIC_WRITE_KEY!,
})

// Template interface
export interface Template {
  id: string
  slug: string
  title: string
  status: string
  created_at: string
  modified_at: string
  metadata: {
    template_name: string
    subject_line: string
    html_content: string
    template_category: string
    template_description: string
  }
}

// Campaign interface
export interface Campaign {
  id: string
  slug: string
  title: string
  status: string
  created_at: string
  modified_at: string
  metadata: {
    campaign_name: string
    subject_line: string
    email_template: {
      id: string
      slug: string
      title: string
      metadata: {
        html_content: string
      }
    }
    recipient_contacts: Array<{
      id: string
      slug: string
      title: string
      metadata: {
        email: string
        name: string
      }
    }>
    campaign_status: string
    scheduled_date?: string
    sent_count: number
    open_count: number
    click_count: number
  }
}

// Contact interface
export interface Contact {
  id: string
  slug: string
  title: string
  status: string
  created_at: string
  modified_at: string
  metadata: {
    name: string
    email: string
    tags?: string[]
  }
}

// Get all templates
export async function getTemplates(): Promise<Template[]> {
  try {
    const { objects } = await cosmic.objects
      .find({ type: 'email-templates' })
      .props(['id', 'slug', 'title', 'status', 'created_at', 'modified_at', 'metadata'])
      .depth(1)
    
    return objects as Template[]
  } catch (error) {
    console.error('Error fetching templates:', error)
    return []
  }
}

// Get template by ID
export async function getTemplate(id: string): Promise<Template | null> {
  try {
    const { object } = await cosmic.objects
      .findOne({ id, type: 'email-templates' })
      .props(['id', 'slug', 'title', 'status', 'created_at', 'modified_at', 'metadata'])
      .depth(1)
    
    return object as Template
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
}): Promise<Template> {
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
  
  return object as Template
}

// Get all campaigns
export async function getCampaigns(): Promise<Campaign[]> {
  try {
    const { objects } = await cosmic.objects
      .find({ type: 'email-campaigns' })
      .props(['id', 'slug', 'title', 'status', 'created_at', 'modified_at', 'metadata'])
      .depth(2)
    
    return objects as Campaign[]
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return []
  }
}

// Get campaign by ID
export async function getCampaign(id: string): Promise<Campaign | null> {
  try {
    const { object } = await cosmic.objects
      .findOne({ id, type: 'email-campaigns' })
      .props(['id', 'slug', 'title', 'status', 'created_at', 'modified_at', 'metadata'])
      .depth(2)
    
    return object as Campaign
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
    type: 'email-campaigns',
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
  
  return object as Campaign
}

// Update campaign
export async function updateCampaign(id: string, updateData: Partial<Campaign['metadata']>): Promise<Campaign> {
  const { object } = await cosmic.objects.updateOne(id, {
    metadata: updateData
  })
  
  return object as Campaign
}

// Get all contacts
export async function getContacts(): Promise<Contact[]> {
  try {
    const { objects } = await cosmic.objects
      .find({ type: 'email-contacts' })
      .props(['id', 'slug', 'title', 'status', 'created_at', 'modified_at', 'metadata'])
      .depth(1)
    
    return objects as Contact[]
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
    type: 'email-contacts',
    title: contactData.name,
    status: 'published',
    metadata: {
      name: contactData.name,
      email: contactData.email,
      tags: contactData.tags || []
    }
  })
  
  return object as Contact
}