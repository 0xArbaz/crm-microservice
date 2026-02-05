'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle, XCircle, Eye, Globe, ArrowDownLeft, ArrowUpRight, Copy, Check, Code, ChevronDown, ChevronRight, Terminal } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import api from '@/lib/api';
import { WebhookLog } from '@/types';
import { formatDateTime } from '@/lib/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper to generate cURL examples
const generateCurlExample = (endpoint: string, payload: string, hasPathParam: boolean = false, method: string = 'POST') => {
  const fullUrl = `${API_BASE_URL}${endpoint}`;

  if (method === 'GET') {
    return `curl -X GET "${fullUrl}?page=1&page_size=20" \\
  -H "Authorization: Bearer your-jwt-token-here" \\
  -H "Content-Type: application/json"`;
  }

  return `curl -X POST "${fullUrl}" \\
  -H "Content-Type: application/json" \\
  -H "X-Webhook-Signature: your-signature-here" \\
  -d '${payload.replace(/\n/g, '').replace(/\s+/g, ' ')}'`;
};

// Helper to generate Laravel examples
const generateLaravelExample = (endpoint: string, payload: string, methodName: string, hasPathParam: boolean = false, paramName: string = '', method: string = 'POST') => {
  if (method === 'GET') {
    return `<?php
// Laravel Service Method
use Illuminate\\Support\\Facades\\Http;

class CrmApiService
{
    protected string $baseUrl = '${API_BASE_URL}';
    protected string $token = 'your-jwt-token';

    public function ${methodName}(int $${paramName}, array $filters = [])
    {
        $queryParams = array_merge([
            'page' => 1,
            'page_size' => 20,
        ], $filters);

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Content-Type' => 'application/json',
        ])->get($this->baseUrl . '${endpoint}', $queryParams);

        return [
            'success' => $response->successful(),
            'status' => $response->status(),
            'data' => $response->json(),
        ];
    }
}

// Usage in Controller:
$crmService = new CrmApiService();
$result = $crmService->${methodName}($${paramName}, [
    'page' => 1,
    'page_size' => 20,
    'status' => 0,
    'search' => 'john'
]);`;
  }

  const payloadObj = JSON.parse(payload);
  const dataFields = payloadObj.data || {};

  let params = '';
  if (hasPathParam && paramName) {
    params = `int $${paramName}`;
  }

  const fieldAssignments = Object.entries(dataFields)
    .map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return `            '${key}' => ${JSON.stringify(value, null, 12).replace(/\n/g, '\n            ')},`;
      }
      return `            '${key}' => ${typeof value === 'string' ? `'${value}'` : value},`;
    })
    .join('\n');

  return `<?php
// Laravel Service Method
use Illuminate\\Support\\Facades\\Http;

class CrmWebhookService
{
    protected string $baseUrl = '${API_BASE_URL}';
    protected string $secretKey = 'your-secret-key';

    public function ${methodName}(${params})
    {
        $payload = [
            'event' => '${payloadObj.event}',
            'source' => '${payloadObj.source || 'laravel'}',
            'timestamp' => now()->toIso8601String(),
            'data' => [
${fieldAssignments}
            ],
        ];

        $signature = hash_hmac('sha256', json_encode($payload), $this->secretKey);

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'X-Webhook-Signature' => $signature,
        ])->post($this->baseUrl . '${endpoint}', $payload);

        return [
            'success' => $response->successful(),
            'status' => $response->status(),
            'data' => $response->json(),
        ];
    }
}

// Usage in Controller:
$crmService = new CrmWebhookService();
$result = $crmService->${methodName}(${hasPathParam ? `$${paramName}` : ''});`;
};

