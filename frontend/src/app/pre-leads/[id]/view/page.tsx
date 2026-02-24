'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Calendar, Pencil, Link2, Eye } from 'lucide-react';
import api from '@/lib/api';
import { PreLead } from '@/types';

// ============== Types ==============
interface Contact {
  id: number;
  contact_type: string;
  title: string;
  first_name: string;
  last_name: string;
  designation: string;
  work_email: string;
  work_phone: string;
  ext: string;
  fax: string;
  cell_phone: string;
  status: string;
  linkedin_url?: string;
  facebook_url?: string;
  twitter_url?: string;
}

interface Memo {
  id: number;
  title?: string;
  content?: string;
  details?: string;
  created_at: string;
  created_by: number;
}

interface QualifiedProfile {
  id: number;
  q_contact_id?: number;
  contact_id?: number;
  q_title?: string;
  q_phone?: string;
  q_email?: string;
  q_bes_time_call?: string;
  best_time_call?: string;
  q_bes_time_call_timezone?: string;
  best_time_call_timezone?: number;
  q_mode?: string;
  mode?: string;
  q_need_type?: string;
  need_type?: number;
  q_current_software?: string;
  current_software?: string;
  q_need_summery?: string;
  need_summary?: string;
  q_budget?: string;
  budget?: number;
  q_decision_maker?: string;
  decision_maker?: number;
  q_time_frame?: string;
  time_frame?: number;
  q_qualified_by?: string;
  qualified_by?: number;
  q_company_profile?: string;
  company_profile?: string;
  q_summery_Of_discussion?: string;
  summary_of_discussion?: string;
  q_conclusion?: string;
  conclusion?: string;
}

interface StatusHistory {
  id: number;
  status: string;
  status_date: string;
  remarks: string;
  created_at: string;
  updated_by: number;
}

// ============== Static Options ==============
const timezoneOptions = [
  { value: '', label: 'Select Company Timezone' },
  { value: '1', label: 'IST (Asia/Kolkata)' },
  { value: '2', label: 'EST (America/New_York)' },
  { value: '3', label: 'PST (America/Los_Angeles)' },
  { value: '4', label: 'GMT (Europe/London)' },
  { value: '5', label: 'GST (Asia/Dubai)' },
];

const salesRepOptions = [
  { value: '', label: 'Select Sales Representative' },
  { value: '1', label: 'Admin User' },
];

const leadScoreOptions = [
  { value: '', label: 'Select Lead Score' },
  ...Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
];

const contactTypeOptions = [
  { value: 'all', label: 'All' },
  { value: 'primary', label: 'Primary' },
  { value: 'billing', label: 'Billing' },
  { value: 'technical', label: 'Technical' },
  { value: 'decision_maker', label: 'Decision Maker' },
];

const needTypeOptions = [
  { value: '', label: 'Select Need Type' },
  { value: '1', label: 'New Implementation' },
  { value: '2', label: 'Upgrade' },
  { value: '3', label: 'Migration' },
  { value: '4', label: 'Consulting' },
];

const budgetOptions = [
  { value: '', label: 'Select Budget' },
  { value: '1', label: 'Under $10,000' },
  { value: '2', label: '$10,000 - $50,000' },
  { value: '3', label: '$50,000 - $100,000' },
  { value: '4', label: 'Above $100,000' },
];

const timeFrameOptions = [
  { value: '', label: 'Select Time Frame' },
  { value: '1', label: 'Immediate' },
  { value: '2', label: '1-3 Months' },
  { value: '3', label: '3-6 Months' },
  { value: '4', label: '6-12 Months' },
];

const modeOptions = [
  { value: '', label: 'Select Mode' },
  { value: 'Email', label: 'Email' },
  { value: 'Phone', label: 'Phone' },
  { value: 'Visit', label: 'Visit' },
];

type TabType = 'company_details' | 'contacts' | 'company_profile' | 'memo' | 'workflow';

