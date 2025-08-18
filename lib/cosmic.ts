import { createBucketClient } from '@cosmicjs/sdk'
import { Contact, Campaign, Template } from '@/types'

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
      id: obj.id,
      title: obj.title,
      slug: obj.slug,
      email: obj.metadata?.email || '',
      first_name: obj.metadata?.first_name || '',
      last_name: obj.metadata?.last_name || '',
      subscription_status: obj.metadata?.subscription_status || 'subscribed',
      date_subscribed: obj.metadata?.date_subscribed || '',
      tags: obj.metadata?.tags || [],
      notes: obj.metadata?.notes || '',
      created_at: obj.created_at
    }))
  } catch (error) {
    console.error('Error fetching contacts:', error)
    throw error
  }
}

export async function createContact(contactData: Partial<Contact>): Promise<Contact> {
  try {
    // Generate a title for the contact object
    const contactName = contactData.first_name || contactData.last_name 
      ? `${contactData.first_name || ''} ${contactData.last_name || ''}`.trim()
      : contactData.email?.split('@')[0] || 'Contact'
    
    const title = `${contactName} (${contactData.email})`
    
    const { object } = await cosmic.objects.insertOne({
      title,
      type: 'contacts',
      status: 'published',
      metadata: {
        email: contactData.email || '',
        first_name: contactData.first_name || '',
        last_name: contactData.last_name || '',
        subscription_status: contactData.subscription_status || 'subscribed',
        date_subscribed: contactData.date_subscribed || new Date().toISOString().split('T')[0],
        tags: contactData.tags || [],
        notes: contactData.notes || ''
      }
    })

    return {
      id: object.id,
      title: object.title,
      slug: object.slug,
      email: object.metadata.email,
      first_name: object.metadata.first_name,
      last_name: object.metadata.last_name,
      subscription_status: object.metadata.subscription_status,
      date_subscribed: object.metadata.date_subscribed,
      tags: object.metadata.tags,
      notes: object.metadata.notes,
      created_at: object.created_at
    }
  } catch (error) {
    console.error('Error creating contact:', error)
    throw error
  }
}

