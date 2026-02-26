// Email Templates Index - Central export file
// All email templates defined as frontend components (NOT stored in database)

import { EmailTemplateConfig, EmailPlaceholderData, replacePlaceholders } from './types';
import { introductionTemplates } from './introduction';
import { demoTemplates } from './demo';
import { presentationTemplates } from './presentation';
import { proposalTemplates } from './proposal';
import { agreementTemplates } from './agreement';
import { requirementTemplates } from './requirement';
import { implementationTemplates } from './implementation';

// Re-export types
export * from './types';
export * from './shared';

// ============================================================================
// ALL EMAIL TEMPLATES REGISTRY
// ============================================================================

export const allEmailTemplates: EmailTemplateConfig[] = [
  ...introductionTemplates,
  ...demoTemplates,
  ...presentationTemplates,
  ...proposalTemplates,
  ...agreementTemplates,
  ...requirementTemplates,
  ...implementationTemplates,
];

// Debug: Log available planning templates on module load
if (typeof window !== 'undefined') {
  console.log('Email Templates Loaded - Planning templates:', allEmailTemplates.filter(t => t.tab === 'planning').map(t => ({ id: t.id, name: t.name })));
}

// ============================================================================
// TEMPLATE LOOKUP FUNCTIONS
// ============================================================================

/**
 * Get email template by ID (email_format_option_value)
 */
export function getEmailTemplateById(id: string): EmailTemplateConfig | undefined {
  const template = allEmailTemplates.find(t => t.id === id);
  // Debug: log available template IDs if not found
  if (!template && id) {
    console.log('getEmailTemplateById - Template not found for ID:', id);
    console.log('getEmailTemplateById - Available introduction IDs:', allEmailTemplates.filter(t => t.tab === 'introduction').map(t => t.id));
    console.log('getEmailTemplateById - Available requirement IDs:', allEmailTemplates.filter(t => t.tab === 'requirement').map(t => t.id));
    console.log('getEmailTemplateById - Available presentation IDs:', allEmailTemplates.filter(t => t.tab === 'presentation').map(t => t.id));
    console.log('getEmailTemplateById - Available demo IDs:', allEmailTemplates.filter(t => t.tab === 'demo').map(t => t.id));
  }
  return template;
}

/**
 * Get all templates for a specific tab
 */
export function getEmailTemplatesByTab(tab: string): EmailTemplateConfig[] {
  return allEmailTemplates.filter(t => t.tab === tab);
}

/**
 * Get all distinct email format option values
 */
export function getDistinctEmailFormats(): string[] {
  return Array.from(new Set(allEmailTemplates.map(t => t.id)));
}

/**
 * Get all distinct tabs
 */
export function getDistinctTabs(): string[] {
  return Array.from(new Set(allEmailTemplates.map(t => t.tab)));
}

/**
 * Generate complete email HTML with placeholders replaced
 */
export function generateEmailHtml(templateId: string, data: Partial<EmailPlaceholderData>): string {
  const template = getEmailTemplateById(templateId);
  if (!template) {
    throw new Error(`Email template not found: ${templateId}`);
  }

  // Create complete data object with defaults
  const fullData: EmailPlaceholderData = {
    contact_name: data.contact_name || '',
    company_name: data.company_name || '',
    contact_email: data.contact_email || '',
    contact_phone: data.contact_phone || '',
    lead_id: data.lead_id || '',
    user_name: data.user_name || '',
    user_email: data.user_email || '',
    user_title: data.user_title || '',
    user_ext: data.user_ext || '',
    user_first_name: data.user_first_name || '',
    user_last_name: data.user_last_name || '',
    date: data.date || new Date().toLocaleDateString(),
    time: data.time || new Date().toLocaleTimeString(),
    meeting_date: data.meeting_date || '',
    meeting_time: data.meeting_time || '',
    form_link: data.form_link || '',
    form_links: data.form_links || [],
    portal_link: data.portal_link || '',
    dueid: data.dueid || 0,
    dueshortid: data.dueshortid || 0,
    ecomid: data.ecomid || '',
    url: data.url || '',
    url1: data.url1 || '',
    url2: data.url2 || '',
    url3: data.url3 || '',
    url4: data.url4 || '',
    url8: data.url8 || '',
    config_url_warehouse: data.config_url_warehouse || '',
    config_url_impex: data.config_url_impex || '',
    config_url_service: data.config_url_service || '',
    attachments: data.attachments || [],
    ...data,
  };

  return template.getBody(fullData);
}

/**
 * Get email subject with placeholders replaced
 */
export function generateEmailSubject(templateId: string, data: Partial<EmailPlaceholderData>): string {
  const template = getEmailTemplateById(templateId);
  if (!template) {
    throw new Error(`Email template not found: ${templateId}`);
  }

  return replacePlaceholders(template.subject, data);
}

// ============================================================================
// TEMPLATE GROUPS FOR UI
// ============================================================================

export const templateGroups = {
  introduction: {
    label: 'Introduction',
    templates: introductionTemplates,
  },
  demo: {
    label: 'Demo',
    templates: demoTemplates,
  },
  presentation: {
    label: 'Presentation',
    templates: presentationTemplates,
  },
  requirement: {
    label: 'Requirement',
    templates: requirementTemplates,
  },
  proposal: {
    label: 'Proposal',
    templates: proposalTemplates,
  },
  agreement: {
    label: 'Agreement',
    templates: agreementTemplates,
  },
  initiation: {
    label: 'Initiation',
    templates: implementationTemplates.filter(t => t.tab === 'initiation'),
  },
  planning: {
    label: 'Planning',
    templates: implementationTemplates.filter(t => t.tab === 'planning'),
  },
  configuration: {
    label: 'Configuration',
    templates: implementationTemplates.filter(t => t.tab === 'configuration'),
  },
  training: {
    label: 'Training',
    templates: implementationTemplates.filter(t => t.tab === 'training'),
  },
  uat: {
    label: 'UAT',
    templates: implementationTemplates.filter(t => t.tab === 'uat'),
  },
  'data-migration': {
    label: 'Data Migration',
    templates: implementationTemplates.filter(t => t.tab === 'data-migration'),
  },
  'go-live': {
    label: 'Go-Live',
    templates: implementationTemplates.filter(t => t.tab === 'go-live'),
  },
};

// ============================================================================
// DEFAULT PLACEHOLDERS FOR PREVIEW
// ============================================================================

export const defaultPlaceholderData: EmailPlaceholderData = {
  contact_name: 'John Smith',
  company_name: 'ABC Corporation',
  contact_email: 'john.smith@example.com',
  contact_phone: '+1 234 567 8900',
  lead_id: '12345',
  user_name: 'Jane Doe',
  user_email: 'jane.doe@axiever.com',
  user_title: 'Sales Executive',
  user_ext: '101',
  user_first_name: 'Jane',
  user_last_name: 'Doe',
  date: new Date().toLocaleDateString(),
  time: new Date().toLocaleTimeString(),
  meeting_date: '2024-02-15',
  meeting_time: '10:00 AM',
  form_link: 'https://example.com/form',
  form_links: [],
  portal_link: 'https://portal.axiever.com',
  dueid: 0,
  dueshortid: 0,
  ecomid: '',
  url: '',
  url1: '',
  url2: '',
  url3: '',
  url4: '',
  url8: '',
  config_url_warehouse: '',
  config_url_impex: '',
  config_url_service: '',
  attachments: [],
};
