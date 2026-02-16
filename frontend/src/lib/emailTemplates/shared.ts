// Shared Email Template Components - Branding elements matching reference project

import { EmailPlaceholderData, FormLink, Attachment, sanitizeSpecialChars } from './types';

// ============================================================================
// BRANDING ELEMENTS
// ============================================================================

export const BRAND = {
  name: 'Axiever',
  tagline1: '"We give progressive business. Big Automation"',
  tagline2: '"Automate. Simplify. Grow - Smarter, Affordable ERP with Robotic Process Automation & Artificial Intelligence"',
  slogan: 'Smart. Simple. Affordable.',
  description: 'A Canadian-headquartered company helping businesses grow faster with AI-powered simplicity.',
  website: 'www.axiever.com',
  websiteUrl: 'https://www.axiever.com',
  phone: '+1 (905) 997-4044',
  logoUrl: 'https://axiever.com/wp-content/themes/twentytwenty/assets/images/Axiever.png',
  primaryColor: '#0070C0',
  buttonColor: '#0056b3',
};

export const ICONS = {
  phone: 'https://cdn-icons-png.flaticon.com/512/724/724664.png',
  email: 'https://cdn-icons-png.flaticon.com/512/561/561127.png',
  website: 'https://cdn-icons-png.flaticon.com/512/535/535239.png',
};

export const RESOURCE_LINKS = {
  companyProfile: 'https://start.axiever.com/download_aws_file/company-27%5epartnerrequirement%5ePartner-1%5eaxiever-company-profile.pdf',
  videoGeneral: 'https://start.axiever.com/download_aws_file/company-27%5epartnerrequirement%5ePartner-1%5evideo-short-(general).mp4',
  videoBenefits: 'https://start.axiever.com/download_aws_file/company-27%5epartnerrequirement%5ePartner-1%5evideo-(benefits).mp4',
  pptProblems: 'https://start.axiever.com/download_aws_file/company-27%5epartnerrequirement%5ePartner-1%5eppt-(problems-and-solutions).pdf',
  oilGasImage: 'https://start.axiever.com/download_aws_file/company-27%5epartnerrequirement%5ePartner-1%5eOil_Gas-Petroleum_email.jpg',
  // Case Study Resources
  caseStudyPresentation: 'https://start.axiever.com/download_aws_file/company-27%5ecustomeronboarding%5eCase_Study_Presentation.pdf',
  caseStudyIntroduction: 'https://start.axiever.com/download_aws_file/company-27%5ecustomeronboarding%5eCase_Study_Introduction.mp4',
  benefits: 'https://start.axiever.com/download_aws_file/company-27%5ecustomeronboarding%5eBenefits.mp4',
  challenge1: 'https://start.axiever.com/download_aws_file/company-27%5ecustomeronboarding%5eChallenge_1.mp4',
  challenge2: 'https://start.axiever.com/download_aws_file/company-27%5ecustomeronboarding%5eChallenge_2.mp4',
  challenge3: 'https://start.axiever.com/download_aws_file/company-27%5ecustomeronboarding%5eChallenge_3.mp4',
  challenge4: 'https://start.axiever.com/download_aws_file/company-27%5ecustomeronboarding%5eChallenge_4.mp4',
  challenge5: 'https://start.axiever.com/download_aws_file/company-27%5ecustomeronboarding%5eChallenge_5.mp4',
  challenge6: 'https://start.axiever.com/download_aws_file/company-27%5ecustomeronboarding%5eChallenge_6.mp4',
  challenge7: 'https://start.axiever.com/download_aws_file/company-27%5ecustomeronboarding%5eChallenge_7.mp4',
  challenge8: 'https://start.axiever.com/download_aws_file/company-27%5ecustomeronboarding%5eChallenge_8.mp4',
  challenge9: 'https://start.axiever.com/download_aws_file/company-27%5ecustomeronboarding%5eChallenge_9.mp4',
  challenge10: 'https://start.axiever.com/download_aws_file/company-27%5ecustomeronboarding%5eChallenge_10.mp4',
};

// ============================================================================
// HEADER SECTION
// ============================================================================

export function getHeader(): string {
  return `
    <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:12px;">
      <strong style="color:${BRAND.primaryColor};">${BRAND.tagline1}</strong><br>
      <strong style="color:${BRAND.primaryColor};">${BRAND.tagline2}</strong>
    </div>
  `;
}

// ============================================================================
// GREETING SECTION
// ============================================================================

export function getGreeting(contactName: string): string {
  return `
    <div style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.7; color: #000000; padding-top:6px;">
      <strong>Dear ${contactName || '{{contact_name}}'},</strong>
    </div>
  `;
}

// ============================================================================
// FORM LINKS SECTION
// ============================================================================