export async function updateContact(id: string, contactData: Partial<Contact>): Promise<Contact> {
  try {
    // Generate a title for the contact object if name or email changed
    let updateData: any = {
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

    // Update title if name or email fields are being updated
    if (contactData.first_name !== undefined || contactData.last_name !== undefined || contactData.email !== undefined) {
      const contactName = contactData.first_name || contactData.last_name 
        ? `${contactData.first_name || ''} ${contactData.last_name || ''}`.trim()
        : contactData.email?.split('@')[0] || 'Contact'
      
      updateData.title = `${contactName} (${contactData.email})`
    }

    const { object } = await cosmic.objects.updateOne(id, updateData)

    return {
      id: object.id,
      title: object.title,
      slug: object.slug,
      email: object.metadata.email,
      first_name: object.metadata.first_name,
      last_name: object.metadata.last_name,
      subscription_status: object.metadata.subscription_status,
      date_subscribed: object.metadata.date_subscribed,
      tags: object.metadata.tags,
      notes: object.metadata.notes,
      created_at: object.created_at
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
    
    return objects.map((obj: any) => ({
      id: obj.id,
      title: obj.title,
      slug: obj.slug,
      subject: obj.metadata?.subject || '',
      content: obj.metadata?.content || '',
      status: obj.metadata?.status || 'draft',
      scheduled_at: obj.metadata?.scheduled_at || null,
      sent_at: obj.metadata?.sent_at || null,
      recipient_count: obj.metadata?.recipient_count || 0,
      open_rate: obj.metadata?.open_rate || 0,
      click_rate: obj.metadata?.click_rate || 0,
      template_id: obj.metadata?.template_id || null,
      created_at: obj.created_at
    }))
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    throw error
  }
}

export async function createCampaign(campaignData: Partial<Campaign>): Promise<Campaign> {
  try {
    const { object } = await cosmic.objects.insertOne({
      title: campaignData.title || 'New Campaign',
      type: 'campaigns',
      status: 'published',
      metadata: {
        subject: campaignData.subject || '',
        content: campaignData.content || '',
        status: campaignData.status || 'draft',
        scheduled_at: campaignData.scheduled_at || null,
        sent_at: campaignData.sent_at || null,
        recipient_count: campaignData.recipient_count || 0,
        open_rate: campaignData.open_rate || 0,
        click_rate: campaignData.click_rate || 0,
        template_id: campaignData.template_id || null
      }
    })

    return {
      id: object.id,
      title: object.title,
      slug: object.slug,
      subject: object.metadata.subject,
      content: object.metadata.content,
      status: object.metadata.status,
      scheduled_at: object.metadata.scheduled_at,
      sent_at: object.metadata.sent_at,
      recipient_count: object.metadata.recipient_count,
      open_rate: object.metadata.open_rate,
      click_rate: object.metadata.click_rate,
      template_id: object.metadata.template_id,
      created_at: object.created_at
    }
  } catch (error) {
    console.error('Error creating campaign:', error)
    throw error
  }
}

export async function updateCampaign(id: string, campaignData: Partial<Campaign>): Promise<Campaign> {
  try {
    const updateData: any = {
      metadata: {
        subject: campaignData.subject,
        content: campaignData.content,
        status: campaignData.status,
        scheduled_at: campaignData.scheduled_at,
        sent_at: campaignData.sent_at,
        recipient_count: campaignData.recipient_count,
        open_rate: campaignData.open_rate,
        click_rate: campaignData.click_rate,
        template_id: campaignData.template_id
      }
    }

    if (campaignData.title) {
      updateData.title = campaignData.title
    }

    const { object } = await cosmic.objects.updateOne(id, updateData)

    return {
      id: object.id,
      title: object.title,
      slug: object.slug,
      subject: object.metadata.subject,
      content: object.metadata.content,
      status: object.metadata.status,
      scheduled_at: object.metadata.scheduled_at,
      sent_at: object.metadata.sent_at,
      recipient_count: object.metadata.recipient_count,
      open_rate: object.metadata.open_rate,
      click_rate: object.metadata.click_rate,
      template_id: object.metadata.template_id,
      created_at: object.created_at
    }
  } catch (error) {
    console.error('Error updating campaign:', error)
    throw error
  }
}

// Template functions
export async function getTemplates(): Promise<Template[]> {
  try {
    const { objects } = await cosmic.objects.find({ type: 'templates' })
      .props(['id', 'title', 'slug', 'metadata', 'created_at'])
      .depth(1)
    
    return objects.map((obj: any) => ({
      id: obj.id,
      title: obj.title,
      slug: obj.slug,
      name: obj.metadata?.name || obj.title,
      subject: obj.metadata?.subject || '',
      content: obj.metadata?.content || '',
      thumbnail: obj.metadata?.thumbnail || null,
      category: obj.metadata?.category || 'general',
      created_at: obj.created_at
    }))
  } catch (error) {
    console.error('Error fetching templates:', error)
    throw error
  }
}

export async function createTemplate(templateData: Partial<Template>): Promise<Template> {
  try {
    const { object } = await cosmic.objects.insertOne({
      title: templateData.title || templateData.name || 'New Template',
      type: 'templates',
      status: 'published',
      metadata: {
        name: templateData.name || templateData.title || 'New Template',
        subject: templateData.subject || '',
        content: templateData.content || '',
        thumbnail: templateData.thumbnail || null,
        category: templateData.category || 'general'
      }
    })

    return {
      id: object.id,
      title: object.title,
      slug: object.slug,
      name: object.metadata.name,
      subject: object.metadata.subject,
      content: object.metadata.content,
      thumbnail: object.metadata.thumbnail,
      category: object.metadata.category,
      created_at: object.created_at
    }
  } catch (error) {
    console.error('Error creating template:', error)
    throw error
  }
}

export async function getTemplate(id: string): Promise<Template | null> {
  try {
    const { object } = await cosmic.objects.findOne({ id })
      .props(['id', 'title', 'slug', 'metadata', 'created_at'])
      .depth(1)

    if (!object) return null

    return {
      id: object.id,
      title: object.title,
      slug: object.slug,
      name: object.metadata?.name || object.title,
      subject: object.metadata?.subject || '',
      content: object.metadata?.content || '',
      thumbnail: object.metadata?.thumbnail || null,
      category: object.metadata?.category || 'general',
      created_at: object.created_at
    }
  } catch (error) {
    console.error('Error fetching template:', error)
    return null
  }
}