'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { Building2, Users, Activity, UserCheck, FileText, Upload, CheckCircle, GitBranch, Plus, Edit, Trash2, Phone, Mail, Calendar, Clock } from 'lucide-react';
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
  { value: '', label: 'Select Lead Status' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
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
  { value: 'Asia/Kolkata', label: 'IST (Asia/Kolkata)' },
  { value: 'America/New_York', label: 'EST (America/New_York)' },
  { value: 'America/Los_Angeles', label: 'PST (America/Los_Angeles)' },
  { value: 'Europe/London', label: 'GMT (Europe/London)' },
  { value: 'Asia/Dubai', label: 'GST (Asia/Dubai)' },
];

const salesRepOptions = [
  { value: '', label: 'Select Sales Representative' },
  { value: '1', label: 'Admin User' },
];

const leadScoreOptions = [
  { value: '', label: 'Select Lead Score' },
  { value: 'hot', label: 'Hot' },
  { value: 'warm', label: 'Warm' },
  { value: 'cold', label: 'Cold' },
];

const countryOptions = [
  { value: '', label: 'Select Country' },
  { value: '1', label: 'India' },
  { value: '2', label: 'United States' },
  { value: '3', label: 'United Kingdom' },
  { value: '4', label: 'Canada' },
  { value: '5', label: 'Australia' },
];

const stateOptions = [
  { value: '', label: 'Nothing selected' },
  { value: '1', label: 'Maharashtra' },
  { value: '2', label: 'Karnataka' },
  { value: '3', label: 'Delhi' },
  { value: '4', label: 'Tamil Nadu' },
  { value: '5', label: 'Gujarat' },
];

const cityOptions = [
  { value: '', label: 'Nothing selected' },
  { value: '1', label: 'Mumbai' },
  { value: '2', label: 'Bangalore' },
  { value: '3', label: 'Delhi' },
  { value: '4', label: 'Chennai' },
  { value: '5', label: 'Ahmedabad' },
];

