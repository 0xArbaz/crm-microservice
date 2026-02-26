// User Types
export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: 'admin' | 'manager' | 'sales' | 'marketing' | 'support';
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Pre-Lead Types
export type PreLeadSource = 'website' | 'referral' | 'social_media' | 'cold_call' | 'walk_in' | 'whatsapp' | 'email' | 'erp' | 'other';

export interface PreLead {
  id: number;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  alternate_phone?: string;
  company_name?: string;
  designation?: string;
  website?: string;
  source: PreLeadSource;
  source_details?: string;
  status: number;  // 0 = active, 1 = discarded
  product_interest?: string;
  requirements?: string;
  budget_range?: string;
  city?: string;
  state?: string;
  country: string;
  notes?: string;
  discard_reason?: string;
  assigned_to?: number;
  is_converted: boolean;
  converted_lead_id?: number;
  converted_at?: string;
  created_at: string;
  updated_at?: string;
  // New fields
  address_line1?: string;
  address_line2?: string;
  city_id?: number;
  zip_code?: string;
  country_id?: number;
  state_id?: number;
  phone_no?: string;
  fax?: string;
  nof_representative?: string;
  memo?: string;
  group_id?: number;
  lead_status?: string;
  industry_id?: number;
  region_id?: number;
  office_timings?: string;
  timezone?: string;
  lead_source?: string;
  sales_rep?: number;
  lead_since?: string;
  remarks?: string;
  lead_score?: string;
  company_id?: number;
  createdby?: number;
  updatedby?: number;
}

// Lead Types
export type LeadSource = 'pre_lead' | 'direct' | 'website' | 'referral' | 'social_media' | 'cold_call' | 'walk_in' | 'whatsapp' | 'email' | 'erp' | 'other';
export type LeadPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Lead {
  id: number;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  alternate_phone?: string;
  company_name?: string;
  company_code?: string;
  designation?: string;
  company_size?: string;
  industry?: string;
  website?: string;
  source: LeadSource;
  source_details?: string;
  status: number;  // 0 = active, 1 = discarded
  lead_status?: string;  // new, contacted, qualified, proposal_sent, negotiation, won, lost
  priority: LeadPriority;
  pipeline_stage: number;
  expected_value?: number;
  actual_value?: number;
  currency: string;
  product_interest?: string;
  requirements?: string;
  expected_close_date?: string;
  last_contacted?: string;
  next_follow_up?: string;
  // Location fields
  address?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  city_id?: number;
  state?: string;
  state_id?: number;
  country: string;
  country_id?: number;
  pincode?: string;
  zip_code?: string;
  // Contact fields
  phone_no?: string;
  fax?: string;
  nof_representative?: string;
  // Business fields
  memo?: string;
  group_id?: number;
  industry_id?: number;
  region_id?: number;
  office_timings?: string;
  timezone?: string;
  lead_source?: string;
  lead_score?: number;
  sales_rep?: string;
  lead_since?: string;
  remarks?: string;
  notes?: string;
  loss_reason?: string;
  assigned_to?: number;
  pre_lead_id?: number;
  is_converted: boolean;
  converted_customer_id?: number;
  converted_at?: string;
  // System tracking fields
  company_id?: number;
  createdby?: number;
  updatedby?: number;
  created_at: string;
  updated_at?: string;
}

// Customer Types
export type CustomerStatus = 'active' | 'inactive' | 'churned' | 'on_hold';
export type CustomerType = 'individual' | 'business' | 'enterprise' | 'government';

export interface Customer {
  id: number;
  customer_code?: string;
  erp_customer_id?: string;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company_name?: string;
  customer_type: CustomerType;
  status: CustomerStatus;
  total_revenue: number;
  outstanding_amount: number;
  health_score: number;
  total_orders: number;
  last_order_date?: string;
  account_manager?: number;
  lead_id?: number;
  created_at: string;
  updated_at?: string;
}

// Contact Types
export type ContactType = 'primary' | 'billing' | 'technical' | 'decision_maker' | 'influencer' | 'other';

export interface Contact {
  id: number;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  designation?: string;
  department?: string;
  contact_type: ContactType;
  is_primary: boolean;
  lead_id?: number;
  customer_id?: number;
  created_at: string;
}

// Activity Types
export type ActivityType = 'call' | 'email' | 'meeting' | 'whatsapp' | 'note' | 'task' | 'follow_up' | 'status_change' | 'document' | 'other';

export interface Activity {
  id: number;
  activity_type: ActivityType;
  subject: string;
  description?: string;
  outcome?: string;
  activity_date: string;
  is_completed: boolean;
  lead_id?: number;
  customer_id?: number;
  performed_by?: number;
  created_at: string;
}

