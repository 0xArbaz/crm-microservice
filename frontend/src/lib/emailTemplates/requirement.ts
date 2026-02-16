// Requirement Email Templates - Matching reference project structure

import { EmailTemplateConfig, EmailPlaceholderData } from './types';
import {
  getHeader,
  getGreeting,
  getFooter,
  getSignature,
  getConfidentialityNotice,
  getFormLinksSection,
  getAttachmentsSection,
  wrapEmail,
} from './shared';

// ============================================================================
// REQUIREMENT-1: Requirements Discussion
// ============================================================================

export const requirement1: EmailTemplateConfig = {
  id: 'requirement-1',
  name: 'Requirement Email 1 - Requirements Discussion',
  tab: 'requirement',
  subject: 'Requirements Discussion - Axiever',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Following our recent discussions, I wanted to outline the key requirements we have identified for your ERP implementation:
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Key Requirements:
      </div>

      <ul style="margin: 4pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>Business process automation</li>
        <li>Real-time reporting and analytics</li>
        <li>Multi-location support</li>
        <li>Integration with existing systems</li>
        <li>Mobile accessibility</li>
      </ul>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please review and let us know if there are any additional requirements we should consider.
      </div>

      ${getFormLinksSection(data)}
      ${getAttachmentsSection(data.attachments)}
      ${getFooter()}
      ${getSignature(data)}
      ${getConfidentialityNotice()}
    `;

    return wrapEmail(content);
  },
};

// ============================================================================
// REQUIREMENT-3: Detailed Requirements
// ============================================================================

export const requirement3: EmailTemplateConfig = {
  id: 'requirement-3',
  name: 'Requirement Email 3 - Detailed Requirements',
  tab: 'requirement',
  subject: 'Detailed Requirements Document - Axiever',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please find attached the detailed requirements document based on our discussions.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        The document covers:
      </div>

      <ul style="margin: 4pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>Functional requirements by module</li>
        <li>Technical requirements and integrations</li>
        <li>User roles and access requirements</li>
        <li>Reporting requirements</li>
        <li>Timeline and milestone expectations</li>
      </ul>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please review the document carefully and provide your feedback. We will schedule a follow-up meeting to finalize the requirements.
      </div>

      ${getFormLinksSection(data)}
      ${getAttachmentsSection(data.attachments)}
      ${getFooter()}
      ${getSignature(data)}
      ${getConfidentialityNotice()}
    `;

    return wrapEmail(content);
  },
};

// ============================================================================
// REQUIREMENT-21: Business Questionnaire
// ============================================================================

export const requirement21: EmailTemplateConfig = {
  id: 'requirement-21',
  name: 'Requirement Email 21 - Business Questionnaire',
  tab: 'requirement',
  subject: 'Business Requirements Questionnaire - Axiever',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        To better understand your business needs, please complete the attached questionnaire.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        This questionnaire will help us:
      </div>

      <ul style="margin: 4pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>Understand your current business processes</li>
        <li>Identify pain points and challenges</li>
        <li>Define success criteria for the implementation</li>
        <li>Tailor our solution to your specific needs</li>
      </ul>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please complete and return the questionnaire at your earliest convenience. You can also fill it out online using the link below:
      </div>

      ${getFormLinksSection(data)}
      ${getAttachmentsSection(data.attachments)}
      ${getFooter()}
      ${getSignature(data)}
      ${getConfidentialityNotice()}
    `;

    return wrapEmail(content);
  },
};

// Export all requirement templates
export const requirementTemplates: EmailTemplateConfig[] = [
  requirement1,
  requirement3,
  requirement21,
];
