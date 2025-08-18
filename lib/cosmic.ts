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

export async function createCampaign(data: CreateCampaignFormData & { title?: string }): Promise<Campaign> {
  // Prepare metafields array with proper structure matching the Cosmic object type definition
  const metafields = [
    {
      title: "Campaign Name",
      key: "campaign_name",
      type: "text",
      required: true,
      id: "90055cd9-a284-4001-a727-38d0311e6b8f",
      value: data.campaign_name
    },
    {
      title: "Email Template",
      key: "email_template", 
      type: "object",
      object_type: "email-templates",
      required: true,
      id: "5e343fc0-cb80-4f3e-b35d-799c278b2cfe",
      value: data.email_template // This should be the template ID
    },
    {
      title: "Campaign Status",
      key: "campaign_status",
      type: "select-dropdown", 
      required: true,
      options: [
        { key: "draft", value: "Draft" },
        { key: "scheduled", value: "Scheduled" },
        { key: "sending", value: "Sending" },
        { key: "sent", value: "Sent" },
        { key: "paused", value: "Paused" }
      ],
      id: "e7f6c3b6-2c9b-4393-937e-15e6101cc032",
      value: { key: "draft", value: "Draft" }
    },
    {
      title: "Target Tags",
      key: "target_tags",
      type: "check-boxes",
      required: false,
      options: [
        { value: "Newsletter" },
        { value: "Promotions" },
        { value: "VIP Customer" },
        { value: "New Subscriber" },
        { value: "Technology" },
        { value: "Marketing" }
      ],
      id: "778a76bb-8b11-45f1-a694-87987c1cb25b",
      value: data.target_tags || []
    },
    {
      title: "Send Date",
      key: "send_date",
      type: "date",
      required: false,
      id: "99168874-31b5-4bcb-8c39-90b9a0161f25", 
      value: data.send_date || ""
    },
    {
      title: "Campaign Notes",
      key: "campaign_notes",
      type: "textarea",
      required: false,
      id: "8b2e52e5-17b8-4f76-89ad-1b53525341f0",
      value: data.campaign_notes || ""
    },
    {
      title: "Campaign Stats",
      key: "campaign_stats",
      type: "json",
      required: false,
      id: "3b3e7473-1bfe-4344-9b00-ff3db6b630c7",
      value: {
        recipients: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        open_rate: 0,
        click_rate: 0
      }
    }
  ]

  const { object } = await cosmicWrite.objects.insertOne({
    title: data.title || data.campaign_name,
    type: 'campaigns',
    metafields: metafields
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