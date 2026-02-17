// Implementation Phase Email Templates - Matching reference project structure
// Includes: Initiation, Planning, Configuration, Training, UAT, Data Migration, Go-Live

import { EmailTemplateConfig, EmailPlaceholderData } from './types';
import {
  BRAND,
  ICONS,
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
// INITIATION TEMPLATES
// ============================================================================

export const initiation1: EmailTemplateConfig = {
  id: 'initiation-1',
  name: 'Initiation Email 1 - Project Kickoff',
  tab: 'initiation',
  subject: 'Project Kickoff - Axiever Implementation',

  getBody: (data: EmailPlaceholderData) => {
    // Build attachments section (only if ecomid >= 1)
    let attachmentsSection = '';
    if (data.ecomid && parseInt(data.ecomid) >= 1 && data.attachments && data.attachments.length > 0) {
      const attachmentWord = data.attachments.length === 1 ? 'attachment' : 'attachments';
      const verb = data.attachments.length === 1 ? 'is' : 'are';

      attachmentsSection = `
        <h5>Here ${verb} your ${attachmentWord}</h5>
        ${data.attachments.map((doc, index) => `
          <a class="email-button" target="_blank" href="${doc.url}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: ${BRAND.buttonColor};
              text-decoration: none; border-radius: 4px;">
            ${index + 1}. ${doc.notes || doc.name}
          </a>${index < data.attachments.length - 1 ? ',<br>' : '<br>'}
        `).join('')}
      `;
    }

    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        As we prepare to initiate the <strong>${data.company_name || ''}</strong>, we would like to schedule a kick-off meeting to discuss the project details and introduce the team.
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Could you please let us know your availability for the kick-off meeting?
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Your earliest response would be greatly appreciated.
      </div>

      ${attachmentsSection}

      <div style="margin:8pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Best regards,<br>
        <strong style="color:${BRAND.primaryColor};">${BRAND.name}</strong><br>
        <em style="color:${BRAND.primaryColor};">${BRAND.slogan}</em><br>
        <em style="color:${BRAND.primaryColor};">${BRAND.description}</em>
      </div>

      <table style="margin:8pt 0 0 0;" cellpadding="0" cellspacing="0">
        <tr>
          <td style="border: none; vertical-align: top; border-right: 1.5px solid #0f0f0f; padding-right: 10px;">
            <a href="${BRAND.websiteUrl}" target="_blank">
              <img src="${BRAND.logoUrl}" width="75" alt="${BRAND.name} Logo" style="display: block; border: none;">
            </a>
          </td>
          <td style="font-size: 11px; font-family: Calibri, sans-serif; padding-left: 15px;">
            <strong>${data.user_first_name || ''} ${data.user_last_name || ''}</strong><br>
            <span style="color: ${BRAND.primaryColor};">${data.user_title || ''}</span><br>
            <a href="tel:+19059974044" style="color: ${BRAND.primaryColor}; text-decoration: none;">
              <img src="${ICONS.phone}" alt="Phone Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              ${BRAND.phone} ext. ${data.user_ext || ''}
            </a><br>
            <a href="mailto:${data.user_email || ''}" style="color: ${BRAND.primaryColor}; text-decoration: none;">
              <img src="${ICONS.email}" alt="Mail Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              ${data.user_email || ''}
            </a><br>
            <a href="${BRAND.websiteUrl}" style="color: ${BRAND.primaryColor}; text-decoration: none;">
              <img src="${ICONS.website}" alt="Website Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              ${BRAND.website}
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

export const initiation2: EmailTemplateConfig = {
  id: 'initiation-2',
  name: 'Initiation Email 2 - Kickoff Follow-up',
  tab: 'initiation',
  subject: 'Follow-up: Project Kickoff Meeting - Axiever',

  getBody: (data: EmailPlaceholderData) => {
    // Build attachments section
    let attachmentsSection = '';
    if (data.attachments && data.attachments.length > 0) {
      const attachmentWord = data.attachments.length === 1 ? 'attachment' : 'attachments';
      const verb = data.attachments.length === 1 ? 'is' : 'are';

      attachmentsSection = `
        <h5>Here ${verb} your ${attachmentWord}</h5>
        ${data.attachments.map((doc, index) => `
          <a class="email-button" target="_blank" href="${doc.url}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: ${BRAND.buttonColor};
              text-decoration: none; border-radius: 4px;">
            ${index + 1}. ${doc.notes || doc.name}
          </a>${index < data.attachments.length - 1 ? ',<br>' : '<br>'}
        `).join('')}
      `;
    }

    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        I hope you're doing well. I wanted to follow up on my previous email regarding the kick-off meeting for <strong>${data.company_name || ''}</strong>. We're eager to connect, align on project details, and introduce the team.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Could you kindly share your availability so we can schedule a time that works best for you? We appreciate your prompt response and look forward to getting started.
      </div>

      ${attachmentsSection}

      <div style="margin:8pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Best regards,<br>
        <strong style="color:${BRAND.primaryColor};">${BRAND.name}</strong><br>
        <em style="color:${BRAND.primaryColor};">${BRAND.slogan}</em><br>
        <em style="color:${BRAND.primaryColor};">${BRAND.description}</em>
      </div>

      <table style="margin:8pt 0 0 0;" cellpadding="0" cellspacing="0">
        <tr>
          <td style="border: none; vertical-align: top; border-right: 1.5px solid #0f0f0f; padding-right: 10px;">
            <a href="${BRAND.websiteUrl}" target="_blank">
              <img src="${BRAND.logoUrl}" width="75" alt="${BRAND.name} Logo" style="display: block; border: none;">
            </a>
          </td>
          <td style="font-size: 11px; font-family: Calibri, sans-serif; padding-left: 15px;">
            <strong>${data.user_first_name || ''} ${data.user_last_name || ''}</strong><br>
            <span style="color: ${BRAND.primaryColor};">${data.user_title || ''}</span><br>
            <a href="tel:+19059974044" style="color: ${BRAND.primaryColor}; text-decoration: none;">
              <img src="${ICONS.phone}" alt="Phone Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              ${BRAND.phone} ext. ${data.user_ext || ''}
            </a><br>
            <a href="mailto:${data.user_email || ''}" style="color: ${BRAND.primaryColor}; text-decoration: none;">
              <img src="${ICONS.email}" alt="Mail Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              ${data.user_email || ''}
            </a><br>
            <a href="${BRAND.websiteUrl}" style="color: ${BRAND.primaryColor}; text-decoration: none;">
              <img src="${ICONS.website}" alt="Website Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              ${BRAND.website}
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

export const initiation3: EmailTemplateConfig = {
  id: 'initiation-3',
  name: 'Initiation Email 3 - Meeting Confirmation',
  tab: 'initiation',
  subject: 'Kickoff Meeting Confirmed - Axiever Implementation',

  getBody: (data: EmailPlaceholderData) => {
    // Build attachments section
    let attachmentsSection = '';
    if (data.attachments && data.attachments.length > 0) {
      const attachmentWord = data.attachments.length === 1 ? 'attachment' : 'attachments';
      const verb = data.attachments.length === 1 ? 'is' : 'are';

      attachmentsSection = `
        <h5>Here ${verb} your ${attachmentWord}</h5>
        ${data.attachments.map((doc, index) => `
          <a class="email-button" target="_blank" href="${doc.url}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: ${BRAND.buttonColor};
              text-decoration: none; border-radius: 4px;">
            ${index + 1}. ${doc.notes || doc.name}
          </a>${index < data.attachments.length - 1 ? ',<br>' : '<br>'}
        `).join('')}
      `;
    }

    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Thank you for confirming your availability. The kick-off meeting for <strong>${data.company_name || ''}</strong> is scheduled as follows:
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Date: [Meeting Date]
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Time: [Meeting Date]
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Location/Meeting Link: [Physical Location or Video Conferencing Link]
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We have sent a calendar invite to all participants, including our internal team. Please let us know if you need any adjustments.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Looking forward to connecting and starting this project together!
      </div>

      ${attachmentsSection}

      <div style="margin:8pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Best regards,<br>
        <strong style="color:${BRAND.primaryColor};">${BRAND.name}</strong><br>
        <em style="color:${BRAND.primaryColor};">${BRAND.slogan}</em><br>
        <em style="color:${BRAND.primaryColor};">${BRAND.description}</em>
      </div>

      <table style="margin:8pt 0 0 0;" cellpadding="0" cellspacing="0">
        <tr>
          <td style="border: none; vertical-align: top; border-right: 1.5px solid #0f0f0f; padding-right: 10px;">
            <a href="${BRAND.websiteUrl}" target="_blank">
              <img src="${BRAND.logoUrl}" width="75" alt="${BRAND.name} Logo" style="display: block; border: none;">
            </a>
          </td>
          <td style="font-size: 11px; font-family: Calibri, sans-serif; padding-left: 15px;">
            <strong>${data.user_first_name || ''} ${data.user_last_name || ''}</strong><br>
            <span style="color: ${BRAND.primaryColor};">${data.user_title || ''}</span><br>
            <a href="tel:+19059974044" style="color: ${BRAND.primaryColor}; text-decoration: none;">
              <img src="${ICONS.phone}" alt="Phone Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              ${BRAND.phone} ext. ${data.user_ext || ''}
            </a><br>
            <a href="mailto:${data.user_email || ''}" style="color: ${BRAND.primaryColor}; text-decoration: none;">
              <img src="${ICONS.email}" alt="Mail Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              ${data.user_email || ''}
            </a><br>
            <a href="${BRAND.websiteUrl}" style="color: ${BRAND.primaryColor}; text-decoration: none;">
              <img src="${ICONS.website}" alt="Website Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              ${BRAND.website}
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

export const initiation4: EmailTemplateConfig = {
  id: 'initiation-4',
  name: 'Initiation Email 4 - Point of Contacts',
  tab: 'initiation',
  subject: 'Point of Contacts Form - Axiever Implementation',

  getBody: (data: EmailPlaceholderData) => {
    // Point of Contact link
    let pocLink = '';
    if (data.url8) {
      pocLink = `
        <a class="email-button" target="_blank" href="${data.url8}"
          style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
            font-size: 11px; color: #ffffff; background-color: ${BRAND.buttonColor};
            text-decoration: none; border-radius: 4px;">
          Point of Contact
        </a>
      `;
    }

    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        As we move forward with the project, we would like to ensure seamless coordination and timely communication between our teams. To support this, we kindly request you to fill out the Point of Contacts form.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        You can access and fill the form using the following link:
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        ${pocLink}
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        This form is designed to capture the contact details of key personnel from your organization who will be responsible for various project areas such as configuration, data migration, training, UAT, and others.
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Kindly ensure the following:
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Provide accurate Name, Email, and Phone Number for each relevant role.
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        If a single person is responsible for multiple areas, their details may be repeated accordingly.
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We appreciate your cooperation and look forward to your response at your earliest convenience. Should you have any questions while filling out the form, please feel free to reach out.
      </div>

      <div style="margin:8pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Best regards,<br>
        <strong style="color:${BRAND.primaryColor};">${BRAND.name}</strong><br>
        <em style="color:${BRAND.primaryColor};">${BRAND.slogan}</em><br>
        <em style="color:${BRAND.primaryColor};">${BRAND.description}</em>
      </div>

      <table style="margin:8pt 0 0 0;" cellpadding="0" cellspacing="0">
        <tr>
          <td style="border: none; vertical-align: top; border-right: 1.5px solid #0f0f0f; padding-right: 10px;">
            <a href="${BRAND.websiteUrl}" target="_blank">
              <img src="${BRAND.logoUrl}" width="75" alt="${BRAND.name} Logo" style="display: block; border: none;">
            </a>
          </td>
          <td style="font-size: 11px; font-family: Calibri, sans-serif; padding-left: 15px;">
            <strong>${data.user_first_name || ''} ${data.user_last_name || ''}</strong><br>
            <span style="color: ${BRAND.primaryColor};">${data.user_title || ''}</span><br>
            <a href="tel:+19059974044" style="color: ${BRAND.primaryColor}; text-decoration: none;">
              <img src="${ICONS.phone}" alt="Phone Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              ${BRAND.phone} ext. ${data.user_ext || ''}
            </a><br>
            <a href="mailto:${data.user_email || ''}" style="color: ${BRAND.primaryColor}; text-decoration: none;">
              <img src="${ICONS.email}" alt="Mail Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              ${data.user_email || ''}
            </a><br>
            <a href="${BRAND.websiteUrl}" style="color: ${BRAND.primaryColor}; text-decoration: none;">
              <img src="${ICONS.website}" alt="Website Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              ${BRAND.website}
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

export const initiation5: EmailTemplateConfig = {
  id: 'initiation-5',
  name: 'Initiation Email 5 - Communication Plan',
  tab: 'initiation',
  subject: 'Communication Plan - Axiever Implementation',

  getBody: (data: EmailPlaceholderData) => {
    // Build attachments section
    let attachmentsSection = '';
    if (data.attachments && data.attachments.length > 0) {
      const attachmentWord = data.attachments.length === 1 ? 'attachment' : 'attachments';
      const verb = data.attachments.length === 1 ? 'is' : 'are';

      attachmentsSection = `
        <h5>Here ${verb} your ${attachmentWord}</h5>
        ${data.attachments.map((doc, index) => `
          <a class="email-button" target="_blank" href="${doc.url}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: ${BRAND.buttonColor};
              text-decoration: none; border-radius: 4px;">
            ${index + 1}. ${doc.notes || doc.name}
          </a>${index < data.attachments.length - 1 ? ',<br>' : '<br>'}
        `).join('')}
      `;
    }

    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        As we prepare to begin our collaboration, I'm sharing the proposed Communication Plan that outlines the key meetings we'll hold throughout the course of the project. These sessions are structured to ensure clear coordination, timely inputs, and alignment between our teams at every stage.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please find attached the meeting schedule along with the purpose and frequency for each.
      </div>

      ${attachmentsSection}

      <div style="margin:8pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Best regards,<br>
        <strong style="color:${BRAND.primaryColor};">${BRAND.name}</strong><br>
        <em style="color:${BRAND.primaryColor};">${BRAND.slogan}</em><br>
        <em style="color:${BRAND.primaryColor};">${BRAND.description}</em>
      </div>

      <table style="margin:8pt 0 0 0;" cellpadding="0" cellspacing="0">
        <tr>
          <td style="border: none; vertical-align: top; border-right: 1.5px solid #0f0f0f; padding-right: 10px;">
            <a href="${BRAND.websiteUrl}" target="_blank">
              <img src="${BRAND.logoUrl}" width="75" alt="${BRAND.name} Logo" style="display: block; border: none;">
            </a>
          </td>
          <td style="font-size: 11px; font-family: Calibri, sans-serif; padding-left: 15px;">
            <strong>${data.user_first_name || ''} ${data.user_last_name || ''}</strong><br>
            <span style="color: ${BRAND.primaryColor};">${data.user_title || ''}</span><br>
            <a href="tel:+19059974044" style="color: ${BRAND.primaryColor}; text-decoration: none;">
              <img src="${ICONS.phone}" alt="Phone Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              ${BRAND.phone} ext. ${data.user_ext || ''}
            </a><br>
            <a href="mailto:${data.user_email || ''}" style="color: ${BRAND.primaryColor}; text-decoration: none;">
              <img src="${ICONS.email}" alt="Mail Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              ${data.user_email || ''}
            </a><br>
            <a href="${BRAND.websiteUrl}" style="color: ${BRAND.primaryColor}; text-decoration: none;">
              <img src="${ICONS.website}" alt="Website Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              ${BRAND.website}
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
// PLANNING TEMPLATES
// ============================================================================

export const planning1: EmailTemplateConfig = {
  id: 'planning-1',
  name: 'Planning Email 1 - Data Migration Meeting',
  tab: 'planning',
  subject: 'Data Migration Meeting - Axiever Implementation',

  getBody: (data: EmailPlaceholderData) => {
    // Build attachments section
    let attachmentsSection = '';
    if (data.attachments && data.attachments.length > 0) {
      const attachmentWord = data.attachments.length === 1 ? 'attachment' : 'attachments';
      const verb = data.attachments.length === 1 ? 'is' : 'are';

      attachmentsSection = `
        <h5>Here ${verb} your ${attachmentWord}</h5>
        ${data.attachments.map((doc, index) => `
          <a class="email-button" target="_blank" href="${doc.url}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: ${BRAND.buttonColor};
              text-decoration: none; border-radius: 4px; margin-bottom: 4px;">
            ${index + 1}. ${doc.notes || doc.name}
          </a>${index < data.attachments.length - 1 ? ',<br>' : '<br>'}
        `).join('')}
      `;
    }

    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        As part of our upcoming project, we need to schedule a meeting to discuss the data migration process. This meeting is crucial to ensure a smooth and successful transition of your data to the Axiever system.
      </div>

      <div style="margin: 4pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; color: #000000;">
        Proposed Meeting Agenda:
      </div>

      <ol style="margin: 4pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px; color: #000000;">
        <li style="margin-bottom: 2pt;">
          <span>Overview of the current state of your data.</span>
        </li>
        <li style="margin-bottom: 2pt;">
          <span>Data mapping with Axiever modules.</span>
        </li>
        <li style="margin-bottom: 2pt;">
          <span>Defining acceptance criteria and testing scenarios.</span>
        </li>
        <li style="margin-bottom: 2pt;">
          <span>Establishing a timeline for the data migration process.</span>
        </li>
        <li style="margin-bottom: 2pt;">
          <span>Addressing any questions or concerns you may have.</span>
        </li>
      </ol>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Proposed Meeting Dates and Times:
      </div>

      <ul style="margin: 0pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>
          <span style="color: ${BRAND.primaryColor}; font-weight: bold;">Option 1: Date and Time -</span>
        </li>
        <li>
          <span style="color: ${BRAND.primaryColor}; font-weight: bold;">Option 2: Date and Time -</span>
        </li>
        <li>
          <span style="color: ${BRAND.primaryColor}; font-weight: bold;">Option 3: Date and Time -</span>
        </li>
      </ul>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please let us know your availability for the proposed dates and times, or suggest alternative slots that work better for you.
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We look forward to your confirmation.
      </div>

      ${attachmentsSection}

      <div style="margin:8pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Best regards,<br>
        <strong style="color:${BRAND.primaryColor};">${BRAND.name}</strong><br>
        <em style="color:${BRAND.primaryColor};">${BRAND.slogan}</em><br>
        <em style="color:${BRAND.primaryColor};">${BRAND.description}</em>
      </div>

      <table style="margin:8pt 0 0 0;" cellpadding="0" cellspacing="0">
        <tr>
          <td style="border: none; vertical-align: top; border-right: 1.5px solid #0f0f0f; padding-right: 10px;">
            <a href="${BRAND.websiteUrl}" target="_blank">
              <img src="${BRAND.logoUrl}" width="75" alt="${BRAND.name} Logo" style="display: block; border: none;">
            </a>
          </td>
          <td style="font-size: 11px; font-family: Calibri, sans-serif; padding-left: 15px;">
            <strong>${data.user_first_name || ''} ${data.user_last_name || ''}</strong><br>
            <span style="color: ${BRAND.primaryColor};">${data.user_title || ''}</span><br>
            <a href="tel:+19059974044" style="color: ${BRAND.primaryColor}; text-decoration: none;">
              <img src="${ICONS.phone}" alt="Phone Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              ${BRAND.phone} ext. ${data.user_ext || ''}
            </a><br>
            <a href="mailto:${data.user_email || ''}" style="color: ${BRAND.primaryColor}; text-decoration: none;">
              <img src="${ICONS.email}" alt="Mail Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              ${data.user_email || ''}
            </a><br>
            <a href="${BRAND.websiteUrl}" style="color: ${BRAND.primaryColor}; text-decoration: none;">
              <img src="${ICONS.website}" alt="Website Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              ${BRAND.website}
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

export const planning2: EmailTemplateConfig = {
  id: 'planning-2',
  name: 'Planning Email 2 - Data Migration Follow-up',
  tab: 'planning',
  subject: 'Follow-up: Data Migration Meeting - Axiever',

  getBody: (data: EmailPlaceholderData) => {
    // Build attachments section
    let attachmentsSection = '';
    if (data.attachments && data.attachments.length > 0) {
      const attachmentWord = data.attachments.length === 1 ? 'attachment' : 'attachments';
      const verb = data.attachments.length === 1 ? 'is' : 'are';

      attachmentsSection = `
        <h5>Here ${verb} your ${attachmentWord}</h5>
        ${data.attachments.map((doc, index) => `
          <a class="email-button" target="_blank" href="${doc.url}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: ${BRAND.buttonColor};
              text-decoration: none; border-radius: 4px; margin-bottom: 4px;">
            ${index + 1}. ${doc.notes || doc.name}
          </a>${index < data.attachments.length - 1 ? ',<br>' : '<br>'}
        `).join('')}
      `;
    }

    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        I hope you're doing well. I wanted to follow up on my previous email regarding scheduling the data migration planning meeting.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        This discussion is essential to ensure a seamless transition of your data to the Axiever system. Could you confirm your availability for one of the proposed time slots, or let us know if an alternative time works better for you?
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Looking forward to your response. Please let us know if you have any questions in the meantime.
      </div>

      ${attachmentsSection}

      <div style="margin:8pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Best regards,<br>
        <strong style="color:${BRAND.primaryColor};">${BRAND.name}</strong><br>
        <em style="color:${BRAND.primaryColor};">${BRAND.slogan}</em><br>
        <em style="color:${BRAND.primaryColor};">${BRAND.description}</em>
      </div>

      <table style="margin:8pt 0 0 0;" cellpadding="0" cellspacing="0">
        <tr>
          <td style="border: none; vertical-align: top; border-right: 1.5px solid #0f0f0f; padding-right: 10px;">
            <a href="${BRAND.websiteUrl}" target="_blank">
              <img src="${BRAND.logoUrl}" width="75" alt="${BRAND.name} Logo" style="display: block; border: none;">
            </a>
          </td>
          <td style="font-size: 11px; font-family: Calibri, sans-serif; padding-left: 15px;">
            <strong>${data.user_first_name || ''} ${data.user_last_name || ''}</strong><br>
            <span style="color: ${BRAND.primaryColor};">${data.user_title || ''}</span><br>
            <a href="tel:+19059974044" style="color: ${BRAND.primaryColor}; text-decoration: none;">
              <img src="${ICONS.phone}" alt="Phone Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              ${BRAND.phone} ext. ${data.user_ext || ''}
            </a><br>
            <a href="mailto:${data.user_email || ''}" style="color: ${BRAND.primaryColor}; text-decoration: none;">
              <img src="${ICONS.email}" alt="Mail Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              ${data.user_email || ''}
            </a><br>
            <a href="${BRAND.websiteUrl}" style="color: ${BRAND.primaryColor}; text-decoration: none;">
              <img src="${ICONS.website}" alt="Website Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              ${BRAND.website}
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

export const planning3: EmailTemplateConfig = {
  id: 'planning-3',
  name: 'Planning Email 3 - Send Configuration',
  tab: 'planning',
  subject: 'Request for Information to Configure Your ERP Instance',

  getBody: (data: EmailPlaceholderData) => {
    // Build configuration form links
    let configLinks = '';

    if (data.url3) {
      configLinks += `
        <a class="email-button" target="_blank" href="${data.url3}"
          style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
            font-size: 11px; color: #ffffff; background-color: #0056b3;
            text-decoration: none; border-radius: 4px; margin-bottom: 4px;">
          Configuration Form
        </a><br>
      `;
    }

    if (data.config_url_warehouse) {
      configLinks += `
        <a class="email-button" target="_blank" href="${data.config_url_warehouse}"
          style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
            font-size: 11px; color: #ffffff; background-color: #0056b3;
            text-decoration: none; border-radius: 4px; margin-bottom: 4px;">
          Warehouse Configuration Form
        </a><br>
      `;
    }

    if (data.config_url_impex) {
      configLinks += `
        <a class="email-button" target="_blank" href="${data.config_url_impex}"
          style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
            font-size: 11px; color: #ffffff; background-color: #0056b3;
            text-decoration: none; border-radius: 4px; margin-bottom: 4px;">
          Impex Configuration Form
        </a><br>
      `;
    }

    if (data.config_url_service) {
      configLinks += `
        <a class="email-button" target="_blank" href="${data.config_url_service}"
          style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
            font-size: 11px; color: #ffffff; background-color: #0056b3;
            text-decoration: none; border-radius: 4px; margin-bottom: 4px;">
          Service Configuration Form
        </a><br>
      `;
    }

    const content = `
      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:12px;">
        <strong style="color:#0070C0;">"We give progressive business. Big Automation"</strong><br>
        <strong style="color:#0070C0;">"Automate. Simplify. Grow – Smarter, Affordable ERP with Robotic Process Automation & Artificial Intelligence"</strong>
      </div>

      <div style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.7; color: #000000; padding-top:6px;">
        <strong>Dear ${data.contact_name || 'Valued Customer'},</strong>
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Greetings from Axiever!
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        As we begin the process of setting up your ERP system, we require some initial information to configure your instance according to your business needs.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        <strong>Please fill out the form using the link below:</strong>
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        ${configLinks}
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        The information you provide will enable us to tailor the system to your organization's structure and operations, ensuring smooth and accurate configuration.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We appreciate your prompt attention to this request. Should you have any questions or need assistance while completing the form, feel free to reach out—we're here to help.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Thank you for your cooperation.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Best regards,<br>
        <strong style="color:#0070C0;">Axiever</strong><br>
        <em style="color:#0070C0;">Smart. Simple. Affordable.</em><br>
        <em style="color:#0070C0;">A Canadian-headquartered company helping businesses grow faster with AI-powered simplicity.</em>
      </div>

      <table style="margin:8pt 0 0 0;" cellpadding="0" cellspacing="0">
        <tr>
          <td style="border: none; vertical-align: top; border-right: 1.5px solid #0f0f0f; padding-right: 10px;">
            <a href="https://www.axiever.com" target="_blank">
              <img src="https://axiever.com/wp-content/themes/twentytwenty/assets/images/Axiever.png" width="75" alt="Axiever Logo" style="display: block; border: none;">
            </a>
          </td>
          <td style="font-size: 11px; font-family: Calibri, sans-serif; padding-left: 15px;">
            <strong>${data.user_first_name || ''} ${data.user_last_name || ''}</strong><br>
            <span style="color: #0070C0;">${data.user_title || ''}</span><br>
            <a href="tel:+19059974044" style="color: #0070C0; text-decoration: none;">
              <img src="https://cdn-icons-png.flaticon.com/512/724/724664.png" alt="Phone Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              +1 (905) 997-4044 ext. ${data.user_ext || ''}
            </a><br>
            <a href="mailto:${data.user_email || ''}" style="color: #0070C0; text-decoration: none;">
              <img src="https://cdn-icons-png.flaticon.com/512/561/561127.png" alt="Mail Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              ${data.user_email || ''}
            </a><br>
            <a href="https://www.axiever.com" style="color: #0070C0; text-decoration: none;">
              <img src="https://cdn-icons-png.flaticon.com/512/535/535239.png" alt="Website Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
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

export const planning4: EmailTemplateConfig = {
  id: 'planning-4',
  name: 'Planning Email 4 - Send Data Migration',
  tab: 'planning',
  subject: 'Request for Data Migration Information',

  getBody: (data: EmailPlaceholderData) => {
    // Build data migration form link
    let dataMigrationLink = '';

    if (data.url2) {
      dataMigrationLink = `
        <a class="email-button" target="_blank" href="${data.url2}"
          style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
            font-size: 11px; color: #ffffff; background-color: #0056b3;
            text-decoration: none; border-radius: 4px; margin-bottom: 4px;">
          Data Migration Form
        </a><br>
      `;
    }

    const content = `
      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:12px;">
        <strong style="color:#0070C0;">"We give progressive business. Big Automation"</strong><br>
        <strong style="color:#0070C0;">"Automate. Simplify. Grow – Smarter, Affordable ERP with Robotic Process Automation & Artificial Intelligence"</strong>
      </div>

      <div style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.7; color: #000000; padding-top:6px;">
        <strong>Dear ${data.contact_name || 'Valued Customer'},</strong>
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Greetings from Axiever!
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        As part of the ERP implementation for ${data.company_name || ''}, we are initiating the data migration process. To proceed efficiently, we kindly request you to provide the necessary information through the link below:
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        ${dataMigrationLink}
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        The form includes the following sections:
      </div>

      <ul style="margin: 0 0 0 0; padding-left: 20px; font-family: Calibri, sans-serif; font-size: 11px; list-style-type: disc;">
        <li>Current software used for business operations</li>
        <li>Module-wise data volumes and formats (e.g., Customers, Products, Invoices, etc.)</li>
        <li>Data quality and cleansing requirements</li>
        <li>Field mapping needs, historical data migration preferences</li>
        <li>Timeline expectations and availability of internal resources</li>
      </ul>

      <div style="margin:3pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        For each module, you will also find downloadable format templates to guide your data preparation.
      </div>

      <div style="margin:3pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please fill out the form at your earliest convenience so we can plan the migration timeline accordingly. If you have any questions or need support during the process, feel free to contact us—we're here to help.
      </div>

      <div style="margin:3pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Thank you for your cooperation.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Best regards,<br>
        <strong style="color:#0070C0;">Axiever</strong><br>
        <em style="color:#0070C0;">Smart. Simple. Affordable.</em><br>
        <em style="color:#0070C0;">A Canadian-headquartered company helping businesses grow faster with AI-powered simplicity.</em>
      </div>

      <table style="margin:8pt 0 0 0;" cellpadding="0" cellspacing="0">
        <tr>
          <td style="border: none; vertical-align: top; border-right: 1.5px solid #0f0f0f; padding-right: 10px;">
            <a href="https://www.axiever.com" target="_blank">
              <img src="https://axiever.com/wp-content/themes/twentytwenty/assets/images/Axiever.png" width="75" alt="Axiever Logo" style="display: block; border: none;">
            </a>
          </td>
          <td style="font-size: 11px; font-family: Calibri, sans-serif; padding-left: 15px;">
            <strong>${data.user_first_name || ''} ${data.user_last_name || ''}</strong><br>
            <span style="color: #0070C0;">${data.user_title || ''}</span><br>
            <a href="tel:+19059974044" style="color: #0070C0; text-decoration: none;">
              <img src="https://cdn-icons-png.flaticon.com/512/724/724664.png" alt="Phone Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              +1 (905) 997-4044 ext. ${data.user_ext || ''}
            </a><br>
            <a href="mailto:${data.user_email || ''}" style="color: #0070C0; text-decoration: none;">
              <img src="https://cdn-icons-png.flaticon.com/512/561/561127.png" alt="Mail Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              ${data.user_email || ''}
            </a><br>
            <a href="https://www.axiever.com" style="color: #0070C0; text-decoration: none;">
              <img src="https://cdn-icons-png.flaticon.com/512/535/535239.png" alt="Website Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
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

export const planning5: EmailTemplateConfig = {
  id: 'planning-5',
  name: 'Planning Email 5 - Send Training Information',
  tab: 'planning',
  subject: 'Request for ERP User Training Information',

  getBody: (data: EmailPlaceholderData) => {
    // Build training form links
    let trainingLinks = '';

    if (data.url4) {
      trainingLinks += `
        <a class="email-button" target="_blank" href="${data.url4}"
          style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
            font-size: 11px; color: #ffffff; background-color: #0056b3;
            text-decoration: none; border-radius: 4px; margin-bottom: 4px;">
          Training Details Form
        </a><br>
      `;
    }

    if (data.config_url_warehouse) {
      trainingLinks += `
        <a class="email-button" target="_blank" href="${data.config_url_warehouse}"
          style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
            font-size: 11px; color: #ffffff; background-color: #0056b3;
            text-decoration: none; border-radius: 4px; margin-bottom: 4px;">
          Warehouse Training Form
        </a><br>
      `;
    }

    if (data.config_url_impex) {
      trainingLinks += `
        <a class="email-button" target="_blank" href="${data.config_url_impex}"
          style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
            font-size: 11px; color: #ffffff; background-color: #0056b3;
            text-decoration: none; border-radius: 4px; margin-bottom: 4px;">
          Impex Training Form
        </a><br>
      `;
    }

    if (data.config_url_service) {
      trainingLinks += `
        <a class="email-button" target="_blank" href="${data.config_url_service}"
          style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
            font-size: 11px; color: #ffffff; background-color: #0056b3;
            text-decoration: none; border-radius: 4px; margin-bottom: 4px;">
          Service Training Form
        </a><br>
      `;
    }

    const content = `
      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:12px;">
        <strong style="color:#0070C0;">"We give progressive business. Big Automation"</strong><br>
        <strong style="color:#0070C0;">"Automate. Simplify. Grow – Smarter, Affordable ERP with Robotic Process Automation & Artificial Intelligence"</strong>
      </div>

      <div style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.7; color: #000000; padding-top:6px;">
        <strong>Dear ${data.contact_name || 'Valued Customer'},</strong>
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Greetings from Axiever!
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        As part of the ERP implementation for <strong>${data.company_name || ''}</strong>, we are organizing user training sessions to ensure your team is well-prepared to use the system effectively.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        To help us plan the training schedule and content, we kindly request you to fill out the following form with the relevant user details:
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        ${trainingLinks}
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please provide the following information for each participant:
      </div>

      <ul style="margin: 0 0 0 0; padding-left: 20px; font-family: Calibri, sans-serif; font-size: 11px; list-style-type: disc;">
        <li>Name, department, contact details</li>
        <li>ERP modules/sub-modules to be covered</li>
      </ul>

      <div style="margin:3pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        <em>Note: An individual can be nominated for multiple modules or roles, if applicable.</em>
      </div>

      <div style="margin:3pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We would appreciate it if you could complete the form at your earliest convenience. If you need any assistance, please feel free to reach out.
      </div>

      <div style="margin:3pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Thank you for your cooperation.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Best regards,<br>
        <strong style="color:#0070C0;">Axiever</strong><br>
        <em style="color:#0070C0;">Smart. Simple. Affordable.</em><br>
        <em style="color:#0070C0;">A Canadian-headquartered company helping businesses grow faster with AI-powered simplicity.</em>
      </div>

      <table style="margin:8pt 0 0 0;" cellpadding="0" cellspacing="0">
        <tr>
          <td style="border: none; vertical-align: top; border-right: 1.5px solid #0f0f0f; padding-right: 10px;">
            <a href="https://www.axiever.com" target="_blank">
              <img src="https://axiever.com/wp-content/themes/twentytwenty/assets/images/Axiever.png" width="75" alt="Axiever Logo" style="display: block; border: none;">
            </a>
          </td>
          <td style="font-size: 11px; font-family: Calibri, sans-serif; padding-left: 15px;">
            <strong>${data.user_first_name || ''} ${data.user_last_name || ''}</strong><br>
            <span style="color: #0070C0;">${data.user_title || ''}</span><br>
            <a href="tel:+19059974044" style="color: #0070C0; text-decoration: none;">
              <img src="https://cdn-icons-png.flaticon.com/512/724/724664.png" alt="Phone Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              +1 (905) 997-4044 ext. ${data.user_ext || ''}
            </a><br>
            <a href="mailto:${data.user_email || ''}" style="color: #0070C0; text-decoration: none;">
              <img src="https://cdn-icons-png.flaticon.com/512/561/561127.png" alt="Mail Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              ${data.user_email || ''}
            </a><br>
            <a href="https://www.axiever.com" style="color: #0070C0; text-decoration: none;">
              <img src="https://cdn-icons-png.flaticon.com/512/535/535239.png" alt="Website Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
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

export const sendErpImplementationForms: EmailTemplateConfig = {
  id: 'send_erp_implementation_forms',
  name: 'Planning Email 6 - Send ERP Form Reminder',
  tab: 'planning',
  subject: 'Reminder: Submission of ERP Implementation Forms',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
    <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:12px; ">
        <strong style="color:#0070C0;">"We give progressive business. Big Automation"</strong><br>
        <strong style="color:#0070C0;">"Automate. Simplify. Grow – Smarter, Affordable ERP with Robotic Process
            Automation & Artificial Intelligence"</strong>
    </div>
    <div
        style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.7; color: #000000; padding-top:6px;">
        <strong>Dear ${data.contact_name || ''},</strong>
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        This is a kind reminder regarding the Data Migration, Configuration, and Training Details forms we shared with
        you earlier as part of the ERP implementation process.
    </div>
    <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We kindly request you to submit the completed forms at your earliest convenience, as they are essential for us
        to proceed with the next steps of the project.
    </div>
    <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Your timely response will help us maintain the project timeline and ensure a smooth implementation.
    </div>
    <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please let us know if you need any clarification or support in completing the forms.
    </div>
    <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Thank you for your attention.
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px; ">
        Best regards,<br>
        <strong style="color:#0070C0;">Axiever</strong><br>
        <em style="color:#0070C0;">Smart. Simple. Affordable.</em><br>
        <em style="color:#0070C0;">A Canadian-headquartered company helping businesses grow faster with AI-powered
            simplicity.</em>
    </div>
    <table style="margin:8pt 0 0 0; margin-top:10px;" cellpadding="0" cellspacing="0">
        <tr>
            <td style="border: none; vertical-align: top; border-right: 1.5px solid #0f0f0f; padding-right: 10px;">
                <a href="https://www.axiever.com" target="_blank">
                    <img src="https://axiever.com/wp-content/themes/twentytwenty/assets/images/Axiever.png"
                        width="75" alt="Axiever Logo" style="display: block; border: none;">
                </a>
            </td>
            <td style="font-size: 11px; font-family: Calibri, sans-serif; padding-left: 15px;">
                <strong>${data.user_first_name || ''} ${data.user_last_name || ''}</strong><br>
                <span style="color: #0070C0;">${data.user_title || ''}</span><br>
                <a href="tel:+19059974044" style="color: #0070C0; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/724/724664.png" alt="Phone Icon" width="14"
                        style="vertical-align: middle; margin-right: 5px;">
                    +1 (905) 997-4044 ext. ${data.user_ext || ''}
                </a><br>
                <a href="mailto:${data.user_email || ''}" style="color: #0070C0; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/561/561127.png" alt="Mail Icon" width="14"
                        style="vertical-align: middle; margin-right: 5px;">
                    ${data.user_email || ''}
                </a><br>
                <a href="https://www.axiever.com" style="color: #0070C0; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/535/535239.png" alt="Website Icon" width="14"
                        style="vertical-align: middle; margin-right: 5px;">
                    www.axiever.com
                </a>
            </td>
        </tr>
    </table>

    <div style="margin:10px 0 0 0; font-size:11px; color:#666; padding-top:10px; font-family:Calibri, sans-serif; ">
        <em>This email and any attachments are confidential and may be privileged.
            If you are not the intended recipient, please notify the sender immediately and delete this email.</em>
    </div>
    `;

    return wrapEmail(content);
  },
};

export const meetingToGuideCustomerOnForms: EmailTemplateConfig = {
  id: 'meeting_to_guide_customer_on_forms',
  name: 'Planning Email 7 - Meeting to Guide Customer on Forms',
  tab: 'planning',
  subject: 'Schedule a Meeting to Guide You on Submitted Forms',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
    <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:12px; ">
        <strong style="color:#0070C0;">"We give progressive business. Big Automation"</strong><br>
        <strong style="color:#0070C0;">"Automate. Simplify. Grow – Smarter, Affordable ERP with Robotic Process
            Automation & Artificial Intelligence"</strong>
    </div>
    <div
        style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.7; color: #000000; padding-top:6px;">
        <strong>Dear ${data.contact_name || ''},</strong>
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We have shared the <strong>Data Migration, Configuration,</strong> and <strong>Training Details</strong> forms
        with you.
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        To simplify the process and ensure there is no confusion while filling out the forms, we would like to schedule
        a meeting to walk you through each one. During this session, we'll explain what kind of details are expected,
        clarify the meaning of each section or field, and answer any questions you may have. This will help avoid any
        back-and-forth and ensure accurate information is submitted.
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please let us know a convenient time for this discussion. Also, if you prefer to have separate sessions with
        individual stakeholders for each form, we'll be happy to arrange that accordingly.
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Looking forward to your response.
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px; ">
        Best regards,<br>
        <strong style="color:#0070C0;">Axiever</strong><br>
        <em style="color:#0070C0;">Smart. Simple. Affordable.</em><br>
        <em style="color:#0070C0;">A Canadian-headquartered company helping businesses grow faster with AI-powered
            simplicity.</em>
    </div>
    <table style="margin:8pt 0 0 0; margin-top:10px;" cellpadding="0" cellspacing="0">
        <tr>
            <td style="border: none; vertical-align: top; border-right: 1.5px solid #0f0f0f; padding-right: 10px;">
                <a href="https://www.axiever.com" target="_blank">
                    <img src="https://axiever.com/wp-content/themes/twentytwenty/assets/images/Axiever.png"
                        width="75" alt="Axiever Logo" style="display: block; border: none;">
                </a>
            </td>
            <td style="font-size: 11px; font-family: Calibri, sans-serif; padding-left: 15px;">
                <strong>${data.user_first_name || ''} ${data.user_last_name || ''}</strong><br>
                <span style="color: #0070C0;">${data.user_title || ''}</span><br>
                <a href="tel:+19059974044" style="color: #0070C0; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/724/724664.png" alt="Phone Icon" width="14"
                        style="vertical-align: middle; margin-right: 5px;">
                    +1 (905) 997-4044 ext. ${data.user_ext || ''}
                </a><br>
                <a href="mailto:${data.user_email || ''}" style="color: #0070C0; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/561/561127.png" alt="Mail Icon" width="14"
                        style="vertical-align: middle; margin-right: 5px;">
                    ${data.user_email || ''}
                </a><br>
                <a href="https://www.axiever.com" style="color: #0070C0; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/535/535239.png" alt="Website Icon" width="14"
                        style="vertical-align: middle; margin-right: 5px;">
                    www.axiever.com
                </a>
            </td>
        </tr>
    </table>

    <div style="margin:10px 0 0 0; font-size:11px; color:#666; padding-top:10px; font-family:Calibri, sans-serif; ">
        <em>This email and any attachments are confidential and may be privileged.
            If you are not the intended recipient, please notify the sender immediately and delete this email.</em>
    </div>
    `;

    return wrapEmail(content);
  },
};

// ============================================================================
// CONFIGURATION TEMPLATES
// ============================================================================

export const config1: EmailTemplateConfig = {
  id: 'config-1',
  name: 'Configuration Email 1 - Configuration Started',
  tab: 'configuration',
  subject: 'System Configuration in Progress - Axiever',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        I am pleased to inform you that we have begun the system configuration phase of your Axiever implementation.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Based on the requirements gathered, we are configuring:
      </div>

      <ul style="margin: 4pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>User roles and access permissions</li>
        <li>Workflow configurations</li>
        <li>Custom fields and forms</li>
        <li>Report templates</li>
        <li>Integration settings</li>
      </ul>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We will share progress updates regularly and reach out if we need any clarifications.
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

export const config2: EmailTemplateConfig = {
  id: 'config-2',
  name: 'Configuration Email 2 - Configuration Complete',
  tab: 'configuration',
  subject: 'System Configuration Complete - Ready for Review',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Great news! The system configuration is now complete and ready for your review.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We invite you to log in and explore the configured system. Please pay special attention to:
      </div>

      <ul style="margin: 4pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>Navigation and user interface</li>
        <li>Configured workflows</li>
        <li>Custom fields and forms</li>
        <li>Report outputs</li>
      </ul>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        If you find any areas that need adjustment, please document them so we can address them before moving to the training phase.
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
// TRAINING TEMPLATES
// ============================================================================

export const training1: EmailTemplateConfig = {
  id: 'training-1',
  name: 'Training Email 1 - Training Schedule',
  tab: 'training',
  subject: 'Scheduling Meeting for Instance details Verification',

  getBody: (data: EmailPlaceholderData) => {
    // Build attachments section
    let attachmentsSection = '';
    if (data.attachments && data.attachments.length > 0) {
      const attachmentWord = data.attachments.length === 1 ? 'attachment' : 'attachments';
      const verb = data.attachments.length === 1 ? 'is' : 'are';

      attachmentsSection = `
        <h5>Here ${verb} your ${attachmentWord}</h5>
        ${data.attachments.map((doc, index) => `
          <a class="email-button" target="_blank" href="${doc.url}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: #0056b3;
              text-decoration: none; border-radius: 4px; margin-bottom: 4px;">
            ${index + 1}. ${doc.notes || doc.name}
          </a>${index < data.attachments.length - 1 ? ',<br>' : '<br>'}
        `).join('')}
      `;
    }

    const content = `
    <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:12px; ">
        <strong style="color:#0070C0;">"We give progressive business. Big Automation"</strong><br>
        <strong style="color:#0070C0;">"Automate. Simplify. Grow – Smarter, Affordable ERP with Robotic Process
            Automation & Artificial Intelligence"</strong>
    </div>
    <div
        style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.7; color: #000000; padding-top:6px;">
        <strong>Dear ${data.contact_name || ''},</strong>
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        As we approach the training phase of our project, we would like to schedule a meeting to finalize the training
        schedule and ensure it aligns with your team's availability and expectations.
    </div>
    <div style="margin: 4pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; color: #000000;">
        Proposed Meeting Agenda:
    </div>
    <ol style="margin: 4pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px; color: #000000;">
        <li style="margin-bottom: 2pt;">
            <span>Review the draft training plan.</span>
        </li>
        <li style="margin-bottom: 2pt;">
            <span>Discuss the proposed topics and session durations.</span>
        </li>
        <li style="margin-bottom: 2pt;">
            <span>Address any changes or additions you might have.</span>
        </li>
        <li style="margin-bottom: 2pt;">
            <span>Confirm dates and times for each training session.</span>
        </li>
        <li style="margin-bottom: 2pt;">
            <span>Discuss any other questions or concerns you may have.</span>
        </li>
    </ol>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please let us know your availability for the proposed dates and times, or suggest alternative slots that work
        better for you. We look forward to your confirmation and a productive discussion.
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        ${attachmentsSection}
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px; ">
        Best regards,<br>
        <strong style="color:#0070C0;">Axiever</strong><br>
        <em style="color:#0070C0;">Smart. Simple. Affordable.</em><br>
        <em style="color:#0070C0;">A Canadian-headquartered company helping businesses grow faster with AI-powered
            simplicity.</em>
    </div>
    <table style="margin:8pt 0 0 0; margin-top:10px;" cellpadding="0" cellspacing="0">
        <tr>
            <td style="border: none; vertical-align: top; border-right: 1.5px solid #0f0f0f; padding-right: 10px;">
                <a href="https://www.axiever.com" target="_blank">
                    <img src="https://axiever.com/wp-content/themes/twentytwenty/assets/images/Axiever.png"
                        width="75" alt="Axiever Logo" style="display: block; border: none;">
                </a>
            </td>
            <td style="font-size: 11px; font-family: Calibri, sans-serif; padding-left: 15px;">
                <strong>${data.user_first_name || ''} ${data.user_last_name || ''}</strong><br>
                <span style="color: #0070C0;">${data.user_title || ''}</span><br>
                <a href="tel:+19059974044" style="color: #0070C0; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/724/724664.png" alt="Phone Icon" width="14"
                        style="vertical-align: middle; margin-right: 5px;">
                    +1 (905) 997-4044 ext. ${data.user_ext || ''}
                </a><br>
                <a href="mailto:${data.user_email || ''}" style="color: #0070C0; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/561/561127.png" alt="Mail Icon" width="14"
                        style="vertical-align: middle; margin-right: 5px;">
                    ${data.user_email || ''}
                </a><br>
                <a href="https://www.axiever.com" style="color: #0070C0; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/535/535239.png" alt="Website Icon" width="14"
                        style="vertical-align: middle; margin-right: 5px;">
                    www.axiever.com
                </a>
            </td>
        </tr>
    </table>

    <div style="margin:10px 0 0 0; font-size:11px; color:#666; padding-top:10px; font-family:Calibri, sans-serif; ">
        <em>This email and any attachments are confidential and may be privileged.
            If you are not the intended recipient, please notify the sender immediately and delete this email.</em>
    </div>
    `;

    return wrapEmail(content);
  },
};

export const training2: EmailTemplateConfig = {
  id: 'training-2',
  name: 'Training Email 2 - Training Schedule Follow-up',
  tab: 'training',
  subject: 'Follow-up: Scheduling Meeting for Instance Details Verification',

  getBody: (data: EmailPlaceholderData) => {
    // Build attachments section
    let attachmentsSection = '';
    if (data.attachments && data.attachments.length > 0) {
      const attachmentWord = data.attachments.length === 1 ? 'attachment' : 'attachments';
      const verb = data.attachments.length === 1 ? 'is' : 'are';

      attachmentsSection = `
        <h5>Here ${verb} your ${attachmentWord}</h5>
        ${data.attachments.map((doc, index) => `
          <a class="email-button" target="_blank" href="${doc.url}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: #0056b3;
              text-decoration: none; border-radius: 4px; margin-bottom: 4px;">
            ${index + 1}. ${doc.notes || doc.name}
          </a>${index < data.attachments.length - 1 ? ',<br>' : '<br>'}
        `).join('')}
      `;
    }

    const content = `
    <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:12px; ">
        <strong style="color:#0070C0;">"We give progressive business. Big Automation"</strong><br>
        <strong style="color:#0070C0;">"Automate. Simplify. Grow – Smarter, Affordable ERP with Robotic Process
            Automation & Artificial Intelligence"</strong>
    </div>
    <div
        style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.7; color: #000000; padding-top:6px;">
        <strong>Dear ${data.contact_name || ''},</strong>
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        I hope you're doing well. I wanted to follow up on my previous email regarding scheduling a meeting to finalize
        the training schedule for <strong>${data.company_name || ''}</strong>.
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        This discussion is essential to ensure the training plan aligns with your team's availability and expectations.
        Could you confirm your availability for one of the proposed time slots, or suggest a more convenient time?
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Looking forward to your response. Please let us know if you have any questions in the meantime.
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        ${attachmentsSection}
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px; ">
        Best regards,<br>
        <strong style="color:#0070C0;">Axiever</strong><br>
        <em style="color:#0070C0;">Smart. Simple. Affordable.</em><br>
        <em style="color:#0070C0;">A Canadian-headquartered company helping businesses grow faster with AI-powered
            simplicity.</em>
    </div>
    <table style="margin:8pt 0 0 0; margin-top:10px;" cellpadding="0" cellspacing="0">
        <tr>
            <td style="border: none; vertical-align: top; border-right: 1.5px solid #0f0f0f; padding-right: 10px;">
                <a href="https://www.axiever.com" target="_blank">
                    <img src="https://axiever.com/wp-content/themes/twentytwenty/assets/images/Axiever.png"
                        width="75" alt="Axiever Logo" style="display: block; border: none;">
                </a>
            </td>
            <td style="font-size: 11px; font-family: Calibri, sans-serif; padding-left: 15px;">
                <strong>${data.user_first_name || ''} ${data.user_last_name || ''}</strong><br>
                <span style="color: #0070C0;">${data.user_title || ''}</span><br>
                <a href="tel:+19059974044" style="color: #0070C0; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/724/724664.png" alt="Phone Icon" width="14"
                        style="vertical-align: middle; margin-right: 5px;">
                    +1 (905) 997-4044 ext. ${data.user_ext || ''}
                </a><br>
                <a href="mailto:${data.user_email || ''}" style="color: #0070C0; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/561/561127.png" alt="Mail Icon" width="14"
                        style="vertical-align: middle; margin-right: 5px;">
                    ${data.user_email || ''}
                </a><br>
                <a href="https://www.axiever.com" style="color: #0070C0; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/535/535239.png" alt="Website Icon" width="14"
                        style="vertical-align: middle; margin-right: 5px;">
                    www.axiever.com
                </a>
            </td>
        </tr>
    </table>

    <div style="margin:10px 0 0 0; font-size:11px; color:#666; padding-top:10px; font-family:Calibri, sans-serif; ">
        <em>This email and any attachments are confidential and may be privileged.
            If you are not the intended recipient, please notify the sender immediately and delete this email.</em>
    </div>
    `;

    return wrapEmail(content);
  },
};

export const training3: EmailTemplateConfig = {
  id: 'training-3',
  name: 'Training Email 3 - Training Schedule Approval',
  tab: 'training',
  subject: 'Meeting Request to Finalize Training Schedule',

  getBody: (data: EmailPlaceholderData) => {
    // Build attachments section
    let attachmentsSection = '';
    if (data.attachments && data.attachments.length > 0) {
      const attachmentWord = data.attachments.length === 1 ? 'attachment' : 'attachments';
      const verb = data.attachments.length === 1 ? 'is' : 'are';

      attachmentsSection = `
        <h5>Here ${verb} your ${attachmentWord}</h5>
        ${data.attachments.map((doc, index) => `
          <a class="email-button" target="_blank" href="${doc.url}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: #0056b3;
              text-decoration: none; border-radius: 4px; margin-bottom: 4px;">
            ${index + 1}. ${doc.notes || doc.name}
          </a>${index < data.attachments.length - 1 ? ',<br>' : '<br>'}
        `).join('')}
      `;
    }

    const content = `
    <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:12px; ">
        <strong style="color:#0070C0;">"We give progressive business. Big Automation"</strong><br>
        <strong style="color:#0070C0;">"Automate. Simplify. Grow – Smarter, Affordable ERP with Robotic Process
            Automation & Artificial Intelligence"</strong>
    </div>
    <div
        style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.7; color: #000000; padding-top:6px;">
        <strong>Dear ${data.contact_name || ''},</strong>
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Following our recent discussions and meeting, we have finalized the training plan for the upcoming project.
        Attached to this email, you will find the detailed training plan, which outlines the training topics, session
        durations, and the overall schedule.
    </div>
    <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We have incorporated the feedback received during our previous meeting to ensure the training sessions are
        aligned with your team's needs.
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please review the below training plan and let us know if there are any additional changes or concerns. We would
        appreciate your formal approval to proceed with the training as scheduled.
    </div>
    <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        If you have any questions or require further adjustments, feel free to reach out to me directly. Your timely
        approval will help us ensure a smooth and effective training program for your team.
    </div>
    <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Thank you for your cooperation and support.
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        ${attachmentsSection}
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px; ">
        Best regards,<br>
        <strong style="color:#0070C0;">Axiever</strong><br>
        <em style="color:#0070C0;">Smart. Simple. Affordable.</em><br>
        <em style="color:#0070C0;">A Canadian-headquartered company helping businesses grow faster with AI-powered
            simplicity.</em>
    </div>
    <table style="margin:8pt 0 0 0; margin-top:10px;" cellpadding="0" cellspacing="0">
        <tr>
            <td style="border: none; vertical-align: top; border-right: 1.5px solid #0f0f0f; padding-right: 10px;">
                <a href="https://www.axiever.com" target="_blank">
                    <img src="https://axiever.com/wp-content/themes/twentytwenty/assets/images/Axiever.png"
                        width="75" alt="Axiever Logo" style="display: block; border: none;">
                </a>
            </td>
            <td style="font-size: 11px; font-family: Calibri, sans-serif; padding-left: 15px;">
                <strong>${data.user_first_name || ''} ${data.user_last_name || ''}</strong><br>
                <span style="color: #0070C0;">${data.user_title || ''}</span><br>
                <a href="tel:+19059974044" style="color: #0070C0; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/724/724664.png" alt="Phone Icon" width="14"
                        style="vertical-align: middle; margin-right: 5px;">
                    +1 (905) 997-4044 ext. ${data.user_ext || ''}
                </a><br>
                <a href="mailto:${data.user_email || ''}" style="color: #0070C0; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/561/561127.png" alt="Mail Icon" width="14"
                        style="vertical-align: middle; margin-right: 5px;">
                    ${data.user_email || ''}
                </a><br>
                <a href="https://www.axiever.com" style="color: #0070C0; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/535/535239.png" alt="Website Icon" width="14"
                        style="vertical-align: middle; margin-right: 5px;">
                    www.axiever.com
                </a>
            </td>
        </tr>
    </table>

    <div style="margin:10px 0 0 0; font-size:11px; color:#666; padding-top:10px; font-family:Calibri, sans-serif; ">
        <em>This email and any attachments are confidential and may be privileged.
            If you are not the intended recipient, please notify the sender immediately and delete this email.</em>
    </div>
    `;

    return wrapEmail(content);
  },
};

export const training4: EmailTemplateConfig = {
  id: 'training-4',
  name: 'Training Email 4 - Training Schedule Approval Follow-up',
  tab: 'training',
  subject: 'Follow-up: Meeting Request to Finalize Training Schedule',

  getBody: (data: EmailPlaceholderData) => {
    // Build attachments section
    let attachmentsSection = '';
    if (data.attachments && data.attachments.length > 0) {
      const attachmentWord = data.attachments.length === 1 ? 'attachment' : 'attachments';
      const verb = data.attachments.length === 1 ? 'is' : 'are';

      attachmentsSection = `
        <h5>Here ${verb} your ${attachmentWord}</h5>
        ${data.attachments.map((doc, index) => `
          <a class="email-button" target="_blank" href="${doc.url}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: #0056b3;
              text-decoration: none; border-radius: 4px; margin-bottom: 4px;">
            ${index + 1}. ${doc.notes || doc.name}
          </a>${index < data.attachments.length - 1 ? ',<br>' : '<br>'}
        `).join('')}
      `;
    }

    const content = `
    <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:12px; ">
        <strong style="color:#0070C0;">"We give progressive business. Big Automation"</strong><br>
        <strong style="color:#0070C0;">"Automate. Simplify. Grow – Smarter, Affordable ERP with Robotic Process
            Automation & Artificial Intelligence"</strong>
    </div>
    <div
        style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.7; color: #000000; padding-top:6px;">
        <strong>Dear ${data.contact_name || ''},</strong>
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        I hope you're doing well. I wanted to follow up on my previous email regarding the final training plan for
        <strong>${data.company_name || ''}</strong>.
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We appreciate your time in reviewing the attached plan, which incorporates the feedback from our discussions.
        Please let us know if you have any additional comments or require adjustments. If everything looks good, we
        would appreciate your formal approval to proceed as scheduled.
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Your timely confirmation will help us ensure a smooth and effective training program for your team. Please feel
        free to reach out with any questions.
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Looking forward to your response.
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        ${attachmentsSection}
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px; ">
        Best regards,<br>
        <strong style="color:#0070C0;">Axiever</strong><br>
        <em style="color:#0070C0;">Smart. Simple. Affordable.</em><br>
        <em style="color:#0070C0;">A Canadian-headquartered company helping businesses grow faster with AI-powered
            simplicity.</em>
    </div>
    <table style="margin:8pt 0 0 0; margin-top:10px;" cellpadding="0" cellspacing="0">
        <tr>
            <td style="border: none; vertical-align: top; border-right: 1.5px solid #0f0f0f; padding-right: 10px;">
                <a href="https://www.axiever.com" target="_blank">
                    <img src="https://axiever.com/wp-content/themes/twentytwenty/assets/images/Axiever.png"
                        width="75" alt="Axiever Logo" style="display: block; border: none;">
                </a>
            </td>
            <td style="font-size: 11px; font-family: Calibri, sans-serif; padding-left: 15px;">
                <strong>${data.user_first_name || ''} ${data.user_last_name || ''}</strong><br>
                <span style="color: #0070C0;">${data.user_title || ''}</span><br>
                <a href="tel:+19059974044" style="color: #0070C0; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/724/724664.png" alt="Phone Icon" width="14"
                        style="vertical-align: middle; margin-right: 5px;">
                    +1 (905) 997-4044 ext. ${data.user_ext || ''}
                </a><br>
                <a href="mailto:${data.user_email || ''}" style="color: #0070C0; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/561/561127.png" alt="Mail Icon" width="14"
                        style="vertical-align: middle; margin-right: 5px;">
                    ${data.user_email || ''}
                </a><br>
                <a href="https://www.axiever.com" style="color: #0070C0; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/535/535239.png" alt="Website Icon" width="14"
                        style="vertical-align: middle; margin-right: 5px;">
                    www.axiever.com
                </a>
            </td>
        </tr>
    </table>

    <div style="margin:10px 0 0 0; font-size:11px; color:#666; padding-top:10px; font-family:Calibri, sans-serif; ">
        <em>This email and any attachments are confidential and may be privileged.
            If you are not the intended recipient, please notify the sender immediately and delete this email.</em>
    </div>
    `;

    return wrapEmail(content);
  },
};

export const training5: EmailTemplateConfig = {
  id: 'training-5',
  name: 'Training Email 5 - Upcoming Training Notification',
  tab: 'training',
  subject: 'Request for Approval of Final Training Plan',

  getBody: (data: EmailPlaceholderData) => {
    // Build attachments section
    let attachmentsSection = '';
    if (data.attachments && data.attachments.length > 0) {
      const attachmentWord = data.attachments.length === 1 ? 'attachment' : 'attachments';
      const verb = data.attachments.length === 1 ? 'is' : 'are';

      attachmentsSection = `
        <h5>Here ${verb} your ${attachmentWord}</h5>
        ${data.attachments.map((doc, index) => `
          <a class="email-button" target="_blank" href="${doc.url}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: #0056b3;
              text-decoration: none; border-radius: 4px; margin-bottom: 4px;">
            ${index + 1}. ${doc.notes || doc.name}
          </a>${index < data.attachments.length - 1 ? ',<br>' : '<br>'}
        `).join('')}
      `;
    }

    const content = `
    <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:12px; ">
        <strong style="color:#0070C0;">"We give progressive business. Big Automation"</strong><br>
        <strong style="color:#0070C0;">"Automate. Simplify. Grow – Smarter, Affordable ERP with Robotic Process
            Automation & Artificial Intelligence"</strong>
    </div>
    <div
        style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.7; color: #000000; padding-top:6px;">
        <strong>Dear ${data.contact_name || ''},</strong>
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We are pleased to announce the upcoming training program for the [Project Name]. This training is designed to
        ensure that you are well-equipped with the knowledge and skills necessary to effectively use the new system.
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        <strong>Training Program Details:</strong>
    </div>
    <ul
        style="margin: 0 0 0 0; padding-left: 20px; font-family: Calibri, sans-serif; font-size: 11px; list-style-type: disc;">
        <li>Start Date: [Start Date]</li>
        <li>Duration: [Duration] (e.g., 2 weeks)</li>
    </ul>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        <strong>Training Sessions:</strong>
    </div>
    <ul
        style="margin: 0 0 0 0; padding-left: 20px; font-family: Calibri, sans-serif; font-size: 11px; list-style-type: disc;">
        <li>Session 1: [Topic] - [Date and Time]</li>
        <li>Session 2: [Topic] - [Date and Time]</li>
    </ul>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        <strong>Training Environment Access</strong>
    </div>
    <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We have set up a dedicated training environment that mirrors the live instance. You will receive login details
        and access instructions shortly. Please make sure to test your access before the first session.
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        <strong>Topics Covered:</strong>
    </div>
    <ul
        style="margin: 0 0 0 0; padding-left: 20px; font-family: Calibri, sans-serif; font-size: 11px; list-style-type: disc;">
        <li>[Brief overview of key topics]</li>
        <li>[Another topic]</li>
        <li>[Another topic]</li>
    </ul>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        <strong>What to Expect:</strong>
    </div>
    <ul style="margin: 0 0 0 0; padding-left: 20px; font-family: Calibri, sans-serif; font-size: 11px; list-style-type: disc;">
        <li>Detailed walkthroughs of new features and functionalities.</li>
        <li>Hands-on exercises and practical applications.</li>
        <li>Q&A sessions to address any questions or concerns.</li>
    </ul>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        <strong>Preparation:</strong>
    </div>
    <ul style="margin: 0 0 0 0; padding-left: 20px; font-family: Calibri, sans-serif; font-size: 11px; list-style-type: disc;">
        <li>Ensure you have access to the training environment.</li>
        <li>Review the attached training schedule and mark your calendars.</li>
        <li>Bring any specific questions or scenarios you would like to discuss.</li>
    </ul>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We believe this training program will be highly beneficial and ensure a smooth transition to the new system.
        Your active participation is crucial for making the most of this opportunity.
    </div>
    <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Should you have any questions or need further information, please do not hesitate to reach out.
    </div>
    <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Looking forward to your participation.
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        ${attachmentsSection}
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px; ">
        Best regards,<br>
        <strong style="color:#0070C0;">Axiever</strong><br>
        <em style="color:#0070C0;">Smart. Simple. Affordable.</em><br>
        <em style="color:#0070C0;">A Canadian-headquartered company helping businesses grow faster with AI-powered
            simplicity.</em>
    </div>
    <table style="margin:8pt 0 0 0; margin-top:10px;" cellpadding="0" cellspacing="0">
        <tr>
            <td style="border: none; vertical-align: top; border-right: 1.5px solid #0f0f0f; padding-right: 10px;">
                <a href="https://www.axiever.com" target="_blank">
                    <img src="https://axiever.com/wp-content/themes/twentytwenty/assets/images/Axiever.png"
                        width="75" alt="Axiever Logo" style="display: block; border: none;">
                </a>
            </td>
            <td style="font-size: 11px; font-family: Calibri, sans-serif; padding-left: 15px;">
                <strong>${data.user_first_name || ''} ${data.user_last_name || ''}</strong><br>
                <span style="color: #0070C0;">${data.user_title || ''}</span><br>
                <a href="tel:+19059974044" style="color: #0070C0; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/724/724664.png" alt="Phone Icon" width="14"
                        style="vertical-align: middle; margin-right: 5px;">
                    +1 (905) 997-4044 ext. ${data.user_ext || ''}
                </a><br>
                <a href="mailto:${data.user_email || ''}" style="color: #0070C0; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/561/561127.png" alt="Mail Icon" width="14"
                        style="vertical-align: middle; margin-right: 5px;">
                    ${data.user_email || ''}
                </a><br>
                <a href="https://www.axiever.com" style="color: #0070C0; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/535/535239.png" alt="Website Icon" width="14"
                        style="vertical-align: middle; margin-right: 5px;">
                    www.axiever.com
                </a>
            </td>
        </tr>
    </table>

    <div style="margin:10px 0 0 0; font-size:11px; color:#666; padding-top:10px; font-family:Calibri, sans-serif; ">
        <em>This email and any attachments are confidential and may be privileged.
            If you are not the intended recipient, please notify the sender immediately and delete this email.</em>
    </div>
    `;

    return wrapEmail(content);
  },
};

export const training6: EmailTemplateConfig = {
  id: 'training-6',
  name: 'Training Email 6 - Training Feedback',
  tab: 'training',
  subject: 'Follow-up: Request for Approval of Final Training Plan',

  getBody: (data: EmailPlaceholderData) => {
    // Build attachments section
    let attachmentsSection = '';
    if (data.attachments && data.attachments.length > 0) {
      const attachmentWord = data.attachments.length === 1 ? 'attachment' : 'attachments';
      const verb = data.attachments.length === 1 ? 'is' : 'are';

      attachmentsSection = `
        <h5>Here ${verb} your ${attachmentWord}</h5>
        ${data.attachments.map((doc, index) => `
          <a class="email-button" target="_blank" href="${doc.url}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: #0056b3;
              text-decoration: none; border-radius: 4px; margin-bottom: 4px;">
            ${index + 1}. ${doc.notes || doc.name}
          </a>${index < data.attachments.length - 1 ? ',<br>' : '<br>'}
        `).join('')}
      `;
    }

    const content = `
    <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:12px; ">
        <strong style="color:#0070C0;">"We give progressive business. Big Automation"</strong><br>
        <strong style="color:#0070C0;">"Automate. Simplify. Grow – Smarter, Affordable ERP with Robotic Process
            Automation & Artificial Intelligence"</strong>
    </div>
    <div
        style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.7; color: #000000; padding-top:6px;">
        <strong>Dear ${data.contact_name || ''},</strong>
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We hope you found the training program for <strong>${data.company_name || ''}</strong> both informative and engaging.
        To help us improve our future training sessions, we kindly ask you to complete a brief survey about your
        experience.
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Your feedback is crucial in helping us understand what worked well and where we can make improvements. The
        survey should take no more than a few minutes to complete.
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        <strong>Training Feedback Survey:</strong>
    </div>
    <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        <strong>[Insert Survey Link Here]</strong>
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        <strong>Please complete the survey by: [Deadline Date]</strong>
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        <strong>What We Would Like to Know:</strong>
    </div>
    <ul style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        <li>Your overall satisfaction with the training program.</li>
        <li>The relevance and clarity of the training content.</li>
        <li>The effectiveness of the trainer.</li>
        <li>The usefulness of the training materials.</li>
        <li>Your confidence in applying the learned skills to your job.</li>
        <li>Any suggestions for improvement.</li>
    </ul>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We greatly appreciate your time and input. If you have any immediate concerns or require further assistance,
        please do not hesitate to reach out to us.
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Thank you for your participation and feedback.
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        ${attachmentsSection}
    </div>
    <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px; ">
        Best regards,<br>
        <strong style="color:#0070C0;">Axiever</strong><br>
        <em style="color:#0070C0;">Smart. Simple. Affordable.</em><br>
        <em style="color:#0070C0;">A Canadian-headquartered company helping businesses grow faster with AI-powered
            simplicity.</em>
    </div>
    <table style="margin:8pt 0 0 0; margin-top:10px;" cellpadding="0" cellspacing="0">
        <tr>
            <td style="border: none; vertical-align: top; border-right: 1.5px solid #0f0f0f; padding-right: 10px;">
                <a href="https://www.axiever.com" target="_blank">
                    <img src="https://axiever.com/wp-content/themes/twentytwenty/assets/images/Axiever.png"
                        width="75" alt="Axiever Logo" style="display: block; border: none;">
                </a>
            </td>
            <td style="font-size: 11px; font-family: Calibri, sans-serif; padding-left: 15px;">
                <strong>${data.user_first_name || ''} ${data.user_last_name || ''}</strong><br>
                <span style="color: #0070C0;">${data.user_title || ''}</span><br>
                <a href="tel:+19059974044" style="color: #0070C0; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/724/724664.png" alt="Phone Icon" width="14"
                        style="vertical-align: middle; margin-right: 5px;">
                    +1 (905) 997-4044 ext. ${data.user_ext || ''}
                </a><br>
                <a href="mailto:${data.user_email || ''}" style="color: #0070C0; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/561/561127.png" alt="Mail Icon" width="14"
                        style="vertical-align: middle; margin-right: 5px;">
                    ${data.user_email || ''}
                </a><br>
                <a href="https://www.axiever.com" style="color: #0070C0; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/535/535239.png" alt="Website Icon" width="14"
                        style="vertical-align: middle; margin-right: 5px;">
                    www.axiever.com
                </a>
            </td>
        </tr>
    </table>

    <div style="margin:10px 0 0 0; font-size:11px; color:#666; padding-top:10px; font-family:Calibri, sans-serif; ">
        <em>This email and any attachments are confidential and may be privileged.
            If you are not the intended recipient, please notify the sender immediately and delete this email.</em>
    </div>
    `;

    return wrapEmail(content);
  },
};

// ============================================================================
// UAT TEMPLATES
// ============================================================================

export const training7: EmailTemplateConfig = {
  id: 'training-7',
  name: 'UAT Email - UAT Acceptance',
  tab: 'uat',
  subject: 'Upcoming Training Program',

  getBody: (data: EmailPlaceholderData) => {
    // Build attachments section
    let attachmentsSection = '';
    if (data.attachments && data.attachments.length > 0) {
      const attachmentWord = data.attachments.length === 1 ? 'attachment' : 'attachments';
      const verb = data.attachments.length === 1 ? 'is' : 'are';

      attachmentsSection = `
        <h5>Here ${verb} your ${attachmentWord}</h5>
        ${data.attachments.map((doc, index) => `
          <a class="email-button" target="_blank" href="${doc.url}"
            style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
              font-size: 11px; color: #ffffff; background-color: #0056b3;
              text-decoration: none; border-radius: 4px; margin-bottom: 4px;">
            ${index + 1}. ${doc.notes || doc.name}
          </a>${index < data.attachments.length - 1 ? ',<br>' : '<br>'}
        `).join('')}
      `;
    }

    const content = `
    <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:12px; ">
        <strong style="color:#0070C0;">"We give progressive business. Big Automation"</strong><br>
        <strong style="color:#0070C0;">"Automate. Simplify. Grow – Smarter, Affordable ERP with Robotic Process
            Automation & Artificial Intelligence"</strong>
    </div>
    <div
        style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.7; color: #000000; padding-top:6px;">
        <strong>Dear ${data.contact_name || ''},</strong>
    </div>
    <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px; ">
        Please find attached the UAT Acceptance document for the Axiever ERP Implementation project.
    </div>
    <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px; ">
        ${attachmentsSection}
    </div>
    <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px; ">
        This document formalizes the acceptance of the Axiever ERP system by (Customer Name) following the successful
        completion of the User Acceptance Testing (UAT) phase. It confirms that the system meets the agreed business
        requirements and that all critical issues identified have been addressed satisfactorily.
    </div>
    <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px; ">
        Kindly review the document, sign it on your official letterhead, and send a scanned copy back to us at your
        earliest convenience.
    </div>
    <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px; ">
        Please feel free to reach out if you have any questions or require further clarification.
    </div>
    <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px; ">
        Thank you for your continued cooperation.
    </div>
    <div style="margin:4px 0 0 0; font-family:Calibri, sans-serif; font-size:11px; ">
        Best regards,<br>
        <strong style="color:#0070C0;">Axiever</strong><br>
        <em style="color:#0070C0;">Smart. Simple. Affordable.</em><br>
        <em style="color:#0070C0;">A Canadian-headquartered company helping businesses grow faster with AI-powered
            simplicity.</em>
    </div>
    <table style="margin:4px 0 0 0; margin-top:10px;" cellpadding="0" cellspacing="0">
        <tr>
            <td style="border: none; vertical-align: top; border-right: 1.5px solid #0f0f0f; padding-right: 10px;">
                <a href="https://www.axiever.com" target="_blank">
                    <img src="https://axiever.com/wp-content/themes/twentytwenty/assets/images/Axiever.png"
                        width="75" alt="Axiever Logo" style="display: block; border: none;">
                </a>
            </td>
            <td style="font-size: 11px; font-family: Calibri, sans-serif; padding-left: 15px;">
                <strong>${data.user_first_name || ''} ${data.user_last_name || ''}</strong><br>
                <span style="color: #0070C0;">${data.user_title || ''}</span><br>
                <a href="tel:+19059974044" style="color: #0070C0; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/724/724664.png" alt="Phone Icon" width="14"
                        style="vertical-align: middle; margin-right: 5px;">
                    +1 (905) 997-4044 ext. ${data.user_ext || ''}
                </a><br>
                <a href="mailto:${data.user_email || ''}" style="color: #0070C0; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/561/561127.png" alt="Mail Icon" width="14"
                        style="vertical-align: middle; margin-right: 5px;">
                    ${data.user_email || ''}
                </a><br>
                <a href="https://www.axiever.com" style="color: #0070C0; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/535/535239.png" alt="Website Icon" width="14"
                        style="vertical-align: middle; margin-right: 5px;">
                    www.axiever.com
                </a>
            </td>
        </tr>
    </table>
    <div style="margin:10px 0 0 0; font-size:11px; color:#666; padding-top:10px; font-family:Calibri, sans-serif; ">
        <em>This email and any attachments are confidential and may be privileged.
            If you are not the intended recipient, please notify the sender immediately and delete this email.</em>
    </div>
    `;

    return wrapEmail(content);
  },
};

export const uat1: EmailTemplateConfig = {
  id: 'uat-1',
  name: 'UAT Email 1 - UAT Instructions',
  tab: 'uat',
  subject: 'User Acceptance Testing (UAT) - Instructions',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We are now entering the User Acceptance Testing (UAT) phase. This is your opportunity to validate that the system meets your requirements.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        UAT Guidelines:
      </div>

      <ol style="margin: 4pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>Review the attached test scenarios</li>
        <li>Execute each test case as documented</li>
        <li>Document any issues or discrepancies</li>
        <li>Submit feedback through the UAT portal</li>
      </ol>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please access the UAT environment using the link below:
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

export const uat2: EmailTemplateConfig = {
  id: 'uat-2',
  name: 'UAT Email 2 - UAT Sign-off',
  tab: 'uat',
  subject: 'UAT Sign-off Request - Axiever',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        All identified issues from the UAT phase have been addressed. We kindly request your formal UAT sign-off to proceed to Go-Live.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please review the attached UAT summary report and sign the acceptance document.
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
// DATA MIGRATION TEMPLATES
// ============================================================================

export const dataMigration1: EmailTemplateConfig = {
  id: 'data-migration-1',
  name: 'Data Migration Email 1 - Data Migration Plan',
  tab: 'data-migration',
  subject: 'Data Migration Plan - Axiever Implementation',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We are ready to begin the data migration process. Please find attached the data migration plan and templates.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Data Migration Steps:
      </div>

      <ol style="margin: 4pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>Export data from your current system using the provided templates</li>
        <li>Clean and validate the data</li>
        <li>Upload to the secure migration portal</li>
        <li>We will perform the migration and validation</li>
        <li>Review migrated data for accuracy</li>
      </ol>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please submit your data using the link below:
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
// GO-LIVE TEMPLATES
// ============================================================================

export const goLive1: EmailTemplateConfig = {
  id: 'go-live-1',
  name: 'Go-Live Email 1 - Go-Live Preparation',
  tab: 'go-live',
  subject: 'Go-Live Preparation - Axiever',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We are approaching the Go-Live date! Here is what you need to prepare:
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Go-Live Checklist:
      </div>

      <ul style="margin: 4pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>Ensure all users have their login credentials</li>
        <li>Complete any pending training sessions</li>
        <li>Verify data migration accuracy</li>
        <li>Communicate the Go-Live date to all stakeholders</li>
        <li>Prepare for cutover from old system</li>
      </ul>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Our support team will be on standby during Go-Live to assist with any issues.
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

export const goLive2: EmailTemplateConfig = {
  id: 'go-live-2',
  name: 'Go-Live Email 2 - Go-Live Confirmation',
  tab: 'go-live',
  subject: 'Congratulations! Your System is Now Live - Axiever',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Congratulations! Your Axiever system is now live!
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Post Go-Live Support:
      </div>

      <ul style="margin: 4pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>Dedicated support team available for the first 2 weeks</li>
        <li>Daily check-in calls during the first week</li>
        <li>24/7 emergency support hotline</li>
        <li>Online help resources and documentation</li>
      </ul>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        If you encounter any issues, please do not hesitate to reach out. We are here to ensure your success!
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

// Export all implementation templates
export const implementationTemplates: EmailTemplateConfig[] = [
  initiation1,
  initiation2,
  initiation3,
  initiation4,
  initiation5,
  planning1,
  planning2,
  planning3,
  planning4,
  planning5,
  sendErpImplementationForms,
  meetingToGuideCustomerOnForms,
  config1,
  config2,
  training1,
  training2,
  training3,
  training4,
  training5,
  training6,
  training7,
  uat1,
  uat2,
  dataMigration1,
  goLive1,
  goLive2,
];
