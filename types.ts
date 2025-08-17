// Base Cosmic object interface
export interface CosmicObject {
  id: string;
  slug: string;
  title: string;
  content?: string;
  metadata: Record<string, any>;
  type: string;
  created_at: string;
  modified_at: string;
}

// Contact object type
export interface Contact extends CosmicObject {
  type: 'contacts';
  metadata: {
    email: string;
    first_name?: string;
    last_name?: string;
    subscription_status: {
      key: SubscriptionStatus;
      value: string;
    };
    tags?: string[];
    date_subscribed?: string;
    notes?: string;
  };
}

// Email Template object type
export interface EmailTemplate extends CosmicObject {
  type: 'email-templates';
  metadata: {
    template_name: string;
    subject_line: string;
    html_content: string;
    template_category?: {
      key: TemplateCategory;
      value: string;
    };
    preview_image?: {
      url: string;
      imgix_url: string;
    };
    template_description?: string;
  };
}

// Campaign object type
export interface Campaign extends CosmicObject {
  type: 'campaigns';
  metadata: {
    campaign_name: string;
    email_template: EmailTemplate;
    campaign_status: {
      key: CampaignStatus;
      value: string;
    };
    target_tags?: string[];
    send_date?: string;
    campaign_notes?: string;
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

// Type literals for select-dropdown values
export type SubscriptionStatus = 'subscribed' | 'unsubscribed' | 'pending';
export type TemplateCategory = 'newsletter' | 'promotion' | 'welcome' | 'transactional' | 'announcement';
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';

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
  subscription_status: SubscriptionStatus;
  tags?: string[];
  date_subscribed?: string;
  notes?: string;
}

export interface CreateTemplateFormData {
  title: string;
  template_name: string;
  subject_line: string;
  html_content: string;
  template_category?: TemplateCategory;
  template_description?: string;
}

export interface CreateCampaignFormData {
  title: string;
  campaign_name: string;
  email_template: string; // template ID
  campaign_status: CampaignStatus;
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