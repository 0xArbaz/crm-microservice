'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { Building2, Users, Activity, UserCheck, FileText, Upload, CheckCircle, GitBranch, Plus, Edit, Trash2, Eye, Download, X } from 'lucide-react';
import api from '@/lib/api';
import { PreLead } from '@/types';

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
  lead_status: z.string().optional(),
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
  first_name: z.string().optional(),
});

type PreLeadForm = z.infer<typeof preLeadSchema>;

type TabType = 'company' | 'contacts' | 'activities' | 'qualified' | 'memo' | 'upload' | 'status' | 'workflow';

interface PreLeadContact {
  id: number;
  pre_lead_id: number;
  contact_type: string;
  title?: string;
  first_name: string;
  last_name?: string;
  designation?: string;
  work_email?: string;
  work_phone?: string;
  ext?: string;
  fax?: string;
  cell_phone?: string;
  status: string;
  created_at: string;
}

interface PreLeadActivity {
  id: number;
  pre_lead_id: number;
  activity_type: string;
  subject: string;
  start_date?: string;
  due_date?: string;
  priority: string;
  status: string;
  assigned_to?: number;
  description?: string;
  created_at: string;
}

interface PreLeadMemo {
  id: number;
  pre_lead_id: number;
  details: string;
  created_at: string;
  created_by?: number;
}

interface PreLeadDocument {
  id: number;
  pre_lead_id: number;
  name: string;
  original_name?: string;
  file_type?: string;
  size?: number;
  notes?: string;
  created_at: string;
}

interface PreLeadStatusHistory {
  id: number;
  pre_lead_id: number;
  status: string;
  status_date?: string;
  remarks?: string;
  created_at: string;
  updated_by?: number;
}

interface QualifiedLeadProfile {
  id: number;
  pre_lead_id: number;
  contact_id?: number;
  company_name?: string;
  industry_id?: number;
  best_time_call?: string;
  best_time_call_timezone?: number;
  mode?: string;
  contact_name?: string;
  designation?: string;
  phone?: string;
  email?: string;
  need_type?: number;
  current_software?: string;
  need_summary?: string;
  budget?: number;
  decision_maker?: number;
  time_frame?: number;
  qualified_by?: number;
  company_profile?: string;
  summary_of_discussion?: string;
  conclusion?: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'company', label: 'Company Details', icon: <Building2 className="w-4 h-4" /> },
  { id: 'contacts', label: 'Contacts', icon: <Users className="w-4 h-4" /> },
  { id: 'activities', label: 'Activities', icon: <Activity className="w-4 h-4" /> },
  { id: 'qualified', label: 'Qualified Lead Profile', icon: <UserCheck className="w-4 h-4" /> },
  { id: 'memo', label: 'Memo', icon: <FileText className="w-4 h-4" /> },
  { id: 'upload', label: 'Upload File', icon: <Upload className="w-4 h-4" /> },
  { id: 'status', label: 'Status', icon: <CheckCircle className="w-4 h-4" /> },
  { id: 'workflow', label: 'Workflow & Audit Trail', icon: <GitBranch className="w-4 h-4" /> },
];

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

const leadStatusOptions = [
  { value: '', label: 'Select Status' },
  { value: 'new', label: 'New-Not Contacted' },
  { value: 'working', label: 'Working-In Process' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'closed_not_converted', label: 'Closed-Not Converted' },
  { value: 'converted', label: 'Converted' },
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
  { value: 'hot', label: 'Hot' },
  { value: 'warm', label: 'Warm' },
  { value: 'cold', label: 'Cold' },
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
];

