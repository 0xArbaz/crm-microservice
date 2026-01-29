'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  Save,
  Plus,
  Edit,
  Trash2,
  X,
  Upload,
  Download,
  FileText,
  Phone,
  Mail,
  User,
  MessageSquare,
  Clock,
  Calendar as CalendarIcon
} from 'lucide-react';
import api from '@/lib/api';
import { Lead, Contact, Activity } from '@/types';
import { formatDate } from '@/lib/utils';

// Types for Lead entities
interface LeadContact {
  id?: number;
  lead_id: number;
  contact_type: string;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  designation?: string;
  department?: string;
  is_primary: boolean;
  created_at?: string;
}

interface LeadActivity {
  id?: number;
  lead_id: number;
  activity_type: string;
  subject: string;
  description?: string;
  outcome?: string;
  activity_date: string;
  due_date?: string;
  is_completed: boolean;
  performed_by?: number;
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
  created_at?: string;
}

interface QualifiedLeadProfile {
  id?: number;
  lead_id: number;
  profile_type: string;
  company_type?: string;
  annual_revenue?: string;
  employee_count?: string;
  decision_maker?: string;
  budget?: string;
  timeline?: string;
  pain_points?: string;
  competitors?: string;
  notes?: string;
  created_at?: string;
}

// Validation Schema
const leadSchema = z.object({
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
  status: z.string().optional(),
  group_id: z.string().optional(),
  industry_id: z.string().optional(),
  region_id: z.string().optional(),
  from_timings: z.string().optional(),
  to_timings: z.string().optional(),
  timezone: z.string().optional(),
  sales_rep: z.string().optional(),
  source: z.string().optional(),
  lead_score: z.string().optional(),
  priority: z.string().optional(),
  expected_value: z.string().optional(),
  remarks: z.string().optional(),
});

type LeadForm = z.infer<typeof leadSchema>;

// Options
const sourceOptions = [
  { value: '', label: 'Select Lead Source' },
  { value: 'pre_lead', label: 'Pre-Lead' },
  { value: 'direct', label: 'Direct' },
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
  { value: '', label: 'Select Region' },
  { value: '1', label: 'North' },
  { value: '2', label: 'South' },
  { value: '3', label: 'East' },
  { value: '4', label: 'West' },
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

const countryOptions = [
  { value: '', label: 'Select Country' },
  { value: '1', label: 'India' },
  { value: '2', label: 'United States' },
  { value: '3', label: 'United Kingdom' },
];

const stateOptions = [
  { value: '', label: 'Select State' },
  { value: '1', label: 'Maharashtra' },
  { value: '2', label: 'Karnataka' },
  { value: '3', label: 'Delhi' },
];

const cityOptions = [
  { value: '', label: 'Select City' },
  { value: '1', label: 'Mumbai' },
  { value: '2', label: 'Bangalore' },
  { value: '3', label: 'Delhi' },
];

const contactTypeOptions = [
  { value: 'primary', label: 'Primary' },
  { value: 'billing', label: 'Billing' },
  { value: 'technical', label: 'Technical' },
  { value: 'decision_maker', label: 'Decision Maker' },
  { value: 'influencer', label: 'Influencer' },
  { value: 'other', label: 'Other' },
];

const activityTypeOptions = [
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'note', label: 'Note' },
  { value: 'task', label: 'Task' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'other', label: 'Other' },
];

const memoTypeOptions = [
  { value: 'general', label: 'General' },
  { value: 'meeting_notes', label: 'Meeting Notes' },
  { value: 'call_notes', label: 'Call Notes' },
  { value: 'internal', label: 'Internal' },
  { value: 'important', label: 'Important' },
];

const profileTypeOptions = [
  { value: 'basic', label: 'Basic' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'enterprise', label: 'Enterprise' },
];

type TabType = 'company' | 'contacts' | 'activities' | 'qualified' | 'memo' | 'upload' | 'status' | 'workflow';

