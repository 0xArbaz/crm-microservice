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
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

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

      <div style="margin:pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        I have also attached the demo videos for your review prior to our meeting. This presentation has been tailored to provide insights into our services and highlight their features and benefits.
      </div>

      <div style="margin:pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Should you have any specific areas of interest or questions you would like us to address during the demo, please feel free to let us know in advance so that we can tailor our presentation to meet your needs effectively.
      </div>

      <div style="margin:pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We look forward to presenting our solutions to you and your team.
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
// DEMO-2: Demo Follow-up
// ============================================================================

export const demo2: EmailTemplateConfig = {
  id: 'demo-2',
  name: 'Demo Email 2 - Follow-up After Demo',
  tab: 'demo',
  subject: 'Thank You for Attending Our Demo - Next Steps',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Thank you for taking the time to attend our demo presentation. We hope you found the session informative and valuable.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        As discussed during the demo, our solution can help you:
      </div>

      <ul style="margin: 4pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>Streamline your business processes</li>
        <li>Reduce manual work through automation</li>
        <li>Gain real-time insights into your operations</li>
        <li>Scale efficiently as your business grows</li>
      </ul>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        I am attaching the presentation materials and additional resources for your reference. Please feel free to share these with your team members who could not attend.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        If you have any questions or would like to discuss next steps, please do not hesitate to reach out. We are here to help you make an informed decision.
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
// DEMO-3: Demo Rescheduling
// ============================================================================

export const demo3: EmailTemplateConfig = {
  id: 'demo-3',
  name: 'Demo Email 3 - Rescheduling Request',
  tab: 'demo',
  subject: 'Rescheduling Our Demo Session',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        I understand that scheduling conflicts can arise. I wanted to reach out to reschedule our demo session at a time that works better for you.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please use the link below to select a new date and time that fits your schedule:
      </div>

      ${getFormLinksSection(data)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        In the meantime, I have attached some materials that might help you prepare for our session. These include an overview of our solution and some success stories from similar businesses.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Looking forward to connecting with you soon!
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
// DEMO-4: Demo Reminder
// ============================================================================

export const demo4: EmailTemplateConfig = {
  id: 'demo-4',
  name: 'Demo Email 4 - Demo Reminder',
  tab: 'demo',
  subject: 'Reminder: Your Demo Session is Tomorrow',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        This is a friendly reminder about your scheduled demo session with us.
      </div>

      <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        <b>Demo Details:</b>
      </div>

      <ul style="margin: 0pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li><b>Date:</b> ${data.meeting_date || '[Meeting Date]'}</li>
        <li><b>Time:</b> ${data.meeting_time || '[Meeting Time]'}</li>
        <li><b>Platform:</b> Microsoft Teams / Zoom</li>
      </ul>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please ensure you have the meeting link ready. If you need any assistance connecting, feel free to reach out.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We are excited to show you how Axiever can transform your business operations!
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
// DEMO-5: Demo Materials
// ============================================================================

export const demo5: EmailTemplateConfig = {
  id: 'demo-5',
  name: 'Demo Email 5 - Demo Materials',
  tab: 'demo',
  subject: 'Demo Materials for Your Review',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        As requested, I am sending you the demo materials for your review before our upcoming session.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        The attached materials include:
      </div>

      <ul style="margin: 4pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>Product overview presentation</li>
        <li>Feature comparison sheet</li>
        <li>Case studies from similar industries</li>
        <li>Demo video highlights</li>
      </ul>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please review these materials at your convenience. If you have any specific questions or areas you would like us to focus on during the demo, let us know in advance.
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
// DEMO-6: Post-Demo Questionnaire
// ============================================================================

export const demo6: EmailTemplateConfig = {
  id: 'demo-6',
  name: 'Demo Email 6 - Post-Demo Questionnaire',
  tab: 'demo',
  subject: 'Your Feedback Matters - Post-Demo Questionnaire',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Thank you again for attending our demo session. We hope you found it valuable and informative.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        To better understand your requirements and provide you with a tailored proposal, we kindly request you to complete the post-demo questionnaire linked below:
      </div>

      ${getFormLinksSection(data)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Your responses will help us:
      </div>

      <ul style="margin: 4pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>Understand your specific business needs</li>
        <li>Identify the modules most relevant to you</li>
        <li>Prepare a customized pricing proposal</li>
        <li>Plan the implementation timeline</li>
      </ul>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please complete the questionnaire at your earliest convenience. If you have any questions, feel free to reach out.
      </div>

      ${getAttachmentsSection(data.attachments)}
      ${getFooter()}
      ${getSignature(data)}
      ${getConfidentialityNotice()}
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
