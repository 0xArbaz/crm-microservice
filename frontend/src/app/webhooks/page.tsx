'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle, XCircle, Eye, Globe, ArrowDownLeft, ArrowUpRight, Copy, Check, Code } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import api from '@/lib/api';
import { WebhookLog } from '@/types';
import { formatDateTime } from '@/lib/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Pre-Lead Examples
const preLeadCurlExample = `curl -X POST "${API_BASE_URL}/api/v1/webhooks/incoming" \\
  -H "Content-Type: application/json" \\
  -d '{
    "event": "new_inquiry",
    "source": "website",
    "data": {
      "company_name": "ABC Corporation",
      "address_line1": "123 Business Street",
      "address_line2": "Suite 500",
      "city_id": 1,
      "state_id": 1,
      "country_id": 1,
      "zip_code": "400001",
      "phone_no": "+91-22-12345678",
      "fax": "+91-22-87654321",
      "website": "https://abccorp.com",
      "nof_representative": "John Smith",
      "phone": "+91-9876543210",
      "email": "contact@abccorp.com",
      "group_id": 1,
      "lead_status": "new",
      "industry_id": 1,
      "region_id": 1,
      "from_timings": "09:00",
      "to_timings": "18:00",
      "timezone": "Asia/Kolkata",
      "sales_rep": 1,
      "lead_source": "website",
      "lead_score": "hot",
      "remarks": "Interested in our services",
      "lead_since": "2026-01-27"
    }
  }'`;

const preLeadJavascriptExample = `// Using Fetch API
const sendPreLead = async () => {
  const response = await fetch('${API_BASE_URL}/api/v1/webhooks/incoming', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event: 'new_inquiry',
      source: 'website',
      data: {
        company_name: 'ABC Corporation',
        address_line1: '123 Business Street',
        address_line2: 'Suite 500',
        city_id: 1,
        state_id: 1,
        country_id: 1,
        zip_code: '400001',
        phone_no: '+91-22-12345678',
        fax: '+91-22-87654321',
        website: 'https://abccorp.com',
        nof_representative: 'John Smith',
        phone: '+91-9876543210',
        email: 'contact@abccorp.com',
        group_id: 1,
        lead_status: 'new',
        industry_id: 1,
        region_id: 1,
        from_timings: '09:00',
        to_timings: '18:00',
        timezone: 'Asia/Kolkata',
        sales_rep: 1,
        lead_source: 'website',
        lead_score: 'hot',
        remarks: 'Interested in our services',
        lead_since: '2026-01-27'
      }
    })
  });

  const result = await response.json();
  console.log('Pre-lead created:', result);
  return result;
};

// Using Axios
import axios from 'axios';

const sendPreLeadAxios = async () => {
  const { data } = await axios.post('${API_BASE_URL}/api/v1/webhooks/incoming', {
    event: 'new_inquiry',
    source: 'website',
    data: {
      company_name: 'ABC Corporation',
      email: 'contact@abccorp.com',
      phone: '+91-9876543210',
      // ... other fields
    }
  });
  return data;
};`;

