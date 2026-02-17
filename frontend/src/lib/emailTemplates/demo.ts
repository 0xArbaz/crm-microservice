// Demo Email Templates - Matching reference project structure

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
// DEMO-1: Demo Invitation
// ============================================================================

export const demo1: EmailTemplateConfig = {
  id: 'demo-1',
  name: 'Demo Email 1 - Demo Invitation',
  tab: 'demo',
  subject: 'Demo Presentation Invitation - Axiever ERP Solution',

  getBody: (data: EmailPlaceholderData) => {
    // Post-Demo Business Questionnaire (dueshortid == 11)
    let postDemoLink = '';
    if (data.dueshortid === 11 && data.url4) {
      postDemoLink = `
        <div>
          <a class="email-button" target="_blank" href="${data.url4}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: #0056b3;
              text-decoration: none; border-radius: 4px;">
            Post-Demo Business Questionnaire
          </a>
        </div>`;
    }

    // Build form links based on dueid
    let formLinks = '';
    if (data.dueid === 2 && data.url) {
      formLinks += `
        <div style="margin-top: 8px;">
          <a class="email-button" target="_blank" href="${data.url}"
            style="font-family: Calibri, sans-serif; font-size: 11px;
              line-height: 1.3; text-decoration: none; color: #0056b3;">
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

    // Demo Video Link
    let demoVideoLink = '';
    if (data.url3) {
      demoVideoLink = `
        <div style="margin-top: 8px;">
          <a class="email-button" target="_blank" href="${data.url3}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: #0056b3;
              text-decoration: none; border-radius: 4px;">
            Demo Video Link
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
          <strong>Here ${verb} your ${noun}:</strong>
        </div>`;
      data.attachments.forEach((doc, index) => {
        attachmentsHtml += `
          <div style="margin-left: 10px;">
            <span style="font-family: Calibri, sans-serif; font-size: 11px;">${index + 1}.</span>
            <a class="email-button" target="_blank" href="${doc.url}"
              style="font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.3;
                text-decoration: none; color: #0056b3;">
              ${doc.notes || doc.name}
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

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        As per our recent conversation and your expressed interest in learning more about our software services, we are pleased to invite you and your dedicated channel partner to a demo presentation scheduled for [Demo Day].
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Demo Details:
      </div>

      <ul style="margin: 0pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li><b>Date:</b> [Date of the Demo Presentation]</li>
        <li><b>Time:</b> [Time of the Demo Presentation]</li>
        <li><b>Duration:</b> Approximately [Duration of the Demo Presentation]</li>
        <li><b>Platform:</b> [Platform or Location where the Demo will be Hosted]</li>
        <li><b>Meeting Link:</b> [Add the scheduled meeting link]</li>
      </ul>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        During the demo, we will delve into the intricacies of our offerings and showcase how they can specifically address your needs and requirements.
      </div>

      <div style="margin: 4pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; color: #000000;">
        Agenda for the Demo:
      </div>

      <ol style="margin: 4pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px; color: #000000;">
        <li style="margin-bottom: 2pt;"><span>Introduction to Axiever</span></li>
        <li style="margin-bottom: 2pt;"><span>Overview of our Services</span></li>
        <li style="margin-bottom: 2pt;"><span>Key Features and Benefits</span></li>
        <li style="margin-bottom: 2pt;"><span>Case Studies/Testimonials</span></li>
        <li style="margin-bottom: 2pt;"><span>Q&amp;A Session</span></li>
      </ol>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Attached Demo Videos:
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        I have also attached the demo videos for your review prior to our meeting. This presentation has been tailored to provide insights into our services and highlight their features and benefits.
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Should you have any specific areas of interest or questions you would like us to address during the demo, please feel free to let us know in advance so that we can tailor our presentation to meet your needs effectively.
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We look forward to presenting our solutions to you and your team.
      </div>

      <div style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.3;">
        ${postDemoLink}
        ${formLinks}
        ${ecommerceLink}
        ${demoVideoLink}
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
// DEMO-2: Demo Reminder
// ============================================================================

export const demo2: EmailTemplateConfig = {
  id: 'demo-2',
  name: 'Demo Email 2 - Demo Reminder',
  tab: 'demo',
  subject: 'Reminder: Demo Presentation Tomorrow - Axiever ERP Solution',

  getBody: (data: EmailPlaceholderData) => {
    // Post-Demo Business Questionnaire (dueshortid == 11)
    let postDemoLink = '';
    if (data.dueshortid === 11 && data.url4) {
      postDemoLink = `
        <div>
          <a class="email-button" target="_blank" href="${data.url4}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: #0056b3;
              text-decoration: none; border-radius: 4px;">
            Post-Demo Business Questionnaire
          </a>
        </div>`;
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

    // Demo Video Link
    let demoVideoLink = '';
    if (data.url3) {
      demoVideoLink = `
        <div style="margin-top: 8px;">
          <a class="email-button" target="_blank" href="${data.url3}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: #0056b3;
              text-decoration: none; border-radius: 4px;">
            Demo Video Link
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
          <strong>Here ${verb} your ${noun}:</strong>
        </div>`;
      data.attachments.forEach((doc, index) => {
        attachmentsHtml += `
          <div style="margin-left: 10px; margin-top: 2px;">
            <span style="font-family: Calibri, sans-serif; font-size: 11px;">${index + 1}.</span>
            <a class="email-button" target="_blank" href="${doc.url}"
              style="font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.3;
                text-decoration: none; color: #0056b3;">
              ${doc.notes || doc.name}
            </a>
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
        I wanted to send a quick reminder about our scheduled demo presentation, which is taking place tomorrow. We are looking forward to showcasing our software solutions and discussing how Axiever can address the needs and objectives of ${data.company_name || '[#COMPANY_NAME#]'}.
      </div>

      <ul style="margin: 0pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li><b>Date:</b> [Date of the Demo Presentation]</li>
        <li><b>Time:</b> [Time of the Demo Presentation]</li>
        <li><b>Duration:</b> Approximately [Duration of the Demo Presentation]</li>
        <li><b>Platform:</b> [Platform or Location where the Demo will be Hosted]</li>
      </ul>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        As discussed, during the demo, we will provide a comprehensive overview of our solutions, demonstrating the key features and functionalities tailored to address your specific requirements.
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Attached Demo Presentation
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        In case you have not had the chance to review it yet, I have attached the demo presentation for your reference. This will give you a sneak peek into what we will be covering during our session. Please take some time to familiarize yourself with the content, and if you have any questions or specific areas of interest, do not hesitate to let us know.
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Looking forward to our discussion tomorrow.
      </div>

      <div style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.3;">
        ${postDemoLink}
        ${formLinks}
        ${ecommerceLink}
        ${demoVideoLink}
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
// DEMO-3: Post-Demo Follow-up - Proposed Modules
// ============================================================================

export const demo3: EmailTemplateConfig = {
  id: 'demo-3',
  name: 'Demo Email 3 - Post-Demo Proposed Modules',
  tab: 'demo',
  subject: 'Post-Demo Follow-up: Proposed Modules - Axiever ERP Solution',

  getBody: (data: EmailPlaceholderData) => {
    // Post-Demo Business Questionnaire (dueshortid == 11)
    let postDemoLink = '';
    if (data.dueshortid === 11 && data.url4) {
      postDemoLink = `
        <div>
          <a class="email-button" target="_blank" href="${data.url4}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: #0056b3;
              text-decoration: none; border-radius: 4px;">
            Post-Demo Business Questionnaire
          </a>
        </div>`;
    }

    // Build form links based on dueid
    let formLinks = '';
    if (data.dueid === 2 && data.url) {
      formLinks += `
        <div>
          <a class="email-button" target="_blank" href="${data.url}"
            style="font-family: Calibri, sans-serif; font-size: 11px;
              line-height: 1.3; text-decoration: none; color: #0056b3;">
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

    // Build attachments section
    let attachmentsHtml = '';
    if (data.attachments && data.attachments.length > 0) {
      const verb = data.attachments.length === 1 ? 'is' : 'are';
      const noun = data.attachments.length === 1 ? 'attachment' : 'attachments';
      attachmentsHtml = `
        <div style="margin-top: 8px;">
          <div style="font-weight: bold;">
            Here ${verb} your ${noun}
          </div>`;
      data.attachments.forEach((doc, index) => {
        attachmentsHtml += `
          <div style="margin-top: 4px;">
            <a class="email-button" target="_blank" href="${doc.url}"
              style="font-family: Calibri, sans-serif; font-size: 11px;
                line-height: 1.3; text-decoration: none; color: #0056b3;">
              ${index + 1}. ${doc.notes || doc.name}
            </a>
          </div>`;
      });
      attachmentsHtml += '</div>';
    }

    const content = `
      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:12px;">
        <strong style="color:#0070C0;">"We give progressive business. Big Automation"</strong><br>
        <strong style="color:#0070C0;">"Automate. Simplify. Grow - Smarter, Affordable ERP with Robotic Process Automation & Artificial Intelligence"</strong>
      </div>

      <div style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.7; color: #000000; padding-top:6px;">
        <strong>Dear ${data.contact_name || '[#CONTACT_NAME#]'},</strong>
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We truly appreciate you taking the time to attend the demo session.
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Based on our conversation and your requirements, we are pleased to proceed with the next step - presenting the proposed modules and sub-modules of our ERP solution tailored to meet your specific needs.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Proposed Modules and Sub-modules:
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        To ensure that we cover everything comprehensively, I would like to schedule a presentation session at your earliest convenience. During this session, we will provide a detailed overview of each module, highlight key features and functionalities, and address any questions or concerns you may have.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please let me know a time that suits you, or feel free to share your availability through [suggested meeting days and timings], and we will arrange the presentation session accordingly.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Looking forward to hearing back from you and scheduling the presentation.
      </div>

      <div style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.3;">
        ${postDemoLink}
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

      <table style="margin:8pt 0 0 0;" cellpadding="0" cellspacing="0" style="margin-top:10px;">
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
// DEMO-4: Revised Proposed Modules
// ============================================================================

export const demo4: EmailTemplateConfig = {
  id: 'demo-4',
  name: 'Demo Email 4 - Revised Proposed Modules',
  tab: 'demo',
  subject: 'Revised Proposed Modules - Axiever ERP Solution',

  getBody: (data: EmailPlaceholderData) => {
    // Post-Demo Business Questionnaire (dueshortid == 11)
    let postDemoLink = '';
    if (data.dueshortid === 11 && data.url4) {
      postDemoLink = `
        <div>
          <a class="email-button" target="_blank" href="${data.url4}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: #0056b3;
              text-decoration: none; border-radius: 4px;">
            Post-Demo Business Questionnaire
          </a>
        </div>`;
    }

    // Build form links based on dueid
    let formLinks = '';
    if (data.dueid === 2 && data.url) {
      formLinks += `
        <div>
          <a class="email-button" target="_blank" href="${data.url}"
            style="font-family: Calibri, sans-serif; font-size: 11px;
              line-height: 1.3; text-decoration: none; color: #0056b3;">
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

    // Build attachments section
    let attachmentsHtml = '';
    if (data.attachments && data.attachments.length > 0) {
      const verb = data.attachments.length === 1 ? 'is' : 'are';
      const noun = data.attachments.length === 1 ? 'attachment' : 'attachments';
      attachmentsHtml = `
        <div style="margin-top: 8px;">
          <div style="font-weight: bold;">
            Here ${verb} your ${noun}
          </div>`;
      data.attachments.forEach((doc, index) => {
        attachmentsHtml += `
          <div style="margin-top: 4px;">
            <a class="email-button" target="_blank" href="${doc.url}"
              style="font-family: Calibri, sans-serif; font-size: 11px;
                line-height: 1.3; text-decoration: none; color: #0056b3;">
              ${index + 1}. ${doc.notes || doc.name}
            </a>
          </div>`;
      });
      attachmentsHtml += '</div>';
    }

    const content = `
      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:12px;">
        <strong style="color:#0070C0;">"We give progressive business. Big Automation"</strong><br>
        <strong style="color:#0070C0;">"Automate. Simplify. Grow - Smarter, Affordable ERP with Robotic Process Automation & Artificial Intelligence"</strong>
      </div>

      <div style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.7; color: #000000; padding-top:6px;">
        <strong>Dear ${data.contact_name || '[#CONTACT_NAME#]'},</strong>
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Thank you for the insightful discussion we had regarding the proposed modules and flow presentation.
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Based on our conversation, I am pleased to share with you the revised proposed modules. These adjustments aim to address the specific requirements we discussed and ensure that our solution provides optimal value for your organization.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Revised Proposed Modules:
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        [Attach the revised proposed modules presentation to this email]
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        I would like you to review the revised proposed modules and sub-modules. Your input is crucial to us, and we are committed to delivering a solution that meets all your business requirements.
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Should you have any immediate questions or require further information, please do not hesitate to contact us.
      </div>

      <div style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.3;">
        ${postDemoLink}
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

      <table style="margin:8pt 0 0 0;" cellpadding="0" cellspacing="0" style="margin-top:10px;">
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
// DEMO-5: Revised Proposed Modules Follow-up
// ============================================================================

export const demo5: EmailTemplateConfig = {
  id: 'demo-5',
  name: 'Demo Email 5 - Revised Proposed Modules Follow-up',
  tab: 'demo',
  subject: 'Follow-up: Revised Proposed Modules - Axiever ERP Solution',

  getBody: (data: EmailPlaceholderData) => {
    // Post-Demo Business Questionnaire (dueshortid == 11)
    let postDemoLink = '';
    if (data.dueshortid === 11 && data.url4) {
      postDemoLink = `
        <div>
          <a class="email-button" target="_blank" href="${data.url4}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: #0056b3;
              text-decoration: none; border-radius: 4px;">
            Post-Demo Business Questionnaire
          </a>
        </div>`;
    }

    // Build form links based on dueid
    let formLinks = '';
    if (data.dueid === 2 && data.url) {
      formLinks += `
        <div>
          <a class="email-button" target="_blank" href="${data.url}"
            style="font-family: Calibri, sans-serif; font-size: 11px;
              line-height: 1.3; text-decoration: none; color: #0056b3;">
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

    // Build attachments section
    let attachmentsHtml = '';
    if (data.attachments && data.attachments.length > 0) {
      const verb = data.attachments.length === 1 ? 'is' : 'are';
      const noun = data.attachments.length === 1 ? 'attachment' : 'attachments';
      attachmentsHtml = `
        <div style="margin-top: 8px;">
          <div style="font-weight: bold;">
            Here ${verb} your ${noun}
          </div>`;
      data.attachments.forEach((doc, index) => {
        attachmentsHtml += `
          <div style="margin-top: 4px;">
            <a class="email-button" target="_blank" href="${doc.url}"
              style="font-family: Calibri, sans-serif; font-size: 11px;
                line-height: 1.3; text-decoration: none; color: #0056b3;">
              ${index + 1}. ${doc.notes || doc.name}
            </a>
          </div>`;
      });
      attachmentsHtml += '</div>';
    }

    const content = `
      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:12px;">
        <strong style="color:#0070C0;">"We give progressive business. Big Automation"</strong><br>
        <strong style="color:#0070C0;">"Automate. Simplify. Grow - Smarter, Affordable ERP with Robotic Process Automation & Artificial Intelligence"</strong>
      </div>

      <div style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.7; color: #000000; padding-top:6px;">
        <strong>Dear ${data.contact_name || '[#CONTACT_NAME#]'},</strong>
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Thank you for the insightful discussion we had regarding the proposed modules and flow presentation.
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Based on our conversation, I am pleased to share with you the revised proposed modules. These adjustments aim to address the specific requirements we discussed and ensure that our solution provides optimal value for your organization.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Revised Proposed Modules:
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        [Attach the revised proposed modules presentation to this email]
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        I would like you to review the revised proposed modules and sub-modules. Your input is crucial to us, and we are committed to delivering a solution that meets all your business requirements.
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Should you have any immediate questions or require further information, please do not hesitate to contact us.
      </div>

      <div style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.3;">
        ${postDemoLink}
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

      <table style="margin:8pt 0 0 0;" cellpadding="0" cellspacing="0" style="margin-top:10px;">
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
// DEMO-6: Post-Demo Thank You & Questionnaire
// ============================================================================

export const demo6: EmailTemplateConfig = {
  id: 'demo-6',
  name: 'Demo Email 6 - Post-Demo Thank You & Questionnaire',
  tab: 'demo',
  subject: 'Thank You for Attending - Post-Demo Business Questionnaire',

  getBody: (data: EmailPlaceholderData) => {
    // Post-Demo Business Questionnaire (dueshortid == 11)
    let postDemoLink = '';
    if (data.dueshortid === 11 && data.url4) {
      postDemoLink = `
        <div>
          <a class="email-button" target="_blank" href="${data.url4}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: #0056b3;
              text-decoration: none; border-radius: 4px;">
            Post-Demo Business Questionnaire
          </a>
        </div>`;
    }

    // Build form links based on dueid
    let formLinks = '';
    if (data.dueid === 2 && data.url) {
      formLinks += `
        <div>
          <a class="email-button" target="_blank" href="${data.url}"
            style="font-family: Calibri, sans-serif; font-size: 11px;
              line-height: 1.3; text-decoration: none; color: #0056b3;">
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

    // Build attachments section
    let attachmentsHtml = '';
    if (data.attachments && data.attachments.length > 0) {
      const verb = data.attachments.length === 1 ? 'is' : 'are';
      const noun = data.attachments.length === 1 ? 'attachment' : 'attachments';
      attachmentsHtml = `
        <div style="margin-top: 8px;">
          <div style="font-weight: bold;">
            Here ${verb} your ${noun}
          </div>`;
      data.attachments.forEach((doc, index) => {
        attachmentsHtml += `
          <div style="margin-top: 4px;">
            <a class="email-button" target="_blank" href="${doc.url}"
              style="font-family: Calibri, sans-serif; font-size: 11px;
                line-height: 1.3; text-decoration: none; color: #0056b3;">
              ${index + 1}. ${doc.notes || doc.name}
            </a>
          </div>`;
      });
      attachmentsHtml += '</div>';
    }

    const content = `
      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:12px;">
        <strong style="color:#0070C0;">"We give progressive business. Big Automation"</strong><br>
        <strong style="color:#0070C0;">"Automate. Simplify. Grow - Smarter, Affordable ERP with Robotic Process Automation & Artificial Intelligence"</strong>
      </div>

      <div style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.7; color: #000000; padding-top:6px;">
        <strong>Dear ${data.contact_name || '[#CONTACT_NAME#]'},</strong>
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We greatly appreciate the time you and your team took to attend our ERP software demonstration.
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        It was a pleasure showcasing how Axiever can help streamline your business processes with our Smart, Simple, and Affordable ERP solutions.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        To help us analyze your specific requirements and pain points in greater detail, we kindly request you to complete the Post-Demo Business Questionnaire linked below.
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Your feedback will enable us to tailor a solution that best fits your business needs and proceed with a customized proposal for our services.
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please feel free to reach out if you have any questions while filling out the form - we are here to assist you every step of the way.
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Thank you once again for your time and consideration. We look forward to building a successful partnership.
      </div>

      <div style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.3;">
        ${postDemoLink}
        ${formLinks}
        ${ecommerceLink}
        ${attachmentsHtml}
      </div>

      <div style="margin:8pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Warm regards,<br>
        <strong style="color:#0070C0;">Axiever</strong><br>
        <em style="color:#0070C0;">Smart. Simple. Affordable.</em><br>
        <em style="color:#0070C0;">A Canadian-headquartered company helping businesses grow faster with AI-powered simplicity.</em>
      </div>

      <table style="margin:8pt 0 0 0;" cellpadding="0" cellspacing="0" style="margin-top:10px;">
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

// Export all demo templates
export const demoTemplates: EmailTemplateConfig[] = [
  demo1,
  demo2,
  demo3,
  demo4,
  demo5,
  demo6,
];