// Lead Status History Types
export interface LeadStatusHistory {
  id: number;
  lead_id: number;
  old_status?: string;
  new_status?: string;
  remarks?: string;
  status_date?: string;
  created_by?: number;
  changed_by?: number;
  created_at: string;
}

// Memo Types
export interface Memo {
  id: number;
  content?: string;
  details?: string;
  created_by?: number;
  lead_id?: number;
  pre_lead_id?: number;
  created_at: string;
  updated_at?: string;
}

// Sales Target Types
export interface SalesTarget {
  id: number;
  name: string;
  description?: string;
  target_type?: 'revenue' | 'lead_count' | 'conversion' | 'customer_count';
  period?: 'monthly' | 'quarterly' | 'yearly';
  target_value: number;
  achieved_value?: number;
  progress_percentage?: number;
  currency?: string;
  start_date: string;
  end_date: string;
  user_id?: number;
  // Extended fields
  designation?: string;
  reporting_to?: string;
  region?: string;
  frequency?: string;
  stage?: string;
  sales_type?: string;
  remarks?: string;
}

// Webhook Types
export interface WebhookConfig {
  id: number;
  name: string;
  description?: string;
  direction: 'incoming' | 'outgoing';
  event: string;
  url?: string;
  is_active: boolean;
  created_at: string;
}

export interface WebhookLog {
  id: number;
  direction: 'incoming' | 'outgoing';
  event?: string;
  is_successful: boolean;
  error_message?: string;
  entity_type?: string;
  entity_id?: number;
  created_at: string;
  request_payload?: Record<string, unknown>;
  response_payload?: Record<string, unknown>;
}

// Dashboard Types
export interface DashboardStats {
  pre_leads: CountStats;
  leads: CountStats;
  customers: CountStats;
  conversions: ConversionStats;
  funnel: FunnelData;
  recent_activities: RecentActivity[];
  leads_by_source: LeadsBySource[];
  leads_by_status: LeadsByStatus[];
  sales_targets: SalesTargetProgress[];
}

export interface CountStats {
  total: number;
  today: number;
  this_week: number;
  this_month: number;
  change_percentage: number;
}

export interface ConversionStats {
  pre_lead_to_lead: number;
  lead_to_customer: number;
  overall: number;
}

export interface FunnelData {
  pre_leads: number;
  leads: number;
  customers: number;
  stages: FunnelStage[];
}

export interface FunnelStage {
  stage: string;
  count: number;
  value: number;
}

export interface RecentActivity {
  id: number;
  activity_type: string;
  subject: string;
  entity_type: string;
  entity_id: number;
  entity_name: string;
  performed_by_name?: string;
  created_at: string;
}

export interface LeadsBySource {
  source: string;
  count: number;
  percentage: number;
}

export interface LeadsByStatus {
  status: string;
  count: number;
}

export interface SalesTargetProgress {
  target_name: string;
  target_value: number;
  achieved_value: number;
  progress_percentage: number;
  currency: string;
}

// Pagination Types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Lead Generation Search Types
export type AIEngine = 'Claude' | 'ChatGPT' | 'Gemini';
export type EnrichmentSource = 'Apollo' | 'Lusha' | 'Clearbit' | 'ZoomInfo';
export type LeadSearchSource = 'LinkedIn' | 'Yelp' | 'YellowPages' | 'Crunchbase';

export interface LeadSearchParams {
  industry: string;
  location: string;
  ai_engine: AIEngine;
  job_title?: string;
  keywords?: string;
  sources?: string[];
  enrichment_source?: EnrichmentSource;
  min_score?: number;
  exclude_empty_contacts?: boolean;
}

export interface GeneratedLead {
  ai_engine: string;
  source: string;
  discovery_mode: string;
  confidence_score: number;
  validated_by_ai?: boolean;
  company_name: string;
  website: string;
  snippet: string;
  industry?: string;
  location?: string;
  email: string | null;
  phone: string | null;
  extracted_email: string | null;
  extracted_phone: string | null;
  score: number;
  reason: string;
  company_size?: string;
  linkedin?: string;
  contact_name?: string;
  contact_title?: string;
  semantic_validation?: Record<string, unknown>;
}

export interface LeadSearchMetadata {
  industry: string;
  location: string;
  discovery_sources?: string[];
  sources?: string[];
  enrichment_source?: string | null;
  total_found: number;
  errors_encountered: number;
}

export interface LeadSearchResponse {
  status: string;
  discovery_mode: string;
  ai_engine: string;
  search_metadata: LeadSearchMetadata;
  leads: GeneratedLead[];
}