const preLeadLaravelExample = `<?php

use Illuminate\\Support\\Facades\\Http;

class CRMWebhookService
{
    private string $baseUrl = '${API_BASE_URL}';

    /**
     * Send new pre-lead to CRM system
     */
    public function sendPreLead(array $leadData): array
    {
        $response = Http::post("{$this->baseUrl}/api/v1/webhooks/incoming", [
            'event' => 'new_inquiry',
            'source' => 'erp',
            'data' => [
                'company_name' => $leadData['company_name'],
                'address_line1' => $leadData['address'] ?? null,
                'address_line2' => $leadData['address2'] ?? null,
                'city_id' => $leadData['city_id'] ?? null,
                'state_id' => $leadData['state_id'] ?? null,
                'country_id' => $leadData['country_id'] ?? null,
                'zip_code' => $leadData['zip_code'] ?? null,
                'phone_no' => $leadData['phone'] ?? null,
                'fax' => $leadData['fax'] ?? null,
                'website' => $leadData['website'] ?? null,
                'nof_representative' => $leadData['representative'] ?? null,
                'phone' => $leadData['contact_phone'] ?? null,
                'email' => $leadData['email'] ?? null,
                'group_id' => $leadData['group_id'] ?? null,
                'lead_status' => $leadData['status'] ?? 'new',
                'industry_id' => $leadData['industry_id'] ?? null,
                'region_id' => $leadData['region_id'] ?? null,
                'from_timings' => $leadData['office_from'] ?? null,
                'to_timings' => $leadData['office_to'] ?? null,
                'timezone' => $leadData['timezone'] ?? 'Asia/Kolkata',
                'sales_rep' => $leadData['sales_rep_id'] ?? null,
                'lead_source' => $leadData['source'] ?? 'erp',
                'lead_score' => $leadData['score'] ?? null,
                'remarks' => $leadData['remarks'] ?? null,
                'lead_since' => $leadData['created_at'] ?? now()->format('Y-m-d'),
            ]
        ]);

        if ($response->successful()) {
            return $response->json();
        }

        throw new \\Exception('Failed to send pre-lead: ' . $response->body());
    }
}

// Usage in Controller
class InquiryController extends Controller
{
    public function store(Request $request, CRMWebhookService $crm)
    {
        $validated = $request->validate([
            'company_name' => 'required|string',
            'email' => 'required|email',
            'phone' => 'required|string',
        ]);

        // Save locally
        $inquiry = Inquiry::create($validated);

        // Send to CRM
        try {
            $result = $crm->sendPreLead($validated);
            $inquiry->update(['crm_id' => $result['result']['pre_lead_id']]);
        } catch (\\Exception $e) {
            Log::error('CRM sync failed: ' . $e->getMessage());
        }

        return response()->json($inquiry);
    }
}`;

// Lead Examples
const leadCurlExample = `curl -X POST "${API_BASE_URL}/api/v1/webhooks/incoming" \\
  -H "Content-Type: application/json" \\
  -d '{
    "event": "new_lead",
    "source": "website",
    "data": {
      "company_name": "XYZ Industries",
      "company_code": "XYZ-001",
      "first_name": "John",
      "last_name": "Doe",
      "address_line1": "456 Corporate Park",
      "address_line2": "Building A",
      "city": "Mumbai",
      "city_id": 1,
      "state": "Maharashtra",
      "state_id": 1,
      "country": "India",
      "country_id": 1,
      "zip_code": "400001",
      "phone_no": "+91-22-12345678",
      "phone": "+91-9876543210",
      "email": "john.doe@xyz.com",
      "fax": "+91-22-87654321",
      "website": "https://xyzindustries.com",
      "nof_representative": "Jane Smith",
      "group_id": 1,
      "industry": "Manufacturing",
      "industry_id": 1,
      "region_id": 1,
      "from_timings": "09:00",
      "to_timings": "18:00",
      "timezone": "Asia/Kolkata",
      "lead_source": "website",
      "lead_score": 85,
      "sales_rep": "John Manager",
      "priority": "high",
      "expected_value": 50000,
      "currency": "INR",
      "product_interest": "Industrial Equipment",
      "requirements": "Looking for heavy machinery",
      "remarks": "Highly interested prospect",
      "lead_since": "2026-01-28"
    }
  }'`;

const leadJavascriptExample = `// Using Fetch API
const sendLead = async () => {
  const response = await fetch('${API_BASE_URL}/api/v1/webhooks/incoming', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event: 'new_lead',
      source: 'website',
      data: {
        company_name: 'XYZ Industries',
        company_code: 'XYZ-001',
        first_name: 'John',
        last_name: 'Doe',
        address_line1: '456 Corporate Park',
        address_line2: 'Building A',
        city: 'Mumbai',
        city_id: 1,
        state: 'Maharashtra',
        state_id: 1,
        country: 'India',
        country_id: 1,
        zip_code: '400001',
        phone_no: '+91-22-12345678',
        phone: '+91-9876543210',
        email: 'john.doe@xyz.com',
        fax: '+91-22-87654321',
        website: 'https://xyzindustries.com',
        nof_representative: 'Jane Smith',
        group_id: 1,
        industry: 'Manufacturing',
        industry_id: 1,
        region_id: 1,
        from_timings: '09:00',
        to_timings: '18:00',
        timezone: 'Asia/Kolkata',
        lead_source: 'website',
        lead_score: 85,
        sales_rep: 'John Manager',
        priority: 'high',
        expected_value: 50000,
        currency: 'INR',
        product_interest: 'Industrial Equipment',
        requirements: 'Looking for heavy machinery',
        remarks: 'Highly interested prospect',
        lead_since: '2026-01-28'
      }
    })
  });

  const result = await response.json();
  console.log('Lead created:', result);
  return result;
};

// Using Axios
import axios from 'axios';

const sendLeadAxios = async () => {
  const { data } = await axios.post('${API_BASE_URL}/api/v1/webhooks/incoming', {
    event: 'new_lead',
    source: 'website',
    data: {
      company_name: 'XYZ Industries',
      first_name: 'John',
      email: 'john.doe@xyz.com',
      phone: '+91-9876543210',
      priority: 'high',
      expected_value: 50000,
      // ... other fields
    }
  });
  return data;
};`;

