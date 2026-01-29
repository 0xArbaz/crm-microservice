'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MainLayout } from '@/components/layout/MainLayout';
import { Plus, Calendar, ArrowRight, Pencil, Trash2, X } from 'lucide-react';
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
}

interface Memo {
  id: number;
  title: string;
  content: string;
  created_at: string;
  created_by: number;
}

interface QualifiedProfile {
  id: number;
  q_contact_id?: number;
  q_title?: string;
  q_phone?: string;
  q_email?: string;
  q_bes_time_call?: string;
  q_bes_time_call_timezone?: string;
  q_mode?: string;
  q_need_type?: string;
  q_current_software?: string;
  q_need_summery?: string;
  q_budget?: string;
  q_decision_maker?: string;
  q_time_frame?: string;
  q_qualified_by?: string;
  q_company_profile?: string;
  q_summery_Of_discussion?: string;
  q_conclusion?: string;
}

interface StatusHistory {
  id: number;
  status: string;
  status_date: string;
  remarks: string;
  created_at: string;
  updated_by: number;
}

// ============== Schema ==============
const preLeadSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  country_id: z.string().optional(),
  state_id: z.string().optional(),
  city_id: z.string().optional(),
  zip_code: z.string().optional(),
  phone_no: z.string().optional(),
  fax: z.string().optional(),
  website: z.string().optional(),
  nof_representative: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  lead_since: z.string().optional(),
  group_id: z.string().optional(),
  industry_id: z.string().optional(),
  region_id: z.string().optional(),
  from_timings: z.string().optional(),
  to_timings: z.string().optional(),
  timezone: z.string().optional(),
  sales_rep: z.string().optional(),
  source: z.string().optional(),
  lead_score: z.string().optional(),
  remarks: z.string().optional(),
});

type PreLeadForm = z.infer<typeof preLeadSchema>;

// ============== Options ==============
const sourceOptions = [
  { value: '', label: 'Select Lead Source' },
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'walk_in', label: 'Walk In' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'erp', label: 'ERP' },
  { value: 'other', label: 'Other' },
];

const groupOptions = [
  { value: '', label: 'Select Group' },
  { value: '1', label: 'Group A' },
  { value: '2', label: 'Group B' },
  { value: '3', label: 'Group C' },
];

const industryOptions = [
  { value: '', label: 'Select Industry' },
  { value: '1', label: 'Technology' },
  { value: '2', label: 'Manufacturing' },
  { value: '3', label: 'Healthcare' },
  { value: '4', label: 'Finance' },
  { value: '5', label: 'Retail' },
];

const regionOptions = [
  { value: '', label: 'Select Company Region' },
  { value: '1', label: 'North' },
  { value: '2', label: 'South' },
  { value: '3', label: 'East' },
  { value: '4', label: 'West' },
];

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

const countryOptions = [
  { value: '', label: 'Select Country' },
  { value: '1', label: 'India' },
  { value: '2', label: 'United States' },
  { value: '3', label: 'United Kingdom' },
  { value: '4', label: 'Oman' },
];

const stateOptions = [
  { value: '', label: 'Select State/Province' },
  { value: '1', label: 'Maharashtra' },
  { value: '2', label: 'Karnataka' },
  { value: '3', label: 'Delhi' },
  { value: '4', label: 'Muscat Governorate' },
];

const cityOptions = [
  { value: '', label: 'Select City' },
  { value: '1', label: 'Mumbai' },
  { value: '2', label: 'Bangalore' },
  { value: '3', label: 'Delhi' },
  { value: '4', label: 'Muscat' },
];

const contactTypeOptions = [
  { value: 'all', label: 'All' },
  { value: 'primary', label: 'Primary' },
  { value: 'billing', label: 'Billing' },
  { value: 'technical', label: 'Technical' },
  { value: 'decision_maker', label: 'Decision Maker' },
];