export default function ViewPreLeadPage() {
  const router = useRouter();
  const params = useParams();
  const preLeadId = parseInt(params.id as string);

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [preLeadData, setPreLeadData] = useState<PreLead | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('company_details');
  const [isDiscarded, setIsDiscarded] = useState(false);

  // Dynamic dropdown options from Option Master
  const [groupOptions, setGroupOptions] = useState<{value: string, label: string}[]>([{ value: '', label: 'Select Group' }]);
  const [industryOptions, setIndustryOptions] = useState<{value: string, label: string}[]>([{ value: '', label: 'Select Industry' }]);
  const [regionOptions, setRegionOptions] = useState<{value: string, label: string}[]>([{ value: '', label: 'Select Company Region' }]);
  const [sourceOptions, setSourceOptions] = useState<{value: string, label: string}[]>([{ value: '', label: 'Select Lead Source' }]);

  // Dynamic location options
  const [countryOptions, setCountryOptions] = useState<{value: string, label: string}[]>([{ value: '', label: 'Select Country' }]);
  const [stateOptions, setStateOptions] = useState<{value: string, label: string}[]>([{ value: '', label: 'Select State/Province' }]);
  const [cityOptions, setCityOptions] = useState<{value: string, label: string}[]>([{ value: '', label: 'Select City' }]);

  // Tab-specific state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [qualifiedProfile, setQualifiedProfile] = useState<QualifiedProfile | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [contactFilter, setContactFilter] = useState('all');

  // Form data for display
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
    group_id: '',
    industry_id: '',
    region_id: '',
    from_timings: '',
    to_timings: '',
    timezone: '',
    sales_rep: '',
    source: '',
    lead_score: '',
    remarks: '',
  });

  // Qualified Profile form data for display
  const [profileForm, setProfileForm] = useState({
    q_contact_id: '',
    q_bes_time_call: '',
    q_bes_time_call_timezone: '',
    q_mode: '',
    q_need_type: '',
    q_current_software: '',
    q_need_summery: '',
    q_budget: '',
    q_decision_maker: '',
    q_time_frame: '',
    q_qualified_by: '',
    q_company_profile: '',
    q_summery_Of_discussion: '',
    q_conclusion: '',
  });

  // Fetch pre-lead data
  const fetchPreLead = useCallback(async () => {
    try {
      const preLeadRes = await api.getPreLead(preLeadId);
      setPreLeadData(preLeadRes);
      setIsDiscarded(preLeadRes.status === 1 || preLeadRes.lead_status === 'discarded');

      let fromTimings = '';
      let toTimings = '';
      if (preLeadRes.office_timings) {
        const parts = preLeadRes.office_timings.split(' - ');
        if (parts.length === 2) {
          fromTimings = parts[0];
          toTimings = parts[1];
        }
      }

      let leadSince = '';
      if (preLeadRes.lead_since) {
        leadSince = new Date(preLeadRes.lead_since).toISOString().split('T')[0];
      }

      setFormData({
        company_name: preLeadRes.company_name || preLeadRes.first_name || '',
        address_line1: preLeadRes.address_line1 || '',
        address_line2: preLeadRes.address_line2 || '',
        country_id: preLeadRes.country_id?.toString() || '',
        state_id: preLeadRes.state_id?.toString() || '',
        city_id: preLeadRes.city_id?.toString() || '',
        zip_code: preLeadRes.zip_code || '',
        phone_no: preLeadRes.phone_no || '',
        fax: preLeadRes.fax || '',
        website: preLeadRes.website || '',
        nof_representative: preLeadRes.nof_representative || '',
        phone: preLeadRes.phone || '',
        email: preLeadRes.email || '',
        lead_since: leadSince,
        group_id: preLeadRes.group_id?.toString() || '',
        industry_id: preLeadRes.industry_id?.toString() || '',
        region_id: preLeadRes.region_id?.toString() || '',
        from_timings: fromTimings,
        to_timings: toTimings,
        timezone: preLeadRes.timezone || '',
        sales_rep: preLeadRes.sales_rep?.toString() || '',
        source: preLeadRes.source || '',
        lead_score: preLeadRes.lead_score?.toString() || '',
        remarks: preLeadRes.remarks || '',
      });

      // Fetch states and cities for display
      if (preLeadRes.country_id) {
        try {
          const states = await api.getStates(preLeadRes.country_id);
          if (states && states.length > 0) {
            const activeStates = states.filter((s: any) => s.status === 'Active');
            const options = activeStates.map((s: any) => ({ value: s.id.toString(), label: s.name }));
            setStateOptions([{ value: '', label: 'Select State/Province' }, ...options]);
          }
        } catch (err) {
          console.error('Failed to fetch states:', err);
        }
      }

      if (preLeadRes.state_id) {
        try {
          const cities = await api.getCities(preLeadRes.state_id);
          if (cities && cities.length > 0) {
            const activeCities = cities.filter((c: any) => c.status === 'Active');
            const options = activeCities.map((c: any) => ({ value: c.id.toString(), label: c.name }));
            setCityOptions([{ value: '', label: 'Select City' }, ...options]);
          }
        } catch (err) {
          console.error('Failed to fetch cities:', err);
        }
      }
    } catch (err: any) {
      console.error('Failed to load pre-lead', err);
    } finally {
      setIsLoading(false);
    }
  }, [preLeadId]);

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    try {
      const res = await api.getPreLeadContacts(preLeadId);
      setContacts(res);
    } catch (err) {
      console.error('Failed to load contacts', err);
    }
  }, [preLeadId]);

  // Fetch memos
  const fetchMemos = useCallback(async () => {
    try {
      const res = await api.getPreLeadMemos(preLeadId);
      setMemos(res);
    } catch (err) {
      console.error('Failed to load memos', err);
    }
  }, [preLeadId]);

  // Fetch qualified profiles
  const fetchQualifiedProfile = useCallback(async () => {
    try {
      const res = await api.getPreLeadQualifiedProfiles(preLeadId);
      if (res.length > 0) {
        const profile = res[0];
        setQualifiedProfile(profile);
        setProfileForm({
          q_contact_id: profile.contact_id?.toString() || '',
          q_bes_time_call: profile.best_time_call || '',
          q_bes_time_call_timezone: profile.best_time_call_timezone?.toString() || '',
          q_mode: profile.mode || '',
          q_need_type: profile.need_type?.toString() || '',
          q_current_software: profile.current_software || '',
          q_need_summery: profile.need_summary || '',
          q_budget: profile.budget?.toString() || '',
          q_decision_maker: profile.decision_maker?.toString() || '',
          q_time_frame: profile.time_frame?.toString() || '',
          q_qualified_by: profile.qualified_by?.toString() || '',
          q_company_profile: profile.company_profile || '',
          q_summery_Of_discussion: profile.summary_of_discussion || '',
          q_conclusion: profile.conclusion || '',
        });
      }
    } catch (err) {
      console.error('Failed to load qualified profile', err);
    }
  }, [preLeadId]);

  // Fetch status history
  const fetchStatusHistory = useCallback(async () => {
    try {
      const res = await api.getPreLeadStatusHistory(preLeadId);
      setStatusHistory(res);
    } catch (err) {
      console.error('Failed to load status history', err);
    }
  }, [preLeadId]);

  useEffect(() => {
    if (preLeadId) {
      fetchPreLead();
      fetchContacts();
      fetchMemos();
      fetchQualifiedProfile();
      fetchStatusHistory();
    }
  }, [preLeadId, fetchPreLead, fetchContacts, fetchMemos, fetchQualifiedProfile, fetchStatusHistory]);

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
          } else if (title === 'company region' || title === 'region' || title === 'regions') {
            setRegionOptions([{ value: '', label: 'Select Company Region' }, ...items]);
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

  // ============== Styling (Read-only) ==============
  const inputClass = "w-full h-9 px-3 text-sm border border-gray-300 rounded bg-gray-100 cursor-not-allowed";
  const selectClass = "w-full h-9 px-3 text-sm border border-gray-300 rounded bg-gray-100 cursor-not-allowed appearance-none";
  const labelClass = "w-36 text-sm text-blue-600 flex-shrink-0";

  const tabs = [
    { id: 'company_details' as TabType, label: 'Company Details' },
    { id: 'contacts' as TabType, label: 'Contacts' },
    { id: 'company_profile' as TabType, label: 'Company Profile' },
    { id: 'memo' as TabType, label: 'Memo' },
    { id: 'workflow' as TabType, label: 'Workflow & Audit Trail' },
  ];

  const filteredContacts = contactFilter === 'all'
    ? contacts
    : contacts.filter(c => c.contact_type === contactFilter);

  // Helper function to get option label
  const getOptionLabel = (options: {value: string, label: string}[], value: string) => {
    const option = options.find(o => o.value === value);
    return option?.label || value || '-';
  };

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
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-slate-700 text-white px-4 py-3 flex items-center justify-between">
          <h1 className="text-sm font-medium flex items-center gap-2">
            <Eye className="w-4 h-4" />
            VIEW PRE LEAD - {formData.company_name || preLeadData?.company_name || preLeadData?.first_name || ''}
            {isDiscarded && <span className="ml-4 bg-red-200 text-red-800 px-2 py-1 rounded text-xs uppercase">DISCARDED</span>}
          </h1>
          <button
            onClick={() => router.push(`/pre-leads/${preLeadId}/edit`)}
            className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-gray-100 border-b flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          {/* ============== TAB 1: Company Details ============== */}
          {activeTab === 'company_details' && (
            <div>
              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Company Name</label>
                    <input value={formData.company_name} readOnly className={`${inputClass} flex-1 !bg-blue-50`} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Address</label>
                    <input value={formData.address_line1} readOnly className={`${inputClass} flex-1 !bg-yellow-50`} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}></label>
                    <input value={formData.address_line2} readOnly className={`${inputClass} flex-1`} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Country</label>
                    <input value={getOptionLabel(countryOptions, formData.country_id)} readOnly className={`${inputClass} flex-1 !bg-blue-50`} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>State/Province</label>
                    <input value={getOptionLabel(stateOptions, formData.state_id)} readOnly className={`${inputClass} flex-1 !bg-blue-50`} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>City</label>
                    <input value={getOptionLabel(cityOptions, formData.city_id)} readOnly className={`${inputClass} flex-1 !bg-blue-50`} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Postal/Zip Code</label>
                    <input value={formData.zip_code} readOnly className={`${inputClass} flex-1`} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Phone</label>
                    <input value={formData.phone_no} readOnly className={`${inputClass} flex-1 !bg-blue-50`} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Fax</label>
                    <input value={formData.fax} readOnly className={`${inputClass} flex-1`} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Website</label>
                    <input value={formData.website} readOnly className={`${inputClass} flex-1 !bg-blue-50`} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Name of Rep.</label>
                    <input value={formData.nof_representative} readOnly className={`${inputClass} flex-1`} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Contact Phone</label>
                    <input value={formData.phone} readOnly className={`${inputClass} flex-1`} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Email ID</label>
                    <input value={formData.email} readOnly className={`${inputClass} flex-1 !bg-blue-50`} />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Lead Registered</label>
                    <div className="flex gap-2 flex-1">
                      <input type="date" value={formData.lead_since} readOnly className={`${inputClass} flex-1`} />
                      <div className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded bg-gray-100">
                        <Calendar className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Group</label>
                    <input value={getOptionLabel(groupOptions, formData.group_id)} readOnly className={`${inputClass} flex-1`} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Industry</label>
                    <input value={getOptionLabel(industryOptions, formData.industry_id)} readOnly className={`${inputClass} flex-1`} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Company Region</label>
                    <input value={getOptionLabel(regionOptions, formData.region_id)} readOnly className={`${inputClass} flex-1`} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Office Timing</label>
                    <div className="flex gap-2 flex-1 items-center">
                      <input type="time" value={formData.from_timings} readOnly className={`${inputClass} flex-1`} />
                      <input type="time" value={formData.to_timings} readOnly className={`${inputClass} flex-1`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Company Timezone</label>
                    <input value={getOptionLabel(timezoneOptions, formData.timezone)} readOnly className={`${inputClass} flex-1`} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Sales Representative</label>
                    <input value={getOptionLabel(salesRepOptions, formData.sales_rep)} readOnly className={`${inputClass} flex-1`} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Lead Source</label>
                    <input value={getOptionLabel(sourceOptions, formData.source)} readOnly className={`${inputClass} flex-1`} />
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

              {/* Bottom - Edit Button */}
              <div className="flex justify-center gap-3 mt-8 pt-4 border-t">
                <button
                  onClick={() => router.push(`/pre-leads/${preLeadId}/edit`)}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Pre Lead
                </button>
              </div>
            </div>
          )}

          {/* ============== TAB 2: Contacts ============== */}
          {activeTab === 'contacts' && (
            <div>
              {/* Contact Type Filter - Centered */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <label className="text-sm text-blue-600 font-medium">Contact type</label>
                <select
                  value={contactFilter}
                  onChange={(e) => setContactFilter(e.target.value)}
                  className="w-64 h-9 px-3 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {contactTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>

              {/* Contacts Table */}
              <div className="bg-white border rounded-lg overflow-hidden overflow-x-auto">
                <table className="w-full text-sm min-w-[1200px]">
                  {/* Blue Header Row */}
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="px-2 py-2.5 text-left text-xs font-medium">Contact</th>
                      <th className="px-2 py-2.5 text-left text-xs font-medium">Title</th>
                      <th className="px-2 py-2.5 text-left text-xs font-medium">First Name</th>
                      <th className="px-2 py-2.5 text-left text-xs font-medium">Last Name</th>
                      <th className="px-2 py-2.5 text-left text-xs font-medium">Designation</th>
                      <th className="px-2 py-2.5 text-left text-xs font-medium">Work Email</th>
                      <th className="px-2 py-2.5 text-left text-xs font-medium">Work Phone</th>
                      <th className="px-2 py-2.5 text-left text-xs font-medium">Ext.</th>
                      <th className="px-2 py-2.5 text-left text-xs font-medium">Fax</th>
                      <th className="px-2 py-2.5 text-left text-xs font-medium">Cell Phone</th>
                      <th className="px-2 py-2.5 text-center text-xs font-medium">Status</th>
                      <th className="px-2 py-2.5 text-center text-xs font-medium">Social</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((contact) => (
                      <tr key={contact.id} className="border-b hover:bg-gray-50">
                        <td className="px-2 py-2 text-xs">{contact.contact_type}</td>
                        <td className="px-2 py-2 text-xs">{contact.title}</td>
                        <td className="px-2 py-2 text-xs">{contact.first_name}</td>
                        <td className="px-2 py-2 text-xs">{contact.last_name}</td>
                        <td className="px-2 py-2 text-xs">{contact.designation}</td>
                        <td className="px-2 py-2 text-xs">{contact.work_email}</td>
                        <td className="px-2 py-2 text-xs">{contact.work_phone}</td>
                        <td className="px-2 py-2 text-xs">{contact.ext}</td>
                        <td className="px-2 py-2 text-xs">{contact.fax}</td>
                        <td className="px-2 py-2 text-xs">{contact.cell_phone}</td>
                        <td className="px-2 py-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs ${contact.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {contact.status}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-center">
                          {(contact.linkedin_url || contact.facebook_url || contact.twitter_url) && (
                            <Link2 className="w-3.5 h-3.5 text-green-600 inline-block" />
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredContacts.length === 0 && (
                      <tr>
                        <td colSpan={12} className="px-3 py-8 text-center text-gray-500 text-xs">No contacts found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============== TAB 3: Company Profile ============== */}
          {activeTab === 'company_profile' && (
            <div className="space-y-6">
              {/* PRE LEAD ACKNOWLEDGEMENT */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-md font-semibold mb-4 pb-2 border-b text-gray-700">PRE LEAD ACKNOWLEDGEMENT</h3>
                <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <label className={labelClass}>Company</label>
                      <input value={preLeadData?.company_name || preLeadData?.first_name || ''} readOnly className={`${inputClass} flex-1`} />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className={labelClass}>Industry</label>
                      <input value={getOptionLabel(industryOptions, preLeadData?.industry_id?.toString() || '')} readOnly className={`${inputClass} flex-1`} />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className={labelClass}>Best Time (Call)</label>
                      <div className="flex gap-2 flex-1">
                        <input type="time" value={profileForm.q_bes_time_call} readOnly className={`${inputClass} w-28`} />
                        <input value={getOptionLabel(timezoneOptions, profileForm.q_bes_time_call_timezone)} readOnly className={`${inputClass} flex-1`} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className={labelClass}>Mode</label>
                      <input value={getOptionLabel(modeOptions, profileForm.q_mode)} readOnly className={`${inputClass} flex-1`} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <label className={labelClass}>Contact</label>
                      <input value={contacts.find(c => c.id.toString() === profileForm.q_contact_id)?.first_name + ' ' + (contacts.find(c => c.id.toString() === profileForm.q_contact_id)?.last_name || '') || '-'} readOnly className={`${inputClass} flex-1`} />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className={labelClass}>Designation</label>
                      <input value={contacts.find(c => c.id.toString() === profileForm.q_contact_id)?.designation || ''} readOnly className={`${inputClass} flex-1`} />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className={labelClass}>Phone</label>
                      <input value={contacts.find(c => c.id.toString() === profileForm.q_contact_id)?.work_phone || ''} readOnly className={`${inputClass} flex-1`} />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className={labelClass}>Email</label>
                      <input value={contacts.find(c => c.id.toString() === profileForm.q_contact_id)?.work_email || ''} readOnly className={`${inputClass} flex-1`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-md font-semibold mb-4 pb-2 border-b text-gray-700">Additional Information</h3>
                <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <label className={labelClass}>Need Type</label>
                      <input value={getOptionLabel(needTypeOptions, profileForm.q_need_type)} readOnly className={`${inputClass} flex-1`} />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className={labelClass}>Current Soft.</label>
                      <input value={profileForm.q_current_software} readOnly className={`${inputClass} flex-1`} />
                    </div>
                    <div className="flex items-start gap-3">
                      <label className={`${labelClass} pt-2`}>Need Summary</label>
                      <textarea value={profileForm.q_need_summery} readOnly rows={3} className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded resize-none bg-gray-100 cursor-not-allowed" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <label className={labelClass}>Budget</label>
                      <input value={getOptionLabel(budgetOptions, profileForm.q_budget)} readOnly className={`${inputClass} flex-1`} />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className={labelClass}>Decision Maker</label>
                      <input value={contacts.find(c => c.id.toString() === profileForm.q_decision_maker)?.first_name + ' ' + (contacts.find(c => c.id.toString() === profileForm.q_decision_maker)?.last_name || '') || '-'} readOnly className={`${inputClass} flex-1`} />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className={labelClass}>Time Frame</label>
                      <input value={getOptionLabel(timeFrameOptions, profileForm.q_time_frame)} readOnly className={`${inputClass} flex-1`} />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className={labelClass}>Qualified By</label>
                      <input value={getOptionLabel(salesRepOptions, profileForm.q_qualified_by)} readOnly className={`${inputClass} flex-1`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Profile Text */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-md font-semibold mb-4 pb-2 border-b text-gray-700">Company Profile</h3>
                <textarea value={profileForm.q_company_profile} readOnly rows={5} className="w-full px-3 py-2 text-sm border border-gray-300 rounded resize-none bg-gray-100 cursor-not-allowed" />
              </div>

              {/* Summary Of Discussion */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-md font-semibold mb-4 pb-2 border-b text-gray-700">Summary Of Discussion</h3>
                <textarea value={profileForm.q_summery_Of_discussion} readOnly rows={5} className="w-full px-3 py-2 text-sm border border-gray-300 rounded resize-none bg-gray-100 cursor-not-allowed" />
              </div>

              {/* Conclusion */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-md font-semibold mb-4 pb-2 border-b text-gray-700">Conclusion</h3>
                <textarea value={profileForm.q_conclusion} readOnly rows={5} className="w-full px-3 py-2 text-sm border border-gray-300 rounded resize-none bg-gray-100 cursor-not-allowed" />
              </div>
            </div>
          )}

          {/* ============== TAB 4: Memo ============== */}
          {activeTab === 'memo' && (
            <div>
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left w-32">Date</th>
                      <th className="px-4 py-3 text-left w-40">Added By</th>
                      <th className="px-4 py-3 text-left">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memos.map((memo) => (
                      <tr key={memo.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{new Date(memo.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">User #{memo.created_by}</td>
                        <td className="px-4 py-3">{memo.details || memo.content}</td>
                      </tr>
                    ))}
                    {memos.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-gray-500">No memos found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============== TAB 5: Workflow & Audit Trail ============== */}
          {activeTab === 'workflow' && (
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Remarks</th>
                    <th className="px-4 py-3 text-left">Updated By</th>
                  </tr>
                </thead>
                <tbody>
                  {statusHistory.map((history) => (
                    <tr key={history.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{new Date(history.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          history.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          history.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                          history.status === 'qualified' ? 'bg-green-100 text-green-800' :
                          history.status === 'discarded' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {history.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{history.remarks || '-'}</td>
                      <td className="px-4 py-3">User #{history.updated_by}</td>
                    </tr>
                  ))}
                  {statusHistory.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No status history found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