export default function EditPreLeadPage() {
  const router = useRouter();
  const params = useParams();
  const preLeadId = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>('company');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [preLeadData, setPreLeadData] = useState<PreLead | null>(null);
  const [memo, setMemo] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PreLeadForm>({
    resolver: zodResolver(preLeadSchema),
  });

  useEffect(() => {
    const fetchPreLead = async () => {
      try {
        const data = await api.getPreLead(parseInt(preLeadId));
        setPreLeadData(data);

        let fromTimings = '';
        let toTimings = '';
        if (data.office_timings) {
          const parts = data.office_timings.split(' - ');
          if (parts.length === 2) {
            fromTimings = parts[0];
            toTimings = parts[1];
          }
        }

        let leadSince = '';
        if (data.lead_since) {
          leadSince = new Date(data.lead_since).toISOString().split('T')[0];
        }

        reset({
          company_name: data.company_name || data.first_name || '',
          address_line1: data.address_line1 || '',
          address_line2: data.address_line2 || '',
          country_id: data.country_id?.toString() || '',
          state_id: data.state_id?.toString() || '',
          city_id: data.city_id?.toString() || '',
          zip_code: data.zip_code || '',
          phone_no: data.phone_no || '',
          fax: data.fax || '',
          website: data.website || '',
          nof_representative: data.nof_representative || '',
          phone: data.phone || '',
          email: data.email || '',
          lead_since: leadSince,
          lead_status: data.lead_status || '',
          group_id: data.group_id?.toString() || '',
          industry_id: data.industry_id?.toString() || '',
          region_id: data.region_id?.toString() || '',
          from_timings: fromTimings,
          to_timings: toTimings,
          timezone: data.timezone || '',
          sales_rep: data.sales_rep?.toString() || '',
          source: data.source || '',
          lead_score: data.lead_score || '',
          remarks: data.remarks || '',
        });
        setMemo(data.memo || '');
      } catch (err: any) {
        setError('Failed to load pre-lead data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (preLeadId) {
      fetchPreLead();
    }
  }, [preLeadId, reset]);

  const onSubmit = async (data: PreLeadForm) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const apiData = {
        ...data,
        first_name: data.company_name,
        memo: memo,
        country_id: data.country_id ? parseInt(data.country_id) : undefined,
        state_id: data.state_id ? parseInt(data.state_id) : undefined,
        city_id: data.city_id ? parseInt(data.city_id) : undefined,
        group_id: data.group_id ? parseInt(data.group_id) : undefined,
        industry_id: data.industry_id ? parseInt(data.industry_id) : undefined,
        region_id: data.region_id ? parseInt(data.region_id) : undefined,
        sales_rep: data.sales_rep ? parseInt(data.sales_rep) : undefined,
      };

      await api.updatePreLead(parseInt(preLeadId), apiData);
      setSuccess('Pre-lead updated successfully!');
      setTimeout(() => {
        router.push('/pre-leads');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update pre-lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full h-9 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500";
  const selectClass = "w-full h-9 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white";
  const labelClass = "w-40 text-sm font-medium flex-shrink-0";

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
    <div className="grid grid-cols-2 gap-x-16 gap-y-3">
      {/* Left Column */}
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <label className={`${labelClass} text-blue-600`}>Company Name</label>
          <input type="text" placeholder="Company Name" className={`${inputClass} flex-1`} {...register('company_name')} />
        </div>
        {errors.company_name && <p className="text-red-500 text-xs ml-44">{errors.company_name.message}</p>}

        <div className="flex items-center gap-4">
          <label className={`${labelClass} text-blue-600`}>Address</label>
          <input type="text" placeholder="Address" className={`${inputClass} flex-1`} {...register('address_line1')} />
        </div>

        <div className="flex items-center gap-4">
          <label className={labelClass}></label>
          <input type="text" placeholder="Address 2" className={`${inputClass} flex-1`} {...register('address_line2')} />
        </div>

        <div className="flex items-center gap-4">
          <label className={`${labelClass} text-blue-600`}>Country</label>
          <select className={`${selectClass} flex-1`} {...register('country_id')}>
            {countryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label className={`${labelClass} text-blue-600`}>State/Province</label>
          <select className={`${selectClass} flex-1`} {...register('state_id')}>
            {stateOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label className={`${labelClass} text-blue-600`}>City</label>
          <div className="flex gap-2 flex-1">
            <select className={`${selectClass} flex-1`} {...register('city_id')}>
              {cityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <button type="button" className="px-3 h-9 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-gray-600">+</button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className={`${labelClass} text-blue-600`}>Postal/Zip Code</label>
          <input type="text" placeholder="Postal/Zip Code" className={`${inputClass} flex-1`} {...register('zip_code')} />
        </div>

        <div className="flex items-center gap-4">
          <label className={`${labelClass} text-blue-600`}>Phone</label>
          <input type="text" placeholder="+(Country Code)(Area Code)(Phone)" className={`${inputClass} flex-1`} {...register('phone_no')} />
        </div>

        <div className="flex items-center gap-4">
          <label className={`${labelClass} text-blue-600`}>Fax</label>
          <input type="text" placeholder="+(Country Code)(Area Code)(Fax)" className={`${inputClass} flex-1`} {...register('fax')} />
        </div>

        <div className="flex items-center gap-4">
          <label className={`${labelClass} text-blue-600`}>Website</label>
          <input type="text" placeholder="Website" className={`${inputClass} flex-1`} {...register('website')} />
        </div>

        <div className="flex items-center gap-4">
          <label className={`${labelClass} text-blue-600`}>Name of Rep.</label>
          <input type="text" placeholder="Name of Rep." className={`${inputClass} flex-1`} {...register('nof_representative')} />
        </div>

        <div className="flex items-center gap-4">
          <label className={`${labelClass} text-blue-600`}>Contact Phone</label>
          <input type="text" placeholder="+(Country Code)(Area Code)(Contact Phone)" className={`${inputClass} flex-1`} {...register('phone')} />
        </div>

        <div className="flex items-center gap-4">
          <label className={`${labelClass} text-blue-600`}>Email ID</label>
          <input type="email" placeholder="Email ID" className={`${inputClass} flex-1`} {...register('email')} />
        </div>
        {errors.email && <p className="text-red-500 text-xs ml-44">{errors.email.message}</p>}
      </div>

      {/* Right Column */}
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <label className={`${labelClass} text-blue-600`}>Lead Registered</label>
          <input type="date" className={`${inputClass} flex-1`} {...register('lead_since')} />
        </div>

        <div className="flex items-center gap-4">
          <label className={`${labelClass} text-blue-600`}>Lead Status</label>
          <select className={`${selectClass} flex-1`} {...register('lead_status')}>
            {leadStatusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label className={`${labelClass} text-blue-600`}>Group</label>
          <div className="flex gap-2 flex-1">
            <select className={`${selectClass} flex-1`} {...register('group_id')}>
              {groupOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <button type="button" className="px-3 h-9 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-gray-600">+</button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className={`${labelClass} text-blue-600`}>Industry</label>
          <div className="flex gap-2 flex-1">
            <select className={`${selectClass} flex-1`} {...register('industry_id')}>
              {industryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <button type="button" className="px-3 h-9 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-gray-600">+</button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className={`${labelClass} text-blue-600`}>Company Region</label>
          <div className="flex gap-2 flex-1">
            <select className={`${selectClass} flex-1`} {...register('region_id')}>
              {regionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <button type="button" className="px-3 h-9 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-gray-600">+</button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className={`${labelClass} text-blue-600`}>Office Timing</label>
          <div className="flex gap-2 flex-1">
            <input type="time" className={`${inputClass} flex-1`} {...register('from_timings')} />
            <input type="time" className={`${inputClass} flex-1`} {...register('to_timings')} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className={`${labelClass} text-blue-600`}>Company Timezone</label>
          <select className={`${selectClass} flex-1`} {...register('timezone')}>
            {timezoneOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label className={`${labelClass} text-blue-600`}>Sales Representative</label>
          <select className={`${selectClass} flex-1`} {...register('sales_rep')}>
            {salesRepOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label className={`${labelClass} text-blue-600`}>Lead Source</label>
          <div className="flex gap-2 flex-1">
            <select className={`${selectClass} flex-1`} {...register('source')}>
              {sourceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <button type="button" className="px-3 h-9 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-gray-600">+</button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className={`${labelClass} text-blue-600`}>Lead Score</label>
          <select className={`${selectClass} flex-1`} {...register('lead_score')}>
            {leadScoreOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div className="flex items-start gap-4">
          <label className={`${labelClass} text-blue-600 pt-2`}>Remarks</label>
          <textarea placeholder="Remarks" rows={3} className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none" {...register('remarks')} />
        </div>
      </div>
    </div>
  );

  const renderContacts = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">Contact List</h3>
        <Button size="sm" className="flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add Contact
        </Button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">
                No contacts added yet. Click "Add Contact" to create one.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderActivities = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">Activity Log</h3>
        <Button size="sm" className="flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add Activity
        </Button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">
                No activities recorded yet. Click "Add Activity" to log one.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderQualifiedProfile = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-x-16 gap-y-4">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className={`${labelClass} text-blue-600`}>Expected Value</label>
            <input type="number" placeholder="Expected Value" className={`${inputClass} flex-1`} />
          </div>
          <div className="flex items-center gap-4">
            <label className={`${labelClass} text-blue-600`}>Currency</label>
            <select className={`${selectClass} flex-1`}>
              <option value="INR">INR - Indian Rupee</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <label className={`${labelClass} text-blue-600`}>Priority</label>
            <select className={`${selectClass} flex-1`}>
              <option value="">Select Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className={`${labelClass} text-blue-600`}>Product Interest</label>
            <input type="text" placeholder="Product Interest" className={`${inputClass} flex-1`} />
          </div>
          <div className="flex items-start gap-4">
            <label className={`${labelClass} text-blue-600 pt-2`}>Requirements</label>
            <textarea placeholder="Requirements" rows={4} className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" />
          </div>
        </div>
      </div>
      <div className="flex justify-center pt-4">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
          Validate & Convert to Lead
        </Button>
      </div>
    </div>
  );

  const renderMemo = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">Internal Memo</h3>
      </div>
      <textarea
        placeholder="Add internal notes and memos here..."
        rows={10}
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
      />
      <div className="flex justify-end">
        <Button size="sm" className="bg-green-500 hover:bg-green-600">Save Memo</Button>
      </div>
    </div>
  );

  const renderUpload = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">Uploaded Files</h3>
      </div>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
        <div className="text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-600 mb-2">Drag and drop files here, or click to select files</p>
          <p className="text-xs text-gray-400 mb-4">Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10MB)</p>
          <Button variant="secondary" size="sm">
            <Upload className="w-4 h-4 mr-2" /> Choose Files
          </Button>
        </div>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">
                No files uploaded yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStatus = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-8">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Current Status</h4>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              preLeadData?.status === 'new' ? 'bg-blue-100 text-blue-700' :
              preLeadData?.status === 'contacted' ? 'bg-yellow-100 text-yellow-700' :
              preLeadData?.status === 'validated' ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {preLeadData?.status?.toUpperCase() || 'NEW'}
            </span>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Change Status</h4>
          <select className={`${selectClass} w-full`}>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="validated">Validated</option>
            <option value="discarded">Discarded</option>
          </select>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Status Timeline</h4>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Created</p>
              <p className="text-xs text-gray-500">{preLeadData?.created_at ? new Date(preLeadData.created_at).toLocaleString() : '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWorkflow = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">Audit Trail</h3>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-600">
                {preLeadData?.created_at ? new Date(preLeadData.created_at).toLocaleString() : '-'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">System</td>
              <td className="px-4 py-3 text-sm">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Created</span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">Pre-lead record created</td>
            </tr>
            {preLeadData?.updated_at && preLeadData.updated_at !== preLeadData.created_at && (
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(preLeadData.updated_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">System</td>
                <td className="px-4 py-3 text-sm">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Updated</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">Pre-lead record updated</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <h1 className="text-lg font-semibold text-gray-800">EDIT PRE LEAD</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">ID: {preLeadId}</span>
            <button className="p-2 hover:bg-gray-100 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Tabs */}
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

          {/* Tab Content */}
          <div className="bg-white border border-gray-200 rounded-b p-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 text-green-600 p-3 rounded text-sm mb-4">
                {success}
              </div>
            )}

            {renderTabContent()}

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mt-6 pt-6 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/pre-leads')}
                className="px-8 py-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 rounded"
              >
                Update
              </Button>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