// API Documentation Data
const preLeadAPIs = [
  {
    id: 'pre-lead-create',
    title: 'Create Pre-Lead',
    method: 'POST',
    endpoint: '/api/v1/webhooks/incoming/pre-lead/create',
    event: 'new_inquiry',
    description: 'Creates a new pre-lead from an external inquiry with all company details',
    laravelMethod: 'createPreLead',
    hasPathParam: false,
    paramName: '',
    fields: [
      // Basic Information
      { name: 'first_name', type: 'string', required: true, description: 'First name or company name' },
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
      { name: 'discard_reason', type: 'string', required: false, description: 'Reason for discarding the pre-lead' },
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
      // System Fields
      { name: 'company_id', type: 'integer', required: false, description: 'Company ID' },
      { name: 'createdby', type: 'integer', required: false, description: 'Created by user ID' },
      { name: 'updatedby', type: 'integer', required: false, description: 'Updated by user ID' },
    ],
    example: `{
  "event": "new_inquiry",
  "source": "website",
  "data": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "alternate_phone": "+1234567800",
    "company_name": "ABC Corporation Ltd.",
    "designation": "Chief Executive Officer",
    "website": "https://www.abccorp.com",
    "source": "website",
    "source_details": "Contact form submission",
    "status": 0,
    "discard_reason": null,
    "product_interest": "Enterprise CRM Suite",
    "requirements": "Need full CRM implementation with ERP integration",
    "budget_range": "$50,000 - $100,000",
    "city": "New York",
    "state": "New York",
    "country": "USA",
    "address_line1": "123 Business Avenue",
    "address_line2": "Floor 15, Suite 1501",
    "zip_code": "10001",
    "city_id": 1,
    "state_id": 33,
    "country_id": 1,
    "phone_no": "+1-212-555-0100",
    "fax": "+1-212-555-0101",
    "nof_representative": "Michael Johnson",
    "memo": "Key decision maker, prefers email communication",
    "group_id": 5,
    "lead_status": "new",
    "industry_id": 10,
    "region_id": 3,
    "office_timings": "9:00 AM - 6:00 PM EST",
    "timezone": "America/New_York",
    "lead_source": "Website Form",
    "sales_rep": 8,
    "lead_since": "2024-01-15",
    "lead_score": "B+",
    "notes": "Interested in demo next week",
    "remarks": "Initial inquiry from website",
    "assigned_to": 5,
    "company_id": 1,
    "createdby": 1,
    "updatedby": 1
  }
}`,
    response: `{
  "status": "success",
  "message": "Pre-lead created successfully",
  "data": { "pre_lead_id": 123 }
}`
  },
  {
    id: 'pre-lead-update',
    title: 'Update Pre-Lead',
    method: 'POST',
    endpoint: '/api/v1/webhooks/incoming/pre-lead/{pre_lead_id}/update',
    event: 'pre_lead_update',
    description: 'Updates an existing pre-lead with company details and all fields',
    laravelMethod: 'updatePreLead',
    hasPathParam: true,
    paramName: 'preLeadId',
    fields: [
      // Basic Information
      { name: 'first_name', type: 'string', required: false, description: 'First name' },
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
      { name: 'discard_reason', type: 'string', required: false, description: 'Reason for discarding the pre-lead' },
      // Interest & Requirements
      { name: 'product_interest', type: 'string', required: false, description: 'Products/services interested in' },
      { name: 'requirements', type: 'string', required: false, description: 'Specific requirements' },
      { name: 'budget_range', type: 'string', required: false, description: 'Budget range' },
      // Location
      { name: 'city', type: 'string', required: false, description: 'City name' },
      { name: 'state', type: 'string', required: false, description: 'State name' },
      { name: 'country', type: 'string', required: false, description: 'Country name' },
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
      // System Fields
      { name: 'company_id', type: 'integer', required: false, description: 'Company ID' },
      { name: 'createdby', type: 'integer', required: false, description: 'Created by user ID' },
      { name: 'updatedby', type: 'integer', required: false, description: 'Updated by user ID' },
    ],
    example: `{
  "event": "pre_lead_update",
  "source": "crm",
  "data": {
    "first_name": "John",
    "last_name": "Doe Updated",
    "email": "john.updated@example.com",
    "phone": "+1234567899",
    "alternate_phone": "+1234567800",
    "company_name": "ABC Corporation Ltd.",
    "designation": "Chief Executive Officer",
    "website": "https://www.abccorp.com",
    "source": "referral",
    "source_details": "Referred by XYZ Company",
    "status": 0,
    "discard_reason": null,
    "product_interest": "Enterprise CRM Suite",
    "requirements": "Need full CRM implementation with ERP integration",
    "budget_range": "$50,000 - $100,000",
    "city": "New York",
    "state": "New York",
    "country": "USA",
    "address_line1": "123 Business Avenue",
    "address_line2": "Floor 15, Suite 1501",
    "zip_code": "10001",
    "city_id": 1,
    "state_id": 33,
    "country_id": 1,
    "phone_no": "+1-212-555-0100",
    "fax": "+1-212-555-0101",
    "nof_representative": "Michael Johnson",
    "memo": "Key decision maker, prefers email communication",
    "group_id": 5,
    "lead_status": "qualified",
    "industry_id": 10,
    "region_id": 3,
    "office_timings": "9:00 AM - 6:00 PM EST",
    "timezone": "America/New_York",
    "lead_source": "Partner Referral",
    "sales_rep": 8,
    "lead_since": "2024-01-01",
    "lead_score": "A+",
    "notes": "High priority prospect with confirmed budget",
    "remarks": "Schedule demo for next week",
    "assigned_to": 5,
    "company_id": 1,
    "createdby": 1,
    "updatedby": 2
  }
}`,
    response: `{
  "status": "success",
  "message": "Pre-lead updated successfully",
  "data": { "pre_lead_id": 123 }
}`
  },
  {
    id: 'pre-lead-discard',
    title: 'Discard Pre-Lead',
    method: 'POST',
    endpoint: '/api/v1/webhooks/incoming/pre-lead/{pre_lead_id}/discard',
    event: 'pre_lead_discard',
    description: 'Discards/archives a pre-lead',
    laravelMethod: 'discardPreLead',
    hasPathParam: true,
    paramName: 'preLeadId',
    fields: [
      { name: 'reason', type: 'string', required: false, description: 'Reason for discarding' },
    ],
    example: `{
  "event": "pre_lead_discard",
  "source": "crm",
  "data": {
    "reason": "Not interested - budget constraints"
  }
}`,
    response: `{
  "status": "success",
  "message": "Pre-lead discarded successfully",
  "data": { "pre_lead_id": 123 }
}`
  },
  {
    id: 'pre-lead-contact',
    title: 'Add Contact to Pre-Lead',
    method: 'POST',
    endpoint: '/api/v1/webhooks/incoming/pre-lead/{pre_lead_id}/contact/add',
    event: 'pre_lead_contact_add',
    description: 'Adds a new contact person to a pre-lead with all contact details',
    laravelMethod: 'addPreLeadContact',
    hasPathParam: true,
    paramName: 'preLeadId',
    fields: [
      // Tracking Fields
      { name: 'company_id', type: 'integer', required: false, description: 'Company ID to track data for specific customers' },
      { name: 'lead_id', type: 'integer', required: false, description: 'Lead ID to track data for specific leads' },
      // Contact Type
      { name: 'contact_type', type: 'string', required: false, description: 'Type: primary, billing, technical, decision_maker' },
      // Basic Information
      { name: 'title', type: 'string', required: false, description: 'Title: Mr., Mrs., Ms., Dr.' },
      { name: 'first_name', type: 'string', required: true, description: 'Contact first name' },
      { name: 'last_name', type: 'string', required: false, description: 'Contact last name' },
      { name: 'designation', type: 'string', required: false, description: 'Job title/designation' },
      // Contact Details
      { name: 'work_email', type: 'string', required: false, description: 'Work email address' },
      { name: 'personal_email', type: 'string', required: false, description: 'Personal email address' },
      { name: 'work_phone', type: 'string', required: false, description: 'Work phone number' },
      { name: 'ext', type: 'string', required: false, description: 'Phone extension' },
      { name: 'fax', type: 'string', required: false, description: 'Fax number' },
      { name: 'cell_phone', type: 'string', required: false, description: 'Cell/mobile phone number' },
      { name: 'home_phone', type: 'string', required: false, description: 'Home phone number' },
      // Social Media Links
      { name: 'linkedin_url', type: 'string', required: false, description: 'LinkedIn profile URL' },
      { name: 'facebook_url', type: 'string', required: false, description: 'Facebook profile URL' },
      { name: 'twitter_url', type: 'string', required: false, description: 'Twitter profile URL' },
      // Profile Image
      { name: 'image', type: 'string', required: false, description: 'Profile image URL' },
      // Status
      { name: 'status', type: 'string', required: false, description: 'Status: active, inactive' },
      // Notes
      { name: 'notes', type: 'string', required: false, description: 'Additional notes' },
      // System Fields
      { name: 'created_by', type: 'integer', required: false, description: 'Created by user ID' },
      { name: 'updated_by', type: 'integer', required: false, description: 'Updated by user ID' },
    ],
    example: `{
  "event": "pre_lead_contact_add",
  "source": "crm",
  "data": {
    "company_id": 1,
    "lead_id": 456,
    "contact_type": "decision_maker",
    "title": "Mr.",
    "first_name": "Jane",
    "last_name": "Smith",
    "designation": "Procurement Manager",
    "work_email": "jane.smith@abccorp.com",
    "personal_email": "jane.smith@gmail.com",
    "work_phone": "+1-212-555-0102",
    "ext": "205",
    "fax": "+1-212-555-0103",
    "cell_phone": "+1-212-555-0104",
    "home_phone": "+1-212-555-0105",
    "linkedin_url": "https://linkedin.com/in/janesmith",
    "facebook_url": "https://facebook.com/janesmith",
    "twitter_url": "https://twitter.com/janesmith",
    "image": "https://example.com/images/jane-smith.jpg",
    "status": "active",
    "notes": "Primary decision maker for procurement",
    "created_by": 1,
    "updated_by": 1
  }
}`,
    response: `{
  "status": "success",
  "message": "Contact added successfully",
  "data": { "contact_id": 456, "pre_lead_id": 123 }
}`
  },
  {
    id: 'pre-lead-memo',
    title: 'Add Memo to Pre-Lead',
    method: 'POST',
    endpoint: '/api/v1/webhooks/incoming/pre-lead/{pre_lead_id}/memo/add',
    event: 'pre_lead_memo_add',
    description: 'Adds a memo/note to a pre-lead with all database fields',
    laravelMethod: 'addPreLeadMemo',
    hasPathParam: true,
    paramName: 'preLeadId',
    fields: [
      // Tracking Fields
      { name: 'company_id', type: 'integer', required: false, description: 'Company ID to track data for specific customers' },
      { name: 'lead_id', type: 'integer', required: false, description: 'Lead ID to track data for specific leads' },
      // Memo Details
      { name: 'details', type: 'string', required: true, description: 'Memo content/details (rich text supported)' },
      // System Fields
      { name: 'created_by', type: 'integer', required: false, description: 'Created by user ID' },
      { name: 'updated_by', type: 'integer', required: false, description: 'Updated by user ID' },
    ],
    example: `{
  "event": "pre_lead_memo_add",
  "source": "crm",
  "data": {
    "company_id": 1,
    "lead_id": 456,
    "details": "<p><strong>Initial Call Summary</strong></p><p>Discussed requirements with John Doe on 2024-01-15.</p><ul><li>Client needs enterprise CRM solution</li><li>Budget confirmed: $50,000 - $100,000</li><li>Timeline: Q2 2024 implementation</li><li>Decision maker: CEO</li></ul><p>Next steps: Schedule product demo for next week.</p>",
    "created_by": 5,
    "updated_by": 5
  }
}`,
    response: `{
  "status": "success",
  "message": "Memo added successfully",
  "data": { "memo_id": 789, "pre_lead_id": 123 }
}`
  },
  {
    id: 'pre-lead-document',
    title: 'Add Document to Pre-Lead',
    method: 'POST',
    endpoint: '/api/v1/webhooks/incoming/pre-lead/{pre_lead_id}/document/add',
    event: 'pre_lead_document_add',
    description: 'Adds a document/file to a pre-lead with all database fields including tracking fields',
    laravelMethod: 'addPreLeadDocument',
    hasPathParam: true,
    paramName: 'preLeadId',
    fields: [
      // Tracking Fields
      { name: 'company_id', type: 'integer', required: false, description: 'Company ID to track data for specific customers' },
      // File Details
      { name: 'name', type: 'string', required: true, description: 'Stored filename (system generated or custom)' },
      { name: 'original_name', type: 'string', required: true, description: 'Original filename as uploaded by user' },
      { name: 'file_path', type: 'string', required: true, description: 'Full file path or URL where file is stored' },
      { name: 'file_type', type: 'string', required: false, description: 'MIME type or file extension (e.g., application/pdf, image/png, application/msword)' },
      { name: 'size', type: 'integer', required: false, description: 'File size in bytes' },
      // Metadata
      { name: 'notes', type: 'string', required: false, description: 'Notes or description about the document' },
      // System Fields
      { name: 'uploaded_by', type: 'integer', required: false, description: 'User ID who uploaded the document' },
    ],
    example: `{
  "event": "pre_lead_document_add",
  "source": "erp",
  "data": {
    "company_id": 1,
    "name": "inquiry_brochure_abc_corp.pdf",
    "original_name": "ABC Corporation - Product Inquiry Brochure.pdf",
    "file_path": "/uploads/pre_leads/123/documents/inquiry_brochure_abc_corp.pdf",
    "file_type": "application/pdf",
    "size": 524288,
    "notes": "Initial inquiry brochure sent to prospect. Contains product overview and pricing.",
    "uploaded_by": 5
  }
}`,
    response: `{
  "status": "success",
  "message": "Document added to pre-lead successfully",
  "data": {
    "document_id": 501,
    "pre_lead_id": 123,
    "name": "inquiry_brochure_abc_corp.pdf",
    "original_name": "ABC Corporation - Product Inquiry Brochure.pdf",
    "file_path": "/uploads/pre_leads/123/documents/inquiry_brochure_abc_corp.pdf",
    "file_type": "application/pdf",
    "size": 524288
  }
}`
  },
  {
    id: 'pre-lead-status',
    title: 'Update Pre-Lead Status',
    method: 'POST',
    endpoint: '/api/v1/webhooks/incoming/pre-lead/{pre_lead_id}/status/update',
    event: 'pre_lead_status_update',
    description: 'Updates the status of a pre-lead with history tracking',
    laravelMethod: 'updatePreLeadStatus',
    hasPathParam: true,
    paramName: 'preLeadId',
    fields: [
      { name: 'lead_status', type: 'string', required: true, description: 'New status value' },
      { name: 'remarks', type: 'string', required: false, description: 'Status change remarks' },
      { name: 'status_date', type: 'string', required: false, description: 'Status date (ISO format)' },
    ],
    example: `{
  "event": "pre_lead_status_update",
  "source": "crm",
  "data": {
    "lead_status": "qualified",
    "remarks": "Qualified after initial assessment - budget confirmed",
    "status_date": "2024-01-15T10:30:00Z"
  }
}`,
    response: `{
  "status": "success",
  "message": "Pre-lead status updated successfully",
  "data": { "pre_lead_id": 123, "old_status": "new", "new_status": "qualified" }
}`
  },
  {
    id: 'pre-lead-company-profile',
    title: 'Update Pre-Lead Company Profile',
    method: 'POST',
    endpoint: '/api/v1/webhooks/incoming/pre-lead/{pre_lead_id}/company-profile/update',
    event: 'pre_lead_company_profile_update',
    description: 'Updates or creates the company profile (qualified lead profile) for a pre-lead',
    laravelMethod: 'updatePreLeadCompanyProfile',
    hasPathParam: true,
    paramName: 'preLeadId',
    fields: [
      // Tracking Fields
      { name: 'company_id', type: 'integer', required: false, description: 'Company ID to track data for specific customers' },
      { name: 'lead_id', type: 'integer', required: false, description: 'Lead ID to track data for specific leads' },
      // Contact Selection
      { name: 'contact_id', type: 'integer', required: false, description: 'Pre-lead contact ID to link' },
      // Basic Info
      { name: 'company_name', type: 'string', required: false, description: 'Company name' },
      { name: 'industry_id', type: 'integer', required: false, description: 'Industry ID' },
      // Contact Info
      { name: 'best_time_call', type: 'string', required: false, description: 'Best time to call' },
      { name: 'best_time_call_timezone', type: 'integer', required: false, description: 'Timezone ID for best call time' },
      { name: 'mode', type: 'string', required: false, description: 'Preferred contact mode: Email, Phone, Visit' },
      // Contact Details (auto-filled when contact selected)
      { name: 'contact_name', type: 'string', required: false, description: 'Contact person name' },
      { name: 'designation', type: 'string', required: false, description: 'Contact designation' },
      { name: 'phone', type: 'string', required: false, description: 'Contact phone number' },
      { name: 'email', type: 'string', required: false, description: 'Contact email address' },
      // Additional Information
      { name: 'need_type', type: 'integer', required: false, description: 'Need type (dropdown ID)' },
      { name: 'current_software', type: 'string', required: false, description: 'Current software being used' },
      { name: 'need_summary', type: 'string', required: false, description: 'Summary of needs/requirements' },
      { name: 'budget', type: 'integer', required: false, description: 'Budget range (dropdown ID)' },
      { name: 'decision_maker', type: 'integer', required: false, description: 'Decision maker contact ID' },
      { name: 'time_frame', type: 'integer', required: false, description: 'Time frame (dropdown ID)' },
      { name: 'qualified_by', type: 'integer', required: false, description: 'Qualified by user ID' },
      // Rich Text Fields
      { name: 'company_profile', type: 'string', required: false, description: 'Company profile description (rich text)' },
      { name: 'summary_of_discussion', type: 'string', required: false, description: 'Summary of discussion (rich text)' },
      { name: 'conclusion', type: 'string', required: false, description: 'Conclusion notes (rich text)' },
      // Status
      { name: 'status', type: 'string', required: false, description: 'Status: draft, submitted' },
      // System Fields
      { name: 'created_by', type: 'integer', required: false, description: 'Created by user ID' },
      { name: 'updated_by', type: 'integer', required: false, description: 'Updated by user ID' },
    ],
    example: `{
  "event": "pre_lead_company_profile_update",
  "source": "crm",
  "data": {
    "company_id": 1,
    "lead_id": 456,
    "contact_id": 456,
    "company_name": "ABC Corporation Ltd.",
    "industry_id": 10,
    "best_time_call": "10:00 AM - 12:00 PM",
    "best_time_call_timezone": 1,
    "mode": "Phone",
    "contact_name": "John Doe",
    "designation": "Chief Executive Officer",
    "phone": "+1-212-555-0100",
    "email": "john.doe@abccorp.com",
    "need_type": 1,
    "current_software": "SAP ERP",
    "need_summary": "Looking to upgrade their CRM system with better integration capabilities",
    "budget": 3,
    "decision_maker": 456,
    "time_frame": 2,
    "qualified_by": 5,
    "company_profile": "<p>ABC Corporation is a leading manufacturer with operations in 5 countries. Founded in 1995, they have grown to become a market leader in industrial equipment.</p>",
    "summary_of_discussion": "<p>Discussed current pain points with existing CRM. Main concerns are integration with ERP and mobile accessibility for field sales team.</p>",
    "conclusion": "<p>Strong prospect with confirmed budget. Recommended for demo scheduling within next 2 weeks.</p>",
    "status": "submitted",
    "created_by": 1,
    "updated_by": 5
  }
}`,
    response: `{
  "status": "success",
  "message": "Company profile updated successfully",
  "data": { "pre_lead_id": 123, "profile_id": 789 }
}`
  },
  {
    id: 'pre-lead-convert',
    title: 'Convert Pre-Lead to Lead',
    method: 'POST',
    endpoint: '/api/v1/webhooks/incoming/pre-lead/{pre_lead_id}/convert',
    event: 'pre_lead_convert',
    description: 'Converts a qualified pre-lead into a lead with tracking fields',
    laravelMethod: 'convertPreLeadToLead',
    hasPathParam: true,
    paramName: 'preLeadId',
    fields: [
      // Tracking Fields
      { name: 'company_id', type: 'integer', required: false, description: 'Company ID to track data for specific customers' },
      { name: 'lead_id', type: 'integer', required: false, description: 'Lead ID to link with existing lead' },
      // Conversion Details
      { name: 'priority', type: 'string', required: false, description: 'Priority: low, medium, high, critical' },
      { name: 'assigned_to', type: 'integer', required: false, description: 'User ID to assign' },
      { name: 'expected_value', type: 'number', required: false, description: 'Expected deal value' },
      { name: 'notes', type: 'string', required: false, description: 'Additional notes' },
      // Conversion Tracking
      { name: 'is_converted', type: 'boolean', required: false, description: 'Mark as converted (default: true)' },
      { name: 'converted_at', type: 'string', required: false, description: 'Conversion timestamp (ISO 8601 format)' },
      { name: 'converted_by', type: 'integer', required: false, description: 'User ID who performed the conversion' },
    ],
    example: `{
  "event": "pre_lead_convert",
  "source": "crm",
  "data": {
    "company_id": 1,
    "lead_id": 456,
    "priority": "high",
    "assigned_to": 5,
    "expected_value": 50000.00,
    "notes": "High value prospect - qualified and ready for conversion",
    "is_converted": true,
    "converted_at": "2024-01-15T10:30:00Z",
    "converted_by": 5
  }
}`,
    response: `{
  "status": "success",
  "message": "Pre-lead converted to lead successfully",
  "data": {
    "pre_lead_id": 123,
    "lead_id": 456,
    "company_id": 1,
    "is_converted": true,
    "converted_at": "2024-01-15T10:30:00Z"
  }
}`
  },
  {
    id: 'pre-lead-get-by-company',
    title: 'Get All Pre-Leads by Company',
    method: 'GET',
    endpoint: '/api/v1/pre-leads/by-company/{company_id}',
    event: 'get_pre_leads_by_company',
    description: 'Retrieves all pre-leads that share the same company_id. Useful for tracking pre-leads across the same customer/company with pagination and filtering.',
    laravelMethod: 'getPreLeadsByCompany',
    hasPathParam: true,
    paramName: 'companyId',
    fields: [
      // Path Parameter
      { name: 'company_id', type: 'integer', required: true, description: 'Company ID to filter pre-leads by (path parameter)' },
      // Query Parameters
      { name: 'page', type: 'integer', required: false, description: 'Page number (default: 1)' },
      { name: 'page_size', type: 'integer', required: false, description: 'Items per page (default: 20, max: 100)' },
      { name: 'search', type: 'string', required: false, description: 'Search in first_name, last_name, email, phone, company_name' },
      { name: 'status', type: 'integer', required: false, description: 'Filter by status: 0 = active, 1 = discarded' },
      { name: 'source', type: 'string', required: false, description: 'Filter by source: website, referral, social_media, cold_call, walk_in, whatsapp, email, erp, other' },
    ],
    example: `// GET Request - No body required
// URL: /api/v1/pre-leads/by-company/1?page=1&page_size=20&status=0

// Query Parameters:
{
  "company_id": 1,
  "page": 1,
  "page_size": 20,
  "search": "john",
  "status": 0,
  "source": "website"
}`,
    response: `{
  "items": [
    {
      "id": 123,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "company_name": "ABC Corporation",
      "company_id": 1,
      "source": "website",
      "status": 0,
      "is_converted": false,
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": 124,
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane.smith@example.com",
      "phone": "+1234567891",
      "company_name": "ABC Corporation",
      "company_id": 1,
      "source": "referral",
      "status": 0,
      "is_converted": false,
      "created_at": "2024-01-16T09:00:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "page_size": 20,
  "total_pages": 2
}`
  },
];

