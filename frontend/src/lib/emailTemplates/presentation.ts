// Presentation Email Templates - Matching reference project structure

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
// PRESENTATION-1: After Due Diligence
// ============================================================================

export const presentation1: EmailTemplateConfig = {
  id: 'presentation-1',
  name: 'Presentation Email 1 - After Due Diligence',
  tab: 'presentation',
  subject: 'Your Personalized Presentation Materials - Axiever',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Thank you for completing and returning the due diligence form for our software solution.
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        I am pleased to inform you that we have compiled detailed information tailored to address the challenges and objectives outlined in your form. Attached to this email, you will find comprehensive documentation providing an in-depth overview of the features, benefits, and functionalities of our solution.
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We believe that a live demonstration would be the most effective way to showcase how our solution can enhance your business operations. Therefore, we would like to schedule a demo session at your convenience.
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please select the day and time that suits you in the link given below and we will arrange a demo session accordingly.
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
// PRESENTATION-2: Presentation Follow-up
// ============================================================================

export const presentation2: EmailTemplateConfig = {
  id: 'presentation-2',
  name: 'Presentation Email 2 - Follow-up',
  tab: 'presentation',
  subject: 'Follow-up: Presentation Materials and Next Steps',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        I wanted to follow up on our recent presentation and share some additional materials that might be helpful as you evaluate our solution.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Based on our discussion, I have prepared:
      </div>

      <ul style="margin: 4pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>A summary of key features relevant to your requirements</li>
        <li>ROI projections based on similar implementations</li>
        <li>Implementation timeline overview</li>
        <li>Answers to questions raised during the presentation</li>
      </ul>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please review the attached materials. I am available to discuss any questions or concerns you might have.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Would you like to schedule a follow-up call to discuss next steps?
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

// Export all presentation templates
export const presentationTemplates: EmailTemplateConfig[] = [
  presentation1,
  presentation2,
];
