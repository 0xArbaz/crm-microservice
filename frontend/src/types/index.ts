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
export type PreLeadStatus = 'new' | 'contacted' | 'validated' | 'discarded';
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
  status: PreLeadStatus;
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
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiation' | 'won' | 'lost';
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
  status: LeadStatus;
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

// Sales Target Types
export interface SalesTarget {
  id: number;
  name: string;
  description?: string;
  target_type: 'revenue' | 'lead_count' | 'conversion' | 'customer_count';
  period: 'monthly' | 'quarterly' | 'yearly';
  target_value: number;
  achieved_value: number;
  progress_percentage: number;
  currency: string;
  start_date: string;
  end_date: string;
  user_id?: number;
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