export function getFormLinksSection(data: Partial<EmailPlaceholderData>): string {
  const { dueid, dueshortid, ecomid, url, url1, url3, url4, form_links } = data;
  let links = '';

  // Post-Demo Business Questionnaire
  if (dueshortid === 11 && url4) {
    links += `
      <div style="margin-top: 8px;">
        <a target="_blank" href="${url4}"
          style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
            font-size: 11px; color: #ffffff; background-color: ${BRAND.buttonColor};
            text-decoration: none; border-radius: 4px;">
          Post-Demo Business Questionnaire
        </a>
      </div>
    `;
  }

  // DueID-based Links
  if (dueid === 2 && url) {
    links += `
      <div style="margin-top: 8px;">
        <a target="_blank" href="${url}"
          style="font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.3;
            text-decoration: none; color: ${BRAND.buttonColor};">
          UAT Link
        </a>
      </div>
    `;
  } else if (dueid === 3 && url) {
    links += `
      <div style="margin-top: 8px;">
        <a target="_blank" href="${url}"
          style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
            font-size: 11px; color: #ffffff; background-color: ${BRAND.buttonColor};
            text-decoration: none; border-radius: 4px;">
          Data Migration
        </a>
      </div>
    `;
  } else if (dueid === 4 && url) {
    links += `
      <div style="margin-top: 8px;">
        <a target="_blank" href="${url}"
          style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
            font-size: 11px; color: #ffffff; background-color: ${BRAND.buttonColor};
            text-decoration: none; border-radius: 4px;">
          Due Diligence Questionnaire
        </a>
      </div>
    `;
  } else if (dueid === 11 && url) {
    links += `
      <div style="margin-top: 8px;">
        <a target="_blank" href="${url}"
          style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
            font-size: 11px; color: #ffffff; background-color: ${BRAND.buttonColor};
            text-decoration: none; border-radius: 4px;">
          Select Discussion Date & Time
        </a>
      </div>
    `;
  } else if (dueid === 21 && url) {
    links += `
      <div style="margin-top: 8px;">
        <a target="_blank" href="${url}"
          style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
            font-size: 11px; color: #ffffff; background-color: ${BRAND.buttonColor};
            text-decoration: none; border-radius: 4px;">
          Demo Date Time
        </a>
      </div>
    `;
  } else if (dueid === 33 && url) {
    links += `
      <div style="margin-top: 8px;">
        <a target="_blank" href="${url}"
          style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
            font-size: 11px; color: #ffffff; background-color: ${BRAND.buttonColor};
            text-decoration: none; border-radius: 4px;">
          Meeting Calendar Links
        </a>
      </div>
    `;
  } else if (dueid === 'presentation' && url) {
    links += `
      <div style="margin-top: 8px;">
        <a target="_blank" href="${url}"
          style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
            font-size: 11px; color: #ffffff; background-color: ${BRAND.buttonColor};
            text-decoration: none; border-radius: 4px;">
          Presentation Form
        </a>
      </div>
    `;
  } else if (dueid === 'demo' && url) {
    links += `
      <div style="margin-top: 8px;">
        <a target="_blank" href="${url}"
          style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
            font-size: 11px; color: #ffffff; background-color: ${BRAND.buttonColor};
            text-decoration: none; border-radius: 4px;">
          Demo Form
        </a>
      </div>
    `;
  }

  // Ecommerce Questionnaire
  if (ecomid && parseInt(ecomid) >= 1 && url1) {
    links += `
      <div style="margin-top: 8px;">
        <a target="_blank" href="${url1}"
          style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
            font-size: 11px; color: #ffffff; background-color: ${BRAND.buttonColor};
            text-decoration: none; border-radius: 4px;">
          Ecommerce Questionnaire
        </a>
      </div>
    `;
  }

  // Demo Video Link
  if (url3) {
    links += `
      <div style="margin-top: 8px;">
        <a target="_blank" href="${url3}"
          style="display: inline-block; padding: 6px 12px; font-family: Calibri, sans-serif;
            font-size: 11px; color: #ffffff; background-color: ${BRAND.buttonColor};
            text-decoration: none; border-radius: 4px;">
          Demo Video Link
        </a>
      </div>
    `;
  }

  return links ? `<div style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.3;">${links}</div>` : '';
}

// ============================================================================
// ATTACHMENTS SECTION
// ============================================================================

export function getAttachmentsSection(attachments: Attachment[]): string {
  if (!attachments || attachments.length === 0) return '';

  const attachmentWord = attachments.length === 1 ? 'attachment' : 'attachments';
  const verb = attachments.length === 1 ? 'is' : 'are';

  let html = `
    <div style="margin-top: 12px;">
      <div style="font-weight: bold;">
        Here ${verb} your ${attachmentWord}:
      </div>
  `;

  attachments.forEach((doc, index) => {
    html += `
      <div style="margin-top: 4px; margin-left: 10px;">
        <a target="_blank" href="${doc.url}"
          style="font-family: Calibri, sans-serif; font-size: 11px;
            line-height: 1.3; text-decoration: none; color: ${BRAND.buttonColor};">
          ${index + 1}. ${doc.notes || doc.name}
        </a>
      </div>
    `;
  });

  html += '</div>';
  return html;
}

