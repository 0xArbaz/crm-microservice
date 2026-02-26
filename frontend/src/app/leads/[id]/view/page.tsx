'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  Pencil,
  Phone,
  FileText,
  Download,
  Link2,
  X
} from 'lucide-react';
import api from '@/lib/api';
import { Lead } from '@/types';
import { formatDate } from '@/lib/utils';

// Types for Lead entities
interface LeadContact {
  id?: number;
  lead_id: number;
  contact_type: string;
  title?: string;
  first_name: string;
  last_name?: string;
  designation?: string;
  department?: string;
  email?: string;
  work_email?: string;
  personal_email?: string;
  phone?: string;
  work_phone?: string;
  ext?: string;
  fax?: string;
  cell_phone?: string;
  home_phone?: string;
  linkedin_url?: string;
  facebook_url?: string;
  twitter_url?: string;
  notes?: string;
  is_primary: boolean;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

interface LeadActivity {
  id?: number;
  lead_id: number;
  activity_type: string;
  subject: string;
  description?: string;
  outcome?: string;
  activity_date: string;
  start_time?: string;
  end_date?: string;
  end_time?: string;
  due_date?: string;
  is_completed: boolean;
  performed_by?: number;
  assigned_to?: number;
  contact_id?: number;
  contact_name?: string;
  contact_email?: string;
  priority?: string;
  status?: string;
  created_at?: string;
}

interface LeadMemo {
  id?: number;
  lead_id: number;
  memo_type: string;
  title: string;
  content: string;
  created_by?: number;
  created_at?: string;
}

interface LeadDocument {
  id?: number;
  lead_id: number;
  file_name: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  notes?: string;
  uploaded_by?: number;
  created_at?: string;
}

interface LeadStatusHistory {
  id?: number;
  lead_id: number;
  status: string;
  status_date: string;
  remarks?: string;
  changed_by?: number;
  created_by?: number;
  created_at?: string;
}

interface QualifiedLeadProfile {
  id?: number;
  lead_id: number;
  profile_type: string;
  company?: string;
  industry?: string;
  best_time_call?: string;
  timezone?: string;
  mode?: string;
  contact_id?: number;
  contact_name?: string;
  designation?: string;
  phone?: string;
  email?: string;
  need_type?: string;
  current_software?: string;
  need_summary?: string;
  budget?: string;
  decision_maker?: string;
  time_frame?: string;
  qualified_by?: number;
  qualified_by_name?: string;
  company_profile?: string;
  summary_of_discussion?: string;
  conclusion?: string;
  company_type?: string;
  annual_revenue?: string;
  employee_count?: string;
  timeline?: string;
  pain_points?: string;
  competitors?: string;
  notes?: string;
  created_at?: string;
}

// Static Options for display
const leadStatusOptions = [
  { value: '', label: 'Select Status' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal_sent', label: 'Proposal Sent' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

const priorityOptions = [
  { value: '', label: 'Select Priority' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const timezoneOptions = [
  { value: '', label: 'Select Timezone' },
  { value: 'Asia/Kolkata', label: 'IST (Asia/Kolkata)' },
  { value: 'America/New_York', label: 'EST (America/New_York)' },
  { value: 'America/Los_Angeles', label: 'PST (America/Los_Angeles)' },
  { value: 'Europe/London', label: 'GMT (Europe/London)' },
  { value: 'Asia/Dubai', label: 'GST (Asia/Dubai)' },
];

const salesRepOptions = [
  { value: '', label: 'Select Sales Rep' },
  { value: '1', label: 'Admin User' },
];

const leadScoreOptions = [
  { value: '', label: 'Select Score' },
  { value: '1', label: 'Hot' },
  { value: '2', label: 'Warm' },
  { value: '3', label: 'Cold' },
];

const contactTypeOptions = [
  { value: 'management', label: 'Management' },
  { value: 'technical', label: 'Technical' },
  { value: 'sales', label: 'Sales' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'accounts', label: 'Accounts' },
  { value: 'hr', label: 'HR' },
  { value: 'other', label: 'Other' },
];

const modeOptions = [
  { value: '', label: 'Select Mode' },
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'video_call', label: 'Video Call' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

const needTypeOptions = [
  { value: '', label: 'Select Need Type' },
  { value: 'collaboration_software', label: 'Collaboration Software' },
  { value: 'crm_software', label: 'CRM Software' },
  { value: 'erp_software', label: 'ERP Software' },
  { value: 'custom_development', label: 'Custom Development' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'other', label: 'Other' },
];

const budgetOptions = [
  { value: '', label: 'Select Budget' },
  { value: 'under_10k', label: 'Under $10,000' },
  { value: '10k_50k', label: '$10,000 - $50,000' },
  { value: '50k_100k', label: '$50,000 - $100,000' },
  { value: '100k_500k', label: '$100,000 - $500,000' },
  { value: 'over_500k', label: 'Over $500,000' },
];

const timeFrameOptions = [
  { value: '', label: 'Select Time Frame' },
  { value: '1_month', label: '1 Month' },
  { value: '2_months', label: '2 Months' },
  { value: '3_months', label: '3 Months' },
  { value: '6_months', label: '6 Months' },
  { value: '1_year', label: '1 Year' },
  { value: 'ongoing', label: 'Ongoing' },
];

type TabType = 'company' | 'contacts' | 'activities' | 'qualified' | 'memo' | 'upload' | 'status' | 'workflow';

// Helper function to get label from options
const getOptionLabel = (options: {value: string, label: string}[], value: string | number | undefined | null): string => {
  if (!value) return '-';
  const option = options.find(opt => opt.value === value.toString());
  return option?.label || value.toString();
};

export default function ViewLeadPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = parseInt(params.id as string);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('company');

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [leadData, setLeadData] = useState<Lead | null>(null);
  const [contacts, setContacts] = useState<LeadContact[]>([]);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [memos, setMemos] = useState<LeadMemo[]>([]);
  const [documents, setDocuments] = useState<LeadDocument[]>([]);
  const [statusHistory, setStatusHistory] = useState<LeadStatusHistory[]>([]);
  const [qualifiedProfiles, setQualifiedProfiles] = useState<QualifiedLeadProfile[]>([]);

  // Form data for display (read-only)
  const [formData, setFormData] = useState({
    company_name: '',
    address_line1: '',
    address_line2: '',
    country_id: '',
    state_id: '',
    city_id: '',
    zip_code: '',
    phone_no: '',
    fax: '',
    website: '',
    nof_representative: '',
    phone: '',
    email: '',
    lead_since: '',
    status: '',
    group_id: '',
    industry_id: '',
    region_id: '',
    from_timings: '',
    to_timings: '',
    timezone: '',
    sales_rep: '',
    source: '',
    lead_score: '',
    priority: '',
    expected_value: '',
    remarks: '',
  });

  // Dynamic dropdown options from Option Master
  const [groupOptions, setGroupOptions] = useState<{value: string, label: string}[]>([{ value: '', label: 'Select Group' }]);
  const [industryOptions, setIndustryOptions] = useState<{value: string, label: string}[]>([{ value: '', label: 'Select Industry' }]);
  const [regionOptions, setRegionOptions] = useState<{value: string, label: string}[]>([{ value: '', label: 'Select Region' }]);
  const [sourceOptions, setSourceOptions] = useState<{value: string, label: string}[]>([{ value: '', label: 'Select Lead Source' }]);

  // Dynamic location options
  const [countryOptions, setCountryOptions] = useState<{value: string, label: string}[]>([{ value: '', label: 'Select Country' }]);
  const [stateOptions, setStateOptions] = useState<{value: string, label: string}[]>([{ value: '', label: 'Select State' }]);
  const [cityOptions, setCityOptions] = useState<{value: string, label: string}[]>([{ value: '', label: 'Select City' }]);

  // Contact Tab state
  const [contactTypeFilter, setContactTypeFilter] = useState<string>('all');

  // Qualified Profile Form state (for display)
  const [qualifiedProfileForm, setQualifiedProfileForm] = useState<QualifiedLeadProfile>({
    lead_id: 0,
    profile_type: 'qualified',
    company: '',
    industry: '',
    best_time_call: '',
    timezone: '',
    mode: '',
    contact_id: undefined,
    contact_name: '',
    designation: '',
    phone: '',
    email: '',
    need_type: '',
    current_software: '',
    need_summary: '',
    budget: '',
    decision_maker: '',
    time_frame: '',
    qualified_by: undefined,
    qualified_by_name: '',
    company_profile: '',
    summary_of_discussion: '',
    conclusion: '',
  });

  // Fetch Lead Data
  const fetchLeadData = useCallback(async () => {
    try {
      const leadRes = await api.getLead(leadId);
      setLeadData(leadRes);

      let fromTimings = '';
      let toTimings = '';
      if (leadRes.office_timings) {
        const parts = leadRes.office_timings.split(' - ');
        if (parts.length === 2) {
          fromTimings = parts[0];
          toTimings = parts[1];
        }
      }

      let leadSince = '';
      if (leadRes.lead_since) {
        leadSince = new Date(leadRes.lead_since).toISOString().split('T')[0];
      }

      setFormData({
        company_name: leadRes.company_name || leadRes.first_name || '',
        address_line1: leadRes.address_line1 || '',
        address_line2: leadRes.address_line2 || '',
        country_id: leadRes.country_id?.toString() || '',
        state_id: leadRes.state_id?.toString() || '',
        city_id: leadRes.city_id?.toString() || '',
        zip_code: leadRes.zip_code || leadRes.pincode || '',
        phone_no: leadRes.phone_no || '',
        fax: leadRes.fax || '',
        website: leadRes.website || '',
        nof_representative: leadRes.nof_representative || '',
        phone: leadRes.phone || '',
        email: leadRes.email || '',
        lead_since: leadSince,
        status: leadRes.lead_status || '',
        group_id: leadRes.group_id?.toString() || '',
        industry_id: leadRes.industry_id?.toString() || '',
        region_id: leadRes.region_id?.toString() || '',
        from_timings: fromTimings,
        to_timings: toTimings,
        timezone: leadRes.timezone || '',
        sales_rep: leadRes.sales_rep?.toString() || '',
        source: leadRes.source || '',
        lead_score: leadRes.lead_score?.toString() || '',
        priority: leadRes.priority || '',
        expected_value: leadRes.expected_value?.toString() || '',
        remarks: leadRes.remarks || '',
      });

      // Fetch related entities
      try {
        const contactsRes = await api.getLeadContactsForEdit(leadId);
        setContacts(contactsRes || []);
      } catch { setContacts([]); }

      try {
        const activitiesRes = await api.getLeadActivitiesForEdit(leadId);
        setActivities(activitiesRes || []);
      } catch { setActivities([]); }

      try {
        const memosRes = await api.getLeadMemos(leadId);
        setMemos(memosRes || []);
      } catch { setMemos([]); }

      try {
        const docsRes = await api.getLeadDocuments(leadId);
        setDocuments(docsRes || []);
      } catch { setDocuments([]); }

      try {
        const historyRes = await api.getLeadStatusHistory(leadId);
        setStatusHistory(historyRes || []);
      } catch { setStatusHistory([]); }

      try {
        const profilesRes = await api.getLeadQualifiedProfiles(leadId);
        setQualifiedProfiles(profilesRes || []);
        if (profilesRes && profilesRes.length > 0) {
          const profile = profilesRes[0];
          setQualifiedProfileForm({
            ...profile,
            lead_id: leadId,
            company: profile.company || leadRes.company_name || '',
            industry: profile.industry || '',
            contact_name: profile.contact_name || '',
            designation: profile.designation || '',
            phone: profile.phone || leadRes.phone || '',
            email: profile.email || leadRes.email || '',
          });
        } else {
          setQualifiedProfileForm(prev => ({
            ...prev,
            lead_id: leadId,
            company: leadRes.company_name || '',
            phone: leadRes.phone || '',
            email: leadRes.email || '',
          }));
        }
      } catch { setQualifiedProfiles([]); }

    } catch (err: any) {
      setError('Failed to load lead');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    if (leadId) {
      fetchLeadData();
    }
  }, [leadId, fetchLeadData]);

  // Fetch dropdown options from Option Master
  useEffect(() => {
    const fetchOptionMasterData = async () => {
      try {
        const optionsData = await api.getOptionsWithDropdowns();
        optionsData.forEach((option: any) => {
          const items = option.dropdowns
            .filter((d: any) => d.status === 'Active')
            .map((d: any) => ({ value: d.id.toString(), label: d.name }));

          const title = option.title.toLowerCase();
          if (title === 'groups' || title === 'group') {
            setGroupOptions([{ value: '', label: 'Select Group' }, ...items]);
          } else if (title === 'industry' || title === 'industries') {
            setIndustryOptions([{ value: '', label: 'Select Industry' }, ...items]);
          } else if (title === 'company region' || title === 'customer region' || title === 'region' || title === 'regions') {
            setRegionOptions([{ value: '', label: 'Select Region' }, ...items]);
          } else if (title === 'lead source' || title === 'source' || title === 'sources') {
            setSourceOptions([{ value: '', label: 'Select Lead Source' }, ...items]);
          }
        });
      } catch (err) {
        console.error('Failed to fetch option master data:', err);
      }
    };
    fetchOptionMasterData();
  }, []);

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const countries = await api.getCountries();
        if (countries && countries.length > 0) {
          const activeCountries = countries.filter((c: any) => c.status === 'Active');
          const options = activeCountries.map((c: any) => ({ value: c.id.toString(), label: c.name }));
          setCountryOptions([{ value: '', label: 'Select Country' }, ...options]);
        }
      } catch (err) {
        console.error('Failed to fetch countries:', err);
      }
    };
    fetchCountries();
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    const fetchStates = async () => {
      if (formData.country_id) {
        try {
          const states = await api.getStates(parseInt(formData.country_id));
          if (states && states.length > 0) {
            const activeStates = states.filter((s: any) => s.status === 'Active');
            const options = activeStates.map((s: any) => ({ value: s.id.toString(), label: s.name }));
            setStateOptions([{ value: '', label: 'Select State' }, ...options]);
          } else {
            setStateOptions([{ value: '', label: 'No states available' }]);
          }
        } catch (err) {
          console.error('Failed to fetch states:', err);
          setStateOptions([{ value: '', label: 'Select State' }]);
        }
      } else {
        setStateOptions([{ value: '', label: 'Select State' }]);
      }
    };
    fetchStates();
  }, [formData.country_id]);

  // Fetch cities when state changes
  useEffect(() => {
    const fetchCities = async () => {
      if (formData.state_id) {
        try {
          const cities = await api.getCities(parseInt(formData.state_id));
          if (cities && cities.length > 0) {
            const options = cities.map((c: any) => ({ value: c.id.toString(), label: c.name }));
            setCityOptions([{ value: '', label: 'Select City' }, ...options]);
          } else {
            setCityOptions([{ value: '', label: 'No cities available' }]);
          }
        } catch (err) {
          console.error('Failed to fetch cities:', err);
          setCityOptions([{ value: '', label: 'Select City' }]);
        }
      } else {
        setCityOptions([{ value: '', label: 'Select City' }]);
      }
    };
    fetchCities();
  }, [formData.state_id]);

  // Styles (read-only versions)
  const inputClass = "w-full h-9 px-3 text-sm border border-gray-300 rounded bg-gray-100 cursor-not-allowed";
  const labelClass = "w-40 text-sm font-medium flex-shrink-0";

  // Tab definitions
  const tabs: { id: TabType; label: string }[] = [
    { id: 'company', label: 'Company Details' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'activities', label: 'Activities' },
    { id: 'qualified', label: 'Qualified Lead Profile' },
    { id: 'memo', label: 'Memo' },
    { id: 'upload', label: 'Upload File' },
    { id: 'status', label: 'Status' },
    { id: 'workflow', label: 'Workflow & Audit Trail' },
  ];

  // Render Company Details Tab (Read-Only)
  const renderCompanyDetails = () => (
    <div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
        {/* Left Column */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className={labelClass}>Company</label>
            <input value={formData.company_name} readOnly className={`${inputClass} flex-1`} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Address Line 1</label>
            <input value={formData.address_line1} readOnly className={`${inputClass} flex-1`} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Address Line 2</label>
            <input value={formData.address_line2} readOnly className={`${inputClass} flex-1`} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Country</label>
            <input value={getOptionLabel(countryOptions, formData.country_id)} readOnly className={`${inputClass} flex-1`} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>State</label>
            <input value={getOptionLabel(stateOptions, formData.state_id)} readOnly className={`${inputClass} flex-1`} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>City</label>
            <input value={getOptionLabel(cityOptions, formData.city_id)} readOnly className={`${inputClass} flex-1`} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Zip Code</label>
            <input value={formData.zip_code} readOnly className={`${inputClass} flex-1`} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Phone</label>
            <input value={formData.phone_no} readOnly className={`${inputClass} flex-1`} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Fax</label>
            <input value={formData.fax} readOnly className={`${inputClass} flex-1`} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Website</label>
            <input value={formData.website} readOnly className={`${inputClass} flex-1`} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Representative</label>
            <input value={formData.nof_representative} readOnly className={`${inputClass} flex-1`} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Mobile</label>
            <input value={formData.phone} readOnly className={`${inputClass} flex-1`} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Email</label>
            <input value={formData.email} readOnly className={`${inputClass} flex-1`} />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className={labelClass}>Lead Since</label>
            <input value={formData.lead_since} readOnly className={`${inputClass} flex-1`} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Lead Status</label>
            <input value={getOptionLabel(leadStatusOptions, formData.status)} readOnly className={`${inputClass} flex-1`} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Priority</label>
            <input value={getOptionLabel(priorityOptions, formData.priority)} readOnly className={`${inputClass} flex-1`} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Expected Value</label>
            <input value={formData.expected_value} readOnly className={`${inputClass} flex-1`} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Group</label>
            <input value={leadData?.group_name || leadData?.group || getOptionLabel(groupOptions, formData.group_id)} readOnly className={`${inputClass} flex-1`} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Industry</label>
            <input value={leadData?.industry_name || leadData?.industry || getOptionLabel(industryOptions, formData.industry_id)} readOnly className={`${inputClass} flex-1`} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Region</label>
            <input value={leadData?.region_name || leadData?.region || getOptionLabel(regionOptions, formData.region_id)} readOnly className={`${inputClass} flex-1`} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Office Timing</label>
            <div className="flex gap-2 flex-1">
              <input value={formData.from_timings} readOnly className={`${inputClass} flex-1`} />
              <input value={formData.to_timings} readOnly className={`${inputClass} flex-1`} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Timezone</label>
            <input value={getOptionLabel(timezoneOptions, formData.timezone)} readOnly className={`${inputClass} flex-1`} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Sales Rep</label>
            <input value={getOptionLabel(salesRepOptions, formData.sales_rep)} readOnly className={`${inputClass} flex-1`} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Lead Source</label>
            <input value={formData.source ? formData.source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '-'} readOnly className={`${inputClass} flex-1`} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Lead Score</label>
            <input value={getOptionLabel(leadScoreOptions, formData.lead_score)} readOnly className={`${inputClass} flex-1`} />
          </div>
          <div className="flex items-start gap-3">
            <label className={`${labelClass} pt-2`}>Remarks</label>
            <textarea value={formData.remarks} readOnly rows={3} className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded bg-gray-100 resize-none cursor-not-allowed" />
          </div>
        </div>
      </div>

      {/* Edit Button */}
      <div className="flex justify-center gap-3 mt-6 pt-4 border-t">
        <Button
          onClick={() => router.push(`/leads/${leadId}/edit`)}
          className="flex items-center gap-2"
        >
          <Pencil className="w-4 h-4" />
          Edit Lead
        </Button>
      </div>
    </div>
  );

  // Render Contacts Tab (Read-Only)
  const renderContacts = () => {
    const filteredContacts = contactTypeFilter === 'all'
      ? contacts
      : contacts.filter(c => c.contact_type === contactTypeFilter);

    const thClass = "px-2 py-2 text-left text-xs font-semibold text-blue-600 bg-blue-50 border-b border-gray-200";
    const tdClass = "px-2 py-1.5 text-xs border-b border-gray-100";

    return (
      <div>
        {/* Contact Type Filter */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="text-sm font-medium text-blue-600">Contact type</span>
          <select
            value={contactTypeFilter}
            onChange={(e) => setContactTypeFilter(e.target.value)}
            className="h-8 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white min-w-[200px]"
          >
            <option value="all">All</option>
            {contactTypeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Contacts Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr>
                  <th className={thClass} style={{ width: '9%' }}>Contact</th>
                  <th className={thClass} style={{ width: '6%' }}>Title</th>
                  <th className={thClass} style={{ width: '10%' }}>First Name</th>
                  <th className={thClass} style={{ width: '10%' }}>Last Name</th>
                  <th className={thClass} style={{ width: '10%' }}>Designation</th>
                  <th className={thClass} style={{ width: '15%' }}>Work Email</th>
                  <th className={thClass} style={{ width: '11%' }}>Work Phone</th>
                  <th className={thClass} style={{ width: '5%' }}>Ext.</th>
                  <th className={thClass} style={{ width: '6%' }}>Fax</th>
                  <th className={thClass} style={{ width: '11%' }}>Cell Phone</th>
                  <th className={thClass} style={{ width: '7%' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                      No contacts found
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className={tdClass}>
                        <span className="capitalize">{contact.contact_type?.replace('_', ' ')}</span>
                      </td>
                      <td className={tdClass}>{contact.title || 'Mr.'}</td>
                      <td className={tdClass}>{contact.first_name}</td>
                      <td className={tdClass}>{contact.last_name || ''}</td>
                      <td className={tdClass}>{contact.designation || ''}</td>
                      <td className={tdClass}>
                        {contact.email && (
                          <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                            {contact.email}
                          </a>
                        )}
                      </td>
                      <td className={tdClass}>
                        {(contact.work_phone || contact.phone) && (
                          <span className="flex items-center gap-1">
                            {contact.work_phone || contact.phone}
                            <Phone className="w-3 h-3 text-green-500" />
                          </span>
                        )}
                      </td>
                      <td className={tdClass}>{contact.ext || ''}</td>
                      <td className={tdClass}>{contact.fax || ''}</td>
                      <td className={tdClass}>
                        {contact.cell_phone && (
                          <span className="flex items-center gap-1">
                            {contact.cell_phone}
                            <Phone className="w-3 h-3 text-green-500" />
                          </span>
                        )}
                      </td>
                      <td className={tdClass}>
                        {(contact.status === 'active' || !contact.status) ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 bg-green-500 rounded-full">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-400 rounded-full">
                            <X className="w-3 h-3 text-white" />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Render Activities Tab (Read-Only)
  const renderActivities = () => {
    const thClass = "px-4 py-2.5 text-left text-xs font-semibold text-blue-700 bg-gradient-to-b from-blue-50 to-blue-100 border-b-2 border-blue-200";
    const tdClass = "px-4 py-2.5 text-xs";

    const getActivityTypeColor = (type: string) => {
      switch (type) {
        case 'email': return 'text-orange-500';
        case 'call': return 'text-green-600';
        case 'meeting': return 'text-purple-600';
        case 'whatsapp': return 'text-green-500';
        case 'video_call': return 'text-blue-600';
        case 'site_visit': return 'text-indigo-600';
        default: return 'text-gray-600';
      }
    };

    return (
      <div>
        {/* Activities Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className={thClass}>Activity Type</th>
                  <th className={thClass}>Contact</th>
                  <th className={thClass}>Subject</th>
                  <th className={thClass}>Start Date</th>
                  <th className={thClass}>End Date</th>
                  <th className={thClass}>Priority</th>
                  <th className={thClass}>Assigned To</th>
                </tr>
              </thead>
              <tbody>
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500 bg-gray-50">
                      No activities found
                    </td>
                  </tr>
                ) : (
                  activities.map((activity, index) => (
                    <tr
                      key={activity.id}
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/50 transition-colors`}
                    >
                      <td className={tdClass}>
                        <span className={`font-medium capitalize ${getActivityTypeColor(activity.activity_type)}`}>
                          {activity.activity_type?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className={tdClass}>
                        {activity.contact_name ? (
                          <span className="text-blue-600">
                            {activity.contact_name}
                          </span>
                        ) : '-'}
                      </td>
                      <td className={tdClass}>{activity.subject || '-'}</td>
                      <td className={tdClass}>
                        {activity.activity_date ? formatDate(activity.activity_date) : '-'}
                      </td>
                      <td className={tdClass}>
                        {activity.end_date ? formatDate(activity.end_date) :
                         activity.due_date ? formatDate(activity.due_date) : '-'}
                      </td>
                      <td className={tdClass}>
                        <span className="text-blue-600 capitalize">
                          {activity.priority || 'Regular'}
                        </span>
                      </td>
                      <td className={tdClass}>
                        {activity.assigned_to ? `User ${activity.assigned_to}` : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Render Qualified Lead Profile Tab (Read-Only)
  const renderQualifiedProfile = () => {
    const sectionTitleClass = "text-sm font-semibold text-orange-600 uppercase tracking-wide mb-4";
    const labelClass = "text-xs font-medium text-blue-600 mb-1 block";
    const readOnlyInputClass = "w-full h-8 px-2 text-sm border border-gray-300 rounded bg-gray-100 cursor-not-allowed";

    return (
      <div className="space-y-6">
        {/* QUALIFIED LEAD ACKNOWLEDGEMENT */}
        <div>
          <h3 className={sectionTitleClass}>QUALIFIED LEAD ACKNOWLEDGEMENT</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {/* Left Column */}
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Company</label>
                <input
                  type="text"
                  value={qualifiedProfileForm.company || ''}
                  readOnly
                  className={readOnlyInputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Industry</label>
                <input
                  type="text"
                  value={qualifiedProfileForm.industry || ''}
                  readOnly
                  className={readOnlyInputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Best Time (Call)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={qualifiedProfileForm.best_time_call || ''}
                    readOnly
                    className={`${readOnlyInputClass} flex-1`}
                  />
                  <input
                    type="text"
                    value={getOptionLabel(timezoneOptions, qualifiedProfileForm.timezone)}
                    readOnly
                    className={`${readOnlyInputClass} flex-1`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Mode</label>
                <input
                  type="text"
                  value={getOptionLabel(modeOptions, qualifiedProfileForm.mode)}
                  readOnly
                  className={readOnlyInputClass}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Contact</label>
                <input
                  type="text"
                  value={qualifiedProfileForm.contact_name || ''}
                  readOnly
                  className={readOnlyInputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Designation</label>
                <input
                  type="text"
                  value={qualifiedProfileForm.designation || ''}
                  readOnly
                  className={readOnlyInputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="text"
                  value={qualifiedProfileForm.phone || ''}
                  readOnly
                  className={readOnlyInputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="text"
                  value={qualifiedProfileForm.email || ''}
                  readOnly
                  className={readOnlyInputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ADDITIONAL INFORMATION */}
        <div>
          <h3 className={sectionTitleClass}>ADDITIONAL INFORMATION</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {/* Left Column */}
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Need Type</label>
                <input
                  type="text"
                  value={getOptionLabel(needTypeOptions, qualifiedProfileForm.need_type)}
                  readOnly
                  className={readOnlyInputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Current Soft</label>
                <input
                  type="text"
                  value={qualifiedProfileForm.current_software || ''}
                  readOnly
                  className={readOnlyInputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Need Summary</label>
                <textarea
                  value={qualifiedProfileForm.need_summary || ''}
                  readOnly
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-gray-100 resize-none cursor-not-allowed"
                  rows={2}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Budget</label>
                <input
                  type="text"
                  value={getOptionLabel(budgetOptions, qualifiedProfileForm.budget)}
                  readOnly
                  className={readOnlyInputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Decision Maker</label>
                <input
                  type="text"
                  value={qualifiedProfileForm.decision_maker || ''}
                  readOnly
                  className={readOnlyInputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Time Frame</label>
                <input
                  type="text"
                  value={getOptionLabel(timeFrameOptions, qualifiedProfileForm.time_frame)}
                  readOnly
                  className={readOnlyInputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Qualified By</label>
                <input
                  type="text"
                  value={qualifiedProfileForm.qualified_by ? `User ${qualifiedProfileForm.qualified_by}` : ''}
                  readOnly
                  className={readOnlyInputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* COMPANY PROFILE */}
        <div>
          <h3 className={sectionTitleClass}>COMPANY PROFILE</h3>
          <div className="border border-gray-300 rounded overflow-hidden">
            <textarea
              value={qualifiedProfileForm.company_profile || ''}
              readOnly
              className="w-full px-3 py-2 text-sm bg-gray-100 resize-none border-0 cursor-not-allowed"
              rows={6}
            />
          </div>
        </div>

        {/* SUMMARY OF DISCUSSION */}
        <div>
          <h3 className={sectionTitleClass}>SUMMARY OF DISCUSSION</h3>
          <div className="border border-gray-300 rounded overflow-hidden">
            <textarea
              value={qualifiedProfileForm.summary_of_discussion || ''}
              readOnly
              className="w-full px-3 py-2 text-sm bg-gray-100 resize-none border-0 cursor-not-allowed"
              rows={6}
            />
          </div>
        </div>

        {/* CONCLUSION */}
        <div>
          <h3 className={sectionTitleClass}>CONCLUSION</h3>
          <div className="border border-gray-300 rounded overflow-hidden">
            <textarea
              value={qualifiedProfileForm.conclusion || ''}
              readOnly
              className="w-full px-3 py-2 text-sm bg-gray-100 resize-none border-0 cursor-not-allowed"
              rows={6}
            />
          </div>
        </div>
      </div>
    );
  };

  // Render Memo Tab (Read-Only)
  const renderMemo = () => {
    const thClass = "px-4 py-2.5 text-left text-xs font-semibold text-white bg-blue-600";

    return (
      <div>
        {/* Memos Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass} style={{ width: '15%' }}>Date</th>
                <th className={thClass} style={{ width: '20%' }}>Added By</th>
                <th className={thClass}>Details</th>
              </tr>
            </thead>
            <tbody>
              {memos.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500 bg-gray-50">
                    No memos found
                  </td>
                </tr>
              ) : (
                memos.map((memo, index) => (
                  <tr
                    key={memo.id}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/50 transition-colors`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {memo.created_at ? formatDate(memo.created_at) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {memo.created_by ? `User ${memo.created_by}` : 'System'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="line-clamp-2">{memo.content || memo.title}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render Upload File Tab (Read-Only)
  const renderUploadFile = () => {
    const thClass = "px-4 py-2.5 text-left text-xs font-semibold text-white bg-blue-600";

    return (
      <div>
        {/* Documents Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>File Name</th>
                <th className={thClass} style={{ width: '15%' }}>Uploaded On</th>
                <th className={thClass} style={{ width: '10%' }}>Size</th>
                <th className={thClass}>Notes</th>
                <th className={thClass} style={{ width: '10%' }}>Download</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500 bg-gray-50">
                    No documents uploaded
                  </td>
                </tr>
              ) : (
                documents.map((doc, index) => (
                  <tr
                    key={doc.id}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/50 transition-colors`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        {doc.file_name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {doc.created_at ? formatDate(doc.created_at) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {doc.notes || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <a
                          href={doc.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render Status Tab (Read-Only)
  const renderStatus = () => {
    const thClass = "px-4 py-2.5 text-left text-xs font-semibold text-white bg-blue-600";

    return (
      <div>
        {/* Current Status Row */}
        <div className="flex items-center gap-4 mb-6">
          <label className="text-sm font-medium text-blue-600">Current Status</label>
          <input
            type="text"
            value={leadData?.lead_status ? leadData.lead_status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '-'}
            readOnly
            className="w-64 px-3 py-1.5 text-sm border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Status History Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>Status</th>
                <th className={thClass}>Remarks</th>
                <th className={thClass} style={{ width: '18%' }}>Updated By</th>
                <th className={thClass} style={{ width: '12%' }}>Status Date</th>
              </tr>
            </thead>
            <tbody>
              {statusHistory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500 bg-gray-50">
                    No status changes recorded
                  </td>
                </tr>
              ) : (
                statusHistory.map((history, index) => (
                  <tr
                    key={history.id || index}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/50 transition-colors`}
                  >
                    <td className="px-4 py-3 text-sm">
                      <span className="text-blue-600 capitalize">
                        {typeof history.status === 'string' ? history.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {history.remarks || 'No Remarks'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {history.changed_by ? `User ${history.changed_by}` : history.created_by ? `User ${history.created_by}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-blue-600">
                      {history.status_date ? formatDate(history.status_date) : history.created_at ? formatDate(history.created_at) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render Workflow & Audit Trail Tab (Read-Only)
  const renderWorkflow = () => (
    <div>
      <h3 className="font-medium mb-4">Workflow & Audit Trail</h3>
      <div className="space-y-3">
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Created At</div>
          <div className="font-medium">{leadData?.created_at ? formatDate(leadData.created_at) : '-'}</div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Last Updated</div>
          <div className="font-medium">{leadData?.updated_at ? formatDate(leadData.updated_at) : '-'}</div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Assigned To</div>
          <div className="font-medium">{leadData?.assigned_to ? `User ${leadData.assigned_to}` : 'Not Assigned'}</div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Pre-Lead Source</div>
          <div className="font-medium">{leadData?.pre_lead_id ? `Pre-Lead #${leadData.pre_lead_id}` : 'Direct Lead'}</div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Conversion Status</div>
          <div className="font-medium">
            {leadData?.is_converted ? (
              <>Converted to Customer #{leadData.converted_customer_id} on {leadData.converted_at ? formatDate(leadData.converted_at) : '-'}</>
            ) : (
              'Not Converted'
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/leads')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-800">VIEW LEAD</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">ID: {leadId}</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/leads/${leadId}/edit`)}
              className="flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}

        {/* Tabs */}
        <div className="mb-4 border-b">
          <div className="flex flex-wrap gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white border rounded-lg p-6">
          {activeTab === 'company' && renderCompanyDetails()}
          {activeTab === 'contacts' && renderContacts()}
          {activeTab === 'activities' && renderActivities()}
          {activeTab === 'qualified' && renderQualifiedProfile()}
          {activeTab === 'memo' && renderMemo()}
          {activeTab === 'upload' && renderUploadFile()}
          {activeTab === 'status' && renderStatus()}
          {activeTab === 'workflow' && renderWorkflow()}
        </div>
      </div>
    </MainLayout>
  );
}