const activityTypeOptions = [
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'visit', label: 'Visit' },
  { value: 'fax', label: 'Fax' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const modeOptions = [
  { value: '', label: 'Select Mode' },
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'video_call', label: 'Video Call' },
  { value: 'in_person', label: 'In Person' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

const needTypeOptions = [
  { value: '', label: 'Select Need Type' },
  { value: '1', label: 'New Implementation' },
  { value: '2', label: 'Upgrade/Migration' },
  { value: '3', label: 'Support/Maintenance' },
  { value: '4', label: 'Training' },
  { value: '5', label: 'Consultation' },
];

const budgetOptions = [
  { value: '', label: 'Select Budget Range' },
  { value: '1', label: 'Less than $10,000' },
  { value: '2', label: '$10,000 - $25,000' },
  { value: '3', label: '$25,000 - $50,000' },
  { value: '4', label: '$50,000 - $100,000' },
  { value: '5', label: 'More than $100,000' },
];

const decisionMakerOptions = [
  { value: '', label: 'Select' },
  { value: '1', label: 'Yes - Final Decision Maker' },
  { value: '2', label: 'Yes - Part of Decision Team' },
  { value: '3', label: 'No - Influencer Only' },
  { value: '4', label: 'No - Just Gathering Info' },
];

const timeFrameOptions = [
  { value: '', label: 'Select Time Frame' },
  { value: '1', label: 'Immediately' },
  { value: '2', label: 'Within 1 Month' },
  { value: '3', label: 'Within 3 Months' },
  { value: '4', label: 'Within 6 Months' },
  { value: '5', label: 'Within 1 Year' },
  { value: '6', label: 'Just Exploring' },
];

const qualifiedStatusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function EditPreLeadPage() {
  const router = useRouter();
  const params = useParams();
  const preLeadId = parseInt(params.id as string);

  const [activeTab, setActiveTab] = useState<TabType>('company');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [preLeadData, setPreLeadData] = useState<PreLead | null>(null);

  // Tab data states
  const [contacts, setContacts] = useState<PreLeadContact[]>([]);
  const [activities, setActivities] = useState<PreLeadActivity[]>([]);
  const [memos, setMemos] = useState<PreLeadMemo[]>([]);
  const [documents, setDocuments] = useState<PreLeadDocument[]>([]);
  const [statusHistory, setStatusHistory] = useState<PreLeadStatusHistory[]>([]);
  const [qualifiedProfiles, setQualifiedProfiles] = useState<QualifiedLeadProfile[]>([]);

  // Modal states
  const [showContactModal, setShowContactModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showMemoModal, setShowMemoModal] = useState(false);
  const [showQualifiedModal, setShowQualifiedModal] = useState(false);
  const [editingContact, setEditingContact] = useState<PreLeadContact | null>(null);
  const [editingActivity, setEditingActivity] = useState<PreLeadActivity | null>(null);
  const [editingMemo, setEditingMemo] = useState<PreLeadMemo | null>(null);
  const [editingQualified, setEditingQualified] = useState<QualifiedLeadProfile | null>(null);

  // Form states for modals
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

  const [activityForm, setActivityForm] = useState({
    activity_type: 'call',
    subject: '',
    description: '',
    start_date: '',
    due_date: '',
    priority: 'medium',
    status: 'pending',
  });

  const [memoForm, setMemoForm] = useState({ details: '' });

  const [qualifiedForm, setQualifiedForm] = useState({
    contact_id: '',
    company_name: '',
    industry_id: '',
    best_time_call: '',
    best_time_call_timezone: '',
    mode: '',
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
    company_profile: '',
    summary_of_discussion: '',
    conclusion: '',
    status: 'draft',
  });

  // Status form
  const [statusForm, setStatusForm] = useState({
    status: '',
    status_date: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  // File upload
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadNotes, setUploadNotes] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PreLeadForm>({
    resolver: zodResolver(preLeadSchema),
  });

  const fetchAllData = useCallback(async () => {
    try {
      const [preLeadRes, contactsRes, activitiesRes, memosRes, docsRes, historyRes, qualifiedRes] = await Promise.all([
        api.getPreLead(preLeadId),
        api.getPreLeadContacts(preLeadId),
        api.getPreLeadActivities(preLeadId),
        api.getPreLeadMemos(preLeadId),
        api.getPreLeadDocuments(preLeadId),
        api.getPreLeadStatusHistory(preLeadId),
        api.getPreLeadQualifiedProfiles(preLeadId),
      ]);

      setPreLeadData(preLeadRes);
      setContacts(contactsRes);
      setActivities(activitiesRes);
      setMemos(memosRes);
      setDocuments(docsRes);
      setStatusHistory(historyRes);
      setQualifiedProfiles(qualifiedRes);

      // Populate form
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
        lead_status: preLeadRes.lead_status || '',
        group_id: preLeadRes.group_id?.toString() || '',
        industry_id: preLeadRes.industry_id?.toString() || '',
        region_id: preLeadRes.region_id?.toString() || '',
        from_timings: fromTimings,
        to_timings: toTimings,
        timezone: preLeadRes.timezone || '',
        sales_rep: preLeadRes.sales_rep?.toString() || '',
        source: preLeadRes.source || '',
        lead_score: preLeadRes.lead_score || '',
        remarks: preLeadRes.remarks || '',
      });

      setStatusForm(prev => ({ ...prev, status: preLeadRes.lead_status || '' }));
    } catch (err: any) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [preLeadId, reset]);

  useEffect(() => {
    if (preLeadId) {
      fetchAllData();
    }
  }, [preLeadId, fetchAllData]);

  const onSubmit = async (data: PreLeadForm) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const apiData: Record<string, any> = {
        ...data,
        first_name: data.company_name,
        country_id: data.country_id ? parseInt(data.country_id) : undefined,
        state_id: data.state_id ? parseInt(data.state_id) : undefined,
        city_id: data.city_id ? parseInt(data.city_id) : undefined,
        group_id: data.group_id ? parseInt(data.group_id) : undefined,
        industry_id: data.industry_id ? parseInt(data.industry_id) : undefined,
        region_id: data.region_id ? parseInt(data.region_id) : undefined,
        sales_rep: data.sales_rep ? parseInt(data.sales_rep) : undefined,
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

  // Contact handlers
  const handleAddContact = () => {
    setEditingContact(null);
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
    setShowContactModal(true);
  };

  const handleEditContact = (contact: PreLeadContact) => {
    setEditingContact(contact);
    setContactForm({
      contact_type: contact.contact_type,
      title: contact.title || '',
      first_name: contact.first_name,
      last_name: contact.last_name || '',
      designation: contact.designation || '',
      work_email: contact.work_email || '',
      work_phone: contact.work_phone || '',
      ext: contact.ext || '',
      fax: contact.fax || '',
      cell_phone: contact.cell_phone || '',
      status: contact.status,
    });
    setShowContactModal(true);
  };

  const handleSaveContact = async () => {
    if (!contactForm.first_name) {
      setError('First name is required');
      return;
    }
    try {
      if (editingContact) {
        await api.updatePreLeadContact(preLeadId, editingContact.id, contactForm);
      } else {
        await api.createPreLeadContact(preLeadId, contactForm);
      }
      setShowContactModal(false);
      const updatedContacts = await api.getPreLeadContacts(preLeadId);
      setContacts(updatedContacts);
      setSuccess(editingContact ? 'Contact updated' : 'Contact added');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save contact');
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      await api.deletePreLeadContact(preLeadId, contactId);
      setContacts(contacts.filter(c => c.id !== contactId));
      setSuccess('Contact deleted');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete contact');
    }
  };

  // Activity handlers
  const handleAddActivity = () => {
    setEditingActivity(null);
    setActivityForm({
      activity_type: 'call',
      subject: '',
      description: '',
      start_date: new Date().toISOString().split('T')[0],
      due_date: new Date().toISOString().split('T')[0],
      priority: 'medium',
      status: 'pending',
    });
    setShowActivityModal(true);
  };

  const handleEditActivity = (activity: PreLeadActivity) => {
    setEditingActivity(activity);
    setActivityForm({
      activity_type: activity.activity_type,
      subject: activity.subject,
      description: activity.description || '',
      start_date: activity.start_date || '',
      due_date: activity.due_date || '',
      priority: activity.priority,
      status: activity.status,
    });
    setShowActivityModal(true);
  };

  const handleSaveActivity = async () => {
    if (!activityForm.subject) {
      setError('Subject is required');
      return;
    }
    try {
      if (editingActivity) {
        await api.updatePreLeadActivity(preLeadId, editingActivity.id, activityForm);
      } else {
        await api.createPreLeadActivity(preLeadId, activityForm);
      }
      setShowActivityModal(false);
      const updatedActivities = await api.getPreLeadActivities(preLeadId);
      setActivities(updatedActivities);
      setSuccess(editingActivity ? 'Activity updated' : 'Activity added');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save activity');
    }
  };

  const handleDeleteActivity = async (activityId: number) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    try {
      await api.deletePreLeadActivity(preLeadId, activityId);
      setActivities(activities.filter(a => a.id !== activityId));
      setSuccess('Activity deleted');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete activity');
    }
  };

  // Memo handlers
  const handleAddMemo = () => {
    setEditingMemo(null);
    setMemoForm({ details: '' });
    setShowMemoModal(true);
  };

  const handleEditMemo = (memo: PreLeadMemo) => {
    setEditingMemo(memo);
    setMemoForm({ details: memo.details });
    setShowMemoModal(true);
  };

  const handleSaveMemo = async () => {
    if (!memoForm.details) {
      setError('Memo details required');
      return;
    }
    try {
      if (editingMemo) {
        await api.updatePreLeadMemo(preLeadId, editingMemo.id, memoForm);
      } else {
        await api.createPreLeadMemo(preLeadId, memoForm);
      }
      setShowMemoModal(false);
      const updatedMemos = await api.getPreLeadMemos(preLeadId);
      setMemos(updatedMemos);
      setSuccess(editingMemo ? 'Memo updated' : 'Memo added');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save memo');
    }
  };

  const handleDeleteMemo = async (memoId: number) => {
    if (!confirm('Are you sure you want to delete this memo?')) return;
    try {
      await api.deletePreLeadMemo(preLeadId, memoId);
      setMemos(memos.filter(m => m.id !== memoId));
      setSuccess('Memo deleted');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete memo');
    }
  };

  // Document handlers
  const handleUploadDocument = async () => {
    if (!uploadFile) {
      setError('Please select a file');
      return;
    }
    try {
      await api.uploadPreLeadDocument(preLeadId, uploadFile, uploadNotes);
      const updatedDocs = await api.getPreLeadDocuments(preLeadId);
      setDocuments(updatedDocs);
      setUploadFile(null);
      setUploadNotes('');
      setSuccess('File uploaded');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload file');
    }
  };

  const handleDeleteDocument = async (docId: number) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    try {
      await api.deletePreLeadDocument(preLeadId, docId);
      setDocuments(documents.filter(d => d.id !== docId));
      setSuccess('File deleted');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete file');
    }
  };

  // Status handler
  const handleSaveStatus = async () => {
    if (!statusForm.status) {
      setError('Please select a status');
      return;
    }
    try {
      await api.changePreLeadStatus(preLeadId, statusForm);
      const [updatedHistory, updatedPreLead] = await Promise.all([
        api.getPreLeadStatusHistory(preLeadId),
        api.getPreLead(preLeadId),
      ]);
      setStatusHistory(updatedHistory);
      setPreLeadData(updatedPreLead);
      setSuccess('Status updated');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update status');
    }
  };

  // Qualified Profile handlers
  const handleAddQualified = () => {
    setEditingQualified(null);
    setQualifiedForm({
      contact_id: '',
      company_name: preLeadData?.company_name || '',
      industry_id: preLeadData?.industry_id?.toString() || '',
      best_time_call: '',
      best_time_call_timezone: '',
      mode: '',
      contact_name: '',
      designation: '',
      phone: preLeadData?.phone || '',
      email: preLeadData?.email || '',
      need_type: '',
      current_software: '',
      need_summary: '',
      budget: '',
      decision_maker: '',
      time_frame: '',
      company_profile: '',
      summary_of_discussion: '',
      conclusion: '',
      status: 'draft',
    });
    setShowQualifiedModal(true);
  };

  const handleEditQualified = (profile: QualifiedLeadProfile) => {
    setEditingQualified(profile);
    setQualifiedForm({
      contact_id: profile.contact_id?.toString() || '',
      company_name: profile.company_name || '',
      industry_id: profile.industry_id?.toString() || '',
      best_time_call: profile.best_time_call || '',
      best_time_call_timezone: profile.best_time_call_timezone?.toString() || '',
      mode: profile.mode || '',
      contact_name: profile.contact_name || '',
      designation: profile.designation || '',
      phone: profile.phone || '',
      email: profile.email || '',
      need_type: profile.need_type?.toString() || '',
      current_software: profile.current_software || '',
      need_summary: profile.need_summary || '',
      budget: profile.budget?.toString() || '',
      decision_maker: profile.decision_maker?.toString() || '',
      time_frame: profile.time_frame?.toString() || '',
      company_profile: profile.company_profile || '',
      summary_of_discussion: profile.summary_of_discussion || '',
      conclusion: profile.conclusion || '',
      status: profile.status,
    });
    setShowQualifiedModal(true);
  };

  const handleSaveQualified = async () => {
    try {
      const payload = {
        ...qualifiedForm,
        contact_id: qualifiedForm.contact_id ? parseInt(qualifiedForm.contact_id) : null,
        industry_id: qualifiedForm.industry_id ? parseInt(qualifiedForm.industry_id) : null,
        best_time_call_timezone: qualifiedForm.best_time_call_timezone ? parseInt(qualifiedForm.best_time_call_timezone) : null,
        need_type: qualifiedForm.need_type ? parseInt(qualifiedForm.need_type) : null,
        budget: qualifiedForm.budget ? parseInt(qualifiedForm.budget) : null,
        decision_maker: qualifiedForm.decision_maker ? parseInt(qualifiedForm.decision_maker) : null,
        time_frame: qualifiedForm.time_frame ? parseInt(qualifiedForm.time_frame) : null,
      };

      if (editingQualified) {
        await api.updatePreLeadQualifiedProfile(preLeadId, editingQualified.id, payload);
      } else {
        await api.createPreLeadQualifiedProfile(preLeadId, payload);
      }
      setShowQualifiedModal(false);
      const updatedProfiles = await api.getPreLeadQualifiedProfiles(preLeadId);
      setQualifiedProfiles(updatedProfiles);
      setSuccess(editingQualified ? 'Qualified profile updated' : 'Qualified profile created');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save qualified profile');
    }
  };

  const handleDeleteQualified = async (profileId: number) => {
    if (!confirm('Are you sure you want to delete this qualified profile?')) return;
    try {
      await api.deletePreLeadQualifiedProfile(preLeadId, profileId);
      setQualifiedProfiles(qualifiedProfiles.filter(p => p.id !== profileId));
      setSuccess('Qualified profile deleted');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete qualified profile');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const inputClass = "w-full h-9 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500";
  const selectClass = "w-full h-9 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white";
  const labelClass = "w-36 text-sm font-medium flex-shrink-0";

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  const renderCompanyDetails = () => (
    <div className="grid grid-cols-2 gap-x-12 gap-y-3">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <label className={`${labelClass} text-blue-600`}>Company Name *</label>
          <input type="text" placeholder="Company Name" className={`${inputClass} flex-1`} {...register('company_name')} />
        </div>
        <div className="flex items-center gap-3">
          <label className={labelClass}>Address</label>
          <input type="text" placeholder="Address Line 1" className={`${inputClass} flex-1`} {...register('address_line1')} />
        </div>
        <div className="flex items-center gap-3">
          <label className={labelClass}></label>
          <input type="text" placeholder="Address Line 2" className={`${inputClass} flex-1`} {...register('address_line2')} />
        </div>
        <div className="flex items-center gap-3">
          <label className={labelClass}>Country</label>
          <select className={`${selectClass} flex-1`} {...register('country_id')}>
            {countryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <label className={labelClass}>State/Province</label>
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
          <input type="text" placeholder="Zip Code" className={`${inputClass} flex-1`} {...register('zip_code')} />
        </div>
        <div className="flex items-center gap-3">
          <label className={labelClass}>Phone</label>
          <input type="text" placeholder="Phone" className={`${inputClass} flex-1`} {...register('phone_no')} />
        </div>
        <div className="flex items-center gap-3">
          <label className={labelClass}>Fax</label>
          <input type="text" placeholder="Fax" className={`${inputClass} flex-1`} {...register('fax')} />
        </div>
        <div className="flex items-center gap-3">
          <label className={labelClass}>Website</label>
          <input type="text" placeholder="Website" className={`${inputClass} flex-1`} {...register('website')} />
        </div>
        <div className="flex items-center gap-3">
          <label className={labelClass}>Name of Rep.</label>
          <input type="text" placeholder="Representative" className={`${inputClass} flex-1`} {...register('nof_representative')} />
        </div>
        <div className="flex items-center gap-3">
          <label className={labelClass}>Contact Phone</label>
          <input type="text" placeholder="Contact Phone" className={`${inputClass} flex-1`} {...register('phone')} />
        </div>
        <div className="flex items-center gap-3">
          <label className={labelClass}>Email</label>
          <input type="email" placeholder="Email" className={`${inputClass} flex-1`} {...register('email')} />
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <label className={labelClass}>Lead Since</label>
          <input type="date" className={`${inputClass} flex-1`} {...register('lead_since')} />
        </div>
        <div className="flex items-center gap-3">
          <label className={labelClass}>Lead Status</label>
          <select className={`${selectClass} flex-1`} {...register('lead_status')}>
            {leadStatusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
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
  );

  const renderContacts = () => (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={handleAddContact} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Add Contact
        </Button>
      </div>
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Title</th>
              <th className="px-3 py-2 text-left font-medium">First Name</th>
              <th className="px-3 py-2 text-left font-medium">Last Name</th>
              <th className="px-3 py-2 text-left font-medium">Designation</th>
              <th className="px-3 py-2 text-left font-medium">Email</th>
              <th className="px-3 py-2 text-left font-medium">Phone</th>
              <th className="px-3 py-2 text-left font-medium">Fax</th>
              <th className="px-3 py-2 text-left font-medium">Cell</th>
              <th className="px-3 py-2 text-left font-medium">Status</th>
              <th className="px-3 py-2 text-center font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {contacts.length === 0 ? (
              <tr><td colSpan={10} className="px-3 py-8 text-center text-gray-500">No contacts found</td></tr>
            ) : (
              contacts.map(contact => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">{contact.title || '-'}</td>
                  <td className="px-3 py-2">{contact.first_name}</td>
                  <td className="px-3 py-2">{contact.last_name || '-'}</td>
                  <td className="px-3 py-2">{contact.designation || '-'}</td>
                  <td className="px-3 py-2">{contact.work_email || '-'}</td>
                  <td className="px-3 py-2">{contact.work_phone || '-'}</td>
                  <td className="px-3 py-2">{contact.fax || '-'}</td>
                  <td className="px-3 py-2">{contact.cell_phone || '-'}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${contact.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => handleEditContact(contact)} className="p-1 hover:bg-blue-100 rounded text-blue-600"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteContact(contact.id)} className="p-1 hover:bg-red-100 rounded text-red-600 ml-1"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderActivities = () => (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={handleAddActivity} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Add Activity
        </Button>
      </div>
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Type</th>
              <th className="px-3 py-2 text-left font-medium">Subject</th>
              <th className="px-3 py-2 text-left font-medium">Start Date</th>
              <th className="px-3 py-2 text-left font-medium">Due Date</th>
              <th className="px-3 py-2 text-left font-medium">Priority</th>
              <th className="px-3 py-2 text-left font-medium">Status</th>
              <th className="px-3 py-2 text-center font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {activities.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-500">No activities found</td></tr>
            ) : (
              activities.map(activity => (
                <tr key={activity.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 capitalize">{activity.activity_type}</td>
                  <td className="px-3 py-2">{activity.subject}</td>
                  <td className="px-3 py-2">{activity.start_date || '-'}</td>
                  <td className="px-3 py-2">{activity.due_date || '-'}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs capitalize ${
                      activity.priority === 'high' ? 'bg-red-100 text-red-700' :
                      activity.priority === 'critical' ? 'bg-red-200 text-red-800' :
                      activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{activity.priority}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs capitalize ${
                      activity.status === 'completed' ? 'bg-green-100 text-green-700' :
                      activity.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{activity.status}</span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => handleEditActivity(activity)} className="p-1 hover:bg-blue-100 rounded text-blue-600"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteActivity(activity.id)} className="p-1 hover:bg-red-100 rounded text-red-600 ml-1"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMemo = () => (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={handleAddMemo} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Add Memo
        </Button>
      </div>
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left font-medium w-32">Date</th>
              <th className="px-3 py-2 text-left font-medium">Details</th>
              <th className="px-3 py-2 text-center font-medium w-24">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {memos.length === 0 ? (
              <tr><td colSpan={3} className="px-3 py-8 text-center text-gray-500">No memos found</td></tr>
            ) : (
              memos.map(memo => (
                <tr key={memo.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">{new Date(memo.created_at).toLocaleDateString()}</td>
                  <td className="px-3 py-2"><div dangerouslySetInnerHTML={{ __html: memo.details }} /></td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => handleEditMemo(memo)} className="p-1 hover:bg-blue-100 rounded text-blue-600"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteMemo(memo.id)} className="p-1 hover:bg-red-100 rounded text-red-600 ml-1"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderUpload = () => (
    <div className="space-y-4">
      <div className="flex items-end gap-4 p-4 bg-gray-50 rounded">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Document</label>
          <input type="file" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} className="w-full text-sm" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Notes</label>
          <input type="text" value={uploadNotes} onChange={(e) => setUploadNotes(e.target.value)} className={inputClass} placeholder="Notes" />
        </div>
        <Button size="sm" onClick={handleUploadDocument} className="bg-blue-600 hover:bg-blue-700">
          <Upload className="w-4 h-4 mr-1" /> Upload
        </Button>
      </div>
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left font-medium">File Name</th>
              <th className="px-3 py-2 text-left font-medium">Uploaded On</th>
              <th className="px-3 py-2 text-left font-medium">Size</th>
              <th className="px-3 py-2 text-left font-medium">Notes</th>
              <th className="px-3 py-2 text-center font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {documents.length === 0 ? (
              <tr><td colSpan={5} className="px-3 py-8 text-center text-gray-500">No files uploaded</td></tr>
            ) : (
              documents.map(doc => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">{doc.original_name || doc.name}</td>
                  <td className="px-3 py-2">{new Date(doc.created_at).toLocaleDateString()}</td>
                  <td className="px-3 py-2">{formatFileSize(doc.size)}</td>
                  <td className="px-3 py-2">{doc.notes || '-'}</td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => handleDeleteDocument(doc.id)} className="p-1 hover:bg-red-100 rounded text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStatus = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Current Status</label>
          <div className="px-3 py-2 bg-white border rounded text-sm">
            {leadStatusOptions.find(o => o.value === preLeadData?.lead_status)?.label || 'Not Set'}
          </div>
        </div>
      </div>

      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Status</th>
              <th className="px-3 py-2 text-left font-medium">Remarks</th>
              <th className="px-3 py-2 text-left font-medium">Updated By</th>
              <th className="px-3 py-2 text-left font-medium">Status Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {leadStatusOptions.filter(o => o.value).map(opt => {
              const history = statusHistory.find(h => h.status === opt.value);
              const isCurrentStatus = preLeadData?.lead_status === opt.value;
              return (
                <tr key={opt.value} className={isCurrentStatus ? 'bg-blue-50' : ''}>
                  <td className="px-3 py-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="status"
                        value={opt.value}
                        checked={statusForm.status === opt.value}
                        onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
                        className="w-4 h-4"
                      />
                      <span>{opt.label}</span>
                    </label>
                  </td>
                  <td className="px-3 py-2">{history?.remarks || '-'}</td>
                  <td className="px-3 py-2">{history?.updated_by || '-'}</td>
                  <td className="px-3 py-2">{history?.status_date || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {statusForm.status && statusForm.status !== preLeadData?.lead_status && (
        <div className="flex items-end gap-4 p-4 bg-yellow-50 rounded">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Remarks</label>
            <input
              type="text"
              value={statusForm.remarks}
              onChange={(e) => setStatusForm(prev => ({ ...prev, remarks: e.target.value }))}
              className={inputClass}
              placeholder="Enter remarks"
            />
          </div>
          <div className="w-40">
            <label className="block text-sm font-medium mb-1">Status Date</label>
            <input
              type="date"
              value={statusForm.status_date}
              onChange={(e) => setStatusForm(prev => ({ ...prev, status_date: e.target.value }))}
              className={inputClass}
            />
          </div>
          <Button size="sm" onClick={handleSaveStatus} className="bg-green-600 hover:bg-green-700">
            Save Status
          </Button>
        </div>
      )}
    </div>
  );

  const renderWorkflow = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Audit Trail</h3>
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Date & Time</th>
              <th className="px-3 py-2 text-left font-medium">User</th>
              <th className="px-3 py-2 text-left font-medium">Action</th>
              <th className="px-3 py-2 text-left font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr className="hover:bg-gray-50">
              <td className="px-3 py-2">{preLeadData?.created_at ? new Date(preLeadData.created_at).toLocaleString() : '-'}</td>
              <td className="px-3 py-2">System</td>
              <td className="px-3 py-2"><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Created</span></td>
              <td className="px-3 py-2">Pre-lead record created</td>
            </tr>
            {statusHistory.map(h => (
              <tr key={h.id} className="hover:bg-gray-50">
                <td className="px-3 py-2">{new Date(h.created_at).toLocaleString()}</td>
                <td className="px-3 py-2">User #{h.updated_by || '-'}</td>
                <td className="px-3 py-2"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Status Change</span></td>
                <td className="px-3 py-2">Status changed to {h.status}{h.remarks ? ` - ${h.remarks}` : ''}</td>
              </tr>
            ))}
            {preLeadData?.updated_at && preLeadData.updated_at !== preLeadData.created_at && (
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2">{new Date(preLeadData.updated_at).toLocaleString()}</td>
                <td className="px-3 py-2">System</td>
                <td className="px-3 py-2"><span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">Updated</span></td>
                <td className="px-3 py-2">Pre-lead record updated</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderQualifiedProfile = () => (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={handleAddQualified} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Create Qualified Profile
        </Button>
      </div>

      {qualifiedProfiles.length === 0 ? (
        <div className="p-8 text-center text-gray-500 border rounded">
          <UserCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No qualified profiles yet.</p>
          <p className="text-sm mt-2">Create a qualified profile to capture detailed qualification data including budget, decision makers, timeline, and requirements.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {qualifiedProfiles.map(profile => (
            <div key={profile.id} className="border rounded p-4 bg-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-medium">{profile.company_name || 'Untitled Profile'}</h4>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(profile.created_at).toLocaleDateString()}
                    {profile.contact_name && ` | Contact: ${profile.contact_name}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    profile.status === 'approved' ? 'bg-green-100 text-green-700' :
                    profile.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                    profile.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{profile.status}</span>
                  <button onClick={() => handleEditQualified(profile)} className="p-1 hover:bg-blue-100 rounded text-blue-600">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteQualified(profile.id)} className="p-1 hover:bg-red-100 rounded text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Mode:</span>
                  <span className="ml-2">{modeOptions.find(o => o.value === profile.mode)?.label || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Budget:</span>
                  <span className="ml-2">{budgetOptions.find(o => o.value === profile.budget?.toString())?.label || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Decision Maker:</span>
                  <span className="ml-2">{decisionMakerOptions.find(o => o.value === profile.decision_maker?.toString())?.label || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Time Frame:</span>
                  <span className="ml-2">{timeFrameOptions.find(o => o.value === profile.time_frame?.toString())?.label || '-'}</span>
                </div>
              </div>

              {profile.need_summary && (
                <div className="mt-3 pt-3 border-t">
                  <span className="text-sm text-gray-500">Need Summary:</span>
                  <p className="text-sm mt-1">{profile.need_summary}</p>
                </div>
              )}

              {profile.conclusion && (
                <div className="mt-3 pt-3 border-t">
                  <span className="text-sm text-gray-500">Conclusion:</span>
                  <p className="text-sm mt-1">{profile.conclusion}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'company': return renderCompanyDetails();
      case 'contacts': return renderContacts();
      case 'activities': return renderActivities();
      case 'qualified': return renderQualifiedProfile();
      case 'memo': return renderMemo();
      case 'upload': return renderUpload();
      case 'status': return renderStatus();
      case 'workflow': return renderWorkflow();
      default: return renderCompanyDetails();
    }
  };

  // Modal component
  const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">{title}</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-4">{children}</div>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <h1 className="text-lg font-semibold text-gray-800">EDIT PRE LEAD</h1>
          <span className="text-sm text-gray-500">ID: {preLeadId}</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-wrap gap-1 mb-0 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-b p-6">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4">{error}</div>}
            {success && <div className="bg-green-50 text-green-600 p-3 rounded text-sm mb-4">{success}</div>}

            {renderTabContent()}

            <div className="flex justify-center gap-4 mt-6 pt-6 border-t">
              <Button type="button" variant="secondary" onClick={() => router.push('/pre-leads')} className="px-8">Cancel</Button>
              <Button type="submit" isLoading={isSubmitting} className="bg-green-500 hover:bg-green-600 px-8">Update</Button>
            </div>
          </div>
        </form>

        {/* Contact Modal */}
        <Modal isOpen={showContactModal} onClose={() => setShowContactModal(false)} title={editingContact ? 'Edit Contact' : 'Add Contact'}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Contact Type *</label>
              <select value={contactForm.contact_type} onChange={(e) => setContactForm(prev => ({ ...prev, contact_type: e.target.value }))} className={selectClass}>
                {contactTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <select value={contactForm.title} onChange={(e) => setContactForm(prev => ({ ...prev, title: e.target.value }))} className={selectClass}>
                <option value="">Select</option>
                <option value="Mr.">Mr.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Ms.">Ms.</option>
                <option value="Dr.">Dr.</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">First Name *</label>
              <input type="text" value={contactForm.first_name} onChange={(e) => setContactForm(prev => ({ ...prev, first_name: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input type="text" value={contactForm.last_name} onChange={(e) => setContactForm(prev => ({ ...prev, last_name: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Designation</label>
              <input type="text" value={contactForm.designation} onChange={(e) => setContactForm(prev => ({ ...prev, designation: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Work Email</label>
              <input type="email" value={contactForm.work_email} onChange={(e) => setContactForm(prev => ({ ...prev, work_email: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Work Phone</label>
              <input type="text" value={contactForm.work_phone} onChange={(e) => setContactForm(prev => ({ ...prev, work_phone: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ext</label>
              <input type="text" value={contactForm.ext} onChange={(e) => setContactForm(prev => ({ ...prev, ext: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fax</label>
              <input type="text" value={contactForm.fax} onChange={(e) => setContactForm(prev => ({ ...prev, fax: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cell Phone</label>
              <input type="text" value={contactForm.cell_phone} onChange={(e) => setContactForm(prev => ({ ...prev, cell_phone: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={contactForm.status} onChange={(e) => setContactForm(prev => ({ ...prev, status: e.target.value }))} className={selectClass}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={() => setShowContactModal(false)}>Cancel</Button>
            <Button type="button" onClick={handleSaveContact} className="bg-green-500 hover:bg-green-600">Save</Button>
          </div>
        </Modal>

        {/* Activity Modal */}
        <Modal isOpen={showActivityModal} onClose={() => setShowActivityModal(false)} title={editingActivity ? 'Edit Activity' : 'Add Activity'}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Activity Type *</label>
              <select value={activityForm.activity_type} onChange={(e) => setActivityForm(prev => ({ ...prev, activity_type: e.target.value }))} className={selectClass}>
                {activityTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subject *</label>
              <input type="text" value={activityForm.subject} onChange={(e) => setActivityForm(prev => ({ ...prev, subject: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input type="date" value={activityForm.start_date} onChange={(e) => setActivityForm(prev => ({ ...prev, start_date: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input type="date" value={activityForm.due_date} onChange={(e) => setActivityForm(prev => ({ ...prev, due_date: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select value={activityForm.priority} onChange={(e) => setActivityForm(prev => ({ ...prev, priority: e.target.value }))} className={selectClass}>
                {priorityOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={activityForm.status} onChange={(e) => setActivityForm(prev => ({ ...prev, status: e.target.value }))} className={selectClass}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={activityForm.description} onChange={(e) => setActivityForm(prev => ({ ...prev, description: e.target.value }))} className="w-full px-3 py-2 text-sm border rounded" rows={3} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={() => setShowActivityModal(false)}>Cancel</Button>
            <Button type="button" onClick={handleSaveActivity} className="bg-green-500 hover:bg-green-600">Save</Button>
          </div>
        </Modal>

        {/* Memo Modal */}
        <Modal isOpen={showMemoModal} onClose={() => setShowMemoModal(false)} title={editingMemo ? 'Edit Memo' : 'Add Memo'}>
          <div>
            <label className="block text-sm font-medium mb-1">Memo Details *</label>
            <textarea value={memoForm.details} onChange={(e) => setMemoForm({ details: e.target.value })} className="w-full px-3 py-2 text-sm border rounded" rows={6} placeholder="Enter memo details..." />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={() => setShowMemoModal(false)}>Cancel</Button>
            <Button type="button" onClick={handleSaveMemo} className="bg-green-500 hover:bg-green-600">Save</Button>
          </div>
        </Modal>

        {/* Qualified Profile Modal */}
        <Modal isOpen={showQualifiedModal} onClose={() => setShowQualifiedModal(false)} title={editingQualified ? 'Edit Qualified Profile' : 'Create Qualified Profile'}>
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            {/* Contact Information Section */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3 pb-2 border-b">Contact Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Select Contact</label>
                  <select value={qualifiedForm.contact_id} onChange={(e) => {
                    const contact = contacts.find(c => c.id.toString() === e.target.value);
                    setQualifiedForm(prev => ({
                      ...prev,
                      contact_id: e.target.value,
                      contact_name: contact ? `${contact.first_name} ${contact.last_name || ''}`.trim() : prev.contact_name,
                      designation: contact?.designation || prev.designation,
                      phone: contact?.work_phone || contact?.cell_phone || prev.phone,
                      email: contact?.work_email || prev.email,
                    }));
                  }} className={selectClass}>
                    <option value="">Select Contact</option>
                    {contacts.map(c => (
                      <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Name</label>
                  <input type="text" value={qualifiedForm.contact_name} onChange={(e) => setQualifiedForm(prev => ({ ...prev, contact_name: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Designation</label>
                  <input type="text" value={qualifiedForm.designation} onChange={(e) => setQualifiedForm(prev => ({ ...prev, designation: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input type="text" value={qualifiedForm.phone} onChange={(e) => setQualifiedForm(prev => ({ ...prev, phone: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" value={qualifiedForm.email} onChange={(e) => setQualifiedForm(prev => ({ ...prev, email: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Best Time to Call</label>
                  <input type="text" value={qualifiedForm.best_time_call} onChange={(e) => setQualifiedForm(prev => ({ ...prev, best_time_call: e.target.value }))} className={inputClass} placeholder="e.g., 10 AM - 2 PM" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Timezone</label>
                  <select value={qualifiedForm.best_time_call_timezone} onChange={(e) => setQualifiedForm(prev => ({ ...prev, best_time_call_timezone: e.target.value }))} className={selectClass}>
                    {timezoneOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Preferred Mode</label>
                  <select value={qualifiedForm.mode} onChange={(e) => setQualifiedForm(prev => ({ ...prev, mode: e.target.value }))} className={selectClass}>
                    {modeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Company Information Section */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3 pb-2 border-b">Company Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Company Name</label>
                  <input type="text" value={qualifiedForm.company_name} onChange={(e) => setQualifiedForm(prev => ({ ...prev, company_name: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Industry</label>
                  <select value={qualifiedForm.industry_id} onChange={(e) => setQualifiedForm(prev => ({ ...prev, industry_id: e.target.value }))} className={selectClass}>
                    {industryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Company Profile</label>
                  <textarea value={qualifiedForm.company_profile} onChange={(e) => setQualifiedForm(prev => ({ ...prev, company_profile: e.target.value }))} className="w-full px-3 py-2 text-sm border rounded" rows={3} placeholder="Brief company description..." />
                </div>
              </div>
            </div>

            {/* Need Assessment Section */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3 pb-2 border-b">Need Assessment</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Need Type</label>
                  <select value={qualifiedForm.need_type} onChange={(e) => setQualifiedForm(prev => ({ ...prev, need_type: e.target.value }))} className={selectClass}>
                    {needTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Current Software</label>
                  <input type="text" value={qualifiedForm.current_software} onChange={(e) => setQualifiedForm(prev => ({ ...prev, current_software: e.target.value }))} className={inputClass} placeholder="Current solution being used" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Need Summary</label>
                  <textarea value={qualifiedForm.need_summary} onChange={(e) => setQualifiedForm(prev => ({ ...prev, need_summary: e.target.value }))} className="w-full px-3 py-2 text-sm border rounded" rows={3} placeholder="Describe the client's requirements..." />
                </div>
              </div>
            </div>

            {/* Qualification Criteria Section */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3 pb-2 border-b">Qualification Criteria (BANT)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Budget</label>
                  <select value={qualifiedForm.budget} onChange={(e) => setQualifiedForm(prev => ({ ...prev, budget: e.target.value }))} className={selectClass}>
                    {budgetOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Decision Maker</label>
                  <select value={qualifiedForm.decision_maker} onChange={(e) => setQualifiedForm(prev => ({ ...prev, decision_maker: e.target.value }))} className={selectClass}>
                    {decisionMakerOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time Frame</label>
                  <select value={qualifiedForm.time_frame} onChange={(e) => setQualifiedForm(prev => ({ ...prev, time_frame: e.target.value }))} className={selectClass}>
                    {timeFrameOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Profile Status</label>
                  <select value={qualifiedForm.status} onChange={(e) => setQualifiedForm(prev => ({ ...prev, status: e.target.value }))} className={selectClass}>
                    {qualifiedStatusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Discussion & Conclusion Section */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3 pb-2 border-b">Discussion & Conclusion</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Summary of Discussion</label>
                  <textarea value={qualifiedForm.summary_of_discussion} onChange={(e) => setQualifiedForm(prev => ({ ...prev, summary_of_discussion: e.target.value }))} className="w-full px-3 py-2 text-sm border rounded" rows={4} placeholder="Key points from the discussion..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Conclusion</label>
                  <textarea value={qualifiedForm.conclusion} onChange={(e) => setQualifiedForm(prev => ({ ...prev, conclusion: e.target.value }))} className="w-full px-3 py-2 text-sm border rounded" rows={3} placeholder="Final conclusion and next steps..." />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => setShowQualifiedModal(false)}>Cancel</Button>
            <Button type="button" onClick={handleSaveQualified} className="bg-green-500 hover:bg-green-600">Save</Button>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
}
