import { createBucketClient } from '@cosmicjs/sdk'
import { Contact, Campaign, EmailTemplate, Template } from '@/types'

// Initialize Cosmic client
const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string
})

// Contact functions
export async function getContacts(): Promise<Contact[]> {
  try {
    const { objects } = await cosmic.objects.find({ type: 'contacts' })
      .props(['id', 'title', 'slug', 'metadata', 'created_at'])
      .depth(1)
    
    return objects.map((obj: any) => ({
      ...obj,
      metadata: {
        email: obj.metadata?.email || '',
        first_name: obj.metadata?.first_name || '',
        last_name: obj.metadata?.last_name || '',
        subscription_status: obj.metadata?.subscription_status || { key: 'subscribed', value: 'Subscribed' },
        date_subscribed: obj.metadata?.date_subscribed || '',
        tags: obj.metadata?.tags || null,
        notes: obj.metadata?.notes || null
      }
    }))
  } catch (error) {
    console.error('Error fetching contacts:', error)
    throw error
  }
}

export async function createContact(contactData: {
  title: string;
  email: string;
  first_name?: string;
  last_name?: string;
  subscription_status?: string;
  date_subscribed?: string;
  tags?: string[];
  notes?: string;
}): Promise<Contact> {
  try {
    const { object } = await cosmic.objects.insertOne({
      title: contactData.title,
      type: 'contacts',
      status: 'published',
      metadata: {
        email: contactData.email,
        first_name: contactData.first_name || '',
        last_name: contactData.last_name || '',
        subscription_status: contactData.subscription_status || 'subscribed',
        date_subscribed: contactData.date_subscribed || new Date().toISOString().split('T')[0],
        tags: contactData.tags || null,
        notes: contactData.notes || null
      }
    })

    return {
      ...object,
      metadata: {
        email: object.metadata.email,
        first_name: object.metadata.first_name,
        last_name: object.metadata.last_name,
        subscription_status: object.metadata.subscription_status,
        date_subscribed: object.metadata.date_subscribed,
        tags: object.metadata.tags,
        notes: object.metadata.notes
      }
    }
  } catch (error) {
    console.error('Error creating contact:', error)
    throw error
  }
}

export async function updateContact(id: string, contactData: {
  title?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  subscription_status?: string;
  date_subscribed?: string;
  tags?: string[];
  notes?: string;
}): Promise<Contact> {
  try {
    const updateData: any = {
      metadata: {
        email: contactData.email,
        first_name: contactData.first_name,
        last_name: contactData.last_name,
        subscription_status: contactData.subscription_status,
        date_subscribed: contactData.date_subscribed,
        tags: contactData.tags,
        notes: contactData.notes
      }
    }

    if (contactData.title) {
      updateData.title = contactData.title
    }

    const { object } = await cosmic.objects.updateOne(id, updateData)

    return {
      ...object,
      metadata: {
        email: object.metadata.email,
        first_name: object.metadata.first_name,
        last_name: object.metadata.last_name,
        subscription_status: object.metadata.subscription_status,
        date_subscribed: object.metadata.date_subscribed,
        tags: object.metadata.tags,
        notes: object.metadata.notes
      }
    }
  } catch (error) {
    console.error('Error updating contact:', error)
    throw error
  }
}

export async function deleteContact(id: string): Promise<void> {
  try {
    await cosmic.objects.deleteOne(id)
  } catch (error) {
    console.error('Error deleting contact:', error)
    throw error
  }
}

// Campaign functions
export async function getCampaigns(): Promise<Campaign[]> {
  try {
    const { objects } = await cosmic.objects.find({ type: 'campaigns' })
      .props(['id', 'title', 'slug', 'metadata', 'created_at'])
      .depth(1)
    
    return objects
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    throw error
  }
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  try {
    const { object } = await cosmic.objects.findOne({ id })
      .props(['id', 'title', 'slug', 'metadata', 'created_at'])
      .depth(1)

    return object || null
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return null
  }
}

export async function createCampaign(campaignData: {
  title: string;
  campaign_name: string;
  email_template: string;
  campaign_status: string;
  target_tags?: string[];
  send_date?: string;
  campaign_notes?: string;
}): Promise<Campaign> {
  try {
    const { object } = await cosmic.objects.insertOne({
      title: campaignData.title,
      type: 'campaigns',
      status: 'published',
      metadata: {
        campaign_name: campaignData.campaign_name,
        email_template: campaignData.email_template,
        campaign_status: campaignData.campaign_status,
        target_tags: campaignData.target_tags || null,
        send_date: campaignData.send_date || '',
        campaign_notes: campaignData.campaign_notes || null,
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
  } catch (error) {
    console.error('Error creating campaign:', error)
    throw error
  }
}

export async function updateCampaign(id: string, campaignData: {
  title?: string;
  campaign_name?: string;
  email_template?: string;
  campaign_status?: string;
  target_tags?: string[];
  send_date?: string;
  campaign_notes?: string;
}): Promise<Campaign> {
  try {
    const updateData: any = {
      metadata: {
        campaign_name: campaignData.campaign_name,
        email_template: campaignData.email_template,
        campaign_status: campaignData.campaign_status,
        target_tags: campaignData.target_tags,
        send_date: campaignData.send_date,
        campaign_notes: campaignData.campaign_notes
      }
    }

    if (campaignData.title) {
      updateData.title = campaignData.title
    }

    const { object } = await cosmic.objects.updateOne(id, updateData)

    return object
  } catch (error) {
    console.error('Error updating campaign:', error)
    throw error
  }
}

// Template functions
export async function getTemplates(): Promise<EmailTemplate[]> {
  try {
    const { objects } = await cosmic.objects.find({ type: 'email-templates' })
      .props(['id', 'title', 'slug', 'metadata', 'created_at'])
      .depth(1)
    
    return objects
  } catch (error) {
    console.error('Error fetching templates:', error)
    throw error
  }
}

export async function createTemplate(templateData: {
  title: string;
  template_name: string;
  subject_line: string;
  html_content: string;
  template_category?: string;
  template_description?: string;
}): Promise<EmailTemplate> {
  try {
    const { object } = await cosmic.objects.insertOne({
      title: templateData.title,
      type: 'email-templates',
      status: 'published',
      metadata: {
        template_name: templateData.template_name,
        subject_line: templateData.subject_line,
        html_content: templateData.html_content,
        template_category: templateData.template_category || null,
        preview_image: null,
        template_description: templateData.template_description || null
      }
    })

    return object
  } catch (error) {
    console.error('Error creating template:', error)
    throw error
  }
}

export async function getTemplate(id: string): Promise<EmailTemplate | null> {
  try {
    const { object } = await cosmic.objects.findOne({ id })
      .props(['id', 'title', 'slug', 'metadata', 'created_at'])
      .depth(1)

    return object || null
  } catch (error) {
    console.error('Error fetching template:', error)
    return null
  }
}