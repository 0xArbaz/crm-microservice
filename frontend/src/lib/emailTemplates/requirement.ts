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
  BRAND,
  ICONS,
} from './shared';

// ============================================================================
// REQUIREMENT-1: ERP Demo Arrangement
// ============================================================================

export const requirement1: EmailTemplateConfig = {
  id: 'requirement-1',
  name: 'Requirement Email 1 - ERP Demo Arrangement',
  tab: 'requirement',
  subject: 'ERP Demonstration Arrangement - Axiever',

  getBody: (data: EmailPlaceholderData) => {
    // Parse ecomid to get ecommerce and datetime values
    let ecommerce = '';
    let datetime = '';
    if (data.ecomid) {
      const parts = data.ecomid.split('-');
      ecommerce = parts[0] || '';
      datetime = parts[1] || '';
    }

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

      // Pre-Demo Business Questionnaire (dueshortid == 17)
      if (data.dueshortid === 17 && data.url) {
        formLinks += `
          <div style="margin:8pt 0 0 0;">
            <a class="email-button" target="_blank" href="${data.url}"
              style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
                font-size: 11px; color: #ffffff; background-color: #0056b3;
                text-decoration: none; border-radius: 4px;">
              Pre-Demo Business Questionnaire
            </a>
          </div>`;
      }
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

    // Ecommerce Questionnaire (ecommerce == 12)
    let ecommerceLink = '';
    if (ecommerce === '12' && data.url1) {
      ecommerceLink = `
        <div style="margin:8pt 0 0 0;">
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
        <div style="margin-top: 6px;">
          <h5 style="margin: 0; font-family: Calibri, sans-serif; font-size: 11px;">
            Here ${verb} your ${noun}
          </h5>
        </div>`;
      data.attachments.forEach((doc, index) => {
        attachmentsHtml += `
          <div style="margin-left: 10px;">
            <a class="email-button" target="_blank" href="${doc.url}"
              style="font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.3;
                text-decoration: none; color: #0056b3;">
              ${index + 1}. ${doc.notes || doc.name}
            </a>
          </div>`;
      });
    }

    // Meeting Calendar Links (datetime == 13)
    let meetingCalendarLink = '';
    if (datetime === '13' && data.url) {
      meetingCalendarLink = `
        <div style="margin:8pt 0 0 0;">
          <a class="email-button" target="_blank" href="${data.url}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: #0056b3;
              text-decoration: none; border-radius: 4px;">
            Meeting Calendar Links
          </a>
        </div>`;
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
        We greatly appreciate your interest in our ERP solution and the opportunity to potentially collaborate with you to meet your business needs. Following our recent discussions and your expressed interest, we would like to arrange a demonstration of our ERP software for you and your esteemed team.
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please feel free to review it at your convenience, and do not hesitate to contact us if you have any questions regarding the form.
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Alternatively, we have set up an automatic meeting calendar. Simply click the link below, choose a date and time that suits you best, and provide a brief purpose for the meeting. We will take care of the rest by arranging for the appropriate person to join.
      </div>

      <div style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.3;">
        ${formLinks}
        ${ecommerceLink}
        ${attachmentsHtml}
      </div>

      ${meetingCalendarLink}

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
// REQUIREMENT-3: Due Diligence Follow-up
// ============================================================================

export const requirement3: EmailTemplateConfig = {
  id: 'requirement-3',
  name: 'Requirement Email 3 - Due Diligence Follow-up',
  tab: 'requirement',
  subject: 'Follow-up: Due Diligence Form - Axiever',

  getBody: (data: EmailPlaceholderData) => {
    // Parse ecomid to get ecommerce and datetime values
    let ecommerce = '';
    let datetime = '';
    if (data.ecomid) {
      const parts = data.ecomid.split('-');
      ecommerce = parts[0] || '';
      datetime = parts[1] || '';
    }

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

      // Pre-Demo Business Questionnaire (dueshortid == 17)
      if (data.dueshortid === 17 && data.url) {
        formLinks += `
          <div style="margin:8pt 0 0 0;">
            <a class="email-button" target="_blank" href="${data.url}"
              style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
                font-size: 11px; color: #ffffff; background-color: #0056b3;
                text-decoration: none; border-radius: 4px;">
              Pre-Demo Business Questionnaire
            </a>
          </div>`;
      }
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

    // Ecommerce Questionnaire (ecommerce == 12)
    let ecommerceLink = '';
    if (ecommerce === '12' && data.url1) {
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
        <div style="margin-top: 6px;">
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

    // Meeting Calendar Links (datetime == 13)
    let meetingCalendarLink = '';
    if (datetime === '13' && data.url) {
      meetingCalendarLink = `
        <div style="margin:8pt 0 0 0;">
          <a class="email-button" target="_blank" href="${data.url}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: #0056b3;
              text-decoration: none; border-radius: 4px;">
            Meeting Calendar Links
          </a>
        </div>`;
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
        I wanted to follow up on the due diligence form sent earlier. This form is needed in preparation for the customized demo of our ERP solution. If you have already taken the time to fill out and submit the form, please disregard this message.
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Completing the due diligence form will ensure our demo accurately reflects your business processes and requirements. If you have any difficulties or questions about the form, please do not hesitate to contact us.
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We request you take a moment to fill out the form at your earliest convenience.
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Looking forward to hearing from you soon.
      </div>

      <div style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.3;">
        ${formLinks}
        ${ecommerceLink}
        ${attachmentsHtml}
      </div>

      ${meetingCalendarLink}

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
