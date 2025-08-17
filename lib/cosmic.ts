import { createBucketClient } from '@cosmicjs/sdk'
import { Contact, EmailTemplate, Campaign } from '@/types'

export const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
  apiEnvironment: 'staging'
})

// Helper function for error handling
function hasStatus(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error;
}

// Contact functions
export async function getContacts(): Promise<Contact[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'contacts' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1);
    
    return response.objects as Contact[];
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch contacts');
  }
}

export async function getContact(slug: string): Promise<Contact | null> {
  try {
    const response = await cosmic.objects.findOne({
      type: 'contacts',
      slug
    }).depth(1);
    
    return response.object as Contact;
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch contact');
  }
}

// Email Template functions
export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'email-templates' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1);
    
    return response.objects as EmailTemplate[];
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch email templates');
  }
}

export async function getEmailTemplate(slug: string): Promise<EmailTemplate | null> {
  try {
    const response = await cosmic.objects.findOne({
      type: 'email-templates',
      slug
    }).depth(1);
    
    return response.object as EmailTemplate;
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch email template');
  }
}

// Campaign functions
export async function getCampaigns(): Promise<Campaign[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'campaigns' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1);
    
    return response.objects as Campaign[];
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch campaigns');
  }
}

export async function getCampaign(slug: string): Promise<Campaign | null> {
  try {
    const response = await cosmic.objects.findOne({
      type: 'campaigns',
      slug
    }).depth(1);
    
    return response.object as Campaign;
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch campaign');
  }
}

// Create functions
export async function createContact(data: any): Promise<Contact> {
  try {
    const response = await cosmic.objects.insertOne({
      type: 'contacts',
      title: data.email,
      metadata: {
        email: data.email,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        subscription_status: data.subscription_status || 'pending',
        tags: data.tags || [],
        date_subscribed: data.date_subscribed || new Date().toISOString().split('T')[0],
        notes: data.notes || ''
      }
    });
    
    return response.object as Contact;
  } catch (error) {
    console.error('Error creating contact:', error);
    throw new Error('Failed to create contact');
  }
}

export async function createEmailTemplate(data: any): Promise<EmailTemplate> {
  try {
    const response = await cosmic.objects.insertOne({
      type: 'email-templates',
      title: data.template_name,
      metadata: {
        template_name: data.template_name,
        subject_line: data.subject_line,
        html_content: data.html_content,
        template_category: data.template_category || '',
        template_description: data.template_description || ''
      }
    });
    
    return response.object as EmailTemplate;
  } catch (error) {
    console.error('Error creating template:', error);
    throw new Error('Failed to create email template');
  }
}

export async function createCampaign(data: any): Promise<Campaign> {
  try {
    const response = await cosmic.objects.insertOne({
      type: 'campaigns',
      title: data.campaign_name,
      metadata: {
        campaign_name: data.campaign_name,
        email_template: data.email_template,
        campaign_status: data.campaign_status || 'draft',
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
    });
    
    return response.object as Campaign;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw new Error('Failed to create campaign');
  }
}