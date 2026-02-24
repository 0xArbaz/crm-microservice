'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import api from '@/lib/api';
import {
  ArrowLeft,
  Copy,
  Check,
  Code,
  Terminal,
  FileJson,
  Book,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// API Integration documentation for incoming webhooks
interface ApiField {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface ApiDoc {
  title: string;
  method: string;
  endpoint: string;
  description: string;
  fields: ApiField[];
  example: string;
  response: string;
}

interface MenuApiDocs {
  title: string;
  description: string;
  apis: ApiDoc[];
}

// Common pre-lead fields for reuse
const PRE_LEAD_FIELDS: ApiField[] = [
  // Basic Information
  { name: 'first_name', type: 'string', required: false, description: 'First name or company name' },
  { name: 'last_name', type: 'string', required: false, description: 'Last name' },
  { name: 'email', type: 'string', required: false, description: 'Email address' },
  { name: 'phone', type: 'string', required: false, description: 'Phone number' },
  { name: 'alternate_phone', type: 'string', required: false, description: 'Alternate phone number' },
  // Company Information
  { name: 'company_name', type: 'string', required: false, description: 'Company name' },
  { name: 'designation', type: 'string', required: false, description: 'Job designation/title' },
  { name: 'website', type: 'string', required: false, description: 'Company website URL' },
  // Lead Details
  { name: 'source', type: 'string', required: false, description: 'Source: website, referral, social_media, cold_call, walk_in, whatsapp, email, erp, other' },
  { name: 'source_details', type: 'string', required: false, description: 'Additional source details' },
  { name: 'status', type: 'integer', required: false, description: 'Status: 0 = active, 1 = discarded' },
  // Interest & Requirements
  { name: 'product_interest', type: 'string', required: false, description: 'Products/services interested in' },
  { name: 'requirements', type: 'string', required: false, description: 'Specific requirements' },
  { name: 'budget_range', type: 'string', required: false, description: 'Budget range' },
  // Location
  { name: 'city', type: 'string', required: false, description: 'City name' },
  { name: 'state', type: 'string', required: false, description: 'State name' },
  { name: 'country', type: 'string', required: false, description: 'Country (default: India)' },
  // Address Details
  { name: 'address_line1', type: 'string', required: false, description: 'Address line 1' },
  { name: 'address_line2', type: 'string', required: false, description: 'Address line 2' },
  { name: 'zip_code', type: 'string', required: false, description: 'ZIP/Postal code' },
  { name: 'city_id', type: 'integer', required: false, description: 'City ID' },
  { name: 'state_id', type: 'integer', required: false, description: 'State ID' },
  { name: 'country_id', type: 'integer', required: false, description: 'Country ID' },
  // Contact Details
  { name: 'phone_no', type: 'string', required: false, description: 'Office phone number' },
  { name: 'fax', type: 'string', required: false, description: 'Fax number' },
  { name: 'nof_representative', type: 'string', required: false, description: 'Name of representative' },
  { name: 'memo', type: 'string', required: false, description: 'Memo text' },
  // Business Details
  { name: 'group_id', type: 'integer', required: false, description: 'Group ID' },
  { name: 'lead_status', type: 'string', required: false, description: 'Lead status' },
  { name: 'industry_id', type: 'integer', required: false, description: 'Industry ID' },
  { name: 'region_id', type: 'integer', required: false, description: 'Region ID' },
  { name: 'office_timings', type: 'string', required: false, description: 'Office timings' },
  { name: 'timezone', type: 'string', required: false, description: 'Timezone' },
  { name: 'lead_source', type: 'string', required: false, description: 'Lead source' },
  { name: 'sales_rep', type: 'integer', required: false, description: 'Sales representative user ID' },
  { name: 'lead_since', type: 'string', required: false, description: 'Lead since date (YYYY-MM-DD)' },
  { name: 'lead_score', type: 'string', required: false, description: 'Lead score' },
  // Notes
  { name: 'notes', type: 'string', required: false, description: 'Additional notes' },
  { name: 'remarks', type: 'string', required: false, description: 'Remarks' },
  // Assignment
  { name: 'assigned_to', type: 'integer', required: false, description: 'Assigned user ID' },
];

const MENU_API_DOCS: Record<string, MenuApiDocs> = {
  'pre-leads-new': {
    title: 'Create Pre-Lead API',
    description: 'API endpoint for creating new pre-leads from external systems like ERP, website forms, etc.',
    apis: [{
      title: 'Create Pre-Lead',
      method: 'POST',
      endpoint: '/api/v1/webhooks/incoming/pre-lead/create',
      description: 'Creates a new pre-lead with all company and contact details',
      fields: [
        { name: 'first_name', type: 'string', required: true, description: 'First name or company name (required)' },
        ...PRE_LEAD_FIELDS.filter(f => f.name !== 'first_name'),
      ],
      example: `{
  "event": "new_inquiry",
  "source": "erp",
  "data": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "company_name": "ABC Corporation Ltd.",
    "designation": "Chief Executive Officer",
    "website": "https://www.abccorp.com",
    "source": "erp",
    "source_details": "ERP System Integration",
    "product_interest": "Enterprise CRM Suite",
    "requirements": "Need full CRM implementation",
    "budget_range": "$50,000 - $100,000",
    "city": "New York",
    "state": "New York",
    "country": "USA",
    "address_line1": "123 Business Avenue",
    "address_line2": "Floor 15",
    "zip_code": "10001",
    "industry_id": 10,
    "region_id": 3,
    "notes": "High priority prospect",
    "assigned_to": 5
  }
}`,
      response: `{
  "status": "success",
  "message": "Pre-lead created successfully",
  "data": { "pre_lead_id": 123 }
}`
    }]
  },
  'pre-leads-manage': {
    title: 'Pre-Lead Management APIs',
    description: 'API endpoints for managing pre-leads including company details, contacts, company profile, and memo. All APIs include pre_lead_id for easy tracking.',
    apis: [
      {
        title: 'Update Pre-Lead',
        method: 'POST',
        endpoint: '/api/v1/webhooks/incoming/pre-lead/update',
        description: 'Updates an existing pre-lead with new information. Use pre_lead_id in data to identify the record.',
        fields: [
          { name: 'pre_lead_id', type: 'integer', required: true, description: 'Pre-lead ID to update (required for tracking)' },
          ...PRE_LEAD_FIELDS,
        ],
        example: `{
  "event": "pre_lead_update",
  "source": "erp",
  "data": {
    "pre_lead_id": 123,
    "first_name": "John",
    "last_name": "Doe Updated",
    "email": "john.updated@example.com",
    "phone": "+1234567899",
    "company_name": "ABC Corporation Ltd.",
    "designation": "Chief Executive Officer",
    "source": "referral",
    "lead_status": "qualified",
    "lead_score": "A+",
    "assigned_to": 8
  }
}`,
        response: `{
  "status": "success",
  "message": "Pre-lead updated successfully",
  "data": { "pre_lead_id": 123 }
}`
      },
      {
        title: 'Update Company Details',
        method: 'POST',
        endpoint: '/api/v1/webhooks/incoming/pre-lead/company-details',
        description: 'Updates company details for a pre-lead including address and business information.',
        fields: [
          { name: 'pre_lead_id', type: 'integer', required: true, description: 'Pre-lead ID to update (required for tracking)' },
          { name: 'company_name', type: 'string', required: false, description: 'Company name' },
          { name: 'website', type: 'string', required: false, description: 'Company website URL' },
          { name: 'address_line1', type: 'string', required: false, description: 'Address line 1' },
          { name: 'address_line2', type: 'string', required: false, description: 'Address line 2' },
          { name: 'city', type: 'string', required: false, description: 'City name' },
          { name: 'city_id', type: 'integer', required: false, description: 'City ID' },
          { name: 'state', type: 'string', required: false, description: 'State/Province name' },
          { name: 'state_id', type: 'integer', required: false, description: 'State ID' },
          { name: 'country', type: 'string', required: false, description: 'Country name' },
          { name: 'country_id', type: 'integer', required: false, description: 'Country ID' },
          { name: 'zip_code', type: 'string', required: false, description: 'ZIP/Postal code' },
          { name: 'phone_no', type: 'string', required: false, description: 'Office phone number' },
          { name: 'fax', type: 'string', required: false, description: 'Fax number' },
          { name: 'industry_id', type: 'integer', required: false, description: 'Industry ID' },
          { name: 'region_id', type: 'integer', required: false, description: 'Region ID' },
          { name: 'group_id', type: 'integer', required: false, description: 'Group ID' },
          { name: 'office_timings', type: 'string', required: false, description: 'Office timings' },
          { name: 'timezone', type: 'string', required: false, description: 'Timezone' },
        ],
        example: `{
  "event": "pre_lead_company_details_update",
  "source": "erp",
  "data": {
    "pre_lead_id": 123,
    "company_name": "ABC Corporation Ltd.",
    "website": "https://www.abccorp.com",
    "address_line1": "123 Business Avenue",
    "address_line2": "Floor 15, Suite 1501",
    "city": "New York",
    "city_id": 1,
    "state": "New York",
    "state_id": 33,
    "country": "USA",
    "country_id": 1,
    "zip_code": "10001",
    "phone_no": "+1-212-555-0100",
    "fax": "+1-212-555-0101",
    "industry_id": 10,
    "region_id": 3,
    "group_id": 5,
    "office_timings": "9:00 AM - 6:00 PM EST",
    "timezone": "America/New_York"
  }
}`,
        response: `{
  "status": "success",
  "message": "Company details updated successfully",
  "data": { "pre_lead_id": 123 }
}`
      },
      {
        title: 'Add/Update Contact',
        method: 'POST',
        endpoint: '/api/v1/webhooks/incoming/pre-lead/contacts',
        description: 'Adds or updates a contact person for the pre-lead. If contact_id is provided, updates existing contact.',
        fields: [
          { name: 'pre_lead_id', type: 'integer', required: true, description: 'Pre-lead ID this contact belongs to (required for tracking)' },
          { name: 'contact_id', type: 'integer', required: false, description: 'Contact ID (for updates, omit for new contact)' },
          { name: 'first_name', type: 'string', required: true, description: 'Contact first name' },
          { name: 'last_name', type: 'string', required: false, description: 'Contact last name' },
          { name: 'email', type: 'string', required: false, description: 'Contact email address' },
          { name: 'phone', type: 'string', required: false, description: 'Contact phone number' },
          { name: 'mobile', type: 'string', required: false, description: 'Contact mobile number' },
          { name: 'designation', type: 'string', required: false, description: 'Contact job title/designation' },
          { name: 'department', type: 'string', required: false, description: 'Contact department' },
          { name: 'is_primary', type: 'boolean', required: false, description: 'Whether this is the primary contact' },
          { name: 'is_decision_maker', type: 'boolean', required: false, description: 'Whether this contact is a decision maker' },
          { name: 'linkedin_url', type: 'string', required: false, description: 'LinkedIn profile URL' },
          { name: 'notes', type: 'string', required: false, description: 'Notes about this contact' },
        ],
        example: `{
  "event": "pre_lead_contact_add",
  "source": "erp",
  "data": {
    "pre_lead_id": 123,
    "first_name": "Michael",
    "last_name": "Johnson",
    "email": "michael.johnson@abccorp.com",
    "phone": "+1-212-555-0102",
    "mobile": "+1-917-555-0102",
    "designation": "Chief Technology Officer",
    "department": "Technology",
    "is_primary": false,
    "is_decision_maker": true,
    "linkedin_url": "https://linkedin.com/in/michaeljohnson",
    "notes": "Technical decision maker, prefers email communication"
  }
}`,
        response: `{
  "status": "success",
  "message": "Contact added successfully",
  "data": { "pre_lead_id": 123, "contact_id": 456 }
}`
      },
      {
        title: 'Delete Contact',
        method: 'POST',
        endpoint: '/api/v1/webhooks/incoming/pre-lead/contacts/delete',
        description: 'Deletes a contact from the pre-lead.',
        fields: [
          { name: 'pre_lead_id', type: 'integer', required: true, description: 'Pre-lead ID this contact belongs to (required for tracking)' },
          { name: 'contact_id', type: 'integer', required: true, description: 'Contact ID to delete' },
          { name: 'reason', type: 'string', required: false, description: 'Reason for deleting the contact' },
        ],
        example: `{
  "event": "pre_lead_contact_delete",
  "source": "erp",
  "data": {
    "pre_lead_id": 123,
    "contact_id": 456,
    "reason": "Contact no longer with company"
  }
}`,
        response: `{
  "status": "success",
  "message": "Contact deleted successfully",
  "data": { "pre_lead_id": 123, "contact_id": 456 }
}`
      },
      {
        title: 'Update Company Profile',
        method: 'POST',
        endpoint: '/api/v1/webhooks/incoming/pre-lead/company-profile',
        description: 'Updates company profile information including business details and requirements.',
        fields: [
          { name: 'pre_lead_id', type: 'integer', required: true, description: 'Pre-lead ID to update (required for tracking)' },
          { name: 'company_description', type: 'string', required: false, description: 'Brief description of the company' },
          { name: 'employee_count', type: 'string', required: false, description: 'Number of employees (e.g., "50-100", "500+")' },
          { name: 'annual_revenue', type: 'string', required: false, description: 'Annual revenue range' },
          { name: 'founded_year', type: 'integer', required: false, description: 'Year company was founded' },
          { name: 'business_type', type: 'string', required: false, description: 'Type of business (B2B, B2C, etc.)' },
          { name: 'product_interest', type: 'string', required: false, description: 'Products/services interested in' },
          { name: 'requirements', type: 'string', required: false, description: 'Specific requirements' },
          { name: 'budget_range', type: 'string', required: false, description: 'Budget range' },
          { name: 'timeline', type: 'string', required: false, description: 'Expected timeline for decision' },
          { name: 'competitors', type: 'string', required: false, description: 'Current competitors/solutions being considered' },
          { name: 'pain_points', type: 'string', required: false, description: 'Current pain points or challenges' },
          { name: 'decision_criteria', type: 'string', required: false, description: 'Key decision criteria' },
          { name: 'social_linkedin', type: 'string', required: false, description: 'Company LinkedIn URL' },
          { name: 'social_twitter', type: 'string', required: false, description: 'Company Twitter/X URL' },
          { name: 'social_facebook', type: 'string', required: false, description: 'Company Facebook URL' },
        ],
        example: `{
  "event": "pre_lead_company_profile_update",
  "source": "erp",
  "data": {
    "pre_lead_id": 123,
    "company_description": "Leading enterprise software solutions provider",
    "employee_count": "500-1000",
    "annual_revenue": "$50M - $100M",
    "founded_year": 2005,
    "business_type": "B2B",
    "product_interest": "Enterprise CRM Suite, Analytics Module",
    "requirements": "Full CRM implementation with ERP integration, custom reporting",
    "budget_range": "$75,000 - $150,000",
    "timeline": "Q2 2024",
    "competitors": "Salesforce, HubSpot",
    "pain_points": "Data silos, manual reporting, poor customer visibility",
    "decision_criteria": "Integration capabilities, scalability, support quality",
    "social_linkedin": "https://linkedin.com/company/abccorp",
    "social_twitter": "https://twitter.com/abccorp"
  }
}`,
        response: `{
  "status": "success",
  "message": "Company profile updated successfully",
  "data": { "pre_lead_id": 123 }
}`
      },
      {
        title: 'Update Memo',
        method: 'POST',
        endpoint: '/api/v1/webhooks/incoming/pre-lead/memo',
        description: 'Updates memo/notes for the pre-lead. Can append to existing or replace.',
        fields: [
          { name: 'pre_lead_id', type: 'integer', required: true, description: 'Pre-lead ID to update (required for tracking)' },
          { name: 'memo', type: 'string', required: true, description: 'Memo text content' },
          { name: 'memo_type', type: 'string', required: false, description: 'Type of memo: general, meeting, call, email, task' },
          { name: 'action', type: 'string', required: false, description: 'Action: "append" (default) or "replace"' },
          { name: 'is_important', type: 'boolean', required: false, description: 'Mark memo as important/priority' },
          { name: 'created_by_name', type: 'string', required: false, description: 'Name of person creating the memo' },
          { name: 'follow_up_date', type: 'string', required: false, description: 'Follow-up date (YYYY-MM-DD)' },
          { name: 'tags', type: 'array', required: false, description: 'Tags for categorizing the memo' },
        ],
        example: `{
  "event": "pre_lead_memo_update",
  "source": "erp",
  "data": {
    "pre_lead_id": 123,
    "memo": "Follow-up call completed. Customer confirmed interest in CRM Suite. Need to schedule product demo for next week. Key concerns: integration with existing SAP system.",
    "memo_type": "call",
    "action": "append",
    "is_important": true,
    "created_by_name": "John Smith",
    "follow_up_date": "2024-01-22",
    "tags": ["demo-scheduled", "high-priority", "sap-integration"]
  }
}`,
        response: `{
  "status": "success",
  "message": "Memo updated successfully",
  "data": { "pre_lead_id": 123, "memo_id": 789 }
}`
      },
      {
        title: 'Discard Pre-Lead',
        method: 'POST',
        endpoint: '/api/v1/webhooks/incoming/pre-lead/discard',
        description: 'Discards/archives a pre-lead.',
        fields: [
          { name: 'pre_lead_id', type: 'integer', required: true, description: 'Pre-lead ID to discard (required for tracking)' },
          { name: 'reason', type: 'string', required: false, description: 'Reason for discarding the pre-lead' },
          { name: 'discard_category', type: 'string', required: false, description: 'Category: not_interested, budget, timing, competitor, duplicate, invalid, other' },
        ],
        example: `{
  "event": "pre_lead_discard",
  "source": "erp",
  "data": {
    "pre_lead_id": 123,
    "reason": "Customer chose competitor solution - better pricing",
    "discard_category": "competitor"
  }
}`,
        response: `{
  "status": "success",
  "message": "Pre-lead discarded successfully",
  "data": { "pre_lead_id": 123 }
}`
      },
      {
        title: 'Restore Pre-Lead',
        method: 'POST',
        endpoint: '/api/v1/webhooks/incoming/pre-lead/restore',
        description: 'Restores a previously discarded pre-lead.',
        fields: [
          { name: 'pre_lead_id', type: 'integer', required: true, description: 'Pre-lead ID to restore (required for tracking)' },
          { name: 'notes', type: 'string', required: false, description: 'Notes about why the pre-lead is being restored' },
        ],
        example: `{
  "event": "pre_lead_restore",
  "source": "erp",
  "data": {
    "pre_lead_id": 123,
    "notes": "Customer contacted again with renewed interest after budget approval"
  }
}`,
        response: `{
  "status": "success",
  "message": "Pre-lead restored successfully",
  "data": { "pre_lead_id": 123 }
}`
      },
      {
        title: 'Delete Memo',
        method: 'POST',
        endpoint: '/api/v1/webhooks/incoming/pre-lead/memo/delete',
        description: 'Deletes a specific memo from the pre-lead.',
        fields: [
          { name: 'pre_lead_id', type: 'integer', required: true, description: 'Pre-lead ID this memo belongs to (required for tracking)' },
          { name: 'memo_id', type: 'integer', required: true, description: 'Memo ID to delete' },
          { name: 'reason', type: 'string', required: false, description: 'Reason for deleting the memo' },
          { name: 'deleted_by_name', type: 'string', required: false, description: 'Name of person deleting the memo' },
        ],
        example: `{
  "event": "pre_lead_memo_delete",
  "source": "erp",
  "data": {
    "pre_lead_id": 123,
    "memo_id": 789,
    "reason": "Duplicate entry - information already captured in another memo",
    "deleted_by_name": "John Smith"
  }
}`,
        response: `{
  "status": "success",
  "message": "Memo deleted successfully",
  "data": { "pre_lead_id": 123, "memo_id": 789 }
}`
      },
      {
        title: 'Validate Pre-Lead',
        method: 'POST',
        endpoint: '/api/v1/webhooks/incoming/pre-lead/validate',
        description: 'Validates and converts a pre-lead to a qualified lead. This marks the pre-lead as validated and creates a new lead record.',
        fields: [
          { name: 'pre_lead_id', type: 'integer', required: true, description: 'Pre-lead ID to validate (required for tracking)' },
          { name: 'validated_by', type: 'integer', required: false, description: 'User ID who validated the pre-lead' },
          { name: 'validated_by_name', type: 'string', required: false, description: 'Name of person who validated' },
          { name: 'validation_notes', type: 'string', required: false, description: 'Notes about the validation' },
          { name: 'lead_status', type: 'string', required: false, description: 'Initial status for the new lead: new, contacted, qualified, negotiation' },
          { name: 'priority', type: 'string', required: false, description: 'Lead priority: low, medium, high, critical' },
          { name: 'expected_value', type: 'number', required: false, description: 'Expected deal value' },
          { name: 'expected_close_date', type: 'string', required: false, description: 'Expected close date (YYYY-MM-DD)' },
          { name: 'sales_rep', type: 'integer', required: false, description: 'Sales representative user ID to assign' },
          { name: 'pipeline_stage', type: 'integer', required: false, description: 'Initial pipeline stage ID' },
          { name: 'tags', type: 'array', required: false, description: 'Tags to apply to the new lead' },
          { name: 'convert_contacts', type: 'boolean', required: false, description: 'Whether to copy contacts to the lead (default: true)' },
          { name: 'convert_memos', type: 'boolean', required: false, description: 'Whether to copy memos to the lead (default: true)' },
        ],
        example: `{
  "event": "pre_lead_validate",
  "source": "erp",
  "data": {
    "pre_lead_id": 123,
    "validated_by": 5,
    "validated_by_name": "Sarah Johnson",
    "validation_notes": "Verified company details and budget. Ready for sales engagement.",
    "lead_status": "qualified",
    "priority": "high",
    "expected_value": 75000,
    "expected_close_date": "2024-06-30",
    "sales_rep": 8,
    "pipeline_stage": 2,
    "tags": ["enterprise", "high-value", "q2-target"],
    "convert_contacts": true,
    "convert_memos": true
  }
}`,
        response: `{
  "status": "success",
  "message": "Pre-lead validated and converted to lead successfully",
  "data": {
    "pre_lead_id": 123,
    "lead_id": 456,
    "validated_at": "2024-01-20T14:30:00Z"
  }
}`
      }
    ]
  },
  'leads-new': {
    title: 'Create Lead API',
    description: 'API endpoint for creating new leads directly from external systems like ERP, website forms, etc. Leads are qualified prospects ready for sales engagement.',
    apis: [{
      title: 'Create Lead',
      method: 'POST',
      endpoint: '/api/v1/webhooks/incoming/lead/create',
      description: 'Creates a new lead directly with all company details and sales tracking fields',
      fields: [
        // Basic Information
        { name: 'first_name', type: 'string', required: true, description: 'First name (required)' },
        { name: 'last_name', type: 'string', required: false, description: 'Last name' },
        { name: 'email', type: 'string', required: false, description: 'Email address' },
        { name: 'phone', type: 'string', required: false, description: 'Phone number' },
        { name: 'alternate_phone', type: 'string', required: false, description: 'Alternate phone number' },
        // Company Information
        { name: 'company_name', type: 'string', required: false, description: 'Company name' },
        { name: 'company_code', type: 'string', required: false, description: 'Company code' },
        { name: 'designation', type: 'string', required: false, description: 'Job designation/title' },
        { name: 'company_size', type: 'string', required: false, description: 'Company size (e.g., 50-100, 500+)' },
        { name: 'industry', type: 'string', required: false, description: 'Industry name' },
        { name: 'website', type: 'string', required: false, description: 'Company website URL' },
        // Lead Details
        { name: 'source', type: 'string', required: false, description: 'Source: pre_lead, direct, website, referral, social_media, cold_call, walk_in, whatsapp, email, erp, other' },
        { name: 'source_details', type: 'string', required: false, description: 'Additional source details' },
        { name: 'status', type: 'integer', required: false, description: 'Status: 0 = active, 1 = discarded' },
        { name: 'lead_status', type: 'string', required: false, description: 'Workflow status: new, contacted, qualified, proposal_sent, negotiation, won, lost' },
        { name: 'priority', type: 'string', required: false, description: 'Priority: low, medium, high, critical' },
        // Pipeline Stage
        { name: 'pipeline_stage', type: 'integer', required: false, description: 'Pipeline stage (1-6): 1=New, 2=Contacted, 3=Qualified, 4=Proposal, 5=Negotiation, 6=Closed' },
        // Financial
        { name: 'expected_value', type: 'number', required: false, description: 'Expected deal value' },
        { name: 'actual_value', type: 'number', required: false, description: 'Actual deal value' },
        { name: 'currency', type: 'string', required: false, description: 'Currency code (default: INR)' },
        // Products/Services
        { name: 'product_interest', type: 'string', required: false, description: 'Products/services interested in' },
        { name: 'requirements', type: 'string', required: false, description: 'Specific requirements' },
        // Timeline
        { name: 'expected_close_date', type: 'string', required: false, description: 'Expected close date (YYYY-MM-DD or ISO 8601)' },
        { name: 'last_contacted', type: 'string', required: false, description: 'Last contacted date (ISO 8601)' },
        { name: 'next_follow_up', type: 'string', required: false, description: 'Next follow-up date (ISO 8601)' },
        // Location
        { name: 'address', type: 'string', required: false, description: 'Full address' },
        { name: 'address_line1', type: 'string', required: false, description: 'Address line 1' },
        { name: 'address_line2', type: 'string', required: false, description: 'Address line 2' },
        { name: 'city', type: 'string', required: false, description: 'City name' },
        { name: 'city_id', type: 'integer', required: false, description: 'City ID' },
        { name: 'state', type: 'string', required: false, description: 'State name' },
        { name: 'state_id', type: 'integer', required: false, description: 'State ID' },
        { name: 'country', type: 'string', required: false, description: 'Country name' },
        { name: 'country_id', type: 'integer', required: false, description: 'Country ID' },
        { name: 'pincode', type: 'string', required: false, description: 'Pincode' },
        { name: 'zip_code', type: 'string', required: false, description: 'ZIP/Postal code' },
        // Contact Fields
        { name: 'phone_no', type: 'string', required: false, description: 'Office phone number' },
        { name: 'fax', type: 'string', required: false, description: 'Fax number' },
        { name: 'nof_representative', type: 'string', required: false, description: 'Name of representative' },
        // Business Fields
        { name: 'memo', type: 'string', required: false, description: 'Memo text' },
        { name: 'group_id', type: 'integer', required: false, description: 'Group ID' },
        { name: 'industry_id', type: 'integer', required: false, description: 'Industry ID' },
        { name: 'region_id', type: 'integer', required: false, description: 'Region ID' },
        { name: 'office_timings', type: 'string', required: false, description: 'Office timings' },
        { name: 'timezone', type: 'string', required: false, description: 'Timezone' },
        { name: 'lead_source', type: 'string', required: false, description: 'Lead source' },
        { name: 'lead_score', type: 'integer', required: false, description: 'Lead score (0-100)' },
        { name: 'sales_rep', type: 'string', required: false, description: 'Sales representative name' },
        { name: 'lead_since', type: 'string', required: false, description: 'Lead since date (ISO 8601)' },
        { name: 'remarks', type: 'string', required: false, description: 'Remarks' },
        // Notes
        { name: 'notes', type: 'string', required: false, description: 'Additional notes' },
        // Assignment
        { name: 'assigned_to', type: 'integer', required: false, description: 'Assigned user ID' },
        { name: 'team_id', type: 'integer', required: false, description: 'Team ID' },
        // System Tracking
        { name: 'company_id', type: 'integer', required: false, description: 'Company ID' },
        { name: 'createdby', type: 'integer', required: false, description: 'Created by user ID' },
        { name: 'updatedby', type: 'integer', required: false, description: 'Updated by user ID' },
      ],
      example: `{
  "event": "new_lead",
  "source": "erp",
  "data": {
    "first_name": "Robert",
    "last_name": "Johnson",
    "email": "robert@xyzindustries.com",
    "phone": "+1234567893",
    "alternate_phone": "+1234567894",
    "company_name": "XYZ Industries Inc.",
    "company_code": "XYZ-001",
    "designation": "Chief Technology Officer",
    "company_size": "500-1000",
    "industry": "Manufacturing",
    "website": "https://www.xyzindustries.com",
    "source": "referral",
    "source_details": "Referred by ABC Corp",
    "status": 0,
    "lead_status": "new",
    "priority": "high",
    "pipeline_stage": 1,
    "expected_value": 100000.00,
    "currency": "USD",
    "product_interest": "Enterprise CRM Suite",
    "requirements": "Full CRM implementation with ERP integration",
    "expected_close_date": "2024-03-15",
    "next_follow_up": "2024-01-20T10:00:00Z",
    "address": "123 Industrial Park, Building A",
    "address_line1": "123 Industrial Park",
    "address_line2": "Building A, Floor 5",
    "city": "Chicago",
    "city_id": 25,
    "state": "Illinois",
    "state_id": 14,
    "country": "USA",
    "country_id": 1,
    "zip_code": "60601",
    "phone_no": "+1-312-555-0100",
    "fax": "+1-312-555-0101",
    "nof_representative": "Michael Brown",
    "memo": "New enterprise prospect from partner referral",
    "group_id": 3,
    "industry_id": 15,
    "region_id": 5,
    "office_timings": "8:00 AM - 5:00 PM CST",
    "timezone": "America/Chicago",
    "lead_source": "Partner Referral",
    "lead_score": 75,
    "sales_rep": "John Smith",
    "lead_since": "2024-01-15",
    "remarks": "High potential enterprise client",
    "notes": "Referred by existing client ABC Corp",
    "assigned_to": 5,
    "team_id": 2
  }
}`,
      response: `{
  "status": "success",
  "message": "Lead created successfully",
  "data": { "lead_id": 789 }
}`
    }]
  },
  'leads-manage': {
    title: 'Lead Management APIs',
    description: 'Complete API endpoints for managing leads - company details, contacts, activities, qualified profiles, memos, file uploads, and status management.',
    apis: [
      // ==================== COMPANY DETAILS TAB ====================
      {
        title: 'Update Lead',
        method: 'POST',
        endpoint: '/api/v1/webhooks/incoming/lead/{lead_id}/update',
        description: 'Updates basic lead information and contact details',
        fields: [
          { name: 'lead_id', type: 'integer', required: true, description: 'Lead ID to update (required for tracking)' },
          { name: 'first_name', type: 'string', required: false, description: 'First name' },
          { name: 'last_name', type: 'string', required: false, description: 'Last name' },
          { name: 'email', type: 'string', required: false, description: 'Email address' },
          { name: 'phone', type: 'string', required: false, description: 'Phone number' },
          { name: 'alternate_phone', type: 'string', required: false, description: 'Alternate phone number' },
          { name: 'designation', type: 'string', required: false, description: 'Job designation/title' },
          { name: 'source', type: 'string', required: false, description: 'Source: pre_lead, direct, website, referral, social_media, cold_call, walk_in, whatsapp, email, erp, other' },
          { name: 'source_details', type: 'string', required: false, description: 'Additional source details' },
          { name: 'priority', type: 'string', required: false, description: 'Priority: low, medium, high, critical' },
          { name: 'product_interest', type: 'string', required: false, description: 'Products/services interested in' },
          { name: 'requirements', type: 'string', required: false, description: 'Specific requirements' },
          { name: 'notes', type: 'string', required: false, description: 'Additional notes' },
          { name: 'assigned_to', type: 'integer', required: false, description: 'Assigned user ID' },
          { name: 'team_id', type: 'integer', required: false, description: 'Team ID' },
          { name: 'updatedby', type: 'integer', required: false, description: 'Updated by user ID' },
        ],
        example: `{
  "event": "lead_update",
  "source": "erp",
  "data": {
    "lead_id": 789,
    "first_name": "Robert",
    "last_name": "Johnson Jr.",
    "email": "robert.johnson@xyzindustries.com",
    "phone": "+1234567894",
    "designation": "Chief Technology Officer",
    "priority": "critical",
    "product_interest": "Enterprise CRM Suite",
    "requirements": "Full CRM implementation with ERP integration",
    "notes": "Decision expected by end of month",
    "assigned_to": 5
  }
}`,
        response: `{
  "status": "success",
  "message": "Lead updated successfully",
  "data": { "lead_id": 789 }
}`
      },
      {
        title: 'Update Company Details',
        method: 'POST',
        endpoint: '/api/v1/webhooks/incoming/lead/{lead_id}/company-details/update',
        description: 'Updates company information and address details for a lead',
        fields: [
          // Lead Tracking
          { name: 'lead_id', type: 'integer', required: true, description: 'Lead ID to update (required for tracking)' },
          // Company Information
          { name: 'company_name', type: 'string', required: false, description: 'Company name' },
          { name: 'company_code', type: 'string', required: false, description: 'Company code/ID' },
          { name: 'company_size', type: 'string', required: false, description: 'Company size (e.g., 1-50, 50-200, 200-500, 500+)' },
          { name: 'industry', type: 'string', required: false, description: 'Industry name' },
          { name: 'industry_id', type: 'integer', required: false, description: 'Industry ID' },
          { name: 'website', type: 'string', required: false, description: 'Company website URL' },
          { name: 'group_id', type: 'integer', required: false, description: 'Group ID' },
          { name: 'region_id', type: 'integer', required: false, description: 'Region ID' },
          // Address
          { name: 'address', type: 'string', required: false, description: 'Full address' },
          { name: 'address_line1', type: 'string', required: false, description: 'Address line 1' },
          { name: 'address_line2', type: 'string', required: false, description: 'Address line 2' },
          { name: 'city', type: 'string', required: false, description: 'City name' },
          { name: 'city_id', type: 'integer', required: false, description: 'City ID' },
          { name: 'state', type: 'string', required: false, description: 'State name' },
          { name: 'state_id', type: 'integer', required: false, description: 'State ID' },
          { name: 'country', type: 'string', required: false, description: 'Country name' },
          { name: 'country_id', type: 'integer', required: false, description: 'Country ID' },
          { name: 'pincode', type: 'string', required: false, description: 'Pincode' },
          { name: 'zip_code', type: 'string', required: false, description: 'ZIP/Postal code' },
          // Office Contact
          { name: 'phone_no', type: 'string', required: false, description: 'Office phone number' },
          { name: 'fax', type: 'string', required: false, description: 'Fax number' },
          { name: 'nof_representative', type: 'string', required: false, description: 'Name of representative' },
          { name: 'office_timings', type: 'string', required: false, description: 'Office timings' },
          { name: 'timezone', type: 'string', required: false, description: 'Timezone' },
          // System
          { name: 'updated_by', type: 'integer', required: false, description: 'Updated by user ID' },
        ],
        example: `{
  "event": "lead_company_details_update",
  "source": "erp",
  "data": {
    "lead_id": 789,
    "company_name": "XYZ Industries Inc.",
    "company_code": "XYZ-001",
    "company_size": "500-1000",
    "industry": "Manufacturing",
    "industry_id": 15,
    "website": "https://www.xyzindustries.com",
    "address_line1": "123 Industrial Park",
    "address_line2": "Building A, Floor 5",
    "city": "Chicago",
    "city_id": 25,
    "state": "Illinois",
    "state_id": 14,
    "country": "USA",
    "country_id": 1,
    "zip_code": "60601",
    "phone_no": "+1-312-555-0100",
    "fax": "+1-312-555-0101",
    "office_timings": "8:00 AM - 5:00 PM CST",
    "timezone": "America/Chicago"
  }
}`,
        response: `{
  "status": "success",
  "message": "Company details updated successfully",
  "data": { "lead_id": 789 }
}`
      },
      // ==================== CONTACTS TAB ====================
      {
        title: 'Add Contact',
        method: 'POST',
        endpoint: '/api/v1/webhooks/incoming/lead/{lead_id}/contact/add',
        description: 'Adds a new contact person to a lead',
        fields: [
          // Lead Tracking
          { name: 'lead_id', type: 'integer', required: true, description: 'Lead ID to add contact to (required for tracking)' },
          { name: 'contact_type', type: 'string', required: false, description: 'Type: primary, billing, technical, decision_maker' },
          { name: 'title', type: 'string', required: false, description: 'Title: Mr., Mrs., Ms., Dr.' },
          { name: 'first_name', type: 'string', required: true, description: 'Contact first name (required)' },
          { name: 'last_name', type: 'string', required: false, description: 'Contact last name' },
          { name: 'designation', type: 'string', required: false, description: 'Job title/designation' },
          { name: 'department', type: 'string', required: false, description: 'Department' },
          { name: 'is_primary', type: 'boolean', required: false, description: 'Is primary contact' },
          { name: 'email', type: 'string', required: false, description: 'Primary email address' },
          { name: 'work_email', type: 'string', required: false, description: 'Work email address' },
          { name: 'personal_email', type: 'string', required: false, description: 'Personal email address' },
          { name: 'phone', type: 'string', required: false, description: 'Primary phone number' },
          { name: 'work_phone', type: 'string', required: false, description: 'Work phone number' },
          { name: 'ext', type: 'string', required: false, description: 'Phone extension' },
          { name: 'cell_phone', type: 'string', required: false, description: 'Cell/mobile phone' },
          { name: 'home_phone', type: 'string', required: false, description: 'Home phone number' },
          { name: 'fax', type: 'string', required: false, description: 'Fax number' },
          { name: 'linkedin_url', type: 'string', required: false, description: 'LinkedIn profile URL' },
          { name: 'facebook_url', type: 'string', required: false, description: 'Facebook profile URL' },
          { name: 'twitter_url', type: 'string', required: false, description: 'Twitter profile URL' },
          { name: 'image', type: 'string', required: false, description: 'Profile image URL' },
          { name: 'status', type: 'string', required: false, description: 'Status: active, inactive' },
          { name: 'notes', type: 'string', required: false, description: 'Additional notes' },
          { name: 'created_by', type: 'integer', required: false, description: 'Created by user ID' },
        ],
        example: `{
  "event": "lead_contact_add",
  "source": "crm",
  "data": {
    "lead_id": 789,
    "contact_type": "decision_maker",
    "title": "Ms.",
    "first_name": "Sarah",
    "last_name": "Williams",
    "designation": "Chief Technology Officer",
    "department": "Technology",
    "is_primary": true,
    "email": "sarah.williams@xyzindustries.com",
    "work_phone": "+1-312-555-0201",
    "cell_phone": "+1-312-555-0203",
    "linkedin_url": "https://linkedin.com/in/sarahwilliams",
    "status": "active",
    "notes": "Key decision maker for technology purchases"
  }
}`,
        response: `{
  "status": "success",
  "message": "Contact added successfully",
  "data": { "contact_id": 101, "lead_id": 789 }
}`
      },
      {
        title: 'Update Contact',
        method: 'POST',
        endpoint: '/api/v1/webhooks/incoming/lead/{lead_id}/contact/{contact_id}/update',
        description: 'Updates an existing contact for a lead',
        fields: [
          // Lead & Contact Tracking
          { name: 'lead_id', type: 'integer', required: true, description: 'Lead ID (required for tracking)' },
          { name: 'contact_id', type: 'integer', required: true, description: 'Contact ID to update (required)' },
          { name: 'contact_type', type: 'string', required: false, description: 'Type: primary, billing, technical, decision_maker' },
          { name: 'title', type: 'string', required: false, description: 'Title: Mr., Mrs., Ms., Dr.' },
          { name: 'first_name', type: 'string', required: false, description: 'Contact first name' },
          { name: 'last_name', type: 'string', required: false, description: 'Contact last name' },
          { name: 'designation', type: 'string', required: false, description: 'Job title/designation' },
          { name: 'department', type: 'string', required: false, description: 'Department' },
          { name: 'is_primary', type: 'boolean', required: false, description: 'Is primary contact' },
          { name: 'email', type: 'string', required: false, description: 'Primary email address' },
          { name: 'work_email', type: 'string', required: false, description: 'Work email address' },
          { name: 'phone', type: 'string', required: false, description: 'Primary phone number' },
          { name: 'work_phone', type: 'string', required: false, description: 'Work phone number' },
          { name: 'cell_phone', type: 'string', required: false, description: 'Cell/mobile phone' },
          { name: 'linkedin_url', type: 'string', required: false, description: 'LinkedIn profile URL' },
          { name: 'status', type: 'string', required: false, description: 'Status: active, inactive' },
          { name: 'notes', type: 'string', required: false, description: 'Additional notes' },
          { name: 'updated_by', type: 'integer', required: false, description: 'Updated by user ID' },
        ],
        example: `{
  "event": "lead_contact_update",
  "source": "crm",
  "data": {
    "lead_id": 789,
    "contact_id": 101,
    "designation": "Chief Executive Officer",
    "department": "Executive",
    "is_primary": true,
    "work_phone": "+1-312-555-0300",
    "notes": "Promoted to CEO"
  }
}`,
        response: `{
  "status": "success",
  "message": "Contact updated successfully",
  "data": { "contact_id": 101, "lead_id": 789 }
}`
      },
      {
        title: 'Delete Contact',
        method: 'POST',
        endpoint: '/api/v1/webhooks/incoming/lead/{lead_id}/contact/{contact_id}/delete',
        description: 'Deletes a contact from a lead',
        fields: [
          // Lead & Contact Tracking
          { name: 'lead_id', type: 'integer', required: true, description: 'Lead ID (required for tracking)' },
          { name: 'contact_id', type: 'integer', required: true, description: 'Contact ID to delete (required)' },
          { name: 'reason', type: 'string', required: false, description: 'Reason for deletion' },
          { name: 'deleted_by', type: 'integer', required: false, description: 'Deleted by user ID' },
        ],
        example: `{
  "event": "lead_contact_delete",
  "source": "crm",
  "data": {
    "lead_id": 789,
    "contact_id": 101,
    "reason": "Contact left the company",
    "deleted_by": 5
  }
}`,
        response: `{
  "status": "success",
  "message": "Contact deleted successfully",
  "data": { "contact_id": 101, "lead_id": 789 }
}`
      },
      // ==================== ACTIVITIES TAB ====================
      {
        title: 'Add Activity',
        method: 'POST',
        endpoint: '/api/v1/webhooks/incoming/lead/{lead_id}/activity/add',
        description: 'Logs an activity (call, email, meeting, etc.) for a lead',
        fields: [
          // Lead Tracking
          { name: 'lead_id', type: 'integer', required: true, description: 'Lead ID to add activity to (required for tracking)' },
          { name: 'activity_type', type: 'string', required: true, description: 'Type: call, email, meeting, whatsapp, note, task, follow_up, other (required)' },
          { name: 'subject', type: 'string', required: true, description: 'Activity subject/title (required)' },
          { name: 'description', type: 'string', required: false, description: 'Activity description' },
          { name: 'outcome', type: 'string', required: false, description: 'Activity outcome/result' },
          { name: 'activity_date', type: 'string', required: true, description: 'Activity date YYYY-MM-DD (required)' },
          { name: 'due_date', type: 'string', required: false, description: 'Due date (YYYY-MM-DD)' },
          { name: 'is_completed', type: 'boolean', required: false, description: 'Is activity completed' },
          { name: 'completed_at', type: 'string', required: false, description: 'Completion timestamp (ISO 8601)' },
          { name: 'contact_id', type: 'integer', required: false, description: 'Related contact ID' },
          { name: 'performed_by', type: 'integer', required: false, description: 'Performed by user ID' },
          { name: 'created_by', type: 'integer', required: false, description: 'Created by user ID' },
        ],
        example: `{
  "event": "lead_activity_add",
  "source": "crm",
  "data": {
    "lead_id": 789,
    "activity_type": "meeting",
    "subject": "Product Demo - Enterprise CRM Suite",
    "description": "Full product demonstration with technical team.",
    "outcome": "Positive feedback - requested proposal",
    "activity_date": "2024-01-20",
    "is_completed": true,
    "completed_at": "2024-01-20T16:30:00Z",
    "contact_id": 101,
    "performed_by": 5
  }
}`,
        response: `{
  "status": "success",
  "message": "Activity added successfully",
  "data": { "activity_id": 202, "lead_id": 789 }
}`
      },
      {
        title: 'Update Activity',
        method: 'POST',
        endpoint: '/api/v1/webhooks/incoming/lead/{lead_id}/activity/{activity_id}/update',
        description: 'Updates an existing activity for a lead',
        fields: [
          // Lead & Activity Tracking
          { name: 'lead_id', type: 'integer', required: true, description: 'Lead ID (required for tracking)' },
          { name: 'activity_id', type: 'integer', required: true, description: 'Activity ID to update (required)' },
          { name: 'activity_type', type: 'string', required: false, description: 'Type: call, email, meeting, whatsapp, note, task, follow_up, other' },
          { name: 'subject', type: 'string', required: false, description: 'Activity subject/title' },
          { name: 'description', type: 'string', required: false, description: 'Activity description' },
          { name: 'outcome', type: 'string', required: false, description: 'Activity outcome/result' },
          { name: 'activity_date', type: 'string', required: false, description: 'Activity date YYYY-MM-DD' },
          { name: 'due_date', type: 'string', required: false, description: 'Due date (YYYY-MM-DD)' },
          { name: 'is_completed', type: 'boolean', required: false, description: 'Is activity completed' },
          { name: 'completed_at', type: 'string', required: false, description: 'Completion timestamp (ISO 8601)' },
          { name: 'updated_by', type: 'integer', required: false, description: 'Updated by user ID' },
        ],
        example: `{
  "event": "lead_activity_update",
  "source": "crm",
  "data": {
    "lead_id": 789,
    "activity_id": 202,
    "outcome": "Deal closed - contract signed",
    "is_completed": true,
    "completed_at": "2024-01-25T14:00:00Z"
  }
}`,
        response: `{
  "status": "success",
  "message": "Activity updated successfully",
  "data": { "activity_id": 202, "lead_id": 789 }
}`
      },
      {
        title: 'Delete Activity',
        method: 'POST',
        endpoint: '/api/v1/webhooks/incoming/lead/{lead_id}/activity/{activity_id}/delete',
        description: 'Deletes an activity from a lead',
        fields: [
          // Lead & Activity Tracking
          { name: 'lead_id', type: 'integer', required: true, description: 'Lead ID (required for tracking)' },
          { name: 'activity_id', type: 'integer', required: true, description: 'Activity ID to delete (required)' },
          { name: 'reason', type: 'string', required: false, description: 'Reason for deletion' },
          { name: 'deleted_by', type: 'integer', required: false, description: 'Deleted by user ID' },
        ],
        example: `{
  "event": "lead_activity_delete",
  "source": "crm",
  "data": {
    "lead_id": 789,
    "activity_id": 202,
    "reason": "Duplicate entry",
    "deleted_by": 5
  }
}`,
        response: `{
  "status": "success",
  "message": "Activity deleted successfully",
  "data": { "activity_id": 202, "lead_id": 789 }
}`
      },
      // ==================== QUALIFIED LEAD PROFILE TAB ====================
      {
        title: 'Update Qualified Lead Profile',
        method: 'POST',
        endpoint: '/api/v1/webhooks/incoming/lead/{lead_id}/qualified-profile/update',
        description: 'Updates or creates the qualified lead profile with detailed company and decision-making information',
        fields: [
          // Lead Tracking
          { name: 'lead_id', type: 'integer', required: true, description: 'Lead ID to update profile for (required for tracking)' },
          { name: 'profile_type', type: 'string', required: false, description: 'Type: basic, detailed, enterprise' },
          { name: 'company_name', type: 'string', required: false, description: 'Company name' },
          { name: 'company_type', type: 'string', required: false, description: 'Company type (Private, Public, etc.)' },
          { name: 'industry_id', type: 'integer', required: false, description: 'Industry ID' },
          { name: 'annual_revenue', type: 'string', required: false, description: 'Annual revenue range' },
          { name: 'employee_count', type: 'string', required: false, description: 'Employee count range' },
          { name: 'decision_maker', type: 'string', required: false, description: 'Decision maker name/role' },
          { name: 'decision_process', type: 'string', required: false, description: 'Decision process details' },
          { name: 'budget', type: 'string', required: false, description: 'Budget amount/range' },
          { name: 'timeline', type: 'string', required: false, description: 'Decision timeline' },
          { name: 'current_solution', type: 'string', required: false, description: 'Current solution being used' },
          { name: 'competitors', type: 'string', required: false, description: 'Competitors being considered' },
          { name: 'pain_points', type: 'string', required: false, description: 'Key pain points' },
          { name: 'technical_requirements', type: 'string', required: false, description: 'Technical requirements' },
          { name: 'integration_needs', type: 'string', required: false, description: 'Integration needs' },
          { name: 'compliance_requirements', type: 'string', required: false, description: 'Compliance requirements' },
          { name: 'updated_by', type: 'integer', required: false, description: 'Updated by user ID' },
        ],
        example: `{
  "event": "lead_qualified_profile_update",
  "source": "crm",
  "data": {
    "lead_id": 789,
    "profile_type": "enterprise",
    "company_name": "XYZ Industries Inc.",
    "company_type": "Private",
    "annual_revenue": "$50M - $100M",
    "employee_count": "500-1000",
    "decision_maker": "John Doe - CEO",
    "decision_process": "Committee decision with CEO final approval",
    "budget": "$100,000 - $150,000",
    "timeline": "Q1 2024",
    "current_solution": "Legacy ERP System",
    "competitors": "Salesforce, HubSpot",
    "pain_points": "Poor reporting, lack of integration",
    "technical_requirements": "REST API, SSO, Mobile app",
    "integration_needs": "ERP, Email, Accounting software",
    "compliance_requirements": "SOC 2, GDPR"
  }
}`,
        response: `{
  "status": "success",
  "message": "Qualified profile updated successfully",
  "data": { "profile_id": 303, "lead_id": 789 }
}`
      },
      // ==================== MEMO TAB ====================
      {
        title: 'Add Memo',
        method: 'POST',
        endpoint: '/api/v1/webhooks/incoming/lead/{lead_id}/memo/add',
        description: 'Adds a new memo/note to a lead',
        fields: [
          // Lead Tracking
          { name: 'lead_id', type: 'integer', required: true, description: 'Lead ID to add memo to (required for tracking)' },
          { name: 'title', type: 'string', required: false, description: 'Memo title' },
          { name: 'content', type: 'string', required: true, description: 'Memo content (required)' },
          { name: 'memo_type', type: 'string', required: false, description: 'Type: general, important, follow_up, internal' },
          { name: 'is_pinned', type: 'boolean', required: false, description: 'Pin memo to top' },
          { name: 'visibility', type: 'string', required: false, description: 'Visibility: public, private, team' },
          { name: 'created_by', type: 'integer', required: false, description: 'Created by user ID' },
        ],
        example: `{
  "event": "lead_memo_add",
  "source": "crm",
  "data": {
    "lead_id": 789,
    "title": "Important Client Update",
    "content": "Client mentioned they have budget approval and want to proceed with implementation in Q2. Need to prepare detailed proposal by next week.",
    "memo_type": "important",
    "is_pinned": true,
    "visibility": "team",
    "created_by": 5
  }
}`,
        response: `{
  "status": "success",
  "message": "Memo added successfully",
  "data": { "memo_id": 401, "lead_id": 789 }
}`
      },
      {
        title: 'Update Memo',
        method: 'POST',
        endpoint: '/api/v1/webhooks/incoming/lead/{lead_id}/memo/{memo_id}/update',
        description: 'Updates an existing memo for a lead',
        fields: [
          // Lead & Memo Tracking
          { name: 'lead_id', type: 'integer', required: true, description: 'Lead ID (required for tracking)' },
          { name: 'memo_id', type: 'integer', required: true, description: 'Memo ID to update (required)' },
          { name: 'title', type: 'string', required: false, description: 'Memo title' },
          { name: 'content', type: 'string', required: false, description: 'Memo content' },
          { name: 'memo_type', type: 'string', required: false, description: 'Type: general, important, follow_up, internal' },
          { name: 'is_pinned', type: 'boolean', required: false, description: 'Pin memo to top' },
          { name: 'visibility', type: 'string', required: false, description: 'Visibility: public, private, team' },
          { name: 'updated_by', type: 'integer', required: false, description: 'Updated by user ID' },
        ],
        example: `{
  "event": "lead_memo_update",
  "source": "crm",
  "data": {
    "lead_id": 789,
    "memo_id": 401,
    "content": "Client confirmed budget approval. Proposal sent on Jan 25. Follow up scheduled for Feb 1.",
    "is_pinned": true,
    "updated_by": 5
  }
}`,
        response: `{
  "status": "success",
  "message": "Memo updated successfully",
  "data": { "memo_id": 401, "lead_id": 789 }
}`
      },
      {
        title: 'Delete Memo',
        method: 'POST',
        endpoint: '/api/v1/webhooks/incoming/lead/{lead_id}/memo/{memo_id}/delete',
        description: 'Deletes a memo from a lead',
        fields: [
          // Lead & Memo Tracking
          { name: 'lead_id', type: 'integer', required: true, description: 'Lead ID (required for tracking)' },
          { name: 'memo_id', type: 'integer', required: true, description: 'Memo ID to delete (required)' },
          { name: 'reason', type: 'string', required: false, description: 'Reason for deletion' },
          { name: 'deleted_by', type: 'integer', required: false, description: 'Deleted by user ID' },
        ],
        example: `{
  "event": "lead_memo_delete",
  "source": "crm",
  "data": {
    "lead_id": 789,
    "memo_id": 401,
    "reason": "Outdated information",
    "deleted_by": 5
  }
}`,
        response: `{
  "status": "success",
  "message": "Memo deleted successfully",
  "data": { "memo_id": 401, "lead_id": 789 }
}`
      },
      // ==================== FILE UPLOAD TAB ====================
      {
        title: 'Upload File',
        method: 'POST',
        endpoint: '/api/v1/webhooks/incoming/lead/{lead_id}/file/upload',
        description: 'Uploads a file attachment to a lead (base64 encoded or URL)',
        fields: [
          // Lead Tracking
          { name: 'lead_id', type: 'integer', required: true, description: 'Lead ID to upload file to (required for tracking)' },
          { name: 'file_name', type: 'string', required: true, description: 'File name with extension (required)' },
          { name: 'file_content', type: 'string', required: false, description: 'Base64 encoded file content' },
          { name: 'file_url', type: 'string', required: false, description: 'URL to download file from' },
          { name: 'file_type', type: 'string', required: false, description: 'File type: document, image, spreadsheet, presentation, pdf, other' },
          { name: 'mime_type', type: 'string', required: false, description: 'MIME type (e.g., application/pdf, image/jpeg)' },
          { name: 'file_size', type: 'integer', required: false, description: 'File size in bytes' },
          { name: 'description', type: 'string', required: false, description: 'File description' },
          { name: 'category', type: 'string', required: false, description: 'Category: proposal, contract, invoice, quote, presentation, other' },
          { name: 'is_public', type: 'boolean', required: false, description: 'Is file publicly accessible' },
          { name: 'uploaded_by', type: 'integer', required: false, description: 'Uploaded by user ID' },
        ],
        example: `{
  "event": "lead_file_upload",
  "source": "crm",
  "data": {
    "lead_id": 789,
    "file_name": "proposal_xyz_industries.pdf",
    "file_url": "https://erp.example.com/files/proposal_xyz.pdf",
    "file_type": "pdf",
    "mime_type": "application/pdf",
    "file_size": 2048576,
    "description": "Enterprise CRM Suite Proposal for XYZ Industries",
    "category": "proposal",
    "is_public": false,
    "uploaded_by": 5
  }
}`,
        response: `{
  "status": "success",
  "message": "File uploaded successfully",
  "data": { "file_id": 501, "lead_id": 789, "file_path": "/uploads/leads/789/proposal_xyz_industries.pdf" }
}`
      },
      {
        title: 'Delete File',
        method: 'POST',
        endpoint: '/api/v1/webhooks/incoming/lead/{lead_id}/file/{file_id}/delete',
        description: 'Deletes a file attachment from a lead',
        fields: [
          // Lead & File Tracking
          { name: 'lead_id', type: 'integer', required: true, description: 'Lead ID (required for tracking)' },
          { name: 'file_id', type: 'integer', required: true, description: 'File ID to delete (required)' },
          { name: 'reason', type: 'string', required: false, description: 'Reason for deletion' },
          { name: 'deleted_by', type: 'integer', required: false, description: 'Deleted by user ID' },
        ],
        example: `{
  "event": "lead_file_delete",
  "source": "crm",
  "data": {
    "lead_id": 789,
    "file_id": 501,
    "reason": "Replaced with updated version",
    "deleted_by": 5
  }
}`,
        response: `{
  "status": "success",
  "message": "File deleted successfully",
  "data": { "file_id": 501, "lead_id": 789 }
}`
      },
      // ==================== STATUS TAB ====================
      {
        title: 'Update Lead Status',
        method: 'POST',
        endpoint: '/api/v1/webhooks/incoming/lead/{lead_id}/status/update',
        description: 'Updates the lead status, pipeline stage, and workflow status',
        fields: [
          // Lead Tracking
          { name: 'lead_id', type: 'integer', required: true, description: 'Lead ID to update status for (required for tracking)' },
          { name: 'status', type: 'integer', required: false, description: 'Status: 0 = active, 1 = discarded' },
          { name: 'lead_status', type: 'string', required: false, description: 'Workflow status: new, contacted, qualified, proposal_sent, negotiation, won, lost' },
          { name: 'pipeline_stage', type: 'integer', required: false, description: 'Pipeline stage (1-6): 1=New, 2=Contacted, 3=Qualified, 4=Proposal, 5=Negotiation, 6=Closed' },
          { name: 'priority', type: 'string', required: false, description: 'Priority: low, medium, high, critical' },
          { name: 'expected_value', type: 'number', required: false, description: 'Expected deal value' },
          { name: 'actual_value', type: 'number', required: false, description: 'Actual deal value (for won deals)' },
          { name: 'currency', type: 'string', required: false, description: 'Currency code' },
          { name: 'expected_close_date', type: 'string', required: false, description: 'Expected close date (YYYY-MM-DD)' },
          { name: 'last_contacted', type: 'string', required: false, description: 'Last contacted date (ISO 8601)' },
          { name: 'next_follow_up', type: 'string', required: false, description: 'Next follow-up date (ISO 8601)' },
          { name: 'loss_reason', type: 'string', required: false, description: 'Reason for loss (if status is lost)' },
          { name: 'lead_score', type: 'integer', required: false, description: 'Lead score (0-100)' },
          { name: 'updated_by', type: 'integer', required: false, description: 'Updated by user ID' },
        ],
        example: `{
  "event": "lead_status_update",
  "source": "erp",
  "data": {
    "lead_id": 789,
    "lead_status": "proposal_sent",
    "pipeline_stage": 4,
    "priority": "critical",
    "expected_value": 150000.00,
    "currency": "USD",
    "expected_close_date": "2024-03-15",
    "next_follow_up": "2024-01-25T10:00:00Z",
    "lead_score": 85,
    "updated_by": 5
  }
}`,
        response: `{
  "status": "success",
  "message": "Lead status updated successfully",
  "data": { "lead_id": 789, "lead_status": "proposal_sent", "pipeline_stage": 4 }
}`
      },
      {
        title: 'Discard Lead',
        method: 'POST',
        endpoint: '/api/v1/webhooks/incoming/lead/{lead_id}/discard',
        description: 'Discards/archives a lead with optional reason',
        fields: [
          // Lead Tracking
          { name: 'lead_id', type: 'integer', required: true, description: 'Lead ID to discard (required for tracking)' },
          { name: 'reason', type: 'string', required: false, description: 'Reason for discarding the lead' },
          { name: 'loss_reason', type: 'string', required: false, description: 'Specific loss reason: competitor, budget, timing, no_response, not_qualified, other' },
          { name: 'competitor_name', type: 'string', required: false, description: 'Name of competitor (if lost to competitor)' },
          { name: 'feedback', type: 'string', required: false, description: 'Additional feedback' },
          { name: 'discarded_by', type: 'integer', required: false, description: 'Discarded by user ID' },
        ],
        example: `{
  "event": "lead_discard",
  "source": "crm",
  "data": {
    "lead_id": 789,
    "reason": "Lost to competitor - chose alternative vendor",
    "loss_reason": "competitor",
    "competitor_name": "Salesforce",
    "feedback": "Price was competitive but they preferred existing vendor relationship",
    "discarded_by": 5
  }
}`,
        response: `{
  "status": "success",
  "message": "Lead discarded successfully",
  "data": { "lead_id": 789 }
}`
      },
      {
        title: 'Restore Lead',
        method: 'POST',
        endpoint: '/api/v1/webhooks/incoming/lead/{lead_id}/restore',
        description: 'Restores a previously discarded lead',
        fields: [
          // Lead Tracking
          { name: 'lead_id', type: 'integer', required: true, description: 'Lead ID to restore (required for tracking)' },
          { name: 'reason', type: 'string', required: false, description: 'Reason for restoring the lead' },
          { name: 'new_status', type: 'string', required: false, description: 'New lead status after restore: new, contacted, qualified' },
          { name: 'assigned_to', type: 'integer', required: false, description: 'Reassign to user ID' },
          { name: 'restored_by', type: 'integer', required: false, description: 'Restored by user ID' },
        ],
        example: `{
  "event": "lead_restore",
  "source": "crm",
  "data": {
    "lead_id": 789,
    "reason": "Client reached out again with renewed interest",
    "new_status": "contacted",
    "assigned_to": 5,
    "restored_by": 3
  }
}`,
        response: `{
  "status": "success",
  "message": "Lead restored successfully",
  "data": { "lead_id": 789, "status": 0, "lead_status": "contacted" }
}`
      },
      {
        title: 'Convert Lead to Customer',
        method: 'POST',
        endpoint: '/api/v1/webhooks/incoming/lead/{lead_id}/convert',
        description: 'Converts a lead to a customer',
        fields: [
          // Lead Tracking
          { name: 'lead_id', type: 'integer', required: true, description: 'Lead ID to convert (required for tracking)' },
          { name: 'customer_type', type: 'string', required: false, description: 'Customer type: individual, business, enterprise' },
          { name: 'account_manager', type: 'integer', required: false, description: 'Account manager user ID' },
          { name: 'contract_value', type: 'number', required: false, description: 'Contract/deal value' },
          { name: 'contract_start_date', type: 'string', required: false, description: 'Contract start date (YYYY-MM-DD)' },
          { name: 'contract_end_date', type: 'string', required: false, description: 'Contract end date (YYYY-MM-DD)' },
          { name: 'payment_terms', type: 'string', required: false, description: 'Payment terms' },
          { name: 'notes', type: 'string', required: false, description: 'Conversion notes' },
          { name: 'converted_by', type: 'integer', required: false, description: 'Converted by user ID' },
        ],
        example: `{
  "event": "lead_convert",
  "source": "crm",
  "data": {
    "lead_id": 789,
    "customer_type": "enterprise",
    "account_manager": 5,
    "contract_value": 145000.00,
    "contract_start_date": "2024-02-01",
    "contract_end_date": "2025-01-31",
    "payment_terms": "Net 30",
    "notes": "1-year enterprise license with premium support",
    "converted_by": 5
  }
}`,
        response: `{
  "status": "success",
  "message": "Lead converted to customer successfully",
  "data": { "lead_id": 789, "customer_id": 456, "is_converted": true }
}`
      }
    ]
  }
};

// Menu-specific webhook documentation
const MENU_WEBHOOK_DOCS: Record<string, {
  title: string;
  description: string;
  events: { name: string; description: string; payload: any }[];
}> = {
  'dashboard': {
    title: 'Dashboard Webhooks',
    description: 'Receive notifications when dashboard data is accessed or refreshed.',
    events: [
      {
        name: 'dashboard.viewed',
        description: 'Triggered when dashboard is viewed',
        payload: { user_id: 1, viewed_at: '2024-01-15T10:30:00Z' }
      },
      {
        name: 'dashboard.refreshed',
        description: 'Triggered when dashboard data is refreshed',
        payload: { user_id: 1, refreshed_at: '2024-01-15T10:30:00Z' }
      }
    ]
  },
  'pre-leads-new': {
    title: 'New Pre-Lead Webhooks',
    description: 'Receive notifications when new pre-leads are created.',
    events: [
      {
        name: 'pre_lead.created',
        description: 'Triggered when a new pre-lead is created',
        payload: {
          id: 123,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          company_name: 'ABC Corp',
          source: 'website',
          created_at: '2024-01-15T10:30:00Z'
        }
      }
    ]
  },
  'pre-leads-manage': {
    title: 'Pre-Lead Management Webhooks',
    description: 'Receive notifications when pre-leads are updated or deleted.',
    events: [
      {
        name: 'pre_lead.updated',
        description: 'Triggered when a pre-lead is updated',
        payload: { id: 123, changes: { status: 'contacted' }, updated_at: '2024-01-15T10:30:00Z' }
      },
      {
        name: 'pre_lead.deleted',
        description: 'Triggered when a pre-lead is deleted',
        payload: { id: 123, deleted_at: '2024-01-15T10:30:00Z' }
      }
    ]
  },
  'pre-leads-validate': {
    title: 'Pre-Lead Validation Webhooks',
    description: 'Receive notifications when pre-leads are validated or converted.',
    events: [
      {
        name: 'pre_lead.validated',
        description: 'Triggered when a pre-lead passes validation',
        payload: { id: 123, validated_by: 1, validated_at: '2024-01-15T10:30:00Z' }
      },
      {
        name: 'pre_lead.converted',
        description: 'Triggered when a pre-lead is converted to a lead',
        payload: { pre_lead_id: 123, lead_id: 456, converted_at: '2024-01-15T10:30:00Z' }
      }
    ]
  },
  'leads-new': {
    title: 'New Lead Webhooks',
    description: 'Receive notifications when new leads are created.',
    events: [
      {
        name: 'lead.created',
        description: 'Triggered when a new lead is created',
        payload: {
          id: 456,
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane@example.com',
          phone: '+1234567891',
          company_name: 'XYZ Industries',
          lead_status: 'new',
          priority: 'high',
          expected_value: 50000,
          created_at: '2024-01-15T10:30:00Z'
        }
      }
    ]
  },
  'leads-manage': {
    title: 'Lead Management Webhooks',
    description: 'Receive notifications when leads are updated, status changed, or deleted.',
    events: [
      {
        name: 'lead.updated',
        description: 'Triggered when a lead is updated',
        payload: { id: 456, changes: { priority: 'critical' }, updated_at: '2024-01-15T10:30:00Z' }
      },
      {
        name: 'lead.status_changed',
        description: 'Triggered when lead status changes',
        payload: { id: 456, old_status: 'new', new_status: 'contacted', changed_at: '2024-01-15T10:30:00Z' }
      },
      {
        name: 'lead.deleted',
        description: 'Triggered when a lead is deleted',
        payload: { id: 456, deleted_at: '2024-01-15T10:30:00Z' }
      }
    ]
  },
  'leads-track': {
    title: 'Lead Tracking Webhooks',
    description: 'Receive notifications for lead tracking and pipeline changes.',
    events: [
      {
        name: 'lead.viewed',
        description: 'Triggered when a lead is viewed',
        payload: { id: 456, viewed_by: 1, viewed_at: '2024-01-15T10:30:00Z' }
      },
      {
        name: 'lead.pipeline_changed',
        description: 'Triggered when lead moves in pipeline',
        payload: { id: 456, old_stage: 1, new_stage: 2, changed_at: '2024-01-15T10:30:00Z' }
      }
    ]
  },
  'customers-track': {
    title: 'Customer Webhooks',
    description: 'Receive notifications for customer activities.',
    events: [
      {
        name: 'customer.created',
        description: 'Triggered when a new customer is created',
        payload: { id: 789, company_name: 'ABC Corp', converted_from_lead: 456, created_at: '2024-01-15T10:30:00Z' }
      },
      {
        name: 'customer.updated',
        description: 'Triggered when customer is updated',
        payload: { id: 789, changes: { status: 'active' }, updated_at: '2024-01-15T10:30:00Z' }
      }
    ]
  },
  'activities-lead': {
    title: 'Lead Activity Webhooks',
    description: 'Receive notifications for lead activities.',
    events: [
      {
        name: 'activity.created',
        description: 'Triggered when an activity is logged',
        payload: { id: 100, lead_id: 456, type: 'call', subject: 'Follow-up call', created_at: '2024-01-15T10:30:00Z' }
      },
      {
        name: 'activity.completed',
        description: 'Triggered when an activity is marked complete',
        payload: { id: 100, lead_id: 456, completed_at: '2024-01-15T10:30:00Z' }
      }
    ]
  },
  'contacts-lead': {
    title: 'Lead Contact Webhooks',
    description: 'Receive notifications for lead contact changes.',
    events: [
      {
        name: 'contact.created',
        description: 'Triggered when a contact is added',
        payload: { id: 50, lead_id: 456, name: 'John Doe', email: 'john@example.com', created_at: '2024-01-15T10:30:00Z' }
      },
      {
        name: 'contact.updated',
        description: 'Triggered when a contact is updated',
        payload: { id: 50, lead_id: 456, changes: { phone: '+1234567890' }, updated_at: '2024-01-15T10:30:00Z' }
      }
    ]
  },
  'leads-bulk-email': {
    title: 'Bulk Email Webhooks',
    description: 'Receive notifications for bulk email campaigns.',
    events: [
      {
        name: 'bulk_email.sent',
        description: 'Triggered when bulk email campaign is sent',
        payload: { campaign_id: 10, total_recipients: 100, sent_count: 98, failed_count: 2, sent_at: '2024-01-15T10:30:00Z' }
      },
      {
        name: 'bulk_email.opened',
        description: 'Triggered when email is opened',
        payload: { campaign_id: 10, lead_id: 456, opened_at: '2024-01-15T10:35:00Z' }
      }
    ]
  },
  'leads-whatsapp': {
    title: 'WhatsApp Marketing Webhooks',
    description: 'Receive notifications for WhatsApp marketing activities.',
    events: [
      {
        name: 'whatsapp.sent',
        description: 'Triggered when WhatsApp message is sent',
        payload: { message_id: 200, phone: '+1234567890', template: 'welcome', sent_at: '2024-01-15T10:30:00Z' }
      },
      {
        name: 'whatsapp.delivered',
        description: 'Triggered when message is delivered',
        payload: { message_id: 200, delivered_at: '2024-01-15T10:30:05Z' }
      },
      {
        name: 'whatsapp.read',
        description: 'Triggered when message is read',
        payload: { message_id: 200, read_at: '2024-01-15T10:31:00Z' }
      }
    ]
  }
};

// Default events for menus without specific documentation
const DEFAULT_EVENTS = [
  { name: 'data.created', description: 'Triggered when new data is created', payload: { id: 1, created_at: '2024-01-15T10:30:00Z' } },
  { name: 'data.updated', description: 'Triggered when data is updated', payload: { id: 1, updated_at: '2024-01-15T10:30:00Z' } },
  { name: 'data.deleted', description: 'Triggered when data is deleted', payload: { id: 1, deleted_at: '2024-01-15T10:30:00Z' } },
  { name: 'page.viewed', description: 'Triggered when page is viewed', payload: { user_id: 1, viewed_at: '2024-01-15T10:30:00Z' } }
];

export default function WebhookConfigurePage() {
  const params = useParams();
  const menuKey = params.menuKey as string;

  const [activeTab, setActiveTab] = useState<'docs' | 'examples' | 'api'>('docs');
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');

  // Get documentation for this menu
  const docs = MENU_WEBHOOK_DOCS[menuKey] || {
    title: `${formatMenuKey(menuKey)} Webhooks`,
    description: 'Receive webhook notifications for this menu.',
    events: DEFAULT_EVENTS
  };

  // Get API integration docs if available
  const apiDocs = MENU_API_DOCS[menuKey];

  // Generate API cURL command for a specific API
  const generateApiCurlCommand = (apiDoc: ApiDoc) => {
    const jsonData = apiDoc.example.replace(/\n/g, '').replace(/\s+/g, ' ').trim();
    return `curl -X ${apiDoc.method} "${API_BASE_URL}${apiDoc.endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "X-Webhook-Signature: your-signature-here" \\
  -d '${jsonData}'`;
  };

  // Generate Laravel code for a specific API
  const generateApiLaravelCode = (apiDoc: ApiDoc) => {
    const methodName = apiDoc.title.replace(/[^a-zA-Z0-9]/g, '');
    return `<?php
// Laravel Service for ${apiDoc.title}
use Illuminate\\Support\\Facades\\Http;

class CrmWebhookService
{
    protected string $baseUrl = '${API_BASE_URL}';
    protected string $secretKey = 'your-webhook-secret-key';

    public function ${methodName.charAt(0).toLowerCase() + methodName.slice(1)}(${apiDoc.endpoint.includes('{') ? 'int $id, ' : ''}array $data)
    {
        $payload = [
            'event' => '${apiDoc.example.match(/"event":\s*"([^"]+)"/)?.[1] || 'webhook_event'}',
            'source' => 'erp',
            'timestamp' => now()->toIso8601String(),
            'data' => $data,
        ];

        $signature = hash_hmac('sha256', json_encode($payload), $this->secretKey);
        $endpoint = '${apiDoc.endpoint}'${apiDoc.endpoint.includes('{') ? ".replace('{pre_lead_id}', $id)" : ''};

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'X-Webhook-Signature' => $signature,
        ])->post($this->baseUrl . $endpoint, $payload);

        return [
            'success' => $response->successful(),
            'status' => $response->status(),
            'data' => $response->json(),
        ];
    }
}

// Usage Example:
$crmService = new CrmWebhookService();
$result = $crmService->${methodName.charAt(0).toLowerCase() + methodName.slice(1)}(${apiDoc.endpoint.includes('{') ? '123, ' : ''}[
    // Add your data here
]);`;
  };

  // Generate Node.js code for a specific API
  const generateApiNodeCode = (apiDoc: ApiDoc) => {
    const functionName = apiDoc.title.replace(/[^a-zA-Z0-9]/g, '');
    return `// Node.js service for ${apiDoc.title}
const crypto = require('crypto');

const CRM_API_URL = '${API_BASE_URL}';
const WEBHOOK_SECRET = 'your-webhook-secret-key';

async function ${functionName.charAt(0).toLowerCase() + functionName.slice(1)}(${apiDoc.endpoint.includes('{') ? 'id, ' : ''}data) {
  const payload = {
    event: '${apiDoc.example.match(/"event":\s*"([^"]+)"/)?.[1] || 'webhook_event'}',
    source: 'erp',
    timestamp: new Date().toISOString(),
    data: data
  };

  const signature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');

  const endpoint = '${apiDoc.endpoint}'${apiDoc.endpoint.includes('{') ? ".replace('{pre_lead_id}', id)" : ''};

  const response = await fetch(CRM_API_URL + endpoint, {
    method: '${apiDoc.method}',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature
    },
    body: JSON.stringify(payload)
  });

  return await response.json();
}

// Usage Example:
const result = await ${functionName.charAt(0).toLowerCase() + functionName.slice(1)}(${apiDoc.endpoint.includes('{') ? '123, ' : ''}{
  // Add your data here
});
console.log('Result:', result);`;
  };

  useEffect(() => {
    loadConfig();
  }, [menuKey]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await api.getWebhookConfig(menuKey);
      setWebhookUrl(data.webhook_url || '');
      setSecretKey(data.secret_key || '');
    } catch (error) {
      console.error('Failed to load webhook config:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  function formatMenuKey(key: string) {
    return key
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' > ');
  }

  // Generate cURL example for outgoing webhooks
  const generateCurlExample = (event: any) => {
    const payload = {
      event: event.name,
      menu_key: menuKey,
      timestamp: new Date().toISOString(),
      data: event.payload
    };
    return `curl -X POST "${webhookUrl || 'https://your-server.com/webhook'}" \\
  -H "Content-Type: application/json" \\
  -H "X-Webhook-Secret: ${secretKey || 'your-secret-key'}" \\
  -H "X-Webhook-Event: ${event.name}" \\
  -d '${JSON.stringify(payload, null, 2)}'`;
  };

  // Generate Laravel example
  const generateLaravelExample = (event: any) => {
    const methodName = event.name.replace(/\./g, '_').replace(/-/g, '_');
    return `<?php
// Laravel Webhook Handler
namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Log;

class WebhookController extends Controller
{
    /**
     * Handle ${event.name} webhook from CRM
     */
    public function handle${methodName.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join('')}(Request $request)
    {
        // Verify webhook signature
        $signature = $request->header('X-Webhook-Secret');
        $expectedSignature = config('services.crm.webhook_secret');

        if ($signature !== $expectedSignature) {
            Log::warning('Invalid webhook signature');
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        // Get webhook payload
        $payload = $request->all();
        $event = $payload['event'] ?? null;
        $data = $payload['data'] ?? [];

        Log::info('Received webhook: ' . $event, $data);

        // Process the webhook based on event type
        switch ($event) {
            case '${event.name}':
                $this->process${methodName.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join('')}($data);
                break;
            default:
                Log::warning('Unknown webhook event: ' . $event);
        }

        return response()->json(['status' => 'success']);
    }

    protected function process${methodName.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join('')}(array $data)
    {
        // Your business logic here
        // Example: Update local database, send notifications, etc.

        /*
         * Expected data structure:
         * ${JSON.stringify(event.payload, null, 8).split('\n').join('\n         * ')}
         */
    }
}

// routes/api.php
Route::post('/webhooks/crm/${event.name.replace(/\./g, '/')}', [WebhookController::class, 'handle${methodName.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join('')}']);`;
  };

  // Generate Node.js example
  const generateNodeExample = (event: any) => {
    const methodName = event.name.replace(/\./g, '_').replace(/-/g, '_');
    return `// Node.js/Express Webhook Handler
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Webhook secret from CRM settings
const WEBHOOK_SECRET = process.env.CRM_WEBHOOK_SECRET || '${secretKey || 'your-secret-key'}';

// Verify webhook signature middleware
function verifyWebhookSignature(req, res, next) {
  const signature = req.headers['x-webhook-secret'];

  if (signature !== WEBHOOK_SECRET) {
    console.warn('Invalid webhook signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  next();
}

// Handle ${event.name} webhook
app.post('/webhooks/crm/${event.name.replace(/\./g, '/')}', verifyWebhookSignature, async (req, res) => {
  try {
    const { event, menu_key, timestamp, data } = req.body;

    console.log('Received webhook:', event, data);

    // Process the webhook
    await process${methodName.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join('')}(data);

    res.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});

async function process${methodName.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join('')}(data) {
  // Your business logic here
  // Example: Update database, send notifications, etc.

  /*
   * Expected data structure:
   * ${JSON.stringify(event.payload, null, 4).split('\n').join('\n   * ')}
   */

  console.log('Processing ${event.name}:', data);
}

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});`;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading configuration...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/settings/webhook"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Webhook Configuration</h1>
            <p className="text-gray-500">{formatMenuKey(menuKey)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="border-b">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('docs')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'docs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Book className="w-4 h-4 inline mr-2" />
                Documentation
              </button>
              <button
                onClick={() => setActiveTab('examples')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'examples'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Code className="w-4 h-4 inline mr-2" />
                Code Examples
              </button>
              {apiDocs && (
                <button
                  onClick={() => setActiveTab('api')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === 'api'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Terminal className="w-4 h-4 inline mr-2" />
                  API Integration
                </button>
              )}
            </nav>
          </div>

          <div className="p-6">
            {/* Documentation Tab */}
            {activeTab === 'docs' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h2 className="text-lg font-semibold text-blue-800">{docs.title}</h2>
                  <p className="text-blue-700 mt-1">{docs.description}</p>
                </div>

                {/* Webhook Endpoint */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Your Webhook Endpoint</h3>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-white border rounded text-sm font-mono">
                      {webhookUrl || 'https://your-server.com/webhook'}
                    </code>
                    <button
                      onClick={() => copyToClipboard(webhookUrl || 'https://your-server.com/webhook', 'endpoint')}
                      className="p-2 hover:bg-gray-200 rounded"
                    >
                      {copiedCode === 'endpoint' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Events Documentation */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Available Events</h3>
                  <div className="space-y-3">
                    {docs.events.map((event) => (
                      <div key={event.name} className="border rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedEvent(expandedEvent === event.name ? null : event.name)}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-mono rounded">
                              {event.name}
                            </span>
                            <span className="text-sm text-gray-600">{event.description}</span>
                          </div>
                          {expandedEvent === event.name ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        {expandedEvent === event.name && (
                          <div className="p-4 border-t bg-white">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Payload Example:</h4>
                            <div className="relative">
                              <pre className="p-3 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto">
                                {JSON.stringify({
                                  event: event.name,
                                  menu_key: menuKey,
                                  timestamp: new Date().toISOString(),
                                  data: event.payload
                                }, null, 2)}
                              </pre>
                              <button
                                onClick={() => copyToClipboard(JSON.stringify({
                                  event: event.name,
                                  menu_key: menuKey,
                                  timestamp: new Date().toISOString(),
                                  data: event.payload
                                }, null, 2), event.name)}
                                className="absolute top-2 right-2 p-1 bg-gray-700 hover:bg-gray-600 rounded"
                              >
                                {copiedCode === event.name ? (
                                  <Check className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4 text-gray-300" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Headers Documentation */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-800 mb-2">Request Headers</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-yellow-700">
                        <th className="pb-2">Header</th>
                        <th className="pb-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-yellow-800">
                      <tr>
                        <td className="py-1 font-mono">Content-Type</td>
                        <td>application/json</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-mono">X-Webhook-Secret</td>
                        <td>Your secret key for verification</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-mono">X-Webhook-Event</td>
                        <td>The event type that triggered this webhook</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-mono">X-Webhook-Timestamp</td>
                        <td>ISO 8601 timestamp of when the webhook was sent</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Code Examples Tab */}
            {activeTab === 'examples' && (
              <div className="space-y-6">
                <p className="text-gray-600">
                  Use these code examples to handle webhooks in your application. Select an event to see specific examples.
                </p>

                {docs.events.map((event) => (
                  <div key={event.name} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b">
                      <h3 className="font-medium text-gray-900">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-mono rounded mr-2">
                          {event.name}
                        </span>
                        {event.description}
                      </h3>
                    </div>

                    <div className="p-4 space-y-4">
                      {/* cURL Example */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Terminal className="w-4 h-4" />
                            cURL
                          </div>
                          <button
                            onClick={() => copyToClipboard(generateCurlExample(event), `curl-${event.name}`)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                          >
                            {copiedCode === `curl-${event.name}` ? (
                              <><Check className="w-3 h-3 text-green-500" /> Copied</>
                            ) : (
                              <><Copy className="w-3 h-3" /> Copy</>
                            )}
                          </button>
                        </div>
                        <pre className="p-3 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto">
                          {generateCurlExample(event)}
                        </pre>
                      </div>

                      {/* Laravel Example */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <FileJson className="w-4 h-4" />
                            Laravel / PHP
                          </div>
                          <button
                            onClick={() => copyToClipboard(generateLaravelExample(event), `laravel-${event.name}`)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                          >
                            {copiedCode === `laravel-${event.name}` ? (
                              <><Check className="w-3 h-3 text-green-500" /> Copied</>
                            ) : (
                              <><Copy className="w-3 h-3" /> Copy</>
                            )}
                          </button>
                        </div>
                        <pre className="p-3 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto max-h-96">
                          {generateLaravelExample(event)}
                        </pre>
                      </div>

                      {/* Node.js Example */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Code className="w-4 h-4" />
                            Node.js / Express
                          </div>
                          <button
                            onClick={() => copyToClipboard(generateNodeExample(event), `node-${event.name}`)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                          >
                            {copiedCode === `node-${event.name}` ? (
                              <><Check className="w-3 h-3 text-green-500" /> Copied</>
                            ) : (
                              <><Copy className="w-3 h-3" /> Copy</>
                            )}
                          </button>
                        </div>
                        <pre className="p-3 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto max-h-96">
                          {generateNodeExample(event)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* API Integration Tab */}
            {activeTab === 'api' && apiDocs && (
              <div className="space-y-6">
                {/* API Overview */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h2 className="text-lg font-semibold text-green-800">{apiDocs.title}</h2>
                  <p className="text-green-700 mt-1">{apiDocs.description}</p>
                  <p className="text-green-600 text-sm mt-2">
                    {apiDocs.apis.length} API endpoint{apiDocs.apis.length > 1 ? 's' : ''} available
                  </p>
                </div>

                {/* Loop through each API */}
                {apiDocs.apis.map((api, apiIndex) => (
                  <div key={apiIndex} className="border rounded-lg overflow-hidden">
                    {/* API Header */}
                    <div className="bg-gray-50 px-4 py-3 border-b">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-white text-xs font-bold rounded ${
                          api.method === 'POST' ? 'bg-green-600' :
                          api.method === 'PUT' ? 'bg-blue-600' :
                          api.method === 'DELETE' ? 'bg-red-600' : 'bg-gray-600'
                        }`}>
                          {api.method}
                        </span>
                        <code className="text-sm font-mono text-gray-800">{api.endpoint}</code>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mt-2">{api.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{api.description}</p>
                    </div>

                    <div className="p-4 space-y-4">
                      {/* Full Endpoint URL */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h4 className="font-medium text-gray-900 mb-2 text-sm">Full Endpoint URL</h4>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 px-3 py-2 bg-white border rounded text-xs font-mono break-all">
                            {API_BASE_URL}{api.endpoint}
                          </code>
                          <button
                            onClick={() => copyToClipboard(`${API_BASE_URL}${api.endpoint}`, `api-endpoint-${apiIndex}`)}
                            className="p-2 hover:bg-gray-200 rounded flex-shrink-0"
                          >
                            {copiedCode === `api-endpoint-${apiIndex}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Request Fields */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 text-sm">Request Fields</h4>
                        <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 text-xs">Field</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 text-xs">Type</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 text-xs">Required</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 text-xs">Description</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {api.fields.map((field, idx) => (
                                <tr key={field.name} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="px-3 py-1.5 font-mono text-xs text-blue-600">{field.name}</td>
                                  <td className="px-3 py-1.5 text-gray-600 text-xs">{field.type}</td>
                                  <td className="px-3 py-1.5">
                                    {field.required ? (
                                      <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded">Required</span>
                                    ) : (
                                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">Optional</span>
                                    )}
                                  </td>
                                  <td className="px-3 py-1.5 text-gray-600 text-xs">{field.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Example Request */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">Example Request Body</h4>
                          <button
                            onClick={() => copyToClipboard(api.example, `api-example-${apiIndex}`)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                          >
                            {copiedCode === `api-example-${apiIndex}` ? (
                              <><Check className="w-3 h-3 text-green-500" /> Copied</>
                            ) : (
                              <><Copy className="w-3 h-3" /> Copy</>
                            )}
                          </button>
                        </div>
                        <pre className="p-3 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto max-h-48">
                          {api.example}
                        </pre>
                      </div>

                      {/* Example Response */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 text-sm">Example Response</h4>
                        <pre className="p-3 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto">
                          {api.response}
                        </pre>
                      </div>

                      {/* cURL Example */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Terminal className="w-4 h-4" />
                            cURL Example
                          </div>
                          <button
                            onClick={() => copyToClipboard(generateApiCurlCommand(api), `api-curl-${apiIndex}`)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                          >
                            {copiedCode === `api-curl-${apiIndex}` ? (
                              <><Check className="w-3 h-3 text-green-500" /> Copied</>
                            ) : (
                              <><Copy className="w-3 h-3" /> Copy</>
                            )}
                          </button>
                        </div>
                        <pre className="p-3 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto whitespace-pre-wrap break-all">
                          {generateApiCurlCommand(api)}
                        </pre>
                      </div>

                      {/* Laravel Example */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <FileJson className="w-4 h-4" />
                            Laravel / PHP Example
                          </div>
                          <button
                            onClick={() => copyToClipboard(generateApiLaravelCode(api), `api-laravel-${apiIndex}`)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                          >
                            {copiedCode === `api-laravel-${apiIndex}` ? (
                              <><Check className="w-3 h-3 text-green-500" /> Copied</>
                            ) : (
                              <><Copy className="w-3 h-3" /> Copy</>
                            )}
                          </button>
                        </div>
                        <pre className="p-3 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto max-h-64">
                          {generateApiLaravelCode(api)}
                        </pre>
                      </div>

                      {/* Node.js Example */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Code className="w-4 h-4" />
                            Node.js Example
                          </div>
                          <button
                            onClick={() => copyToClipboard(generateApiNodeCode(api), `api-nodejs-${apiIndex}`)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                          >
                            {copiedCode === `api-nodejs-${apiIndex}` ? (
                              <><Check className="w-3 h-3 text-green-500" /> Copied</>
                            ) : (
                              <><Copy className="w-3 h-3" /> Copy</>
                            )}
                          </button>
                        </div>
                        <pre className="p-3 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto max-h-64">
                          {generateApiNodeCode(api)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
