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
  BRAND,
  ICONS,
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
    // Build form links based on dueid
    let formLinks = '';
    if (data.dueid === 2 && data.url) {
      formLinks += `
        <div>
          <a class="email-button" target="_blank" href="${data.url}"
            style="font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.3;
              text-decoration: none; color: #0056b3;">
            UAT Link
          </a>
        </div>`;
    } else if (data.dueid === 3 && data.url) {
      formLinks += `
        <div>
          <a class="email-button" target="_blank" href="${data.url}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: #0056b3;
              text-decoration: none; border-radius: 4px;">
            Data Migration
          </a>
        </div>`;
    } else if (data.dueid === 4 && data.url) {
      formLinks += `
        <div>
          <a class="email-button" target="_blank" href="${data.url}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: #0056b3;
              text-decoration: none; border-radius: 4px;">
            Due Diligence Questionnaire
          </a>
        </div>`;
    } else if (data.dueid === 'presentation' && data.url) {
      formLinks += `
        <div>
          <a class="email-button" target="_blank" href="${data.url}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: #0056b3;
              text-decoration: none; border-radius: 4px;">
            Presentation Form
          </a>
        </div>`;
    } else if (data.dueid === 'demo' && data.url) {
      formLinks += `
        <div>
          <a class="email-button" target="_blank" href="${data.url}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: #0056b3;
              text-decoration: none; border-radius: 4px;">
            Demo Form
          </a>
        </div>`;
    }

    // Demo Date Time (dueid == 21)
    if (data.dueid === 21 && data.url) {
      formLinks += `
        <div>
          <a class="email-button" target="_blank" href="${data.url}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: #0056b3;
              text-decoration: none; border-radius: 4px;">
            Demo Date Time
          </a>
        </div>`;
    }

    // Ecommerce Questionnaire (ecomid >= 1)
    let ecommerceLink = '';
    if (data.ecomid && parseInt(data.ecomid) >= 1 && data.url1) {
      ecommerceLink = `
        <div>
          <a class="email-button" target="_blank" href="${data.url1}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: #0056b3;
              text-decoration: none; border-radius: 4px;">
            Ecommerce Questionnaire
          </a>
        </div>`;
    }

    // Build attachments section
    let attachmentsHtml = '';
    if (data.attachments && data.attachments.length > 0) {
      const verb = data.attachments.length === 1 ? 'is' : 'are';
      const noun = data.attachments.length === 1 ? 'attachment' : 'attachments';
      attachmentsHtml = `
        <div>
          <strong>Here ${verb} your ${noun}</strong>
        </div>`;
      data.attachments.forEach((doc, index) => {
        attachmentsHtml += `
          <div style="margin-left: 10px;">
            <a class="email-button" target="_blank" href="${doc.url}"
              style="font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.3;
                text-decoration: none; color: #0056b3;">
              ${index + 1}. ${doc.notes || doc.name}
            </a>
            <br>
          </div>`;
      });
    }

    const content = `
      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:12px;">
        <strong style="color:#0070C0;">"We give progressive business. Big Automation"</strong><br>
        <strong style="color:#0070C0;">"Automate. Simplify. Grow - Smarter, Affordable ERP with Robotic Process Automation & Artificial Intelligence"</strong>
      </div>

      <div style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.7; color: #000000; padding-top:6px;">
        <strong>Dear ${data.contact_name || '[#CONTACT_NAME#]'},</strong>
      </div>

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

      <div style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.3;">
        ${formLinks}
        ${ecommerceLink}
        ${attachmentsHtml}
      </div>

      <div style="margin:8pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Best regards,<br>
        <strong style="color:#0070C0;">Axiever</strong><br>
        <em style="color:#0070C0;">Smart. Simple. Affordable.</em><br>
        <em style="color:#0070C0;">A Canadian-headquartered company helping businesses grow faster with AI-powered simplicity.</em>
      </div>

      <table style="margin:4px 0 0 0;" cellpadding="0" cellspacing="0" style="margin-top:10px;">
        <tr>
          <td style="border: none; vertical-align: top; border-right: 1.5px solid #0f0f0f; padding-right: 10px;">
            <a href="${BRAND.websiteUrl}" target="_blank">
              <img src="${BRAND.logoUrl}" width="75" alt="Axiever Logo" style="display: block; border: none;">
            </a>
          </td>
          <td style="font-size: 11px; font-family: Calibri, sans-serif; padding-left: 15px;">
            <strong>${data.user_first_name || '[#USER_FIRST_NAME#]'} ${data.user_last_name || '[#USER_LAST_NAME#]'}</strong><br>
            <span style="color: #0070C0;">${data.user_title || '[#USER_TITLE#]'}</span><br>
            <a href="tel:+19059974044" style="color: #0070C0; text-decoration: none;">
              <img src="${ICONS.phone}" alt="Phone Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              +1 (905) 997-4044 ext. ${data.user_ext || '[#USER_EXT#]'}
            </a><br>
            <a href="mailto:${data.user_email || '[#USER_EMAIL#]'}" style="color: #0070C0; text-decoration: none;">
              <img src="${ICONS.email}" alt="Mail Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              ${data.user_email || '[#USER_EMAIL#]'}
            </a><br>
            <a href="${BRAND.websiteUrl}" style="color: #0070C0; text-decoration: none;">
              <img src="${ICONS.website}" alt="Website Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              www.axiever.com
            </a>
          </td>
        </tr>
      </table>

      <div style="margin:10px 0 0 0; font-size:11px; color:#666; padding-top:10px; font-family:Calibri, sans-serif;">
        <em>This email and any attachments are confidential and may be privileged.
          If you are not the intended recipient, please notify the sender immediately and delete this email.</em>
      </div>
    `;

    return wrapEmail(content);
  },
};

