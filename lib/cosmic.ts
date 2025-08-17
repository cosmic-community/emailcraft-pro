import { createBucketClient } from '@cosmicjs/sdk'

// Create bucket client for read operations
export const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
})

// Create bucket client for write operations (server-side only)
export const cosmicWrite = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
})

// Campaign functions
export async function getCampaigns() {
  try {
    const { objects } = await cosmic.objects
      .find({ type: 'campaigns' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
    return objects
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    throw error
  }
}

export async function getCampaignById(id: string) {
  try {
    const { object } = await cosmic.objects
      .findOne({ type: 'campaigns', id })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
    return object
  } catch (error) {
    console.error('Error fetching campaign:', error)
    throw error
  }
}

export async function createCampaign(data: any) {
  try {
    const { object } = await cosmicWrite.objects.insertOne({
      title: data.campaign_name, // Use campaign_name as the title
      type: 'campaigns',
      status: 'published',
      metadata: {
        campaign_name: data.campaign_name,
        email_template: data.email_template,
        campaign_status: data.campaign_status || 'draft',
        target_tags: data.target_tags || [],
        send_date: data.send_date || '',
        campaign_notes: data.campaign_notes || '',
        campaign_stats: data.campaign_stats || {
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

export async function updateCampaign(id: string, data: any) {
  try {
    const { object } = await cosmicWrite.objects.updateOne(id, {
      title: data.campaign_name, // Update title if campaign_name changes
      metadata: {
        campaign_name: data.campaign_name,
        email_template: data.email_template,
        campaign_status: data.campaign_status,
        target_tags: data.target_tags,
        send_date: data.send_date,
        campaign_notes: data.campaign_notes,
        campaign_stats: data.campaign_stats
      }
    })
    return object
  } catch (error) {
    console.error('Error updating campaign:', error)
    throw error
  }
}

export async function deleteCampaign(id: string) {
  try {
    await cosmicWrite.objects.deleteOne(id)
    return { success: true }
  } catch (error) {
    console.error('Error deleting campaign:', error)
    throw error
  }
}

// Template functions - keeping getEmailTemplates name for consistency
export async function getEmailTemplates() {
  try {
    const { objects } = await cosmic.objects
      .find({ type: 'email-templates' })
      .props(['id', 'title', 'slug', 'metadata'])
    return objects
  } catch (error) {
    console.error('Error fetching templates:', error)
    throw error
  }
}

// Also export as getTemplates for backward compatibility
export const getTemplates = getEmailTemplates

export async function getTemplateById(id: string) {
  try {
    const { object } = await cosmic.objects
      .findOne({ type: 'email-templates', id })
      .props(['id', 'title', 'slug', 'metadata'])
    return object
  } catch (error) {
    console.error('Error fetching template:', error)
    throw error
  }
}

export async function createTemplate(data: any) {
  try {
    const { object } = await cosmicWrite.objects.insertOne({
      title: data.template_name, // Use template_name as the title
      type: 'email-templates',
      status: 'published',
      metadata: {
        template_name: data.template_name,
        subject_line: data.subject_line,
        html_content: data.html_content,
        template_category: data.template_category || '',
        template_description: data.template_description || ''
      }
    })
    return object
  } catch (error) {
    console.error('Error creating template:', error)
    throw error
  }
}

export async function updateTemplate(id: string, data: any) {
  try {
    const { object } = await cosmicWrite.objects.updateOne(id, {
      title: data.template_name, // Update title if template_name changes
      metadata: {
        template_name: data.template_name,
        subject_line: data.subject_line,
        html_content: data.html_content,
        template_category: data.template_category,
        template_description: data.template_description
      }
    })
    return object
  } catch (error) {
    console.error('Error updating template:', error)
    throw error
  }
}

export async function deleteTemplate(id: string) {
  try {
    await cosmicWrite.objects.deleteOne(id)
    return { success: true }
  } catch (error) {
    console.error('Error deleting template:', error)
    throw error
  }
}

// Contact functions
export async function getContacts() {
  try {
    const { objects } = await cosmic.objects
      .find({ type: 'contacts' })
      .props(['id', 'title', 'slug', 'metadata'])
    return objects
  } catch (error) {
    console.error('Error fetching contacts:', error)
    throw error
  }
}

export async function getContactById(id: string) {
  try {
    const { object } = await cosmic.objects
      .findOne({ type: 'contacts', id })
      .props(['id', 'title', 'slug', 'metadata'])
    return object
  } catch (error) {
    console.error('Error fetching contact:', error)
    throw error
  }
}

export async function createContact(data: any) {
  try {
    const { object } = await cosmicWrite.objects.insertOne({
      title: data.email, // Use email as the title
      type: 'contacts',
      status: 'published',
      metadata: {
        email: data.email,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        subscription_status: data.subscription_status || 'subscribed',
        tags: data.tags || [],
        date_subscribed: data.date_subscribed || new Date().toISOString().split('T')[0],
        notes: data.notes || ''
      }
    })
    return object
  } catch (error) {
    console.error('Error creating contact:', error)
    throw error
  }
}

export async function updateContact(id: string, data: any) {
  try {
    const { object } = await cosmicWrite.objects.updateOne(id, {
      title: data.email, // Update title if email changes
      metadata: {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        subscription_status: data.subscription_status,
        tags: data.tags,
        date_subscribed: data.date_subscribed,
        notes: data.notes
      }
    })
    return object
  } catch (error) {
    console.error('Error updating contact:', error)
    throw error
  }
}

export async function deleteContact(id: string) {
  try {
    await cosmicWrite.objects.deleteOne(id)
    return { success: true }
  } catch (error) {
    console.error('Error deleting contact:', error)
    throw error
  }
}