const leadLaravelExample = `<?php

use Illuminate\\Support\\Facades\\Http;

class CRMLeadService
{
    private string $baseUrl = '${API_BASE_URL}';

    /**
     * Send new lead to CRM system
     */
    public function sendLead(array $leadData): array
    {
        $response = Http::post("{$this->baseUrl}/api/v1/webhooks/incoming", [
            'event' => 'new_lead',
            'source' => 'erp',
            'data' => [
                'company_name' => $leadData['company_name'],
                'company_code' => $leadData['company_code'] ?? null,
                'first_name' => $leadData['first_name'],
                'last_name' => $leadData['last_name'] ?? null,
                'address_line1' => $leadData['address'] ?? null,
                'address_line2' => $leadData['address2'] ?? null,
                'city' => $leadData['city'] ?? null,
                'city_id' => $leadData['city_id'] ?? null,
                'state' => $leadData['state'] ?? null,
                'state_id' => $leadData['state_id'] ?? null,
                'country' => $leadData['country'] ?? 'India',
                'country_id' => $leadData['country_id'] ?? null,
                'zip_code' => $leadData['zip_code'] ?? null,
                'phone_no' => $leadData['phone'] ?? null,
                'phone' => $leadData['contact_phone'] ?? null,
                'email' => $leadData['email'] ?? null,
                'fax' => $leadData['fax'] ?? null,
                'website' => $leadData['website'] ?? null,
                'nof_representative' => $leadData['representative'] ?? null,
                'group_id' => $leadData['group_id'] ?? null,
                'industry' => $leadData['industry'] ?? null,
                'industry_id' => $leadData['industry_id'] ?? null,
                'region_id' => $leadData['region_id'] ?? null,
                'from_timings' => $leadData['office_from'] ?? null,
                'to_timings' => $leadData['office_to'] ?? null,
                'timezone' => $leadData['timezone'] ?? 'Asia/Kolkata',
                'lead_source' => $leadData['source'] ?? 'erp',
                'lead_score' => $leadData['score'] ?? null,
                'sales_rep' => $leadData['sales_rep'] ?? null,
                'priority' => $leadData['priority'] ?? 'medium',
                'expected_value' => $leadData['expected_value'] ?? null,
                'currency' => $leadData['currency'] ?? 'INR',
                'product_interest' => $leadData['product_interest'] ?? null,
                'requirements' => $leadData['requirements'] ?? null,
                'remarks' => $leadData['remarks'] ?? null,
                'lead_since' => $leadData['created_at'] ?? now()->format('Y-m-d'),
            ]
        ]);

        if ($response->successful()) {
            return $response->json();
        }

        throw new \\Exception('Failed to send lead: ' . $response->body());
    }
}

// Usage in Controller
class LeadController extends Controller
{
    public function store(Request $request, CRMLeadService $crm)
    {
        $validated = $request->validate([
            'company_name' => 'required|string',
            'first_name' => 'required|string',
            'email' => 'required|email',
            'phone' => 'required|string',
            'priority' => 'in:low,medium,high,critical',
        ]);

        // Save locally
        $lead = Lead::create($validated);

        // Send to CRM
        try {
            $result = $crm->sendLead($validated);
            $lead->update(['crm_id' => $result['result']['lead_id']]);
        } catch (\\Exception $e) {
            Log::error('CRM sync failed: ' . $e->getMessage());
        }

        return response()->json($lead);
    }
}`;

