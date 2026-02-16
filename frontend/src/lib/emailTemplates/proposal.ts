// Proposal Email Templates - Matching reference project structure

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
// PROPOSAL-1: Initial Proposal
// ============================================================================

export const proposal1: EmailTemplateConfig = {
  id: 'proposal-1',
  name: 'Proposal Email 1 - Initial Proposal',
  tab: 'proposal',
  subject: 'Software Proposal for Your Review - Axiever',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Following our recent discussions, I am pleased to attach the software proposal tailored to your business requirements.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        I kindly request your signature on the Proposal to proceed with the next steps of our collaboration. If necessary, we can arrange a follow-up meeting to delve deeper into the proposal, address any queries or uncertainties you may have, and outline the subsequent actions.
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please let me know a time that suits you, or feel free to share your availability through [suggested meeting days and timings], and I will arrange the meeting accordingly.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Looking forward to hearing from you soon.
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
// PROPOSAL-2: Proposal Follow-up
// ============================================================================

export const proposal2: EmailTemplateConfig = {
  id: 'proposal-2',
  name: 'Proposal Email 2 - Follow-up',
  tab: 'proposal',
  subject: 'Following Up on Your Proposal - Axiever',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        I wanted to follow up on the proposal I sent earlier. I hope you had a chance to review it and discuss it with your team.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        I understand that evaluating a new software solution is a significant decision. If you have any questions or need additional information to help with your decision-making process, please do not hesitate to reach out.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Some common questions we address at this stage:
      </div>

      <ul style="margin: 4pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>Implementation timeline and process</li>
        <li>Training and support options</li>
        <li>Customization possibilities</li>
        <li>Payment terms and options</li>
      </ul>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Would you be available for a brief call to discuss any concerns or next steps?
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
// PROPOSAL-3: Revised Proposal
// ============================================================================

export const proposal3: EmailTemplateConfig = {
  id: 'proposal-3',
  name: 'Proposal Email 3 - Revised Proposal',
  tab: 'proposal',
  subject: 'Revised Proposal - Axiever',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Thank you for your feedback on our initial proposal. Based on our recent discussions, I have prepared a revised proposal that better addresses your specific requirements.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Key changes in this revision include:
      </div>

      <ul style="margin: 4pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>Adjusted pricing structure</li>
        <li>Updated implementation timeline</li>
        <li>Additional modules as discussed</li>
        <li>Enhanced support package</li>
      </ul>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please review the attached revised proposal. If everything looks good, we can proceed to the agreement stage. Otherwise, I am happy to discuss any further adjustments.
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

// Export all proposal templates
export const proposalTemplates: EmailTemplateConfig[] = [
  proposal1,
  proposal2,
  proposal3,
];
