// Agreement Email Templates - Matching reference project structure

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
// AGREEMENT-1: Agreement for Review
// ============================================================================

export const agreement1: EmailTemplateConfig = {
  id: 'agreement-1',
  name: 'Agreement Email 1 - Agreement for Review',
  tab: 'agreement',
  subject: 'Agreement for Your Review - Axiever ERP Solution',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        As per our recent discussions and your expressed interest, I am pleased to attach the Agreement outlining the specifics of our proposed ERP solution.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We have meticulously crafted these terms to align with our discussions and your organization requirements. Please review the enclosed agreement carefully. If you find everything in order and agreeable, kindly sign and return the document to us at your earliest convenience.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Should you have any questions or require further clarification on any aspect of the agreement, please do not hesitate to contact me directly.
      </div>

      <div style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.3;">
        <div style="margin-bottom: 8px;">
          Alternatively, we have set up an automatic meeting calendar. Simply click the link below, choose a date and time that suits you best, and provide a brief purpose for the meeting. We will take care of the rest by arranging for the appropriate person to join.
        </div>
      </div>

      ${getFormLinksSection(data)}

      <div style="margin:8pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Upon receipt of the signed agreement, we will initiate the necessary steps to begin the implementation process.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Looking forward to receiving the signed agreement and proceeding with the next steps.
      </div>

      ${getAttachmentsSection(data.attachments)}
      ${getFooter()}
      ${getSignature(data)}
      ${getConfidentialityNotice()}
    `;

    return wrapEmail(content);
  },
};

// ============================================================================
// AGREEMENT-2: Agreement Follow-up
// ============================================================================

export const agreement2: EmailTemplateConfig = {
  id: 'agreement-2',
  name: 'Agreement Email 2 - Follow-up',
  tab: 'agreement',
  subject: 'Follow-Up: Request for Signed Agreement for our ERP solution',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        I am writing to follow up on the Agreement that we previously sent over for your review and signature. We believe you had ample time to review the agreement thoroughly.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        However, as we move forward with the next steps of our collaboration, we kindly request that you please sign and return the agreement at your earliest convenience. Your signature on the agreement would be the final step in formalizing our proposed ERP solution.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        If you have any questions or concerns regarding the content of the agreement, please do not hesitate to contact us.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Alternatively, we have set up an automatic meeting calendar. Simply click the link below, choose a date and time that suits you best, and provide a brief purpose for the meeting. We will take care of the rest by arranging for the appropriate person to join.
      </div>

      ${getFormLinksSection(data)}

      <div style="margin:8pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        To expedite the signing process, you can simply sign the document electronically through the given link below. Alternatively, you may print, sign, and scan it back to us. Your prompt attention to this matter would be greatly appreciated, as it will allow us to initiate the next steps in our collaboration without delay.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Looking forward to receiving the signed agreement.
      </div>

      ${getAttachmentsSection(data.attachments)}
      ${getFooter()}
      ${getSignature(data)}
      ${getConfidentialityNotice()}
    `;

    return wrapEmail(content);
  },
};

// ============================================================================
// AGREEMENT-3: Agreement Signed Confirmation (Counter-Signed Agreement)
// ============================================================================

export const agreement3: EmailTemplateConfig = {
  id: 'agreement-3',
  name: 'Agreement Email 3 - Signed Confirmation',
  tab: 'agreement',
  subject: 'Counter-Signed Agreement',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        On behalf of <strong>Axiever</strong>, we want to express our sincere gratitude for choosing us as your solution provider for the implementation of our ERP solution at <strong>${data.company_name || ''}</strong>.
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        I am pleased to inform you that we have received the signed Agreement, which will be counter-signed by our authorized representative.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Acknowledgment of Commitment:
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Your commitment to collaborate with us for your ERP software needs is a testament to the confidence you have in our capabilities. We are dedicated to delivering a solution that meets all your business requirements.
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please find attached the counter-signed agreement for your records. If there are any additional documents or information you require, please let us know.
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Looking forward to a fruitful collaboration and a successful implementation of our ERP solution.
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
// AGREEMENT-4: Advance Payment Request
// ============================================================================

export const agreement4: EmailTemplateConfig = {
  id: 'agreement-4',
  name: 'Agreement Email 4 - Payment Terms',
  tab: 'agreement',
  subject: 'Request for Advance Payment - Invoice Attached',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Thank you for choosing Axiever as your solution provider.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We kindly request you process advance payment by the terms outlined in the agreement. Attached to this email, you will find the invoice detailing the amount and payment instructions.
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        This will enable us to proceed with the necessary preparations and allocation of resources for the successful execution of the project promptly.
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Should you require any further clarification or assistance regarding the invoice or payment process, please do not hesitate to reach out to me directly.
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We sincerely appreciate your prompt attention to this matter and your continued trust in Axiever.
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
// AGREEMENT-5: Payment Follow-up
// ============================================================================

export const agreement5: EmailTemplateConfig = {
  id: 'agreement-5',
  name: 'Agreement Email 5 - Payment Follow-up',
  tab: 'agreement',
  subject: 'Follow-Up: Request for Advance Payment for proposed ERP solution',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        I want to follow up regarding the advance payment request to implement our proposed ERP solution at <strong>${data.company_name || ''}</strong>.
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        As outlined in our previous communication and the signed agreement, an advance payment is required to facilitate the necessary preparations and resources for the smooth implementation process.
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Attaching the invoice to this email again, detailing the amount due for the advance payment. We kindly request that you process this payment at your earliest convenience to allow us to proceed with the implementation process promptly.
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Should you require any further clarification regarding the invoice or payment process, please do not hesitate to contact us.
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Alternatively, we have set up an automatic meeting calendar. Simply click the link below, choose a date and time that suits you best, and provide a brief purpose for the meeting. We will take care of the rest by arranging for the appropriate person to join.
      </div>

      ${getFormLinksSection(data)}

      <div style="margin:8pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Thank you for your attention to this matter and your continued trust in Axiever.
      </div>

      ${getAttachmentsSection(data.attachments)}
      ${getFooter()}
      ${getSignature(data)}
      ${getConfidentialityNotice()}
    `;

    return wrapEmail(content);
  },
};

// Export all agreement templates
export const agreementTemplates: EmailTemplateConfig[] = [
  agreement1,
  agreement2,
  agreement3,
  agreement4,
  agreement5,
];
