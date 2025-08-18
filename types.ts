// Base Cosmic object interface
export interface CosmicObject {
  id: string;
  slug: string;
  title: string;
  content?: string;
  bucket: string;
  created_at: string;
  modified_at: string;
  status: string;
  published_at?: string;
  type: string;
  metadata: Record<string, any>;
}

// Contact object type based on actual Cosmic CMS structure
export interface Contact extends CosmicObject {
  type: 'contacts';
  metadata: {
    email: string;
    first_name?: string;
    last_name?: string;
    subscription_status: {
      key: SubscriptionStatusKey;
      value: SubscriptionStatusValue;
    };
    tags?: string[] | null;
    date_subscribed?: string;
    notes?: string | null;
  };
}

// Email Template object type based on actual Cosmic CMS structure
export interface EmailTemplate extends CosmicObject {
  type: 'email-templates';
  metadata: {
    template_name: string;
    subject_line: string;
    html_content: string;
    template_category?: {
      key: TemplateCategoryKey;
      value: TemplateCategoryValue;
    };
    preview_image?: {
      url: string;
      imgix_url: string;
    } | null;
    template_description?: string | null;
  };
}

// Campaign object type based on actual Cosmic CMS structure
export interface Campaign extends CosmicObject {
  type: 'campaigns';
  metadata: {
    campaign_name: string;
    email_template: EmailTemplate;
    campaign_status: {
      key: CampaignStatusKey;
      value: CampaignStatusValue;
    } | CampaignStatusValue; // Allow both formats for backward compatibility
    target_tags?: string[] | null;
    send_date?: string;
    campaign_notes?: string | null;
    campaign_stats?: {
      recipients: number;
      delivered: number;
      opened: number;
      clicked: number;
      open_rate: number;
      click_rate: number;
    };
  };
}

// Template type for compatibility
export interface Template extends CosmicObject {
  type: 'email-templates';
  metadata: {
    template_name: string;
    subject_line: string;
    html_content: string;
    template_category?: {
      key: TemplateCategoryKey;
      value: TemplateCategoryValue;
    };
    preview_image?: {
      url: string;
      imgix_url: string;
    } | null;
    template_description?: string | null;
  };
}

// Type literals for select-dropdown keys and values
export type SubscriptionStatusKey = 'subscribed' | 'unsubscribed' | 'pending';
export type SubscriptionStatusValue = 'Subscribed' | 'Unsubscribed' | 'Pending Confirmation';

export type TemplateCategoryKey = 'newsletter' | 'promotion' | 'welcome' | 'transactional' | 'announcement';
export type TemplateCategoryValue = 'Newsletter' | 'Promotional' | 'Welcome Series' | 'Transactional' | 'Announcement';

export type CampaignStatusKey = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
export type CampaignStatusValue = 'Draft' | 'Scheduled' | 'Sending' | 'Sent' | 'Paused';

// API response types
export interface CosmicResponse<T> {
  objects: T[];
  total: number;
  limit?: number;
  skip?: number;
}

// Form data interfaces
export interface CreateContactFormData {
  title: string;
  email: string;
  first_name?: string;
  last_name?: string;
  subscription_status: SubscriptionStatusKey;
  tags?: string[];
  date_subscribed?: string;
  notes?: string;
}

export interface CreateTemplateFormData {
  title: string;
  template_name: string;
  subject_line: string;
  html_content: string;
  template_category?: TemplateCategoryKey;
  template_description?: string;
}

export interface CreateCampaignFormData {
  title: string;
  campaign_name: string;
  email_template: string; // template ID
  campaign_status: CampaignStatusValue;
  target_tags?: string[];
  send_date?: string;
  campaign_notes?: string;
}

// Type guards
export function isContact(obj: CosmicObject): obj is Contact {
  return obj.type === 'contacts';
}

export function isEmailTemplate(obj: CosmicObject): obj is EmailTemplate {
  return obj.type === 'email-templates';
}

export function isCampaign(obj: CosmicObject): obj is Campaign {
  return obj.type === 'campaigns';
}

// AI-related types
export interface AIGenerateTextResponse {
  text: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

// Utility functions for status conversion
export function getStatusValue(status: { key: CampaignStatusKey; value: CampaignStatusValue } | CampaignStatusValue): CampaignStatusValue {
  if (typeof status === 'string') {
    return status;
  }
  return status.value;
}

export function getStatusKey(status: { key: CampaignStatusKey; value: CampaignStatusValue } | CampaignStatusValue): CampaignStatusKey {
  if (typeof status === 'string') {
    // Convert value back to key
    const statusMap: Record<CampaignStatusValue, CampaignStatusKey> = {
      'Draft': 'draft',
      'Scheduled': 'scheduled',
      'Sending': 'sending',
      'Sent': 'sent',
      'Paused': 'paused'
    };
    return statusMap[status] || 'draft';
  }
  return status.key;
}