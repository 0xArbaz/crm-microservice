// Introduction Email Templates - Matching reference project structure

import { EmailTemplateConfig, EmailPlaceholderData } from './types';
import {
  getHeader,
  getGreeting,
  getFooter,
  getSignature,
  getConfidentialityNotice,
  getFormLinksSection,
  getAttachmentsSection,
  getResourceLinksSection,
  wrapEmail,
  RESOURCE_LINKS,
  BRAND,
  ICONS,
} from './shared';

// ============================================================================
// INTRODUCTION-1: Oil & Gas Industry Introduction
// ============================================================================

export const introduction1: EmailTemplateConfig = {
  id: 'introduction-1',
  name: 'Introduction Email 1 - Oil & Gas Industry',
  tab: 'introduction',
  subject: 'Streamline Operations with Smart Cloud Business Management Software (ERP)',

  getBody: (data: EmailPlaceholderData) => {
    // Parse ecomid to determine which resource links to show
    const ecomidArray = data.ecomid ? data.ecomid.split(',').map(id => parseInt(id.trim())) : [];

    // Build resource links conditionally based on ecomid
    let resourceLinks = '';
    if (ecomidArray.includes(32)) {
      resourceLinks += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${RESOURCE_LINKS.companyProfile}">Company Profile</a><br>`;
    }
    if (ecomidArray.includes(15)) {
      resourceLinks += `<div><a target="_blank" href="${RESOURCE_LINKS.videoGeneral}">Axiever Video</a></div>`;
    }
    if (ecomidArray.includes(16)) {
      resourceLinks += `<div><a target="_blank" href="${RESOURCE_LINKS.videoBenefits}">Problems & Solutions Video</a></div>`;
    }
    if (ecomidArray.includes(17)) {
      resourceLinks += `<div><a target="_blank" href="${RESOURCE_LINKS.pptProblems}">Problems & Solutions Presentation</a></div>`;
    }

    // Build form links based on dueid
    let formLinks = '';
    if (data.dueid === 2 && data.url) {
      formLinks += `<a target="_blank" href="${data.url}">UAT Link</a>`;
    } else if (data.dueid === 3 && data.url) {
      formLinks += `<a class="btn btn-primary" target="_blank" href="${data.url}">Data Migration</a>`;
    } else if (data.dueid === 4 && data.url) {
      formLinks += `<a class="btn btn-primary" target="_blank" href="${data.url}">Due Diligence Questionnaire</a>`;
    } else if (data.dueid === 'presentation' && data.url) {
      formLinks += `<a class="btn btn-primary" target="_blank" href="${data.url}">Presentation Form</a>`;
    } else if (data.dueid === 'demo' && data.url) {
      formLinks += `<a class="btn btn-primary" target="_blank" href="${data.url}">Demo Form</a>`;
    }

    // Build attachments section
    let attachmentsHtml = '';
    if (data.attachments && data.attachments.length > 0) {
      const verb = data.attachments.length === 1 ? 'is' : 'are';
      const noun = data.attachments.length === 1 ? 'attachment' : 'attachments';
      attachmentsHtml = `
        <div style="margin-top: 8px;">
          <strong>Here ${verb} your ${noun}:</strong>
        </div>`;
      data.attachments.forEach((doc, index) => {
        attachmentsHtml += `
          <div style="margin-left: 10px;">
            <a target="_blank" href="${doc.url}">${index + 1}. ${doc.notes || doc.name}</a>
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
        Managing trading and operational workflows of industrial products primarily to the oil, gas, and petrochemical industry can be challenging - especially with manual processes and disconnected systems of handling multiple RFQS, Supplier Quotations, Price Comparison, and Customer Quotations. Also handling Customer Orders, Supplier Orders, and deliveries from multiple suppliers.
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        That's where Axiever helps; the software has it all and handles the entire process flawlessly, with a Streamlined Process, Artificial Intelligence, and Robotic Process Automation.
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        A cloud-based business management software (ERP) platform, designed to help businesses like yours:
      </div>

      <ul style="margin: 0pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>
          <span style="color: #000;">Automates workflows:</span>
          <div style="margin: 0pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
            <div><span style="color: #000;">- From Customer RFQ to Supplier selection and Inquiry</span></div>
            <div><span style="color: #000;">- Suppliers' Quotation to Price comparison and Customer Quotation,</span></div>
            <div><span style="color: #000;">- Customer Order to Supplier Purchase Order</span></div>
            <div><span style="color: #000;">- Supplier delivery to the customer's warehouse</span></div>
          </div>
        </li>
      </ul>
      <ul style="margin: 0pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li><span style="color: #000;">Streamline across Finance, HR, and Inventory.</span></li>
      </ul>
      <ul style="margin: 0pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li><span style="color: #000;">Simplify compliance and documentation</span></li>
      </ul>
      <ul style="margin: 0pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li><span style="color: #000;">Gain real-time visibility and faster decision-making</span></li>
      </ul>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Our clients from the same industry typically reduce administrative work by up to 60-70% and see measurable ROI within 3-4 months, with a positive cash flow due to increased efficiency.
      </div>

      <a href="${BRAND.websiteUrl}" target="_blank">
        <img src="${RESOURCE_LINKS.oilGasImage}" width="50" alt="Oil Gas Petroleum email" style="display: block; border: none; width: 50%;">
      </a>

      <div style="margin:0px 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Seeing is believing, we would like you to spare 30 minutes for a call and demo to explore how Axiever could simplify your operations.
      </div>
      <br>
      <div style="margin:0px 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Happy to walk you through it.
      </div>
      <div style="margin:0px 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Want to see how this works? Click on the links below:
      </div>

      <div class="mlft_10" style="margin:4px 0 0 0; line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;">
        ${resourceLinks}
      </div>

      <div style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;">
        ${formLinks}
        ${attachmentsHtml}
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Best regards,<br>
        <strong style="color:#0070C0;">Axiever</strong><br>
        <em style="color:#0070C0;">Smart. Simple. Affordable.</em><br>
        <em style="color:#0070C0;">A Canadian-headquartered company helping businesses grow faster with AI-powered simplicity.</em>
      </div>

      <table style="margin:4px 0 0 0;" cellpadding="0" cellspacing="0">
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
// INTRODUCTION-2: Follow-up Email
// ============================================================================

export const introduction2: EmailTemplateConfig = {
  id: 'introduction-2',
  name: 'Introduction Email 2 - Follow-up',
  tab: 'introduction',
  subject: 'Follow-Up: Introduction to ERP Software Solution',

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

    // Build attachments section
    let attachmentsHtml = '';
    if (data.attachments && data.attachments.length > 0) {
      const verb = data.attachments.length === 1 ? 'is' : 'are';
      const noun = data.attachments.length === 1 ? 'attachment' : 'attachments';
      attachmentsHtml = `
        <div style="margin-top: 10px;">
          <strong style="font-family: Calibri, sans-serif; font-size: 11px;">
            Here ${verb} your ${noun}:
          </strong>
        </div>`;
      data.attachments.forEach((doc, index) => {
        attachmentsHtml += `
          <div>
            <a class="email-button" target="_blank" href="${doc.url}"
              style="font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.3;
                text-decoration: none; color: #007bff;">
              ${index + 1}. ${doc.notes || doc.name}
            </a>
          </div>`;
      });
    }

    const content = `
      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:12px;">
        <strong style="color:#0070C0;">"We give progressive business. Big Automation"</strong><br>
        <strong style="color:#0070C0;">"Automate. Simplify. Grow - Smarter, Affordable ERP with Robotic Process Automation & Artificial Intelligence"</strong>
      </div>

      <div style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.7; color: #000000; padding-bottom:8px;">
        <strong>Dear ${data.contact_name || '[#CONTACT_NAME#]'},</strong>
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px; padding-bottom:8px;">
        I wanted to follow up on my previous communication regarding our affordable ERP solution, which I introduced to you recently.
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        As we haven't heard back from you yet, we wanted to reiterate the value proposition of our ERP solution and highlight some key benefits:
      </div>

      <ul style="margin: 0pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>
          <span style="color: #0070C0; font-weight: bold;">Streamlined Operations:</span>
          <span style="color: #000;"> Our ERP solution seamlessly integrates core business processes, providing a centralized platform for efficient management of resources, workflows, and data.</span>
        </li>
      </ul>

      <ul style="margin: 0pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>
          <span style="color: #0070C0; font-weight: bold;">Real-time Insights:</span>
          <span style="color: #000;"> Gain a competitive edge with real-time analytics and reporting tools that enable informed decision-making and strategic planning with the option of designing the software to send the required data automatically.</span>
        </li>
      </ul>

      <ul style="margin: 0pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>
          <span style="color: #0070C0; font-weight: bold;">Scalability:</span>
          <span style="color: #000;"> Designed to grow with your clients' businesses, our ERP solution ensures scalability without compromising performance.</span>
        </li>
      </ul>

      <ul style="margin: 0pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>
          <span style="color: #0070C0; font-weight: bold;">User-Friendly Interface:</span>
          <span style="color: #000;"> The intuitive user interface enhances user adoption and reduces training time, ensuring a smooth transition for your clients.</span>
        </li>
      </ul>

      <ul style="margin: 0pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>
          <span style="color: #0070C0; font-weight: bold;">Customization:</span>
          <span style="color: #000;"> Tailor the ERP solution to meet the specific needs of your clients, providing a personalized and adaptable system with minimal changes at the backend.</span>
        </li>
      </ul>

      <ul style="margin: 0pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>
          <span style="color: #0070C0; font-weight: bold;">Security:</span>
          <span style="color: #000;"> We prioritize data security, implementing robust measures to protect sensitive information and ensure compliance with industry standards.</span>
        </li>
      </ul>

      <ul style="margin: 0pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>
          <span style="color: #0070C0; font-weight: bold;">Cashflow:</span>
          <span style="color: #000;"> Through effective software implementation, your company stands to achieve a positive cash flow, optimizing operational processes and enhancing financial efficiency.</span>
        </li>
      </ul>

      <ul style="margin: 0pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>
          <span style="color: #0070C0; font-weight: bold;">Data redundancy and human error elimination:</span>
          <span style="color: #000;"> resulting in high efficiency, time-saving, and internal cost saving.</span>
        </li>
      </ul>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We understand that selecting the right ERP solution is a significant decision, and we are here to address any questions or concerns you may have.
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        If you would like to learn more about how our ERP solution can benefit the organization, or if you require any additional information or clarification, please do not hesitate to contact us.
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Looking forward to hearing from you soon!
      </div>

      <div class="mlft_5" style="margin:4pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.3;">
        ${formLinks}
        ${attachmentsHtml}
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px; padding-top:8px;">
        Best regards,<br>
        <strong style="color:#0070C0;">Axiever</strong><br>
        <em style="color:#0070C0;">Smart. Simple. Affordable.</em><br>
        <em style="color:#0070C0;">A Canadian-headquartered company helping businesses grow faster with AI-powered simplicity.</em>
      </div>

      <table style="margin:4px 0 0 0;" cellpadding="0" cellspacing="0">
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
// INTRODUCTION-3 through INTRODUCTION-7: Generic Introduction Templates
// ============================================================================

export const introduction3: EmailTemplateConfig = {
  id: 'introduction-3',
  name: 'Introduction Email 3 - LinkedIn Outreach',
  tab: 'introduction',
  subject: 'Exploring Business Opportunities with Axiever ERP',

  getBody: (data: EmailPlaceholderData) => {
    // Parse ecomid to determine which resource links to show
    const ecomidArray = data.ecomid ? data.ecomid.split(',').map(id => parseInt(id.trim())) : [];

    // Build resource links conditionally based on ecomid
    let resourceLinks = '';
    if (ecomidArray.includes(32)) {
      resourceLinks += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${RESOURCE_LINKS.companyProfile}">Company Profile</a><br>`;
    }
    if (ecomidArray.includes(15)) {
      resourceLinks += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${RESOURCE_LINKS.videoGeneral}">Axiever Video</a><br>`;
    }
    if (ecomidArray.includes(16)) {
      resourceLinks += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${RESOURCE_LINKS.videoBenefits}">Problems & Solutions Video</a><br>`;
    }
    if (ecomidArray.includes(17)) {
      resourceLinks += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${RESOURCE_LINKS.pptProblems}">Problems & Solutions Presentation</a><br>`;
    }

    // Build form links based on dueid (simple link style matching blade template)
    let formLinks = '';
    if (data.dueid === 2 && data.url) {
      formLinks += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${data.url}">Uat Link</a>`;
    } else if (data.dueid === 3 && data.url) {
      formLinks += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${data.url}">Data Migration</a>`;
    } else if (data.dueid === 4 && data.url) {
      formLinks += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${data.url}">Due Diligence Questionnaire</a>`;
    } else if (data.dueid === 'presentation' && data.url) {
      formLinks += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${data.url}">Presentation Form</a>`;
    } else if (data.dueid === 'demo' && data.url) {
      formLinks += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${data.url}">Demo Form</a>`;
    }

    // Build attachments section
    let attachmentsHtml = '';
    if (data.attachments && data.attachments.length > 0) {
      const verb = data.attachments.length === 1 ? 'is' : 'are';
      const noun = data.attachments.length === 1 ? 'attachment' : 'attachments';
      attachmentsHtml = `<h5>Here ${verb} your ${noun}</h5>`;
      data.attachments.forEach((doc, index) => {
        attachmentsHtml += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${doc.url}">${index + 1}. ${doc.notes || doc.name}</a>`;
        if (index < data.attachments.length - 1) {
          attachmentsHtml += ',<br>';
        } else {
          attachmentsHtml += '<br>';
        }
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

      <div style="margin:2pt 0 0 0; padding:0; font-family:Calibri, sans-serif; font-size:11px;">
        I came across your profile and reviewed your experience at ${data.company_name || '[#COMPANY_NAME#]'} on LinkedIn, particularly in driving growth and managing complex operations.
        I would like to connect to explore potential opportunities with ${data.company_name || '[#COMPANY_NAME#]'} in [industry/function].
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        That is why I wanted to introduce
        <strong style="color:#0070C0;">Axiever - Business Management Solution (ERP system)</strong> - an
        <strong style="color:#0070C0;">AI + RPA driven platform</strong> designed to transform business operations:
      </div>

      <ul style="margin: 0 0 0 0; padding-left: 20px; font-family: Calibri, sans-serif; font-size: 11px; list-style-type: disc;">
        <li>Automates processes, workflows, invoicing, and reporting</li>
        <li>Tracks remote and hybrid teams with real-time visibility</li>
        <li>Cloud-native: no server maintenance, top-tier security, 99.9% uptime</li>
        <li>Built-in AI onboarding (Axiever Academy) ramps up staff in hours, not weeks</li>
      </ul>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        It is designed to free up <strong style="color:#0070C0;">68% of admin time</strong>, so your team can focus on growth.<br>
        Clients report up to <strong style="color:#0070C0;">30% efficiency improvement in 60 days</strong>.
        If you are exploring smarter, faster ways to scale, this could be your most productive 10 minutes today.
      </div>

      <h3 style="margin:8pt 0 0 0; font-family:Calibri, sans-serif; font-size: 11px; margin: 4px 0; color: #0070C0; padding-top:10px; padding-left: 2px;">Why This Matters</h3>

      <table cellpadding="8" cellspacing="0" border="1" style="border-collapse: collapse; font-size: 11px; font-family: Calibri, sans-serif; color: #000;">
        <thead style="background-color: #2F4FEC; color: #fff;">
          <tr>
            <th align="left" style="background-color: #2F4FEC; color: #ffffff; font-family: Calibri, sans-serif; font-size: 11px;">
              Feature
            </th>
            <th align="left" style="background-color: #2F4FEC; color: #ffffff; font-family: Calibri, sans-serif; font-size: 11px;">
              Benefit
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="font-size: 11px; color: #0070C0;">
              <strong style="font-size: 11px;">AI + RPA Automation</strong>
            </td>
            <td style="font-size: 11px; color: #0070C0;">
              Eliminates repetitive tasks and manual errors
            </td>
          </tr>
          <tr>
            <td style="font-size: 11px; color: #0070C0;">
              <strong style="font-size: 11px;">Remote Team Tracking</strong>
            </td>
            <td style="font-size: 11px; color: #0070C0;">
              Visibility & accountability across remote/hybrid setups
            </td>
          </tr>
          <tr>
            <td style="font-size: 11px; color: #0070C0;">
              <strong style="font-size: 11px;">Cloud Infrastructure</strong>
            </td>
            <td style="font-size: 11px; color: #0070C0;">
              No servers or IT upkeep, accessible anywhere
            </td>
          </tr>
          <tr>
            <td style="font-size: 11px; color: #0070C0;">
              <strong style="font-size: 11px;">AI Onboarding System</strong>
            </td>
            <td style="font-size: 11px; color: #0070C0;">
              Staff trained in hours, not months
            </td>
          </tr>
        </tbody>
      </table>

      <div style="margin:8pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px; padding-top:10px;">
        Happy to walk you through it.
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Want to see how this works? Click on the links below:
      </div>

      <div style="margin-left: 4px;">
        <div>
          ${resourceLinks}
        </div>
      </div>

      <div>
        ${formLinks}
        ${attachmentsHtml}
      </div>

      <div style="margin:5px 0 0 0; font-family:Calibri, sans-serif; font-size:11px; padding-top:5px;">
        Best regards,<br>
        <strong style="color:#0070C0;">Axiever</strong><br>
        <em style="color:#0070C0;">Smart. Simple. Affordable.</em><br>
        <em style="color:#0070C0;">A Canadian-headquartered company helping businesses grow faster with AI-powered simplicity.</em>
      </div>

      <!-- Signature block -->
      <table cellpadding="0" cellspacing="0" style="margin:8pt 0 0 0; padding-top:5px;">
        <tr>
          <td style="border: none; vertical-align: top; border-right: 1.5px solid #0f0f0f; padding-right: 10px;">
            <a href="${BRAND.websiteUrl}" target="_blank">
              <img src="${BRAND.logoUrl}" width="75" alt="Axiever Logo" style="display: block; border: none;">
            </a>
          </td>
          <td style="font-size: 11px; font-family: Calibri, sans-serif; padding-left: 15px;">
            <strong>${data.user_first_name || '{{user_first_name}}'} ${data.user_last_name || '{{user_last_name}}'}</strong><br>
            <span style="color: #0070C0;">${data.user_title || '{{user_title}}'}</span><br>
            <a href="tel:+19059974044" style="color: #0070C0; text-decoration: none;">
              <img src="${ICONS.phone}" alt="Phone Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              +1 (905) 997-4044 ext. ${data.user_ext || '{{user_ext}}'}
            </a><br>
            <!-- MAIL -->
            <a href="mailto:${data.user_email || '{{user_email}}'}" style="color: #0070C0; text-decoration: none;">
              <img src="${ICONS.email}" alt="Mail Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              ${data.user_email || '{{user_email}}'}
            </a><br>
            <!-- WEBSITE -->
            <a href="${BRAND.websiteUrl}" style="color: #0070C0; text-decoration: none;">
              <img src="${ICONS.website}" alt="Website Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              www.axiever.com
            </a>
          </td>
        </tr>
      </table>

      <div style="margin:8pt 0 0 0; font-size:11px; color:#666; padding-top:10px; font-family:Calibri, sans-serif;">
        <em>This email and any attachments are confidential and may be privileged.
          If you are not the intended recipient, please notify the sender immediately and delete this email.</em>
      </div>
    `;

    return wrapEmail(content);
  },
};

export const introduction4: EmailTemplateConfig = {
  id: 'introduction-4',
  name: 'Introduction Email 4 - Operations Focus',
  tab: 'introduction',
  subject: 'Axiever ERP - Your Partner in Digital Transformation',

  getBody: (data: EmailPlaceholderData) => {
    // Parse ecomid to determine which resource links to show
    const ecomidArray = data.ecomid ? data.ecomid.split(',').map(id => parseInt(id.trim())) : [];

    // Build resource links conditionally based on ecomid (case study links: 18-30)
    let resourceLinks = '';
    if (ecomidArray.includes(18)) {
      resourceLinks += `<div><a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${RESOURCE_LINKS.caseStudyPresentation}">Case Study Presentation</a></div>`;
    }
    if (ecomidArray.includes(19)) {
      resourceLinks += `<div><a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${RESOURCE_LINKS.caseStudyIntroduction}">Case Study Introduction</a></div>`;
    }
    if (ecomidArray.includes(20)) {
      resourceLinks += `<div><a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${RESOURCE_LINKS.benefits}">Benefits</a></div>`;
    }
    if (ecomidArray.includes(21)) {
      resourceLinks += `<div><a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${RESOURCE_LINKS.challenge1}">Challenge 1</a></div>`;
    }
    if (ecomidArray.includes(22)) {
      resourceLinks += `<div><a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${RESOURCE_LINKS.challenge2}">Challenge 2</a></div>`;
    }
    if (ecomidArray.includes(23)) {
      resourceLinks += `<div><a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${RESOURCE_LINKS.challenge3}">Challenge 3</a></div>`;
    }
    if (ecomidArray.includes(24)) {
      resourceLinks += `<div><a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${RESOURCE_LINKS.challenge4}">Challenge 4</a></div>`;
    }
    if (ecomidArray.includes(25)) {
      resourceLinks += `<div><a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${RESOURCE_LINKS.challenge5}">Challenge 5</a></div>`;
    }
    if (ecomidArray.includes(26)) {
      resourceLinks += `<div><a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${RESOURCE_LINKS.challenge6}">Challenge 6</a></div>`;
    }
    if (ecomidArray.includes(27)) {
      resourceLinks += `<div><a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${RESOURCE_LINKS.challenge7}">Challenge 7</a></div>`;
    }
    if (ecomidArray.includes(28)) {
      resourceLinks += `<div><a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${RESOURCE_LINKS.challenge8}">Challenge 8</a></div>`;
    }
    if (ecomidArray.includes(29)) {
      resourceLinks += `<div><a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${RESOURCE_LINKS.challenge9}">Challenge 9</a></div>`;
    }
    if (ecomidArray.includes(30)) {
      resourceLinks += `<div><a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${RESOURCE_LINKS.challenge10}">Challenge 10</a></div>`;
    }

    // Build form links based on dueid (simple link style matching blade template)
    let formLinks = '';
    if (data.dueid === 2 && data.url) {
      formLinks += `<div><a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${data.url}">UAT Link</a></div>`;
    } else if (data.dueid === 3 && data.url) {
      formLinks += `<div><a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${data.url}">Data Migration</a></div>`;
    } else if (data.dueid === 4 && data.url) {
      formLinks += `<div><a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${data.url}">Due Diligence Questionnaire</a></div>`;
    } else if (data.dueid === 'presentation' && data.url) {
      formLinks += `<div><a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${data.url}">Presentation Form</a></div>`;
    } else if (data.dueid === 'demo' && data.url) {
      formLinks += `<div><a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${data.url}">Demo Form</a></div>`;
    }

    // Build attachments section
    let attachmentsHtml = '';
    if (data.attachments && data.attachments.length > 0) {
      const verb = data.attachments.length === 1 ? 'is' : 'are';
      const noun = data.attachments.length === 1 ? 'attachment' : 'attachments';
      attachmentsHtml = `<h5>Here ${verb} your ${noun}</h5>`;
      data.attachments.forEach((doc, index) => {
        attachmentsHtml += `<div><a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${doc.url}">${index + 1}. ${doc.notes || doc.name}</a></div>`;
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
        Thanks for connecting!
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        If you are leading operations at ${data.company_name || '[#COMPANY_NAME#]'}, chances are you already feel this, but it often gets overlooked:
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Growing companies lose 20-30% of operations time every month to:
      </div>

      <ul style="margin: 0 0 0 0; padding-left: 20px; font-family: Calibri, sans-serif; font-size: 11px; list-style-type: disc;">
        <li>Manual approvals</li>
        <li>Excel chaos</li>
        <li>Delayed visibility across teams</li>
      </ul>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        And that wasted time = lost cash flow.
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        <strong style="color:#0070C0;">Axiever - Business Management Solution (ERP system)</strong> - an
        <strong style="color:#0070C0;">AI + RPA driven platform</strong> designed to transform business operations:
      </div>

      <ul style="margin: 0 0 0 0; padding-left: 20px; font-family: Calibri, sans-serif; font-size: 11px; list-style-type: disc;">
        <li>Auto-approves routine workflows</li>
        <li>Replaces 10+ spreadsheets with one smart system</li>
        <li>Gives real-time dashboards for faster decisions</li>
        <li>Pays for itself in &lt;90 days</li>
      </ul>

      <div style="margin:0px 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Most clients save more in the first quarter than they invest.
      </div>

      <h3 style="margin:8pt 0 0 0; font-family:Calibri, sans-serif; font-size: 11px; margin: 4px 0; color: #0070C0; padding-top:10px; padding-left: 2px;">Why This Matters</h3>

      <table cellpadding="8" cellspacing="0" border="1" style="border-collapse: collapse; font-size: 11px; font-family: Calibri, sans-serif; color: #000;">
        <thead style="background-color: #2F4FEC; color: #fff;">
          <tr>
            <th align="left" style="background-color: #2F4FEC; color: #ffffff; font-family: Calibri, sans-serif; font-size: 11px;">
              Feature
            </th>
            <th align="left" style="background-color: #2F4FEC; color: #ffffff; font-family: Calibri, sans-serif; font-size: 11px;">
              Benefit
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="font-size: 11px; color: #0070C0;">
              <strong style="font-size: 11px;">AI-Powered Automation</strong>
            </td>
            <td style="font-size: 11px; color: #0070C0;">
              Ends manual bottlenecks, speeds up everything
            </td>
          </tr>
          <tr>
            <td style="font-size: 11px; color: #0070C0;">
              <strong style="font-size: 11px;">Unified ERP Platform</strong>
            </td>
            <td style="font-size: 11px; color: #0070C0;">
              One source of truth - no more jumping across tools
            </td>
          </tr>
          <tr>
            <td style="font-size: 11px; color: #0070C0;">
              <strong style="font-size: 11px;">Real-Time Dashboards</strong>
            </td>
            <td style="font-size: 11px; color: #0070C0;">
              Faster, smarter business decisions with live KPIs
            </td>
          </tr>
          <tr>
            <td style="font-size: 11px; color: #0070C0;">
              <strong style="font-size: 11px;">Proven Financial ROI</strong>
            </td>
            <td style="font-size: 11px; color: #0070C0;">
              Savings kick in within the first 1-2 quarters
            </td>
          </tr>
        </tbody>
      </table>

      <div style="margin:8px 0 0 0; font-family:Calibri, sans-serif; font-size:11px; padding-top:10px;">
        Want to benchmark your setup? I am happy to share what others in your space are doing.
      </div>

      <div style="margin:0px 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Happy to walk you through it.
      </div>

      <div style="margin:0px 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Want to see how this works? Click on the links below:
      </div>

      <div style="margin:4pt 0 0 0;">
        ${resourceLinks}
      </div>

      <div>
        ${formLinks}
        ${attachmentsHtml}
      </div>

      <div style="margin:5px 0 0 0; font-family:Calibri, sans-serif; font-size:11px; padding-top:5px;">
        Best regards,<br>
        <strong style="color:#0070C0;">Axiever</strong><br>
        <em style="color:#0070C0;">Smart. Simple. Affordable.</em><br>
        <em style="color:#0070C0;">A Canadian-headquartered company helping businesses grow faster with AI-powered simplicity.</em>
      </div>

      <!-- Signature block -->
      <table cellpadding="0" cellspacing="0" style="margin-top:10px;">
        <tr>
          <td style="border: none; vertical-align: top; border-right: 1.5px solid #0f0f0f; padding-right: 10px;">
            <a href="${BRAND.websiteUrl}" target="_blank">
              <img src="${BRAND.logoUrl}" width="75" alt="Axiever Logo" style="display: block; border: none;">
            </a>
          </td>
          <td style="font-size: 11px; font-family: Calibri, sans-serif; padding-left: 15px;">
            <strong>${data.user_first_name || '{{user_first_name}}'} ${data.user_last_name || '{{user_last_name}}'}</strong><br>
            <span style="color: #0070C0;">${data.user_title || '{{user_title}}'}</span><br>
            <a href="tel:+19059974044" style="color: #0070C0; text-decoration: none;">
              <img src="${ICONS.phone}" alt="Phone Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              +1 (905) 997-4044 ext. ${data.user_ext || '{{user_ext}}'}
            </a><br>
            <a href="mailto:${data.user_email || '{{user_email}}'}" style="color: #0070C0; text-decoration: none;">
              <img src="${ICONS.email}" alt="Mail Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              ${data.user_email || '{{user_email}}'}
            </a><br>
            <a href="${BRAND.websiteUrl}" style="color: #0070C0; text-decoration: none;">
              <img src="${ICONS.website}" alt="Website Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
              www.axiever.com
            </a>
          </td>
        </tr>
      </table>

      <div style="margin:8pt 0 0 0; font-size:11px; color:#666; padding-top:10px; font-family:Calibri, sans-serif;">
        <em>This email and any attachments are confidential and may be privileged.
          If you are not the intended recipient, please notify the sender immediately and delete this email.</em>
      </div>
    `;

    return wrapEmail(content);
  },
};

export const introduction5: EmailTemplateConfig = {
  id: 'introduction-5',
  name: 'Introduction Email 5',
  tab: 'introduction',
  subject: 'Streamline Your Business Operations with Axiever',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Are you looking for ways to improve efficiency and reduce operational costs? Our ERP solution might be exactly what you need.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        With Axiever, you can:
      </div>

      <ul style="margin: 4pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>Automate repetitive tasks and save time</li>
        <li>Get real-time visibility into your operations</li>
        <li>Make data-driven decisions with powerful analytics</li>
        <li>Scale your operations without scaling your costs</li>
      </ul>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Let us schedule a demo to show you how it works.
      </div>

      ${getResourceLinksSection([32, 16, 17])}
      ${getFormLinksSection(data)}
      ${getAttachmentsSection(data.attachments)}
      ${getFooter()}
      ${getSignature(data)}
      ${getConfidentialityNotice()}
    `;

    return wrapEmail(content);
  },
};

export const introduction6: EmailTemplateConfig = {
  id: 'introduction-6',
  name: 'Introduction Email 6',
  tab: 'introduction',
  subject: 'Transform Your Business with AI-Powered ERP',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        The future of business management is here. Axiever combines the power of AI with intuitive design to deliver an ERP solution that truly works for you.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Key features include:
      </div>

      <ul style="margin: 4pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>Intelligent process automation</li>
        <li>Predictive analytics and forecasting</li>
        <li>Seamless third-party integrations</li>
        <li>24/7 cloud accessibility</li>
        <li>Enterprise-grade security</li>
      </ul>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        I would love to show you what Axiever can do for your business.
      </div>

      ${getResourceLinksSection([15, 16, 17])}
      ${getFormLinksSection(data)}
      ${getAttachmentsSection(data.attachments)}
      ${getFooter()}
      ${getSignature(data)}
      ${getConfidentialityNotice()}
    `;

    return wrapEmail(content);
  },
};

export const introduction7: EmailTemplateConfig = {
  id: 'introduction-7',
  name: 'Introduction Email 7 - AI Onboarding Focus',
  tab: 'introduction',
  subject: 'Ready to Take Your Business to the Next Level?',

  getBody: (data: EmailPlaceholderData) => {
    // Build form links based on dueid (simple link style matching blade template)
    let formLinks = '';
    if (data.dueid === 2 && data.url) {
      formLinks += `<div><a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${data.url}">UAT Link</a></div>`;
    } else if (data.dueid === 3 && data.url) {
      formLinks += `<div><a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${data.url}">Data Migration</a></div>`;
    } else if (data.dueid === 4 && data.url) {
      formLinks += `<div><a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${data.url}">Due Diligence Questionnaire</a></div>`;
    } else if (data.dueid === 'presentation' && data.url) {
      formLinks += `<div><a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${data.url}">Presentation Form</a></div>`;
    } else if (data.dueid === 'demo' && data.url) {
      formLinks += `<div><a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${data.url}">Demo Form</a></div>`;
    }

    // Build attachments section
    let attachmentsHtml = '';
    if (data.attachments && data.attachments.length > 0) {
      const verb = data.attachments.length === 1 ? 'is' : 'are';
      const noun = data.attachments.length === 1 ? 'attachment' : 'attachments';
      attachmentsHtml = `<div><h5 style="font-family: Calibri, sans-serif; font-size: 11px; margin: 8px 0 4px 0;">Here ${verb} your ${noun}</h5></div>`;
      data.attachments.forEach((doc, index) => {
        attachmentsHtml += `<div><a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${doc.url}">${index + 1}. ${doc.notes || doc.name}</a></div>`;
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
        I noticed your team is expanding - congrats!
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Here is the issue most teams face:
      </div>

      <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        New hires take 1-3 months to become fully productive.
      </div>

      <div style="margin: 0pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px;">
        With <strong style="color:#0070C0;">Axiever Academy</strong> (our AI learning engine):
      </div>

      <ul style="margin:0pt 0 0 20px; padding:0; font-family:Calibri, sans-serif; font-size:11px;">
        <li>Teams are trained in hours, not weeks</li>
        <li>Role-based paths are auto-assigned</li>
        <li>Track progress, skills, and certifications in one dashboard</li>
        <li>No need for external trainers or LMS</li>
      </ul>

      <div style="margin:2px 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Faster onboarding = faster ROI.
      </div>

      <h3 style="margin:8pt 0 0 0; font-family:Calibri, sans-serif; font-size: 11px; margin: 4px 0; color: #0070C0; padding-top:10px; padding-left: 2px;">Why This Matters</h3>

      <table cellpadding="8" cellspacing="0" border="1" style="border-collapse: collapse; font-size: 11px; font-family: Calibri, sans-serif; color: #000;">
        <thead style="background-color: #2F4FEC; color: #fff;">
          <tr>
            <th align="left" style="background-color: #2F4FEC; color: #ffffff; font-family: Calibri, sans-serif; font-size: 11px;">
              Feature
            </th>
            <th align="left" style="background-color: #2F4FEC; color: #ffffff; font-family: Calibri, sans-serif; font-size: 11px;">
              Benefit
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="font-size: 11px; color: #0070C0;">
              <strong style="font-size: 11px;">AI Onboarding Engine</strong>
            </td>
            <td style="font-size: 11px; color: #0070C0;">
              Ramps up team productivity fast
            </td>
          </tr>
          <tr>
            <td style="font-size: 11px; color: #0070C0;">
              <strong style="font-size: 11px;">Role-Based Learning</strong>
            </td>
            <td style="font-size: 11px; color: #0070C0;">
              Personalized paths for sales, ops, finance, etc.
            </td>
          </tr>
          <tr>
            <td style="font-size: 11px; color: #0070C0;">
              <strong style="font-size: 11px;">Manager Dashboards</strong>
            </td>
            <td style="font-size: 11px; color: #0070C0;">
              Track training, assess performance in real time
            </td>
          </tr>
          <tr>
            <td style="font-size: 11px; color: #0070C0;">
              <strong style="font-size: 11px;">All-in-One ERP + LMS</strong>
            </td>
            <td style="font-size: 11px; color: #0070C0;">
              No extra tools or systems needed
            </td>
          </tr>
        </tbody>
      </table>

      <div style="margin:8px 0 0 0; font-family:Calibri, sans-serif; font-size:11px; padding-top:10px;">
        Would you like a quick look at how it works?
      </div>

      <div style="margin:4pt 0 0 0;">
        ${formLinks}
        ${attachmentsHtml}
      </div>

      <div style="margin:4px 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
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

export const introduction8: EmailTemplateConfig = {
  id: 'introduction-8',
  name: 'Introduction Email 8 - Trading & Warehousing Focus',
  tab: 'introduction',
  subject: 'Future-Proof Your Trading & Warehousing Operations with Axiever',

  getBody: (data: EmailPlaceholderData) => {
    // Parse ecomid to determine which resource links to show
    const ecomidArray = data.ecomid ? data.ecomid.split(',').map(id => parseInt(id.trim())) : [];

    // Build resource links conditionally based on ecomid
    let resourceLinks = '';
    if (ecomidArray.includes(32)) {
      resourceLinks += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${RESOURCE_LINKS.companyProfile}">Company Profile</a><br>`;
    }
    if (ecomidArray.includes(15)) {
      resourceLinks += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${RESOURCE_LINKS.videoGeneral}">Axiever Video</a><br>`;
    }
    if (ecomidArray.includes(16)) {
      resourceLinks += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${RESOURCE_LINKS.videoBenefits}">Problems & Solutions Video</a><br>`;
    }
    if (ecomidArray.includes(17)) {
      resourceLinks += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${RESOURCE_LINKS.pptProblems}">Problems & Solutions Presentation</a><br>`;
    }

    // Build form links based on dueid
    let formLinks = '';
    if (data.dueid === 2 && data.url) {
      formLinks += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${data.url}">Uat Link</a>`;
    } else if (data.dueid === 3 && data.url) {
      formLinks += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${data.url}">Data Migration</a>`;
    } else if (data.dueid === 4 && data.url) {
      formLinks += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${data.url}">Due Diligence Questionnaire</a>`;
    } else if (data.dueid === 'presentation' && data.url) {
      formLinks += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${data.url}">Presentation Form</a>`;
    } else if (data.dueid === 'demo' && data.url) {
      formLinks += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${data.url}">Demo Form</a>`;
    }

    // Build attachments section
    let attachmentsHtml = '';
    if (data.attachments && data.attachments.length > 0) {
      const verb = data.attachments.length === 1 ? 'is' : 'are';
      const noun = data.attachments.length === 1 ? 'attachment' : 'attachments';
      attachmentsHtml = `<h5>Here ${verb} your ${noun}</h5>`;
      data.attachments.forEach((doc, index) => {
        attachmentsHtml += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${doc.url}">${index + 1}. ${doc.notes || doc.name}</a>`;
        if (index < data.attachments.length - 1) {
          attachmentsHtml += ',<br>';
        } else {
          attachmentsHtml += '<br>';
        }
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
        Managing trading and warehousing operations often means dealing with manual processes, disconnected systems, and limited visibility. These challenges slow growth and increase costs.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        In an increasingly competitive landscape, leveraging automation is no longer just an advantage; it is becoming essential for long-term business resilience and survival.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Axiever is a cloud-native business management platform powered by AI and RPA, designed specifically to future-proof your operations. We help businesses like yours:
      </div>

      <h3 style="margin:8pt 0 0 0; font-family:Calibri, sans-serif; font-size: 11px; margin: 4px 0; color: #0070C0; padding-top:10px; padding-left: 2px;">Why This Matters</h3>

      <table cellpadding="8" cellspacing="0" border="1" style="border-collapse: collapse; font-size: 11px; font-family: Calibri, sans-serif; color: #000;">
        <thead style="background-color: #2F4FEC; color: #fff;">
          <tr>
            <th align="left" style="background-color: #2F4FEC; color: #ffffff; font-family: Calibri, sans-serif; font-size: 11px;">
              Feature
            </th>
            <th align="left" style="background-color: #2F4FEC; color: #ffffff; font-family: Calibri, sans-serif; font-size: 11px;">
              Benefit
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="font-size: 11px; color: #0070C0;">
              <strong style="font-size: 11px;">AI + RPA Automation</strong>
            </td>
            <td style="font-size: 11px; color: #0070C0;">
              Eliminates repetitive tasks and manual errors
            </td>
          </tr>
          <tr>
            <td style="font-size: 11px; color: #0070C0;">
              <strong style="font-size: 11px;">Remote Team Tracking</strong>
            </td>
            <td style="font-size: 11px; color: #0070C0;">
              Visibility & accountability across remote/hybrid setups
            </td>
          </tr>
          <tr>
            <td style="font-size: 11px; color: #0070C0;">
              <strong style="font-size: 11px;">Cloud Infrastructure</strong>
            </td>
            <td style="font-size: 11px; color: #0070C0;">
              No servers or IT upkeep, accessible anywhere
            </td>
          </tr>
          <tr>
            <td style="font-size: 11px; color: #0070C0;">
              <strong style="font-size: 11px;">AI Onboarding System</strong>
            </td>
            <td style="font-size: 11px; color: #0070C0;">
              With Axiever Academy, staff trained in hours, not months
            </td>
          </tr>
        </tbody>
      </table>

      <div style="margin:8px 0 0 0; font-family:Calibri, sans-serif; font-size:11px; padding-top:10px;">
        On average, our clients reduce admin work by 68% and see efficiency gains of up to 30% in the first 60 days. Most see full ROI in 3-6 months - after which the software pays for itself and generates ongoing cost savings.
      </div>

      <div style="margin:2px 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Happy to walk you through a quick 15-30 minute session to see how we can simplify operations and free your team to focus on growth?
      </div>

      <div style="margin:2px 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Want to see how this works? Click on the links below:
      </div>

      <div style="margin:4px 0 0 0; margin-left: 4px;">
        <div>
          ${resourceLinks}
        </div>
      </div>

      <div>
        ${formLinks}
        ${attachmentsHtml}
      </div>

      <div style="margin:5px 0 0 0; font-family:Calibri, sans-serif; font-size:11px; padding-top:5px;">
        Best regards,<br>
        <strong style="color:#0070C0;">Axiever</strong><br>
        <em style="color:#0070C0;">Smart. Simple. Affordable.</em><br>
        <em style="color:#0070C0;">A Canadian-headquartered company helping businesses grow faster with AI-powered simplicity.</em>
      </div>

      <!-- Signature block -->
      <table cellpadding="0" cellspacing="0" style="margin:8pt 0 0 0; padding-top:5px;">
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

      <div style="margin:8pt 0 0 0; font-size:11px; color:#666; padding-top:10px; font-family:Calibri, sans-serif;">
        <em>This email and any attachments are confidential and may be privileged.
          If you are not the intended recipient, please notify the sender immediately and delete this email.</em>
      </div>
    `;

    return wrapEmail(content);
  },
};

export const introduction9: EmailTemplateConfig = {
  id: 'introduction-9',
  name: 'Introduction Email 9 - LinkedIn Profile Outreach',
  tab: 'introduction',
  subject: 'Streamline Your Operations with AI-Powered ERP - Axiever',

  getBody: (data: EmailPlaceholderData) => {
    // Parse ecomid to determine which resource links to show
    const ecomidArray = data.ecomid ? data.ecomid.split(',').map(id => parseInt(id.trim())) : [];

    // Build resource links conditionally based on ecomid
    let resourceLinks = '';
    if (ecomidArray.includes(32)) {
      resourceLinks += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${RESOURCE_LINKS.companyProfile}">Company Profile</a><br>`;
    }
    if (ecomidArray.includes(15)) {
      resourceLinks += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${RESOURCE_LINKS.videoGeneral}">Axiever Video</a><br>`;
    }
    if (ecomidArray.includes(16)) {
      resourceLinks += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${RESOURCE_LINKS.videoBenefits}">Problems & Solutions Video</a><br>`;
    }
    if (ecomidArray.includes(17)) {
      resourceLinks += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${RESOURCE_LINKS.pptProblems}">Problems & Solutions Presentation</a><br>`;
    }

    // Build form links based on dueid
    let formLinks = '';
    if (data.dueid === 2 && data.url) {
      formLinks += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${data.url}">Uat Link</a>`;
    } else if (data.dueid === 3 && data.url) {
      formLinks += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${data.url}">Data Migration</a>`;
    } else if (data.dueid === 4 && data.url) {
      formLinks += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${data.url}">Due Diligence Questionnaire</a>`;
    } else if (data.dueid === 'presentation' && data.url) {
      formLinks += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${data.url}">Presentation Form</a>`;
    } else if (data.dueid === 'demo' && data.url) {
      formLinks += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${data.url}">Demo Form</a>`;
    }

    // Build attachments section
    let attachmentsHtml = '';
    if (data.attachments && data.attachments.length > 0) {
      const verb = data.attachments.length === 1 ? 'is' : 'are';
      const noun = data.attachments.length === 1 ? 'attachment' : 'attachments';
      attachmentsHtml = `<h5>Here ${verb} your ${noun}</h5>`;
      data.attachments.forEach((doc, index) => {
        attachmentsHtml += `<a style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="${doc.url}">${index + 1}. ${doc.notes || doc.name}</a>`;
        if (index < data.attachments.length - 1) {
          attachmentsHtml += ',<br>';
        } else {
          attachmentsHtml += '<br>';
        }
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
        I came across your profile and reviewed your experience at <strong>${data.company_name || '[#COMPANY_NAME#]'}</strong>, particularly in driving growth and managing complex operations.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        That is why I want to introduce Axiever - Business Management Solution (ERP system) - an AI + RPA driven platform designed to transform business operations:
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        In an increasingly competitive landscape, leveraging automation is no longer just an advantage; it is becoming essential for long-term business resilience and survival.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Axiever is a cloud-native software designed specifically to future-proof your operations.
      </div>

      <h3 style="margin:8pt 0 0 0; font-family:Calibri, sans-serif; font-size: 11px; margin: 4px 0; color: #0070C0; padding-top:10px; padding-left: 2px;">Why This Matters</h3>

      <table cellpadding="8" cellspacing="0" border="1" style="border-collapse: collapse; font-size: 11px; font-family: Calibri, sans-serif; color: #000;">
        <thead style="background-color: #2F4FEC; color: #fff;">
          <tr>
            <th align="left" style="background-color: #2F4FEC; color: #ffffff; font-family: Calibri, sans-serif; font-size: 11px;">
              Feature
            </th>
            <th align="left" style="background-color: #2F4FEC; color: #ffffff; font-family: Calibri, sans-serif; font-size: 11px;">
              Benefit
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="font-size: 11px; color: #0070C0;">
              <strong style="font-size: 11px;">AI + RPA Automation</strong>
            </td>
            <td style="font-size: 11px; color: #0070C0;">
              Eliminates repetitive tasks and manual errors
            </td>
          </tr>
          <tr>
            <td style="font-size: 11px; color: #0070C0;">
              <strong style="font-size: 11px;">Remote Team Tracking</strong>
            </td>
            <td style="font-size: 11px; color: #0070C0;">
              Visibility & accountability across remote/hybrid setups
            </td>
          </tr>
          <tr>
            <td style="font-size: 11px; color: #0070C0;">
              <strong style="font-size: 11px;">Cloud Infrastructure</strong>
            </td>
            <td style="font-size: 11px; color: #0070C0;">
              No servers or IT upkeep, accessible anywhere
            </td>
          </tr>
          <tr>
            <td style="font-size: 11px; color: #0070C0;">
              <strong style="font-size: 11px;">AI Onboarding System</strong>
            </td>
            <td style="font-size: 11px; color: #0070C0;">
              With Axiever Academy, staff trained in hours, not months
            </td>
          </tr>
        </tbody>
      </table>

      <div style="margin:8px 0 0 0; font-family:Calibri, sans-serif; font-size:11px; padding-top:10px;">
        On average, our clients reduce admin work by 68% and see efficiency gains of up to 30% in the first 60 days. Most see full ROI in 3-6 months - after which the software pays for itself and generates ongoing cost savings.
      </div>

      <div style="margin:4px 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Happy to walk you through a quick 15-30 minute session to see how we can simplify operations and free your team to focus on growth?
      </div>

      <div style="margin:4px 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Want to see how this works? Click on the links below:
      </div>

      <div style="margin:4px 0 0 0; margin-left: 4px;">
        <div>
          ${resourceLinks}
        </div>
      </div>

      <div>
        ${formLinks}
        ${attachmentsHtml}
      </div>

      <div style="margin:5px 0 0 0; font-family:Calibri, sans-serif; font-size:11px; padding-top:5px;">
        Best regards,<br>
        <strong style="color:#0070C0;">Axiever</strong><br>
        <em style="color:#0070C0;">Smart. Simple. Affordable.</em><br>
        <em style="color:#0070C0;">A Canadian-headquartered company helping businesses grow faster with AI-powered simplicity.</em>
      </div>

      <!-- Signature block -->
      <table cellpadding="0" cellspacing="0" style="margin:8pt 0 0 0; padding-top:5px;">
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

      <div style="margin:8pt 0 0 0; font-size:11px; color:#666; padding-top:10px; font-family:Calibri, sans-serif;">
        <em>This email and any attachments are confidential and may be privileged.
          If you are not the intended recipient, please notify the sender immediately and delete this email.</em>
      </div>
    `;

    return wrapEmail(content);
  },
};

// Export all introduction templates
export const introductionTemplates: EmailTemplateConfig[] = [
  introduction1,
  introduction2,
  introduction3,
  introduction4,
  introduction5,
  introduction6,
  introduction7,
  introduction8,
  introduction9,
];
