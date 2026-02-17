// Email Template Types - Matching reference project structure

export interface EmailTemplateConfig {
  id: string;
  name: string;
  tab: string;
  subject: string;
  getBody: (data: EmailPlaceholderData) => string;
}

export interface EmailPlaceholderData {
  // Contact/Customer Info
  contact_name: string;
  company_name: string;
  contact_email: string;
  contact_phone: string;
  lead_id: number | string;

  // User/Sender Info
  user_name: string;
  user_email: string;
  user_title: string;
  user_ext: string;
  user_first_name: string;
  user_last_name: string;

  // Date/Time
  date: string;
  time: string;
  meeting_date: string;
  meeting_time: string;

  // Form Links
  form_link: string;
  form_links: FormLink[];
  portal_link: string;

  // Due Diligence Options
  dueid: number | string;
  dueshortid: number;
  ecomid: string;

  // URLs
  url: string;
  url1: string;
  url2: string;
  url3: string;
  url4: string;
  url8: string;

  // Configuration Form URLs
  config_url_warehouse: string;
  config_url_impex: string;
  config_url_service: string;

  // Attachments
  attachments: Attachment[];

  // Optional custom data
  [key: string]: any;
}

export interface FormLink {
  id: number;
  label: string;
  url: string;
  type: string;
}

export interface Attachment {
  id: number;
  name: string;
  notes: string;
  url: string;
}

// Sanitize special characters to prevent encoding issues
export function sanitizeSpecialChars(text: string): string {
  return text
    // Fix already-corrupted mojibake patterns (UTF-8 decoded as Windows-1252)
    .replace(/â€™/g, "'")        // Corrupted right single quote
    .replace(/â€˜/g, "'")        // Corrupted left single quote
    .replace(/â€œ/g, '"')        // Corrupted left double quote
    .replace(/â€/g, '"')         // Corrupted right double quote (partial)
    .replace(/â€"/g, '-')        // Corrupted em dash
    .replace(/â€"/g, '-')        // Corrupted en dash
    .replace(/â€¦/g, '...')      // Corrupted ellipsis
    .replace(/â€¢/g, '-')        // Corrupted bullet point
    .replace(/âœ…/g, '-')        // Corrupted checkmark
    .replace(/â€˜Â»/g, '-')      // Corrupted arrow/bullet
    .replace(/Â»/g, '-')         // Corrupted right arrow
    .replace(/Â·/g, '-')         // Corrupted middle dot
    .replace(/Ã¢â‚¬â„¢/g, "'")   // Double-corrupted apostrophe
    .replace(/Ã¢â‚¬â€œ/g, '-')   // Double-corrupted dash
    .replace(/Ã¢â‚¬Â/g, '"')     // Double-corrupted quote
    .replace(/Ã¢â‚¬Â¢/g, '-')    // Double-corrupted bullet
    // Fix Unicode curly quotes and apostrophes
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")  // Single quotes: ' ' ‚ ‛
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')  // Double quotes: " " „ ‟
    // Fix dashes
    .replace(/[\u2013]/g, '-')   // En dash: –
    .replace(/[\u2014]/g, '-')   // Em dash: —
    .replace(/[\u2015]/g, '-')   // Horizontal bar: ―
    // Fix bullets and symbols
    .replace(/[\u2022]/g, '-')   // Bullet: •
    .replace(/[\u2023]/g, '-')   // Triangular bullet: ‣
    .replace(/[\u2043]/g, '-')   // Hyphen bullet: ⁃
    .replace(/[\u25E6]/g, '-')   // White bullet: ◦
    .replace(/[\u00BB]/g, '-')   // Right-pointing double angle: »
    .replace(/[\u00AB]/g, '-')   // Left-pointing double angle: «
    .replace(/[\u2714]/g, '-')   // Heavy check mark: ✔
    .replace(/[\u2705]/g, '-')   // White heavy check mark: ✅
    .replace(/[\u2713]/g, '-')   // Check mark: ✓
    // Fix ellipsis
    .replace(/[\u2026]/g, '...')  // Ellipsis: …
    // Fix spaces
    .replace(/[\u00A0]/g, ' ')    // Non-breaking space
    .replace(/[\u2002\u2003\u2009]/g, ' ');  // En/Em/Thin space
}

// Placeholder replacement function
export function replacePlaceholders(template: string, data: Partial<EmailPlaceholderData>): string {
  let result = template;

  // Replace standard placeholders
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string' || typeof value === 'number') {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value || ''));
    }
  });

  return result;
}