// Lead Enrichment Types
export interface EnrichLeadInput {
  company_name: string;
  website?: string;
  email?: string;
  phone?: string;
  location?: string;
  contact_name?: string;
  contact_title?: string;
  extra?: Record<string, unknown>;
}

export interface EnrichLeadRequest {
  leads: EnrichLeadInput[];
  enrich_fields?: ('email' | 'phone' | 'address' | 'contact_name' | 'contact_title')[];
  verify_existing?: boolean;
  verify_deliverability?: boolean;
  enrichment_providers?: string[];
  skip_verified?: boolean;
  max_concurrent?: number;
}

export interface FormatValidationEmail {
  valid: boolean;
  email: string;
  reason: string;
  warnings: string[];
  is_disposable: boolean;
  is_role_based: boolean;
}

export interface FormatValidationPhone {
  valid: boolean;
  phone: string;
  normalized: string;
  national_format: string;
  country_code: string;
  reason: string;
  warnings: string[];
  is_fake: boolean;
}

export interface FormatValidationAddress {
  valid: boolean;
  address: string;
  reason: string;
  warnings: string[];
  has_street: boolean;
  has_city_state: boolean;
  is_po_box: boolean;
}

export interface FormatValidation {
  email?: FormatValidationEmail;
  phone?: FormatValidationPhone;
  address?: FormatValidationAddress;
}

export interface EmailVerification {
  email: string;
  status: 'valid' | 'invalid' | 'catch-all' | 'unknown';
  deliverable: boolean;
  source: string;
  confidence: number;
  details?: {
    smtp_check: boolean;
    mx_records: boolean;
    is_catch_all: boolean;
    is_disposable: boolean;
    is_role_based: boolean;
    did_you_mean: string | null;
    provider: string;
  };
}

export interface PhoneVerification {
  phone: string;
  valid: boolean;
  source: string;
  line_type: string;
  carrier: string;
  location: string;
  country_code: string;
  confidence: number;
}

export interface AddressVerification {
  address: string;
  standardized: string;
  valid: boolean;
  source: string;
  coordinates: { lat: number; lng: number } | null;
  components?: {
    street_number?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    country_code?: string;
  };
  confidence: number;
}

export interface EnrichmentMetadata {
  enriched_at: string;
  fields_enriched: string[];
  fields_still_missing: string[];
  fields_failed: string[];
  providers_used: string[];
  total_api_calls: number;
  enrichment_duration_ms: number;
}

export interface EnrichedLead {
  company_name: string;
  website: string;
  email: string;
  phone: string;
  location: string;
  contact_name: string;
  contact_title: string;
  email_source?: string;
  phone_source?: string;
  address_source?: string;
  contact_name_source?: string;
  contact_title_source?: string;
  linkedin?: string;
  company_size?: string;
  industry?: string;
  address?: string;
  format_validation?: FormatValidation;
  email_verification?: EmailVerification;
  phone_verification?: PhoneVerification;
  address_verification?: AddressVerification;
  enrichment_metadata?: EnrichmentMetadata;
  extra?: Record<string, unknown>;
}

export interface EnrichLeadResponse {
  status: string;
  summary: {
    total_leads: number;
    enriched: number;
    skipped: number;
    verified: number;
    providers_strategy: string[];
  };
  leads: EnrichedLead[];
}

// Bulk Enrichment Types (async job-based)
export interface BulkEnrichRequest {
  leads: EnrichLeadInput[];
  enrich_fields?: ('email' | 'phone' | 'address' | 'contact_name' | 'contact_title')[];
  verify_existing?: boolean;
  verify_deliverability?: boolean;
  enrichment_providers?: string[];
  skip_verified?: boolean;
  max_concurrent?: number;
  chunk_size?: number;
}

export interface BulkEnrichSubmitResponse {
  status: string;
  job_id: string;
  total_leads: number;
  to_enrich: number;
  skipped: number;
  total_chunks: number;
  chunk_size: number;
  message: string;
}

export type BulkJobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface BulkEnrichJobProgress {
  job_id: string;
  status: BulkJobStatus;
  progress_percent: number;
  total_leads: number;
  processed: number;
  enriched: number;
  failed: number;
  skipped: number;
  current_chunk: number;
  total_chunks: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  errors: string[];
  config: {
    enrich_fields: string[];
    enrichment_providers: string[];
    chunk_size: number;
  };
}

export interface BulkEnrichResultsResponse {
  job_id: string;
  status: BulkJobStatus;
  pagination: {
    page: number;
    page_size: number;
    total_results: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  leads: EnrichedLead[];
}