const leadAPIs = [
  {
    id: 'lead-create',
    title: 'Create Lead',
    method: 'POST',
    endpoint: '/api/v1/webhooks/incoming/lead/create',
    event: 'new_lead',
    description: 'Creates a new lead directly with all company details fields',
    laravelMethod: 'createLead',
    hasPathParam: false,
    paramName: '',
    fields: [
      // Basic Information
      { name: 'first_name', type: 'string', required: true, description: 'First name' },
      { name: 'last_name', type: 'string', required: false, description: 'Last name' },
      { name: 'email', type: 'string', required: false, description: 'Email address' },
      { name: 'phone', type: 'string', required: false, description: 'Phone number' },
      { name: 'alternate_phone', type: 'string', required: false, description: 'Alternate phone number' },
      // Company Information
      { name: 'company_name', type: 'string', required: false, description: 'Company name' },
      { name: 'company_code', type: 'string', required: false, description: 'Company code' },
      { name: 'designation', type: 'string', required: false, description: 'Job designation/title' },
      { name: 'company_size', type: 'string', required: false, description: 'Company size' },
      { name: 'industry', type: 'string', required: false, description: 'Industry name' },
      { name: 'website', type: 'string', required: false, description: 'Company website URL' },
      // Lead Details
      { name: 'source', type: 'string', required: false, description: 'Source: pre_lead, direct, website, referral, social_media, cold_call, walk_in, whatsapp, email, erp, other' },
      { name: 'source_details', type: 'string', required: false, description: 'Additional source details' },
      { name: 'status', type: 'integer', required: false, description: 'Status: 0 = active, 1 = discarded' },
      { name: 'lead_status', type: 'string', required: false, description: 'Workflow status: new, contacted, qualified, proposal_sent, negotiation, won, lost' },
      { name: 'priority', type: 'string', required: false, description: 'Priority: low, medium, high, critical' },
      // Pipeline Stage
      { name: 'pipeline_stage', type: 'integer', required: false, description: 'Pipeline stage (1-6)' },
      // Financial
      { name: 'expected_value', type: 'number', required: false, description: 'Expected deal value' },
      { name: 'actual_value', type: 'number', required: false, description: 'Actual deal value' },
      { name: 'currency', type: 'string', required: false, description: 'Currency code (default: INR)' },
      // Products/Services
      { name: 'product_interest', type: 'string', required: false, description: 'Products/services interested in' },
      { name: 'requirements', type: 'string', required: false, description: 'Specific requirements' },
      // Timeline
      { name: 'expected_close_date', type: 'string', required: false, description: 'Expected close date (ISO 8601)' },
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
      { name: 'lead_score', type: 'integer', required: false, description: 'Lead score' },
      { name: 'sales_rep', type: 'string', required: false, description: 'Sales representative' },
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
  "source": "website",
  "data": {
    "first_name": "Robert",
    "last_name": "Johnson",
    "email": "robert@example.com",
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
    "actual_value": null,
    "currency": "USD",
    "product_interest": "Enterprise CRM Suite",
    "requirements": "Full CRM implementation with ERP integration",
    "expected_close_date": "2024-03-15T00:00:00Z",
    "last_contacted": null,
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
    "pincode": "60601",
    "zip_code": "60601",
    "phone_no": "+1-312-555-0100",
    "fax": "+1-312-555-0101",
    "nof_representative": "Michael Brown",
    "memo": "New enterprise prospect",
    "group_id": 3,
    "industry_id": 15,
    "region_id": 5,
    "office_timings": "8:00 AM - 5:00 PM CST",
    "timezone": "America/Chicago",
    "lead_source": "Partner Referral",
    "lead_score": 75,
    "sales_rep": "John Smith",
    "lead_since": "2024-01-15T00:00:00Z",
    "remarks": "High potential enterprise client",
    "notes": "Referred by existing client ABC Corp",
    "assigned_to": 5,
    "team_id": 2,
    "company_id": 1,
    "createdby": 1,
    "updatedby": 1
  }
}`,
    response: `{
  "status": "success",
  "message": "Lead created successfully",
  "data": { "lead_id": 789 }
}`
  },
  {
    id: 'lead-update',
    title: 'Update Lead',
    method: 'POST',
    endpoint: '/api/v1/webhooks/incoming/lead/{lead_id}/update',
    event: 'lead_update',
    description: 'Updates an existing lead with all company details fields',
    laravelMethod: 'updateLead',
    hasPathParam: true,
    paramName: 'leadId',
    fields: [
      // Basic Information
      { name: 'first_name', type: 'string', required: false, description: 'First name' },
      { name: 'last_name', type: 'string', required: false, description: 'Last name' },
      { name: 'email', type: 'string', required: false, description: 'Email address' },
      { name: 'phone', type: 'string', required: false, description: 'Phone number' },
      { name: 'alternate_phone', type: 'string', required: false, description: 'Alternate phone number' },
      // Company Information
      { name: 'company_name', type: 'string', required: false, description: 'Company name' },
      { name: 'company_code', type: 'string', required: false, description: 'Company code' },
      { name: 'designation', type: 'string', required: false, description: 'Job designation/title' },
      { name: 'company_size', type: 'string', required: false, description: 'Company size' },
      { name: 'industry', type: 'string', required: false, description: 'Industry name' },
      { name: 'website', type: 'string', required: false, description: 'Company website URL' },
      // Lead Details
      { name: 'source', type: 'string', required: false, description: 'Source: pre_lead, direct, website, referral, social_media, cold_call, walk_in, whatsapp, email, erp, other' },
      { name: 'source_details', type: 'string', required: false, description: 'Additional source details' },
      { name: 'status', type: 'integer', required: false, description: 'Status: 0 = active, 1 = discarded' },
      { name: 'lead_status', type: 'string', required: false, description: 'Workflow status: new, contacted, qualified, proposal_sent, negotiation, won, lost' },
      { name: 'priority', type: 'string', required: false, description: 'Priority: low, medium, high, critical' },
      // Pipeline Stage
      { name: 'pipeline_stage', type: 'integer', required: false, description: 'Pipeline stage (1-6)' },
      // Financial
      { name: 'expected_value', type: 'number', required: false, description: 'Expected deal value' },
      { name: 'actual_value', type: 'number', required: false, description: 'Actual deal value' },
      { name: 'currency', type: 'string', required: false, description: 'Currency code (default: INR)' },
      // Products/Services
      { name: 'product_interest', type: 'string', required: false, description: 'Products/services interested in' },
      { name: 'requirements', type: 'string', required: false, description: 'Specific requirements' },
      // Timeline
      { name: 'expected_close_date', type: 'string', required: false, description: 'Expected close date (ISO 8601)' },
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
      { name: 'lead_score', type: 'integer', required: false, description: 'Lead score' },
      { name: 'sales_rep', type: 'string', required: false, description: 'Sales representative' },
      { name: 'lead_since', type: 'string', required: false, description: 'Lead since date (ISO 8601)' },
      { name: 'remarks', type: 'string', required: false, description: 'Remarks' },
      // Notes
      { name: 'notes', type: 'string', required: false, description: 'Additional notes' },
      { name: 'loss_reason', type: 'string', required: false, description: 'Reason for loss' },
      // Assignment
      { name: 'assigned_to', type: 'integer', required: false, description: 'Assigned user ID' },
      { name: 'team_id', type: 'integer', required: false, description: 'Team ID' },
      // System Tracking
      { name: 'company_id', type: 'integer', required: false, description: 'Company ID' },
      { name: 'createdby', type: 'integer', required: false, description: 'Created by user ID' },
      { name: 'updatedby', type: 'integer', required: false, description: 'Updated by user ID' },
    ],
    example: `{
  "event": "lead_update",
  "source": "erp",
  "data": {
    "first_name": "Robert",
    "last_name": "Johnson Jr.",
    "email": "robert.johnson@xyzindustries.com",
    "phone": "+1234567894",
    "alternate_phone": "+1234567895",
    "company_name": "XYZ Industries Inc.",
    "company_code": "XYZ-001",
    "designation": "Chief Technology Officer",
    "company_size": "500-1000",
    "industry": "Manufacturing",
    "website": "https://www.xyzindustries.com",
    "source": "referral",
    "source_details": "Referred by ABC Corp",
    "status": 0,
    "lead_status": "proposal_sent",
    "priority": "critical",
    "pipeline_stage": 4,
    "expected_value": 150000.00,
    "actual_value": 145000.00,
    "currency": "USD",
    "product_interest": "Enterprise CRM Suite",
    "requirements": "Full CRM implementation with ERP integration",
    "expected_close_date": "2024-03-15T00:00:00Z",
    "last_contacted": "2024-01-10T14:30:00Z",
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
    "pincode": "60601",
    "zip_code": "60601",
    "phone_no": "+1-312-555-0100",
    "fax": "+1-312-555-0101",
    "nof_representative": "Michael Brown",
    "memo": "Key strategic account",
    "group_id": 3,
    "industry_id": 15,
    "region_id": 5,
    "office_timings": "8:00 AM - 5:00 PM CST",
    "timezone": "America/Chicago",
    "lead_source": "Partner Referral",
    "lead_score": 85,
    "sales_rep": "John Smith",
    "lead_since": "2024-01-01T00:00:00Z",
    "remarks": "High potential enterprise client",
    "notes": "Decision expected by end of month",
    "loss_reason": null,
    "assigned_to": 5,
    "team_id": 2,
    "company_id": 1,
    "createdby": 1,
    "updatedby": 5
  }
}`,
    response: `{
  "status": "success",
  "message": "Lead updated successfully",
  "data": { "lead_id": 789 }
}`
  },
  {
    id: 'lead-discard',
    title: 'Discard Lead',
    method: 'POST',
    endpoint: '/api/v1/webhooks/incoming/lead/{lead_id}/discard',
    event: 'lead_discard',
    description: 'Discards/archives a lead',
    laravelMethod: 'discardLead',
    hasPathParam: true,
    paramName: 'leadId',
    fields: [
      { name: 'reason', type: 'string', required: false, description: 'Reason for discarding' },
      { name: 'loss_reason', type: 'string', required: false, description: 'Specific loss reason' },
    ],
    example: `{
  "event": "lead_discard",
  "source": "crm",
  "data": {
    "reason": "Lost to competitor - chose alternative vendor",
    "loss_reason": "Price too high compared to competitor offering"
  }
}`,
    response: `{
  "status": "success",
  "message": "Lead discarded successfully",
  "data": { "lead_id": 789 }
}`
  },
  {
    id: 'lead-contact',
    title: 'Add Contact to Lead',
    method: 'POST',
    endpoint: '/api/v1/webhooks/incoming/lead/{lead_id}/contact/add',
    event: 'lead_contact_add',
    description: 'Adds a new contact person to a lead with all contact details',
    laravelMethod: 'addLeadContact',
    hasPathParam: true,
    paramName: 'leadId',
    fields: [
      // Tracking Fields
      { name: 'company_id', type: 'integer', required: false, description: 'Company ID to track data for specific customers' },
      { name: 'pre_lead_id', type: 'integer', required: false, description: 'Pre-lead ID to track origin data' },
      // Contact Type
      { name: 'contact_type', type: 'string', required: false, description: 'Type: primary, billing, technical, decision_maker' },
      // Basic Information
      { name: 'title', type: 'string', required: false, description: 'Title: Mr., Mrs., Ms., Dr.' },
      { name: 'first_name', type: 'string', required: true, description: 'Contact first name' },
      { name: 'last_name', type: 'string', required: false, description: 'Contact last name' },
      { name: 'designation', type: 'string', required: false, description: 'Job title/designation' },
      { name: 'department', type: 'string', required: false, description: 'Department' },
      { name: 'is_primary', type: 'boolean', required: false, description: 'Is primary contact' },
      // Contact Details
      { name: 'email', type: 'string', required: false, description: 'Primary email address' },
      { name: 'work_email', type: 'string', required: false, description: 'Work email address' },
      { name: 'personal_email', type: 'string', required: false, description: 'Personal email address' },
      { name: 'phone', type: 'string', required: false, description: 'Primary phone number' },
      { name: 'work_phone', type: 'string', required: false, description: 'Work phone number' },
      { name: 'ext', type: 'string', required: false, description: 'Phone extension' },
      { name: 'fax', type: 'string', required: false, description: 'Fax number' },
      { name: 'cell_phone', type: 'string', required: false, description: 'Cell/mobile phone number' },
      { name: 'home_phone', type: 'string', required: false, description: 'Home phone number' },
      // Social Media Links
      { name: 'linkedin_url', type: 'string', required: false, description: 'LinkedIn profile URL' },
      { name: 'facebook_url', type: 'string', required: false, description: 'Facebook profile URL' },
      { name: 'twitter_url', type: 'string', required: false, description: 'Twitter profile URL' },
      // Profile Image
      { name: 'image', type: 'string', required: false, description: 'Profile image URL' },
      // Status
      { name: 'status', type: 'string', required: false, description: 'Status: active, inactive' },
      // Notes
      { name: 'notes', type: 'string', required: false, description: 'Additional notes' },
      // System Fields
      { name: 'created_by', type: 'integer', required: false, description: 'Created by user ID' },
      { name: 'updated_by', type: 'integer', required: false, description: 'Updated by user ID' },
    ],
    example: `{
  "event": "lead_contact_add",
  "source": "crm",
  "data": {
    "company_id": 1,
    "pre_lead_id": 123,
    "contact_type": "decision_maker",
    "title": "Ms.",
    "first_name": "Sarah",
    "last_name": "Williams",
    "designation": "Chief Technology Officer",
    "department": "Technology",
    "is_primary": true,
    "email": "sarah.williams@xyzindustries.com",
    "work_email": "sarah.williams@xyzindustries.com",
    "personal_email": "sarah.williams@gmail.com",
    "phone": "+1-312-555-0200",
    "work_phone": "+1-312-555-0201",
    "ext": "301",
    "fax": "+1-312-555-0202",
    "cell_phone": "+1-312-555-0203",
    "home_phone": "+1-312-555-0204",
    "linkedin_url": "https://linkedin.com/in/sarahwilliams",
    "facebook_url": "https://facebook.com/sarahwilliams",
    "twitter_url": "https://twitter.com/sarahwilliams",
    "image": "https://example.com/images/sarah-williams.jpg",
    "status": "active",
    "notes": "Key decision maker for technology purchases",
    "created_by": 5,
    "updated_by": 5
  }
}`,
    response: `{
  "status": "success",
  "message": "Contact added successfully",
  "data": { "contact_id": 101, "lead_id": 789 }
}`
  },
  {
    id: 'lead-activity',
    title: 'Add Activity to Lead',
    method: 'POST',
    endpoint: '/api/v1/webhooks/incoming/lead/{lead_id}/activity/add',
    event: 'lead_activity_add',
    description: 'Logs an activity (call, email, meeting, etc.) for a lead with all details',
    laravelMethod: 'addLeadActivity',
    hasPathParam: true,
    paramName: 'leadId',
    fields: [
      // Tracking Fields
      { name: 'company_id', type: 'integer', required: false, description: 'Company ID to track data for specific customers' },
      { name: 'pre_lead_id', type: 'integer', required: false, description: 'Pre-lead ID to track origin data' },
      // Activity Details
      { name: 'activity_type', type: 'string', required: true, description: 'Type: call, email, meeting, whatsapp, note, task, follow_up, other' },
      { name: 'subject', type: 'string', required: true, description: 'Activity subject/title' },
      { name: 'description', type: 'string', required: false, description: 'Activity description' },
      { name: 'outcome', type: 'string', required: false, description: 'Activity outcome/result' },
      // Dates
      { name: 'activity_date', type: 'string', required: true, description: 'Activity date (YYYY-MM-DD)' },
      { name: 'due_date', type: 'string', required: false, description: 'Due date (YYYY-MM-DD)' },
      // Status
      { name: 'is_completed', type: 'boolean', required: false, description: 'Is activity completed' },
      { name: 'completed_at', type: 'string', required: false, description: 'Completion timestamp (ISO 8601)' },
      // Related Contact
      { name: 'contact_id', type: 'integer', required: false, description: 'Related contact ID' },
      // System Fields
      { name: 'created_by', type: 'integer', required: false, description: 'Created by user ID' },
      { name: 'updated_by', type: 'integer', required: false, description: 'Updated by user ID' },
      { name: 'performed_by', type: 'integer', required: false, description: 'Performed by user ID' },
    ],
    example: `{
  "event": "lead_activity_add",
  "source": "crm",
  "data": {
    "company_id": 1,
    "pre_lead_id": 123,
    "activity_type": "meeting",
    "subject": "Product Demo - Enterprise CRM Suite",
    "description": "Full product demonstration with technical team. Covered all modules including CRM, Sales, and Reporting. Attendees: John Doe (CEO), Sarah Williams (CTO), Michael Brown (IT Manager).",
    "outcome": "Positive feedback - client impressed with reporting capabilities. Requested proposal with pricing for 100 users.",
    "activity_date": "2024-01-20",
    "due_date": "2024-01-20",
    "is_completed": true,
    "completed_at": "2024-01-20T16:30:00Z",
    "contact_id": 101,
    "created_by": 5,
    "updated_by": 5,
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
    id: 'lead-qualified-profile',
    title: 'Update Qualified Lead Profile',
    method: 'POST',
    endpoint: '/api/v1/webhooks/incoming/lead/{lead_id}/qualified-profile/update',
    event: 'lead_qualified_profile_update',
    description: 'Updates or creates the qualified lead profile with all database fields',
    laravelMethod: 'updateLeadQualifiedProfile',
    hasPathParam: true,
    paramName: 'leadId',
    fields: [
      // Tracking Fields
      { name: 'company_id', type: 'integer', required: false, description: 'Company ID to track data for specific customers' },
      { name: 'pre_lead_id', type: 'integer', required: false, description: 'Pre-lead ID to track origin data' },
      // Profile Type
      { name: 'profile_type', type: 'string', required: false, description: 'Type: basic, detailed, enterprise' },
      // Company Information
      { name: 'company_name', type: 'string', required: false, description: 'Company name' },
      { name: 'company_type', type: 'string', required: false, description: 'Company type' },
      { name: 'industry_id', type: 'integer', required: false, description: 'Industry ID' },
      { name: 'annual_revenue', type: 'string', required: false, description: 'Annual revenue range' },
      { name: 'employee_count', type: 'string', required: false, description: 'Employee count range' },
      // Decision Making
      { name: 'decision_maker', type: 'string', required: false, description: 'Decision maker name/role' },
      { name: 'decision_process', type: 'string', required: false, description: 'Decision process details' },
      { name: 'budget', type: 'string', required: false, description: 'Budget amount/range' },
      { name: 'timeline', type: 'string', required: false, description: 'Decision timeline' },
      // Competitive Information
      { name: 'competitors', type: 'string', required: false, description: 'Competitor information' },
      { name: 'current_solution', type: 'string', required: false, description: 'Current solution being used' },
      // Pain Points & Requirements
      { name: 'pain_points', type: 'string', required: false, description: 'Pain points' },
      { name: 'requirements', type: 'string', required: false, description: 'Requirements' },
      // Notes
      { name: 'notes', type: 'string', required: false, description: 'Additional notes' },
      // System Fields
      { name: 'created_by', type: 'integer', required: false, description: 'Created by user ID' },
      { name: 'updated_by', type: 'integer', required: false, description: 'Updated by user ID' },
    ],
    example: `{
  "event": "lead_qualified_profile_update",
  "source": "crm",
  "data": {
    "company_id": 1,
    "pre_lead_id": 123,
    "profile_type": "detailed",
    "company_name": "XYZ Industries Inc.",
    "company_type": "Manufacturing",
    "industry_id": 15,
    "annual_revenue": "$10M-50M",
    "employee_count": "100-500",
    "decision_maker": "CEO - Robert Johnson",
    "decision_process": "Committee decision involving CEO, CTO, and CFO. Final approval from board required for purchases over $100K.",
    "budget": "$150,000",
    "timeline": "Q2 2024",
    "competitors": "Salesforce, HubSpot - currently evaluating both. Price sensitivity noted.",
    "current_solution": "Spreadsheets and manual tracking. No integrated CRM system.",
    "pain_points": "Manual processes, no real-time visibility, difficult reporting, data silos between departments",
    "requirements": "Cloud-based, mobile access, custom reporting, API integration with existing ERP",
    "notes": "Strong candidate - has budget approval and urgent timeline. Key decision maker is supportive.",
    "created_by": 5,
    "updated_by": 5
  }
}`,
    response: `{
  "status": "success",
  "message": "Qualified profile updated successfully",
  "data": { "lead_id": 789, "profile_id": 303 }
}`
  },
  {
    id: 'lead-memo',
    title: 'Add Memo to Lead',
    method: 'POST',
    endpoint: '/api/v1/webhooks/incoming/lead/{lead_id}/memo/add',
    event: 'lead_memo_add',
    description: 'Adds a memo/note to a lead with all database fields',
    laravelMethod: 'addLeadMemo',
    hasPathParam: true,
    paramName: 'leadId',
    fields: [
      // Tracking Fields
      { name: 'company_id', type: 'integer', required: false, description: 'Company ID to track data for specific customers' },
      { name: 'pre_lead_id', type: 'integer', required: false, description: 'Pre-lead ID to track origin data' },
      // Memo Details
      { name: 'memo_type', type: 'string', required: false, description: 'Type: general, meeting_notes, call_notes, internal, important' },
      { name: 'title', type: 'string', required: true, description: 'Memo title' },
      { name: 'content', type: 'string', required: true, description: 'Memo content (rich text supported)' },
      // System Fields
      { name: 'created_by', type: 'integer', required: false, description: 'Created by user ID' },
      { name: 'updated_by', type: 'integer', required: false, description: 'Updated by user ID' },
    ],
    example: `{
  "event": "lead_memo_add",
  "source": "crm",
  "data": {
    "company_id": 1,
    "pre_lead_id": 123,
    "memo_type": "meeting_notes",
    "title": "Product Demo Meeting Notes - January 20, 2024",
    "content": "<p><strong>Attendees:</strong></p><ul><li>John Doe (CEO) - XYZ Industries</li><li>Sarah Williams (CTO) - XYZ Industries</li><li>Michael Brown (Sales Rep) - Our Company</li></ul><p><strong>Discussion Points:</strong></p><ol><li>Presented full CRM suite capabilities</li><li>Demonstrated reporting and analytics module</li><li>Showed integration options with existing ERP</li></ol><p><strong>Client Feedback:</strong></p><ul><li>Impressed with reporting capabilities</li><li>Requested custom dashboard options</li><li>Asked about mobile app availability</li></ul><p><strong>Next Steps:</strong></p><ul><li>Send detailed proposal by January 25</li><li>Schedule technical deep-dive with IT team</li><li>Prepare ROI analysis document</li></ul>",
    "created_by": 5,
    "updated_by": 5
  }
}`,
    response: `{
  "status": "success",
  "message": "Memo added successfully",
  "data": { "memo_id": 404, "lead_id": 789 }
}`
  },
  {
    id: 'lead-status',
    title: 'Update Lead Status',
    method: 'POST',
    endpoint: '/api/v1/webhooks/incoming/lead/{lead_id}/status/update',
    event: 'lead_status_update',
    description: 'Updates the lead status with history tracking',
    laravelMethod: 'updateLeadStatus',
    hasPathParam: true,
    paramName: 'leadId',
    fields: [
      { name: 'lead_status', type: 'string', required: true, description: 'Status: new, contacted, qualified, proposal_sent, negotiation, won, lost' },
      { name: 'remarks', type: 'string', required: false, description: 'Status change remarks' },
      { name: 'status_date', type: 'string', required: false, description: 'Status date (ISO format)' },
    ],
    example: `{
  "event": "lead_status_update",
  "source": "crm",
  "data": {
    "lead_status": "negotiation",
    "remarks": "Final pricing discussion - client requested 15% discount on annual plan",
    "status_date": "2024-01-25T09:00:00Z"
  }
}`,
    response: `{
  "status": "success",
  "message": "Lead status updated successfully",
  "data": { "lead_id": 789, "old_status": "proposal_sent", "new_status": "negotiation" }
}`
  },
  {
    id: 'lead-convert',
    title: 'Convert Lead to Customer',
    method: 'POST',
    endpoint: '/api/v1/webhooks/incoming/lead/{lead_id}/convert',
    event: 'lead_convert',
    description: 'Converts a won lead into a customer',
    laravelMethod: 'convertLeadToCustomer',
    hasPathParam: true,
    paramName: 'leadId',
    fields: [
      { name: 'customer_code', type: 'string', required: false, description: 'Customer code (auto-generated if not provided)' },
      { name: 'credit_limit', type: 'number', required: false, description: 'Credit limit' },
      { name: 'payment_terms', type: 'string', required: false, description: 'Payment terms' },
      { name: 'notes', type: 'string', required: false, description: 'Notes' },
    ],
    example: `{
  "event": "lead_convert",
  "source": "crm",
  "data": {
    "customer_code": "CUST-XYZ-001",
    "credit_limit": 100000.00,
    "payment_terms": "Net 30",
    "notes": "VIP customer - premium support package included. Contract signed for 3 years."
  }
}`,
    response: `{
  "status": "success",
  "message": "Lead converted to customer successfully",
  "data": { "lead_id": 789, "customer_id": 505, "customer_code": "CUST-XYZ-001" }
}`
  },
  {
    id: 'lead-document-add',
    title: 'Add Document to Lead',
    method: 'POST',
    endpoint: '/api/v1/webhooks/incoming/lead/{lead_id}/document/add',
    event: 'lead_document_add',
    description: 'Adds a document/file to a lead with all database fields including tracking fields',
    laravelMethod: 'addLeadDocument',
    hasPathParam: true,
    paramName: 'leadId',
    fields: [
      // Tracking Fields
      { name: 'company_id', type: 'integer', required: false, description: 'Company ID to track data for specific customers' },
      { name: 'pre_lead_id', type: 'integer', required: false, description: 'Pre-lead ID to track origin data' },
      // File Details
      { name: 'name', type: 'string', required: true, description: 'Stored filename (system generated or custom)' },
      { name: 'original_name', type: 'string', required: true, description: 'Original filename as uploaded by user' },
      { name: 'file_path', type: 'string', required: true, description: 'Full file path or URL where file is stored' },
      { name: 'file_type', type: 'string', required: false, description: 'MIME type or file extension (e.g., application/pdf, image/png, application/msword)' },
      { name: 'size', type: 'integer', required: false, description: 'File size in bytes' },
      // Metadata
      { name: 'notes', type: 'string', required: false, description: 'Notes or description about the document' },
      // System Fields
      { name: 'uploaded_by', type: 'integer', required: false, description: 'User ID who uploaded the document' },
    ],
    example: `{
  "event": "lead_document_add",
  "source": "erp",
  "data": {
    "company_id": 1,
    "pre_lead_id": 123,
    "name": "contract_xyz_industries_2024_signed.pdf",
    "original_name": "XYZ Industries - Contract Agreement Signed.pdf",
    "file_path": "/uploads/leads/789/documents/contract_xyz_industries_2024_signed.pdf",
    "file_type": "application/pdf",
    "size": 1048576,
    "notes": "Signed contract agreement - 3 year enterprise license with premium support package.",
    "uploaded_by": 5
  }
}`,
    response: `{
  "status": "success",
  "message": "Document added successfully",
  "data": {
    "document_id": 606,
    "lead_id": 789,
    "name": "contract_xyz_industries_2024_signed.pdf",
    "original_name": "XYZ Industries - Contract Agreement Signed.pdf",
    "file_path": "/uploads/leads/789/documents/contract_xyz_industries_2024_signed.pdf",
    "file_type": "application/pdf",
    "size": 1048576
  }
}`
  },
  {
    id: 'lead-document-update',
    title: 'Update Lead Document',
    method: 'POST',
    endpoint: '/api/v1/webhooks/incoming/lead/{lead_id}/document/{document_id}/update',
    event: 'lead_document_update',
    description: 'Updates an existing document attached to a lead with all updatable fields',
    laravelMethod: 'updateLeadDocument',
    hasPathParam: true,
    paramName: 'leadId',
    fields: [
      // Tracking Fields
      { name: 'company_id', type: 'integer', required: false, description: 'Company ID to track data for specific customers' },
      { name: 'pre_lead_id', type: 'integer', required: false, description: 'Pre-lead ID to track origin data' },
      // File Details (all optional for update)
      { name: 'name', type: 'string', required: false, description: 'Stored filename' },
      { name: 'original_name', type: 'string', required: false, description: 'Original filename' },
      { name: 'file_path', type: 'string', required: false, description: 'File path or URL where file is stored' },
      { name: 'file_type', type: 'string', required: false, description: 'MIME type or file extension' },
      { name: 'size', type: 'integer', required: false, description: 'File size in bytes' },
      // Metadata
      { name: 'notes', type: 'string', required: false, description: 'Notes or description about the document' },
      // System Fields
      { name: 'uploaded_by', type: 'integer', required: false, description: 'User ID who uploaded the document' },
    ],
    example: `{
  "event": "lead_document_update",
  "source": "erp",
  "data": {
    "notes": "Updated contract - Version 2 with revised payment terms. Approved by legal.",
    "file_type": "application/pdf",
    "size": 2097152
  }
}`,
    response: `{
  "status": "success",
  "message": "Document updated successfully",
  "data": {
    "document_id": 606,
    "lead_id": 789,
    "name": "contract_xyz_industries_2024_signed.pdf",
    "original_name": "XYZ Industries - Contract Agreement Signed.pdf",
    "file_path": "/uploads/leads/789/documents/contract_xyz_industries_2024_signed.pdf",
    "file_type": "application/pdf",
    "size": 2097152,
    "notes": "Updated contract - Version 2 with revised payment terms. Approved by legal."
  }
}`
  },
  {
    id: 'lead-document-delete',
    title: 'Delete Lead Document',
    method: 'POST',
    endpoint: '/api/v1/webhooks/incoming/lead/{lead_id}/document/{document_id}/delete',
    event: 'lead_document_delete',
    description: 'Deletes a document from a lead',
    laravelMethod: 'deleteLeadDocument',
    hasPathParam: true,
    paramName: 'leadId',
    fields: [
      { name: 'reason', type: 'string', required: false, description: 'Reason for deleting the document' },
    ],
    example: `{
  "event": "lead_document_delete",
  "source": "erp",
  "data": {
    "reason": "Duplicate document - superseded by newer version"
  }
}`,
    response: `{
  "status": "success",
  "message": "Document deleted successfully",
  "data": {
    "document_id": 606,
    "name": "contract_xyz_industries_2024_old.pdf",
    "original_name": "XYZ Industries - Contract Agreement Old.pdf"
  }
}`
  },
  {
    id: 'lead-get-by-company',
    title: 'Get All Leads by Company',
    method: 'GET',
    endpoint: '/api/v1/leads/by-company/{company_id}',
    event: 'get_leads_by_company',
    description: 'Retrieves all leads that share the same company_id. Useful for tracking leads across the same customer/company with pagination and filtering.',
    laravelMethod: 'getLeadsByCompany',
    hasPathParam: true,
    paramName: 'companyId',
    fields: [
      // Path Parameter
      { name: 'company_id', type: 'integer', required: true, description: 'Company ID to filter leads by (path parameter)' },
      // Query Parameters
      { name: 'page', type: 'integer', required: false, description: 'Page number (default: 1)' },
      { name: 'page_size', type: 'integer', required: false, description: 'Items per page (default: 20, max: 100)' },
      { name: 'search', type: 'string', required: false, description: 'Search in first_name, last_name, email, phone, company_name' },
      { name: 'status', type: 'integer', required: false, description: 'Filter by status: 0 = active, 1 = discarded' },
      { name: 'lead_status', type: 'string', required: false, description: 'Filter by lead_status: new, contacted, qualified, proposal_sent, negotiation, won, lost' },
      { name: 'source', type: 'string', required: false, description: 'Filter by source: pre_lead, direct, website, referral, social_media, cold_call, walk_in, whatsapp, email, erp, other' },
      { name: 'priority', type: 'string', required: false, description: 'Filter by priority: low, medium, high, critical' },
    ],
    example: `// GET Request - No body required
// URL: /api/v1/leads/by-company/1?page=1&page_size=20&status=0&lead_status=qualified

// Query Parameters:
{
  "company_id": 1,
  "page": 1,
  "page_size": 20,
  "search": "john",
  "status": 0,
  "lead_status": "qualified",
  "source": "website",
  "priority": "high"
}`,
    response: `{
  "items": [
    {
      "id": 789,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "company_name": "ABC Corporation",
      "company_id": 1,
      "source": "pre_lead",
      "priority": "high",
      "lead_status": "qualified",
      "status": 0,
      "expected_value": 50000.00,
      "is_converted": false,
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": 790,
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane.smith@example.com",
      "phone": "+1234567891",
      "company_name": "ABC Corporation",
      "company_id": 1,
      "source": "referral",
      "priority": "medium",
      "lead_status": "negotiation",
      "status": 0,
      "expected_value": 75000.00,
      "is_converted": false,
      "created_at": "2024-01-16T09:00:00Z"
    }
  ],
  "total": 15,
  "page": 1,
  "page_size": 20,
  "total_pages": 1
}`
  },
];

interface APIDocCardProps {
  api: typeof preLeadAPIs[0];
  isExpanded: boolean;
  onToggle: () => void;
}

function APIDocCard({ api, isExpanded, onToggle }: APIDocCardProps) {
  const [copied, setCopied] = useState(false);
  const [codeTab, setCodeTab] = useState<'json' | 'curl' | 'laravel'>('json');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const curlExample = generateCurlExample(api.endpoint, api.example, api.hasPathParam, api.method);
  const laravelExample = generateLaravelExample(api.endpoint, api.example, api.laravelMethod, api.hasPathParam, api.paramName, api.method);

  const getCodeContent = () => {
    switch (codeTab) {
      case 'curl':
        return curlExample;
      case 'laravel':
        return laravelExample;
      default:
        return api.example;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 text-xs font-bold rounded ${
            api.method === 'GET'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {api.method}
          </span>
          <span className="font-medium text-gray-900">{api.title}</span>
          <code className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded hidden md:inline">
            {api.event}
          </code>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-gray-200 space-y-4">
          {/* Endpoint */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Endpoint</p>
            <code className="text-sm bg-gray-100 px-3 py-1.5 rounded font-mono block">
              {api.method} {API_BASE_URL}{api.endpoint}
            </code>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm text-gray-600">{api.description}</p>
          </div>

          {/* Fields Table */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Payload Fields</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Field</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Type</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Required</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {api.fields.map((field) => (
                    <tr key={field.name}>
                      <td className="px-3 py-2">
                        <code className="text-xs bg-gray-100 px-1 rounded">{field.name}</code>
                      </td>
                      <td className="px-3 py-2 text-gray-600">{field.type}</td>
                      <td className="px-3 py-2">
                        {field.required ? (
                          <span className="text-red-600 text-xs font-medium">Required</span>
                        ) : (
                          <span className="text-gray-400 text-xs">Optional</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-600">{field.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Code Examples with Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCodeTab('json')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-t border-b-2 transition-colors ${
                    codeTab === 'json'
                      ? 'bg-gray-900 text-white border-blue-500'
                      : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200'
                  }`}
                >
                  <Code className="w-3 h-3 inline mr-1" />
                  JSON
                </button>
                <button
                  onClick={() => setCodeTab('curl')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-t border-b-2 transition-colors ${
                    codeTab === 'curl'
                      ? 'bg-gray-900 text-white border-blue-500'
                      : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200'
                  }`}
                >
                  <Terminal className="w-3 h-3 inline mr-1" />
                  cURL
                </button>
                <button
                  onClick={() => setCodeTab('laravel')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-t border-b-2 transition-colors ${
                    codeTab === 'laravel'
                      ? 'bg-gray-900 text-white border-blue-500'
                      : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.642 5.43a.364.364 0 01.014.1v5.149c0 .135-.073.26-.189.326l-4.323 2.49v4.934a.378.378 0 01-.188.326L9.93 23.949a.316.316 0 01-.066.027c-.008.002-.016.008-.024.01a.348.348 0 01-.192 0c-.011-.002-.02-.008-.03-.012a.265.265 0 01-.06-.023L.533 18.755a.376.376 0 01-.189-.326V2.974c0-.033.005-.066.014-.098.003-.012.01-.02.014-.032a.369.369 0 01.023-.058c.004-.013.015-.022.023-.033l.033-.045c.012-.01.025-.018.037-.027.014-.012.027-.024.041-.034h.001L5.044.05a.375.375 0 01.378 0L9.936 2.647h.002c.015.01.027.021.04.033l.038.027c.013.014.02.03.033.045.008.011.02.021.025.033.01.02.017.038.024.058.003.011.01.021.013.032.01.031.014.064.014.098v9.652l3.76-2.164V5.527c0-.033.004-.066.013-.098.003-.01.01-.02.013-.032a.487.487 0 01.024-.059c.007-.012.018-.02.025-.033.012-.015.021-.03.033-.043.012-.012.025-.02.037-.028.014-.01.026-.023.041-.032h.001l4.513-2.598a.375.375 0 01.378 0l4.513 2.598c.016.01.027.021.042.031.012.01.025.018.036.028.013.014.022.03.034.044.008.012.019.021.024.033.011.02.018.04.024.06.006.01.012.021.015.032zm-.74 5.032V6.179l-1.578.908-2.182 1.256v4.283zm-4.514 7.75v-4.287l-2.147 1.225-6.126 3.498v4.325zM1.094 3.622v14.588l8.273 4.761v-4.325l-4.322-2.445-.002-.003-.002-.002c-.014-.01-.025-.021-.04-.031-.012-.012-.025-.02-.035-.03l-.001-.001c-.013-.016-.023-.034-.033-.05-.01-.014-.018-.025-.023-.038l-.001-.001c-.009-.018-.015-.04-.02-.061-.004-.016-.01-.03-.01-.048v-.001-.001-9.903l-2.182-1.256zM5.233.749L1.47 2.915l3.76 2.164 3.76-2.163zm2.194 13.29l2.181-1.256V3.622l-1.58.91-2.18 1.255v9.16zm11.581-10.3l-3.76 2.163 3.76 2.163 3.759-2.164zm-.376 4.975L16.45 7.457l-1.58-.91v4.283l2.182 1.256 1.58.908zm-8.65 9.654l5.514-3.148 2.756-1.572-3.757-2.163-4.323 2.489-3.941 2.27z"/>
                  </svg>
                  Laravel
                </button>
              </div>
              <button
                onClick={() => copyToClipboard(getCodeContent())}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className={`text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto font-mono ${codeTab === 'laravel' ? 'max-h-96' : ''}`}>
              {getCodeContent()}
            </pre>
          </div>

          {/* Response */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Response</p>
            <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto font-mono">
              {api.response}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WebhooksPage() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<'logs' | 'docs'>('docs');
  const [apiType, setApiType] = useState<'prelead' | 'lead'>('prelead');
  const [expandedAPIs, setExpandedAPIs] = useState<string[]>(['pre-lead-create', 'lead-create']);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.getWebhookLogs({ page });
      setLogs(response.items);
      setTotalPages(response.total_pages);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to fetch webhook logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const toggleAPI = (id: string) => {
    setExpandedAPIs((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const expandAll = () => {
    const allIds = apiType === 'prelead'
      ? preLeadAPIs.map((a) => a.id)
      : leadAPIs.map((a) => a.id);
    setExpandedAPIs(allIds);
  };

  const collapseAll = () => {
    setExpandedAPIs([]);
  };

  const getStatusBadge = (isSuccessful: boolean) => {
    if (isSuccessful) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle className="w-3 h-3" />
          Success
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
        <XCircle className="w-3 h-3" />
        Failed
      </span>
    );
  };

  const getDirectionIcon = (direction: string) => {
    if (direction === 'incoming') {
      return <ArrowDownLeft className="w-4 h-4 text-blue-500" />;
    }
    return <ArrowUpRight className="w-4 h-4 text-purple-500" />;
  };

  const currentAPIs = apiType === 'prelead' ? preLeadAPIs : leadAPIs;

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Webhook API Documentation</h1>
              <p className="text-sm text-gray-500">Complete API reference with JSON, cURL, and Laravel examples</p>
            </div>
          </div>
          <Button variant="secondary" onClick={fetchLogs} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'docs'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Code className="w-4 h-4 inline mr-2" />
            API Documentation
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'logs'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 inline mr-2" />
            Activity Logs ({total})
          </button>
        </div>

        {activeTab === 'docs' ? (
          <div className="space-y-4">
            {/* API Type Selector & Actions */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setApiType('prelead')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    apiType === 'prelead'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Pre-Lead APIs ({preLeadAPIs.length})
                </button>
                <button
                  onClick={() => setApiType('lead')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    apiType === 'lead'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Lead APIs ({leadAPIs.length})
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={expandAll}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAll}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* Base URL Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Base URL</span>
              </div>
              <code className="text-sm bg-white px-3 py-1.5 rounded font-mono border border-blue-200">
                {API_BASE_URL}
              </code>
              <p className="text-xs text-blue-700 mt-2">
                All webhook endpoints accept POST requests with JSON body. Include <code className="bg-white px-1 rounded">Content-Type: application/json</code> header.
              </p>
            </div>

            {/* Code Format Info */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Code Examples Available</span>
              </div>
              <p className="text-xs text-purple-700">
                Each API endpoint includes examples in <strong>JSON</strong>, <strong>cURL</strong>, and <strong>Laravel PHP</strong> formats.
                Click the tabs above the code block to switch between formats.
              </p>
            </div>

            {/* API List */}
            <div className="space-y-3">
              {currentAPIs.map((apiDoc) => (
                <APIDocCard
                  key={apiDoc.id}
                  api={apiDoc}
                  isExpanded={expandedAPIs.includes(apiDoc.id)}
                  onToggle={() => toggleAPI(apiDoc.id)}
                />
              ))}
            </div>

            {/* Complete Laravel Service Class */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.642 5.43a.364.364 0 01.014.1v5.149c0 .135-.073.26-.189.326l-4.323 2.49v4.934a.378.378 0 01-.188.326L9.93 23.949a.316.316 0 01-.066.027c-.008.002-.016.008-.024.01a.348.348 0 01-.192 0c-.011-.002-.02-.008-.03-.012a.265.265 0 01-.06-.023L.533 18.755a.376.376 0 01-.189-.326V2.974c0-.033.005-.066.014-.098.003-.012.01-.02.014-.032a.369.369 0 01.023-.058c.004-.013.015-.022.023-.033l.033-.045c.012-.01.025-.018.037-.027.014-.012.027-.024.041-.034h.001L5.044.05a.375.375 0 01.378 0L9.936 2.647h.002c.015.01.027.021.04.033l.038.027c.013.014.02.03.033.045.008.011.02.021.025.033.01.02.017.038.024.058.003.011.01.021.013.032.01.031.014.064.014.098v9.652l3.76-2.164V5.527c0-.033.004-.066.013-.098.003-.01.01-.02.013-.032a.487.487 0 01.024-.059c.007-.012.018-.02.025-.033.012-.015.021-.03.033-.043.012-.012.025-.02.037-.028.014-.01.026-.023.041-.032h.001l4.513-2.598a.375.375 0 01.378 0l4.513 2.598c.016.01.027.021.042.031.012.01.025.018.036.028.013.014.022.03.034.044.008.012.019.021.024.033.011.02.018.04.024.06.006.01.012.021.015.032zm-.74 5.032V6.179l-1.578.908-2.182 1.256v4.283zm-4.514 7.75v-4.287l-2.147 1.225-6.126 3.498v4.325zM1.094 3.622v14.588l8.273 4.761v-4.325l-4.322-2.445-.002-.003-.002-.002c-.014-.01-.025-.021-.04-.031-.012-.012-.025-.02-.035-.03l-.001-.001c-.013-.016-.023-.034-.033-.05-.01-.014-.018-.025-.023-.038l-.001-.001c-.009-.018-.015-.04-.02-.061-.004-.016-.01-.03-.01-.048v-.001-.001-9.903l-2.182-1.256zM5.233.749L1.47 2.915l3.76 2.164 3.76-2.163zm2.194 13.29l2.181-1.256V3.622l-1.58.91-2.18 1.255v9.16zm11.581-10.3l-3.76 2.163 3.76 2.163 3.759-2.164zm-.376 4.975L16.45 7.457l-1.58-.91v4.283l2.182 1.256 1.58.908zm-8.65 9.654l5.514-3.148 2.756-1.572-3.757-2.163-4.323 2.489-3.941 2.27z"/>
                </svg>
                <h3 className="text-sm font-semibold text-gray-700">Complete Laravel Service Class</h3>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-3">
                  Copy this complete Laravel service class to use all webhook APIs in your Laravel application.
                </p>
                <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto font-mono max-h-96">
{`<?php
// app/Services/CrmWebhookService.php

namespace App\\Services;

use Illuminate\\Support\\Facades\\Http;
use Illuminate\\Support\\Facades\\Log;

class CrmWebhookService
{
    protected string $baseUrl;
    protected string $secretKey;
    protected int $timeout;

    public function __construct()
    {
        $this->baseUrl = config('services.crm.base_url', '${API_BASE_URL}');
        $this->secretKey = config('services.crm.secret_key', 'your-secret-key');
        $this->timeout = config('services.crm.timeout', 30);
    }

    protected function generateSignature(array $payload): string
    {
        return hash_hmac('sha256', json_encode($payload), $this->secretKey);
    }

    protected function sendRequest(string $endpoint, array $payload): array
    {
        $url = $this->baseUrl . $endpoint;
        $signature = $this->generateSignature($payload);

        try {
            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'X-Webhook-Signature' => $signature,
                    'X-Source-System' => 'laravel-erp',
                ])
                ->post($url, $payload);

            return [
                'success' => $response->successful(),
                'status_code' => $response->status(),
                'data' => $response->json(),
            ];
        } catch (\\Exception $e) {
            Log::error("CRM Webhook Error: {$endpoint}", ['error' => $e->getMessage()]);
            return ['success' => false, 'status_code' => 500, 'data' => ['error' => $e->getMessage()]];
        }
    }

    // ==================== PRE-LEAD APIs ====================

    public function createPreLead(array $data): array
    {
        return $this->sendRequest('/api/v1/webhooks/incoming/pre-lead/create', [
            'event' => 'new_inquiry',
            'source' => 'laravel',
            'timestamp' => now()->toIso8601String(),
            'data' => $data,
        ]);
    }

    public function updatePreLead(int $preLeadId, array $data): array
    {
        return $this->sendRequest("/api/v1/webhooks/incoming/pre-lead/{$preLeadId}/update", [
            'event' => 'pre_lead_update',
            'source' => 'laravel',
            'timestamp' => now()->toIso8601String(),
            'data' => $data,
        ]);
    }

    public function discardPreLead(int $preLeadId, ?string $reason = null): array
    {
        return $this->sendRequest("/api/v1/webhooks/incoming/pre-lead/{$preLeadId}/discard", [
            'event' => 'pre_lead_discard',
            'source' => 'laravel',
            'timestamp' => now()->toIso8601String(),
            'data' => ['reason' => $reason],
        ]);
    }

    public function addPreLeadContact(int $preLeadId, array $contact): array
    {
        return $this->sendRequest("/api/v1/webhooks/incoming/pre-lead/{$preLeadId}/contact/add", [
            'event' => 'pre_lead_contact_add',
            'source' => 'laravel',
            'timestamp' => now()->toIso8601String(),
            'data' => $contact,
        ]);
    }

    public function addPreLeadMemo(int $preLeadId, array $memo): array
    {
        return $this->sendRequest("/api/v1/webhooks/incoming/pre-lead/{$preLeadId}/memo/add", [
            'event' => 'pre_lead_memo_add',
            'source' => 'laravel',
            'timestamp' => now()->toIso8601String(),
            'data' => $memo,
        ]);
    }

    public function updatePreLeadStatus(int $preLeadId, string $status, ?string $remarks = null): array
    {
        return $this->sendRequest("/api/v1/webhooks/incoming/pre-lead/{$preLeadId}/status/update", [
            'event' => 'pre_lead_status_update',
            'source' => 'laravel',
            'timestamp' => now()->toIso8601String(),
            'data' => ['lead_status' => $status, 'remarks' => $remarks],
        ]);
    }

    public function updatePreLeadCompanyProfile(int $preLeadId, array $profile): array
    {
        return $this->sendRequest("/api/v1/webhooks/incoming/pre-lead/{$preLeadId}/company-profile/update", [
            'event' => 'pre_lead_company_profile_update',
            'source' => 'laravel',
            'timestamp' => now()->toIso8601String(),
            'data' => $profile,
        ]);
    }

    public function convertPreLeadToLead(int $preLeadId, array $options = []): array
    {
        return $this->sendRequest("/api/v1/webhooks/incoming/pre-lead/{$preLeadId}/convert", [
            'event' => 'pre_lead_convert',
            'source' => 'laravel',
            'timestamp' => now()->toIso8601String(),
            'data' => $options,
        ]);
    }

    // ==================== LEAD APIs ====================

    public function createLead(array $data): array
    {
        return $this->sendRequest('/api/v1/webhooks/incoming/lead/create', [
            'event' => 'new_lead',
            'source' => 'laravel',
            'timestamp' => now()->toIso8601String(),
            'data' => $data,
        ]);
    }

    public function updateLead(int $leadId, array $data): array
    {
        return $this->sendRequest("/api/v1/webhooks/incoming/lead/{$leadId}/update", [
            'event' => 'lead_update',
            'source' => 'laravel',
            'timestamp' => now()->toIso8601String(),
            'data' => $data,
        ]);
    }

    public function discardLead(int $leadId, ?string $reason = null, ?string $lossReason = null): array
    {
        return $this->sendRequest("/api/v1/webhooks/incoming/lead/{$leadId}/discard", [
            'event' => 'lead_discard',
            'source' => 'laravel',
            'timestamp' => now()->toIso8601String(),
            'data' => ['reason' => $reason, 'loss_reason' => $lossReason],
        ]);
    }

    public function addLeadContact(int $leadId, array $contact): array
    {
        return $this->sendRequest("/api/v1/webhooks/incoming/lead/{$leadId}/contact/add", [
            'event' => 'lead_contact_add',
            'source' => 'laravel',
            'timestamp' => now()->toIso8601String(),
            'data' => $contact,
        ]);
    }

    public function addLeadActivity(int $leadId, array $activity): array
    {
        return $this->sendRequest("/api/v1/webhooks/incoming/lead/{$leadId}/activity/add", [
            'event' => 'lead_activity_add',
            'source' => 'laravel',
            'timestamp' => now()->toIso8601String(),
            'data' => $activity,
        ]);
    }

    public function updateLeadQualifiedProfile(int $leadId, array $profile): array
    {
        return $this->sendRequest("/api/v1/webhooks/incoming/lead/{$leadId}/qualified-profile/update", [
            'event' => 'lead_qualified_profile_update',
            'source' => 'laravel',
            'timestamp' => now()->toIso8601String(),
            'data' => $profile,
        ]);
    }

    public function addLeadMemo(int $leadId, array $memo): array
    {
        return $this->sendRequest("/api/v1/webhooks/incoming/lead/{$leadId}/memo/add", [
            'event' => 'lead_memo_add',
            'source' => 'laravel',
            'timestamp' => now()->toIso8601String(),
            'data' => $memo,
        ]);
    }

    public function updateLeadStatus(int $leadId, string $status, ?string $remarks = null): array
    {
        return $this->sendRequest("/api/v1/webhooks/incoming/lead/{$leadId}/status/update", [
            'event' => 'lead_status_update',
            'source' => 'laravel',
            'timestamp' => now()->toIso8601String(),
            'data' => ['lead_status' => $status, 'remarks' => $remarks],
        ]);
    }

    public function convertLeadToCustomer(int $leadId, array $customerData = []): array
    {
        return $this->sendRequest("/api/v1/webhooks/incoming/lead/{$leadId}/convert", [
            'event' => 'lead_convert',
            'source' => 'laravel',
            'timestamp' => now()->toIso8601String(),
            'data' => $customerData,
        ]);
    }

    public function uploadLeadDocument(int $leadId, array $document): array
    {
        return $this->sendRequest("/api/v1/webhooks/incoming/lead/{$leadId}/document/upload", [
            'event' => 'lead_document_upload',
            'source' => 'laravel',
            'timestamp' => now()->toIso8601String(),
            'data' => $document,
        ]);
    }
}

// ==================== USAGE EXAMPLES ====================

// In your Controller or Service:
$crmService = app(CrmWebhookService::class);

// ========== PRE-LEAD EXAMPLES ==========

// Create a pre-lead with all database fields
$result = $crmService->createPreLead([
    // Basic Information
    'first_name' => 'John',
    'last_name' => 'Doe',
    'email' => 'john@example.com',
    'phone' => '+1234567890',
    'alternate_phone' => '+1234567800',
    // Company Information
    'company_name' => 'ABC Corporation Ltd.',
    'designation' => 'Chief Executive Officer',
    'website' => 'https://www.abccorp.com',
    // Lead Details
    'source' => 'website',
    'source_details' => 'Contact form submission',
    'status' => 0,
    'discard_reason' => null,
    // Interest & Requirements
    'product_interest' => 'Enterprise CRM Suite',
    'requirements' => 'Need full CRM implementation with ERP integration',
    'budget_range' => '$50,000 - $100,000',
    // Location
    'city' => 'New York',
    'state' => 'New York',
    'country' => 'USA',
    // Address Details
    'address_line1' => '123 Business Avenue',
    'address_line2' => 'Floor 15, Suite 1501',
    'zip_code' => '10001',
    'city_id' => 1,
    'state_id' => 33,
    'country_id' => 1,
    // Contact Details
    'phone_no' => '+1-212-555-0100',
    'fax' => '+1-212-555-0101',
    'nof_representative' => 'Michael Johnson',
    'memo' => 'Key decision maker, prefers email communication',
    // Business Details
    'group_id' => 5,
    'lead_status' => 'new',
    'industry_id' => 10,
    'region_id' => 3,
    'office_timings' => '9:00 AM - 6:00 PM EST',
    'timezone' => 'America/New_York',
    'lead_source' => 'Website Form',
    'sales_rep' => 8,
    'lead_since' => '2024-01-15',
    'lead_score' => 'B+',
    // Notes
    'notes' => 'Interested in demo next week',
    'remarks' => 'Initial inquiry from website',
    // Assignment
    'assigned_to' => 5,
    // System Fields
    'company_id' => 1,
    'createdby' => 1,
    'updatedby' => 1,
]);

// Update pre-lead with all company details fields
$crmService->updatePreLead(123, [
    // Basic Information
    'first_name' => 'John',
    'last_name' => 'Doe Updated',
    'email' => 'john.updated@example.com',
    'phone' => '+1234567899',
    'alternate_phone' => '+1234567800',
    // Company Information
    'company_name' => 'ABC Corporation Ltd.',
    'designation' => 'Chief Executive Officer',
    'website' => 'https://www.abccorp.com',
    // Lead Details
    'source' => 'referral',
    'source_details' => 'Referred by XYZ Company',
    'status' => 0,
    'discard_reason' => null,
    // Interest & Requirements
    'product_interest' => 'Enterprise CRM Suite',
    'requirements' => 'Need full CRM implementation with ERP integration',
    'budget_range' => '$50,000 - $100,000',
    // Location
    'city' => 'New York',
    'state' => 'New York',
    'country' => 'USA',
    // Address Details
    'address_line1' => '123 Business Avenue',
    'address_line2' => 'Floor 15, Suite 1501',
    'zip_code' => '10001',
    'city_id' => 1,
    'state_id' => 33,
    'country_id' => 1,
    // Contact Details
    'phone_no' => '+1-212-555-0100',
    'fax' => '+1-212-555-0101',
    'nof_representative' => 'Michael Johnson',
    'memo' => 'Key decision maker, prefers email communication',
    // Business Details
    'group_id' => 5,
    'lead_status' => 'qualified',
    'industry_id' => 10,
    'region_id' => 3,
    'office_timings' => '9:00 AM - 6:00 PM EST',
    'timezone' => 'America/New_York',
    'lead_source' => 'Partner Referral',
    'sales_rep' => 8,
    'lead_since' => '2024-01-01',
    'lead_score' => 'A+',
    // Notes
    'notes' => 'High priority prospect with confirmed budget',
    'remarks' => 'Schedule demo for next week',
    // Assignment
    'assigned_to' => 5,
    // System Fields
    'company_id' => 1,
    'createdby' => 1,
    'updatedby' => 2,
]);

// Discard pre-lead
$crmService->discardPreLead(123, 'Not interested - budget constraints');

// Add contact to pre-lead with all database fields
$crmService->addPreLeadContact(123, [
    // Tracking Fields
    'company_id' => 1,
    'lead_id' => 456,
    // Contact Type
    'contact_type' => 'decision_maker',
    // Basic Information
    'title' => 'Mr.',
    'first_name' => 'Jane',
    'last_name' => 'Smith',
    'designation' => 'Procurement Manager',
    // Contact Details
    'work_email' => 'jane.smith@abccorp.com',
    'personal_email' => 'jane.smith@gmail.com',
    'work_phone' => '+1-212-555-0102',
    'ext' => '205',
    'fax' => '+1-212-555-0103',
    'cell_phone' => '+1-212-555-0104',
    'home_phone' => '+1-212-555-0105',
    // Social Media Links
    'linkedin_url' => 'https://linkedin.com/in/janesmith',
    'facebook_url' => 'https://facebook.com/janesmith',
    'twitter_url' => 'https://twitter.com/janesmith',
    // Profile Image
    'image' => 'https://example.com/images/jane-smith.jpg',
    // Status
    'status' => 'active',
    // Notes
    'notes' => 'Primary decision maker for procurement',
    // System Fields
    'created_by' => 1,
    'updated_by' => 1,
]);

// Add memo to pre-lead with all database fields
$crmService->addPreLeadMemo(123, [
    // Tracking Fields
    'company_id' => 1,
    'lead_id' => 456,
    // Memo Details
    'details' => '<p><strong>Initial Call Summary</strong></p><p>Discussed requirements with John Doe on 2024-01-15.</p><ul><li>Client needs enterprise CRM solution</li><li>Budget confirmed: $50,000 - $100,000</li><li>Timeline: Q2 2024 implementation</li><li>Decision maker: CEO</li></ul><p>Next steps: Schedule product demo for next week.</p>',
    // System Fields
    'created_by' => 5,
    'updated_by' => 5,
]);

// Update pre-lead status
$crmService->updatePreLeadStatus(123, 'qualified',
    'Qualified after initial assessment - budget confirmed'
);

// Update pre-lead company profile with all database fields
$crmService->updatePreLeadCompanyProfile(123, [
    // Tracking Fields
    'company_id' => 1,
    'lead_id' => 456,
    // Contact Selection
    'contact_id' => 456,
    // Basic Info
    'company_name' => 'ABC Corporation Ltd.',
    'industry_id' => 10,
    // Contact Info
    'best_time_call' => '10:00 AM - 12:00 PM',
    'best_time_call_timezone' => 1,
    'mode' => 'Phone',
    // Contact Details
    'contact_name' => 'John Doe',
    'designation' => 'Chief Executive Officer',
    'phone' => '+1-212-555-0100',
    'email' => 'john.doe@abccorp.com',
    // Additional Information
    'need_type' => 1,
    'current_software' => 'SAP ERP',
    'need_summary' => 'Looking to upgrade their CRM system with better integration capabilities',
    'budget' => 3,
    'decision_maker' => 456,
    'time_frame' => 2,
    'qualified_by' => 5,
    // Rich Text Fields
    'company_profile' => '<p>ABC Corporation is a leading manufacturer with operations in 5 countries.</p>',
    'summary_of_discussion' => '<p>Discussed current pain points with existing CRM.</p>',
    'conclusion' => '<p>Strong prospect with confirmed budget. Recommended for demo.</p>',
    // Status
    'status' => 'submitted',
    // System Fields
    'created_by' => 1,
    'updated_by' => 5,
]);

// Convert pre-lead to lead with all fields including tracking
$crmService->convertPreLeadToLead(123, [
    // Tracking Fields
    'company_id' => 1,
    'lead_id' => 456,
    // Conversion Details
    'priority' => 'high',
    'assigned_to' => 5,
    'expected_value' => 50000.00,
    'notes' => 'High value prospect - qualified and ready for conversion',
    // Conversion Tracking
    'is_converted' => true,
    'converted_at' => '2024-01-15T10:30:00Z',
    'converted_by' => 5,
]);

// ========== LEAD EXAMPLES ==========

// Create lead with all company details database fields
$crmService->createLead([
    // Basic Information
    'first_name' => 'Robert',
    'last_name' => 'Johnson',
    'email' => 'robert@example.com',
    'phone' => '+1234567893',
    'alternate_phone' => '+1234567894',
    // Company Information
    'company_name' => 'XYZ Industries Inc.',
    'company_code' => 'XYZ-001',
    'designation' => 'Chief Technology Officer',
    'company_size' => '500-1000',
    'industry' => 'Manufacturing',
    'website' => 'https://www.xyzindustries.com',
    // Lead Details
    'source' => 'referral',
    'source_details' => 'Referred by ABC Corp',
    'status' => 0,
    'lead_status' => 'new',
    'priority' => 'high',
    // Pipeline Stage
    'pipeline_stage' => 1,
    // Financial
    'expected_value' => 100000.00,
    'actual_value' => null,
    'currency' => 'USD',
    // Products/Services
    'product_interest' => 'Enterprise CRM Suite',
    'requirements' => 'Full CRM implementation with ERP integration',
    // Timeline
    'expected_close_date' => '2024-03-15T00:00:00Z',
    'last_contacted' => null,
    'next_follow_up' => '2024-01-20T10:00:00Z',
    // Location
    'address' => '123 Industrial Park, Building A',
    'address_line1' => '123 Industrial Park',
    'address_line2' => 'Building A, Floor 5',
    'city' => 'Chicago',
    'city_id' => 25,
    'state' => 'Illinois',
    'state_id' => 14,
    'country' => 'USA',
    'country_id' => 1,
    'pincode' => '60601',
    'zip_code' => '60601',
    // Contact Fields
    'phone_no' => '+1-312-555-0100',
    'fax' => '+1-312-555-0101',
    'nof_representative' => 'Michael Brown',
    // Business Fields
    'memo' => 'New enterprise prospect',
    'group_id' => 3,
    'industry_id' => 15,
    'region_id' => 5,
    'office_timings' => '8:00 AM - 5:00 PM CST',
    'timezone' => 'America/Chicago',
    'lead_source' => 'Partner Referral',
    'lead_score' => 75,
    'sales_rep' => 'John Smith',
    'lead_since' => '2024-01-15T00:00:00Z',
    'remarks' => 'High potential enterprise client',
    // Notes
    'notes' => 'Referred by existing client ABC Corp',
    // Assignment
    'assigned_to' => 5,
    'team_id' => 2,
    // System Tracking
    'company_id' => 1,
    'createdby' => 1,
    'updatedby' => 1,
]);

// Update lead with all company details database fields
$crmService->updateLead(789, [
    // Basic Information
    'first_name' => 'Robert',
    'last_name' => 'Johnson Jr.',
    'email' => 'robert.johnson@xyzindustries.com',
    'phone' => '+1234567894',
    'alternate_phone' => '+1234567895',
    // Company Information
    'company_name' => 'XYZ Industries Inc.',
    'company_code' => 'XYZ-001',
    'designation' => 'Chief Technology Officer',
    'company_size' => '500-1000',
    'industry' => 'Manufacturing',
    'website' => 'https://www.xyzindustries.com',
    // Lead Details
    'source' => 'referral',
    'source_details' => 'Referred by ABC Corp',
    'status' => 0,
    'lead_status' => 'proposal_sent',
    'priority' => 'critical',
    // Pipeline Stage
    'pipeline_stage' => 4,
    // Financial
    'expected_value' => 150000.00,
    'actual_value' => 145000.00,
    'currency' => 'USD',
    // Products/Services
    'product_interest' => 'Enterprise CRM Suite',
    'requirements' => 'Full CRM implementation with ERP integration',
    // Timeline
    'expected_close_date' => '2024-03-15T00:00:00Z',
    'last_contacted' => '2024-01-10T14:30:00Z',
    'next_follow_up' => '2024-01-20T10:00:00Z',
    // Location
    'address' => '123 Industrial Park, Building A',
    'address_line1' => '123 Industrial Park',
    'address_line2' => 'Building A, Floor 5',
    'city' => 'Chicago',
    'city_id' => 25,
    'state' => 'Illinois',
    'state_id' => 14,
    'country' => 'USA',
    'country_id' => 1,
    'pincode' => '60601',
    'zip_code' => '60601',
    // Contact Fields
    'phone_no' => '+1-312-555-0100',
    'fax' => '+1-312-555-0101',
    'nof_representative' => 'Michael Brown',
    // Business Fields
    'memo' => 'Key strategic account',
    'group_id' => 3,
    'industry_id' => 15,
    'region_id' => 5,
    'office_timings' => '8:00 AM - 5:00 PM CST',
    'timezone' => 'America/Chicago',
    'lead_source' => 'Partner Referral',
    'lead_score' => 85,
    'sales_rep' => 'John Smith',
    'lead_since' => '2024-01-01T00:00:00Z',
    'remarks' => 'High potential enterprise client',
    // Notes
    'notes' => 'Decision expected by end of month',
    'loss_reason' => null,
    // Assignment
    'assigned_to' => 5,
    'team_id' => 2,
    // System Tracking
    'company_id' => 1,
    'createdby' => 1,
    'updatedby' => 5,
]);

// Discard lead
$crmService->discardLead(789,
    'Lost to competitor - chose alternative vendor',
    'Price too high compared to competitor offering'
);

// Add contact to lead with all database fields
$crmService->addLeadContact(789, [
    // Tracking Fields
    'company_id' => 1,
    'pre_lead_id' => 123,
    // Contact Type
    'contact_type' => 'decision_maker',
    // Basic Information
    'title' => 'Ms.',
    'first_name' => 'Sarah',
    'last_name' => 'Williams',
    'designation' => 'Chief Technology Officer',
    'department' => 'Technology',
    'is_primary' => true,
    // Contact Details
    'email' => 'sarah.williams@xyzindustries.com',
    'work_email' => 'sarah.williams@xyzindustries.com',
    'personal_email' => 'sarah.williams@gmail.com',
    'phone' => '+1-312-555-0200',
    'work_phone' => '+1-312-555-0201',
    'ext' => '301',
    'fax' => '+1-312-555-0202',
    'cell_phone' => '+1-312-555-0203',
    'home_phone' => '+1-312-555-0204',
    // Social Media Links
    'linkedin_url' => 'https://linkedin.com/in/sarahwilliams',
    'facebook_url' => 'https://facebook.com/sarahwilliams',
    'twitter_url' => 'https://twitter.com/sarahwilliams',
    // Profile Image
    'image' => 'https://example.com/images/sarah-williams.jpg',
    // Status
    'status' => 'active',
    // Notes
    'notes' => 'Key decision maker for technology purchases',
    // System Fields
    'created_by' => 5,
    'updated_by' => 5,
]);

// Add activity to lead with all database fields
$crmService->addLeadActivity(789, [
    // Tracking Fields
    'company_id' => 1,
    'pre_lead_id' => 123,
    // Activity Details
    'activity_type' => 'meeting',
    'subject' => 'Product Demo - Enterprise CRM Suite',
    'description' => 'Full product demonstration with technical team. Covered all modules including CRM, Sales, and Reporting. Attendees: John Doe (CEO), Sarah Williams (CTO), Michael Brown (IT Manager).',
    'outcome' => 'Positive feedback - client impressed with reporting capabilities. Requested proposal with pricing for 100 users.',
    // Dates
    'activity_date' => '2024-01-20',
    'due_date' => '2024-01-20',
    // Status
    'is_completed' => true,
    'completed_at' => '2024-01-20T16:30:00Z',
    // Related Contact
    'contact_id' => 101,
    // System Fields
    'created_by' => 5,
    'updated_by' => 5,
    'performed_by' => 5,
]);

// Update qualified profile with all database fields
$crmService->updateLeadQualifiedProfile(789, [
    // Tracking Fields
    'company_id' => 1,
    'pre_lead_id' => 123,
    // Profile Type
    'profile_type' => 'detailed',
    // Company Information
    'company_name' => 'XYZ Industries Inc.',
    'company_type' => 'Manufacturing',
    'industry_id' => 15,
    'annual_revenue' => '$10M-50M',
    'employee_count' => '100-500',
    // Decision Making
    'decision_maker' => 'CEO - Robert Johnson',
    'decision_process' => 'Committee decision involving CEO, CTO, and CFO',
    'budget' => '$150,000',
    'timeline' => 'Q2 2024',
    // Competitive Information
    'competitors' => 'Salesforce, HubSpot - currently evaluating both',
    'current_solution' => 'Spreadsheets and manual tracking',
    // Pain Points & Requirements
    'pain_points' => 'Manual processes, no real-time visibility, difficult reporting',
    'requirements' => 'Cloud-based, mobile access, custom reporting, API integration',
    // Notes
    'notes' => 'Strong candidate - has budget approval and urgent timeline',
    // System Fields
    'created_by' => 5,
    'updated_by' => 5,
]);

// Add memo to lead with all database fields
$crmService->addLeadMemo(789, [
    // Tracking Fields
    'company_id' => 1,
    'pre_lead_id' => 123,
    // Memo Details
    'memo_type' => 'meeting_notes',
    'title' => 'Product Demo Meeting Notes - January 20, 2024',
    'content' => '<p><strong>Attendees:</strong></p><ul><li>John Doe (CEO) - XYZ Industries</li><li>Sarah Williams (CTO) - XYZ Industries</li></ul><p><strong>Discussion Points:</strong></p><ol><li>Presented full CRM suite capabilities</li><li>Demonstrated reporting and analytics module</li></ol><p><strong>Next Steps:</strong></p><ul><li>Send detailed proposal by January 25</li><li>Schedule technical deep-dive with IT team</li></ul>',
    // System Fields
    'created_by' => 5,
    'updated_by' => 5,
]);

// Update lead status
$crmService->updateLeadStatus(789, 'negotiation',
    'Final pricing discussion - client requested 15% discount'
);

// Convert lead to customer with all fields
$crmService->convertLeadToCustomer(789, [
    'customer_code' => 'CUST-XYZ-001',
    'credit_limit' => 100000.00,
    'payment_terms' => 'Net 30',
    'notes' => 'VIP customer - premium support package included',
]);

// Upload document to lead with all database fields
$crmService->uploadLeadDocument(789, [
    // Tracking Fields
    'company_id' => 1,
    'pre_lead_id' => 123,
    // File Details
    'name' => 'proposal_xyz_industries_2024_v2.pdf',
    'original_name' => 'XYZ Industries - Sales Proposal Final.pdf',
    'file_path' => '/uploads/leads/789/documents/proposal_xyz_industries_2024_v2.pdf',
    'file_type' => 'application/pdf',
    'size' => 2548576,
    // Metadata
    'notes' => 'Final sales proposal with revised pricing - includes 15% discount as requested. Approved by sales manager.',
    // System Fields
    'uploaded_by' => 5,
]);`}
                </pre>
              </div>
            </div>

            {/* Environment Configuration */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b">
                <h3 className="text-sm font-semibold text-gray-700">Laravel Configuration</h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">.env file</p>
                  <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto font-mono">
{`CRM_BASE_URL=${API_BASE_URL}
CRM_SECRET_KEY=your-secret-key-here
CRM_TIMEOUT=30`}
                  </pre>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">config/services.php</p>
                  <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto font-mono">
{`<?php
return [
    // ... other services

    'crm' => [
        'base_url' => env('CRM_BASE_URL', '${API_BASE_URL}'),
        'secret_key' => env('CRM_SECRET_KEY', 'your-secret-key'),
        'timeout' => env('CRM_TIMEOUT', 30),
    ],
];`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Error Responses */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b">
                <h3 className="text-sm font-semibold text-gray-700">Error Responses</h3>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">400 Bad Request</p>
                  <pre className="text-xs bg-gray-100 p-2 rounded font-mono">{'{ "detail": "lead_status is required" }'}</pre>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">401 Unauthorized</p>
                  <pre className="text-xs bg-gray-100 p-2 rounded font-mono">{'{ "detail": "Invalid signature" }'}</pre>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">404 Not Found</p>
                  <pre className="text-xs bg-gray-100 p-2 rounded font-mono">{'{ "detail": "Lead not found" }'}</pre>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">500 Internal Server Error</p>
                  <pre className="text-xs bg-gray-100 p-2 rounded font-mono">{'{ "detail": "Error message description" }'}</pre>
                </div>
              </div>
            </div>

            {/* Authentication */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b">
                <h3 className="text-sm font-semibold text-gray-700">Authentication (Optional)</h3>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-3">
                  Webhooks support optional HMAC-SHA256 signature verification. Include the signature in the <code className="bg-gray-100 px-1 rounded">X-Webhook-Signature</code> header.
                </p>
                <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto font-mono">{`# Python example
import hmac
import hashlib

def generate_signature(payload: bytes, secret: str) -> str:
    return hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()

# Include in request header:
# X-Webhook-Signature: <signature>`}</pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Webhooks</p>
                <p className="text-2xl font-semibold text-gray-900">{total}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-500">Successful</p>
                <p className="text-2xl font-semibold text-green-600">
                  {logs.filter(l => l.is_successful).length}
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-500">Failed</p>
                <p className="text-2xl font-semibold text-red-600">
                  {logs.filter(l => !l.is_successful).length}
                </p>
              </div>
            </div>

            {/* Webhooks Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="text-sm font-semibold text-gray-700">Webhook Activity</h2>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-12">
                  <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No webhooks received yet</p>
                  <p className="text-sm text-gray-400 mt-1">Use the API documentation to send your first webhook</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Direction
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Entity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {getDirectionIcon(log.direction)}
                              <span className="text-sm text-gray-600 capitalize">{log.direction}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                              {log.event || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(log.is_successful)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {log.entity_type && log.entity_id
                              ? `${log.entity_type} #${log.entity_id}`
                              : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {formatDateTime(log.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setSelectedLog(log)}
                              className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 flex justify-between items-center bg-gray-50">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-500">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Log Detail Modal */}
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title="Webhook Details"
          size="lg"
        >
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Direction</p>
                  <div className="flex items-center gap-2">
                    {getDirectionIcon(selectedLog.direction)}
                    <span className="capitalize">{selectedLog.direction}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Event</p>
                  <p>{selectedLog.event || 'Unknown'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                  {getStatusBadge(selectedLog.is_successful)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Entity</p>
                  <p>
                    {selectedLog.entity_type && selectedLog.entity_id
                      ? `${selectedLog.entity_type} #${selectedLog.entity_id}`
                      : '-'}
                  </p>
                </div>
              </div>

              {selectedLog.error_message && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Error Message</p>
                  <p className="text-red-600 bg-red-50 p-2 rounded text-sm">
                    {selectedLog.error_message}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Received At</p>
                <p>{formatDateTime(selectedLog.created_at)}</p>
              </div>

              {selectedLog.request_payload && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Request Payload</p>
                  <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto font-mono max-h-64">
                    {JSON.stringify(selectedLog.request_payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
}