// ============================================================================
// RESOURCE LINKS SECTION (for introduction emails)
// ============================================================================

export function getResourceLinksSection(includeIds: number[]): string {
  let links = '';

  if (includeIds.includes(32)) {
    links += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${RESOURCE_LINKS.companyProfile}">Company Profile</a><br>`;
  }
  if (includeIds.includes(15)) {
    links += `<div><a target="_blank" href="${RESOURCE_LINKS.videoGeneral}">Axiever Video</a></div>`;
  }
  if (includeIds.includes(16)) {
    links += `<div><a target="_blank" href="${RESOURCE_LINKS.videoBenefits}">Problems & Solutions Video</a></div>`;
  }
  if (includeIds.includes(17)) {
    links += `<div><a target="_blank" href="${RESOURCE_LINKS.pptProblems}">Problems & Solutions Presentation</a></div>`;
  }

  return links ? `<div style="margin:4px 0 0 0; line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;">${links}</div>` : '';
}

// ============================================================================
// FOOTER SECTION (Best regards)
// ============================================================================

export function getFooter(): string {
  return `
    <div style="margin:8pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
      Best regards,<br>
      <strong style="color:${BRAND.primaryColor};">${BRAND.name}</strong><br>
      <em style="color:${BRAND.primaryColor};">${BRAND.slogan}</em><br>
      <em style="color:${BRAND.primaryColor};">${BRAND.description}</em>
    </div>
  `;
}

// ============================================================================
// SIGNATURE SECTION
// ============================================================================

export function getSignature(data: Partial<EmailPlaceholderData>): string {
  const { user_name, user_first_name, user_last_name, user_title, user_ext, user_email } = data;
  const displayName = user_name || `${user_first_name || ''} ${user_last_name || ''}`.trim() || '{{user_name}}';

  return `
    <table style="margin:8pt 0 0 0;" cellpadding="0" cellspacing="0">
      <tr>
        <td style="border: none; vertical-align: top; border-right: 1.5px solid #0f0f0f; padding-right: 10px;">
          <a href="${BRAND.websiteUrl}" target="_blank">
            <img src="${BRAND.logoUrl}" width="75" alt="${BRAND.name} Logo" style="display: block; border: none;">
          </a>
        </td>
        <td style="font-size: 11px; font-family: Calibri, sans-serif; padding-left: 15px;">
          <strong>${displayName}</strong><br>
          <span style="color: ${BRAND.primaryColor};">${user_title || '{{user_title}}'}</span><br>
          <a href="tel:${BRAND.phone.replace(/[^+\d]/g, '')}" style="color: ${BRAND.primaryColor}; text-decoration: none;">
            <img src="${ICONS.phone}" alt="Phone Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
            ${BRAND.phone} ext. ${user_ext || '{{user_ext}}'}
          </a><br>
          <a href="mailto:${user_email || '{{user_email}}'}" style="color: ${BRAND.primaryColor}; text-decoration: none;">
            <img src="${ICONS.email}" alt="Mail Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
            ${user_email || '{{user_email}}'}
          </a><br>
          <a href="${BRAND.websiteUrl}" style="color: ${BRAND.primaryColor}; text-decoration: none;">
            <img src="${ICONS.website}" alt="Website Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
            ${BRAND.website}
          </a>
        </td>
      </tr>
    </table>
  `;
}

// ============================================================================
// CONFIDENTIALITY NOTICE
// ============================================================================

export function getConfidentialityNotice(): string {
  return `
    <div style="margin:10px 0 0 0; font-size:11px; color:#666; padding-top:10px; font-family:Calibri, sans-serif;">
      <em>This email and any attachments are confidential and may be privileged.
        If you are not the intended recipient, please notify the sender immediately and delete this email.</em>
    </div>
  `;
}

// ============================================================================
// FULL EMAIL WRAPPER
// ============================================================================

export function wrapEmail(content: string): string {
  // Sanitize content to fix any encoding issues with special characters
  const sanitizedContent = sanitizeSpecialChars(content);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <style>
    .email-button:hover {
      background: #00000000 !important;
      color: #3a57e8 !important;
      border: 1px solid #3a57e8 !important;
      outline: none !important;
    }
  </style>
</head>
<body style="font-family: Calibri, sans-serif; font-size: 11px; color: #000;">
  ${sanitizedContent}
</body>
</html>
  `.trim();
}