export default function WebhooksPage() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<'logs' | 'docs'>('docs');
  const [apiType, setApiType] = useState<'prelead' | 'lead'>('prelead');
  const [codeTab, setCodeTab] = useState<'curl' | 'javascript' | 'laravel'>('curl');
  const [copied, setCopied] = useState(false);

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCodeExample = () => {
    if (apiType === 'lead') {
      switch (codeTab) {
        case 'curl':
          return leadCurlExample;
        case 'javascript':
          return leadJavascriptExample;
        case 'laravel':
          return leadLaravelExample;
        default:
          return leadCurlExample;
      }
    } else {
      switch (codeTab) {
        case 'curl':
          return preLeadCurlExample;
        case 'javascript':
          return preLeadJavascriptExample;
        case 'laravel':
          return preLeadLaravelExample;
        default:
          return preLeadCurlExample;
      }
    }
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Webhooks</h1>
              <p className="text-sm text-gray-500">API integration and webhook activity</p>
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
            {/* API Type Selector */}
            <div className="flex gap-2">
              <button
                onClick={() => setApiType('prelead')}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  apiType === 'prelead'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Pre-Lead API
              </button>
              <button
                onClick={() => setApiType('lead')}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  apiType === 'lead'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Lead API
              </button>
            </div>

            {/* Endpoint Info Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Webhook Endpoint</p>
                  <code className="text-sm bg-gray-100 px-3 py-1.5 rounded font-mono">
                    POST {API_BASE_URL}/api/v1/webhooks/incoming
                  </code>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="text-sm text-gray-600">
                {apiType === 'prelead' ? (
                  <>
                    <p className="mb-2"><strong>Event:</strong> <code className="bg-gray-100 px-1 rounded">new_inquiry</code> - Creates a new pre-lead</p>
                    <p><strong>Source:</strong> <code className="bg-gray-100 px-1 rounded">website</code>, <code className="bg-gray-100 px-1 rounded">erp</code>, <code className="bg-gray-100 px-1 rounded">referral</code>, etc.</p>
                  </>
                ) : (
                  <>
                    <p className="mb-2"><strong>Event:</strong> <code className="bg-gray-100 px-1 rounded">new_lead</code> - Creates a new lead</p>
                    <p><strong>Source:</strong> <code className="bg-gray-100 px-1 rounded">website</code>, <code className="bg-gray-100 px-1 rounded">erp</code>, <code className="bg-gray-100 px-1 rounded">referral</code>, <code className="bg-gray-100 px-1 rounded">pre_lead</code>, etc.</p>
                  </>
                )}
              </div>
            </div>

            {/* Code Examples */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                <div className="flex gap-1">
                  <button
                    onClick={() => setCodeTab('curl')}
                    className={`px-3 py-1.5 text-sm font-medium rounded ${
                      codeTab === 'curl'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    cURL
                  </button>
                  <button
                    onClick={() => setCodeTab('javascript')}
                    className={`px-3 py-1.5 text-sm font-medium rounded ${
                      codeTab === 'javascript'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    JavaScript
                  </button>
                  <button
                    onClick={() => setCodeTab('laravel')}
                    className={`px-3 py-1.5 text-sm font-medium rounded ${
                      codeTab === 'laravel'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Laravel/PHP
                  </button>
                </div>
                <button
                  onClick={() => copyToClipboard(getCodeExample())}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="p-4 bg-gray-900 overflow-x-auto">
                <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap">
                  {getCodeExample()}
                </pre>
              </div>
            </div>

            {/* Available Fields */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b">
                <h3 className="text-sm font-semibold text-gray-700">Available Fields - {apiType === 'prelead' ? 'Pre-Lead' : 'Lead'}</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700 mb-2">Company Details</p>
                    <ul className="space-y-1 text-gray-600">
                      <li><code className="text-xs bg-gray-100 px-1 rounded">company_name</code></li>
                      {apiType === 'lead' && <li><code className="text-xs bg-gray-100 px-1 rounded">company_code</code></li>}
                      <li><code className="text-xs bg-gray-100 px-1 rounded">address_line1</code></li>
                      <li><code className="text-xs bg-gray-100 px-1 rounded">address_line2</code></li>
                      <li><code className="text-xs bg-gray-100 px-1 rounded">city</code> / <code className="text-xs bg-gray-100 px-1 rounded">city_id</code></li>
                      <li><code className="text-xs bg-gray-100 px-1 rounded">state</code> / <code className="text-xs bg-gray-100 px-1 rounded">state_id</code></li>
                      <li><code className="text-xs bg-gray-100 px-1 rounded">country</code> / <code className="text-xs bg-gray-100 px-1 rounded">country_id</code></li>
                      <li><code className="text-xs bg-gray-100 px-1 rounded">zip_code</code></li>
                      <li><code className="text-xs bg-gray-100 px-1 rounded">website</code></li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 mb-2">Contact Details</p>
                    <ul className="space-y-1 text-gray-600">
                      {apiType === 'lead' && (
                        <>
                          <li><code className="text-xs bg-gray-100 px-1 rounded">first_name</code></li>
                          <li><code className="text-xs bg-gray-100 px-1 rounded">last_name</code></li>
                        </>
                      )}
                      <li><code className="text-xs bg-gray-100 px-1 rounded">phone_no</code></li>
                      <li><code className="text-xs bg-gray-100 px-1 rounded">phone</code> (contact)</li>
                      <li><code className="text-xs bg-gray-100 px-1 rounded">fax</code></li>
                      <li><code className="text-xs bg-gray-100 px-1 rounded">email</code></li>
                      <li><code className="text-xs bg-gray-100 px-1 rounded">nof_representative</code></li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 mb-2">Lead Details</p>
                    <ul className="space-y-1 text-gray-600">
                      {apiType === 'prelead' && <li><code className="text-xs bg-gray-100 px-1 rounded">lead_status</code></li>}
                      <li><code className="text-xs bg-gray-100 px-1 rounded">lead_source</code></li>
                      <li><code className="text-xs bg-gray-100 px-1 rounded">lead_score</code></li>
                      <li><code className="text-xs bg-gray-100 px-1 rounded">lead_since</code> (YYYY-MM-DD)</li>
                      <li><code className="text-xs bg-gray-100 px-1 rounded">group_id</code></li>
                      <li><code className="text-xs bg-gray-100 px-1 rounded">industry_id</code></li>
                      <li><code className="text-xs bg-gray-100 px-1 rounded">region_id</code></li>
                      <li><code className="text-xs bg-gray-100 px-1 rounded">sales_rep</code></li>
                      {apiType === 'lead' && (
                        <>
                          <li><code className="text-xs bg-gray-100 px-1 rounded">priority</code> (low/medium/high/critical)</li>
                          <li><code className="text-xs bg-gray-100 px-1 rounded">expected_value</code></li>
                          <li><code className="text-xs bg-gray-100 px-1 rounded">currency</code></li>
                        </>
                      )}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 mb-2">Office Timings</p>
                    <ul className="space-y-1 text-gray-600">
                      <li><code className="text-xs bg-gray-100 px-1 rounded">from_timings</code> (HH:MM)</li>
                      <li><code className="text-xs bg-gray-100 px-1 rounded">to_timings</code> (HH:MM)</li>
                      <li><code className="text-xs bg-gray-100 px-1 rounded">timezone</code></li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 mb-2">Additional</p>
                    <ul className="space-y-1 text-gray-600">
                      <li><code className="text-xs bg-gray-100 px-1 rounded">remarks</code></li>
                      <li><code className="text-xs bg-gray-100 px-1 rounded">memo</code></li>
                      {apiType === 'lead' && (
                        <>
                          <li><code className="text-xs bg-gray-100 px-1 rounded">product_interest</code></li>
                          <li><code className="text-xs bg-gray-100 px-1 rounded">requirements</code></li>
                          <li><code className="text-xs bg-gray-100 px-1 rounded">notes</code></li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Example */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b">
                <h3 className="text-sm font-semibold text-gray-700">Response Format</h3>
              </div>
              <div className="p-4 bg-gray-900">
                {apiType === 'prelead' ? (
                  <pre className="text-sm text-gray-100 font-mono">{`{
  "status": "success",
  "result": {
    "pre_lead_id": 123,
    "company_name": "ABC Corporation",
    "email": "contact@abccorp.com",
    "phone": "+91-9876543210",
    "status": "new",
    "created_at": "2026-01-27T10:30:00+05:30"
  }
}`}</pre>
                ) : (
                  <pre className="text-sm text-gray-100 font-mono">{`{
  "status": "success",
  "result": {
    "lead_id": 456,
    "company_name": "XYZ Industries",
    "email": "john.doe@xyz.com",
    "phone": "+91-9876543210",
    "status": "new",
    "priority": "high",
    "created_at": "2026-01-28T10:30:00+05:30"
  }
}`}</pre>
                )}
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
                  <p className="text-sm text-gray-400 mt-1">Use the API documentation above to send your first webhook</p>
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
            </div>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
}
