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
  Calendar as CalendarIcon,
  Link2
} from 'lucide-react';
import api from '@/lib/api';
import { Lead, Contact, Activity } from '@/types';
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
  // Qualified Lead Acknowledgement
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
  // Additional Information
  need_type?: string;
  current_software?: string;
  need_summary?: string;
  budget?: string;
  decision_maker?: string;
  time_frame?: string;
  qualified_by?: number;
  qualified_by_name?: string;
  // Text Areas
  company_profile?: string;
  summary_of_discussion?: string;
  conclusion?: string;
  // Legacy fields
  company_type?: string;
  annual_revenue?: string;
  employee_count?: string;
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

// Static Options
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

// Dynamic options (groups, industry, region, source) will be fetched from Option Master

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

// Location options will be fetched dynamically

const contactTypeOptions = [
  { value: 'management', label: 'Management' },
  { value: 'technical', label: 'Technical' },
  { value: 'sales', label: 'Sales' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'accounts', label: 'Accounts' },
  { value: 'hr', label: 'HR' },
  { value: 'other', label: 'Other' },
];

const titleOptions = [
  { value: 'Mr.', label: 'Mr.' },
  { value: 'Mrs.', label: 'Mrs.' },
  { value: 'Ms.', label: 'Ms.' },
  { value: 'Dr.', label: 'Dr.' },
];

const contactStatusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const activityTypeOptions = [
  { value: 'email', label: 'Email' },
  { value: 'call', label: 'Call' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'video_call', label: 'Video Call' },
  { value: 'site_visit', label: 'Site Visit' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'task', label: 'Task' },
  { value: 'note', label: 'Note' },
  { value: 'other', label: 'Other' },
];

const activityPriorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'regular', label: 'Regular' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const activityStatusOptions = [
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
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

// Qualified Profile Options
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

  // Dynamic dropdown options from Option Master
  const [groupOptions, setGroupOptions] = useState<{value: string, label: string}[]>([{ value: '', label: 'Select Group' }]);
  const [industryOptions, setIndustryOptions] = useState<{value: string, label: string}[]>([{ value: '', label: 'Select Industry' }]);
  const [regionOptions, setRegionOptions] = useState<{value: string, label: string}[]>([{ value: '', label: 'Select Region' }]);
  const [sourceOptions, setSourceOptions] = useState<{value: string, label: string}[]>([{ value: '', label: 'Select Lead Source' }]);

  // Dynamic location options
  const [countryOptions, setCountryOptions] = useState<{value: string, label: string}[]>([{ value: '', label: 'Select Country' }]);
  const [stateOptions, setStateOptions] = useState<{value: string, label: string}[]>([{ value: '', label: 'Select State' }]);
  const [cityOptions, setCityOptions] = useState<{value: string, label: string}[]>([{ value: '', label: 'Select City' }]);

  // Contact Tab state - moved to top level
  const [contactTypeFilter, setContactTypeFilter] = useState<string>('all');
  const [inlineContactForm, setInlineContactForm] = useState<LeadContact | null>(null);
  const [editingContactId, setEditingContactId] = useState<number | null>(null);

  // Social Media Links Modal state
  const [showSocialMediaModal, setShowSocialMediaModal] = useState(false);
  const [selectedContactForSocial, setSelectedContactForSocial] = useState<LeadContact | null>(null);
  const [socialMediaForm, setSocialMediaForm] = useState({
    business_card: null as File | null,
    linkedin_url: '',
    facebook_url: '',
    twitter_url: '',
    notes: '',
  });

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

  // Qualified Profile Form state (for inline editing)
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<LeadForm>({
    resolver: zodResolver(leadSchema),
  });

  // Watch for country/state changes to fetch cascading data
  const selectedCountryId = watch('country_id');
  const selectedStateId = watch('state_id');

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
        status: leadRes.status?.toString() || '',
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
        // Load first profile into form if exists
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
          // Initialize with lead data
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
  }, [leadId, reset]);

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
          } else if (title === 'company region' || title === 'region' || title === 'regions') {
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
      if (selectedCountryId) {
        try {
          const states = await api.getStates(parseInt(selectedCountryId));
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
      setCityOptions([{ value: '', label: 'Select City' }]);
    };
    fetchStates();
  }, [selectedCountryId]);

  // Fetch cities when state changes
  useEffect(() => {
    const fetchCities = async () => {
      if (selectedStateId) {
        try {
          const cities = await api.getCities(parseInt(selectedStateId));
          if (cities && cities.length > 0) {
            const activeCities = cities.filter((c: any) => c.status === 'Active');
            const options = activeCities.map((c: any) => ({ value: c.id.toString(), label: c.name }));
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
  }, [selectedStateId]);

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
      contact_type: 'management',
      title: 'Mr.',
      first_name: '',
      last_name: '',
      designation: '',
      department: '',
      email: '',
      work_email: '',
      personal_email: '',
      phone: '',
      work_phone: '',
      ext: '',
      fax: '',
      cell_phone: '',
      home_phone: '',
      linkedin_url: '',
      facebook_url: '',
      twitter_url: '',
      notes: '',
      is_primary: false,
      status: 'active',
    });
  };

  const handleEditContact = (contact: LeadContact) => {
    setEditingContactId(contact.id || null);
    setInlineContactForm({ ...contact });
  };

  const handleSaveContact = async () => {
    if (!inlineContactForm) return;
    try {
      // Build clean data object with proper null handling
      const cleanData: Record<string, any> = {};

      // Required fields
      cleanData.lead_id = leadId;
      cleanData.first_name = inlineContactForm.first_name?.trim() || '';
      cleanData.contact_type = inlineContactForm.contact_type || 'management';
      cleanData.is_primary = inlineContactForm.is_primary || false;
      cleanData.status = inlineContactForm.status || 'active';

      // Validate required field
      if (!cleanData.first_name) {
        setError('First name is required');
        return;
      }

      // Optional string fields - convert empty/whitespace to null
      const optionalStringFields = ['last_name', 'designation', 'department', 'title',
        'phone', 'work_phone', 'ext', 'fax', 'cell_phone', 'home_phone',
        'linkedin_url', 'facebook_url', 'twitter_url', 'notes'];

      optionalStringFields.forEach(field => {
        const value = (inlineContactForm as any)[field];
        if (value && typeof value === 'string' && value.trim() !== '') {
          cleanData[field] = value.trim();
        } else {
          cleanData[field] = null;
        }
      });

      // Email fields - strict validation, convert empty to null
      const emailFields = ['email', 'work_email', 'personal_email'];
      emailFields.forEach(field => {
        const value = (inlineContactForm as any)[field];
        if (value && typeof value === 'string' && value.trim() !== '') {
          cleanData[field] = value.trim();
        } else {
          cleanData[field] = null;
        }
      });

      console.log('Saving contact with data:', JSON.stringify(cleanData, null, 2));

      if (editingContactId) {
        await api.updateLeadContact(leadId, editingContactId, cleanData);
      } else {
        await api.createLeadContact(leadId, cleanData);
      }
      setInlineContactForm(null);
      setEditingContactId(null);
      const contactsRes = await api.getLeadContactsForEdit(leadId);
      setContacts(contactsRes || []);
      setSuccess('Contact saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Save contact error:', err);
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

  // Social Media Links Handlers
  const handleOpenSocialMediaModal = (contact: LeadContact) => {
    setSelectedContactForSocial(contact);
    setSocialMediaForm({
      business_card: null,
      linkedin_url: contact.linkedin_url || '',
      facebook_url: contact.facebook_url || '',
      twitter_url: contact.twitter_url || '',
      notes: '',
    });
    setShowSocialMediaModal(true);
  };

  const handleSaveSocialMediaLinks = async () => {
    if (!selectedContactForSocial || !selectedContactForSocial.id) return;

    try {
      const updateData: Record<string, any> = {
        linkedin_url: socialMediaForm.linkedin_url || null,
        facebook_url: socialMediaForm.facebook_url || null,
        twitter_url: socialMediaForm.twitter_url || null,
      };

      await api.updateLeadContact(leadId, selectedContactForSocial.id, updateData);
      const contactsRes = await api.getLeadContactsForEdit(leadId);
      setContacts(contactsRes || []);
      setShowSocialMediaModal(false);
      setSelectedContactForSocial(null);
      setSuccess('Social media links updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update social media links');
    }
  };

  // Activity Handlers
  const handleAddActivity = () => {
    const today = new Date().toISOString().split('T')[0];
    setEditingActivity({
      lead_id: leadId,
      activity_type: 'email',
      subject: '',
      description: '',
      outcome: '',
      activity_date: today,
      start_time: '',
      end_date: today,
      end_time: '',
      priority: 'regular',
      status: 'in_progress',
      assigned_to: undefined,
      contact_id: undefined,
      contact_name: '',
      contact_email: '',
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
      // Clean data - convert empty strings to null for optional fields
      const cleanData: any = { ...editingActivity };
      const optionalFields = ['description', 'outcome', 'due_date', 'start_time', 'end_date', 'end_time', 'contact_name', 'contact_email'];

      optionalFields.forEach(field => {
        if (cleanData[field] === '' || cleanData[field] === undefined) {
          cleanData[field] = null;
        }
      });

      // Handle optional integer fields
      if (cleanData.contact_id === '' || cleanData.contact_id === undefined) {
        cleanData.contact_id = null;
      }
      if (cleanData.assigned_to === '' || cleanData.assigned_to === undefined) {
        cleanData.assigned_to = null;
      }

      // Validate required fields
      if (!cleanData.activity_type || cleanData.activity_type.trim() === '') {
        setError('Activity type is required');
        return;
      }
      if (!cleanData.subject || cleanData.subject.trim() === '') {
        setError('Subject is required');
        return;
      }
      if (!cleanData.activity_date) {
        setError('Activity date is required');
        return;
      }

      if (cleanData.id) {
        await api.updateLeadActivity(leadId, cleanData.id, cleanData);
      } else {
        await api.createLeadActivity(leadId, cleanData);
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
      // Clean data
      const cleanData: any = { ...editingMemo };

      // Validate required fields
      if (!cleanData.title || cleanData.title.trim() === '') {
        setError('Title is required');
        return;
      }
      if (!cleanData.content || cleanData.content.trim() === '') {
        setError('Content is required');
        return;
      }
      if (!cleanData.memo_type) {
        cleanData.memo_type = 'general';
      }

      if (cleanData.id) {
        await api.updateLeadMemo(leadId, cleanData.id, cleanData);
      } else {
        await api.createLeadMemo(leadId, cleanData);
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
    if (!newStatus.status) {
      setError('Status is required');
      return;
    }
    try {
      // Clean data - convert empty strings to null for optional fields
      const cleanData: any = { ...newStatus };
      if (cleanData.status_date === '' || cleanData.status_date === undefined) {
        cleanData.status_date = null;
      }
      if (cleanData.remarks === '' || cleanData.remarks === undefined) {
        cleanData.remarks = null;
      }

      await api.changeLeadStatus(leadId, cleanData);
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
      // Clean data - convert empty strings to null for optional fields
      const cleanData: any = { ...editingProfile };
      const optionalStringFields = ['company_name', 'company_type', 'annual_revenue', 'employee_count',
        'decision_maker', 'decision_process', 'budget', 'timeline', 'competitors',
        'current_solution', 'pain_points', 'requirements', 'notes'];

      optionalStringFields.forEach(field => {
        if (cleanData[field] === '' || cleanData[field] === undefined) {
          cleanData[field] = null;
        }
      });

      // Handle optional integer field
      if (cleanData.industry_id === '' || cleanData.industry_id === undefined) {
        cleanData.industry_id = null;
      }

      // Set default profile_type if not set
      if (!cleanData.profile_type) {
        cleanData.profile_type = 'basic';
      }

      if (cleanData.id) {
        await api.updateLeadQualifiedProfile(leadId, cleanData.id, cleanData);
      } else {
        await api.createLeadQualifiedProfile(leadId, cleanData);
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

  // Save Qualified Profile Form (inline)
  const handleSaveQualifiedProfileForm = async () => {
    try {
      // Clean data - convert empty strings to null for optional fields
      const cleanData: any = { ...qualifiedProfileForm, lead_id: leadId };
      const optionalStringFields = ['company_name', 'company_type', 'annual_revenue', 'employee_count',
        'decision_maker', 'decision_process', 'budget', 'timeline', 'competitors',
        'current_solution', 'pain_points', 'requirements', 'notes'];

      optionalStringFields.forEach(field => {
        if (cleanData[field] === '' || cleanData[field] === undefined) {
          cleanData[field] = null;
        }
      });

      // Handle optional integer field
      if (cleanData.industry_id === '' || cleanData.industry_id === undefined) {
        cleanData.industry_id = null;
      }

      // Set default profile_type if not set
      if (!cleanData.profile_type) {
        cleanData.profile_type = 'basic';
      }

      if (qualifiedProfiles.length > 0 && qualifiedProfiles[0].id) {
        // Update existing profile
        await api.updateLeadQualifiedProfile(leadId, qualifiedProfiles[0].id, cleanData);
      } else {
        // Create new profile
        await api.createLeadQualifiedProfile(leadId, cleanData);
      }

      const profilesRes = await api.getLeadQualifiedProfiles(leadId);
      setQualifiedProfiles(profilesRes || []);
      setSuccess('Qualified profile saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save qualified profile');
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

    const thClass = "px-2 py-2 text-left text-xs font-semibold text-blue-600 bg-blue-50 border-b border-gray-200";
    const tdClass = "px-2 py-1.5 text-xs border-b border-gray-100";
    const inputSmClass = "w-full h-7 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500";
    const selectSmClass = "w-full h-7 px-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white";

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
                  <th className={thClass} style={{ width: '13%' }}>Work Email</th>
                  <th className={thClass} style={{ width: '11%' }}>Work Phone</th>
                  <th className={thClass} style={{ width: '5%' }}>Ext.</th>
                  <th className={thClass} style={{ width: '6%' }}>Fax</th>
                  <th className={thClass} style={{ width: '11%' }}>Cell Phone</th>
                  <th className={thClass} style={{ width: '7%' }}>Status</th>
                  <th className={thClass} style={{ width: '8%' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {/* Input Row for Adding New Contact */}
                <tr className="bg-white">
                  <td className={tdClass}>
                    <select
                      value={inlineContactForm?.contact_type || 'management'}
                      onChange={(e) => setInlineContactForm(prev => prev ? { ...prev, contact_type: e.target.value } : {
                        lead_id: leadId, contact_type: e.target.value, title: 'Mr.', first_name: '', is_primary: false, status: 'active'
                      })}
                      className={selectSmClass}
                    >
                      {contactTypeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className={tdClass}>
                    <select
                      value={inlineContactForm?.title || 'Mr.'}
                      onChange={(e) => setInlineContactForm(prev => prev ? { ...prev, title: e.target.value } : {
                        lead_id: leadId, contact_type: 'management', title: e.target.value, first_name: '', is_primary: false, status: 'active'
                      })}
                      className={selectSmClass}
                    >
                      {titleOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className={tdClass}>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={inlineContactForm?.first_name || ''}
                      onChange={(e) => setInlineContactForm(prev => prev ? { ...prev, first_name: e.target.value } : {
                        lead_id: leadId, contact_type: 'management', title: 'Mr.', first_name: e.target.value, is_primary: false, status: 'active'
                      })}
                      className={inputSmClass}
                    />
                  </td>
                  <td className={tdClass}>
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={inlineContactForm?.last_name || ''}
                      onChange={(e) => setInlineContactForm(prev => prev ? { ...prev, last_name: e.target.value } : {
                        lead_id: leadId, contact_type: 'management', title: 'Mr.', first_name: '', last_name: e.target.value, is_primary: false, status: 'active'
                      })}
                      className={inputSmClass}
                    />
                  </td>
                  <td className={tdClass}>
                    <input
                      type="text"
                      placeholder="Designation"
                      value={inlineContactForm?.designation || ''}
                      onChange={(e) => setInlineContactForm(prev => prev ? { ...prev, designation: e.target.value } : {
                        lead_id: leadId, contact_type: 'management', title: 'Mr.', first_name: '', designation: e.target.value, is_primary: false, status: 'active'
                      })}
                      className={inputSmClass}
                    />
                  </td>
                  <td className={tdClass}>
                    <input
                      type="email"
                      placeholder="Work Email ID"
                      value={inlineContactForm?.email || ''}
                      onChange={(e) => setInlineContactForm(prev => prev ? { ...prev, email: e.target.value } : {
                        lead_id: leadId, contact_type: 'management', title: 'Mr.', first_name: '', email: e.target.value, is_primary: false, status: 'active'
                      })}
                      className={inputSmClass}
                    />
                  </td>
                  <td className={tdClass}>
                    <input
                      type="text"
                      placeholder="Work Phone"
                      value={inlineContactForm?.work_phone || ''}
                      onChange={(e) => setInlineContactForm(prev => prev ? { ...prev, work_phone: e.target.value } : {
                        lead_id: leadId, contact_type: 'management', title: 'Mr.', first_name: '', work_phone: e.target.value, is_primary: false, status: 'active'
                      })}
                      className={inputSmClass}
                    />
                  </td>
                  <td className={tdClass}>
                    <input
                      type="text"
                      placeholder="Ext."
                      value={inlineContactForm?.ext || ''}
                      onChange={(e) => setInlineContactForm(prev => prev ? { ...prev, ext: e.target.value } : {
                        lead_id: leadId, contact_type: 'management', title: 'Mr.', first_name: '', ext: e.target.value, is_primary: false, status: 'active'
                      })}
                      className={inputSmClass}
                    />
                  </td>
                  <td className={tdClass}>
                    <input
                      type="text"
                      placeholder="Fax"
                      value={inlineContactForm?.fax || ''}
                      onChange={(e) => setInlineContactForm(prev => prev ? { ...prev, fax: e.target.value } : {
                        lead_id: leadId, contact_type: 'management', title: 'Mr.', first_name: '', fax: e.target.value, is_primary: false, status: 'active'
                      })}
                      className={inputSmClass}
                    />
                  </td>
                  <td className={tdClass}>
                    <input
                      type="text"
                      placeholder="Cell Phone"
                      value={inlineContactForm?.cell_phone || inlineContactForm?.phone || ''}
                      onChange={(e) => setInlineContactForm(prev => prev ? { ...prev, cell_phone: e.target.value, phone: e.target.value } : {
                        lead_id: leadId, contact_type: 'management', title: 'Mr.', first_name: '', cell_phone: e.target.value, phone: e.target.value, is_primary: false, status: 'active'
                      })}
                      className={inputSmClass}
                    />
                  </td>
                  <td className={tdClass}>
                    <select
                      value={inlineContactForm?.status || 'active'}
                      onChange={(e) => setInlineContactForm(prev => prev ? { ...prev, status: e.target.value } : {
                        lead_id: leadId, contact_type: 'management', title: 'Mr.', first_name: '', is_primary: false, status: e.target.value
                      })}
                      className={selectSmClass}
                    >
                      {contactStatusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className={tdClass}>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          if (!inlineContactForm) {
                            handleAddContact();
                          } else {
                            handleSaveContact();
                          }
                        }}
                        className="px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
                      >
                        Add
                      </button>
                      {inlineContactForm && editingContactId === null && (
                        <button
                          onClick={() => setInlineContactForm(null)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>

                {/* Existing Contacts */}
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
                      No contacts found
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact) => (
                    editingContactId === contact.id ? (
                      /* Inline Edit Row */
                      <tr key={contact.id} className="bg-yellow-50">
                        <td className={tdClass}>
                          <select
                            value={inlineContactForm?.contact_type || ''}
                            onChange={(e) => setInlineContactForm(prev => prev ? { ...prev, contact_type: e.target.value } : null)}
                            className={selectSmClass}
                          >
                            {contactTypeOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className={tdClass}>
                          <select
                            value={inlineContactForm?.title || 'Mr.'}
                            onChange={(e) => setInlineContactForm(prev => prev ? { ...prev, title: e.target.value } : null)}
                            className={selectSmClass}
                          >
                            {titleOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className={tdClass}>
                          <input
                            type="text"
                            value={inlineContactForm?.first_name || ''}
                            onChange={(e) => setInlineContactForm(prev => prev ? { ...prev, first_name: e.target.value } : null)}
                            className={inputSmClass}
                          />
                        </td>
                        <td className={tdClass}>
                          <input
                            type="text"
                            value={inlineContactForm?.last_name || ''}
                            onChange={(e) => setInlineContactForm(prev => prev ? { ...prev, last_name: e.target.value } : null)}
                            className={inputSmClass}
                          />
                        </td>
                        <td className={tdClass}>
                          <input
                            type="text"
                            value={inlineContactForm?.designation || ''}
                            onChange={(e) => setInlineContactForm(prev => prev ? { ...prev, designation: e.target.value } : null)}
                            className={inputSmClass}
                          />
                        </td>
                        <td className={tdClass}>
                          <input
                            type="email"
                            value={inlineContactForm?.email || ''}
                            onChange={(e) => setInlineContactForm(prev => prev ? { ...prev, email: e.target.value } : null)}
                            className={inputSmClass}
                          />
                        </td>
                        <td className={tdClass}>
                          <input
                            type="text"
                            value={inlineContactForm?.work_phone || ''}
                            onChange={(e) => setInlineContactForm(prev => prev ? { ...prev, work_phone: e.target.value } : null)}
                            className={inputSmClass}
                          />
                        </td>
                        <td className={tdClass}>
                          <input
                            type="text"
                            value={inlineContactForm?.ext || ''}
                            onChange={(e) => setInlineContactForm(prev => prev ? { ...prev, ext: e.target.value } : null)}
                            className={inputSmClass}
                          />
                        </td>
                        <td className={tdClass}>
                          <input
                            type="text"
                            value={inlineContactForm?.fax || ''}
                            onChange={(e) => setInlineContactForm(prev => prev ? { ...prev, fax: e.target.value } : null)}
                            className={inputSmClass}
                          />
                        </td>
                        <td className={tdClass}>
                          <input
                            type="text"
                            value={inlineContactForm?.cell_phone || inlineContactForm?.phone || ''}
                            onChange={(e) => setInlineContactForm(prev => prev ? { ...prev, cell_phone: e.target.value, phone: e.target.value } : null)}
                            className={inputSmClass}
                          />
                        </td>
                        <td className={tdClass}>
                          <select
                            value={inlineContactForm?.status || 'active'}
                            onChange={(e) => setInlineContactForm(prev => prev ? { ...prev, status: e.target.value } : null)}
                            className={selectSmClass}
                          >
                            {contactStatusOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className={tdClass}>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={handleSaveContact}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Save"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setInlineContactForm(null); setEditingContactId(null); }}
                              className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      /* Display Row */
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
                        <td className={tdClass}>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditContact(contact)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenSocialMediaModal(contact)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Social Media Links"
                            >
                              <Link2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => contact.id && handleDeleteContact(contact.id)}
                              className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Render Activities Tab
  const renderActivities = () => {
    const thClass = "px-4 py-2.5 text-left text-xs font-semibold text-blue-700 bg-gradient-to-b from-blue-50 to-blue-100 border-b-2 border-blue-200";
    const tdClass = "px-4 py-2.5 text-xs";

    // Get activity type color
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
        {/* Header with Add Button */}
        <div className="flex items-center justify-end mb-4">
          <button
            onClick={handleAddActivity}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 transition-colors"
          >
            Add New Activity
          </button>
        </div>

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
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/50 cursor-pointer transition-colors`}
                      onClick={() => handleEditActivity(activity)}
                    >
                      <td className={tdClass}>
                        <span className={`font-medium capitalize ${getActivityTypeColor(activity.activity_type)}`}>
                          {activity.activity_type?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className={tdClass}>
                        {activity.contact_name ? (
                          <span className="text-blue-600 hover:underline">
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

  // Render Qualified Lead Profile Tab
  const renderQualifiedProfile = () => {
    const sectionTitleClass = "text-sm font-semibold text-orange-600 uppercase tracking-wide mb-4";
    const labelClass = "text-xs font-medium text-blue-600 mb-1 block";
    const inputClass = "w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500";
    const selectClass = "w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white";

    // Rich text toolbar component
    const RichTextToolbar = () => (
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50 flex-wrap">
        <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded font-bold text-sm">B</button>
        <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded italic text-sm font-serif">I</button>
        <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded underline text-sm">U</button>
        <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded text-sm">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/></svg>
        </button>
        <span className="w-px h-5 bg-gray-300 mx-1"></span>
        <select className="h-7 text-xs border border-gray-300 rounded px-1 bg-white">
          <option>Jost</option>
          <option>Arial</option>
        </select>
        <select className="h-7 w-12 text-xs border border-gray-300 rounded px-1 bg-white ml-1">
          <option>14</option>
          <option>12</option>
          <option>16</option>
        </select>
        <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded ml-1 bg-yellow-200 font-bold text-sm">A</button>
        <span className="w-px h-5 bg-gray-300 mx-1"></span>
        <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
        </button>
        <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
        </button>
        <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
        </button>
      </div>
    );

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
                  onChange={(e) => setQualifiedProfileForm({ ...qualifiedProfileForm, company: e.target.value })}
                  className={inputClass}
                  placeholder="Company Name"
                />
              </div>
              <div>
                <label className={labelClass}>Industry</label>
                <input
                  type="text"
                  value={qualifiedProfileForm.industry || ''}
                  onChange={(e) => setQualifiedProfileForm({ ...qualifiedProfileForm, industry: e.target.value })}
                  className={inputClass}
                  placeholder="Industry"
                />
              </div>
              <div>
                <label className={labelClass}>Best Time (Call)</label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={qualifiedProfileForm.best_time_call || ''}
                    onChange={(e) => setQualifiedProfileForm({ ...qualifiedProfileForm, best_time_call: e.target.value })}
                    className={`${inputClass} flex-1`}
                  />
                  <select
                    value={qualifiedProfileForm.timezone || ''}
                    onChange={(e) => setQualifiedProfileForm({ ...qualifiedProfileForm, timezone: e.target.value })}
                    className={`${selectClass} flex-1`}
                  >
                    <option value="">Select Company Timezone</option>
                    {timezoneOptions.filter(o => o.value).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Mode</label>
                <select
                  value={qualifiedProfileForm.mode || ''}
                  onChange={(e) => setQualifiedProfileForm({ ...qualifiedProfileForm, mode: e.target.value })}
                  className={selectClass}
                >
                  {modeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Contact</label>
                <select
                  value={qualifiedProfileForm.contact_id || ''}
                  onChange={(e) => {
                    const selectedContact = contacts.find(c => c.id === parseInt(e.target.value));
                    setQualifiedProfileForm({
                      ...qualifiedProfileForm,
                      contact_id: e.target.value ? parseInt(e.target.value) : undefined,
                      contact_name: selectedContact ? `${selectedContact.first_name} ${selectedContact.last_name || ''}`.trim() : '',
                      designation: selectedContact?.designation || '',
                      phone: selectedContact?.phone || selectedContact?.work_phone || '',
                      email: selectedContact?.email || '',
                    });
                  }}
                  className={selectClass}
                >
                  <option value="">Select Contact</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {`${contact.first_name} ${contact.last_name || ''}`.trim()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Designation</label>
                <input
                  type="text"
                  value={qualifiedProfileForm.designation || ''}
                  onChange={(e) => setQualifiedProfileForm({ ...qualifiedProfileForm, designation: e.target.value })}
                  className={inputClass}
                  placeholder="Auto Fill"
                  readOnly
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="text"
                  value={qualifiedProfileForm.phone || ''}
                  onChange={(e) => setQualifiedProfileForm({ ...qualifiedProfileForm, phone: e.target.value })}
                  className={inputClass}
                  placeholder="Phone"
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={qualifiedProfileForm.email || ''}
                  onChange={(e) => setQualifiedProfileForm({ ...qualifiedProfileForm, email: e.target.value })}
                  className={inputClass}
                  placeholder="Email"
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
                <select
                  value={qualifiedProfileForm.need_type || ''}
                  onChange={(e) => setQualifiedProfileForm({ ...qualifiedProfileForm, need_type: e.target.value })}
                  className={selectClass}
                >
                  {needTypeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Current Soft</label>
                <input
                  type="text"
                  value={qualifiedProfileForm.current_software || ''}
                  onChange={(e) => setQualifiedProfileForm({ ...qualifiedProfileForm, current_software: e.target.value })}
                  className={inputClass}
                  placeholder="Current Software"
                />
              </div>
              <div>
                <label className={labelClass}>Need Summary</label>
                <textarea
                  value={qualifiedProfileForm.need_summary || ''}
                  onChange={(e) => setQualifiedProfileForm({ ...qualifiedProfileForm, need_summary: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  rows={2}
                  placeholder="Summary"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Budget</label>
                <select
                  value={qualifiedProfileForm.budget || ''}
                  onChange={(e) => setQualifiedProfileForm({ ...qualifiedProfileForm, budget: e.target.value })}
                  className={selectClass}
                >
                  {budgetOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Decision Maker</label>
                <select
                  value={qualifiedProfileForm.decision_maker || ''}
                  onChange={(e) => setQualifiedProfileForm({ ...qualifiedProfileForm, decision_maker: e.target.value })}
                  className={selectClass}
                >
                  <option value="">Select Decision Maker</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={`${contact.first_name} ${contact.last_name || ''}`.trim()}>
                      {`${contact.first_name} ${contact.last_name || ''}`.trim()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Time Frame</label>
                <select
                  value={qualifiedProfileForm.time_frame || ''}
                  onChange={(e) => setQualifiedProfileForm({ ...qualifiedProfileForm, time_frame: e.target.value })}
                  className={selectClass}
                >
                  {timeFrameOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Qualified By</label>
                <select
                  value={qualifiedProfileForm.qualified_by || ''}
                  onChange={(e) => setQualifiedProfileForm({ ...qualifiedProfileForm, qualified_by: e.target.value ? parseInt(e.target.value) : undefined })}
                  className={selectClass}
                >
                  <option value="">Select User</option>
                  {salesRepOptions.filter(opt => opt.value).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* COMPANY PROFILE */}
        <div>
          <h3 className={sectionTitleClass}>COMPANY PROFILE</h3>
          <div className="border border-gray-300 rounded overflow-hidden">
            <RichTextToolbar />
            <textarea
              value={qualifiedProfileForm.company_profile || ''}
              onChange={(e) => setQualifiedProfileForm({ ...qualifiedProfileForm, company_profile: e.target.value })}
              className="w-full px-3 py-2 text-sm focus:outline-none resize-none border-0"
              rows={6}
              placeholder="Enter company profile..."
            />
          </div>
        </div>

        {/* SUMMARY OF DISCUSSION */}
        <div>
          <h3 className={sectionTitleClass}>SUMMARY OF DISCUSSION</h3>
          <div className="border border-gray-300 rounded overflow-hidden">
            <RichTextToolbar />
            <textarea
              value={qualifiedProfileForm.summary_of_discussion || ''}
              onChange={(e) => setQualifiedProfileForm({ ...qualifiedProfileForm, summary_of_discussion: e.target.value })}
              className="w-full px-3 py-2 text-sm focus:outline-none resize-none border-0"
              rows={6}
              placeholder="Enter summary of discussion..."
            />
          </div>
        </div>

        {/* CONCLUSION */}
        <div>
          <h3 className={sectionTitleClass}>CONCLUSION</h3>
          <div className="border border-gray-300 rounded overflow-hidden">
            <RichTextToolbar />
            <textarea
              value={qualifiedProfileForm.conclusion || ''}
              onChange={(e) => setQualifiedProfileForm({ ...qualifiedProfileForm, conclusion: e.target.value })}
              className="w-full px-3 py-2 text-sm focus:outline-none resize-none border-0"
              rows={6}
              placeholder="Enter conclusion..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3 pt-4 border-t">
          <button
            onClick={handleSaveQualifiedProfileForm}
            className="px-6 py-2 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600 transition-colors"
          >
            Save
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-white text-gray-700 text-sm font-medium rounded border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Print
          </button>
        </div>
      </div>
    );
  };

  // Render Memo Tab
  const renderMemo = () => {
    const thClass = "px-4 py-2.5 text-left text-xs font-semibold text-white bg-blue-600";

    return (
      <div>
        {/* Add Memo Button */}
        <div className="flex items-center justify-start mb-4">
          <button
            onClick={handleAddMemo}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 transition-colors"
          >
            Add Memo
          </button>
        </div>

        {/* Memos Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass} style={{ width: '15%' }}>Date</th>
                <th className={thClass} style={{ width: '20%' }}>Added By</th>
                <th className={thClass}>Details</th>
                <th className={thClass} style={{ width: '10%' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {memos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500 bg-gray-50">
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditMemo(memo)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => memo.id && handleDeleteMemo(memo.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
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

  // Render Upload File Tab
  const renderUploadFile = () => {
    const thClass = "px-4 py-2.5 text-left text-xs font-semibold text-white bg-blue-600";

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setDocumentFile(e.target.files[0]);
      }
    };

    const handleDirectUpload = async () => {
      if (!documentFile) {
        alert('Please select a file first');
        return;
      }
      // Trigger the existing upload logic
      setShowDocumentModal(true);
    };

    return (
      <div>
        {/* Upload Form */}
        <div className="mb-6 space-y-4">
          {/* Document Row */}
          <div className="flex items-center gap-4">
            <label className="w-24 text-sm font-medium text-gray-600 text-right">Document</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={documentFile?.name || ''}
                readOnly
                className="w-64 px-3 py-1.5 text-sm border border-gray-300 rounded bg-gray-50"
                placeholder=""
              />
              <label className="px-4 py-1.5 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded cursor-pointer transition-colors flex items-center gap-1">
                <Upload className="w-4 h-4" />
                Choose File
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleDirectUpload}
                className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Upload
              </button>
            </div>
          </div>

          {/* Notes Row */}
          <div className="flex items-center gap-4">
            <label className="w-24 text-sm font-medium text-gray-600 text-right">Notes</label>
            <input
              type="text"
              value={documentNotes}
              onChange={(e) => setDocumentNotes(e.target.value)}
              className="w-64 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder=""
            />
          </div>
        </div>

        {/* Documents Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>File Name</th>
                <th className={thClass} style={{ width: '15%' }}>Uploaded On</th>
                <th className={thClass} style={{ width: '10%' }}>Size</th>
                <th className={thClass}>Notes</th>
                <th className={thClass} style={{ width: '12%' }}>Actions</th>
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
                      <div className="flex items-center justify-center gap-1">
                        <a
                          href={doc.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => doc.id && handleDeleteDocument(doc.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
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

  // Render Status Tab
  const renderStatus = () => {
    const thClass = "px-4 py-2.5 text-left text-xs font-semibold text-white bg-blue-600";

    return (
      <div>
        {/* Current Status Row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-blue-600">Current Status</label>
            <input
              type="text"
              value={leadData?.lead_status ? leadData.lead_status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '-'}
              readOnly
              className="w-64 px-3 py-1.5 text-sm border border-gray-300 rounded bg-gray-50"
            />
          </div>
          <button
            onClick={() => setShowStatusModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            Status Change History
          </button>
        </div>

        {/* Status History Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr>
                <th className={`${thClass} w-10`}></th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Remarks</th>
                <th className={thClass} style={{ width: '18%' }}>Updated By</th>
                <th className={thClass} style={{ width: '12%' }}>Status Date</th>
              </tr>
            </thead>
            <tbody>
              {statusHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500 bg-gray-50">
                    No status changes recorded
                  </td>
                </tr>
              ) : (
                statusHistory.map((history, index) => (
                  <tr
                    key={history.id || index}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/50 transition-colors`}
                  >
                    <td className="px-4 py-3">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="text-blue-600 hover:underline cursor-pointer capitalize">
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

        {/* Social Media Links Modal */}
        {showSocialMediaModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-3xl overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-blue-600">
                <h3 className="text-lg font-semibold text-white">CONTACT LINKS</h3>
                <button onClick={() => setShowSocialMediaModal(false)} className="p-1 hover:bg-blue-700 rounded text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-8">
                  {/* Left Column - Business Card */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">BUSINESS CARD</h4>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={socialMediaForm.business_card?.name || ''}
                        readOnly
                        className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded bg-gray-50"
                        placeholder=""
                      />
                      <label className="px-4 py-2 text-sm text-white bg-blue-500 rounded cursor-pointer hover:bg-blue-600 flex items-center gap-1 whitespace-nowrap">
                        <Upload className="w-4 h-4" />
                        Choose File
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,.pdf"
                          onChange={(e) => setSocialMediaForm({
                            ...socialMediaForm,
                            business_card: e.target.files?.[0] || null
                          })}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Right Column - Social Media Links */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">SOCIAL MEDIA LINKS</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <label className="w-20 text-sm text-blue-600">LinkedIn</label>
                        <input
                          type="url"
                          value={socialMediaForm.linkedin_url}
                          onChange={(e) => setSocialMediaForm({ ...socialMediaForm, linkedin_url: e.target.value })}
                          className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded"
                          placeholder="URL..."
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="w-20 text-sm text-blue-600">Facebook</label>
                        <input
                          type="url"
                          value={socialMediaForm.facebook_url}
                          onChange={(e) => setSocialMediaForm({ ...socialMediaForm, facebook_url: e.target.value })}
                          className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded"
                          placeholder="URL..."
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="w-20 text-sm text-blue-600">Twitter</label>
                        <input
                          type="url"
                          value={socialMediaForm.twitter_url}
                          onChange={(e) => setSocialMediaForm({ ...socialMediaForm, twitter_url: e.target.value })}
                          className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded"
                          placeholder="URL..."
                        />
                      </div>
                      <div className="flex items-start gap-3">
                        <label className="w-20 text-sm text-blue-600 pt-2">Notes</label>
                        <textarea
                          value={socialMediaForm.notes}
                          onChange={(e) => setSocialMediaForm({ ...socialMediaForm, notes: e.target.value })}
                          rows={4}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded resize-none"
                          placeholder=""
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-center px-4 py-4 border-t">
                <button
                  onClick={handleSaveSocialMediaLinks}
                  className="px-6 py-2 text-sm text-white bg-green-500 rounded hover:bg-green-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Activity Modal */}
        {showActivityModal && editingActivity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-[580px] overflow-hidden shadow-2xl">
              {/* Modal Header */}
              <div className="bg-blue-600 px-5 py-3 flex items-center justify-between">
                <h3 className="text-white font-semibold tracking-wide">
                  {editingActivity.id ? 'EDIT ACTIVITY' : 'NEW ACTIVITY'}
                </h3>
                <button onClick={() => setShowActivityModal(false)} className="text-white hover:text-gray-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="grid grid-cols-2 gap-x-5 gap-y-3">
                  {/* Left Column */}
                  <div className="space-y-3">
                    {/* Contact */}
                    <div>
                      <label className="block text-xs font-medium text-blue-600 mb-1">Contact</label>
                      <select
                        value={editingActivity.contact_id || ''}
                        onChange={(e) => {
                          const selectedContact = contacts.find(c => c.id === parseInt(e.target.value));
                          setEditingActivity({
                            ...editingActivity,
                            contact_id: e.target.value ? parseInt(e.target.value) : undefined,
                            contact_name: selectedContact ? `${selectedContact.first_name} ${selectedContact.last_name || ''}`.trim() : '',
                            contact_email: selectedContact?.email || ''
                          });
                        }}
                        className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Select Contact</option>
                        {contacts.map(contact => (
                          <option key={contact.id} value={contact.id}>
                            {`${contact.first_name} ${contact.last_name || ''}`.trim()}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-medium text-blue-600 mb-1">Email</label>
                      <input
                        type="email"
                        value={editingActivity.contact_email || ''}
                        onChange={(e) => setEditingActivity({ ...editingActivity, contact_email: e.target.value })}
                        className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="email@example.com"
                      />
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-xs font-medium text-blue-600 mb-1">Priority</label>
                      <select
                        value={editingActivity.priority || 'regular'}
                        onChange={(e) => setEditingActivity({ ...editingActivity, priority: e.target.value })}
                        className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      >
                        {activityPriorityOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Start Date / Time */}
                    <div>
                      <label className="block text-xs font-medium text-blue-600 mb-1">Start Date / Time</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="date"
                            value={editingActivity.activity_date?.split('T')[0] || ''}
                            onChange={(e) => setEditingActivity({ ...editingActivity, activity_date: e.target.value })}
                            className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div className="relative flex-1">
                          <input
                            type="time"
                            value={editingActivity.start_time || ''}
                            onChange={(e) => setEditingActivity({ ...editingActivity, start_time: e.target.value })}
                            className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* End Date / Time */}
                    <div>
                      <label className="block text-xs font-medium text-blue-600 mb-1">End Date / Time</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="date"
                            value={editingActivity.end_date?.split('T')[0] || ''}
                            onChange={(e) => setEditingActivity({ ...editingActivity, end_date: e.target.value })}
                            className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div className="relative flex-1">
                          <input
                            type="time"
                            value={editingActivity.end_time || ''}
                            onChange={(e) => setEditingActivity({ ...editingActivity, end_time: e.target.value })}
                            className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-3">
                    {/* Subject */}
                    <div>
                      <label className="block text-xs font-medium text-blue-600 mb-1">Subject</label>
                      <input
                        type="text"
                        value={editingActivity.subject}
                        onChange={(e) => setEditingActivity({ ...editingActivity, subject: e.target.value })}
                        className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter subject"
                      />
                    </div>

                    {/* Activity Type */}
                    <div>
                      <label className="block text-xs font-medium text-blue-600 mb-1">Activity Type</label>
                      <select
                        value={editingActivity.activity_type}
                        onChange={(e) => setEditingActivity({ ...editingActivity, activity_type: e.target.value })}
                        className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      >
                        {activityTypeOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Assigned To */}
                    <div>
                      <label className="block text-xs font-medium text-blue-600 mb-1">Assigned To</label>
                      <select
                        value={editingActivity.assigned_to || ''}
                        onChange={(e) => setEditingActivity({ ...editingActivity, assigned_to: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Select User</option>
                        {salesRepOptions.filter(opt => opt.value).map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-xs font-medium text-blue-600 mb-1">Status</label>
                      <select
                        value={editingActivity.status || 'in_progress'}
                        onChange={(e) => {
                          const status = e.target.value;
                          setEditingActivity({
                            ...editingActivity,
                            status,
                            is_completed: status === 'completed'
                          });
                        }}
                        className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      >
                        {activityStatusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Description - Full Width */}
                <div className="mt-4">
                  <label className="block text-xs font-medium text-blue-600 mb-1">Description</label>
                  <div className="border border-gray-300 rounded overflow-hidden">
                    {/* Rich Text Toolbar */}
                    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50 flex-wrap">
                      <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded font-bold text-sm">B</button>
                      <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded italic text-sm font-serif">I</button>
                      <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded underline text-sm">U</button>
                      <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded text-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/></svg>
                      </button>
                      <span className="w-px h-5 bg-gray-300 mx-1"></span>
                      <select className="h-7 text-xs border border-gray-300 rounded px-1 bg-white">
                        <option>Jost</option>
                        <option>Arial</option>
                        <option>Times</option>
                      </select>
                      <select className="h-7 w-14 text-xs border border-gray-300 rounded px-1 bg-white ml-1">
                        <option>14</option>
                        <option>12</option>
                        <option>16</option>
                        <option>18</option>
                      </select>
                      <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded ml-1 bg-yellow-200 font-bold text-sm">A</button>
                      <span className="w-px h-5 bg-gray-300 mx-1"></span>
                      <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                      </button>
                      <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                      </button>
                      <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                      </button>
                    </div>
                    <textarea
                      value={editingActivity.description || ''}
                      onChange={(e) => setEditingActivity({ ...editingActivity, description: e.target.value })}
                      className="w-full px-3 py-2 text-sm focus:outline-none resize-none border-0"
                      rows={5}
                      placeholder="Enter activity description..."
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-3 flex justify-center border-t border-gray-100">
                <button
                  onClick={handleSaveActivity}
                  className="px-6 py-1.5 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Memo Modal */}
        {showMemoModal && editingMemo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-xl overflow-hidden shadow-2xl">
              {/* Modal Header */}
              <div className="bg-blue-600 px-5 py-3 flex items-center justify-between">
                <h3 className="text-white font-semibold tracking-wide">MEMO DETAILS</h3>
                <button onClick={() => setShowMemoModal(false)} className="text-white hover:text-gray-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5">
                {/* Rich Text Editor */}
                <div className="border border-gray-300 rounded overflow-hidden">
                  {/* Toolbar */}
                  <div className="flex items-center gap-0.5 px-3 py-2 border-b border-gray-200 bg-white flex-wrap">
                    <button type="button" className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded font-bold text-base">B</button>
                    <button type="button" className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded italic text-base font-serif">I</button>
                    <button type="button" className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded underline text-base">U</button>
                    <button type="button" className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded text-base">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/></svg>
                    </button>
                    <span className="w-px h-6 bg-gray-300 mx-2"></span>
                    <select className="h-8 text-sm border border-gray-300 rounded px-2 bg-white">
                      <option>Jost</option>
                      <option>Arial</option>
                      <option>Times</option>
                    </select>
                    <select className="h-8 w-16 text-sm border border-gray-300 rounded px-2 bg-white ml-1">
                      <option>14</option>
                      <option>12</option>
                      <option>16</option>
                      <option>18</option>
                    </select>
                    <button type="button" className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded ml-1 bg-yellow-200 font-bold text-base border border-yellow-300">A</button>
                    <span className="w-px h-6 bg-gray-300 mx-2"></span>
                    <button type="button" className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                    </button>
                    <button type="button" className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                    </button>
                    <button type="button" className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                    </button>
                  </div>
                  {/* Text Area */}
                  <textarea
                    value={editingMemo.content}
                    onChange={(e) => setEditingMemo({ ...editingMemo, content: e.target.value, title: e.target.value.substring(0, 50) || 'Memo' })}
                    className="w-full px-4 py-3 text-sm focus:outline-none resize-none border-0 min-h-[250px]"
                    placeholder="Enter memo details..."
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-4 flex justify-center border-t border-gray-100">
                <button
                  onClick={handleSaveMemo}
                  className="px-8 py-2 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Document Upload Modal */}
        {showDocumentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md overflow-hidden shadow-2xl">
              {/* Modal Header */}
              <div className="bg-blue-600 px-5 py-3 flex items-center justify-between">
                <h3 className="text-white font-semibold tracking-wide">UPLOAD DOCUMENT</h3>
                <button onClick={() => setShowDocumentModal(false)} className="text-white hover:text-gray-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select File *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={documentFile?.name || ''}
                      readOnly
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50"
                      placeholder="No file selected"
                    />
                    <label className="px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded cursor-pointer transition-colors">
                      Browse
                      <input
                        type="file"
                        onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={documentNotes}
                    onChange={(e) => setDocumentNotes(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={3}
                    placeholder="Optional notes about this document..."
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-4 flex justify-center border-t border-gray-100">
                <button
                  onClick={handleUploadDocument}
                  disabled={!documentFile}
                  className="px-8 py-2 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Upload
                </button>
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
