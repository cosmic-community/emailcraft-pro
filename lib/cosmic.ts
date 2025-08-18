import { createBucketClient } from '@cosmicjs/sdk'
import { 
  Campaign, 
  EmailTemplate, 
  Contact, 
  CreateCampaignFormData,
  CreateTemplateFormData,
  CreateContactFormData
} from '@/types'

// Initialize Cosmic client for read operations (client-side safe)
const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  apiEnvironment: "staging"
})

// Initialize Cosmic client for write operations (server-side only)
const cosmicWrite = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
  apiEnvironment: "staging"
})

// Campaign stats type
export interface CampaignStats {
  recipients: number;
  delivered: number;
  opened: number;
  clicked: number;
  open_rate: number;
  click_rate: number;
}

// Campaigns
export async function getCampaigns(): Promise<Campaign[]> {
  try {
    const { objects } = await cosmic.objects
      .find({ type: 'campaigns' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)

    return objects
  } catch (error) {
    if ((error as any).status === 404) {
      return []
    }
    throw error
  }
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  try {
    const { object } = await cosmic.objects
      .findOne({ id, type: 'campaigns' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)

    return object
  } catch (error) {
    if ((error as any).status === 404) {
      return null
    }
    throw error
  }
}

export async function createCampaign(data: CreateCampaignFormData): Promise<Campaign> {
  const { object } = await cosmicWrite.objects.insertOne({
    title: data.campaign_name,
    type: 'campaigns',
    metadata: {
      campaign_name: data.campaign_name,
      email_template: data.email_template,
      campaign_status: { key: 'draft', value: 'Draft' },
      target_tags: data.target_tags || null,
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

  return object
}

export async function updateCampaign(id: string, data: Partial<CreateCampaignFormData>): Promise<Campaign> {
  const updateData: any = {}

  if (data.campaign_name) {
    updateData.title = data.campaign_name
    updateData.metadata = { campaign_name: data.campaign_name }
  }

  if (data.email_template) {
    updateData.metadata = { ...updateData.metadata, email_template: data.email_template }
  }

  if (data.campaign_status) {
    updateData.metadata = { ...updateData.metadata, campaign_status: data.campaign_status }
  }

  if (data.target_tags !== undefined) {
    updateData.metadata = { ...updateData.metadata, target_tags: data.target_tags }
  }

  if (data.send_date !== undefined) {
    updateData.metadata = { ...updateData.metadata, send_date: data.send_date }
  }

  if (data.campaign_notes !== undefined) {
    updateData.metadata = { ...updateData.metadata, campaign_notes: data.campaign_notes }
  }

  const { object } = await cosmicWrite.objects.updateOne(id, updateData)
  return object
}

export async function updateCampaignStats(id: string, stats: CampaignStats): Promise<Campaign> {
  const { object } = await cosmicWrite.objects.updateOne(id, {
    metadata: {
      campaign_stats: stats
    }
  })
  return object
}

// Email Templates
export async function getTemplates(): Promise<EmailTemplate[]> {
  try {
    const { objects } = await cosmic.objects
      .find({ type: 'email-templates' })
      .props(['id', 'title', 'slug', 'metadata', 'thumbnail'])

    return objects
  } catch (error) {
    if ((error as any).status === 404) {
      return []
    }
    throw error
  }
}

export async function getTemplate(id: string): Promise<EmailTemplate | null> {
  try {
    const { object } = await cosmic.objects
      .findOne({ id, type: 'email-templates' })
      .props(['id', 'title', 'slug', 'metadata', 'thumbnail'])

    return object
  } catch (error) {
    if ((error as any).status === 404) {
      return null
    }
    throw error
  }
}

export async function createTemplate(data: CreateTemplateFormData): Promise<EmailTemplate> {
  const { object } = await cosmicWrite.objects.insertOne({
    title: data.template_name,
    type: 'email-templates',
    metadata: {
      template_name: data.template_name,
      subject_line: data.subject_line,
      html_content: data.html_content,
      template_category: data.template_category ? { key: '', value: data.template_category } : { key: '', value: '' },
      preview_image: null,
      template_description: data.template_description || ''
    }
  })

  return object
}

// Contacts
export async function getContacts(): Promise<Contact[]> {
  try {
    const { objects } = await cosmic.objects
      .find({ type: 'contacts' })
      .props(['id', 'title', 'slug', 'metadata'])

    return objects
  } catch (error) {
    if ((error as any).status === 404) {
      return []
    }
    throw error
  }
}

export async function createContact(data: CreateContactFormData): Promise<Contact> {
  const { object } = await cosmicWrite.objects.insertOne({
    title: data.email, // Set title to email address as required by Cosmic
    type: 'contacts',
    metadata: {
      email: data.email,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      subscription_status: { 
        key: data.subscription_status, 
        value: data.subscription_status === 'subscribed' ? 'Subscribed' 
             : data.subscription_status === 'unsubscribed' ? 'Unsubscribed'
             : 'Pending Confirmation'
      },
      tags: data.tags || null,
      date_subscribed: data.date_subscribed || '',
      notes: data.notes || ''
    }
  })

  return object
}

export async function getContactsByTags(tags: string[]): Promise<Contact[]> {
  if (tags.length === 0) {
    return getContacts()
  }

  try {
    const { objects } = await cosmic.objects
      .find({ 
        type: 'contacts',
        'metadata.subscription_status.key': 'subscribed'
      })
      .props(['id', 'title', 'slug', 'metadata'])

    // Filter contacts that have at least one of the specified tags
    const filteredContacts = objects.filter((contact: Contact) => {
      if (!contact.metadata.tags || contact.metadata.tags.length === 0) {
        return false
      }
      return tags.some(tag => contact.metadata.tags!.includes(tag))
    })

    return filteredContacts
  } catch (error) {
    if ((error as any).status === 404) {
      return []
    }
    throw error
  }
}