export default function EditLeadPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = parseInt(params.id as string);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('company');

  // Loading and status states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Data states
  const [leadData, setLeadData] = useState<Lead | null>(null);
  const [contacts, setContacts] = useState<LeadContact[]>([]);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [memos, setMemos] = useState<LeadMemo[]>([]);
  const [documents, setDocuments] = useState<LeadDocument[]>([]);
  const [statusHistory, setStatusHistory] = useState<LeadStatusHistory[]>([]);
  const [qualifiedProfiles, setQualifiedProfiles] = useState<QualifiedLeadProfile[]>([]);

  // Contact Tab state - moved to top level
  const [contactTypeFilter, setContactTypeFilter] = useState<string>('all');
  const [inlineContactForm, setInlineContactForm] = useState<LeadContact | null>(null);
  const [editingContactId, setEditingContactId] = useState<number | null>(null);

  // Activity Modal state
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<LeadActivity | null>(null);

  // Memo Modal state
  const [showMemoModal, setShowMemoModal] = useState(false);
  const [editingMemo, setEditingMemo] = useState<LeadMemo | null>(null);

  // Document Modal state
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentNotes, setDocumentNotes] = useState('');

  // Status Modal state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState({ status: '', status_date: '', remarks: '' });

  // Qualified Profile Modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<QualifiedLeadProfile | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadForm>({
    resolver: zodResolver(leadSchema),
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

      reset({
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
        status: leadRes.status || '',
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

      // Fetch related entities - using try/catch for graceful fallback
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
      } catch { setQualifiedProfiles([]); }

    } catch (err: any) {
      setError('Failed to load lead');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [leadId, reset]);

  useEffect(() => {
    if (leadId) {
      fetchLeadData();
    }
  }, [leadId, fetchLeadData]);

  // Form Submit Handler
  const onSubmit = async (data: LeadForm) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const office_timings = data.from_timings && data.to_timings
        ? `${data.from_timings} - ${data.to_timings}`
        : undefined;

      const apiData: Record<string, any> = {
        ...data,
        first_name: data.company_name,
        office_timings,
        country_id: data.country_id ? parseInt(data.country_id) : undefined,
        state_id: data.state_id ? parseInt(data.state_id) : undefined,
        city_id: data.city_id ? parseInt(data.city_id) : undefined,
        group_id: data.group_id ? parseInt(data.group_id) : undefined,
        industry_id: data.industry_id ? parseInt(data.industry_id) : undefined,
        region_id: data.region_id ? parseInt(data.region_id) : undefined,
        lead_score: data.lead_score ? parseInt(data.lead_score) : undefined,
        expected_value: data.expected_value ? parseFloat(data.expected_value) : undefined,
      };

      delete apiData.from_timings;
      delete apiData.to_timings;

      await api.updateLead(leadId, apiData as Partial<Lead>);
      setSuccess('Lead updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Contact Handlers
  const handleAddContact = () => {
    setEditingContactId(null);
    setInlineContactForm({
      lead_id: leadId,
      contact_type: 'primary',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      designation: '',
      department: '',
      is_primary: false,
    });
  };

  const handleEditContact = (contact: LeadContact) => {
    setEditingContactId(contact.id || null);
    setInlineContactForm({ ...contact });
  };

  const handleSaveContact = async () => {
    if (!inlineContactForm) return;
    try {
      if (editingContactId) {
        await api.updateLeadContact(leadId, editingContactId, inlineContactForm);
      } else {
        await api.createLeadContact(leadId, inlineContactForm);
      }
      setInlineContactForm(null);
      setEditingContactId(null);
      const contactsRes = await api.getLeadContactsForEdit(leadId);
      setContacts(contactsRes || []);
      setSuccess('Contact saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save contact');
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      await api.deleteLeadContact(leadId, contactId);
      const contactsRes = await api.getLeadContactsForEdit(leadId);
      setContacts(contactsRes || []);
      setSuccess('Contact deleted!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete contact');
    }
  };

  // Activity Handlers
  const handleAddActivity = () => {
    setEditingActivity({
      lead_id: leadId,
      activity_type: 'call',
      subject: '',
      description: '',
      outcome: '',
      activity_date: new Date().toISOString().split('T')[0],
      is_completed: false,
    });
    setShowActivityModal(true);
  };

  const handleEditActivity = (activity: LeadActivity) => {
    setEditingActivity({ ...activity });
    setShowActivityModal(true);
  };

  const handleSaveActivity = async () => {
    if (!editingActivity) return;
    try {
      if (editingActivity.id) {
        await api.updateLeadActivity(leadId, editingActivity.id, editingActivity);
      } else {
        await api.createLeadActivity(leadId, editingActivity);
      }
      setShowActivityModal(false);
      setEditingActivity(null);
      const activitiesRes = await api.getLeadActivitiesForEdit(leadId);
      setActivities(activitiesRes || []);
      setSuccess('Activity saved!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save activity');
    }
  };

  const handleDeleteActivity = async (activityId: number) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    try {
      await api.deleteLeadActivity(leadId, activityId);
      const activitiesRes = await api.getLeadActivitiesForEdit(leadId);
      setActivities(activitiesRes || []);
      setSuccess('Activity deleted!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete activity');
    }
  };

  // Memo Handlers
  const handleAddMemo = () => {
    setEditingMemo({
      lead_id: leadId,
      memo_type: 'general',
      title: '',
      content: '',
    });
    setShowMemoModal(true);
  };

  const handleEditMemo = (memo: LeadMemo) => {
    setEditingMemo({ ...memo });
    setShowMemoModal(true);
  };

  const handleSaveMemo = async () => {
    if (!editingMemo) return;
    try {
      if (editingMemo.id) {
        await api.updateLeadMemo(leadId, editingMemo.id, editingMemo);
      } else {
        await api.createLeadMemo(leadId, editingMemo);
      }
      setShowMemoModal(false);
      setEditingMemo(null);
      const memosRes = await api.getLeadMemos(leadId);
      setMemos(memosRes || []);
      setSuccess('Memo saved!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save memo');
    }
  };

  const handleDeleteMemo = async (memoId: number) => {
    if (!confirm('Are you sure you want to delete this memo?')) return;
    try {
      await api.deleteLeadMemo(leadId, memoId);
      const memosRes = await api.getLeadMemos(leadId);
      setMemos(memosRes || []);
      setSuccess('Memo deleted!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete memo');
    }
  };

  // Document Handlers
  const handleUploadDocument = async () => {
    if (!documentFile) return;
    try {
      await api.uploadLeadDocument(leadId, documentFile, documentNotes);
      setShowDocumentModal(false);
      setDocumentFile(null);
      setDocumentNotes('');
      const docsRes = await api.getLeadDocuments(leadId);
      setDocuments(docsRes || []);
      setSuccess('Document uploaded!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload document');
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.deleteLeadDocument(leadId, documentId);
      const docsRes = await api.getLeadDocuments(leadId);
      setDocuments(docsRes || []);
      setSuccess('Document deleted!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete document');
    }
  };

  // Status Handlers
  const handleChangeStatus = async () => {
    if (!newStatus.status) return;
    try {
      await api.changeLeadStatus(leadId, newStatus);
      setShowStatusModal(false);
      setNewStatus({ status: '', status_date: '', remarks: '' });
      const historyRes = await api.getLeadStatusHistory(leadId);
      setStatusHistory(historyRes || []);
      await fetchLeadData();
      setSuccess('Status changed!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to change status');
    }
  };

  // Qualified Profile Handlers
  const handleAddProfile = () => {
    setEditingProfile({
      lead_id: leadId,
      profile_type: 'basic',
      company_type: '',
      annual_revenue: '',
      employee_count: '',
      decision_maker: '',
      budget: '',
      timeline: '',
      pain_points: '',
      competitors: '',
      notes: '',
    });
    setShowProfileModal(true);
  };

  const handleEditProfile = (profile: QualifiedLeadProfile) => {
    setEditingProfile({ ...profile });
    setShowProfileModal(true);
  };

  const handleSaveProfile = async () => {
    if (!editingProfile) return;
    try {
      if (editingProfile.id) {
        await api.updateLeadQualifiedProfile(leadId, editingProfile.id, editingProfile);
      } else {
        await api.createLeadQualifiedProfile(leadId, editingProfile);
      }
      setShowProfileModal(false);
      setEditingProfile(null);
      const profilesRes = await api.getLeadQualifiedProfiles(leadId);
      setQualifiedProfiles(profilesRes || []);
      setSuccess('Profile saved!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save profile');
    }
  };

  const handleDeleteProfile = async (profileId: number) => {
    if (!confirm('Are you sure you want to delete this profile?')) return;
    try {
      await api.deleteLeadQualifiedProfile(leadId, profileId);
      const profilesRes = await api.getLeadQualifiedProfiles(leadId);
      setQualifiedProfiles(profilesRes || []);
      setSuccess('Profile deleted!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete profile');
    }
  };

  // Styles
  const inputClass = "w-full h-9 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500";
  const selectClass = "w-full h-9 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white";
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

  // Render Company Details Tab
  const renderCompanyDetails = () => (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
        {/* Left Column */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className={labelClass}>Company *</label>
            <input placeholder="Company Name" className={`${inputClass} flex-1`} {...register('company_name')} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Address Line 1</label>
            <input placeholder="Address Line 1" className={`${inputClass} flex-1`} {...register('address_line1')} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Address Line 2</label>
            <input placeholder="Address Line 2" className={`${inputClass} flex-1`} {...register('address_line2')} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Country</label>
            <select className={`${selectClass} flex-1`} {...register('country_id')}>
              {countryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>State</label>
            <select className={`${selectClass} flex-1`} {...register('state_id')}>
              {stateOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>City</label>
            <select className={`${selectClass} flex-1`} {...register('city_id')}>
              {cityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Zip Code</label>
            <input placeholder="Zip Code" className={`${inputClass} flex-1`} {...register('zip_code')} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Phone</label>
            <input placeholder="Phone" className={`${inputClass} flex-1`} {...register('phone_no')} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Fax</label>
            <input placeholder="Fax" className={`${inputClass} flex-1`} {...register('fax')} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Website</label>
            <input placeholder="Website" className={`${inputClass} flex-1`} {...register('website')} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Representative</label>
            <input placeholder="Name of Representative" className={`${inputClass} flex-1`} {...register('nof_representative')} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Mobile</label>
            <input placeholder="Mobile" className={`${inputClass} flex-1`} {...register('phone')} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Email</label>
            <input type="email" placeholder="Email" className={`${inputClass} flex-1`} {...register('email')} />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className={labelClass}>Lead Since</label>
            <input type="date" className={`${inputClass} flex-1`} {...register('lead_since')} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Lead Status</label>
            <select className={`${selectClass} flex-1`} {...register('status')}>
              {leadStatusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Priority</label>
            <select className={`${selectClass} flex-1`} {...register('priority')}>
              {priorityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Expected Value</label>
            <input type="number" placeholder="Expected Value" className={`${inputClass} flex-1`} {...register('expected_value')} />
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Group</label>
            <select className={`${selectClass} flex-1`} {...register('group_id')}>
              {groupOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Industry</label>
            <select className={`${selectClass} flex-1`} {...register('industry_id')}>
              {industryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Region</label>
            <select className={`${selectClass} flex-1`} {...register('region_id')}>
              {regionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Office Timing</label>
            <div className="flex gap-2 flex-1">
              <input type="time" className={`${inputClass} flex-1`} {...register('from_timings')} />
              <input type="time" className={`${inputClass} flex-1`} {...register('to_timings')} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Timezone</label>
            <select className={`${selectClass} flex-1`} {...register('timezone')}>
              {timezoneOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Sales Rep</label>
            <select className={`${selectClass} flex-1`} {...register('sales_rep')}>
              {salesRepOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className={labelClass}>Lead Source</label>
            <select className={`${selectClass} flex-1`} {...register('source')}>
              {sourceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
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

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={() => router.push('/leads')}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );

  // Render Contacts Tab
  const renderContacts = () => {
    const filteredContacts = contactTypeFilter === 'all'
      ? contacts
      : contacts.filter(c => c.contact_type === contactTypeFilter);

    return (
      <div>
        {/* Header with filter and add button */}
        <div className="flex items-center justify-between mb-4 p-3 bg-blue-600 text-white rounded-t">
          <div className="flex items-center gap-4">
            <span className="font-medium">Contacts</span>
            <select
              value={contactTypeFilter}
              onChange={(e) => setContactTypeFilter(e.target.value)}
              className="h-8 px-2 text-sm bg-white text-gray-800 border-0 rounded"
            >
              <option value="all">All Types</option>
              {contactTypeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <Button size="sm" variant="secondary" onClick={handleAddContact} className="flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Contact
          </Button>
        </div>

        {/* Inline Add/Edit Form */}
        {inlineContactForm && (
          <div className="mb-4 p-4 bg-gray-50 border rounded">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Contact Type</label>
                <select
                  value={inlineContactForm.contact_type}
                  onChange={(e) => setInlineContactForm({ ...inlineContactForm, contact_type: e.target.value })}
                  className={selectClass}
                >
                  {contactTypeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">First Name *</label>
                <input
                  type="text"
                  value={inlineContactForm.first_name}
                  onChange={(e) => setInlineContactForm({ ...inlineContactForm, first_name: e.target.value })}
                  className={inputClass}
                  placeholder="First Name"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Last Name</label>
                <input
                  type="text"
                  value={inlineContactForm.last_name || ''}
                  onChange={(e) => setInlineContactForm({ ...inlineContactForm, last_name: e.target.value })}
                  className={inputClass}
                  placeholder="Last Name"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email</label>
                <input
                  type="email"
                  value={inlineContactForm.email || ''}
                  onChange={(e) => setInlineContactForm({ ...inlineContactForm, email: e.target.value })}
                  className={inputClass}
                  placeholder="Email"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Phone</label>
                <input
                  type="text"
                  value={inlineContactForm.phone || ''}
                  onChange={(e) => setInlineContactForm({ ...inlineContactForm, phone: e.target.value })}
                  className={inputClass}
                  placeholder="Phone"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Designation</label>
                <input
                  type="text"
                  value={inlineContactForm.designation || ''}
                  onChange={(e) => setInlineContactForm({ ...inlineContactForm, designation: e.target.value })}
                  className={inputClass}
                  placeholder="Designation"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={inlineContactForm.is_primary}
                  onChange={(e) => setInlineContactForm({ ...inlineContactForm, is_primary: e.target.checked })}
                />
                Primary Contact
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="secondary" size="sm" onClick={() => { setInlineContactForm(null); setEditingContactId(null); }}>
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={handleSaveContact} className="flex items-center gap-1">
                <Save className="w-4 h-4" /> Save
              </Button>
            </div>
          </div>
        )}

        {/* Contacts Table */}
        <div className="border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Type</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Name</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Email</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Phone</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Designation</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Primary</th>
                <th className="px-4 py-2 text-center font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No contacts found
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr key={contact.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 capitalize">{contact.contact_type?.replace('_', ' ')}</td>
                    <td className="px-4 py-2">{`${contact.first_name} ${contact.last_name || ''}`.trim()}</td>
                    <td className="px-4 py-2">{contact.email || '-'}</td>
                    <td className="px-4 py-2">{contact.phone || '-'}</td>
                    <td className="px-4 py-2">{contact.designation || '-'}</td>
                    <td className="px-4 py-2">{contact.is_primary ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEditContact(contact)} className="text-blue-600 hover:text-blue-800">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => contact.id && handleDeleteContact(contact.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
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

  // Render Activities Tab
  const renderActivities = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Activities</h3>
        <Button size="sm" onClick={handleAddActivity} className="flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add Activity
        </Button>
      </div>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border rounded">No activities found</div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="p-4 border rounded hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded ${activity.is_completed ? 'bg-green-100' : 'bg-blue-100'}`}>
                    {activity.activity_type === 'call' && <Phone className="w-4 h-4" />}
                    {activity.activity_type === 'email' && <Mail className="w-4 h-4" />}
                    {activity.activity_type === 'meeting' && <User className="w-4 h-4" />}
                    {activity.activity_type === 'whatsapp' && <MessageSquare className="w-4 h-4" />}
                    {!['call', 'email', 'meeting', 'whatsapp'].includes(activity.activity_type) && <Clock className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-medium">{activity.subject}</div>
                    <div className="text-sm text-gray-500 capitalize">{activity.activity_type}</div>
                    {activity.description && <div className="text-sm text-gray-600 mt-1">{activity.description}</div>}
                    <div className="text-xs text-gray-400 mt-1">
                      {formatDate(activity.activity_date)} {activity.is_completed && '• Completed'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEditActivity(activity)} className="text-blue-600 hover:text-blue-800">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => activity.id && handleDeleteActivity(activity.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Render Qualified Lead Profile Tab
  const renderQualifiedProfile = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Qualified Lead Profiles</h3>
        <Button size="sm" onClick={handleAddProfile} className="flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add Profile
        </Button>
      </div>

      <div className="space-y-4">
        {qualifiedProfiles.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border rounded">No profiles found</div>
        ) : (
          qualifiedProfiles.map((profile) => (
            <div key={profile.id} className="p-4 border rounded">
              <div className="flex items-start justify-between mb-3">
                <div className="font-medium capitalize">{profile.profile_type} Profile</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEditProfile(profile)} className="text-blue-600 hover:text-blue-800">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => profile.id && handleDeleteProfile(profile.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Company Type:</span> {profile.company_type || '-'}</div>
                <div><span className="text-gray-500">Annual Revenue:</span> {profile.annual_revenue || '-'}</div>
                <div><span className="text-gray-500">Employee Count:</span> {profile.employee_count || '-'}</div>
                <div><span className="text-gray-500">Decision Maker:</span> {profile.decision_maker || '-'}</div>
                <div><span className="text-gray-500">Budget:</span> {profile.budget || '-'}</div>
                <div><span className="text-gray-500">Timeline:</span> {profile.timeline || '-'}</div>
              </div>
              {profile.pain_points && (
                <div className="mt-3 text-sm">
                  <span className="text-gray-500">Pain Points:</span> {profile.pain_points}
                </div>
              )}
              {profile.notes && (
                <div className="mt-2 text-sm">
                  <span className="text-gray-500">Notes:</span> {profile.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Render Memo Tab
  const renderMemo = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Memos</h3>
        <Button size="sm" onClick={handleAddMemo} className="flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add Memo
        </Button>
      </div>

      <div className="space-y-3">
        {memos.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border rounded">No memos found</div>
        ) : (
          memos.map((memo) => (
            <div key={memo.id} className="p-4 border rounded hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{memo.title}</div>
                  <div className="text-xs text-gray-500 capitalize mb-2">{memo.memo_type?.replace('_', ' ')}</div>
                  <div className="text-sm text-gray-600">{memo.content}</div>
                  <div className="text-xs text-gray-400 mt-2">{memo.created_at ? formatDate(memo.created_at) : ''}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEditMemo(memo)} className="text-blue-600 hover:text-blue-800">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => memo.id && handleDeleteMemo(memo.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Render Upload File Tab
  const renderUploadFile = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Documents</h3>
        <Button size="sm" onClick={() => setShowDocumentModal(true)} className="flex items-center gap-1">
          <Upload className="w-4 h-4" /> Upload Document
        </Button>
      </div>

      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-600">File Name</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Type</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Size</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Notes</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Uploaded</th>
              <th className="px-4 py-2 text-center font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No documents uploaded
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    {doc.file_name}
                  </td>
                  <td className="px-4 py-2">{doc.file_type || '-'}</td>
                  <td className="px-4 py-2">{doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : '-'}</td>
                  <td className="px-4 py-2">{doc.notes || '-'}</td>
                  <td className="px-4 py-2">{doc.created_at ? formatDate(doc.created_at) : '-'}</td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        <Download className="w-4 h-4" />
                      </a>
                      <button onClick={() => doc.id && handleDeleteDocument(doc.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
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

  // Render Status Tab
  const renderStatus = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-medium">Status History</h3>
          <p className="text-sm text-gray-500">Current Status: <span className="font-medium capitalize">{leadData?.status || '-'}</span></p>
        </div>
        <Button size="sm" onClick={() => setShowStatusModal(true)} className="flex items-center gap-1">
          <Plus className="w-4 h-4" /> Change Status
        </Button>
      </div>

      <div className="space-y-3">
        {statusHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border rounded">No status changes recorded</div>
        ) : (
          statusHistory.map((history, index) => (
            <div key={history.id || index} className="p-4 border rounded flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium capitalize">{history.status?.replace('_', ' ')}</div>
                {history.remarks && <div className="text-sm text-gray-600 mt-1">{history.remarks}</div>}
                <div className="text-xs text-gray-400 mt-1">
                  {history.status_date ? formatDate(history.status_date) : history.created_at ? formatDate(history.created_at) : '-'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Render Workflow & Audit Trail Tab
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
            <h1 className="text-lg font-semibold text-gray-800">EDIT LEAD</h1>
          </div>
          <span className="text-sm text-gray-500">ID: {leadId}</span>
        </div>

        {/* Messages */}
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded text-sm">{success}</div>}

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

        {/* Activity Modal */}
        {showActivityModal && editingActivity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{editingActivity.id ? 'Edit Activity' : 'Add Activity'}</h3>
                <button onClick={() => setShowActivityModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Activity Type</label>
                  <select
                    value={editingActivity.activity_type}
                    onChange={(e) => setEditingActivity({ ...editingActivity, activity_type: e.target.value })}
                    className={selectClass}
                  >
                    {activityTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subject *</label>
                  <input
                    type="text"
                    value={editingActivity.subject}
                    onChange={(e) => setEditingActivity({ ...editingActivity, subject: e.target.value })}
                    className={inputClass}
                    placeholder="Activity Subject"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={editingActivity.description || ''}
                    onChange={(e) => setEditingActivity({ ...editingActivity, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={3}
                    placeholder="Description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Activity Date</label>
                    <input
                      type="date"
                      value={editingActivity.activity_date?.split('T')[0] || ''}
                      onChange={(e) => setEditingActivity({ ...editingActivity, activity_date: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Outcome</label>
                    <input
                      type="text"
                      value={editingActivity.outcome || ''}
                      onChange={(e) => setEditingActivity({ ...editingActivity, outcome: e.target.value })}
                      className={inputClass}
                      placeholder="Outcome"
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingActivity.is_completed}
                      onChange={(e) => setEditingActivity({ ...editingActivity, is_completed: e.target.checked })}
                    />
                    <span className="text-sm">Mark as Completed</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="secondary" onClick={() => setShowActivityModal(false)}>Cancel</Button>
                <Button onClick={handleSaveActivity}>Save Activity</Button>
              </div>
            </div>
          </div>
        )}

        {/* Memo Modal */}
        {showMemoModal && editingMemo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{editingMemo.id ? 'Edit Memo' : 'Add Memo'}</h3>
                <button onClick={() => setShowMemoModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Memo Type</label>
                  <select
                    value={editingMemo.memo_type}
                    onChange={(e) => setEditingMemo({ ...editingMemo, memo_type: e.target.value })}
                    className={selectClass}
                  >
                    {memoTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input
                    type="text"
                    value={editingMemo.title}
                    onChange={(e) => setEditingMemo({ ...editingMemo, title: e.target.value })}
                    className={inputClass}
                    placeholder="Memo Title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Content *</label>
                  <textarea
                    value={editingMemo.content}
                    onChange={(e) => setEditingMemo({ ...editingMemo, content: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={5}
                    placeholder="Memo content..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="secondary" onClick={() => setShowMemoModal(false)}>Cancel</Button>
                <Button onClick={handleSaveMemo}>Save Memo</Button>
              </div>
            </div>
          </div>
        )}

        {/* Document Upload Modal */}
        {showDocumentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Upload Document</h3>
                <button onClick={() => setShowDocumentModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Select File *</label>
                  <input
                    type="file"
                    onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                    className="w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    value={documentNotes}
                    onChange={(e) => setDocumentNotes(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={3}
                    placeholder="Optional notes about this document..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="secondary" onClick={() => setShowDocumentModal(false)}>Cancel</Button>
                <Button onClick={handleUploadDocument} disabled={!documentFile}>Upload</Button>
              </div>
            </div>
          </div>
        )}

        {/* Status Change Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Change Status</h3>
                <button onClick={() => setShowStatusModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">New Status *</label>
                  <select
                    value={newStatus.status}
                    onChange={(e) => setNewStatus({ ...newStatus, status: e.target.value })}
                    className={selectClass}
                  >
                    <option value="">Select Status</option>
                    {leadStatusOptions.filter(opt => opt.value).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status Date</label>
                  <input
                    type="date"
                    value={newStatus.status_date}
                    onChange={(e) => setNewStatus({ ...newStatus, status_date: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Remarks</label>
                  <textarea
                    value={newStatus.remarks}
                    onChange={(e) => setNewStatus({ ...newStatus, remarks: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={3}
                    placeholder="Optional remarks..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="secondary" onClick={() => setShowStatusModal(false)}>Cancel</Button>
                <Button onClick={handleChangeStatus} disabled={!newStatus.status}>Change Status</Button>
              </div>
            </div>
          </div>
        )}

        {/* Qualified Profile Modal */}
        {showProfileModal && editingProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{editingProfile.id ? 'Edit Profile' : 'Add Profile'}</h3>
                <button onClick={() => setShowProfileModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Profile Type</label>
                  <select
                    value={editingProfile.profile_type}
                    onChange={(e) => setEditingProfile({ ...editingProfile, profile_type: e.target.value })}
                    className={selectClass}
                  >
                    {profileTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Company Type</label>
                  <input
                    type="text"
                    value={editingProfile.company_type || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, company_type: e.target.value })}
                    className={inputClass}
                    placeholder="e.g., Startup, Enterprise"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Annual Revenue</label>
                  <input
                    type="text"
                    value={editingProfile.annual_revenue || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, annual_revenue: e.target.value })}
                    className={inputClass}
                    placeholder="e.g., $1M - $5M"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Employee Count</label>
                  <input
                    type="text"
                    value={editingProfile.employee_count || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, employee_count: e.target.value })}
                    className={inputClass}
                    placeholder="e.g., 50-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Decision Maker</label>
                  <input
                    type="text"
                    value={editingProfile.decision_maker || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, decision_maker: e.target.value })}
                    className={inputClass}
                    placeholder="Name and title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Budget</label>
                  <input
                    type="text"
                    value={editingProfile.budget || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, budget: e.target.value })}
                    className={inputClass}
                    placeholder="Budget range"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Timeline</label>
                  <input
                    type="text"
                    value={editingProfile.timeline || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, timeline: e.target.value })}
                    className={inputClass}
                    placeholder="e.g., Q1 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Competitors</label>
                  <input
                    type="text"
                    value={editingProfile.competitors || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, competitors: e.target.value })}
                    className={inputClass}
                    placeholder="Known competitors"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Pain Points</label>
                  <textarea
                    value={editingProfile.pain_points || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, pain_points: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={2}
                    placeholder="Key pain points..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    value={editingProfile.notes || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, notes: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={2}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="secondary" onClick={() => setShowProfileModal(false)}>Cancel</Button>
                <Button onClick={handleSaveProfile}>Save Profile</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
