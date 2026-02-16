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
  subject: 'Following Up on Agreement - Axiever',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        I wanted to follow up on the agreement I sent for your review. I hope you had a chance to go through the terms and conditions.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        If you have any questions, concerns, or if there are any terms you would like to discuss, please let me know. We are flexible and open to addressing any specific requirements you may have.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Once the agreement is signed, we can begin the onboarding process immediately. Our team is ready to ensure a smooth transition for your organization.
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
// AGREEMENT-3: Agreement Signed Confirmation
// ============================================================================

export const agreement3: EmailTemplateConfig = {
  id: 'agreement-3',
  name: 'Agreement Email 3 - Signed Confirmation',
  tab: 'agreement',
  subject: 'Agreement Received - Welcome to Axiever!',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Thank you for signing the agreement! We are thrilled to welcome you as our valued partner.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Here is what happens next:
      </div>

      <ol style="margin: 4pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li style="margin-bottom: 2pt;">Our implementation team will reach out within the next 24-48 hours</li>
        <li style="margin-bottom: 2pt;">We will schedule a kickoff meeting to discuss the project timeline</li>
        <li style="margin-bottom: 2pt;">You will receive access to our project portal for tracking progress</li>
        <li style="margin-bottom: 2pt;">We will begin the initial configuration based on your requirements</li>
      </ol>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        In the meantime, please review the attached onboarding materials to help your team prepare for the implementation.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We are excited to embark on this journey with you!
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
// AGREEMENT-4: Payment Terms
// ============================================================================

export const agreement4: EmailTemplateConfig = {
  id: 'agreement-4',
  name: 'Agreement Email 4 - Payment Terms',
  tab: 'agreement',
  subject: 'Payment Terms and Invoice - Axiever',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Following the signed agreement, please find attached the invoice with payment details.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Payment Details:
      </div>

      <ul style="margin: 4pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>Invoice Number: [Invoice Number]</li>
        <li>Amount Due: [Amount]</li>
        <li>Due Date: [Due Date]</li>
        <li>Payment Method: Bank Transfer / Credit Card</li>
      </ul>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Upon receipt of payment, we will begin the implementation process as outlined in our agreement.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        If you have any questions regarding the invoice or payment terms, please do not hesitate to reach out.
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
// AGREEMENT-5: Agreement Amendment
// ============================================================================

export const agreement5: EmailTemplateConfig = {
  id: 'agreement-5',
  name: 'Agreement Email 5 - Amendment',
  tab: 'agreement',
  subject: 'Agreement Amendment - Axiever',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Based on our recent discussions, please find attached the amended agreement with the requested changes.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Key amendments include:
      </div>

      <ul style="margin: 4pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>[Amendment 1 description]</li>
        <li>[Amendment 2 description]</li>
        <li>[Amendment 3 description]</li>
      </ul>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        All other terms remain unchanged from the original agreement. Please review and sign the amended document to proceed.
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

// Export all agreement templates
export const agreementTemplates: EmailTemplateConfig[] = [
  agreement1,
  agreement2,
  agreement3,
  agreement4,
  agreement5,
];