// ============================================================================
// PRESENTATION-2: Demo Scheduling Follow-up
// ============================================================================

export const presentation2: EmailTemplateConfig = {
  id: 'presentation-2',
  name: 'Presentation Email 2 - Demo Scheduling Follow-up',
  tab: 'presentation',
  subject: 'Follow-up: Demo Scheduling - Axiever ERP Solution',

  getBody: (data: EmailPlaceholderData) => {
    // Build form links based on dueid
    let formLinks = '';
    if (data.dueid === 2 && data.url) {
      formLinks += `
        <div>
          <a class="email-button" target="_blank" href="${data.url}"
            style="font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.3;
              text-decoration: none; color: #0056b3;">
            UAT Link
          </a>
        </div>`;
    } else if (data.dueid === 3 && data.url) {
      formLinks += `
        <div>
          <a class="email-button" target="_blank" href="${data.url}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: #0056b3;
              text-decoration: none; border-radius: 4px;">
            Data Migration
          </a>
        </div>`;
    } else if (data.dueid === 4 && data.url) {
      formLinks += `
        <div>
          <a class="email-button" target="_blank" href="${data.url}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: #0056b3;
              text-decoration: none; border-radius: 4px;">
            Due Diligence Questionnaire
          </a>
        </div>`;
    } else if (data.dueid === 'presentation' && data.url) {
      formLinks += `
        <div>
          <a class="email-button" target="_blank" href="${data.url}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: #0056b3;
              text-decoration: none; border-radius: 4px;">
            Presentation Form
          </a>
        </div>`;
    } else if (data.dueid === 'demo' && data.url) {
      formLinks += `
        <div>
          <a class="email-button" target="_blank" href="${data.url}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: #0056b3;
              text-decoration: none; border-radius: 4px;">
            Demo Form
          </a>
        </div>`;
    }

    // Ecommerce Questionnaire (ecomid >= 1)
    let ecommerceLink = '';
    if (data.ecomid && parseInt(data.ecomid) >= 1 && data.url1) {
      ecommerceLink = `
        <div>
          <a class="email-button" target="_blank" href="${data.url1}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: #0056b3;
              text-decoration: none; border-radius: 4px;">
            Ecommerce Questionnaire
          </a>
        </div>`;
    }

    // Demo Date Time (dueid == 21)
    let demoDateTimeLink = '';
    if (data.dueid === 21 && data.url) {
      demoDateTimeLink = `
        <div>
          <a class="email-button" target="_blank" href="${data.url}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: #0056b3;
              text-decoration: none; border-radius: 4px;">
            Demo Date Time
          </a>
        </div>`;
    }

    // Build attachments section
    let attachmentsHtml = '';
    if (data.attachments && data.attachments.length > 0) {
      const verb = data.attachments.length === 1 ? 'is' : 'are';
      const noun = data.attachments.length === 1 ? 'attachment' : 'attachments';
      attachmentsHtml = `
        <div>
          <strong>Here ${verb} your ${noun}</strong>
        </div>`;
      data.attachments.forEach((doc, index) => {
        attachmentsHtml += `
          <div style="margin-left: 10px;">
            <a class="email-button" target="_blank" href="${doc.url}"
              style="font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.3;
                text-decoration: none; color: #0056b3;">
              ${index + 1}. ${doc.notes || doc.name}
            </a>
            <br>
          </div>`;
      });
    }

    const content = `
      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:12px;">
        <strong style="color:#0070C0;">"We give progressive business. Big Automation"</strong><br>
        <strong style="color:#0070C0;">"Automate. Simplify. Grow - Smarter, Affordable ERP with Robotic Process Automation & Artificial Intelligence"</strong>
      </div>

      <div style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.7; color: #000000; padding-top:6px;">
        <strong>Dear ${data.contact_name || '[#CONTACT_NAME#]'},</strong>
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        I am writing to follow up on our previous communication regarding scheduling a demo for our affordable ERP solution, which I believe could greatly benefit ${data.company_name || '[#COMPANY_NAME#]'}.
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        As discussed previously, I understand the importance of providing a comprehensive overview of our ERP solution capabilities. To facilitate this, I propose a suitable date and time for the demo session.
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Here are some options for scheduling the demo:
      </div>

      <ul style="margin: 0pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>
          <span style="color: #0070C0; font-weight: bold;">Option 1: Date and Time -</span>
        </li>
        <li>
          <span style="color: #0070C0; font-weight: bold;">Option 2: Date and Time -</span>
        </li>
        <li>
          <span style="color: #0070C0; font-weight: bold;">Option 3: Date and Time -</span>
        </li>
      </ul>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please let me know which option works best for you.
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Alternatively, we have set up an automatic meeting calendar. Simply click the link below, choose a date and time that suits you best, and provide a brief purpose for the meeting. We will take care of the rest by arranging for the appropriate person to join.
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Should you have any questions or require further information, please feel free to reach out to me.
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Looking forward to your response.
      </div>

      <div style="font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.3;">
        ${formLinks}
        ${ecommerceLink}
        ${demoDateTimeLink}
        ${attachmentsHtml}
      </div>

      <div style="margin:8pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Best regards,<br>
        <strong style="color:#0070C0;">Axiever</strong><br>
        <em style="color:#0070C0;">Smart. Simple. Affordable.</em><br>
        <em style="color:#0070C0;">A Canadian-headquartered company helping businesses grow faster with AI-powered simplicity.</em>
      </div>

      <table style="margin:4px 0 0 0;" cellpadding="0" cellspacing="0" style="margin-top:10px;">
        <tr>
          <td style="border: none; vertical-align: top; border-right: 1.5px solid #0f0f0f; padding-right: 10px;">
            <a href="${BRAND.websiteUrl}" target="_blank">
              <img src="${BRAND.logoUrl}" width="75" alt="Axiever Logo" style="display: block; border: none;">
            </a>
          </td>
          <td style="font-size: 11px; font-family: Calibri, sans-serif; padding-left: 15px;">
            <strong>${data.user_first_name || '[#USER_FIRST_NAME#]'} ${data.user_last_name || '[#USER_LAST_NAME#]'}</strong><br>
            <span style="color: #0070C0;">${data.user_title || '[#USER_TITLE#]'}</span><br>
            <a href="tel:+19059974044" style="color: #0070C0; text-decoration: none;">
              <img src="${ICONS.phone}" alt="Phone Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              +1 (905) 997-4044 ext. ${data.user_ext || '[#USER_EXT#]'}
            </a><br>
            <a href="mailto:${data.user_email || '[#USER_EMAIL#]'}" style="color: #0070C0; text-decoration: none;">
              <img src="${ICONS.email}" alt="Mail Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              ${data.user_email || '[#USER_EMAIL#]'}
            </a><br>
            <a href="${BRAND.websiteUrl}" style="color: #0070C0; text-decoration: none;">
              <img src="${ICONS.website}" alt="Website Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              www.axiever.com
            </a>
          </td>
        </tr>
      </table>

      <div style="margin:10px 0 0 0; font-size:11px; color:#666; padding-top:10px; font-family:Calibri, sans-serif;">
        <em>This email and any attachments are confidential and may be privileged.
          If you are not the intended recipient, please notify the sender immediately and delete this email.</em>
      </div>
    `;

    return wrapEmail(content);
  },
};

// Export all presentation templates
export const presentationTemplates: EmailTemplateConfig[] = [
  presentation1,
  presentation2,
];