const titleOptions = [
  { value: '', label: 'Title' },
  { value: 'Mr.', label: 'Mr.' },
  { value: 'Mrs.', label: 'Mrs.' },
  { value: 'Ms.', label: 'Ms.' },
  { value: 'Dr.', label: 'Dr.' },
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

export default function EditPreLeadPage() {
  const router = useRouter();
  const params = useParams();
  const preLeadId = parseInt(params.id as string);

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [preLeadData, setPreLeadData] = useState<PreLead | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('company_details');
  const [isDiscarded, setIsDiscarded] = useState(false);

  // Tab-specific state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [qualifiedProfile, setQualifiedProfile] = useState<QualifiedProfile | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [contactFilter, setContactFilter] = useState('all');

  // Modal states
  const [showMemoModal, setShowMemoModal] = useState(false);
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);
  const [memoContent, setMemoContent] = useState('');

  // Contact form state
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [contactForm, setContactForm] = useState({
    contact_type: 'primary',
    title: '',
    first_name: '',
    last_name: '',
    designation: '',
    work_email: '',
    work_phone: '',
    ext: '',
    fax: '',
    cell_phone: '',
    status: 'active',
  });

  // Qualified Profile form state
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<PreLeadForm>({
    resolver: zodResolver(preLeadSchema),
  });

  const companyName = watch('company_name');

  // Fetch pre-lead data
  const fetchPreLead = useCallback(async () => {
    try {
      const preLeadRes = await api.getPreLead(preLeadId);
      setPreLeadData(preLeadRes);
      setIsDiscarded(preLeadRes.status === 'discarded');

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

      reset({
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
    } catch (err: any) {
      setError('Failed to load pre-lead');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [preLeadId, reset]);

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
          q_contact_id: profile.q_contact_id?.toString() || '',
          q_bes_time_call: profile.q_bes_time_call || '',
          q_bes_time_call_timezone: profile.q_bes_time_call_timezone || '',
          q_mode: profile.q_mode || '',
          q_need_type: profile.q_need_type || '',
          q_current_software: profile.q_current_software || '',
          q_need_summery: profile.q_need_summery || '',
          q_budget: profile.q_budget || '',
          q_decision_maker: profile.q_decision_maker || '',
          q_time_frame: profile.q_time_frame || '',
          q_qualified_by: profile.q_qualified_by || '',
          q_company_profile: profile.q_company_profile || '',
          q_summery_Of_discussion: profile.q_summery_Of_discussion || '',
          q_conclusion: profile.q_conclusion || '',
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

  // ============== Form Handlers ==============

  const onSubmit = async (data: PreLeadForm) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const officeTimings = data.from_timings && data.to_timings
        ? `${data.from_timings} - ${data.to_timings}`
        : '';

      const apiData: Record<string, any> = {
        ...data,
        first_name: data.company_name,
        office_timings: officeTimings,
        country_id: data.country_id ? parseInt(data.country_id) : undefined,
        state_id: data.state_id ? parseInt(data.state_id) : undefined,
        city_id: data.city_id ? parseInt(data.city_id) : undefined,
        group_id: data.group_id ? parseInt(data.group_id) : undefined,
        industry_id: data.industry_id ? parseInt(data.industry_id) : undefined,
        region_id: data.region_id ? parseInt(data.region_id) : undefined,
        sales_rep: data.sales_rep ? parseInt(data.sales_rep) : undefined,
        lead_score: data.lead_score ? parseInt(data.lead_score) : undefined,
      };

      await api.updatePreLead(preLeadId, apiData as Partial<PreLead>);
      setSuccess('Pre-lead updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update pre-lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = async () => {
    if (!window.confirm('Are you sure you want to discard this pre-lead?')) return;
    try {
      await api.discardPreLead(preLeadId, 'Discarded by user');
      setIsDiscarded(true);
      setSuccess('Pre-lead discarded successfully');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to discard pre-lead');
    }
  };

  const handleRestore = async () => {
    if (!window.confirm('Are you sure you want to restore this pre-lead?')) return;
    try {
      await api.updatePreLead(preLeadId, { status: 'new' } as Partial<PreLead>);
      setIsDiscarded(false);
      setSuccess('Pre-lead restored successfully');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to restore pre-lead');
    }
  };

  const handleMoveToLead = async () => {
    if (!window.confirm('Are you sure you want to move this to Lead?')) return;
    try {
      const result = await api.validatePreLead(preLeadId, {});
      router.push(`/leads/${result.lead_id}/edit`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to move to lead');
    }
  };

  // ============== Contact Handlers ==============

  const handleAddContact = async () => {
    if (!contactForm.first_name || !contactForm.last_name || !contactForm.work_email) {
      setError('Please fill required fields: First Name, Last Name, Work Email');
      return;
    }
    try {
      if (editingContact) {
        await api.updatePreLeadContact(preLeadId, editingContact.id, contactForm);
        setSuccess('Contact updated successfully');
      } else {
        await api.createPreLeadContact(preLeadId, contactForm);
        setSuccess('Contact added successfully');
      }
      fetchContacts();
      resetContactForm();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save contact');
    }
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setContactForm({
      contact_type: contact.contact_type || 'primary',
      title: contact.title || '',
      first_name: contact.first_name || '',
      last_name: contact.last_name || '',
      designation: contact.designation || '',
      work_email: contact.work_email || '',
      work_phone: contact.work_phone || '',
      ext: contact.ext || '',
      fax: contact.fax || '',
      cell_phone: contact.cell_phone || '',
      status: contact.status || 'active',
    });
    setShowContactForm(true);
  };

  const handleDeleteContact = async (contactId: number) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      await api.deletePreLeadContact(preLeadId, contactId);
      fetchContacts();
      setSuccess('Contact deleted successfully');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete contact');
    }
  };

  const resetContactForm = () => {
    setEditingContact(null);
    setShowContactForm(false);
    setContactForm({
      contact_type: 'primary',
      title: '',
      first_name: '',
      last_name: '',
      designation: '',
      work_email: '',
      work_phone: '',
      ext: '',
      fax: '',
      cell_phone: '',
      status: 'active',
    });
  };

  // ============== Memo Handlers ==============

  const handleAddMemo = () => {
    setEditingMemo(null);
    setMemoContent('');
    setShowMemoModal(true);
  };

  const handleEditMemo = (memo: Memo) => {
    setEditingMemo(memo);
    setMemoContent(memo.content);
    setShowMemoModal(true);
  };

  const handleSaveMemo = async () => {
    if (!memoContent.trim()) {
      setError('Please enter memo content');
      return;
    }
    try {
      if (editingMemo) {
        await api.updatePreLeadMemo(preLeadId, editingMemo.id, {
          title: 'Memo',
          content: memoContent,
        });
        setSuccess('Memo updated successfully');
      } else {
        await api.createPreLeadMemo(preLeadId, {
          title: 'Memo',
          content: memoContent,
          memo_type: 'general',
        });
        setSuccess('Memo added successfully');
      }
      fetchMemos();
      setShowMemoModal(false);
      setMemoContent('');
      setEditingMemo(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save memo');
    }
  };

  const handleDeleteMemo = async (memoId: number) => {
    if (!window.confirm('Are you sure you want to delete this memo?')) return;
    try {
      await api.deletePreLeadMemo(preLeadId, memoId);
      fetchMemos();
      setSuccess('Memo deleted successfully');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete memo');
    }
  };

  // ============== Qualified Profile Handlers ==============

  const handleSaveProfile = async () => {
    try {
      const profileData = {
        ...profileForm,
        profile_type: 'basic',
      };

      if (qualifiedProfile) {
        await api.updatePreLeadQualifiedProfile(preLeadId, qualifiedProfile.id, profileData);
      } else {
        await api.createPreLeadQualifiedProfile(preLeadId, profileData);
      }
      fetchQualifiedProfile();
      setSuccess('Company Profile saved successfully');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save profile');
    }
  };

  // ============== Styling ==============
  const inputClass = "w-full h-9 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500";
  const selectClass = "w-full h-9 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white";
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
          <h1 className="text-sm font-medium">
            MODIFY PRE LEAD - {companyName || preLeadData?.company_name || preLeadData?.first_name || ''}
            {isDiscarded && <span className="ml-4 bg-red-200 text-red-800 px-2 py-1 rounded text-xs uppercase">DISCARDED</span>}
          </h1>
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

        {error && <div className="mx-4 mt-4 p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}
        {success && <div className="mx-4 mt-4 p-3 bg-green-50 text-green-600 rounded text-sm">{success}</div>}

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          {/* ============== TAB 1: Company Details ============== */}
          {activeTab === 'company_details' && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Company Name</label>
                    <input placeholder="Company Name" className={`${inputClass} flex-1 bg-blue-50`} {...register('company_name')} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Address</label>
                    <input placeholder="Address Line 1" className={`${inputClass} flex-1 bg-yellow-50`} {...register('address_line1')} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}></label>
                    <input placeholder="P.O. Box" className={`${inputClass} flex-1`} {...register('address_line2')} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Country</label>
                    <select className={`${selectClass} flex-1 bg-blue-50`} {...register('country_id')}>
                      {countryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>State/Province</label>
                    <select className={`${selectClass} flex-1 bg-blue-50`} {...register('state_id')}>
                      {stateOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>City</label>
                    <div className="flex gap-2 flex-1">
                      <select className={`${selectClass} flex-1 bg-blue-50`} {...register('city_id')}>
                        {cityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                      <button type="button" className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-50">
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Postal/Zip Code</label>
                    <input placeholder="Postal/Zip Code" className={`${inputClass} flex-1`} {...register('zip_code')} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Phone</label>
                    <input placeholder="+{Country Code}{Area Code}{Phone}" className={`${inputClass} flex-1 bg-blue-50`} {...register('phone_no')} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Fax</label>
                    <input placeholder="+{Country Code}{Area Code}{Fax}" className={`${inputClass} flex-1`} {...register('fax')} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Website</label>
                    <input placeholder="https://" className={`${inputClass} flex-1 bg-blue-50`} {...register('website')} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Name of Rep.</label>
                    <input placeholder="Name of Representative" className={`${inputClass} flex-1`} {...register('nof_representative')} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Contact Phone</label>
                    <input placeholder="+{Country Code}{Area Code}{Contact Phone}" className={`${inputClass} flex-1`} {...register('phone')} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Email ID</label>
                    <input type="email" placeholder="Email" className={`${inputClass} flex-1 bg-blue-50`} {...register('email')} />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Lead Registered</label>
                    <div className="flex gap-2 flex-1">
                      <input type="date" className={`${inputClass} flex-1`} {...register('lead_since')} />
                      <button type="button" className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-50">
                        <Calendar className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Group</label>
                    <div className="flex gap-2 flex-1">
                      <select className={`${selectClass} flex-1`} {...register('group_id')}>
                        {groupOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                      <button type="button" className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-50">
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Industry</label>
                    <div className="flex gap-2 flex-1">
                      <select className={`${selectClass} flex-1`} {...register('industry_id')}>
                        {industryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                      <button type="button" className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-50">
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Company Region</label>
                    <div className="flex gap-2 flex-1">
                      <select className={`${selectClass} flex-1`} {...register('region_id')}>
                        {regionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                      <button type="button" className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-50">
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Office Timing</label>
                    <div className="flex gap-2 flex-1 items-center">
                      <input type="time" className={`${inputClass} flex-1`} {...register('from_timings')} />
                      <input type="time" className={`${inputClass} flex-1`} {...register('to_timings')} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Company Timezone</label>
                    <select className={`${selectClass} flex-1`} {...register('timezone')}>
                      {timezoneOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Sales Representative</label>
                    <select className={`${selectClass} flex-1`} {...register('sales_rep')}>
                      {salesRepOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Lead Source</label>
                    <div className="flex gap-2 flex-1">
                      <select className={`${selectClass} flex-1`} {...register('source')}>
                        {sourceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                      <button type="button" className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-50">
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={labelClass}>Lead Score</label>
                    <select className={`${selectClass} flex-1`} {...register('lead_score')}>
                      {leadScoreOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div className="flex items-start gap-3">
                    <label className={`${labelClass} pt-2`}>Remarks</label>
                    <textarea placeholder="Remarks" rows={3} className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" {...register('remarks')} />
                  </div>
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="flex justify-center gap-3 mt-8 pt-4 border-t">
                {!isDiscarded && (
                  <button type="button" onClick={handleDiscard} className="px-6 py-2 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600 transition-colors">
                    Discard
                  </button>
                )}
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600 transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
                {!isDiscarded ? (
                  <button type="button" onClick={handleMoveToLead} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-2">
                    Move To Lead <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button type="button" onClick={handleRestore} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-2">
                    Restore Pre Lead <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          )}

          {/* ============== TAB 2: Contacts ============== */}
          {activeTab === 'contacts' && (
            <div>
              {/* Filter */}
              <div className="flex items-center gap-4 mb-4">
                <label className="text-sm text-blue-600">Contact Type</label>
                <select
                  value={contactFilter}
                  onChange={(e) => setContactFilter(e.target.value)}
                  className={`${selectClass} w-48`}
                >
                  {contactTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>

              {/* Contacts Table */}
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-3 py-2 text-left">Contact</th>
                      <th className="px-3 py-2 text-left">Title</th>
                      <th className="px-3 py-2 text-left">First Name</th>
                      <th className="px-3 py-2 text-left">Last Name</th>
                      <th className="px-3 py-2 text-left">Designation</th>
                      <th className="px-3 py-2 text-left">Work Email</th>
                      <th className="px-3 py-2 text-left">Work Phone</th>
                      <th className="px-3 py-2 text-left">Ext.</th>
                      <th className="px-3 py-2 text-left">Fax</th>
                      <th className="px-3 py-2 text-left">Cell Phone</th>
                      <th className="px-3 py-2 text-center">Status</th>
                      <th className="px-3 py-2 text-center">Action</th>
                    </tr>
                    {/* Add Row */}
                    {showContactForm && (
                      <tr className="bg-blue-50">
                        <td className="px-2 py-2">
                          <select value={contactForm.contact_type} onChange={e => setContactForm({...contactForm, contact_type: e.target.value})} className={`${selectClass} w-full text-xs`}>
                            {contactTypeOptions.filter(o => o.value !== 'all').map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </td>
                        <td className="px-2 py-2">
                          <select value={contactForm.title} onChange={e => setContactForm({...contactForm, title: e.target.value})} className={`${selectClass} w-full text-xs`}>
                            {titleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </td>
                        <td className="px-2 py-2"><input value={contactForm.first_name} onChange={e => setContactForm({...contactForm, first_name: e.target.value})} className={`${inputClass} w-full text-xs`} placeholder="First Name" /></td>
                        <td className="px-2 py-2"><input value={contactForm.last_name} onChange={e => setContactForm({...contactForm, last_name: e.target.value})} className={`${inputClass} w-full text-xs`} placeholder="Last Name" /></td>
                        <td className="px-2 py-2"><input value={contactForm.designation} onChange={e => setContactForm({...contactForm, designation: e.target.value})} className={`${inputClass} w-full text-xs`} placeholder="Designation" /></td>
                        <td className="px-2 py-2"><input value={contactForm.work_email} onChange={e => setContactForm({...contactForm, work_email: e.target.value})} className={`${inputClass} w-full text-xs`} placeholder="Email" /></td>
                        <td className="px-2 py-2"><input value={contactForm.work_phone} onChange={e => setContactForm({...contactForm, work_phone: e.target.value})} className={`${inputClass} w-full text-xs`} placeholder="Phone" /></td>
                        <td className="px-2 py-2"><input value={contactForm.ext} onChange={e => setContactForm({...contactForm, ext: e.target.value})} className={`${inputClass} w-16 text-xs`} placeholder="Ext" /></td>
                        <td className="px-2 py-2"><input value={contactForm.fax} onChange={e => setContactForm({...contactForm, fax: e.target.value})} className={`${inputClass} w-full text-xs`} placeholder="Fax" /></td>
                        <td className="px-2 py-2"><input value={contactForm.cell_phone} onChange={e => setContactForm({...contactForm, cell_phone: e.target.value})} className={`${inputClass} w-full text-xs`} placeholder="Cell" /></td>
                        <td className="px-2 py-2">
                          <select value={contactForm.status} onChange={e => setContactForm({...contactForm, status: e.target.value})} className={`${selectClass} w-full text-xs`}>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <button onClick={handleAddContact} className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 mr-1">
                            {editingContact ? 'Save' : 'Add'}
                          </button>
                          <button onClick={resetContactForm} className="px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500">
                            Cancel
                          </button>
                        </td>
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {!showContactForm && (
                      <tr className="border-b bg-gray-50">
                        <td colSpan={12} className="px-3 py-2">
                          <button onClick={() => setShowContactForm(true)} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                            + Add Contact
                          </button>
                        </td>
                      </tr>
                    )}
                    {filteredContacts.map((contact) => (
                      <tr key={contact.id} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-2">{contact.contact_type}</td>
                        <td className="px-3 py-2">{contact.title}</td>
                        <td className="px-3 py-2">{contact.first_name}</td>
                        <td className="px-3 py-2">{contact.last_name}</td>
                        <td className="px-3 py-2">{contact.designation}</td>
                        <td className="px-3 py-2">{contact.work_email}</td>
                        <td className="px-3 py-2">{contact.work_phone}</td>
                        <td className="px-3 py-2">{contact.ext}</td>
                        <td className="px-3 py-2">{contact.fax}</td>
                        <td className="px-3 py-2">{contact.cell_phone}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${contact.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {contact.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button onClick={() => handleEditContact(contact)} className="p-1 text-blue-600 hover:bg-blue-50 rounded mr-1">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteContact(contact.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredContacts.length === 0 && (
                      <tr>
                        <td colSpan={12} className="px-3 py-8 text-center text-gray-500">No contacts found</td>
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
                      <input value={preLeadData?.company_name || preLeadData?.first_name || ''} readOnly className={`${inputClass} flex-1 bg-gray-100`} />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className={labelClass}>Industry</label>
                      <input value={industryOptions.find(o => o.value === preLeadData?.industry_id?.toString())?.label || ''} readOnly className={`${inputClass} flex-1 bg-gray-100`} />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className={labelClass}>Best Time (Call)</label>
                      <div className="flex gap-2 flex-1">
                        <input type="time" value={profileForm.q_bes_time_call} onChange={e => setProfileForm({...profileForm, q_bes_time_call: e.target.value})} className={`${inputClass} w-28`} />
                        <select value={profileForm.q_bes_time_call_timezone} onChange={e => setProfileForm({...profileForm, q_bes_time_call_timezone: e.target.value})} className={`${selectClass} flex-1`}>
                          {timezoneOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className={labelClass}>Mode</label>
                      <select value={profileForm.q_mode} onChange={e => setProfileForm({...profileForm, q_mode: e.target.value})} className={`${selectClass} flex-1`}>
                        {modeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <label className={labelClass}>Contact</label>
                      <select value={profileForm.q_contact_id} onChange={e => setProfileForm({...profileForm, q_contact_id: e.target.value})} className={`${selectClass} flex-1`}>
                        <option value="">Select Contact</option>
                        {contacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className={labelClass}>Designation</label>
                      <input value={contacts.find(c => c.id.toString() === profileForm.q_contact_id)?.designation || ''} readOnly className={`${inputClass} flex-1 bg-gray-100`} />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className={labelClass}>Phone</label>
                      <input value={contacts.find(c => c.id.toString() === profileForm.q_contact_id)?.work_phone || ''} readOnly className={`${inputClass} flex-1 bg-gray-100`} />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className={labelClass}>Email</label>
                      <input value={contacts.find(c => c.id.toString() === profileForm.q_contact_id)?.work_email || ''} readOnly className={`${inputClass} flex-1 bg-gray-100`} />
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
                      <select value={profileForm.q_need_type} onChange={e => setProfileForm({...profileForm, q_need_type: e.target.value})} className={`${selectClass} flex-1`}>
                        {needTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className={labelClass}>Current Soft.</label>
                      <input value={profileForm.q_current_software} onChange={e => setProfileForm({...profileForm, q_current_software: e.target.value})} className={`${inputClass} flex-1`} placeholder="Current Software" />
                    </div>
                    <div className="flex items-start gap-3">
                      <label className={`${labelClass} pt-2`}>Need Summary</label>
                      <textarea value={profileForm.q_need_summery} onChange={e => setProfileForm({...profileForm, q_need_summery: e.target.value})} rows={3} className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded resize-none" placeholder="Summary" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <label className={labelClass}>Budget</label>
                      <select value={profileForm.q_budget} onChange={e => setProfileForm({...profileForm, q_budget: e.target.value})} className={`${selectClass} flex-1`}>
                        {budgetOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className={labelClass}>Decision Maker</label>
                      <select value={profileForm.q_decision_maker} onChange={e => setProfileForm({...profileForm, q_decision_maker: e.target.value})} className={`${selectClass} flex-1`}>
                        <option value="">Select Contact</option>
                        {contacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className={labelClass}>Time Frame</label>
                      <select value={profileForm.q_time_frame} onChange={e => setProfileForm({...profileForm, q_time_frame: e.target.value})} className={`${selectClass} flex-1`}>
                        {timeFrameOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className={labelClass}>Qualified By</label>
                      <select value={profileForm.q_qualified_by} onChange={e => setProfileForm({...profileForm, q_qualified_by: e.target.value})} className={`${selectClass} flex-1`}>
                        {salesRepOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Profile Text */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-md font-semibold mb-4 pb-2 border-b text-gray-700">Company Profile</h3>
                <textarea value={profileForm.q_company_profile} onChange={e => setProfileForm({...profileForm, q_company_profile: e.target.value})} rows={5} className="w-full px-3 py-2 text-sm border border-gray-300 rounded resize-none" placeholder="Enter company profile..." />
              </div>

              {/* Summary Of Discussion */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-md font-semibold mb-4 pb-2 border-b text-gray-700">Summary Of Discussion</h3>
                <textarea value={profileForm.q_summery_Of_discussion} onChange={e => setProfileForm({...profileForm, q_summery_Of_discussion: e.target.value})} rows={5} className="w-full px-3 py-2 text-sm border border-gray-300 rounded resize-none" placeholder="Enter summary of discussion..." />
              </div>

              {/* Conclusion */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-md font-semibold mb-4 pb-2 border-b text-gray-700">Conclusion</h3>
                <textarea value={profileForm.q_conclusion} onChange={e => setProfileForm({...profileForm, q_conclusion: e.target.value})} rows={5} className="w-full px-3 py-2 text-sm border border-gray-300 rounded resize-none" placeholder="Enter conclusion..." />
              </div>

              {/* Save Button */}
              <div className="flex justify-center">
                <button onClick={handleSaveProfile} className="px-6 py-2 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600 transition-colors">
                  Save
                </button>
              </div>
            </div>
          )}

          {/* ============== TAB 4: Memo ============== */}
          {activeTab === 'memo' && (
            <div>
              <button onClick={handleAddMemo} className="mb-4 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                Add Memo
              </button>

              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left w-32">Date</th>
                      <th className="px-4 py-3 text-left w-40">Added By</th>
                      <th className="px-4 py-3 text-left">Details</th>
                      <th className="px-4 py-3 text-center w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memos.map((memo) => (
                      <tr key={memo.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{new Date(memo.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">User #{memo.created_by}</td>
                        <td className="px-4 py-3" dangerouslySetInnerHTML={{ __html: memo.content }} />
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => handleEditMemo(memo)} className="p-1 text-blue-600 hover:bg-blue-50 rounded mr-1">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteMemo(memo.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {memos.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No memos found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Memo Modal */}
              {showMemoModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg w-full max-w-2xl">
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                      <h3 className="text-lg font-semibold">Memo Details</h3>
                      <button onClick={() => setShowMemoModal(false)} className="p-1 hover:bg-gray-100 rounded">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-4">
                      <textarea
                        value={memoContent}
                        onChange={(e) => setMemoContent(e.target.value)}
                        rows={10}
                        className="w-full px-3 py-2 border border-gray-300 rounded resize-none"
                        placeholder="Enter memo details..."
                      />
                    </div>
                    <div className="flex justify-center gap-3 px-4 py-3 border-t">
                      <button onClick={handleSaveMemo} className="px-6 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600">
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
