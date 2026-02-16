// Implementation Phase Email Templates - Matching reference project structure
// Includes: Initiation, Planning, Configuration, Training, UAT, Data Migration, Go-Live

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
// INITIATION TEMPLATES
// ============================================================================

export const initiation1: EmailTemplateConfig = {
  id: 'initiation-1',
  name: 'Initiation Email 1 - Project Kickoff',
  tab: 'initiation',
  subject: 'Project Kickoff - Axiever Implementation',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We are excited to officially kick off the implementation of your Axiever ERP solution!
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        To ensure a smooth implementation, we would like to schedule a kickoff meeting to:
      </div>

      <ul style="margin: 4pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>Introduce key team members from both sides</li>
        <li>Review project scope and objectives</li>
        <li>Discuss timeline and milestones</li>
        <li>Establish communication protocols</li>
        <li>Address any initial questions</li>
      </ul>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please use the link below to select a convenient time for the kickoff meeting:
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

export const initiation2: EmailTemplateConfig = {
  id: 'initiation-2',
  name: 'Initiation Email 2 - Team Introduction',
  tab: 'initiation',
  subject: 'Meet Your Implementation Team - Axiever',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        I am pleased to introduce the team that will be working with you on your Axiever implementation:
      </div>

      <ul style="margin: 4pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li><b>Project Manager:</b> [Name] - Your primary point of contact</li>
        <li><b>Technical Lead:</b> [Name] - Handles configuration and integrations</li>
        <li><b>Training Specialist:</b> [Name] - Conducts user training sessions</li>
        <li><b>Support Representative:</b> [Name] - Assists with post-implementation support</li>
      </ul>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Each team member brings extensive experience in ERP implementations. We are committed to making this project a success for your organization.
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
// PLANNING TEMPLATES
// ============================================================================

export const planning1: EmailTemplateConfig = {
  id: 'planning-1',
  name: 'Planning Email 1 - Project Plan',
  tab: 'planning',
  subject: 'Project Plan and Timeline - Axiever Implementation',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Following our kickoff meeting, I am sharing the detailed project plan for your Axiever implementation.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Key Milestones:
      </div>

      <ol style="margin: 4pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li style="margin-bottom: 2pt;"><b>Week 1-2:</b> Requirements gathering and system configuration</li>
        <li style="margin-bottom: 2pt;"><b>Week 3-4:</b> Data migration preparation</li>
        <li style="margin-bottom: 2pt;"><b>Week 5-6:</b> User training sessions</li>
        <li style="margin-bottom: 2pt;"><b>Week 7-8:</b> User Acceptance Testing (UAT)</li>
        <li style="margin-bottom: 2pt;"><b>Week 9:</b> Go-Live preparation</li>
        <li style="margin-bottom: 2pt;"><b>Week 10:</b> Go-Live and post-implementation support</li>
      </ol>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please review the attached detailed project plan and let us know if you have any questions or concerns about the timeline.
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

export const planning2: EmailTemplateConfig = {
  id: 'planning-2',
  name: 'Planning Email 2 - Requirements Gathering',
  tab: 'planning',
  subject: 'Requirements Gathering Session - Axiever',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        To ensure the system is configured to meet your specific needs, we need to gather detailed requirements from your team.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please complete the attached requirements questionnaire and share it with us before our next meeting.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Areas we will cover:
      </div>

      <ul style="margin: 4pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>Business processes and workflows</li>
        <li>User roles and permissions</li>
        <li>Reporting requirements</li>
        <li>Integration needs</li>
        <li>Data migration scope</li>
      </ul>

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
  subject: 'Training Schedule - Axiever Implementation',

  getBody: (data: EmailPlaceholderData) => {
    const content = `
      ${getHeader()}
      ${getGreeting(data.contact_name)}

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        We are ready to begin the training phase! Please find attached the training schedule for your team.
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Training sessions will cover:
      </div>

      <ul style="margin: 4pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
        <li>System navigation and basic operations</li>
        <li>Module-specific training</li>
        <li>Workflow management</li>
        <li>Reporting and analytics</li>
        <li>Best practices and tips</li>
      </ul>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px;">
        Please ensure all relevant team members are available for their scheduled sessions.
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
// UAT TEMPLATES
// ============================================================================

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
  planning1,
  planning2,
  config1,
  config2,
  training1,
  uat1,
  uat2,
  dataMigration1,
  goLive1,
  goLive2,
];
