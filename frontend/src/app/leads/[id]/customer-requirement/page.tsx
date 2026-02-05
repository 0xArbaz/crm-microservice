'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  Save, Plus, Trash2, Edit2, X, Upload, Download, Phone,
  Calendar, FileText, MessageSquare, Activity, Users, Settings,
  PlayCircle, ClipboardList, FileCheck, Database, Rocket, HeadphonesIcon,
  Building2, Mail, Globe, MapPin, Clock
} from 'lucide-react';
import api from '@/lib/api';

// Tab configuration with icons
const mainTabs = [
  { id: 'customer-details', label: 'Customer Details', icon: Building2 },
  { id: 'introduction', label: 'Introduction', icon: Mail },
  { id: 'requirement', label: 'Requirement', icon: ClipboardList },
  { id: 'presentation', label: 'Presentation', icon: PlayCircle },
  { id: 'demo', label: 'Demo', icon: PlayCircle },
  { id: 'proposal', label: 'Proposal', icon: FileText },
  { id: 'agreement', label: 'Agreement', icon: FileCheck },
  { id: 'initiation', label: 'Initiation', icon: Rocket },
  { id: 'planning', label: 'Planning', icon: Calendar },
  { id: 'configuration', label: 'Configuration', icon: Settings },
  { id: 'training', label: 'Training', icon: Users },
  { id: 'uat', label: 'UAT', icon: ClipboardList },
  { id: 'data-migration', label: 'Data Migration', icon: Database },
  { id: 'go-live', label: 'Go Live', icon: Rocket },
  { id: 'support', label: 'Support', icon: HeadphonesIcon },
  { id: 'call-logs', label: 'Call Logs', icon: Phone },
  { id: 'upload-file', label: 'Upload File', icon: Upload },
];

// Sub-tabs for each main tab

interface CustomerRequirement {
  id: number;
  lead_id: number;
  company_name?: string;
  address_line1?: string;
  address_line2?: string;
  country_id?: number;
  state_id?: number;
  city_id?: number;
  zip_code?: string;
  phone_no?: string;
  phone_ext?: string;
  fax?: string;
  website?: string;
  contact_name?: string;
  contact_title?: string;
  contact_phone?: string;
  contact_ext?: string;
  contact_email?: string;
  best_time_call?: string;
  mode?: string;
  branch_office?: string;
  no_of_employees?: number;
  instance_required?: string;
  ecommerce?: boolean;
  group_id?: number;
  industry_id?: number;
  region_id?: number;
  timezone_id?: number;
  sales_rep_id?: number;
  lead_source_id?: number;
  lead_from_id?: number;
  need_type?: string;
  budget?: string;
  time_frame?: string;
  current_it_infrastructure?: string;
  current_tab?: string;
  status?: string;
}

export default function CustomerRequirementPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('customer-details');

  // Data states
  const [cr, setCr] = useState<CustomerRequirement | null>(null);
  const [introduction, setIntroduction] = useState<any>(null);
  const [requirement, setRequirement] = useState<any>(null);
  const [presentations, setPresentations] = useState<any[]>([]);
  const [demos, setDemos] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [callLogs, setCallLogs] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);

  // Modal states
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [showCallLogModal, setShowCallLogModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState<any>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const crData = await api.getCustomerRequirementByLead(leadId);
      setCr(crData);
      setFormData(crData);

      // Load tab-specific data
      if (crData.id) {
        const [introData, reqData, presData, demoData, propData, agrData, logsData] = await Promise.all([
          api.getCRIntroduction(crData.id).catch(() => null),
          api.getCRRequirement(crData.id).catch(() => null),
          api.getCRPresentations(crData.id).catch(() => []),
          api.getCRDemos(crData.id).catch(() => []),
          api.getCRProposals(crData.id).catch(() => []),
          api.getCRAgreements(crData.id).catch(() => []),
          api.getCRCallLogs(crData.id).catch(() => []),
        ]);
        setIntroduction(introData);
        setRequirement(reqData);
        setPresentations(presData);
        setDemos(demoData);
        setProposals(propData);
        setAgreements(agrData);
        setCallLogs(logsData);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    if (leadId) {
      fetchData();
    }
  }, [leadId, fetchData]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleSaveCustomerDetails = async () => {
    if (!cr?.id) return;
    setSaving(true);
    try {
      const updated = await api.updateCustomerRequirement(cr.id, formData);
      setCr(updated);
      alert('Saved successfully');
    } catch (err) {
      console.error('Failed to save:', err);
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveIntroduction = async () => {
    if (!cr?.id) return;
    setSaving(true);
    try {
      const updated = await api.updateCRIntroduction(cr.id, introduction);
      setIntroduction(updated);
      alert('Saved successfully');
    } catch (err) {
      console.error('Failed to save:', err);
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRequirement = async () => {
    if (!cr?.id) return;
    setSaving(true);
    try {
      const updated = await api.updateCRRequirement(cr.id, requirement);
      setRequirement(updated);
      alert('Saved successfully');
    } catch (err) {
      console.error('Failed to save:', err);
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) {
      return;
    }
    if (!cr?.id) {
      alert('Please save the customer requirement first before uploading documents.');
      return;
    }
    const file = e.target.files[0];
    try {
      await api.uploadCRDocument(cr.id, file, activeTab, 'Details');
      const data = await api.getCRDocuments(cr.id, activeTab);
      setDocuments(data);
      alert('File uploaded successfully');
    } catch (err: any) {
      console.error('Failed to upload:', err);
      alert(err?.response?.data?.detail || 'Failed to upload file');
    }
    e.target.value = '';
  };

  const handleDeleteDocument = async (docId: number) => {
    if (!cr?.id || !confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.deleteCRDocument(cr.id, docId);
      setDocuments(documents.filter(d => d.id !== docId));
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('Failed to delete document');
    }
  };

  // Styles
  const inputClass = "w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500";
  const labelClass = "text-xs font-medium text-gray-700 mb-1";
  const mainTabClass = (tabId: string) => `
    px-3 py-2 text-xs font-medium rounded-t border-b-2 transition-colors whitespace-nowrap
    ${activeTab === tabId
      ? 'bg-blue-600 text-white border-blue-600'
      : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200'}
  `;
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-blue-600">
            CUSTOMER REQUIREMENT - {cr?.company_name || 'New'}
          </h1>
          <button
            onClick={() => router.back()}
            className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
          >
            Back to Leads
          </button>
        </div>

        {/* Main Tabs */}
        <div className="flex flex-wrap gap-1 pb-2 border-b border-gray-200 overflow-x-auto">
          {mainTabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={mainTabClass(tab.id)}
              >
                <span className="flex items-center gap-1">
                  <IconComponent className="w-3.5 h-3.5" />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow p-4">
          {/* Customer Details Tab */}
          {activeTab === 'customer-details' && (
            <CustomerDetailsForm
              formData={formData}
              setFormData={setFormData}
              onSave={handleSaveCustomerDetails}
              saving={saving}
              inputClass={inputClass}
              labelClass={labelClass}
            />
          )}

          {/* Introduction Tab */}
          {activeTab === 'introduction' && (
            <IntroductionForm
              data={introduction}
              setData={setIntroduction}
              onSave={handleSaveIntroduction}
              saving={saving}
              inputClass={inputClass}
              labelClass={labelClass}
              crId={cr?.id}
            />
          )}

          {/* Requirement Tab */}
          {activeTab === 'requirement' && (
            <RequirementForm
              data={requirement}
              setData={setRequirement}
              onSave={handleSaveRequirement}
              saving={saving}
              inputClass={inputClass}
              labelClass={labelClass}
              crId={cr?.id}
              leadId={leadId}
            />
          )}

          {/* Presentation Tab */}
          {activeTab === 'presentation' && (
            <PresentationForm
              data={formData}
              setData={setFormData}
              crId={cr?.id}
              leadId={leadId}
              presentations={presentations}
              refreshData={fetchData}
            />
          )}

          {/* Demo Tab */}
          {activeTab === 'demo' && (
            <DemoList
              demos={demos}
              onAdd={() => { setEditingItem(null); setShowDemoModal(true); }}
              onEdit={(item: any) => { setEditingItem(item); setShowDemoModal(true); }}
              crId={cr?.id}
              refreshData={fetchData}
            />
          )}

          {/* Proposal Tab */}
          {activeTab === 'proposal' && (
            <ProposalList
              proposals={proposals}
              onAdd={() => { setEditingItem(null); setShowProposalModal(true); }}
              onEdit={(item: any) => { setEditingItem(item); setShowProposalModal(true); }}
              crId={cr?.id}
              refreshData={fetchData}
            />
          )}

          {/* Agreement Tab */}
          {activeTab === 'agreement' && (
            <AgreementList
              agreements={agreements}
              onAdd={() => { setEditingItem(null); setShowAgreementModal(true); }}
              onEdit={(item: any) => { setEditingItem(item); setShowAgreementModal(true); }}
              crId={cr?.id}
              refreshData={fetchData}
            />
          )}

          {/* Call Logs Tab */}
          {activeTab === 'call-logs' && (
            <CallLogsList
              callLogs={callLogs}
              onAdd={() => { setEditingItem(null); setShowCallLogModal(true); }}
              onEdit={(item: any) => { setEditingItem(item); setShowCallLogModal(true); }}
              crId={cr?.id}
              refreshData={fetchData}
            />
          )}

          {/* Generic Details for other tabs */}
          {['initiation', 'planning', 'configuration', 'training', 'uat', 'data-migration', 'go-live', 'support'].includes(activeTab) && (
            <GenericTabDetails tabName={activeTab} />
          )}

          {/* Upload File Tab */}
          {activeTab === 'upload-file' && (
            <DocumentsSection
              documents={documents}
              onUpload={handleFileUpload}
              onDelete={handleDeleteDocument}
            />
          )}
        </div>
      </div>

      {/* Demo Modal */}
      {showDemoModal && cr?.id && (
        <DemoModal
          isOpen={showDemoModal}
          onClose={() => { setShowDemoModal(false); setEditingItem(null); }}
          crId={cr.id}
          editingItem={editingItem}
          refreshData={fetchData}
        />
      )}

      {/* Proposal Modal */}
      {showProposalModal && cr?.id && (
        <ProposalModal
          isOpen={showProposalModal}
          onClose={() => { setShowProposalModal(false); setEditingItem(null); }}
          crId={cr.id}
          editingItem={editingItem}
          refreshData={fetchData}
        />
      )}

      {/* Agreement Modal */}
      {showAgreementModal && cr?.id && (
        <AgreementModal
          isOpen={showAgreementModal}
          onClose={() => { setShowAgreementModal(false); setEditingItem(null); }}
          crId={cr.id}
          editingItem={editingItem}
          refreshData={fetchData}
        />
      )}

      {/* Call Log Modal */}
      {showCallLogModal && cr?.id && (
        <CallLogModal
          isOpen={showCallLogModal}
          onClose={() => { setShowCallLogModal(false); setEditingItem(null); }}
          crId={cr.id}
          editingItem={editingItem}
          refreshData={fetchData}
        />
      )}
    </MainLayout>
  );
}

// ============== Customer Details Form ==============
function CustomerDetailsForm({ formData, setFormData, onSave, saving, inputClass, labelClass }: any) {
  const [profileSubTab, setProfileSubTab] = useState('company-profile');

  const fieldLabelClass = "text-xs font-medium text-blue-600 w-36 flex-shrink-0";
  const fieldInputClass = "flex-1 h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50";
  const fieldSelectClass = "flex-1 h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white";
  const rowClass = "flex items-center gap-2 mb-3";

  return (
    <div className="space-y-6">
      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-1">
          <div className={rowClass}>
            <label className={fieldLabelClass}>Company Name</label>
            <input type="text" value={formData.company_name || ''} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} className={fieldInputClass} />
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Company Address</label>
            <input type="text" value={formData.address_line1 || ''} onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })} className={fieldInputClass} placeholder="Street road" />
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}></label>
            <input type="text" value={formData.address_line2 || ''} onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })} className={fieldInputClass} placeholder="Street road" />
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Country</label>
            <select value={formData.country_id || ''} onChange={(e) => setFormData({ ...formData, country_id: parseInt(e.target.value) || null })} className={fieldSelectClass}>
              <option value="">Select Country</option>
              <option value="1">United Arab Emirates</option>
              <option value="2">India</option>
              <option value="3">United States</option>
              <option value="4">United Kingdom</option>
              <option value="5">Pakistan</option>
            </select>
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>State/Province</label>
            <select value={formData.state_id || ''} onChange={(e) => setFormData({ ...formData, state_id: parseInt(e.target.value) || null })} className={fieldSelectClass}>
              <option value="">Select State</option>
              <option value="1">Dubai</option>
              <option value="2">Abu Dhabi</option>
              <option value="3">Maharashtra</option>
            </select>
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>City</label>
            <div className="flex-1 flex gap-1">
              <select value={formData.city_id || ''} onChange={(e) => setFormData({ ...formData, city_id: parseInt(e.target.value) || null })} className="flex-1 h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
                <option value="">Select City</option>
                <option value="1">Hub</option>
                <option value="2">Dubai</option>
                <option value="3">Mumbai</option>
              </select>
              <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Postal/Zip Code</label>
            <input type="text" value={formData.zip_code || ''} onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })} className={fieldInputClass} />
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Phone</label>
            <input type="text" value={formData.phone_no || ''} onChange={(e) => setFormData({ ...formData, phone_no: e.target.value })} className="flex-1 h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50" />
            <span className="text-xs text-gray-500">Ext.</span>
            <input type="text" value={formData.phone_ext || ''} onChange={(e) => setFormData({ ...formData, phone_ext: e.target.value })} className="w-16 h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50" />
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Fax</label>
            <input type="text" value={formData.fax || ''} onChange={(e) => setFormData({ ...formData, fax: e.target.value })} className={fieldInputClass} />
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Website</label>
            <input type="text" value={formData.website || ''} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className={fieldInputClass} placeholder="Website" />
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Contact Name</label>
            <input type="text" value={formData.contact_name || ''} onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })} className={fieldInputClass} />
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Contact Job Title</label>
            <input type="text" value={formData.contact_title || ''} onChange={(e) => setFormData({ ...formData, contact_title: e.target.value })} className={fieldInputClass} placeholder="Contact Job Title" />
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Contact Phone</label>
            <input type="text" value={formData.contact_phone || ''} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} className="flex-1 h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50" />
            <span className="text-xs text-gray-500">Ext.</span>
            <input type="text" value={formData.contact_ext || ''} onChange={(e) => setFormData({ ...formData, contact_ext: e.target.value })} className="w-16 h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50" />
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Email</label>
            <input type="email" value={formData.contact_email || ''} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} className={fieldInputClass} placeholder="Email" />
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Best Time(Call)</label>
            <input type="time" value={formData.best_time_call || ''} onChange={(e) => setFormData({ ...formData, best_time_call: e.target.value })} className={fieldInputClass} />
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Mode</label>
            <input type="text" value={formData.mode || ''} onChange={(e) => setFormData({ ...formData, mode: e.target.value })} className={fieldInputClass} placeholder="Mode" />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-1">
          <div className={rowClass}>
            <label className={fieldLabelClass}>Branch Office</label>
            <input type="text" value={formData.branch_office || ''} onChange={(e) => setFormData({ ...formData, branch_office: e.target.value })} className={fieldInputClass} placeholder="Branch Office" />
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Number Of Employees</label>
            <select value={formData.no_of_employees || ''} onChange={(e) => setFormData({ ...formData, no_of_employees: parseInt(e.target.value) || null })} className={fieldSelectClass}>
              <option value="">Select the Employee</option>
              <option value="10">1-10</option>
              <option value="50">11-50</option>
              <option value="100">51-100</option>
              <option value="500">101-500</option>
              <option value="1000">500+</option>
            </select>
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Instance Required</label>
            <select value={formData.instance_required || ''} onChange={(e) => setFormData({ ...formData, instance_required: e.target.value })} className={fieldSelectClass}>
              <option value="">Select Instance</option>
              <option value="Impex">Impex</option>
              <option value="Single">Single</option>
              <option value="Multi">Multi</option>
            </select>
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>E-Commerce</label>
            <select value={formData.ecommerce ? 'yes' : 'no'} onChange={(e) => setFormData({ ...formData, ecommerce: e.target.value === 'yes' })} className={fieldSelectClass}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Group</label>
            <select value={formData.group_id || ''} onChange={(e) => setFormData({ ...formData, group_id: parseInt(e.target.value) || null })} className={fieldSelectClass}>
              <option value="">Select Group</option>
              <option value="1">Group A</option>
              <option value="2">Group B</option>
            </select>
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Industry</label>
            <select value={formData.industry_id || ''} onChange={(e) => setFormData({ ...formData, industry_id: parseInt(e.target.value) || null })} className={fieldSelectClass}>
              <option value="">Select Industry</option>
              <option value="1">Technology</option>
              <option value="2">Manufacturing</option>
              <option value="3">Retail</option>
              <option value="4">Healthcare</option>
            </select>
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Company Region</label>
            <select value={formData.region_id || ''} onChange={(e) => setFormData({ ...formData, region_id: parseInt(e.target.value) || null })} className={fieldSelectClass}>
              <option value="">Select Region</option>
              <option value="1">Middle East</option>
              <option value="2">Asia</option>
              <option value="3">Europe</option>
              <option value="4">North America</option>
            </select>
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Office Timing</label>
            <input type="time" value={formData.office_timing_from || ''} onChange={(e) => setFormData({ ...formData, office_timing_from: e.target.value })} className="flex-1 h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50" />
            <input type="time" value={formData.office_timing_to || ''} onChange={(e) => setFormData({ ...formData, office_timing_to: e.target.value })} className="flex-1 h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50" />
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>TimeZone</label>
            <select value={formData.timezone_id || ''} onChange={(e) => setFormData({ ...formData, timezone_id: parseInt(e.target.value) || null })} className={fieldSelectClass}>
              <option value="">Select Timezone</option>
              <option value="1">Asia/Dubai (+04:00)</option>
              <option value="2">Asia/Kolkata (+05:30)</option>
              <option value="3">America/New_York (-05:00)</option>
            </select>
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Sales Rep</label>
            <select value={formData.sales_rep_id || ''} onChange={(e) => setFormData({ ...formData, sales_rep_id: parseInt(e.target.value) || null })} className={fieldSelectClass}>
              <option value="">Select Rep.</option>
              <option value="1">Junaid Ali</option>
              <option value="2">Admin User</option>
            </select>
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Lead Source</label>
            <select value={formData.lead_source_id || ''} onChange={(e) => setFormData({ ...formData, lead_source_id: parseInt(e.target.value) || null })} className={fieldSelectClass}>
              <option value="">Select Lead Source</option>
              <option value="1">Website</option>
              <option value="2">Referral</option>
              <option value="3">Social Media</option>
            </select>
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Lead From</label>
            <select value={formData.lead_from_id || ''} onChange={(e) => setFormData({ ...formData, lead_from_id: parseInt(e.target.value) || null })} className={fieldSelectClass}>
              <option value="">Select Lead From</option>
              <option value="1">Direct</option>
              <option value="2">Partner</option>
            </select>
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Lead From (Name)</label>
            <input type="text" value={formData.lead_from_name || ''} onChange={(e) => setFormData({ ...formData, lead_from_name: e.target.value })} className={fieldInputClass} placeholder="Lead From" />
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Lead Status</label>
            <input type="text" value={formData.lead_status || 'Validated Lead'} onChange={(e) => setFormData({ ...formData, lead_status: e.target.value })} className={fieldInputClass} readOnly />
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Lead Score</label>
            <select value={formData.lead_score || ''} onChange={(e) => setFormData({ ...formData, lead_score: e.target.value })} className={fieldSelectClass}>
              <option value="">Select Lead Score</option>
              <option value="hot">Hot</option>
              <option value="warm">Warm</option>
              <option value="cold">Cold</option>
            </select>
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Remarks</label>
            <textarea value={formData.remarks || ''} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} className="flex-1 h-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50" />
          </div>
        </div>
      </div>

      {/* Additional Information Section */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-bold text-blue-600 mb-4">ADDITIONAL INFORMATION</h3>
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-1">
            <div className={rowClass}>
              <label className={fieldLabelClass}>Need Type</label>
              <select value={formData.need_type || ''} onChange={(e) => setFormData({ ...formData, need_type: e.target.value })} className={fieldSelectClass}>
                <option value="">Select Need Type</option>
                <option value="new">New Implementation</option>
                <option value="upgrade">Upgrade</option>
                <option value="migration">Migration</option>
                <option value="support">Support</option>
              </select>
            </div>
            <div className={rowClass}>
              <label className={fieldLabelClass}>Current Software</label>
              <input type="text" value={formData.current_software || ''} onChange={(e) => setFormData({ ...formData, current_software: e.target.value })} className={fieldInputClass} placeholder="Current Software" />
            </div>
            <div className={rowClass}>
              <label className={fieldLabelClass}>Need Summary</label>
              <textarea value={formData.need_summary || ''} onChange={(e) => setFormData({ ...formData, need_summary: e.target.value })} className="flex-1 h-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50" placeholder="Summary" />
            </div>
          </div>
          {/* Right Column */}
          <div className="space-y-1">
            <div className={rowClass}>
              <label className={fieldLabelClass}>Budget</label>
              <select value={formData.budget || ''} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} className={fieldSelectClass}>
                <option value="">Select Budget</option>
                <option value="<10k">Less than $10,000</option>
                <option value="10k-50k">$10,000 - $50,000</option>
                <option value="50k-100k">$50,000 - $100,000</option>
                <option value=">100k">More than $100,000</option>
              </select>
            </div>
            <div className={rowClass}>
              <label className={fieldLabelClass}>Decision Maker</label>
              <select value={formData.decision_maker || ''} onChange={(e) => setFormData({ ...formData, decision_maker: e.target.value })} className={fieldSelectClass}>
                <option value="">Select Decision Maker</option>
                <option value="1">Arbaz Alam</option>
                <option value="2">Contact Person</option>
              </select>
            </div>
            <div className={rowClass}>
              <label className={fieldLabelClass}>Time Frame</label>
              <select value={formData.time_frame || ''} onChange={(e) => setFormData({ ...formData, time_frame: e.target.value })} className={fieldSelectClass}>
                <option value="">Select Time Frame</option>
                <option value="immediate">Immediate</option>
                <option value="1-3months">1-3 Months</option>
                <option value="3-6months">3-6 Months</option>
                <option value="6-12months">6-12 Months</option>
              </select>
            </div>
            <div className={rowClass}>
              <label className={fieldLabelClass}>Qualified By</label>
              <select value={formData.qualified_by || ''} onChange={(e) => setFormData({ ...formData, qualified_by: e.target.value })} className={fieldSelectClass}>
                <option value="">Select Qualified By</option>
                <option value="1">Junaid Ali</option>
                <option value="2">Admin User</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <button onClick={onSave} disabled={saving} className="px-6 py-1.5 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Company Profile Section with Sub-tabs */}
      <div className="border-t pt-4">
        <div className="flex gap-1 mb-4">
          <button onClick={() => setProfileSubTab('company-profile')} className={`px-4 py-1.5 text-xs font-medium rounded ${profileSubTab === 'company-profile' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
            Company Profile
          </button>
          <button onClick={() => setProfileSubTab('summary')} className={`px-4 py-1.5 text-xs font-medium rounded ${profileSubTab === 'summary' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
            Summary
          </button>
          <button onClick={() => setProfileSubTab('conclusion')} className={`px-4 py-1.5 text-xs font-medium rounded ${profileSubTab === 'conclusion' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
            Conclusion
          </button>
        </div>

        {profileSubTab === 'company-profile' && (
          <div>
            <h4 className="text-sm font-bold text-blue-600 mb-3">COMPANY PROFILE</h4>
            <textarea
              value={formData.company_profile || ''}
              onChange={(e) => setFormData({ ...formData, company_profile: e.target.value })}
              className="w-full h-48 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter company profile..."
            />
          </div>
        )}

        {profileSubTab === 'summary' && (
          <div>
            <h4 className="text-sm font-bold text-blue-600 mb-3">SUMMARY</h4>
            <textarea
              value={formData.summary || ''}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full h-48 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter summary..."
            />
          </div>
        )}

        {profileSubTab === 'conclusion' && (
          <div>
            <h4 className="text-sm font-bold text-blue-600 mb-3">CONCLUSION</h4>
            <textarea
              value={formData.conclusion || ''}
              onChange={(e) => setFormData({ ...formData, conclusion: e.target.value })}
              className="w-full h-48 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter conclusion..."
            />
          </div>
        )}

        <div className="flex justify-center mt-4">
          <button onClick={onSave} disabled={saving} className="px-6 py-1.5 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============== Introduction Form ==============
function IntroductionForm({ data, setData, onSave, saving, inputClass, labelClass, crId, onDocumentUpload }: any) {
  const [introSubTab, setIntroSubTab] = useState('activity');
  const [activitySubTab, setActivitySubTab] = useState('all');
  const [emailsSent, setEmailsSent] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [followUpActivities, setFollowUpActivities] = useState<any[]>([]);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<any>(null);
  const [followUpFormData, setFollowUpFormData] = useState({
    activity_type: '',
    subject: '',
    start_date: new Date().toISOString().split('T')[0],
    start_time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    end_date: new Date().toISOString().split('T')[0],
    end_time: '',
    description: '',
    status: 'Open',
    contact_id: '',
    assigned_to: '',
    priority: '',
  });
  const [introMemos, setIntroMemos] = useState<any[]>([]);
  const [showIntroMemoModal, setShowIntroMemoModal] = useState(false);
  const [editingMemo, setEditingMemo] = useState<any>(null);
  const [memoFormData, setMemoFormData] = useState({ content: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [subTabDocs, setSubTabDocs] = useState<any[]>([]);
  const [subTabFile, setSubTabFile] = useState<File | null>(null);
  const [subTabNotes, setSubTabNotes] = useState('');
  const [subTabUploading, setSubTabUploading] = useState(false);
  const subTabFileRef = React.useRef<HTMLInputElement>(null);

  // Load documents when crId is available
  useEffect(() => {
    if (crId) {
      api.getCRDocuments(crId, 'introduction').then(setDocuments).catch(() => setDocuments([]));
    }
  }, [crId]);

  // Load follow-up activities when sub-tab changes
  useEffect(() => {
    if (crId && introSubTab === 'follow-up') {
      api.getCRActivities(crId, 'introduction-followup').then(setFollowUpActivities).catch(() => setFollowUpActivities([]));
    }
  }, [crId, introSubTab]);

  // Load memos when sub-tab changes
  useEffect(() => {
    if (crId && introSubTab === 'memo') {
      api.getCRMemos(crId, 'introduction').then(setIntroMemos).catch(() => setIntroMemos([]));
    }
  }, [crId, introSubTab]);

  // Load upload-file sub-tab documents
  useEffect(() => {
    if (crId && introSubTab === 'upload-file') {
      api.getCRDocuments(crId, 'introduction-upload').then(setSubTabDocs).catch(() => setSubTabDocs([]));
    }
  }, [crId, introSubTab]);

  const handleSubTabChooseFile = () => {
    subTabFileRef.current?.click();
  };

  const handleSubTabFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setSubTabFile(e.target.files[0]);
    }
  };

  const handleSubTabUpload = async () => {
    if (!subTabFile) {
      alert('Please choose a file first');
      return;
    }
    if (!crId) {
      alert('Please save the customer requirement first');
      return;
    }
    setSubTabUploading(true);
    try {
      await api.uploadCRDocument(crId, subTabFile, 'introduction-upload', 'Upload File');
      const docs = await api.getCRDocuments(crId, 'introduction-upload');
      setSubTabDocs(docs);
      setSubTabFile(null);
      setSubTabNotes('');
      if (subTabFileRef.current) subTabFileRef.current.value = '';
    } catch (err: any) {
      console.error('Upload failed:', err);
      alert(err?.response?.data?.detail || 'Failed to upload file');
    } finally {
      setSubTabUploading(false);
    }
  };

  const handleSubTabDeleteDoc = async (docId: number) => {
    if (!crId) return;
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.deleteCRDocument(crId, docId);
      setSubTabDocs(subTabDocs.filter((d: any) => d.id !== docId));
    } catch (err: any) {
      console.error('Delete failed:', err);
      alert(err?.response?.data?.detail || 'Failed to delete document');
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) {
      alert('Please choose a file first');
      return;
    }
    if (!crId) {
      alert('Please save the customer requirement first');
      return;
    }
    setUploading(true);
    try {
      await api.uploadCRDocument(crId, selectedFile, 'introduction', 'Details');
      const docs = await api.getCRDocuments(crId, 'introduction');
      setDocuments(docs);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      alert('File uploaded successfully');
    } catch (err: any) {
      console.error('Upload failed:', err);
      alert(err?.response?.data?.detail || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityFormData, setActivityFormData] = useState({
    created_by: '',
    action_to_be_taken: '',
    start_date: '',
    start_time: '',
    description: '',
    source: '',
    type: '',
    contact: ''
  });

  const handleSaveActivity = () => {
    const newActivity = {
      ...activityFormData,
      by: activityFormData.created_by || 'Current User',
      date: activityFormData.start_date,
      time: activityFormData.start_time,
    };
    setActivities([...activities, newActivity]);
    setShowActivityModal(false);
    setActivityFormData({
      created_by: '',
      action_to_be_taken: '',
      start_date: '',
      start_time: '',
      description: '',
      source: '',
      type: '',
      contact: ''
    });
  };

  const handleDeleteDocument = async (docId: number) => {
    if (!crId) return;
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.deleteCRDocument(crId, docId);
      setDocuments(documents.filter((d: any) => d.id !== docId));
    } catch (err: any) {
      console.error('Delete failed:', err);
      alert(err?.response?.data?.detail || 'Failed to delete document');
    }
  };

  const handleOpenFollowUpModal = (item?: any) => {
    if (item) {
      setEditingFollowUp(item);
      setFollowUpFormData({
        activity_type: item.activity_type || '',
        subject: item.subject || '',
        start_date: item.start_date || '',
        start_time: item.start_time || '',
        end_date: item.end_date || '',
        end_time: item.end_time || '',
        description: item.description || '',
        status: item.status || 'Open',
        contact_id: item.contact_id?.toString() || '',
        assigned_to: item.assigned_to?.toString() || '',
        priority: item.priority || '',
      });
    } else {
      setEditingFollowUp(null);
      const now = new Date();
      setFollowUpFormData({
        activity_type: '',
        subject: '',
        start_date: now.toISOString().split('T')[0],
        start_time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        end_date: now.toISOString().split('T')[0],
        end_time: '',
        description: '',
        status: 'Open',
        contact_id: '',
        assigned_to: '',
        priority: '',
      });
    }
    setShowFollowUpModal(true);
  };

  const handleSaveFollowUp = async () => {
    if (!crId) return;
    try {
      if (editingFollowUp) {
        const updated = await api.updateCRActivity(crId, editingFollowUp.id, followUpFormData);
        setFollowUpActivities(followUpActivities.map((a: any) => a.id === editingFollowUp.id ? updated : a));
      } else {
        const created = await api.createCRActivity(crId, {
          ...followUpFormData,
          tab_name: 'introduction-followup',
        });
        setFollowUpActivities([...followUpActivities, created]);
      }
      setShowFollowUpModal(false);
      setEditingFollowUp(null);
    } catch (err: any) {
      console.error('Save follow-up failed:', err);
      alert(err?.response?.data?.detail || 'Failed to save follow-up');
    }
  };

  const handleDeleteFollowUp = async (id: number) => {
    if (!crId) return;
    if (!confirm('Are you sure you want to delete this follow-up?')) return;
    try {
      await api.deleteCRActivity(crId, id);
      setFollowUpActivities(followUpActivities.filter((a: any) => a.id !== id));
    } catch (err: any) {
      console.error('Delete follow-up failed:', err);
      alert(err?.response?.data?.detail || 'Failed to delete follow-up');
    }
  };

  const handleOpenMemoModal = (item?: any) => {
    if (item) {
      setEditingMemo(item);
      setMemoFormData({ content: item.content || '' });
    } else {
      setEditingMemo(null);
      setMemoFormData({ content: '' });
    }
    setShowIntroMemoModal(true);
  };

  const handleSaveMemo = async () => {
    if (!crId) return;
    try {
      if (editingMemo) {
        const updated = await api.updateCRMemo(crId, editingMemo.id, memoFormData);
        setIntroMemos(introMemos.map((m: any) => m.id === editingMemo.id ? updated : m));
      } else {
        const created = await api.createCRMemo(crId, {
          ...memoFormData,
          tab_name: 'introduction',
        });
        setIntroMemos([...introMemos, created]);
      }
      setShowIntroMemoModal(false);
      setEditingMemo(null);
    } catch (err: any) {
      console.error('Save memo failed:', err);
      alert(err?.response?.data?.detail || 'Failed to save memo');
    }
  };

  const handleDeleteMemo = async (id: number) => {
    if (!crId) return;
    if (!confirm('Are you sure you want to delete this memo?')) return;
    try {
      await api.deleteCRMemo(crId, id);
      setIntroMemos(introMemos.filter((m: any) => m.id !== id));
    } catch (err: any) {
      console.error('Delete memo failed:', err);
      alert(err?.response?.data?.detail || 'Failed to delete memo');
    }
  };

  const fieldLabelClass = "text-xs font-medium text-blue-600 w-32 flex-shrink-0";
  const fieldInputClass = "flex-1 h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50";
  const fieldSelectClass = "flex-1 h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50";
  const rowClass = "flex items-center gap-2 mb-2";
  const thClass = "px-3 py-2 text-left text-xs font-medium text-white bg-blue-600 border-r border-blue-500 last:border-r-0";
  const tdClass = "px-3 py-2 text-xs border-b border-gray-200";

  return (
    <div className="space-y-4">
      {/* Top Form Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-1">
          <div className={rowClass}>
            <label className={fieldLabelClass}>Company Name</label>
            <input type="text" value={data?.company_name || ''} onChange={(e) => setData({ ...data, company_name: e.target.value })} className={fieldInputClass} />
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Contact Name</label>
            <select value={data?.contact_id || ''} onChange={(e) => setData({ ...data, contact_id: e.target.value })} className={fieldSelectClass}>
              <option value="">Select Contact Name</option>
              <option value="1">Contact 1</option>
              <option value="2">Contact 2</option>
            </select>
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Email Format / Type</label>
            <select value={data?.email_format || ''} onChange={(e) => setData({ ...data, email_format: e.target.value })} className="flex-1 h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50">
              <option value="">Introductory Email to Customer (Oil and Gas)</option>
              <option value="intro">Introductory Email</option>
              <option value="followup">Follow-up Email</option>
              <option value="proposal">Proposal Email</option>
            </select>
            <button className="h-8 px-3 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1">
              <Mail className="w-4 h-4" />
            </button>
          </div>

          {/* Email Sent To Table */}
          <div className="mt-3 border rounded overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-600">
                  <th className={thClass}>Email Sent To</th>
                  <th className={thClass}>Attachments</th>
                  <th className={thClass}>Sent On</th>
                  <th className={thClass}>Action</th>
                </tr>
              </thead>
              <tbody>
                {emailsSent.length === 0 ? (
                  <tr><td colSpan={4} className="px-3 py-4 text-center text-gray-400 text-xs">No emails sent</td></tr>
                ) : (
                  emailsSent.map((email: any, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className={tdClass}>{email.to}</td>
                      <td className={tdClass}>{email.attachments || '-'}</td>
                      <td className={tdClass}>{email.sent_on}</td>
                      <td className={tdClass}>
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-3 h-3" /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-1">
          <div className={rowClass}>
            <label className={fieldLabelClass}>Branch Office</label>
            <input type="text" value={data?.branch_office || ''} onChange={(e) => setData({ ...data, branch_office: e.target.value })} className={fieldInputClass} placeholder="Branch Office" />
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Contact Email</label>
            <input type="email" value={data?.contact_email || ''} onChange={(e) => setData({ ...data, contact_email: e.target.value })} className={fieldInputClass} />
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Document</label>
            <input type="text" className={fieldInputClass} readOnly value={selectedFile?.name || ''} placeholder="No file chosen" />
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={handleChooseFile}
              className="h-8 px-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs flex items-center gap-1"
            >
              <Upload className="w-3 h-3" /> Choose File
            </button>
            <button
              type="button"
              onClick={handleUploadFile}
              disabled={!selectedFile || uploading}
              className="h-8 px-3 border border-gray-300 rounded hover:bg-gray-50 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>

          {/* Documents Table */}
          <div className="mt-3 border rounded overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-600">
                  <th className={thClass}>File Name</th>
                  <th className={thClass}>Link</th>
                  <th className={thClass}>Size</th>
                  <th className={thClass}>Upload On</th>
                  <th className={thClass}>Action</th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr><td colSpan={5} className="px-3 py-4 text-center text-gray-400 text-xs">No documents uploaded</td></tr>
                ) : (
                  documents.map((doc: any, index: number) => (
                    <tr key={doc.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className={`${tdClass} text-blue-600`}>{doc.file_name}</td>
                      <td className={`${tdClass} text-blue-600`}>
                        {doc.file_path ? (
                          <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/${doc.file_path}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            View
                          </a>
                        ) : '-'}
                      </td>
                      <td className={tdClass}>{doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : '-'}</td>
                      <td className={tdClass}>{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : '-'}</td>
                      <td className={tdClass}>
                        <div className="flex gap-1 justify-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-3 h-3" />
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
      </div>

      {/* Sub-tabs Section */}
      <div className="border-t pt-4">
        <div className="flex gap-4 mb-4">
          {['Activity', 'Follow-Up', 'Memo', 'Upload File', 'Workflow & Audit Trail'].map((tab) => {
            const tabKey = tab.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
            const isActive = introSubTab === tabKey;
            return (
              <button
                key={tab}
                onClick={() => setIntroSubTab(tabKey)}
                className={`px-2 py-1 text-xs font-medium border-b-2 ${
                  isActive
                    ? 'border-blue-600 text-blue-600 bg-blue-50 rounded-t'
                    : 'border-transparent text-orange-500 hover:text-orange-600'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Activity Section */}
        {introSubTab === 'activity' && (
          <div className="space-y-3">
            {/* Activity Sub-tabs */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setActivitySubTab('all')}
                  className={`px-3 py-1 text-xs font-medium rounded ${
                    activitySubTab === 'all' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  All Activity
                </button>
                <button
                  onClick={() => setActivitySubTab('followup')}
                  className={`px-3 py-1 text-xs font-medium rounded ${
                    activitySubTab === 'followup' ? 'bg-blue-600 text-white' : 'text-orange-500'
                  }`}
                >
                  Activity Follow-Up
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowActivityModal(true)} className="px-3 py-1 text-xs border rounded hover:bg-gray-50">Add New Activity</button>
                <button className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">CSV</button>
                <button className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">EXCEL</button>
                <button className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">PDF</button>
              </div>
            </div>

            {/* Activity Table */}
            <div className="border rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-600">
                    <th className={thClass}>By</th>
                    <th className={thClass}>Date</th>
                    <th className={thClass}>Time</th>
                    <th className={thClass}>Source</th>
                    <th className={thClass}>Type</th>
                    <th className={thClass}>Description</th>
                    <th className={thClass}>Action to be Taken</th>
                    <th className={thClass}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.length === 0 ? (
                    <tr><td colSpan={8} className="px-3 py-8 text-center text-gray-400 text-xs">No activities found</td></tr>
                  ) : (
                    activities.map((activity: any, index: number) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className={tdClass}>{activity.by}</td>
                        <td className={`${tdClass} text-blue-600`}>{activity.date}</td>
                        <td className={`${tdClass} text-blue-600`}>{activity.time}</td>
                        <td className={`${tdClass} text-blue-600`}>{activity.source}</td>
                        <td className={tdClass}>{activity.type}</td>
                        <td className={`${tdClass} text-blue-600`}>{activity.description}</td>
                        <td className={tdClass}>{activity.action_to_be_taken || '-'}</td>
                        <td className={tdClass}>
                          <button className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">Follow-Up</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Follow-Up Section */}
        {introSubTab === 'follow-up' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleOpenFollowUpModal()}
                className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
              >
                Add New Activity
              </button>
            </div>

            <div className="border rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-600">
                    <th className={thClass}>Activity Type</th>
                    <th className={thClass}>Activity Subject</th>
                    <th className={thClass}>Date & Time</th>
                    <th className={thClass}>Next Follow-up Date</th>
                    <th className={thClass}>Channel Type</th>
                    <th className={thClass}>Assigned To</th>
                    <th className={thClass}>Sent To</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {followUpActivities.length === 0 ? (
                    <tr><td colSpan={9} className="px-3 py-8 text-center text-gray-400 text-xs">No follow-up activities found</td></tr>
                  ) : (
                    followUpActivities.map((item: any, index: number) => (
                      <tr key={item.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className={`${tdClass} text-red-500`}>{item.activity_type || '-'}</td>
                        <td className={tdClass}>{item.subject || '-'}</td>
                        <td className={tdClass}>
                          {item.start_date ? `${new Date(item.start_date).toLocaleDateString()}, ${item.start_time || ''}` : '-'}
                        </td>
                        <td className={tdClass}>
                          {item.end_date ? `${new Date(item.end_date).toLocaleDateString()} ; ${item.end_time || ''}` : '-'}
                        </td>
                        <td className={tdClass}>{item.description || '-'}</td>
                        <td className={tdClass}>{item.assigned_to || '-'}</td>
                        <td className={tdClass}>{item.contact_id || '-'}</td>
                        <td className={tdClass}>
                          <span className={item.status === 'Closed' ? 'text-red-600' : 'text-green-600'}>
                            {item.status || 'Open'}
                          </span>
                        </td>
                        <td className={tdClass}>
                          <button
                            type="button"
                            onClick={() => handleOpenFollowUpModal(item)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded border border-gray-300"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Memo Section */}
        {introSubTab === 'memo' && (
          <div className="space-y-3">
            <div>
              <button
                onClick={() => handleOpenMemoModal()}
                className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
              >
                Add Memo
              </button>
            </div>

            <div className="border rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-600">
                    <th className={thClass}>Date</th>
                    <th className={thClass}>Added By</th>
                    <th className={thClass}>Details</th>
                    <th className={thClass}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {introMemos.length === 0 ? (
                    <tr><td colSpan={4} className="px-3 py-8 text-center text-gray-400 text-xs">No memos found</td></tr>
                  ) : (
                    introMemos.map((memo: any, index: number) => (
                      <tr key={memo.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className={tdClass}>
                          {memo.created_at ? new Date(memo.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td className={tdClass}>{memo.title || '-'}</td>
                        <td className={`${tdClass} text-blue-600`}>{memo.content || '-'}</td>
                        <td className={tdClass}>
                          <div className="flex gap-1 justify-center">
                            <button
                              type="button"
                              onClick={() => handleOpenMemoModal(memo)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded border border-gray-300"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMemo(memo.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded border border-gray-300"
                            >
                              <Trash2 className="w-3 h-3" />
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
        )}

        {/* Upload File Section */}
        {introSubTab === 'upload-file' && (
          <div className="space-y-4">
            {/* Document & Notes Fields */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 justify-center">
                <label className="text-xs font-semibold text-orange-500 w-20 text-right">Document</label>
                <input
                  type="text"
                  className="h-8 w-64 px-2 text-sm border border-gray-300 rounded bg-gray-50"
                  readOnly
                  value={subTabFile?.name || ''}
                  placeholder=""
                />
                <input
                  ref={subTabFileRef}
                  type="file"
                  onChange={handleSubTabFileChange}
                  className="hidden"
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={handleSubTabChooseFile}
                  className="h-8 px-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" /> Choose File
                </button>
                <button
                  type="button"
                  onClick={handleSubTabUpload}
                  disabled={!subTabFile || subTabUploading}
                  className="h-8 px-4 border border-gray-300 rounded hover:bg-gray-50 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {subTabUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <label className="text-xs font-semibold text-orange-500 w-20 text-right">Notes</label>
                <input
                  type="text"
                  value={subTabNotes}
                  onChange={(e) => setSubTabNotes(e.target.value)}
                  className="h-8 w-64 px-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <div className="w-[186px]"></div>
              </div>
            </div>

            {/* Documents Table */}
            <div className="border rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-600">
                    <th className={thClass}>File Name</th>
                    <th className={thClass}>Uploaded On</th>
                    <th className={thClass}>Size</th>
                    <th className={thClass}>Notes</th>
                    <th className={thClass}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {subTabDocs.length === 0 ? (
                    <tr><td colSpan={5} className="px-3 py-8 text-center text-gray-400 text-xs">No files uploaded</td></tr>
                  ) : (
                    subTabDocs.map((doc: any, index: number) => (
                      <tr key={doc.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className={`${tdClass} text-blue-600`}>{doc.file_name || '-'}</td>
                        <td className={tdClass}>{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : '-'}</td>
                        <td className={tdClass}>{doc.file_size ? `${(doc.file_size / 1024).toFixed(2)} Kb` : '-'}</td>
                        <td className={tdClass}>{doc.description || '-'}</td>
                        <td className={tdClass}>
                          <div className="flex gap-1 justify-center">
                            <button
                              type="button"
                              onClick={() => handleSubTabDeleteDoc(doc.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded border border-gray-300"
                            >
                              <Trash2 className="w-3 h-3" />
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
        )}

        {/* Workflow & Audit Trail Section */}
        {introSubTab === 'workflow-audit-trail' && (
          <div className="text-center py-8 text-gray-500 text-sm">Workflow & Audit Trail content</div>
        )}
      </div>

      {/* Add Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded shadow-xl w-[650px] max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-blue-600 text-white">
              <h3 className="font-semibold text-sm uppercase tracking-wide">ADD ACTIVITY</h3>
              <button onClick={() => setShowActivityModal(false)} className="hover:bg-blue-700 rounded p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {/* Row 1 */}
                <div>
                  <label className="text-xs font-medium text-blue-600 mb-1 block">Created By</label>
                  <select
                    value={activityFormData.created_by}
                    onChange={(e) => setActivityFormData({ ...activityFormData, created_by: e.target.value })}
                    className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select User</option>
                    <option value="Junaid Ali">Junaid Ali</option>
                    <option value="Hamza Manzoor">Hamza Manzoor</option>
                    <option value="Admin User">Admin User</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-blue-600 mb-1 block">Source</label>
                  <select
                    value={activityFormData.source}
                    onChange={(e) => setActivityFormData({ ...activityFormData, source: e.target.value })}
                    className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select Source Type</option>
                    <option value="Email">Email</option>
                    <option value="Phone">Phone</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Website">Website</option>
                  </select>
                </div>

                {/* Row 2 */}
                <div>
                  <label className="text-xs font-medium text-blue-600 mb-1 block">Action to be Taken</label>
                  <input
                    type="text"
                    value={activityFormData.action_to_be_taken}
                    onChange={(e) => setActivityFormData({ ...activityFormData, action_to_be_taken: e.target.value })}
                    className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-blue-600 mb-1 block">Type</label>
                  <select
                    value={activityFormData.type}
                    onChange={(e) => setActivityFormData({ ...activityFormData, type: e.target.value })}
                    className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select Type</option>
                    <option value="Send">Send</option>
                    <option value="Receive">Receive</option>
                    <option value="Call">Call</option>
                    <option value="Visit">Visit</option>
                  </select>
                </div>

                {/* Row 3 */}
                <div>
                  <label className="text-xs font-medium text-blue-600 mb-1 block">Start Date / Time</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={activityFormData.start_date}
                      onChange={(e) => setActivityFormData({ ...activityFormData, start_date: e.target.value })}
                      className="flex-1 h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                    <input
                      type="time"
                      value={activityFormData.start_time}
                      onChange={(e) => setActivityFormData({ ...activityFormData, start_time: e.target.value })}
                      className="flex-1 h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-blue-600 mb-1 block">Contact</label>
                  <select
                    value={activityFormData.contact}
                    onChange={(e) => setActivityFormData({ ...activityFormData, contact: e.target.value })}
                    className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select Contact</option>
                    <option value="Contact 1">Contact 1</option>
                    <option value="Contact 2">Contact 2</option>
                    <option value="Contact 3">Contact 3</option>
                  </select>
                </div>

                {/* Description - Full Width */}
                <div className="col-span-2 mt-2">
                  <label className="text-xs font-medium text-blue-600 mb-1 block">Description</label>
                  {/* Rich Text Editor Toolbar */}
                  <div className="border border-gray-300 rounded-t flex items-center gap-1 px-2 py-1.5 bg-white">
                    <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded font-bold text-sm">B</button>
                    <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded italic text-sm font-serif">I</button>
                    <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded underline text-sm">U</button>
                    <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded text-sm">
                      <span className="text-yellow-500">✎</span>
                    </button>
                    <div className="h-5 w-px bg-gray-300 mx-1"></div>
                    <select className="h-7 px-2 text-xs border border-gray-300 rounded bg-white">
                      <option>jost</option>
                      <option>Arial</option>
                      <option>Times New Roman</option>
                    </select>
                    <select className="h-7 w-14 px-1 text-xs border border-gray-300 rounded bg-white">
                      <option>14</option>
                      <option>12</option>
                      <option>16</option>
                      <option>18</option>
                    </select>
                    <div className="h-5 w-px bg-gray-300 mx-1"></div>
                    <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded text-sm">
                      <span className="bg-yellow-300 px-1 font-bold">A</span>
                    </button>
                    <div className="h-5 w-px bg-gray-300 mx-1"></div>
                    <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded text-sm">☰</button>
                    <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded text-sm">☷</button>
                    <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded text-sm">≡</button>
                  </div>
                  <textarea
                    value={activityFormData.description}
                    onChange={(e) => setActivityFormData({ ...activityFormData, description: e.target.value })}
                    className="w-full h-48 px-3 py-2 text-sm border border-gray-300 border-t-0 rounded-b focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none bg-white"
                    placeholder=""
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-center mt-5">
                <button
                  onClick={handleSaveActivity}
                  className="px-8 py-2 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Follow-Up Modal */}
      {showFollowUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded shadow-xl w-[680px] max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-blue-600 text-white">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-sm uppercase tracking-wide">NEW ACTIVITY</h3>
                <button
                  type="button"
                  onClick={() => setIntroSubTab('activity')}
                  className="px-3 py-1 text-xs font-medium border border-white rounded hover:bg-blue-700"
                >
                  View Previous Activities
                </button>
              </div>
              <button onClick={() => setShowFollowUpModal(false)} className="hover:bg-blue-700 rounded p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 bg-gray-50">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {/* Row 1: Contact / Activity Subject */}
                <div>
                  <label className="text-xs font-semibold text-blue-600 mb-1 block">Contact</label>
                  <select
                    value={followUpFormData.contact_id}
                    onChange={(e) => setFollowUpFormData({ ...followUpFormData, contact_id: e.target.value })}
                    className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select Contact</option>
                    <option value="1">Contact 1</option>
                    <option value="2">Contact 2</option>
                    <option value="3">Contact 3</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-blue-600 mb-1 block">Activity Subject</label>
                  <input
                    type="text"
                    value={followUpFormData.subject}
                    onChange={(e) => setFollowUpFormData({ ...followUpFormData, subject: e.target.value })}
                    className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>

                {/* Row 2: Email / Activity Type */}
                <div>
                  <label className="text-xs font-semibold text-blue-600 mb-1 block">Email</label>
                  <input
                    type="text"
                    value={followUpFormData.priority}
                    onChange={(e) => setFollowUpFormData({ ...followUpFormData, priority: e.target.value })}
                    className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-blue-600 mb-1 block">Activity Type</label>
                  <input
                    type="text"
                    value={followUpFormData.activity_type}
                    onChange={(e) => setFollowUpFormData({ ...followUpFormData, activity_type: e.target.value })}
                    className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>

                {/* Row 3: Start Date / Time / Assigned To */}
                <div>
                  <label className="text-xs font-semibold text-blue-600 mb-1 block">Start Date / Time</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={followUpFormData.start_date}
                      onChange={(e) => setFollowUpFormData({ ...followUpFormData, start_date: e.target.value })}
                      className="flex-1 h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                    <input
                      type="time"
                      value={followUpFormData.start_time}
                      onChange={(e) => setFollowUpFormData({ ...followUpFormData, start_time: e.target.value })}
                      className="flex-1 h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-blue-600 mb-1 block">Assigned To</label>
                  <select
                    value={followUpFormData.assigned_to}
                    onChange={(e) => setFollowUpFormData({ ...followUpFormData, assigned_to: e.target.value })}
                    className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select User</option>
                    <option value="1">Junaid Ali</option>
                    <option value="2">Hamza Manzoor</option>
                    <option value="3">Admin User</option>
                  </select>
                </div>

                {/* Row 4: Next Follow Up Date / Status */}
                <div>
                  <label className="text-xs font-semibold text-blue-600 mb-1 block">Next Follow Up Date</label>
                  <input
                    type="date"
                    value={followUpFormData.end_date}
                    onChange={(e) => setFollowUpFormData({ ...followUpFormData, end_date: e.target.value })}
                    className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-blue-600 mb-1 block">Status</label>
                  <select
                    value={followUpFormData.status}
                    onChange={(e) => setFollowUpFormData({ ...followUpFormData, status: e.target.value })}
                    className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                {/* Description - Full Width */}
                <div className="col-span-2 mt-1">
                  <label className="text-xs font-semibold text-blue-600 mb-1 block">Description</label>
                  <div className="border border-gray-300 rounded overflow-hidden">
                    {/* Rich Text Editor Toolbar */}
                    <div className="flex items-center gap-1 px-2 py-1.5 bg-white border-b border-gray-300">
                      <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded font-bold text-sm">B</button>
                      <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded italic text-sm font-serif">I</button>
                      <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded underline text-sm">U</button>
                      <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded text-sm">
                        <span className="text-yellow-500">&#9998;</span>
                      </button>
                      <div className="h-5 w-px bg-gray-300 mx-1"></div>
                      <select className="h-7 px-1 text-xs border border-gray-300 rounded bg-white">
                        <option>jost</option>
                        <option>Arial</option>
                        <option>Times New Roman</option>
                      </select>
                      <select className="h-7 w-14 px-1 text-xs border border-gray-300 rounded bg-white">
                        <option>14</option>
                        <option>12</option>
                        <option>16</option>
                        <option>18</option>
                      </select>
                      <div className="h-5 w-px bg-gray-300 mx-1"></div>
                      <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded text-sm font-bold">
                        <span className="bg-yellow-300 px-1 rounded">A</span>
                      </button>
                      <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded text-sm">&#9776;</button>
                      <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded text-sm">&#9776;</button>
                      <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded text-sm">&#9776;</button>
                    </div>
                    {/* Text Area */}
                    <textarea
                      value={followUpFormData.description}
                      onChange={(e) => setFollowUpFormData({ ...followUpFormData, description: e.target.value })}
                      className="w-full px-3 py-2 text-sm focus:outline-none bg-white resize-y"
                      rows={8}
                      placeholder=""
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-center mt-5">
                <button
                  onClick={handleSaveFollowUp}
                  className="px-8 py-2 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Memo Modal */}
      {showIntroMemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded shadow-xl w-[500px] max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between px-4 py-2.5 bg-blue-600 text-white">
              <h3 className="font-semibold text-sm uppercase tracking-wide">MEMO DETAILS</h3>
              <button onClick={() => setShowIntroMemoModal(false)} className="text-yellow-300 hover:text-yellow-100 rounded p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 bg-gray-50">
              <div className="border border-gray-300 rounded overflow-hidden">
                <div className="flex items-center gap-1 px-2 py-1.5 bg-white border-b border-gray-300">
                  <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded font-bold text-sm">B</button>
                  <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded italic text-sm font-serif">I</button>
                  <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded underline text-sm">U</button>
                  <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded text-sm">
                    <span className="text-yellow-500">&#9998;</span>
                  </button>
                  <div className="h-5 w-px bg-gray-300 mx-1"></div>
                  <select className="h-7 px-1 text-xs border border-gray-300 rounded bg-white">
                    <option>jost</option>
                    <option>Arial</option>
                    <option>Times New Roman</option>
                  </select>
                  <select className="h-7 w-14 px-1 text-xs border border-gray-300 rounded bg-white">
                    <option>14</option>
                    <option>12</option>
                    <option>16</option>
                    <option>18</option>
                  </select>
                  <div className="h-5 w-px bg-gray-300 mx-1"></div>
                  <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded text-sm font-bold">
                    <span className="bg-yellow-300 px-1 rounded">A</span>
                  </button>
                  <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded text-sm">&#9776;</button>
                  <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded text-sm">&#9776;</button>
                  <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded text-sm">&#9776;</button>
                </div>
                <textarea
                  value={memoFormData.content}
                  onChange={(e) => setMemoFormData({ ...memoFormData, content: e.target.value })}
                  className="w-full px-3 py-2 text-sm focus:outline-none bg-white resize-y"
                  rows={10}
                />
              </div>
              <div className="flex justify-center mt-5">
                <button
                  onClick={handleSaveMemo}
                  className="px-8 py-2 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============== Requirement Form ==============
function RequirementForm({ data, setData, onSave, saving, inputClass, labelClass, crId, leadId }: any) {
  const [reqSubTab, setReqSubTab] = useState('pre-demo-business-questionnaire');
  const [emailsSent, setEmailsSent] = useState<any[]>([]);
  const [reqDocs, setReqDocs] = useState<any[]>([]);
  const [reqSelectedFile, setReqSelectedFile] = useState<File | null>(null);
  const [reqUploading, setReqUploading] = useState(false);
  const reqFileInputRef = React.useRef<HTMLInputElement>(null);

  // Sub-tab states
  const [reqSubTabDocs, setReqSubTabDocs] = useState<any[]>([]);
  const [reqSubTabFile, setReqSubTabFile] = useState<File | null>(null);
  const [reqSubTabNotes, setReqSubTabNotes] = useState('');
  const [reqSubTabUploading, setReqSubTabUploading] = useState(false);
  const reqSubTabFileRef = React.useRef<HTMLInputElement>(null);
  const [reqFollowUps, setReqFollowUps] = useState<any[]>([]);
  const [showReqFollowUpModal, setShowReqFollowUpModal] = useState(false);
  const [editingReqFollowUp, setEditingReqFollowUp] = useState<any>(null);
  const [reqFollowUpForm, setReqFollowUpForm] = useState({
    activity_type: '', subject: '', start_date: '', start_time: '', end_date: '', end_time: '', description: '', status: 'Open', contact_id: '', assigned_to: '', priority: '', next_followup_date: '', next_followup_time: '', channel_type: '', sent_to: '',
  });
  const [reqMemos, setReqMemos] = useState<any[]>([]);
  const [showReqMemoModal, setShowReqMemoModal] = useState(false);
  const [editingReqMemo, setEditingReqMemo] = useState<any>(null);
  const [reqMemoForm, setReqMemoForm] = useState({ content: '' });
  const reqMemoEditorRef = React.useRef<HTMLDivElement>(null);
  const reqFollowUpEditorRef = React.useRef<HTMLDivElement>(null);
  const [reqActivities, setReqActivities] = useState<any[]>([]);
  const [reqContacts, setReqContacts] = useState<any[]>([]);
  const [showReqPreviousActivities, setShowReqPreviousActivities] = useState(false);

  // Questionnaire state
  const [questionnaire, setQuestionnaire] = useState<any>(data?.questionnaire || {});

  useEffect(() => {
    if (data?.questionnaire) setQuestionnaire(data.questionnaire);
  }, [data?.questionnaire]);

  const updateQ = (field: string, value: any) => {
    const updated = { ...questionnaire, [field]: value };
    setQuestionnaire(updated);
    setData({ ...data, questionnaire: updated });
  };

  const toggleCheckbox = (field: string, value: string) => {
    const arr = questionnaire[field] || [];
    const updated = arr.includes(value) ? arr.filter((v: string) => v !== value) : [...arr, value];
    updateQ(field, updated);
  };

  // Load contacts
  useEffect(() => {
    if (leadId) {
      api.getLeadContactsForEdit(leadId).then(setReqContacts).catch(() => setReqContacts([]));
    }
  }, [leadId]);

  // Load documents
  useEffect(() => {
    if (crId) {
      api.getCRDocuments(crId, 'requirement').then(setReqDocs).catch(() => setReqDocs([]));
    }
  }, [crId]);

  // Load sub-tab data
  useEffect(() => {
    if (crId && reqSubTab === 'follow-up') {
      api.getCRActivities(crId, 'requirement-followup').then(setReqFollowUps).catch(() => setReqFollowUps([]));
    }
  }, [crId, reqSubTab]);

  useEffect(() => {
    if (crId && reqSubTab === 'memo') {
      api.getCRMemos(crId, 'requirement').then(setReqMemos).catch(() => setReqMemos([]));
    }
  }, [crId, reqSubTab]);

  useEffect(() => {
    if (crId && reqSubTab === 'upload-file') {
      api.getCRDocuments(crId, 'requirement-upload').then(setReqSubTabDocs).catch(() => setReqSubTabDocs([]));
    }
  }, [crId, reqSubTab]);

  // Document handlers
  const handleReqChooseFile = () => reqFileInputRef.current?.click();
  const handleReqFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.length) setReqSelectedFile(e.target.files[0]); };
  const handleReqUploadFile = async () => {
    if (!reqSelectedFile || !crId) { alert(!reqSelectedFile ? 'Please choose a file first' : 'Please save the customer requirement first'); return; }
    setReqUploading(true);
    try {
      await api.uploadCRDocument(crId, reqSelectedFile, 'requirement', 'Details');
      const docs = await api.getCRDocuments(crId, 'requirement');
      setReqDocs(docs);
      setReqSelectedFile(null);
      if (reqFileInputRef.current) reqFileInputRef.current.value = '';
    } catch (err: any) { alert(err?.response?.data?.detail || 'Failed to upload file'); } finally { setReqUploading(false); }
  };
  const handleReqDeleteDoc = async (docId: number) => {
    if (!crId || !confirm('Are you sure you want to delete this document?')) return;
    try { await api.deleteCRDocument(crId, docId); setReqDocs(reqDocs.filter((d: any) => d.id !== docId)); } catch { alert('Failed to delete document'); }
  };

  // Sub-tab upload handlers
  const handleReqSubTabChooseFile = () => reqSubTabFileRef.current?.click();
  const handleReqSubTabFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.length) setReqSubTabFile(e.target.files[0]); };
  const handleReqSubTabUpload = async () => {
    if (!reqSubTabFile || !crId) { alert(!reqSubTabFile ? 'Please choose a file first' : 'Please save the customer requirement first'); return; }
    setReqSubTabUploading(true);
    try {
      await api.uploadCRDocument(crId, reqSubTabFile, 'requirement-upload', 'Upload File');
      const docs = await api.getCRDocuments(crId, 'requirement-upload');
      setReqSubTabDocs(docs);
      setReqSubTabFile(null); setReqSubTabNotes('');
      if (reqSubTabFileRef.current) reqSubTabFileRef.current.value = '';
    } catch (err: any) { alert(err?.response?.data?.detail || 'Failed to upload file'); } finally { setReqSubTabUploading(false); }
  };
  const handleReqSubTabDeleteDoc = async (docId: number) => {
    if (!crId || !confirm('Are you sure you want to delete this document?')) return;
    try { await api.deleteCRDocument(crId, docId); setReqSubTabDocs(reqSubTabDocs.filter((d: any) => d.id !== docId)); } catch { alert('Failed to delete document'); }
  };

  // Follow-up handlers
  const handleOpenReqFollowUp = (item?: any) => {
    if (item) { setEditingReqFollowUp(item); setReqFollowUpForm({ activity_type: item.activity_type || '', subject: item.subject || '', start_date: item.start_date || '', start_time: item.start_time || '', end_date: item.end_date || '', end_time: item.end_time || '', description: item.description || '', status: item.status || 'Open', contact_id: item.contact_id?.toString() || '', assigned_to: item.assigned_to?.toString() || '', priority: item.priority || '', next_followup_date: item.next_followup_date || '', next_followup_time: item.next_followup_time || '', channel_type: item.channel_type || '', sent_to: item.sent_to || '' }); }
    else { setEditingReqFollowUp(null); const now = new Date(); setReqFollowUpForm({ activity_type: '', subject: '', start_date: now.toISOString().split('T')[0], start_time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }), end_date: now.toISOString().split('T')[0], end_time: '', description: '', status: 'Open', contact_id: '', assigned_to: '', priority: '', next_followup_date: now.toISOString().split('T')[0], next_followup_time: '', channel_type: '', sent_to: '' }); }
    setShowReqFollowUpModal(true);
    setTimeout(() => {
      if (reqFollowUpEditorRef.current) {
        reqFollowUpEditorRef.current.innerHTML = item?.description || '';
      }
    }, 50);
  };
  const handleReqFollowUpExec = (command: string, value?: string) => {
    document.execCommand(command, false, value || '');
    reqFollowUpEditorRef.current?.focus();
  };
  const handleSaveReqFollowUp = async () => {
    if (!crId) return;
    const descriptionContent = reqFollowUpEditorRef.current?.innerHTML || reqFollowUpForm.description;
    const formToSave = { ...reqFollowUpForm, description: descriptionContent };
    try {
      if (editingReqFollowUp) { const updated = await api.updateCRActivity(crId, editingReqFollowUp.id, formToSave); setReqFollowUps(reqFollowUps.map((a: any) => a.id === editingReqFollowUp.id ? updated : a)); }
      else { const created = await api.createCRActivity(crId, { ...formToSave, tab_name: 'requirement-followup' }); setReqFollowUps([...reqFollowUps, created]); }
      setShowReqFollowUpModal(false); setEditingReqFollowUp(null);
    } catch (err: any) { alert(err?.response?.data?.detail || 'Failed to save follow-up'); }
  };
  const handleDeleteReqFollowUp = async (id: number) => {
    if (!crId || !confirm('Are you sure?')) return;
    try { await api.deleteCRActivity(crId, id); setReqFollowUps(reqFollowUps.filter((a: any) => a.id !== id)); } catch { alert('Failed to delete'); }
  };

  // Memo handlers
  const handleOpenReqMemo = (item?: any) => {
    if (item) { setEditingReqMemo(item); setReqMemoForm({ content: item.content || '' }); }
    else { setEditingReqMemo(null); setReqMemoForm({ content: '' }); }
    setShowReqMemoModal(true);
    setTimeout(() => {
      if (reqMemoEditorRef.current) {
        reqMemoEditorRef.current.innerHTML = item?.content || '';
      }
    }, 50);
  };
  const handleReqMemoExec = (command: string, value?: string) => {
    document.execCommand(command, false, value || '');
    reqMemoEditorRef.current?.focus();
  };
  const handleSaveReqMemo = async () => {
    if (!crId) return;
    const content = reqMemoEditorRef.current?.innerHTML || reqMemoForm.content;
    const payload = { content };
    try {
      if (editingReqMemo) { const updated = await api.updateCRMemo(crId, editingReqMemo.id, payload); setReqMemos(reqMemos.map((m: any) => m.id === editingReqMemo.id ? updated : m)); }
      else { const created = await api.createCRMemo(crId, { ...payload, tab_name: 'requirement' }); setReqMemos([...reqMemos, created]); }
      setShowReqMemoModal(false); setEditingReqMemo(null);
    } catch (err: any) { alert(err?.response?.data?.detail || 'Failed to save memo'); }
  };
  const handleDeleteReqMemo = async (id: number) => {
    if (!crId || !confirm('Are you sure?')) return;
    try { await api.deleteCRMemo(crId, id); setReqMemos(reqMemos.filter((m: any) => m.id !== id)); } catch { alert('Failed to delete'); }
  };

  const fieldLabelClass = "text-xs font-medium text-blue-600 w-32 flex-shrink-0";
  const fieldInputClass = "flex-1 h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50";
  const fieldSelectClass = "flex-1 h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50";
  const rowClass = "flex items-center gap-2 mb-2";
  const thClass = "px-3 py-2 text-left text-xs font-medium text-white bg-blue-600 border-r border-blue-500 last:border-r-0";
  const tdClass = "px-3 py-2 text-xs border-b border-gray-200";
  const sectionTitle = "text-sm font-bold text-gray-800 mb-3 uppercase";
  const checkLabel = "text-xs text-blue-600 ml-2 cursor-pointer";
  const subSectionTitle = "text-xs font-semibold text-blue-600 mb-2";

  const reqSubTabs = ['Pre-Demo Business Questionnaire', 'Meeting Date & Time', 'Process Flow', 'Analysis', 'Follow-Up', 'Memo', 'Upload File', 'Workflow & Audit Trail'];

  return (
    <div className="space-y-4">
      {/* Top Form Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-1">
          <div className={rowClass}>
            <label className={fieldLabelClass}>Company Name</label>
            <input type="text" value={data?.company_name || ''} onChange={(e) => setData({ ...data, company_name: e.target.value })} className={fieldInputClass} />
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Contact Name</label>
            <select value={data?.contact_id || ''} onChange={(e) => setData({ ...data, contact_id: e.target.value })} className={fieldSelectClass}>
              <option value="">Select Contact Name</option>
              <option value="1">Contact 1</option>
              <option value="2">Contact 2</option>
            </select>
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Email Format / Type</label>
            <select value={data?.email_format || ''} onChange={(e) => setData({ ...data, email_format: e.target.value })} className="flex-1 h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50">
              <option value="">Email to Customer for Due Diligence Form</option>
              <option value="due_diligence">Email to Customer for Due Diligence Form</option>
              <option value="requirement">Requirement Gathering Email</option>
              <option value="followup">Follow-up Email</option>
            </select>
            <button className="h-8 px-3 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1">
              <Mail className="w-4 h-4" />
            </button>
          </div>

          {/* Email Sent To Table */}
          <div className="mt-3 border rounded overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-600">
                  <th className={thClass}>Email Sent To</th>
                  <th className={thClass}>Attachments</th>
                  <th className={thClass}>Sent On</th>
                  <th className={thClass}>Action</th>
                </tr>
              </thead>
              <tbody>
                {emailsSent.length === 0 ? (
                  <tr><td colSpan={4} className="px-3 py-4 text-center text-gray-400 text-xs">No emails sent</td></tr>
                ) : (
                  emailsSent.map((email: any, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className={tdClass}>{email.to}</td>
                      <td className={tdClass}>{email.attachments || '-'}</td>
                      <td className={tdClass}>{email.sent_on}</td>
                      <td className={tdClass}><button className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-3 h-3" /></button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-1">
          <div className={rowClass}>
            <label className={fieldLabelClass}>Branch Office</label>
            <input type="text" value={data?.branch_office || ''} onChange={(e) => setData({ ...data, branch_office: e.target.value })} className={fieldInputClass} placeholder="Branch Office" />
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Contact Email</label>
            <input type="email" value={data?.contact_email || ''} onChange={(e) => setData({ ...data, contact_email: e.target.value })} className={fieldInputClass} />
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Document</label>
            <input type="text" className={fieldInputClass} readOnly value={reqSelectedFile?.name || ''} placeholder="" />
            <input ref={reqFileInputRef} type="file" onChange={handleReqFileChange} className="hidden" style={{ display: 'none' }} />
            <button type="button" onClick={handleReqChooseFile} className="h-8 px-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs flex items-center gap-1">
              <Upload className="w-3 h-3" /> Choose File
            </button>
            <button type="button" onClick={handleReqUploadFile} disabled={!reqSelectedFile || reqUploading} className="h-8 px-3 border border-gray-300 rounded hover:bg-gray-50 text-xs disabled:opacity-50 disabled:cursor-not-allowed">
              {reqUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>

          {/* Documents Table */}
          <div className="mt-3 border rounded overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-600">
                  <th className={thClass}>File Name</th>
                  <th className={thClass}>Link</th>
                  <th className={thClass}>Size</th>
                  <th className={thClass}>Upload On</th>
                  <th className={thClass}>Action</th>
                </tr>
              </thead>
              <tbody>
                {reqDocs.length === 0 ? (
                  <tr><td colSpan={5} className="px-3 py-4 text-center text-gray-400 text-xs">No documents uploaded</td></tr>
                ) : (
                  reqDocs.map((doc: any, index: number) => (
                    <tr key={doc.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className={`${tdClass} text-blue-600`}>{doc.file_name}</td>
                      <td className={`${tdClass} text-blue-600`}>
                        {doc.file_path ? <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/${doc.file_path}`} target="_blank" rel="noopener noreferrer" className="hover:underline truncate block max-w-[120px]">service.delta.axieve...</a> : '-'}
                      </td>
                      <td className={tdClass}>{doc.file_size ? `${(doc.file_size / 1024).toFixed(2)} Kb` : '-'}</td>
                      <td className={tdClass}>{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleString() : '-'}</td>
                      <td className={tdClass}>
                        <div className="flex gap-1 justify-center items-center">
                          <input type="checkbox" className="w-3 h-3" />
                          <button type="button" onClick={() => handleReqDeleteDoc(doc.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sub-tabs Section */}
      <div className="border-t pt-4">
        <div className="flex gap-4 mb-4">
          {reqSubTabs.map((tab) => {
            const tabKey = tab.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
            const isActive = reqSubTab === tabKey;
            return (
              <button
                key={tab}
                onClick={() => setReqSubTab(tabKey)}
                className={`px-2 py-1 text-xs font-medium border-b-2 ${
                  isActive
                    ? 'border-blue-600 text-blue-600 bg-blue-50 rounded-t'
                    : 'border-transparent text-orange-500 hover:text-orange-600'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Pre-Demo Business Questionnaire */}
        {reqSubTab === 'pre-demo-business-questionnaire' && (
          <div className="space-y-6">
            <h3 className={sectionTitle}>PRE-DEMO BUSINESS QUESTIONNAIRE</h3>

            {/* 1. GENERAL INFORMATION */}
            <div>
              <h4 className={sectionTitle}>1. GENERAL INFORMATION</h4>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                <div className={rowClass}>
                  <label className={`${subSectionTitle} w-36 flex-shrink-0 mb-0`}>Company Name:</label>
                  <input type="text" value={questionnaire.gen_company_name || ''} onChange={(e) => updateQ('gen_company_name', e.target.value)} className={fieldInputClass} placeholder="Name" />
                </div>
                <div className={rowClass}>
                  <label className={`${subSectionTitle} w-48 flex-shrink-0 mb-0`}>Key Person (Name):</label>
                  <input type="text" value={questionnaire.gen_key_person || ''} onChange={(e) => updateQ('gen_key_person', e.target.value)} className={fieldInputClass} />
                </div>
                <div className={rowClass}>
                  <label className={`${subSectionTitle} w-36 flex-shrink-0 mb-0`}>Designation:</label>
                  <input type="text" value={questionnaire.gen_designation || ''} onChange={(e) => updateQ('gen_designation', e.target.value)} className={fieldInputClass} />
                </div>
                <div className={rowClass}>
                  <label className={`${subSectionTitle} w-48 flex-shrink-0 mb-0`}>Email:</label>
                  <input type="email" value={questionnaire.gen_email || ''} onChange={(e) => updateQ('gen_email', e.target.value)} className={fieldInputClass} />
                </div>
                <div className={rowClass}>
                  <label className={`${subSectionTitle} w-36 flex-shrink-0 mb-0`}>Phone:</label>
                  <input type="text" value={questionnaire.gen_phone || ''} onChange={(e) => updateQ('gen_phone', e.target.value)} className={fieldInputClass} />
                </div>
                <div className={rowClass}>
                  <label className={`${subSectionTitle} w-48 flex-shrink-0 mb-0`}>Website:</label>
                  <input type="text" value={questionnaire.gen_website || ''} onChange={(e) => updateQ('gen_website', e.target.value)} className={fieldInputClass} />
                </div>
                <div className={rowClass}>
                  <label className={`${subSectionTitle} w-36 flex-shrink-0 mb-0`}>Address:</label>
                  <input type="text" value={questionnaire.gen_address || ''} onChange={(e) => updateQ('gen_address', e.target.value)} className={fieldInputClass} />
                </div>
                <div className={rowClass}>
                  <label className={`${subSectionTitle} w-48 flex-shrink-0 mb-0`}>Postal Code:</label>
                  <input type="text" value={questionnaire.gen_postal_code || ''} onChange={(e) => updateQ('gen_postal_code', e.target.value)} className={fieldInputClass} />
                </div>
                <div className={rowClass}>
                  <label className={`${subSectionTitle} w-36 flex-shrink-0 mb-0`}>Country:</label>
                  <input type="text" value={questionnaire.gen_country || ''} onChange={(e) => updateQ('gen_country', e.target.value)} className={fieldInputClass} />
                </div>
                <div className={rowClass}>
                  <label className={`${subSectionTitle} w-48 flex-shrink-0 mb-0`}>Years in Operation:</label>
                  <input type="text" value={questionnaire.gen_years_operation || ''} onChange={(e) => updateQ('gen_years_operation', e.target.value)} className={fieldInputClass} />
                </div>
                <div className={rowClass}>
                  <label className={`${subSectionTitle} w-36 flex-shrink-0 mb-0`}>State/Province:</label>
                  <input type="text" value={questionnaire.gen_state || ''} onChange={(e) => updateQ('gen_state', e.target.value)} className={fieldInputClass} />
                </div>
                <div className={rowClass}>
                  <label className={`${subSectionTitle} w-48 flex-shrink-0 mb-0`}>Branch Offices / Address(es):</label>
                  <input type="text" value={questionnaire.gen_branch_offices || ''} onChange={(e) => updateQ('gen_branch_offices', e.target.value)} className={fieldInputClass} />
                </div>
                <div className={rowClass}>
                  <label className={`${subSectionTitle} w-36 flex-shrink-0 mb-0`}>City:</label>
                  <input type="text" value={questionnaire.gen_city || ''} onChange={(e) => updateQ('gen_city', e.target.value)} className={fieldInputClass} />
                </div>
              </div>
            </div>

            {/* 2. ABOUT YOUR BUSINESS */}
            <div>
              <h4 className={sectionTitle}>2. ABOUT YOUR BUSINESS</h4>
              <div className="grid grid-cols-2 gap-x-8">
                {/* Left: Years in Operation, Company Size, Annual Revenue */}
                <div className="space-y-4">
                  <div>
                    <p className={subSectionTitle}>Years in Operation:</p>
                    {['1-5', '6-10', '11-20', '20+'].map((opt) => (
                      <label key={opt} className="flex items-center mb-1 cursor-pointer">
                        <input type="checkbox" checked={(questionnaire.biz_years_operation || []).includes(opt)} onChange={() => toggleCheckbox('biz_years_operation', opt)} className="w-3.5 h-3.5" />
                        <span className={checkLabel}>{opt}</span>
                      </label>
                    ))}
                  </div>
                  <div>
                    <p className={subSectionTitle}>Company Size:</p>
                    {['1-10', '11-50', '51-100', '100+'].map((opt) => (
                      <label key={opt} className="flex items-center mb-1 cursor-pointer">
                        <input type="checkbox" checked={(questionnaire.biz_company_size || []).includes(opt)} onChange={() => toggleCheckbox('biz_company_size', opt)} className="w-3.5 h-3.5" />
                        <span className={checkLabel}>{opt}</span>
                      </label>
                    ))}
                  </div>
                  <div>
                    <p className={subSectionTitle}>Annual Revenue (Approx.):</p>
                    {['Upto US$ 100,000', 'US$ 100,000 – 250,000', 'US$ 250,000 – 1,000,000', 'US$ 1,000,000 – 5,000,000', 'US$ 5,000,000 – 10,000,000', 'Above US$ 10,000,000'].map((opt) => (
                      <label key={opt} className="flex items-center mb-1 cursor-pointer">
                        <input type="checkbox" checked={(questionnaire.biz_annual_revenue || []).includes(opt)} onChange={() => toggleCheckbox('biz_annual_revenue', opt)} className="w-3.5 h-3.5" />
                        <span className={checkLabel}>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {/* Right: Industry Type, Markets Served, Company Legal Structure */}
                <div className="space-y-4">
                  <div>
                    <p className={subSectionTitle}>Industry Type:</p>
                    {['Trading (Buy & Sell Products)', 'Manufacturing (Produce Goods)', 'Services (Provide Services to Clients)', 'Distribution / Wholesale', 'Retail / POS', 'Projects / EPC', 'Consulting / Advisory'].map((opt) => (
                      <label key={opt} className="flex items-center mb-1 cursor-pointer">
                        <input type="checkbox" checked={(questionnaire.biz_industry_type || []).includes(opt)} onChange={() => toggleCheckbox('biz_industry_type', opt)} className="w-3.5 h-3.5" />
                        <span className={checkLabel}>{opt}</span>
                      </label>
                    ))}
                    <label className="flex items-center mb-1 cursor-pointer">
                      <input type="checkbox" checked={(questionnaire.biz_industry_type || []).includes('Other')} onChange={() => toggleCheckbox('biz_industry_type', 'Other')} className="w-3.5 h-3.5" />
                      <span className={checkLabel}>Other:</span>
                      <input type="text" value={questionnaire.biz_industry_other || ''} onChange={(e) => updateQ('biz_industry_other', e.target.value)} className="ml-2 h-7 w-40 px-2 text-xs border border-gray-300 rounded" placeholder="Please specify" />
                    </label>
                  </div>
                  <div>
                    <p className={subSectionTitle}>Markets Served (Select all that apply):</p>
                    {['Local', 'National', 'International'].map((opt) => (
                      <label key={opt} className="flex items-center mb-1 cursor-pointer">
                        <input type="checkbox" checked={(questionnaire.biz_markets_served || []).includes(opt)} onChange={() => toggleCheckbox('biz_markets_served', opt)} className="w-3.5 h-3.5" />
                        <span className={checkLabel}>{opt}</span>
                      </label>
                    ))}
                  </div>
                  <div>
                    <p className={subSectionTitle}>Company Legal Structure:</p>
                    {['Sole Proprietorship', 'Partnership', 'LLC (Limited Liability Company)'].map((opt) => (
                      <label key={opt} className="flex items-center mb-1 cursor-pointer">
                        <input type="checkbox" checked={(questionnaire.biz_legal_structure || []).includes(opt)} onChange={() => toggleCheckbox('biz_legal_structure', opt)} className="w-3.5 h-3.5" />
                        <span className={checkLabel}>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3 & 4 side by side */}
            <div className="grid grid-cols-2 gap-x-8">
              {/* 3. CURRENT SYSTEMS USED */}
              <div>
                <h4 className={sectionTitle}>3. CURRENT SYSTEMS USED</h4>
                {['Paper / Excel Sheets', 'Accounting Software (Tally, QuickBooks, Zoho, etc.)', 'CRM Software', 'HRM Software', 'Inventory / Stock System', 'ERP System'].map((opt) => (
                  <label key={opt} className="flex items-center mb-1 cursor-pointer">
                    <input type="checkbox" checked={(questionnaire.current_systems || []).includes(opt)} onChange={() => toggleCheckbox('current_systems', opt)} className="w-3.5 h-3.5" />
                    <span className={checkLabel}>{opt}</span>
                  </label>
                ))}
                <label className="flex items-center mb-1 cursor-pointer">
                  <input type="checkbox" checked={(questionnaire.current_systems || []).includes('Other')} onChange={() => toggleCheckbox('current_systems', 'Other')} className="w-3.5 h-3.5" />
                  <span className={checkLabel}>Other:</span>
                  <input type="text" value={questionnaire.current_systems_other || ''} onChange={(e) => updateQ('current_systems_other', e.target.value)} className="ml-2 h-7 w-40 px-2 text-xs border border-gray-300 rounded" placeholder="Please specify" />
                </label>
              </div>

              {/* 4. KEY BUSINESS PRIORITIES */}
              <div>
                <h4 className={sectionTitle}>4. KEY BUSINESS PRIORITIES</h4>
                {['Getting More Customers (Sales & CRM)', 'Managing Suppliers & Vendors Better', 'Faster Proposal / Quotation Process', 'Tracking Inventory & Stock Easily', 'Better Financial Control (Invoices, Payments, Reports)', 'Tracking Projects, Tasks, Timesheets', 'Managing Employees (HR & Payroll)', 'Easy Access to Documents (DMS)', 'Quick & Accurate Business Reports (Better Visibility of Data)', 'Smooth Integration Across Departments (Improved Workflow & Communication)', 'Multi-Currency Support', 'Reduce Manual Errors', 'Reduce Operational Costs'].map((opt) => (
                  <label key={opt} className="flex items-center mb-1 cursor-pointer">
                    <input type="checkbox" checked={(questionnaire.key_priorities || []).includes(opt)} onChange={() => toggleCheckbox('key_priorities', opt)} className="w-3.5 h-3.5" />
                    <span className={checkLabel}>{opt}</span>
                  </label>
                ))}
                <label className="flex items-center mb-1 cursor-pointer">
                  <input type="checkbox" checked={(questionnaire.key_priorities || []).includes('Other')} onChange={() => toggleCheckbox('key_priorities', 'Other')} className="w-3.5 h-3.5" />
                  <span className={checkLabel}>Other:</span>
                  <input type="text" value={questionnaire.key_priorities_other || ''} onChange={(e) => updateQ('key_priorities_other', e.target.value)} className="ml-2 h-7 w-40 px-2 text-xs border border-gray-300 rounded" placeholder="Please specify" />
                </label>
              </div>
            </div>

            {/* 5. MAIN BUSINESS CHALLENGES */}
            <div>
              <h4 className={sectionTitle}>5. MAIN BUSINESS CHALLENGES</h4>
              <div className="grid grid-cols-2 gap-x-8">
                <div>
                  {['Too much manual work in Excel / Paper', 'Hard to track orders, stock, or shipments', 'Delays in sending Quotations / Invoices', 'No clear view of payments & collections', 'Inventory or supply chain management issues', 'Difficulty in managing suppliers/vendors', 'Employee leave, payroll, or performance issues', 'Lack of reports for decision making', 'Difficult to manage multiple currencies', 'Difficult to manage multiple branches/locations'].map((opt) => (
                    <label key={opt} className="flex items-center mb-1 cursor-pointer">
                      <input type="checkbox" checked={(questionnaire.main_challenges || []).includes(opt)} onChange={() => toggleCheckbox('main_challenges', opt)} className="w-3.5 h-3.5" />
                      <span className={checkLabel}>{opt}</span>
                    </label>
                  ))}
                  <label className="flex items-center mb-1 cursor-pointer">
                    <input type="checkbox" checked={(questionnaire.main_challenges || []).includes('Other')} onChange={() => toggleCheckbox('main_challenges', 'Other')} className="w-3.5 h-3.5" />
                    <span className={checkLabel}>Other:</span>
                    <input type="text" value={questionnaire.main_challenges_other || ''} onChange={(e) => updateQ('main_challenges_other', e.target.value)} className="ml-2 h-7 w-40 px-2 text-xs border border-gray-300 rounded" placeholder="Please specify" />
                  </label>
                </div>
              </div>
            </div>

            {/* 6. OTHER REQUIREMENTS / NOTES */}
            <div>
              <h4 className={sectionTitle}>6. OTHER REQUIREMENTS / NOTES</h4>
              <p className="text-xs text-blue-500 mb-2 italic">Please mention any special features, compliance needs, or integrations you require</p>
              <textarea
                value={questionnaire.other_requirements || ''}
                onChange={(e) => updateQ('other_requirements', e.target.value)}
                className="w-full h-28 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                placeholder=""
              />
            </div>

            <div className="flex justify-center mt-4">
              <button onClick={onSave} disabled={saving} className="px-6 py-1.5 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {/* Meeting Date & Time */}
        {reqSubTab === 'meeting-date-time' && (
          <div className="space-y-6">
            <h3 className={sectionTitle}>MEETING DATE & TIME</h3>

            {/* GENERAL INFORMATION */}
            <div>
              <h4 className={sectionTitle}>GENERAL INFORMATION</h4>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                <div className={rowClass}>
                  <label className={`${subSectionTitle} w-36 flex-shrink-0 mb-0`}>Key Person&apos;s Name:</label>
                  <input type="text" value={questionnaire.meet_key_person || ''} onChange={(e) => updateQ('meet_key_person', e.target.value)} className={fieldInputClass} />
                </div>
                <div className={rowClass}>
                  <label className={`${subSectionTitle} w-36 flex-shrink-0 mb-0`}>Company Phone:</label>
                  <input type="text" value={questionnaire.meet_company_phone || ''} onChange={(e) => updateQ('meet_company_phone', e.target.value)} className={fieldInputClass} />
                </div>
                <div className={rowClass}>
                  <label className={`${subSectionTitle} w-36 flex-shrink-0 mb-0`}>Company Name:</label>
                  <input type="text" value={questionnaire.meet_company_name || ''} onChange={(e) => updateQ('meet_company_name', e.target.value)} className={fieldInputClass} />
                </div>
                <div className={rowClass}>
                  <label className={`${subSectionTitle} w-36 flex-shrink-0 mb-0`}>EXT:</label>
                  <input type="text" value={questionnaire.meet_ext || ''} onChange={(e) => updateQ('meet_ext', e.target.value)} className={fieldInputClass} />
                </div>
                <div className={rowClass}>
                  <label className={`${subSectionTitle} w-36 flex-shrink-0 mb-0`}>Address:</label>
                  <input type="text" value={questionnaire.meet_address || ''} onChange={(e) => updateQ('meet_address', e.target.value)} className={fieldInputClass} />
                </div>
                <div className={rowClass}>
                  <label className={`${subSectionTitle} w-36 flex-shrink-0 mb-0`}>Fax:</label>
                  <input type="text" value={questionnaire.meet_fax || ''} onChange={(e) => updateQ('meet_fax', e.target.value)} className={fieldInputClass} />
                </div>
                <div className={rowClass}>
                  <label className={`${subSectionTitle} w-36 flex-shrink-0 mb-0`}>Country</label>
                  <select value={questionnaire.meet_country || ''} onChange={(e) => updateQ('meet_country', e.target.value)} className={fieldSelectClass}>
                    <option value="">Country</option>
                    <option value="UAE">UAE</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="Qatar">Qatar</option>
                    <option value="Bahrain">Bahrain</option>
                    <option value="Kuwait">Kuwait</option>
                    <option value="Oman">Oman</option>
                    <option value="India">India</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                  </select>
                </div>
                <div className={rowClass}>
                  <label className={`${subSectionTitle} w-36 flex-shrink-0 mb-0`}>Email:</label>
                  <input type="email" value={questionnaire.meet_email || ''} onChange={(e) => updateQ('meet_email', e.target.value)} className={fieldInputClass} />
                </div>
                <div className={rowClass}>
                  <label className={`${subSectionTitle} w-36 flex-shrink-0 mb-0`}>Province</label>
                  <select value={questionnaire.meet_province || ''} onChange={(e) => updateQ('meet_province', e.target.value)} className={fieldSelectClass}>
                    <option value="">Select State</option>
                  </select>
                </div>
                <div className={rowClass}>
                  <label className={`${subSectionTitle} w-36 flex-shrink-0 mb-0`}>Website:</label>
                  <input type="text" value={questionnaire.meet_website || ''} onChange={(e) => updateQ('meet_website', e.target.value)} className={fieldInputClass} />
                </div>
                <div className={rowClass}>
                  <label className={`${subSectionTitle} w-36 flex-shrink-0 mb-0`}>City</label>
                  <select value={questionnaire.meet_city || ''} onChange={(e) => updateQ('meet_city', e.target.value)} className={fieldSelectClass}>
                    <option value="">Select City</option>
                  </select>
                </div>
                <div className={rowClass}>
                  <label className={`${subSectionTitle} w-36 flex-shrink-0 mb-0`}>Any Branch Office:</label>
                  <input type="text" value={questionnaire.meet_branch_office || ''} onChange={(e) => updateQ('meet_branch_office', e.target.value)} className={fieldInputClass} />
                </div>
                <div className={rowClass}>
                  <label className={`${subSectionTitle} w-36 flex-shrink-0 mb-0`}>Postal Code:</label>
                  <input type="text" value={questionnaire.meet_postal_code || ''} onChange={(e) => updateQ('meet_postal_code', e.target.value)} className={fieldInputClass} />
                </div>
                <div className={rowClass}>
                  <label className={`${subSectionTitle} w-36 flex-shrink-0 mb-0`}>Branch Address:</label>
                  <input type="text" value={questionnaire.meet_branch_address || ''} onChange={(e) => updateQ('meet_branch_address', e.target.value)} className={fieldInputClass} />
                </div>
              </div>
            </div>

            {/* ARRANGE MEETING SESSION */}
            <div>
              <h4 className={sectionTitle}>ARRANGE MEETING SESSION</h4>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                <div className={rowClass}>
                  <label className={`${subSectionTitle} w-36 flex-shrink-0 mb-0`}>Preferred Date:</label>
                  <input type="date" value={questionnaire.meet_preferred_date || ''} onChange={(e) => updateQ('meet_preferred_date', e.target.value)} className={fieldInputClass} />
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <label className={`${subSectionTitle} w-20 flex-shrink-0 mb-0`}>Remark:</label>
                    <input type="text" value={questionnaire.meet_remark || ''} onChange={(e) => updateQ('meet_remark', e.target.value)} className={fieldInputClass} />
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <label className={`${subSectionTitle} w-20 flex-shrink-0 mb-0`}>Discuss</label>
                  </div>
                </div>
                <div className={rowClass}>
                  <label className={`${subSectionTitle} w-36 flex-shrink-0 mb-0`}>Preferred Time:</label>
                  <input type="time" value={questionnaire.meet_preferred_time || ''} onChange={(e) => updateQ('meet_preferred_time', e.target.value)} className={fieldInputClass} step="1" />
                </div>
                <div className={rowClass}>
                  <label className={`${subSectionTitle} w-20 flex-shrink-0 mb-0`}>TimeZone:</label>
                  <select value={questionnaire.meet_timezone || ''} onChange={(e) => updateQ('meet_timezone', e.target.value)} className={fieldSelectClass}>
                    <option value="">Select Timezone</option>
                    <option value="Asia/Aden (+03:00)">Asia/Aden (+03:00)</option>
                    <option value="Asia/Dubai (+04:00)">Asia/Dubai (+04:00)</option>
                    <option value="Asia/Karachi (+05:00)">Asia/Karachi (+05:00)</option>
                    <option value="Asia/Kolkata (+05:30)">Asia/Kolkata (+05:30)</option>
                    <option value="Asia/Riyadh (+03:00)">Asia/Riyadh (+03:00)</option>
                    <option value="Asia/Qatar (+03:00)">Asia/Qatar (+03:00)</option>
                    <option value="Europe/London (+00:00)">Europe/London (+00:00)</option>
                    <option value="America/New_York (-05:00)">America/New_York (-05:00)</option>
                    <option value="America/Los_Angeles (-08:00)">America/Los_Angeles (-08:00)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <button onClick={onSave} disabled={saving} className="px-6 py-1.5 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {/* Process Flow */}
        {reqSubTab === 'process-flow' && (() => {
          const boxStyle = "px-4 py-2 border-2 border-blue-400 rounded text-xs text-blue-600 font-medium text-center bg-white min-w-[160px] whitespace-nowrap";
          const arrowDown = <div className="flex justify-center my-1"><svg width="12" height="20" viewBox="0 0 12 20"><line x1="6" y1="0" x2="6" y2="14" stroke="#6366f1" strokeWidth="2"/><polygon points="1,14 6,20 11,14" fill="#6366f1"/></svg></div>;
          const arrowRight = <div className="flex items-center mx-1"><svg width="24" height="12" viewBox="0 0 24 12"><line x1="0" y1="6" x2="18" y2="6" stroke="#6366f1" strokeWidth="2"/><polygon points="18,1 24,6 18,11" fill="#6366f1"/></svg></div>;
          const arrowLeft = <div className="flex items-center mx-1"><svg width="24" height="12" viewBox="0 0 24 12"><line x1="6" y1="6" x2="24" y2="6" stroke="#6366f1" strokeWidth="2"/><polygon points="6,1 0,6 6,11" fill="#6366f1"/></svg></div>;
          const arrowBoth = <div className="flex items-center mx-1"><svg width="28" height="12" viewBox="0 0 28 12"><line x1="6" y1="6" x2="22" y2="6" stroke="#6366f1" strokeWidth="2"/><polygon points="6,1 0,6 6,11" fill="#6366f1"/><polygon points="22,1 28,6 22,11" fill="#6366f1"/></svg></div>;
          const colTitle = "text-sm font-bold text-blue-600 mb-3 text-center uppercase tracking-wide";
          return (
          <div className="space-y-8 overflow-x-auto pb-4">
            {/* Row 1: CUSTOMER, ORDERS, SUPPLIER, PROJECT */}
            <div className="flex gap-8 items-start justify-center min-w-[900px]">
              {/* CUSTOMER */}
              <div className="flex flex-col items-center">
                <h4 className={colTitle}>CUSTOMER</h4>
                <div className={boxStyle}>Pre - Lead</div>
                {arrowDown}
                <div className={boxStyle}>Lead</div>
                {arrowDown}
                <div className={boxStyle}>Quality Lead</div>
                {arrowDown}
                <div className={boxStyle}>Customer</div>
                {arrowDown}
                <div className="flex items-center">
                  <div className={boxStyle}>Customer Master</div>
                  {arrowRight}
                </div>
                {arrowDown}
                <div className={boxStyle}>Campaign</div>
                {arrowDown}
                <div className={boxStyle}>Customer Survey</div>
              </div>

              {/* ORDERS */}
              <div className="flex flex-col items-center mt-[168px]">
                <h4 className={colTitle}>ORDERS</h4>
                <div className={boxStyle}>Customer Inquiry</div>
                {arrowDown}
                <div className={boxStyle}>Supplier Inquiry</div>
                {arrowDown}
                <div className={boxStyle}>Supplier Quotation</div>
                {arrowDown}
                <div className={boxStyle}>Customer Quotation</div>
                {arrowDown}
                <div className={boxStyle}>Customer Order</div>
              </div>

              {/* SUPPLIER */}
              <div className="flex flex-col items-center mt-[168px]">
                <h4 className={colTitle}>SUPPLIER</h4>
                <div className={boxStyle}>Supplier Master</div>
                {arrowDown}
                <div className={boxStyle}>Vendor Master</div>
                {arrowDown}
                <div className={boxStyle}>Manufacturer Master</div>
                {arrowDown}
                <div className={boxStyle}>Price List</div>
              </div>

              {/* PROJECT */}
              <div className="flex flex-col items-center mt-[168px]">
                <h4 className={colTitle}>PROJECT</h4>
                <div className={boxStyle}>Task Management</div>
                {arrowDown}
                <div className={boxStyle}>Project Management</div>
                {arrowDown}
                <div className={boxStyle}>Timesheet</div>
              </div>
            </div>

            {/* Row 2: INVENTORY, ORDERS continued, FINANCIAL, E-COMMERCE + HRM */}
            <div className="flex gap-8 items-start justify-center min-w-[900px]">
              {/* INVENTORY */}
              <div className="flex flex-col items-center">
                <h4 className={colTitle}>INVENTORY</h4>
                <div className={boxStyle}>Item Master</div>
                {arrowDown}
                <div className="flex items-center">
                  <div className={boxStyle}>Shipping Instruction</div>
                  {arrowBoth}
                </div>
                {arrowDown}
                <div className={boxStyle}>Order Receiving</div>
                {arrowDown}
                <div className="flex items-center">
                  <div className={boxStyle}>Inventory</div>
                  {arrowRight}
                </div>
                {arrowDown}
                <div className={boxStyle}>Return Receive</div>
                {arrowDown}
                <div className={boxStyle}>Return Authorization</div>
              </div>

              {/* ORDERS continued */}
              <div className="flex flex-col items-center mt-[36px]">
                <div className="flex items-center">
                  <div className={boxStyle}>Supplier Purchase Order</div>
                </div>
                {arrowDown}
                <div className={boxStyle}>Order Priority</div>
                {arrowDown}
                <div className="flex items-center">
                  <div className={boxStyle}>Order Pick - Pack</div>
                  {arrowRight}
                </div>
                {arrowDown}
                <div className={boxStyle}>Order Shipping</div>
                {arrowDown}
                <div className={boxStyle}>Order Tracking</div>
              </div>

              {/* FINANCIAL */}
              <div className="flex flex-col items-center">
                <h4 className={colTitle}>FINANCIAL</h4>
                <div className={boxStyle}>Supplier Invoice</div>
                {arrowDown}
                <div className={boxStyle}>Supplier Payment</div>
                {arrowDown}
                <div className={boxStyle}>Sales Invoice</div>
                {arrowDown}
                <div className={boxStyle}>Customer Payment</div>
                {arrowDown}
                <div className="flex items-center">
                  <div className={boxStyle}>Employee Payroll</div>
                  {arrowBoth}
                </div>
                {arrowDown}
                <div className={boxStyle}>Salary Payment</div>
                {arrowDown}
                <div className={boxStyle}>Tax Payment</div>
                {arrowDown}
                <div className={boxStyle}>Bank Reconciliation</div>
              </div>

              {/* E-COMMERCE + HRM */}
              <div className="flex flex-col items-center">
                <h4 className={colTitle}>E-COMMERCE</h4>
                <div className={boxStyle}>E-Commerce</div>
                {arrowDown}
                <div className={boxStyle}>Credit Card Payment</div>
                <div className="mt-6">
                  <h4 className={colTitle}>HRM</h4>
                  <div className="flex flex-col items-center">
                    <div className={boxStyle}>Recruitment</div>
                    {arrowDown}
                    <div className={boxStyle}>Employee Master</div>
                    {arrowDown}
                    <div className={boxStyle}>Leave Management</div>
                    {arrowDown}
                    <div className={boxStyle}>Employee Assessment</div>
                    {arrowDown}
                    <div className={boxStyle}>Bonus - Increment</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: DOCUMENT MANAGEMENT, FINANCIAL continued, HRM continued */}
            <div className="flex gap-8 items-start justify-center min-w-[900px]">
              {/* DOCUMENT MANAGEMENT */}
              <div className="flex flex-col items-center">
                <h4 className={colTitle}>DOCUMENT MANAGEMENT</h4>
                <div className={boxStyle}>Inquiry</div>
                {arrowDown}
                <div className={boxStyle}>Quotation</div>
                {arrowDown}
                <div className={boxStyle}>Order</div>
                {arrowDown}
                <div className={boxStyle}>Customer</div>
                {arrowDown}
                <div className={boxStyle}>Supplier</div>
                {arrowDown}
                <div className={boxStyle}>Accounts</div>
                {arrowDown}
                <div className={boxStyle}>Order Fulfillment</div>
                {arrowDown}
                <div className={boxStyle}>Return</div>
              </div>

              {/* Spacer */}
              <div className="min-w-[160px]"></div>

              {/* FINANCIAL continued */}
              <div className="flex flex-col items-center">
                <div className={boxStyle}>Journal Ledger</div>
                {arrowDown}
                <div className={boxStyle}>Ledger</div>
                {arrowDown}
                <div className={boxStyle}>Fixed Asset</div>
                {arrowDown}
                <div className={boxStyle}>Account Statements</div>
                {arrowDown}
                <div className={boxStyle}>Tax Return</div>
                {arrowDown}
                <div className={boxStyle}>Tax Payment</div>
                {arrowDown}
                <div className={boxStyle}>Budget</div>
              </div>

              {/* HRM continued */}
              <div className="flex flex-col items-center">
                <div className={boxStyle}>Holiday Master</div>
              </div>
            </div>

            {/* Generate PDF Button */}
            <div className="flex justify-center mt-6">
              <button className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
                Generate PDF
              </button>
            </div>
          </div>
          );
        })()}

        {/* Analysis */}
        {reqSubTab === 'analysis' && (() => {
          const analysisData = questionnaire.analysis || {};
          const updateAnalysis = (field: string, value: any) => {
            const updated = { ...analysisData, [field]: value };
            updateQ('analysis', updated);
          };
          const toggleFeature = (category: string, item: string, col: 'software' | 'word_excel' | 'manual') => {
            const catData = analysisData[category] || {};
            const itemData = catData[item] || {};
            const updatedItem = { ...itemData, [col]: !itemData[col] };
            const updatedCat = { ...catData, [item]: updatedItem };
            updateAnalysis(category, updatedCat);
          };
          const getFeatureVal = (category: string, item: string, col: 'software' | 'word_excel' | 'manual') => {
            return !!(analysisData[category]?.[item]?.[col]);
          };
          const featureRow = (category: string, item: string, label: string) => (
            <div key={item} className="flex items-center py-1.5">
              <span className="text-xs text-blue-600 w-[300px] flex-shrink-0 pl-8">{label}</span>
              <div className="flex-1 flex">
                <div className="w-[160px] flex justify-center"><input type="checkbox" checked={getFeatureVal(category, item, 'software')} onChange={() => toggleFeature(category, item, 'software')} className="w-3.5 h-3.5 accent-blue-600" /></div>
                <div className="w-[160px] flex justify-center"><input type="checkbox" checked={getFeatureVal(category, item, 'word_excel')} onChange={() => toggleFeature(category, item, 'word_excel')} className="w-3.5 h-3.5 accent-blue-600" /></div>
                <div className="w-[160px] flex justify-center"><input type="checkbox" checked={getFeatureVal(category, item, 'manual')} onChange={() => toggleFeature(category, item, 'manual')} className="w-3.5 h-3.5 accent-blue-600" /></div>
              </div>
            </div>
          );
          const otherRow = (category: string) => (
            <div className="flex items-center py-1.5">
              <div className="w-[300px] flex-shrink-0 pl-8 flex items-center gap-1">
                <span className="text-xs text-red-400">Other</span>
                <input type="text" value={analysisData[`${category}_other`] || ''} onChange={(e) => updateAnalysis(`${category}_other`, e.target.value)} className="h-7 flex-1 px-2 text-xs border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex-1 flex">
                <div className="w-[160px] flex justify-center"><input type="checkbox" checked={getFeatureVal(category, '_other', 'software')} onChange={() => toggleFeature(category, '_other', 'software')} className="w-3.5 h-3.5 accent-blue-600" /></div>
                <div className="w-[160px] flex justify-center"><input type="checkbox" checked={getFeatureVal(category, '_other', 'word_excel')} onChange={() => toggleFeature(category, '_other', 'word_excel')} className="w-3.5 h-3.5 accent-blue-600" /></div>
                <div className="w-[160px] flex justify-center"><input type="checkbox" checked={getFeatureVal(category, '_other', 'manual')} onChange={() => toggleFeature(category, '_other', 'manual')} className="w-3.5 h-3.5 accent-blue-600" /></div>
              </div>
            </div>
          );
          const catTitle = "text-base font-semibold text-blue-600 mt-8 mb-1 ml-2";
          return (
          <div className="space-y-6">
            {/* Pain Points */}
            <div>
              <h4 className={sectionTitle}>PAIN POINTS OR INEFFICIENCIES IN THE EXISTING BUSINESS PROCESSES/SOFTWARE.</h4>
              <textarea value={analysisData.pain_points || ''} onChange={(e) => updateAnalysis('pain_points', e.target.value)} className="w-full h-16 px-3 py-2 text-sm border-b border-gray-200 focus:outline-none focus:border-blue-400 bg-transparent resize-none" />
            </div>

            {/* Benefits Expected */}
            <div>
              <h4 className={sectionTitle}>BENEFITS EXPECTED FROM THE NEW ERP/SOFTWARE.</h4>
              <div className="space-y-5 mt-3">
                <div>
                  <p className="text-sm font-medium text-blue-500 mb-2">Critical</p>
                  <div className="flex items-center gap-3 ml-16">
                    <label className="text-xs text-blue-600 flex-shrink-0">Other Requirements</label>
                    <input type="text" value={analysisData.benefits_critical || ''} onChange={(e) => updateAnalysis('benefits_critical', e.target.value)} className="flex-1 h-8 px-2 text-sm border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-500 mb-2">Important</p>
                  <div className="flex items-center gap-3 ml-16">
                    <label className="text-xs text-blue-600 flex-shrink-0">Other Requirements</label>
                    <input type="text" value={analysisData.benefits_important || ''} onChange={(e) => updateAnalysis('benefits_important', e.target.value)} className="flex-1 h-8 px-2 text-sm border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-500 mb-2">Minor Importance</p>
                  <div className="flex items-center gap-3 ml-16">
                    <label className="text-xs text-blue-600 flex-shrink-0">Other Requirements</label>
                    <input type="text" value={analysisData.benefits_minor || ''} onChange={(e) => updateAnalysis('benefits_minor', e.target.value)} className="flex-1 h-8 px-2 text-sm border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* KEY FEATURES IN THE SOFTWARE/PROCESS */}
            <div>
              <h4 className="text-sm font-bold text-blue-600 mb-2 uppercase">KEY FEATURES IN THE SOFTWARE/PROCESS</h4>

              {/* Customer Relationship Management */}
              <h5 className={catTitle}>Customer Relationship Management</h5>
              {/* Column headers - shown once */}
              <div className="flex items-center py-2">
                <span className="w-[300px] flex-shrink-0"></span>
                <div className="flex-1 flex">
                  <div className="w-[160px] text-center text-xs font-semibold text-gray-700">Software</div>
                  <div className="w-[160px] text-center text-xs font-semibold text-gray-700">Word/Excel</div>
                  <div className="w-[160px] text-center text-xs font-semibold text-gray-700">Manual</div>
                </div>
              </div>
              {featureRow('crm', 'customer_details', 'Customer Details')}
              {featureRow('crm', 'customer_interactions', 'Customer Interactions')}
              {featureRow('crm', 'lead_details', 'Lead Details')}
              {featureRow('crm', 'lead_tracking', 'Lead Tracking/Interactions')}
              {featureRow('crm', 'marketing_campaigns', 'Marketing Campaigns')}
              {featureRow('crm', 'survey_satisfaction', 'Survey and Customer Satisfaction')}
              {otherRow('crm')}

              {/* Vendor/Supplier Management */}
              <h5 className={catTitle}>Vendor/Supplier Management</h5>
              {featureRow('vendor', 'vendor_supplier_master', 'Vendor/Supplier Master')}
              {featureRow('vendor', 'manufacturer_brand', 'Manufacturer and Brand Management')}
              {featureRow('vendor', 'price_list', 'Price List')}
              {otherRow('vendor')}

              {/* Supply Chain Management (Order Management) */}
              <h5 className={catTitle}>Supply Chain Management (Order Management)</h5>
              {featureRow('scm', 'customer_inquiry', 'Customer Inquiry')}
              {featureRow('scm', 'supplier_inquiry', 'Supplier Inquiry')}
              {featureRow('scm', 'supplier_quotations', 'Supplier Quotations')}
              {featureRow('scm', 'customer_quotations', 'Customer Quotations')}
              {featureRow('scm', 'customer_sales_order', 'Customer Sales Order')}
              {featureRow('scm', 'supplier_purchase_order', 'Supplier Purchase Order')}
              {featureRow('scm', 'order_receiving', 'Order Receiving')}
              {featureRow('scm', 'order_fulfillment', 'Order Fulfillment')}
              {featureRow('scm', 'shipping', 'Shipping')}
              {featureRow('scm', 'sales_tracking', 'Sales Tracking')}
              {otherRow('scm')}

              {/* Inventory Management */}
              <h5 className={catTitle}>Inventory Management</h5>
              {featureRow('inventory', 'inventory_control', 'Inventory Control')}
              {featureRow('inventory', 'item_master', 'Item Master')}
              {featureRow('inventory', 'logistics', 'Logistics')}
              {featureRow('inventory', 'rma', 'RMA (Return Material Authorization)')}
              {featureRow('inventory', 'return_receiving', 'Return Receiving')}
              {otherRow('inventory')}

              {/* Financial Management */}
              <h5 className={catTitle}>Financial Management</h5>
              {featureRow('financial', 'proforma_invoice', 'Proforma Invoice')}
              {featureRow('financial', 'sales_invoice', 'Sales Invoice')}
              {featureRow('financial', 'customer_payment', 'Customer Payment')}
              {featureRow('financial', 'credit_note', 'Credit Note')}
              {featureRow('financial', 'supplier_invoice', 'Supplier Invoice')}
              {featureRow('financial', 'supplier_payment', 'Supplier Payment')}
              {featureRow('financial', 'debit_note', 'Debit Note')}
              {featureRow('financial', 'voucher_payment', 'Voucher Payment')}
              {featureRow('financial', 'general_ledger', 'General Ledger')}
              {featureRow('financial', 'payroll_management', 'Payroll Management')}
              {featureRow('financial', 'fixed_asset_management', 'Fixed Asset Management')}
              {featureRow('financial', 'bank_credit_card', 'Bank/Credit Card Accounts')}
              {featureRow('financial', 'bank_reconciliation', 'Bank Reconciliation')}
              {featureRow('financial', 'account_statements', 'Account Statements')}
              {featureRow('financial', 'sales_commissions', 'Sales Commissions')}
              {featureRow('financial', 'credit_card_payments', 'Credit Card Payments')}
              {featureRow('financial', 'budgeting_forecasting', 'Budgeting and Forecasting')}
              {featureRow('financial', 'regulatory_compliance', 'Regulatory Compliance')}
              {otherRow('financial')}

              {/* Human Resource Management */}
              <h5 className={catTitle}>Human Resource Management</h5>
              {featureRow('hrm', 'employee_details', 'Employee Details')}
              {featureRow('hrm', 'roles_responsibilities', 'Roles and Responsibilities')}
              {featureRow('hrm', 'time_attendance', 'Time and Attendance')}
              {featureRow('hrm', 'tracking', 'Tracking')}
              {featureRow('hrm', 'leave_management', 'Leave Management')}
              {featureRow('hrm', 'performance_appraisal', 'Performance and Appraisal')}
              {featureRow('hrm', 'bonus_increments', 'Bonus and Increments')}
              {featureRow('hrm', 'hiring', 'Hiring')}
              {otherRow('hrm')}

              {/* Project Management */}
              <h5 className={catTitle}>Project Management</h5>
              {featureRow('project', 'project_planning', 'Project planning')}
              {featureRow('project', 'resource_allocation', 'Resource Allocation')}
              {featureRow('project', 'task_management', 'Task Management')}
              {featureRow('project', 'budgeting', 'Budgeting')}
              {featureRow('project', 'scheduling', 'Scheduling')}
              {featureRow('project', 'collaboration', 'Collaboration')}
              {otherRow('project')}

              {/* Other Features */}
              <h5 className={catTitle}>Other Features</h5>
              {featureRow('other_features', 'bi_kpis', 'Business Intelligence and KPIs')}
              {featureRow('other_features', 'dashboard', 'Dashboard')}
              {featureRow('other_features', 'multi_currency', 'Multi-currency Support')}
              {featureRow('other_features', 'multiple_office', 'Multiple Office')}
              {featureRow('other_features', 'dms', 'Document Management System')}
              {featureRow('other_features', 'ecommerce_integration', 'E-commerce Integration')}
              {featureRow('other_features', 'integrated_email', 'Integrated Email')}
              {featureRow('other_features', 'integrated_phone', 'Integrated Phone System')}
              {featureRow('other_features', 'integrated_calendar', 'Integrated Calendar')}
              {featureRow('other_features', 'message_board', 'Message Board')}
              {featureRow('other_features', 'mobile_access', 'Mobile Access')}
              {featureRow('other_features', 'workflow_integration', 'Work Flow Integration')}
              {featureRow('other_features', 'customer_portal', 'Customer Portal')}
              {featureRow('other_features', 'vendor_supplier_portal', 'Vendor/Supplier Portal')}
              {otherRow('other_features')}
            </div>

            <div className="flex justify-center mt-6">
              <button onClick={onSave} disabled={saving} className="px-6 py-1.5 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
          );
        })()}

        {/* Follow-Up */}
        {reqSubTab === 'follow-up' && (
          <div className="space-y-3">
            <div className="flex items-center">
              <button onClick={() => handleOpenReqFollowUp()} className="px-4 py-1.5 text-xs border border-gray-400 rounded hover:bg-gray-50">Add New Activity</button>
            </div>
            <div className="border rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-600">
                    <th className={thClass}>Activity Type</th>
                    <th className={thClass}>Activity Subject</th>
                    <th className={thClass}>Date & Time</th>
                    <th className={thClass}>Next Follow-up Date</th>
                    <th className={thClass}>Channel Type</th>
                    <th className={thClass}>Assigned To</th>
                    <th className={thClass}>Sent To</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reqFollowUps.length === 0 ? (
                    <tr><td colSpan={9} className="px-3 py-8 text-center text-gray-400 text-xs">No follow-up activities</td></tr>
                  ) : (
                    reqFollowUps.map((item: any, index: number) => (
                      <tr key={item.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className={tdClass}>{item.activity_type || '-'}</td>
                        <td className={tdClass}>{item.subject || '-'}</td>
                        <td className={tdClass}>{item.start_date ? `${item.start_date}${item.start_time ? ';  ' + item.start_time : ''}` : '-'}</td>
                        <td className={tdClass}>{item.next_followup_date ? `${item.next_followup_date}${item.next_followup_time ? ' ; ' + item.next_followup_time : ''}` : '-'}</td>
                        <td className={tdClass}>{item.channel_type || '-'}</td>
                        <td className={tdClass}>{item.assigned_to || '-'}</td>
                        <td className={tdClass}>{item.sent_to || '-'}</td>
                        <td className={`${tdClass} text-green-600`}>{item.status || '-'}</td>
                        <td className={tdClass}>
                          <button onClick={() => handleOpenReqFollowUp(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded border border-blue-200"><Edit2 className="w-3 h-3" /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Memo */}
        {reqSubTab === 'memo' && (
          <div className="space-y-3">
            <div className="flex items-center">
              <button onClick={() => handleOpenReqMemo()} className="px-4 py-1.5 text-xs border border-gray-400 rounded hover:bg-gray-50">Add Memo</button>
            </div>
            <div className="border rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-600">
                    <th className={thClass}>Date</th>
                    <th className={thClass}>Added By</th>
                    <th className={thClass}>Details</th>
                    <th className={thClass}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reqMemos.length === 0 ? (
                    <tr><td colSpan={4} className="px-3 py-8 text-center text-gray-400 text-xs">No memos</td></tr>
                  ) : (
                    reqMemos.map((memo: any, index: number) => (
                      <tr key={memo.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className={tdClass}>{memo.created_at ? new Date(memo.created_at).toLocaleDateString() : '-'}</td>
                        <td className={`${tdClass} text-blue-600`}>{memo.added_by || memo.created_by_name || '-'}</td>
                        <td className={tdClass}>{memo.content || '-'}</td>
                        <td className={tdClass}>
                          <div className="flex gap-1 justify-center">
                            <button onClick={() => handleOpenReqMemo(memo)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded border border-blue-200"><Edit2 className="w-3 h-3" /></button>
                            <button onClick={() => handleDeleteReqMemo(memo.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-gray-300"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Upload File */}
        {reqSubTab === 'upload-file' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 justify-center">
                <label className="text-xs font-semibold text-orange-500 w-20 text-right">Document</label>
                <input type="text" className="h-8 w-64 px-2 text-sm border border-gray-300 rounded bg-gray-50" readOnly value={reqSubTabFile?.name || ''} />
                <input ref={reqSubTabFileRef} type="file" onChange={handleReqSubTabFileChange} className="hidden" style={{ display: 'none' }} />
                <button type="button" onClick={handleReqSubTabChooseFile} className="h-8 px-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs flex items-center gap-1"><Upload className="w-3 h-3" /> Choose File</button>
                <button type="button" onClick={handleReqSubTabUpload} disabled={!reqSubTabFile || reqSubTabUploading} className="h-8 px-4 border border-gray-300 rounded hover:bg-gray-50 text-xs disabled:opacity-50 disabled:cursor-not-allowed">{reqSubTabUploading ? 'Uploading...' : 'Upload'}</button>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <label className="text-xs font-semibold text-orange-500 w-20 text-right">Notes</label>
                <input type="text" value={reqSubTabNotes} onChange={(e) => setReqSubTabNotes(e.target.value)} className="h-8 w-64 px-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <div className="w-[186px]"></div>
              </div>
            </div>
            <div className="border rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-600">
                    <th className={thClass}>File Name</th>
                    <th className={thClass}>Uploaded On</th>
                    <th className={thClass}>Size</th>
                    <th className={thClass}>Notes</th>
                    <th className={thClass}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reqSubTabDocs.length === 0 ? (
                    <tr><td colSpan={5} className="px-3 py-8 text-center text-gray-400 text-xs">No files uploaded</td></tr>
                  ) : (
                    reqSubTabDocs.map((doc: any, index: number) => (
                      <tr key={doc.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className={`${tdClass} text-blue-600`}>{doc.file_name || '-'}</td>
                        <td className={tdClass}>{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : '-'}</td>
                        <td className={tdClass}>{doc.file_size ? `${(doc.file_size / 1024).toFixed(2)} Kb` : '-'}</td>
                        <td className={tdClass}>{doc.description || '-'}</td>
                        <td className={tdClass}>
                          <div className="flex gap-1 justify-center">
                            <button type="button" onClick={() => handleReqSubTabDeleteDoc(doc.id)} className="p-1 text-red-600 hover:bg-red-50 rounded border border-gray-300"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Workflow & Audit Trail */}
        {reqSubTab === 'workflow-audit-trail' && (
          <div className="text-center py-8 text-gray-500 text-sm">Workflow & Audit Trail content</div>
        )}
      </div>

      {/* Follow-Up Modal */}
      {showReqFollowUpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 bg-blue-900">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wide">NEW ACTIVITY</h3>
                <button onClick={() => setShowReqPreviousActivities(!showReqPreviousActivities)} className="px-3 py-1 text-xs font-medium text-blue-900 bg-blue-500 rounded hover:bg-blue-400">View Previous Activities</button>
              </div>
              <button onClick={() => setShowReqFollowUpModal(false)} className="text-white hover:text-gray-300"><X className="w-5 h-5" /></button>
            </div>
            {/* Body */}
            <div className="p-5">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {/* Contact */}
                <div>
                  <label className="text-xs font-medium text-blue-600 block mb-1">Contact</label>
                  <select
                    value={reqFollowUpForm.contact_id}
                    onChange={(e) => {
                      const contactId = e.target.value;
                      const selectedContact = reqContacts.find((c: any) => c.id?.toString() === contactId);
                      setReqFollowUpForm({
                        ...reqFollowUpForm,
                        contact_id: contactId,
                        sent_to: selectedContact?.email || ''
                      });
                    }}
                    className="w-full h-8 px-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select Contact</option>
                    {reqContacts.map((contact: any) => (
                      <option key={contact.id} value={contact.id}>{`${contact.first_name || ''} ${contact.last_name || ''}`.trim()}</option>
                    ))}
                  </select>
                </div>
                {/* Activity Subject */}
                <div>
                  <label className="text-xs font-medium text-blue-600 block mb-1">Activity Subject</label>
                  <input value={reqFollowUpForm.subject} onChange={(e) => setReqFollowUpForm({ ...reqFollowUpForm, subject: e.target.value })} className="w-full h-8 px-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                {/* Email */}
                <div>
                  <label className="text-xs font-medium text-blue-600 block mb-1">Email</label>
                  <input value={reqFollowUpForm.sent_to} onChange={(e) => setReqFollowUpForm({ ...reqFollowUpForm, sent_to: e.target.value })} className="w-full h-8 px-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500" readOnly />
                </div>
                {/* Activity Type */}
                <div>
                  <label className="text-xs font-medium text-blue-600 block mb-1">Activity Type</label>
                  <select value={reqFollowUpForm.activity_type} onChange={(e) => setReqFollowUpForm({ ...reqFollowUpForm, activity_type: e.target.value })} className="w-full h-8 px-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="">Select</option>
                    <option value="Call">Call</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Email">Email</option>
                    <option value="Task">Task</option>
                  </select>
                </div>
                {/* Start Date / Time */}
                <div>
                  <label className="text-xs font-medium text-blue-600 block mb-1">Start Date / Time</label>
                  <div className="flex gap-2">
                    <input type="date" value={reqFollowUpForm.start_date} onChange={(e) => setReqFollowUpForm({ ...reqFollowUpForm, start_date: e.target.value })} className="flex-1 h-8 px-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    <input type="time" value={reqFollowUpForm.start_time} onChange={(e) => setReqFollowUpForm({ ...reqFollowUpForm, start_time: e.target.value })} className="w-28 h-8 px-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                </div>
                {/* Assigned To */}
                <div>
                  <label className="text-xs font-medium text-blue-600 block mb-1">Assigned To</label>
                  <select value={reqFollowUpForm.assigned_to} onChange={(e) => setReqFollowUpForm({ ...reqFollowUpForm, assigned_to: e.target.value })} className="w-full h-8 px-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="">Select User</option>
                    <option value="1">Admin User</option>
                    <option value="Junaid Ali">Junaid Ali</option>
                  </select>
                </div>
                {/* Next Follow Up Date */}
                <div>
                  <label className="text-xs font-medium text-blue-600 block mb-1">Next Follow Up Date</label>
                  <input type="date" value={reqFollowUpForm.next_followup_date} onChange={(e) => setReqFollowUpForm({ ...reqFollowUpForm, next_followup_date: e.target.value })} className="w-full h-8 px-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                {/* Status */}
                <div>
                  <label className="text-xs font-medium text-blue-600 block mb-1">Status</label>
                  <select value={reqFollowUpForm.status} onChange={(e) => setReqFollowUpForm({ ...reqFollowUpForm, status: e.target.value })} className="w-full h-8 px-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              {/* Description */}
              <div className="mt-4">
                <label className="text-xs font-medium text-blue-600 block mb-1">Description</label>
                {/* Rich Text Toolbar */}
                <div className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-t bg-white">
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); handleReqFollowUpExec('bold'); }} className="w-7 h-7 flex items-center justify-center font-bold text-sm hover:bg-gray-100 rounded" title="Bold">B</button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); handleReqFollowUpExec('italic'); }} className="w-7 h-7 flex items-center justify-center italic text-sm hover:bg-gray-100 rounded" title="Italic">I</button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); handleReqFollowUpExec('underline'); }} className="w-7 h-7 flex items-center justify-center underline text-sm hover:bg-gray-100 rounded" title="Underline">U</button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); handleReqFollowUpExec('hiliteColor', '#FFFF00'); }} className="w-7 h-7 flex items-center justify-center text-sm hover:bg-gray-100 rounded" title="Highlight"><Edit2 className="w-3.5 h-3.5" /></button>
                  <div className="w-px h-5 bg-gray-300 mx-1"></div>
                  <select onChange={(e) => { handleReqFollowUpExec('fontName', e.target.value); }} className="h-7 px-1 text-xs border border-gray-300 rounded bg-white cursor-pointer" defaultValue="jost">
                    <option value="jost">jost</option>
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                  </select>
                  <select onChange={(e) => { handleReqFollowUpExec('fontSize', e.target.value); }} className="h-7 px-1 text-xs border border-gray-300 rounded bg-white cursor-pointer" defaultValue="4">
                    <option value="1">8</option>
                    <option value="2">10</option>
                    <option value="3">12</option>
                    <option value="4">14</option>
                    <option value="5">18</option>
                    <option value="6">24</option>
                    <option value="7">36</option>
                  </select>
                  <div className="relative">
                    <button type="button" className="w-7 h-7 flex items-center justify-center text-sm font-bold hover:bg-gray-100 rounded bg-yellow-300" title="Text Color">A</button>
                    <input type="color" onChange={(e) => handleReqFollowUpExec('foreColor', e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="Text Color" />
                  </div>
                  <div className="w-px h-5 bg-gray-300 mx-1"></div>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); handleReqFollowUpExec('insertUnorderedList'); }} className="w-7 h-7 flex items-center justify-center text-sm hover:bg-gray-100 rounded" title="Bullet List">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="2" cy="4" r="1.5"/><circle cx="2" cy="8" r="1.5"/><circle cx="2" cy="12" r="1.5"/><rect x="5" y="3" width="10" height="2" rx="0.5"/><rect x="5" y="7" width="10" height="2" rx="0.5"/><rect x="5" y="11" width="10" height="2" rx="0.5"/></svg>
                  </button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); handleReqFollowUpExec('insertOrderedList'); }} className="w-7 h-7 flex items-center justify-center text-sm hover:bg-gray-100 rounded" title="Numbered List">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><text x="0" y="5" fontSize="5" fontWeight="bold">1</text><text x="0" y="9.5" fontSize="5" fontWeight="bold">2</text><text x="0" y="14" fontSize="5" fontWeight="bold">3</text><rect x="5" y="3" width="10" height="2" rx="0.5"/><rect x="5" y="7" width="10" height="2" rx="0.5"/><rect x="5" y="11" width="10" height="2" rx="0.5"/></svg>
                  </button>
                  <select onChange={(e) => { handleReqFollowUpExec(e.target.value === 'left' ? 'justifyLeft' : e.target.value === 'center' ? 'justifyCenter' : e.target.value === 'right' ? 'justifyRight' : 'justifyFull'); e.target.value = ''; }} className="h-7 px-1 text-xs border border-gray-300 rounded bg-white cursor-pointer">
                    <option value="">Align</option>
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                    <option value="justify">Justify</option>
                  </select>
                </div>
                {/* Rich Text Editor */}
                <div ref={reqFollowUpEditorRef} contentEditable className="w-full min-h-[180px] max-h-[300px] overflow-y-auto px-3 py-2 text-sm border border-t-0 border-gray-300 rounded-b focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white resize-y" style={{ fontFamily: 'jost, sans-serif', fontSize: '14px' }} suppressContentEditableWarning />
              </div>
              {/* Save Button */}
              <div className="flex justify-center mt-5">
                <button onClick={handleSaveReqFollowUp} className="px-6 py-2 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Memo Modal */}
      {showReqMemoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 bg-blue-900">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">MEMO DETAILS</h3>
              <button onClick={() => setShowReqMemoModal(false)} className="text-white hover:text-gray-300"><X className="w-5 h-5" /></button>
            </div>
            {/* Body */}
            <div className="p-5">
              {/* Toolbar */}
              <div className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-t bg-white">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); handleReqMemoExec('bold'); }} className="w-7 h-7 flex items-center justify-center font-bold text-sm hover:bg-gray-100 rounded" title="Bold">B</button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); handleReqMemoExec('italic'); }} className="w-7 h-7 flex items-center justify-center italic text-sm hover:bg-gray-100 rounded" title="Italic">I</button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); handleReqMemoExec('underline'); }} className="w-7 h-7 flex items-center justify-center underline text-sm hover:bg-gray-100 rounded" title="Underline">U</button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); handleReqMemoExec('hiliteColor', '#FFFF00'); }} className="w-7 h-7 flex items-center justify-center text-sm hover:bg-gray-100 rounded" title="Highlight">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-5 bg-gray-300 mx-1"></div>
                <select onChange={(e) => { handleReqMemoExec('fontName', e.target.value); }} className="h-7 px-1 text-xs border border-gray-300 rounded bg-white cursor-pointer" defaultValue="jost">
                  <option value="jost">jost</option>
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                </select>
                <select onChange={(e) => { handleReqMemoExec('fontSize', e.target.value); }} className="h-7 px-1 text-xs border border-gray-300 rounded bg-white cursor-pointer" defaultValue="4">
                  <option value="1">8</option>
                  <option value="2">10</option>
                  <option value="3">12</option>
                  <option value="4">14</option>
                  <option value="5">18</option>
                  <option value="6">24</option>
                  <option value="7">36</option>
                </select>
                <div className="relative">
                  <button type="button" className="w-7 h-7 flex items-center justify-center text-sm font-bold hover:bg-gray-100 rounded bg-yellow-300" title="Text Color">A</button>
                  <input type="color" onChange={(e) => handleReqMemoExec('foreColor', e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="Text Color" />
                </div>
                <div className="w-px h-5 bg-gray-300 mx-1"></div>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); handleReqMemoExec('insertUnorderedList'); }} className="w-7 h-7 flex items-center justify-center text-sm hover:bg-gray-100 rounded" title="Bullet List">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="2" cy="4" r="1.5"/><circle cx="2" cy="8" r="1.5"/><circle cx="2" cy="12" r="1.5"/><rect x="5" y="3" width="10" height="2" rx="0.5"/><rect x="5" y="7" width="10" height="2" rx="0.5"/><rect x="5" y="11" width="10" height="2" rx="0.5"/></svg>
                </button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); handleReqMemoExec('insertOrderedList'); }} className="w-7 h-7 flex items-center justify-center text-sm hover:bg-gray-100 rounded" title="Numbered List">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><text x="0" y="5" fontSize="5" fontWeight="bold">1</text><text x="0" y="9.5" fontSize="5" fontWeight="bold">2</text><text x="0" y="14" fontSize="5" fontWeight="bold">3</text><rect x="5" y="3" width="10" height="2" rx="0.5"/><rect x="5" y="7" width="10" height="2" rx="0.5"/><rect x="5" y="11" width="10" height="2" rx="0.5"/></svg>
                </button>
                <select onChange={(e) => { handleReqMemoExec(e.target.value === 'left' ? 'justifyLeft' : e.target.value === 'center' ? 'justifyCenter' : e.target.value === 'right' ? 'justifyRight' : 'justifyFull'); e.target.value = ''; }} className="h-7 px-1 text-xs border border-gray-300 rounded bg-white cursor-pointer">
                  <option value="">Align</option>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                  <option value="justify">Justify</option>
                </select>
              </div>
              {/* Editor Area */}
              <div
                ref={reqMemoEditorRef}
                contentEditable
                className="w-full min-h-[220px] max-h-[400px] overflow-y-auto px-3 py-2 text-sm border border-t-0 border-gray-300 rounded-b focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white resize-y"
                style={{ fontFamily: 'jost, sans-serif', fontSize: '14px' }}
                suppressContentEditableWarning
              />
              {/* Save Button */}
              <div className="flex justify-center mt-5">
                <button onClick={handleSaveReqMemo} className="px-6 py-2 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============== Presentation Module Categories ==============
const PRESENTATION_MODULES: Record<string, string[]> = {
  'Customer': ['Customer Master', 'CRM', 'Campaign', 'Customer Survey'],
  'Supplier': ['Supplier Master', 'Vendor Master', 'Manufacturer Master', 'Price List'],
  'Inventory': ['Item Master', 'E-Commerce', 'Requisition', 'Shipping Instruction', 'Receiving', 'Discount', 'Return', 'Inventory'],
  'Orders': ['Inquiry', 'Quotation', 'Order', 'Fulfillment Priority', 'Order Fulfillment', 'Wave Pick', 'Order Tracking'],
  'Financials': ['Account Receivable', 'Account Payable', 'Journal Entry', 'Ledger', 'Payroll', 'Incentive', 'Banking', 'Asset Management', 'Account Statement', 'Tax Connect', 'Regulatory Compliance', 'Budgeting'],
  'HRM': ['Employee Master', 'Leave Master', 'Holiday Master', 'Recruitment', 'Appraisal', 'Bonus'],
  'Project': ['Task Management', 'Project Management', 'Timesheet'],
  'Reports': ['Customer', 'Crm', 'Supplier', 'Orders', 'Financials', 'HRM', 'Project', 'Inventory', 'Management', 'Business Intelligence'],
  'DMS': ['Return', 'Accounts', 'Supplier', 'Customer', 'Order', 'Quotation', 'Inquiry', 'Order Fulfillment', 'Other Folders', 'Item'],
  'My Info': ['Holiday Calendar', 'My Favorite', 'Leave Management', 'My Dashboard', 'Message Board', 'Notifications', 'Calendar', 'Attendance Management', 'Ticketing'],
  'Setup': ['Role Mgmt', 'Bank Master', 'Accounting', 'Configuration', 'Company Setup', 'User Mgmt', 'Option Master', 'Variant Master', 'Auto Scheduler', 'Form Management'],
};

// ============== Presentation Form ==============
function PresentationForm({ data, setData, crId, leadId, presentations, refreshData }: any) {
  const [presSubTab, setPresSubTab] = useState('presentation');
  const [emailsSent, setEmailsSent] = useState<any[]>([]);
  const [presDocs, setPresDocs] = useState<any[]>([]);
  const [presSelectedFile, setPresSelectedFile] = useState<File | null>(null);
  const [presUploading, setPresUploading] = useState(false);
  const presFileInputRef = React.useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [presContacts, setPresContacts] = useState<any[]>([]);

  // Module checkboxes state
  const [modules, setModules] = useState<Record<string, string[]>>(() => {
    try {
      if (presentations?.length > 0 && presentations[0].presentation_modules) {
        return JSON.parse(presentations[0].presentation_modules);
      }
    } catch {}
    return {};
  });

  // Sub-tab states
  const [presSubTabDocs, setPresSubTabDocs] = useState<any[]>([]);
  const [presSubTabFile, setPresSubTabFile] = useState<File | null>(null);
  const [presSubTabNotes, setPresSubTabNotes] = useState('');
  const [presSubTabUploading, setPresSubTabUploading] = useState(false);
  const presSubTabFileRef = React.useRef<HTMLInputElement>(null);
  const [presFollowUps, setPresFollowUps] = useState<any[]>([]);
  const [showPresFollowUpModal, setShowPresFollowUpModal] = useState(false);
  const [editingPresFollowUp, setEditingPresFollowUp] = useState<any>(null);
  const [presFollowUpForm, setPresFollowUpForm] = useState({
    activity_type: '', subject: '', start_date: '', start_time: '', end_date: '', end_time: '', description: '', status: 'Open', contact_id: '', assigned_to: '', priority: '', next_followup_date: '', next_followup_time: '', channel_type: '', sent_to: '',
  });
  const [presMemos, setPresMemos] = useState<any[]>([]);
  const [showPresMemoModal, setShowPresMemoModal] = useState(false);
  const [editingPresMemo, setEditingPresMemo] = useState<any>(null);
  const [presMemoForm, setPresMemoForm] = useState({ content: '' });
  const presMemoEditorRef = React.useRef<HTMLDivElement>(null);
  const presFollowUpEditorRef = React.useRef<HTMLDivElement>(null);
  const [showPreviousActivities, setShowPreviousActivities] = useState(false);

  // Load contacts
  useEffect(() => {
    if (leadId) {
      api.getLeadContactsForEdit(leadId).then(setPresContacts).catch(() => setPresContacts([]));
    }
  }, [leadId]);

  // Load documents
  useEffect(() => {
    if (crId) {
      api.getCRDocuments(crId, 'presentation').then(setPresDocs).catch(() => setPresDocs([]));
    }
  }, [crId]);

  // Load sub-tab data
  useEffect(() => {
    if (crId && presSubTab === 'follow-up') {
      api.getCRActivities(crId, 'presentation-followup').then(setPresFollowUps).catch(() => setPresFollowUps([]));
    }
  }, [crId, presSubTab]);

  useEffect(() => {
    if (crId && presSubTab === 'memo') {
      api.getCRMemos(crId, 'presentation').then(setPresMemos).catch(() => setPresMemos([]));
    }
  }, [crId, presSubTab]);

  useEffect(() => {
    if (crId && presSubTab === 'upload-file') {
      api.getCRDocuments(crId, 'presentation-upload').then(setPresSubTabDocs).catch(() => setPresSubTabDocs([]));
    }
  }, [crId, presSubTab]);

  // Sync modules from presentations prop
  useEffect(() => {
    try {
      if (presentations?.length > 0 && presentations[0].presentation_modules) {
        setModules(JSON.parse(presentations[0].presentation_modules));
      }
    } catch {}
  }, [presentations]);

  // Document handlers
  const handlePresChooseFile = () => presFileInputRef.current?.click();
  const handlePresFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.length) setPresSelectedFile(e.target.files[0]); };
  const handlePresUploadFile = async () => {
    if (!presSelectedFile || !crId) { alert(!presSelectedFile ? 'Please choose a file first' : 'Please save the customer requirement first'); return; }
    setPresUploading(true);
    try {
      await api.uploadCRDocument(crId, presSelectedFile, 'presentation', 'Details');
      const docs = await api.getCRDocuments(crId, 'presentation');
      setPresDocs(docs);
      setPresSelectedFile(null);
      if (presFileInputRef.current) presFileInputRef.current.value = '';
    } catch (err: any) { alert(err?.response?.data?.detail || 'Failed to upload file'); } finally { setPresUploading(false); }
  };
  const handlePresDeleteDoc = async (docId: number) => {
    if (!crId || !confirm('Are you sure you want to delete this document?')) return;
    try { await api.deleteCRDocument(crId, docId); setPresDocs(presDocs.filter((d: any) => d.id !== docId)); } catch { alert('Failed to delete document'); }
  };

  // Sub-tab upload handlers
  const handlePresSubTabChooseFile = () => presSubTabFileRef.current?.click();
  const handlePresSubTabFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.length) setPresSubTabFile(e.target.files[0]); };
  const handlePresSubTabUpload = async () => {
    if (!presSubTabFile || !crId) { alert(!presSubTabFile ? 'Please choose a file first' : 'Please save the customer requirement first'); return; }
    setPresSubTabUploading(true);
    try {
      await api.uploadCRDocument(crId, presSubTabFile, 'presentation-upload', 'Upload File');
      const docs = await api.getCRDocuments(crId, 'presentation-upload');
      setPresSubTabDocs(docs);
      setPresSubTabFile(null); setPresSubTabNotes('');
      if (presSubTabFileRef.current) presSubTabFileRef.current.value = '';
    } catch (err: any) { alert(err?.response?.data?.detail || 'Failed to upload file'); } finally { setPresSubTabUploading(false); }
  };
  const handlePresSubTabDeleteDoc = async (docId: number) => {
    if (!crId || !confirm('Are you sure you want to delete this document?')) return;
    try { await api.deleteCRDocument(crId, docId); setPresSubTabDocs(presSubTabDocs.filter((d: any) => d.id !== docId)); } catch { alert('Failed to delete document'); }
  };

  // Follow-up handlers
  const handleOpenPresFollowUp = (item?: any) => {
    if (item) { setEditingPresFollowUp(item); setPresFollowUpForm({ activity_type: item.activity_type || '', subject: item.subject || '', start_date: item.start_date || '', start_time: item.start_time || '', end_date: item.end_date || '', end_time: item.end_time || '', description: item.description || '', status: item.status || 'Open', contact_id: item.contact_id?.toString() || '', assigned_to: item.assigned_to?.toString() || '', priority: item.priority || '', next_followup_date: item.next_followup_date || '', next_followup_time: item.next_followup_time || '', channel_type: item.channel_type || '', sent_to: item.sent_to || '' }); }
    else { setEditingPresFollowUp(null); const now = new Date(); setPresFollowUpForm({ activity_type: '', subject: '', start_date: now.toISOString().split('T')[0], start_time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }), end_date: now.toISOString().split('T')[0], end_time: '', description: '', status: 'Open', contact_id: '', assigned_to: '', priority: '', next_followup_date: now.toISOString().split('T')[0], next_followup_time: '', channel_type: '', sent_to: '' }); }
    setShowPresFollowUpModal(true);
    setTimeout(() => {
      if (presFollowUpEditorRef.current) {
        presFollowUpEditorRef.current.innerHTML = item?.description || '';
      }
    }, 50);
  };
  const handlePresFollowUpExec = (command: string, value?: string) => {
    document.execCommand(command, false, value || '');
    presFollowUpEditorRef.current?.focus();
  };
  const handleSavePresFollowUp = async () => {
    if (!crId) return;
    const descriptionContent = presFollowUpEditorRef.current?.innerHTML || presFollowUpForm.description;
    const formToSave = { ...presFollowUpForm, description: descriptionContent };
    try {
      if (editingPresFollowUp) { const updated = await api.updateCRActivity(crId, editingPresFollowUp.id, formToSave); setPresFollowUps(presFollowUps.map((a: any) => a.id === editingPresFollowUp.id ? updated : a)); }
      else { const created = await api.createCRActivity(crId, { ...formToSave, tab_name: 'presentation-followup' }); setPresFollowUps([...presFollowUps, created]); }
      setShowPresFollowUpModal(false); setEditingPresFollowUp(null);
    } catch (err: any) { alert(err?.response?.data?.detail || 'Failed to save follow-up'); }
  };
  const handleDeletePresFollowUp = async (id: number) => {
    if (!crId || !confirm('Are you sure?')) return;
    try { await api.deleteCRActivity(crId, id); setPresFollowUps(presFollowUps.filter((a: any) => a.id !== id)); } catch { alert('Failed to delete'); }
  };

  // Memo handlers
  const handleOpenPresMemo = (item?: any) => {
    if (item) { setEditingPresMemo(item); setPresMemoForm({ content: item.content || '' }); }
    else { setEditingPresMemo(null); setPresMemoForm({ content: '' }); }
    setShowPresMemoModal(true);
    setTimeout(() => {
      if (presMemoEditorRef.current) {
        presMemoEditorRef.current.innerHTML = item?.content || '';
      }
    }, 50);
  };
  const handlePresMemoExec = (command: string, value?: string) => {
    document.execCommand(command, false, value || '');
    presMemoEditorRef.current?.focus();
  };
  const handleSavePresMemo = async () => {
    if (!crId) return;
    const content = presMemoEditorRef.current?.innerHTML || presMemoForm.content;
    const payload = { content };
    try {
      if (editingPresMemo) { const updated = await api.updateCRMemo(crId, editingPresMemo.id, payload); setPresMemos(presMemos.map((m: any) => m.id === editingPresMemo.id ? updated : m)); }
      else { const created = await api.createCRMemo(crId, { ...payload, tab_name: 'presentation' }); setPresMemos([...presMemos, created]); }
      setShowPresMemoModal(false); setEditingPresMemo(null);
    } catch (err: any) { alert(err?.response?.data?.detail || 'Failed to save memo'); }
  };
  const handleDeletePresMemo = async (id: number) => {
    if (!crId || !confirm('Are you sure?')) return;
    try { await api.deleteCRMemo(crId, id); setPresMemos(presMemos.filter((m: any) => m.id !== id)); } catch { alert('Failed to delete'); }
  };

  // Module checkbox handlers
  const toggleModule = (category: string, item: string) => {
    setModules(prev => {
      const catItems = prev[category] || [];
      const updated = catItems.includes(item)
        ? catItems.filter(i => i !== item)
        : [...catItems, item];
      return { ...prev, [category]: updated };
    });
  };

  const toggleCategory = (category: string) => {
    setModules(prev => {
      const allItems = PRESENTATION_MODULES[category];
      const catItems = prev[category] || [];
      const allSelected = allItems.every(i => catItems.includes(i));
      return { ...prev, [category]: allSelected ? [] : [...allItems] };
    });
  };

  const handleSaveModules = async () => {
    if (!crId) return;
    setSaving(true);
    try {
      const payload = { presentation_modules: JSON.stringify(modules), status: 'scheduled' };
      if (presentations?.length > 0) {
        await api.updateCRPresentation(crId, presentations[0].id, payload);
      } else {
        await api.createCRPresentation(crId, payload);
      }
      refreshData();
    } catch (err: any) { alert(err?.response?.data?.detail || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleRefresh = () => {
    try {
      if (presentations?.length > 0 && presentations[0].presentation_modules) {
        setModules(JSON.parse(presentations[0].presentation_modules));
      } else {
        setModules({});
      }
    } catch { setModules({}); }
  };

  const fieldLabelClass = "text-xs font-medium text-blue-600 w-32 flex-shrink-0";
  const fieldInputClass = "flex-1 h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50";
  const fieldSelectClass = "flex-1 h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50";
  const rowClass = "flex items-center gap-2 mb-2";
  const thClass = "px-3 py-2 text-left text-xs font-medium text-white bg-blue-600 border-r border-blue-500 last:border-r-0";
  const tdClass = "px-3 py-2 text-xs border-b border-gray-200";

  const presSubTabs = ['Presentation', 'Process Flow', 'Link', 'Demo Date', 'Questions', 'Summary', 'Follow-Up', 'Memo', 'Upload File', 'Workflow & Audit Trail'];

  return (
    <div className="space-y-4">
      {/* Top Form Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-1">
          <div className={rowClass}>
            <label className={fieldLabelClass}>Company Name</label>
            <input type="text" value={data?.company_name || ''} onChange={(e) => setData({ ...data, company_name: e.target.value })} className={fieldInputClass} />
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Contact Name</label>
            <select value={data?.contact_id || ''} onChange={(e) => setData({ ...data, contact_id: e.target.value })} className={fieldSelectClass}>
              <option value="">Select Contact Name</option>
              <option value="1">Contact 1</option>
              <option value="2">Contact 2</option>
            </select>
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Email Format / Type</label>
            <select value={data?.pres_email_format || ''} onChange={(e) => setData({ ...data, pres_email_format: e.target.value })} className="flex-1 h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50">
              <option value="">Email with Product Details and Fix Time for Demo</option>
              <option value="product-demo">Email with Product Details and Fix Time for Demo</option>
              <option value="presentation">Presentation Email</option>
              <option value="followup">Follow-up Email</option>
            </select>
            <button className="h-8 px-3 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1">
              <Mail className="w-4 h-4" />
            </button>
          </div>
          {/* Email Sent To Table */}
          <div className="mt-3 border rounded overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-600">
                  <th className={thClass}>Email Sent To</th>
                  <th className={thClass}>Attachments</th>
                  <th className={thClass}>Sent On</th>
                  <th className={thClass}>Action</th>
                </tr>
              </thead>
              <tbody>
                {emailsSent.length === 0 ? (
                  <tr><td colSpan={4} className="px-3 py-4 text-center text-gray-400 text-xs">No emails sent</td></tr>
                ) : (
                  emailsSent.map((email: any, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className={tdClass}>{email.to}</td>
                      <td className={tdClass}>{email.attachments || '-'}</td>
                      <td className={tdClass}>{email.sent_on}</td>
                      <td className={tdClass}>
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-3 h-3" /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-1">
          <div className={rowClass}>
            <label className={fieldLabelClass}>Branch Office</label>
            <input type="text" value={data?.branch_office || ''} onChange={(e) => setData({ ...data, branch_office: e.target.value })} className={fieldInputClass} placeholder="Branch Office" />
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Contact Email</label>
            <input type="email" value={data?.contact_email || ''} onChange={(e) => setData({ ...data, contact_email: e.target.value })} className={fieldInputClass} />
          </div>
          <div className={rowClass}>
            <label className={fieldLabelClass}>Document</label>
            <input type="text" className={fieldInputClass} readOnly value={presSelectedFile?.name || ''} placeholder="No file chosen" />
            <input ref={presFileInputRef} type="file" onChange={handlePresFileChange} className="hidden" style={{ display: 'none' }} />
            <button type="button" onClick={handlePresChooseFile} className="h-8 px-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs flex items-center gap-1">
              <Upload className="w-3 h-3" /> Choose File
            </button>
            <button type="button" onClick={handlePresUploadFile} disabled={!presSelectedFile || presUploading} className="h-8 px-3 border border-gray-300 rounded hover:bg-gray-50 text-xs disabled:opacity-50 disabled:cursor-not-allowed">
              {presUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          {/* Documents Table */}
          <div className="mt-3 border rounded overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-600">
                  <th className={thClass}>File Name</th>
                  <th className={thClass}>Link</th>
                  <th className={thClass}>Size</th>
                  <th className={thClass}>Upload On</th>
                  <th className={thClass}>Action</th>
                </tr>
              </thead>
              <tbody>
                {presDocs.length === 0 ? (
                  <tr><td colSpan={5} className="px-3 py-4 text-center text-gray-400 text-xs">No documents uploaded</td></tr>
                ) : (
                  presDocs.map((doc: any, index: number) => (
                    <tr key={doc.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className={`${tdClass} text-blue-600`}>{doc.file_name}</td>
                      <td className={`${tdClass} text-blue-600`}>
                        {doc.file_path ? (
                          <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/${doc.file_path}`} target="_blank" rel="noopener noreferrer" className="hover:underline">View</a>
                        ) : '-'}
                      </td>
                      <td className={tdClass}>{doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : '-'}</td>
                      <td className={tdClass}>{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : '-'}</td>
                      <td className={tdClass}>
                        <div className="flex gap-1 justify-center">
                          <button type="button" onClick={() => handlePresDeleteDoc(doc.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sub-tabs Section */}
      <div className="border-t pt-4">
        <div className="flex gap-4 mb-4">
          {presSubTabs.map((tab) => {
            const tabKey = tab.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
            const isActive = presSubTab === tabKey;
            return (
              <button
                key={tab}
                onClick={() => setPresSubTab(tabKey)}
                className={`px-2 py-1 text-xs font-medium border-b-2 ${
                  isActive
                    ? 'border-blue-600 text-blue-600 bg-blue-50 rounded-t'
                    : 'border-transparent text-orange-500 hover:text-orange-600'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Presentation Sub-tab - Module Checkboxes */}
        {presSubTab === 'presentation' && (
          <div className="space-y-5">
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(PRESENTATION_MODULES).map(([category, items]) => {
                const catItems = modules[category] || [];
                const allSelected = items.every(i => catItems.includes(i));
                return (
                  <div key={category} className="border rounded overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-800 text-white">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={() => toggleCategory(category)}
                        className="w-3.5 h-3.5 rounded cursor-pointer"
                      />
                      <span className="text-xs font-bold">{category}</span>
                    </div>
                    <div className="p-2 space-y-1 bg-white">
                      {items.map((item) => (
                        <label key={item} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded">
                          <input
                            type="checkbox"
                            checked={catItems.includes(item)}
                            onChange={() => toggleModule(category, item)}
                            className="w-3.5 h-3.5 rounded cursor-pointer"
                          />
                          <span className="text-xs text-blue-600">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Bottom Buttons */}
            <div className="flex justify-center gap-3 pt-3">
              <button onClick={handleSaveModules} disabled={saving} className="px-5 py-2 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
                Generate Presentation
              </button>
              <button onClick={handleRefresh} className="px-5 py-2 text-sm font-medium text-white bg-gray-800 rounded hover:bg-gray-900">
                Refresh
              </button>
            </div>
          </div>
        )}

        {/* Process Flow Sub-tab */}
        {presSubTab === 'process-flow' && (() => {
          const boxStyle = "px-4 py-2 border-2 border-blue-400 rounded text-xs text-blue-600 font-medium text-center bg-white min-w-[160px] whitespace-nowrap";
          const arrowDown = <div className="flex justify-center my-1"><svg width="12" height="20" viewBox="0 0 12 20"><line x1="6" y1="0" x2="6" y2="14" stroke="#6366f1" strokeWidth="2"/><polygon points="1,14 6,20 11,14" fill="#6366f1"/></svg></div>;
          const arrowRight = <div className="flex items-center mx-1"><svg width="24" height="12" viewBox="0 0 24 12"><line x1="0" y1="6" x2="18" y2="6" stroke="#6366f1" strokeWidth="2"/><polygon points="18,1 24,6 18,11" fill="#6366f1"/></svg></div>;
          const arrowBoth = <div className="flex items-center mx-1"><svg width="28" height="12" viewBox="0 0 28 12"><line x1="6" y1="6" x2="22" y2="6" stroke="#6366f1" strokeWidth="2"/><polygon points="6,1 0,6 6,11" fill="#6366f1"/><polygon points="22,1 28,6 22,11" fill="#6366f1"/></svg></div>;
          const colTitle = "text-sm font-bold text-blue-600 mb-3 text-center uppercase tracking-wide";
          return (
          <div className="space-y-8 overflow-x-auto pb-4">
            {/* Row 1: CUSTOMER, ORDERS, SUPPLIER, PROJECT */}
            <div className="flex gap-8 items-start justify-center min-w-[900px]">
              {/* CUSTOMER */}
              <div className="flex flex-col items-center">
                <h4 className={colTitle}>CUSTOMER</h4>
                <div className={boxStyle}>Pre - Lead</div>
                {arrowDown}
                <div className={boxStyle}>Lead</div>
                {arrowDown}
                <div className={boxStyle}>Quality Lead</div>
                {arrowDown}
                <div className={boxStyle}>Customer</div>
                {arrowDown}
                <div className="flex items-center">
                  <div className={boxStyle}>Customer Master</div>
                  {arrowRight}
                </div>
                {arrowDown}
                <div className={boxStyle}>Campaign</div>
                {arrowDown}
                <div className={boxStyle}>Customer Survey</div>
              </div>

              {/* ORDERS */}
              <div className="flex flex-col items-center mt-[168px]">
                <h4 className={colTitle}>ORDERS</h4>
                <div className={boxStyle}>Customer Inquiry</div>
                {arrowDown}
                <div className={boxStyle}>Supplier Inquiry</div>
                {arrowDown}
                <div className={boxStyle}>Supplier Quotation</div>
                {arrowDown}
                <div className={boxStyle}>Customer Quotation</div>
                {arrowDown}
                <div className={boxStyle}>Customer Order</div>
              </div>

              {/* SUPPLIER */}
              <div className="flex flex-col items-center mt-[168px]">
                <h4 className={colTitle}>SUPPLIER</h4>
                <div className={boxStyle}>Supplier Master</div>
                {arrowDown}
                <div className={boxStyle}>Vendor Master</div>
                {arrowDown}
                <div className={boxStyle}>Manufacturer Master</div>
                {arrowDown}
                <div className={boxStyle}>Price List</div>
              </div>

              {/* PROJECT */}
              <div className="flex flex-col items-center mt-[168px]">
                <h4 className={colTitle}>PROJECT</h4>
                <div className={boxStyle}>Task Management</div>
                {arrowDown}
                <div className={boxStyle}>Project Management</div>
                {arrowDown}
                <div className={boxStyle}>Timesheet</div>
              </div>
            </div>

            {/* Row 2: INVENTORY, ORDERS continued, FINANCIAL, E-COMMERCE + HRM */}
            <div className="flex gap-8 items-start justify-center min-w-[900px]">
              {/* INVENTORY */}
              <div className="flex flex-col items-center">
                <h4 className={colTitle}>INVENTORY</h4>
                <div className={boxStyle}>Item Master</div>
                {arrowDown}
                <div className="flex items-center">
                  <div className={boxStyle}>Shipping Instruction</div>
                  {arrowBoth}
                </div>
                {arrowDown}
                <div className={boxStyle}>Order Receiving</div>
                {arrowDown}
                <div className="flex items-center">
                  <div className={boxStyle}>Inventory</div>
                  {arrowRight}
                </div>
                {arrowDown}
                <div className={boxStyle}>Return Receive</div>
                {arrowDown}
                <div className={boxStyle}>Return Authorization</div>
              </div>

              {/* ORDERS continued */}
              <div className="flex flex-col items-center mt-[36px]">
                <div className="flex items-center">
                  <div className={boxStyle}>Supplier Purchase Order</div>
                </div>
                {arrowDown}
                <div className={boxStyle}>Order Priority</div>
                {arrowDown}
                <div className="flex items-center">
                  <div className={boxStyle}>Order Pick - Pack</div>
                  {arrowRight}
                </div>
                {arrowDown}
                <div className={boxStyle}>Order Shipping</div>
                {arrowDown}
                <div className={boxStyle}>Order Tracking</div>
              </div>

              {/* FINANCIAL */}
              <div className="flex flex-col items-center">
                <h4 className={colTitle}>FINANCIAL</h4>
                <div className={boxStyle}>Supplier Invoice</div>
                {arrowDown}
                <div className={boxStyle}>Supplier Payment</div>
                {arrowDown}
                <div className={boxStyle}>Sales Invoice</div>
                {arrowDown}
                <div className={boxStyle}>Customer Payment</div>
                {arrowDown}
                <div className="flex items-center">
                  <div className={boxStyle}>Employee Payroll</div>
                  {arrowBoth}
                </div>
                {arrowDown}
                <div className={boxStyle}>Salary Payment</div>
                {arrowDown}
                <div className={boxStyle}>Tax Payment</div>
                {arrowDown}
                <div className={boxStyle}>Bank Reconciliation</div>
              </div>

              {/* E-COMMERCE + HRM */}
              <div className="flex flex-col items-center">
                <h4 className={colTitle}>E-COMMERCE</h4>
                <div className={boxStyle}>E-Commerce</div>
                {arrowDown}
                <div className={boxStyle}>Credit Card Payment</div>
                <div className="mt-6">
                  <h4 className={colTitle}>HRM</h4>
                  <div className="flex flex-col items-center">
                    <div className={boxStyle}>Recruitment</div>
                    {arrowDown}
                    <div className={boxStyle}>Employee Master</div>
                    {arrowDown}
                    <div className={boxStyle}>Leave Management</div>
                    {arrowDown}
                    <div className={boxStyle}>Employee Assessment</div>
                    {arrowDown}
                    <div className={boxStyle}>Bonus - Increment</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: DOCUMENT MANAGEMENT, FINANCIAL continued, HRM continued */}
            <div className="flex gap-8 items-start justify-center min-w-[900px]">
              {/* DOCUMENT MANAGEMENT */}
              <div className="flex flex-col items-center">
                <h4 className={colTitle}>DOCUMENT MANAGEMENT</h4>
                <div className={boxStyle}>Inquiry</div>
                {arrowDown}
                <div className={boxStyle}>Quotation</div>
                {arrowDown}
                <div className={boxStyle}>Order</div>
                {arrowDown}
                <div className={boxStyle}>Customer</div>
                {arrowDown}
                <div className={boxStyle}>Supplier</div>
                {arrowDown}
                <div className={boxStyle}>Accounts</div>
                {arrowDown}
                <div className={boxStyle}>Order Fulfillment</div>
                {arrowDown}
                <div className={boxStyle}>Return</div>
              </div>

              {/* Spacer */}
              <div className="min-w-[160px]"></div>

              {/* FINANCIAL continued */}
              <div className="flex flex-col items-center">
                <div className={boxStyle}>Journal Ledger</div>
                {arrowDown}
                <div className={boxStyle}>Ledger</div>
                {arrowDown}
                <div className={boxStyle}>Fixed Asset</div>
                {arrowDown}
                <div className={boxStyle}>Account Statements</div>
                {arrowDown}
                <div className={boxStyle}>Tax Return</div>
                {arrowDown}
                <div className={boxStyle}>Tax Payment</div>
                {arrowDown}
                <div className={boxStyle}>Budget</div>
              </div>

              {/* HRM continued */}
              <div className="flex flex-col items-center">
                <div className={boxStyle}>Holiday Master</div>
              </div>
            </div>

            {/* Generate PDF Button */}
            <div className="flex justify-center mt-6">
              <button className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
                Generate PDF
              </button>
            </div>
          </div>
          );
        })()}

        {/* Link Sub-tab */}
        {presSubTab === 'link' && (
          <div className="space-y-3">
            <div className="border rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-700">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-white border-r border-blue-600 w-1/3">Module / Sub-Module</th>
                    <th className="px-4 py-2.5 text-center text-xs font-medium text-white">Presentation Link</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const selectedModules: { category: string; item: string }[] = [];
                    Object.entries(modules).forEach(([category, items]) => {
                      (items || []).forEach((item: string) => {
                        selectedModules.push({ category, item });
                      });
                    });
                    if (selectedModules.length === 0) {
                      return <tr><td colSpan={2} className="px-4 py-6 text-center text-gray-400 text-xs">No Data Found</td></tr>;
                    }
                    return selectedModules.map((mod, index) => (
                      <tr key={`${mod.category}-${mod.item}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2 text-xs border-b border-gray-200 text-blue-600">{mod.category} / {mod.item}</td>
                        <td className="px-4 py-2 text-xs border-b border-gray-200 text-center text-blue-600">-</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Demo Date Sub-tab */}
        {presSubTab === 'demo-date' && (
          <div className="p-4 text-center text-gray-500 text-sm">Demo Date content</div>
        )}

        {/* Questions Sub-tab */}
        {presSubTab === 'questions' && (
          <div className="p-4 text-center text-gray-500 text-sm">Questions content</div>
        )}

        {/* Summary Sub-tab */}
        {presSubTab === 'summary' && (
          <div className="p-4 text-center text-gray-500 text-sm">Summary content</div>
        )}

        {/* Follow-Up Sub-tab */}
        {presSubTab === 'follow-up' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-blue-600">FOLLOW-UP</h4>
              <button onClick={() => handleOpenPresFollowUp()} className="px-4 py-1.5 text-xs border border-gray-400 rounded hover:bg-gray-50">Add Activity</button>
            </div>
            <div className="border rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-600">
                    <th className={thClass}>S.No</th>
                    <th className={thClass}>Activity Type</th>
                    <th className={thClass}>Subject</th>
                    <th className={thClass}>Start Date</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}>Priority</th>
                    <th className={thClass}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {presFollowUps.length === 0 ? (
                    <tr><td colSpan={7} className="px-3 py-4 text-center text-gray-400 text-xs">No follow-up activities</td></tr>
                  ) : (
                    presFollowUps.map((activity: any, index: number) => (
                      <tr key={activity.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className={tdClass}>{index + 1}</td>
                        <td className={`${tdClass} text-blue-600`}>{activity.activity_type || '-'}</td>
                        <td className={tdClass}>{activity.subject || '-'}</td>
                        <td className={tdClass}>{activity.start_date || '-'}</td>
                        <td className={tdClass}><span className={`px-2 py-0.5 text-xs rounded ${activity.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{activity.status}</span></td>
                        <td className={tdClass}>{activity.priority || '-'}</td>
                        <td className={tdClass}>
                          <div className="flex gap-1">
                            <button onClick={() => handleOpenPresFollowUp(activity)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded border border-blue-200"><Edit2 className="w-3 h-3" /></button>
                            <button onClick={() => handleDeletePresFollowUp(activity.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-red-200"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Memo Sub-tab */}
        {presSubTab === 'memo' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-blue-600">MEMOS</h4>
              <button onClick={() => handleOpenPresMemo()} className="px-4 py-1.5 text-xs border border-gray-400 rounded hover:bg-gray-50">Add Memo</button>
            </div>
            <div className="border rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-600">
                    <th className={thClass}>S.No</th>
                    <th className={thClass}>Content</th>
                    <th className={thClass}>Created At</th>
                    <th className={thClass}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {presMemos.length === 0 ? (
                    <tr><td colSpan={4} className="px-3 py-4 text-center text-gray-400 text-xs">No memos</td></tr>
                  ) : (
                    presMemos.map((memo: any, index: number) => (
                      <tr key={memo.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className={tdClass}>{index + 1}</td>
                        <td className={tdClass}><div dangerouslySetInnerHTML={{ __html: memo.content || '-' }} className="max-w-md truncate text-xs" /></td>
                        <td className={tdClass}>{memo.created_at ? new Date(memo.created_at).toLocaleDateString() : '-'}</td>
                        <td className={tdClass}>
                          <div className="flex gap-1">
                            <button onClick={() => handleOpenPresMemo(memo)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded border border-blue-200"><Edit2 className="w-3 h-3" /></button>
                            <button onClick={() => handleDeletePresMemo(memo.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-red-200"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Upload File Sub-tab */}
        {presSubTab === 'upload-file' && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-3">
              <label className="text-xs font-medium text-blue-600">File:</label>
              <input type="text" className="h-8 w-64 px-2 text-sm border border-gray-300 rounded bg-gray-50" readOnly value={presSubTabFile?.name || ''} />
              <input ref={presSubTabFileRef} type="file" onChange={handlePresSubTabFileChange} className="hidden" style={{ display: 'none' }} />
              <button type="button" onClick={handlePresSubTabChooseFile} className="h-8 px-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs flex items-center gap-1"><Upload className="w-3 h-3" /> Choose File</button>
              <button type="button" onClick={handlePresSubTabUpload} disabled={!presSubTabFile || presSubTabUploading} className="h-8 px-4 border border-gray-300 rounded hover:bg-gray-50 text-xs disabled:opacity-50 disabled:cursor-not-allowed">{presSubTabUploading ? 'Uploading...' : 'Upload'}</button>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <label className="text-xs font-medium text-blue-600">Notes:</label>
              <input type="text" value={presSubTabNotes} onChange={(e) => setPresSubTabNotes(e.target.value)} className="h-8 w-64 px-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div className="border rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-600">
                    <th className={thClass}>S.No</th>
                    <th className={thClass}>File Name</th>
                    <th className={thClass}>Link</th>
                    <th className={thClass}>Size</th>
                    <th className={thClass}>Upload On</th>
                    <th className={thClass}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {presSubTabDocs.length === 0 ? (
                    <tr><td colSpan={6} className="px-3 py-4 text-center text-gray-400 text-xs">No files uploaded</td></tr>
                  ) : (
                    presSubTabDocs.map((doc: any, index: number) => (
                      <tr key={doc.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className={tdClass}>{index + 1}</td>
                        <td className={`${tdClass} text-blue-600`}>{doc.file_name}</td>
                        <td className={`${tdClass} text-blue-600`}>
                          {doc.file_path ? <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/${doc.file_path}`} target="_blank" rel="noopener noreferrer" className="hover:underline">View</a> : '-'}
                        </td>
                        <td className={tdClass}>{doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : '-'}</td>
                        <td className={tdClass}>{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : '-'}</td>
                        <td className={tdClass}>
                          <button onClick={() => handlePresSubTabDeleteDoc(doc.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3 h-3" /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Workflow & Audit Trail Sub-tab */}
        {presSubTab === 'workflow-audit-trail' && (
          <div className="p-4 text-center text-gray-500 text-sm">
            Workflow & Audit Trail - Activity logs will appear here.
          </div>
        )}
      </div>

      {/* Follow-Up Modal */}
      {showPresFollowUpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 bg-blue-900">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wide">NEW ACTIVITY</h3>
                <button onClick={() => setShowPreviousActivities(!showPreviousActivities)} className="px-3 py-1 text-xs font-medium text-blue-900 bg-blue-500 rounded hover:bg-blue-400">View Previous Activities</button>
              </div>
              <button onClick={() => setShowPresFollowUpModal(false)} className="text-white hover:text-gray-300"><X className="w-5 h-5" /></button>
            </div>
            {/* Body */}
            <div className="p-5">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {/* Contact */}
                <div>
                  <label className="text-xs font-medium text-blue-600 block mb-1">Contact</label>
                  <select
                    value={presFollowUpForm.contact_id}
                    onChange={(e) => {
                      const contactId = e.target.value;
                      const selectedContact = presContacts.find((c: any) => c.id?.toString() === contactId);
                      setPresFollowUpForm({
                        ...presFollowUpForm,
                        contact_id: contactId,
                        sent_to: selectedContact?.email || ''
                      });
                    }}
                    className="w-full h-8 px-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select Contact</option>
                    {presContacts.map((contact: any) => (
                      <option key={contact.id} value={contact.id}>{`${contact.first_name || ''} ${contact.last_name || ''}`.trim()}</option>
                    ))}
                  </select>
                </div>
                {/* Activity Subject */}
                <div>
                  <label className="text-xs font-medium text-blue-600 block mb-1">Activity Subject</label>
                  <input value={presFollowUpForm.subject} onChange={(e) => setPresFollowUpForm({ ...presFollowUpForm, subject: e.target.value })} className="w-full h-8 px-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                {/* Email */}
                <div>
                  <label className="text-xs font-medium text-blue-600 block mb-1">Email</label>
                  <input value={presFollowUpForm.sent_to} onChange={(e) => setPresFollowUpForm({ ...presFollowUpForm, sent_to: e.target.value })} className="w-full h-8 px-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500" readOnly />
                </div>
                {/* Activity Type */}
                <div>
                  <label className="text-xs font-medium text-blue-600 block mb-1">Activity Type</label>
                  <select value={presFollowUpForm.activity_type} onChange={(e) => setPresFollowUpForm({ ...presFollowUpForm, activity_type: e.target.value })} className="w-full h-8 px-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="">Select</option>
                    <option value="Call">Call</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Email">Email</option>
                    <option value="Task">Task</option>
                  </select>
                </div>
                {/* Start Date / Time */}
                <div>
                  <label className="text-xs font-medium text-blue-600 block mb-1">Start Date / Time</label>
                  <div className="flex gap-2">
                    <input type="date" value={presFollowUpForm.start_date} onChange={(e) => setPresFollowUpForm({ ...presFollowUpForm, start_date: e.target.value })} className="flex-1 h-8 px-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    <input type="time" value={presFollowUpForm.start_time} onChange={(e) => setPresFollowUpForm({ ...presFollowUpForm, start_time: e.target.value })} className="w-28 h-8 px-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                </div>
                {/* Assigned To */}
                <div>
                  <label className="text-xs font-medium text-blue-600 block mb-1">Assigned To</label>
                  <select value={presFollowUpForm.assigned_to} onChange={(e) => setPresFollowUpForm({ ...presFollowUpForm, assigned_to: e.target.value })} className="w-full h-8 px-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="">Select User</option>
                    <option value="1">Admin User</option>
                    <option value="Junaid Ali">Junaid Ali</option>
                  </select>
                </div>
                {/* Next Follow Up Date */}
                <div>
                  <label className="text-xs font-medium text-blue-600 block mb-1">Next Follow Up Date</label>
                  <input type="date" value={presFollowUpForm.next_followup_date} onChange={(e) => setPresFollowUpForm({ ...presFollowUpForm, next_followup_date: e.target.value })} className="w-full h-8 px-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                {/* Status */}
                <div>
                  <label className="text-xs font-medium text-blue-600 block mb-1">Status</label>
                  <select value={presFollowUpForm.status} onChange={(e) => setPresFollowUpForm({ ...presFollowUpForm, status: e.target.value })} className="w-full h-8 px-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              {/* Description */}
              <div className="mt-4">
                <label className="text-xs font-medium text-blue-600 block mb-1">Description</label>
                {/* Rich Text Toolbar */}
                <div className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-t bg-white">
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); handlePresFollowUpExec('bold'); }} className="w-7 h-7 flex items-center justify-center font-bold text-sm hover:bg-gray-100 rounded" title="Bold">B</button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); handlePresFollowUpExec('italic'); }} className="w-7 h-7 flex items-center justify-center italic text-sm hover:bg-gray-100 rounded" title="Italic">I</button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); handlePresFollowUpExec('underline'); }} className="w-7 h-7 flex items-center justify-center underline text-sm hover:bg-gray-100 rounded" title="Underline">U</button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); handlePresFollowUpExec('hiliteColor', '#FFFF00'); }} className="w-7 h-7 flex items-center justify-center text-sm hover:bg-gray-100 rounded" title="Highlight"><Edit2 className="w-3.5 h-3.5" /></button>
                  <div className="w-px h-5 bg-gray-300 mx-1"></div>
                  <select onChange={(e) => { handlePresFollowUpExec('fontName', e.target.value); }} className="h-7 px-1 text-xs border border-gray-300 rounded bg-white cursor-pointer" defaultValue="jost">
                    <option value="jost">jost</option>
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                  </select>
                  <select onChange={(e) => { handlePresFollowUpExec('fontSize', e.target.value); }} className="h-7 px-1 text-xs border border-gray-300 rounded bg-white cursor-pointer" defaultValue="4">
                    <option value="1">8</option>
                    <option value="2">10</option>
                    <option value="3">12</option>
                    <option value="4">14</option>
                    <option value="5">18</option>
                    <option value="6">24</option>
                    <option value="7">36</option>
                  </select>
                  <div className="relative">
                    <button type="button" className="w-7 h-7 flex items-center justify-center text-sm font-bold hover:bg-gray-100 rounded bg-yellow-300" title="Text Color">A</button>
                    <input type="color" onChange={(e) => handlePresFollowUpExec('foreColor', e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="Text Color" />
                  </div>
                  <div className="w-px h-5 bg-gray-300 mx-1"></div>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); handlePresFollowUpExec('insertUnorderedList'); }} className="w-7 h-7 flex items-center justify-center text-sm hover:bg-gray-100 rounded" title="Bullet List">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="2" cy="4" r="1.5"/><circle cx="2" cy="8" r="1.5"/><circle cx="2" cy="12" r="1.5"/><rect x="5" y="3" width="10" height="2" rx="0.5"/><rect x="5" y="7" width="10" height="2" rx="0.5"/><rect x="5" y="11" width="10" height="2" rx="0.5"/></svg>
                  </button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); handlePresFollowUpExec('insertOrderedList'); }} className="w-7 h-7 flex items-center justify-center text-sm hover:bg-gray-100 rounded" title="Numbered List">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><text x="0" y="5" fontSize="5" fontWeight="bold">1</text><text x="0" y="9.5" fontSize="5" fontWeight="bold">2</text><text x="0" y="14" fontSize="5" fontWeight="bold">3</text><rect x="5" y="3" width="10" height="2" rx="0.5"/><rect x="5" y="7" width="10" height="2" rx="0.5"/><rect x="5" y="11" width="10" height="2" rx="0.5"/></svg>
                  </button>
                  <select onChange={(e) => { handlePresFollowUpExec(e.target.value === 'left' ? 'justifyLeft' : e.target.value === 'center' ? 'justifyCenter' : e.target.value === 'right' ? 'justifyRight' : 'justifyFull'); e.target.value = ''; }} className="h-7 px-1 text-xs border border-gray-300 rounded bg-white cursor-pointer">
                    <option value="">Align</option>
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                    <option value="justify">Justify</option>
                  </select>
                </div>
                {/* Rich Text Editor */}
                <div ref={presFollowUpEditorRef} contentEditable className="w-full min-h-[180px] max-h-[300px] overflow-y-auto px-3 py-2 text-sm border border-t-0 border-gray-300 rounded-b focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white resize-y" style={{ fontFamily: 'jost, sans-serif', fontSize: '14px' }} suppressContentEditableWarning />
              </div>
              {/* Save Button */}
              <div className="flex justify-center mt-5">
                <button onClick={handleSavePresFollowUp} className="px-6 py-2 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Memo Modal */}
      {showPresMemoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-blue-900">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">MEMO DETAILS</h3>
              <button onClick={() => setShowPresMemoModal(false)} className="text-white hover:text-gray-300"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-t bg-white">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); handlePresMemoExec('bold'); }} className="w-7 h-7 flex items-center justify-center font-bold text-sm hover:bg-gray-100 rounded" title="Bold">B</button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); handlePresMemoExec('italic'); }} className="w-7 h-7 flex items-center justify-center italic text-sm hover:bg-gray-100 rounded" title="Italic">I</button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); handlePresMemoExec('underline'); }} className="w-7 h-7 flex items-center justify-center underline text-sm hover:bg-gray-100 rounded" title="Underline">U</button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); handlePresMemoExec('hiliteColor', '#FFFF00'); }} className="w-7 h-7 flex items-center justify-center text-sm hover:bg-gray-100 rounded" title="Highlight"><Edit2 className="w-3.5 h-3.5" /></button>
                <div className="w-px h-5 bg-gray-300 mx-1"></div>
                <select onChange={(e) => { handlePresMemoExec('fontName', e.target.value); }} className="h-7 px-1 text-xs border border-gray-300 rounded bg-white cursor-pointer" defaultValue="jost">
                  <option value="jost">jost</option><option value="Arial">Arial</option><option value="Times New Roman">Times New Roman</option><option value="Courier New">Courier New</option><option value="Georgia">Georgia</option><option value="Verdana">Verdana</option>
                </select>
                <select onChange={(e) => { handlePresMemoExec('fontSize', e.target.value); }} className="h-7 px-1 text-xs border border-gray-300 rounded bg-white cursor-pointer" defaultValue="4">
                  <option value="1">8</option><option value="2">10</option><option value="3">12</option><option value="4">14</option><option value="5">18</option><option value="6">24</option><option value="7">36</option>
                </select>
                <div className="relative">
                  <button type="button" className="w-7 h-7 flex items-center justify-center text-sm font-bold hover:bg-gray-100 rounded bg-yellow-300" title="Text Color">A</button>
                  <input type="color" onChange={(e) => handlePresMemoExec('foreColor', e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="Text Color" />
                </div>
                <div className="w-px h-5 bg-gray-300 mx-1"></div>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); handlePresMemoExec('insertUnorderedList'); }} className="w-7 h-7 flex items-center justify-center text-sm hover:bg-gray-100 rounded" title="Bullet List">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="2" cy="4" r="1.5"/><circle cx="2" cy="8" r="1.5"/><circle cx="2" cy="12" r="1.5"/><rect x="5" y="3" width="10" height="2" rx="0.5"/><rect x="5" y="7" width="10" height="2" rx="0.5"/><rect x="5" y="11" width="10" height="2" rx="0.5"/></svg>
                </button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); handlePresMemoExec('insertOrderedList'); }} className="w-7 h-7 flex items-center justify-center text-sm hover:bg-gray-100 rounded" title="Numbered List">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><text x="0" y="5" fontSize="5" fontWeight="bold">1</text><text x="0" y="9.5" fontSize="5" fontWeight="bold">2</text><text x="0" y="14" fontSize="5" fontWeight="bold">3</text><rect x="5" y="3" width="10" height="2" rx="0.5"/><rect x="5" y="7" width="10" height="2" rx="0.5"/><rect x="5" y="11" width="10" height="2" rx="0.5"/></svg>
                </button>
                <select onChange={(e) => { handlePresMemoExec(e.target.value === 'left' ? 'justifyLeft' : e.target.value === 'center' ? 'justifyCenter' : e.target.value === 'right' ? 'justifyRight' : 'justifyFull'); e.target.value = ''; }} className="h-7 px-1 text-xs border border-gray-300 rounded bg-white cursor-pointer">
                  <option value="">Align</option><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option><option value="justify">Justify</option>
                </select>
              </div>
              <div ref={presMemoEditorRef} contentEditable className="w-full min-h-[220px] max-h-[400px] overflow-y-auto px-3 py-2 text-sm border border-t-0 border-gray-300 rounded-b focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white resize-y" style={{ fontFamily: 'jost, sans-serif', fontSize: '14px' }} suppressContentEditableWarning />
              <div className="flex justify-center mt-5">
                <button onClick={handleSavePresMemo} className="px-6 py-2 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============== Demo List ==============
function DemoList({ demos, onAdd, onEdit, crId, refreshData }: any) {
  const thClass = "px-4 py-2.5 text-left text-xs font-medium text-white bg-blue-600 border-r border-blue-500 last:border-r-0";
  const tdClass = "px-4 py-2.5 text-xs border-b border-gray-200";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-blue-600">DEMOS</h3>
        <button onClick={onAdd} className="px-4 py-1.5 text-xs font-medium text-white bg-green-500 rounded hover:bg-green-600 flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Add New
        </button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className={thClass}>S.No</th>
              <th className={thClass}>Date</th>
              <th className={thClass}>Time</th>
              <th className={thClass}>Type</th>
              <th className={thClass}>Modules</th>
              <th className={thClass}>Location</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {demos.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500 text-sm bg-gray-50">No demos scheduled</td></tr>
            ) : (
              demos.map((demo: any, index: number) => (
                <tr key={demo.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className={tdClass}>{index + 1}</td>
                  <td className={`${tdClass} text-blue-600`}>{demo.demo_date || '-'}</td>
                  <td className={tdClass}>{demo.demo_time || '-'}</td>
                  <td className={`${tdClass} text-orange-600`}>{demo.demo_type || '-'}</td>
                  <td className={tdClass}>{demo.modules_to_demo || '-'}</td>
                  <td className={tdClass}>{demo.location || '-'}</td>
                  <td className={tdClass}><span className={`px-2 py-0.5 text-xs rounded ${demo.status === 'completed' ? 'bg-green-100 text-green-700' : demo.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{demo.status}</span></td>
                  <td className={tdClass}>
                    <button onClick={() => onEdit(demo)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded border border-blue-200"><Edit2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============== Proposal List ==============
function ProposalList({ proposals, onAdd, onEdit, crId, refreshData }: any) {
  const thClass = "px-4 py-2.5 text-left text-xs font-medium text-white bg-blue-600 border-r border-blue-500 last:border-r-0";
  const tdClass = "px-4 py-2.5 text-xs border-b border-gray-200";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-blue-600">PROPOSALS</h3>
        <button onClick={onAdd} className="px-4 py-1.5 text-xs font-medium text-white bg-green-500 rounded hover:bg-green-600 flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Add New
        </button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className={thClass}>S.No</th>
              <th className={thClass}>Proposal No</th>
              <th className={thClass}>Date</th>
              <th className={thClass}>Valid Until</th>
              <th className={thClass}>Subtotal</th>
              <th className={thClass}>Discount</th>
              <th className={thClass}>Total</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {proposals.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-500 text-sm bg-gray-50">No proposals found</td></tr>
            ) : (
              proposals.map((prop: any, index: number) => (
                <tr key={prop.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className={tdClass}>{index + 1}</td>
                  <td className={`${tdClass} text-blue-600 font-medium`}>{prop.proposal_number || '-'}</td>
                  <td className={tdClass}>{prop.proposal_date || '-'}</td>
                  <td className={tdClass}>{prop.valid_until || '-'}</td>
                  <td className={tdClass}>{prop.currency} {prop.subtotal?.toFixed(2) || '0.00'}</td>
                  <td className={`${tdClass} text-red-600`}>{prop.currency} {prop.discount?.toFixed(2) || '0.00'}</td>
                  <td className={`${tdClass} text-green-600 font-medium`}>{prop.currency} {prop.total?.toFixed(2) || '0.00'}</td>
                  <td className={tdClass}><span className={`px-2 py-0.5 text-xs rounded ${prop.status === 'accepted' ? 'bg-green-100 text-green-700' : prop.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{prop.status}</span></td>
                  <td className={tdClass}>
                    <button onClick={() => onEdit(prop)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded border border-blue-200"><Edit2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============== Agreement List ==============
function AgreementList({ agreements, onAdd, onEdit, crId, refreshData }: any) {
  const thClass = "px-4 py-2.5 text-left text-xs font-medium text-white bg-blue-600 border-r border-blue-500 last:border-r-0";
  const tdClass = "px-4 py-2.5 text-xs border-b border-gray-200";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-blue-600">AGREEMENTS</h3>
        <button onClick={onAdd} className="px-4 py-1.5 text-xs font-medium text-white bg-green-500 rounded hover:bg-green-600 flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Add New
        </button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className={thClass}>S.No</th>
              <th className={thClass}>Agreement No</th>
              <th className={thClass}>Date</th>
              <th className={thClass}>Type</th>
              <th className={thClass}>Value</th>
              <th className={thClass}>Start Date</th>
              <th className={thClass}>End Date</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agreements.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-500 text-sm bg-gray-50">No agreements found</td></tr>
            ) : (
              agreements.map((agr: any, index: number) => (
                <tr key={agr.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className={tdClass}>{index + 1}</td>
                  <td className={`${tdClass} text-blue-600 font-medium`}>{agr.agreement_number || '-'}</td>
                  <td className={tdClass}>{agr.agreement_date || '-'}</td>
                  <td className={`${tdClass} text-orange-600`}>{agr.agreement_type || '-'}</td>
                  <td className={`${tdClass} text-green-600 font-medium`}>{agr.currency} {agr.agreement_value?.toFixed(2) || '0.00'}</td>
                  <td className={tdClass}>{agr.start_date || '-'}</td>
                  <td className={tdClass}>{agr.end_date || '-'}</td>
                  <td className={tdClass}><span className={`px-2 py-0.5 text-xs rounded ${agr.status === 'active' ? 'bg-green-100 text-green-700' : agr.status === 'expired' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{agr.status}</span></td>
                  <td className={tdClass}>
                    <button onClick={() => onEdit(agr)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded border border-blue-200"><Edit2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============== Call Logs List ==============
function CallLogsList({ callLogs, onAdd, onEdit, crId, refreshData }: any) {
  const thClass = "px-4 py-2.5 text-left text-xs font-medium text-white bg-blue-600 border-r border-blue-500 last:border-r-0";
  const tdClass = "px-4 py-2.5 text-xs border-b border-gray-200";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-blue-600">CALL LOGS</h3>
        <button onClick={onAdd} className="px-4 py-1.5 text-xs font-medium text-white bg-green-500 rounded hover:bg-green-600 flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Add New
        </button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className={thClass}>S.No</th>
              <th className={thClass}>Date</th>
              <th className={thClass}>Time</th>
              <th className={thClass}>Type</th>
              <th className={thClass}>Subject</th>
              <th className={thClass}>Duration</th>
              <th className={thClass}>Outcome</th>
              <th className={thClass}>Follow Up</th>
              <th className={thClass}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {callLogs.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-500 text-sm bg-gray-50">No call logs found</td></tr>
            ) : (
              callLogs.map((log: any, index: number) => (
                <tr key={log.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className={tdClass}>{index + 1}</td>
                  <td className={`${tdClass} text-blue-600`}>{log.call_date || '-'}</td>
                  <td className={tdClass}>{log.call_time || '-'}</td>
                  <td className={`${tdClass} text-orange-600`}>{log.call_type || '-'}</td>
                  <td className={tdClass}>{log.subject || '-'}</td>
                  <td className={tdClass}>{log.duration_minutes ? `${log.duration_minutes} min` : '-'}</td>
                  <td className={tdClass}><span className={`px-2 py-0.5 text-xs rounded ${log.outcome === 'connected' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{log.outcome || '-'}</span></td>
                  <td className={tdClass}>{log.follow_up_required ? <span className="text-red-600">{log.follow_up_date}</span> : '-'}</td>
                  <td className={tdClass}>
                    <button onClick={() => onEdit(log)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded border border-blue-200"><Edit2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============== Activities Section ==============
function ActivitiesSection({ activities, onAdd, onEdit, onDelete }: any) {
  const thClass = "px-4 py-2.5 text-left text-xs font-medium text-white bg-blue-600 border-r border-blue-500 last:border-r-0";
  const tdClass = "px-4 py-2.5 text-xs border-b border-gray-200";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-blue-600">ACTIVITIES</h3>
        <button onClick={onAdd} className="px-4 py-1.5 text-xs font-medium text-white bg-green-500 rounded hover:bg-green-600 flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Add New
        </button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className={thClass}>S.No</th>
              <th className={thClass}>Type</th>
              <th className={thClass}>Subject</th>
              <th className={thClass}>Start Date</th>
              <th className={thClass}>End Date</th>
              <th className={thClass}>Priority</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {activities.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500 text-sm bg-gray-50">No activities found</td></tr>
            ) : (
              activities.map((activity: any, index: number) => (
                <tr key={activity.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className={tdClass}>{index + 1}</td>
                  <td className={`${tdClass} text-blue-600`}>{activity.activity_type}</td>
                  <td className={tdClass}>{activity.subject}</td>
                  <td className={tdClass}>{activity.start_date || '-'}</td>
                  <td className={tdClass}>{activity.end_date || '-'}</td>
                  <td className={tdClass}><span className={`px-2 py-0.5 text-xs rounded ${activity.priority === 'high' ? 'bg-red-100 text-red-700' : activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{activity.priority || '-'}</span></td>
                  <td className={tdClass}><span className={`px-2 py-0.5 text-xs rounded ${activity.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{activity.status}</span></td>
                  <td className={tdClass}>
                    <div className="flex gap-1">
                      <button onClick={() => onEdit(activity)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded border border-blue-200"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => onDelete(activity.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-red-200"><Trash2 className="w-3.5 h-3.5" /></button>
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
}

// ============== Documents Section ==============
function DocumentsSection({ documents, onUpload, onDelete }: any) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const thClass = "px-3 py-2 text-left text-xs font-medium text-white bg-blue-600 border-r border-blue-400 last:border-r-0";
  const tdClass = "px-3 py-2 text-xs border-b border-gray-200";

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-700">Documents</h3>
        <button
          type="button"
          onClick={handleButtonClick}
          className="px-3 py-1.5 text-xs font-medium text-white bg-green-500 rounded hover:bg-green-600 cursor-pointer flex items-center gap-1"
        >
          <Upload className="w-3.5 h-3.5" /> Upload File
        </button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={onUpload}
          className="hidden"
          style={{ display: 'none' }}
        />
      </div>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className={`${thClass} w-12`}>#</th>
              <th className={thClass}>File Name</th>
              <th className={thClass}>Type</th>
              <th className={thClass}>Size</th>
              <th className={thClass}>Uploaded</th>
              <th className={`${thClass} w-24`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-gray-500 text-sm">No documents found</td></tr>
            ) : (
              documents.map((doc: any, index: number) => (
                <tr key={doc.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className={`${tdClass} text-center font-medium`}>{index + 1}</td>
                  <td className={tdClass}>{doc.file_name}</td>
                  <td className={tdClass}>{doc.file_type || '-'}</td>
                  <td className={tdClass}>{doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : '-'}</td>
                  <td className={tdClass}>{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : '-'}</td>
                  <td className={tdClass}>
                    <div className="flex gap-1 justify-center">
                      <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="p-1 text-blue-600 hover:bg-blue-100 rounded border border-blue-200"><Download className="w-3.5 h-3.5" /></a>
                      <button onClick={() => onDelete(doc.id)} className="p-1 text-red-600 hover:bg-red-100 rounded border border-red-200"><Trash2 className="w-3.5 h-3.5" /></button>
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
}

// ============== Memos Section ==============
function MemosSection({ memos, onAdd, onEdit, onDelete }: any) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-700">Memos</h3>
        <button
          onClick={onAdd}
          className="px-3 py-1.5 text-xs font-medium text-white bg-green-500 rounded hover:bg-green-600 flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Add Memo
        </button>
      </div>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {memos.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8 bg-gray-50">No memos found</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {memos.map((memo: any, index: number) => (
              <div key={memo.id} className={`p-3 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-xs font-medium bg-blue-100 text-blue-600 rounded">{index + 1}</span>
                    <div>
                      <h4 className="font-medium text-sm text-gray-800">{memo.title || 'Untitled'}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{new Date(memo.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => onEdit(memo)} className="p-1 text-blue-600 hover:bg-blue-100 rounded border border-blue-200"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onDelete(memo.id)} className="p-1 text-red-600 hover:bg-red-100 rounded border border-red-200"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 pl-9 whitespace-pre-wrap">{memo.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============== Generic Tab Details ==============
function GenericTabDetails({ tabName }: { tabName: string }) {
  const tabDescriptions: Record<string, { title: string; description: string; fields: string[] }> = {
    'initiation': {
      title: 'Project Initiation',
      description: 'Initial project setup and kickoff phase',
      fields: ['Project Charter', 'Stakeholders', 'Objectives', 'Success Criteria']
    },
    'planning': {
      title: 'Project Planning',
      description: 'Detailed planning and timeline definition',
      fields: ['Project Plan', 'Timeline', 'Resources', 'Milestones']
    },
    'configuration': {
      title: 'System Configuration',
      description: 'Software configuration and customization',
      fields: ['System Setup', 'Modules', 'Integrations', 'Customizations']
    },
    'training': {
      title: 'User Training',
      description: 'End-user and admin training sessions',
      fields: ['Training Schedule', 'Materials', 'Attendees', 'Completion Status']
    },
    'uat': {
      title: 'User Acceptance Testing',
      description: 'Testing and validation by end-users',
      fields: ['Test Cases', 'Test Results', 'Issues Found', 'Sign-off Status']
    },
    'data-migration': {
      title: 'Data Migration',
      description: 'Legacy data migration and validation',
      fields: ['Data Sources', 'Migration Plan', 'Validation Results', 'Completion Status']
    },
    'go-live': {
      title: 'Go Live',
      description: 'Production deployment and launch',
      fields: ['Launch Date', 'Checklist', 'Rollback Plan', 'Deployment Status']
    },
    'support': {
      title: 'Post-Implementation Support',
      description: 'Ongoing support and maintenance',
      fields: ['Support Plan', 'SLA', 'Tickets', 'Escalation Process']
    }
  };

  const info = tabDescriptions[tabName] || {
    title: tabName.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: 'Phase details and management',
    fields: ['Status', 'Notes', 'Timeline', 'Resources']
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800">{info.title}</h3>
        <p className="text-xs text-blue-600 mt-1">{info.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {info.fields.map((field, index) => (
          <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <label className="text-xs font-medium text-blue-600 block mb-1">{field}</label>
            <div className="text-xs text-gray-400 italic">Not configured</div>
          </div>
        ))}
      </div>

      <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-500">Use the sub-tabs to manage Activities, Documents, and Memos for this phase.</p>
      </div>
    </div>
  );
}

// ============== Activity Modal ==============
function ActivityModal({ isOpen, onClose, onSave, editingItem }: any) {
  const [formData, setFormData] = useState({
    activity_type: editingItem?.activity_type || 'task',
    subject: editingItem?.subject || '',
    description: editingItem?.description || '',
    priority: editingItem?.priority || 'medium',
    start_date: editingItem?.start_date || '',
    start_time: editingItem?.start_time || '',
    end_date: editingItem?.end_date || '',
    end_time: editingItem?.end_time || '',
    status: editingItem?.status || 'planned',
  });

  const inputClass = "w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-[500px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-3 border-b bg-blue-600 text-white rounded-t-lg">
          <h3 className="font-medium">{editingItem ? 'Edit Activity' : 'New Activity'}</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-blue-600 mb-1 block">Type</label>
              <select value={formData.activity_type} onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })} className={inputClass}>
                <option value="task">Task</option>
                <option value="call">Call</option>
                <option value="meeting">Meeting</option>
                <option value="email">Email</option>
                <option value="follow_up">Follow Up</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-blue-600 mb-1 block">Priority</label>
              <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className={inputClass}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-blue-600 mb-1 block">Subject</label>
            <input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-blue-600 mb-1 block">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full h-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-blue-600 mb-1 block">Start Date</label>
              <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-blue-600 mb-1 block">Start Time</label>
              <input type="time" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-blue-600 mb-1 block">End Date</label>
              <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-blue-600 mb-1 block">End Time</label>
              <input type="time" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-blue-600 mb-1 block">Status</label>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputClass}>
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 p-3 border-t">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
          <button onClick={() => onSave(formData)} className="px-4 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">Save</button>
        </div>
      </div>
    </div>
  );
}

// ============== Memo Modal ==============
function MemoModal({ isOpen, onClose, onSave, editingItem }: any) {
  const [formData, setFormData] = useState({
    title: editingItem?.title || '',
    content: editingItem?.content || '',
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-[400px]">
        <div className="flex items-center justify-between p-3 border-b bg-blue-600 text-white rounded-t-lg">
          <h3 className="font-medium">{editingItem ? 'Edit Memo' : 'New Memo'}</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-blue-600 mb-1 block">Title</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-blue-600 mb-1 block">Content</label>
            <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full h-32 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div className="flex justify-end gap-2 p-3 border-t">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
          <button onClick={() => onSave(formData)} className="px-4 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">Save</button>
        </div>
      </div>
    </div>
  );
}

// ============== Demo Modal ==============
function DemoModal({ isOpen, onClose, crId, editingItem, refreshData }: any) {
  const [formData, setFormData] = useState({
    demo_date: editingItem?.demo_date || '',
    demo_time: editingItem?.demo_time || '',
    demo_type: editingItem?.demo_type || '',
    presenter_id: editingItem?.presenter_id || '',
    attendees: editingItem?.attendees || '',
    location: editingItem?.location || '',
    meeting_link: editingItem?.meeting_link || '',
    modules_to_demo: editingItem?.modules_to_demo || '',
    notes: editingItem?.notes || '',
    feedback: editingItem?.feedback || '',
    status: editingItem?.status || 'scheduled',
  });
  const [saving, setSaving] = useState(false);

  const inputClass = "w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500";

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingItem) {
        await api.updateCRDemo(crId, editingItem.id, formData);
      } else {
        await api.createCRDemo(crId, formData);
      }
      refreshData();
      onClose();
    } catch (err) {
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-[500px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-3 border-b bg-blue-600 text-white rounded-t-lg">
          <h3 className="font-medium">{editingItem ? 'Edit Demo' : 'New Demo'}</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-blue-600 mb-1 block">Date</label>
              <input type="date" value={formData.demo_date} onChange={(e) => setFormData({ ...formData, demo_date: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-blue-600 mb-1 block">Time</label>
              <input type="time" value={formData.demo_time} onChange={(e) => setFormData({ ...formData, demo_time: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-blue-600 mb-1 block">Demo Type</label>
            <select value={formData.demo_type} onChange={(e) => setFormData({ ...formData, demo_type: e.target.value })} className={inputClass}>
              <option value="">Select Type</option>
              <option value="online">Online</option>
              <option value="onsite">Onsite</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-blue-600 mb-1 block">Modules to Demo</label>
            <input type="text" value={formData.modules_to_demo} onChange={(e) => setFormData({ ...formData, modules_to_demo: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-blue-600 mb-1 block">Location</label>
            <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-blue-600 mb-1 block">Meeting Link</label>
            <input type="text" value={formData.meeting_link} onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-blue-600 mb-1 block">Attendees</label>
            <input type="text" value={formData.attendees} onChange={(e) => setFormData({ ...formData, attendees: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-blue-600 mb-1 block">Notes</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full h-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-blue-600 mb-1 block">Feedback</label>
            <textarea value={formData.feedback} onChange={(e) => setFormData({ ...formData, feedback: e.target.value })} className="w-full h-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-blue-600 mb-1 block">Status</label>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputClass}>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 p-3 border-t">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

// ============== Proposal Modal ==============
function ProposalModal({ isOpen, onClose, crId, editingItem, refreshData }: any) {
  const [formData, setFormData] = useState({
    proposal_number: editingItem?.proposal_number || '',
    proposal_date: editingItem?.proposal_date || '',
    valid_until: editingItem?.valid_until || '',
    subtotal: editingItem?.subtotal || 0,
    discount: editingItem?.discount || 0,
    tax: editingItem?.tax || 0,
    total: editingItem?.total || 0,
    currency: editingItem?.currency || 'USD',
    purpose: editingItem?.purpose || '',
    scope: editingItem?.scope || '',
    deliverables: editingItem?.deliverables || '',
    terms_conditions: editingItem?.terms_conditions || '',
    status: editingItem?.status || 'draft',
  });
  const [saving, setSaving] = useState(false);

  const inputClass = "w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500";

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingItem) {
        await api.updateCRProposal(crId, editingItem.id, formData);
      } else {
        await api.createCRProposal(crId, formData);
      }
      refreshData();
      onClose();
    } catch (err) {
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-3 border-b bg-blue-600 text-white rounded-t-lg">
          <h3 className="font-medium">{editingItem ? 'Edit Proposal' : 'New Proposal'}</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-blue-600 mb-1 block">Proposal Number</label>
              <input type="text" value={formData.proposal_number} onChange={(e) => setFormData({ ...formData, proposal_number: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-blue-600 mb-1 block">Date</label>
              <input type="date" value={formData.proposal_date} onChange={(e) => setFormData({ ...formData, proposal_date: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-blue-600 mb-1 block">Valid Until</label>
              <input type="date" value={formData.valid_until} onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-blue-600 mb-1 block">Currency</label>
              <select value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} className={inputClass}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="PKR">PKR</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-blue-600 mb-1 block">Subtotal</label>
              <input type="number" value={formData.subtotal} onChange={(e) => setFormData({ ...formData, subtotal: parseFloat(e.target.value) || 0 })} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-blue-600 mb-1 block">Discount</label>
              <input type="number" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-blue-600 mb-1 block">Tax</label>
              <input type="number" value={formData.tax} onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-blue-600 mb-1 block">Total</label>
            <input type="number" value={formData.total} onChange={(e) => setFormData({ ...formData, total: parseFloat(e.target.value) || 0 })} className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-blue-600 mb-1 block">Purpose</label>
            <textarea value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} className="w-full h-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-blue-600 mb-1 block">Scope</label>
            <textarea value={formData.scope} onChange={(e) => setFormData({ ...formData, scope: e.target.value })} className="w-full h-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-blue-600 mb-1 block">Deliverables</label>
            <textarea value={formData.deliverables} onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })} className="w-full h-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-blue-600 mb-1 block">Terms & Conditions</label>
            <textarea value={formData.terms_conditions} onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })} className="w-full h-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-blue-600 mb-1 block">Status</label>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputClass}>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 p-3 border-t">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

// ============== Agreement Modal ==============
function AgreementModal({ isOpen, onClose, crId, editingItem, refreshData }: any) {
  const [formData, setFormData] = useState({
    agreement_number: editingItem?.agreement_number || '',
    agreement_date: editingItem?.agreement_date || '',
    start_date: editingItem?.start_date || '',
    end_date: editingItem?.end_date || '',
    agreement_type: editingItem?.agreement_type || '',
    agreement_value: editingItem?.agreement_value || 0,
    currency: editingItem?.currency || 'USD',
    terms: editingItem?.terms || '',
    special_conditions: editingItem?.special_conditions || '',
    signed_by_customer: editingItem?.signed_by_customer || false,
    signed_by_company: editingItem?.signed_by_company || false,
    customer_signatory: editingItem?.customer_signatory || '',
    company_signatory: editingItem?.company_signatory || '',
    status: editingItem?.status || 'draft',
  });
  const [saving, setSaving] = useState(false);

  const inputClass = "w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500";

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingItem) {
        await api.updateCRAgreement(crId, editingItem.id, formData);
      } else {
        await api.createCRAgreement(crId, formData);
      }
      refreshData();
      onClose();
    } catch (err) {
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-3 border-b bg-blue-600 text-white rounded-t-lg">
          <h3 className="font-medium">{editingItem ? 'Edit Agreement' : 'New Agreement'}</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-blue-600 mb-1 block">Agreement Number</label>
              <input type="text" value={formData.agreement_number} onChange={(e) => setFormData({ ...formData, agreement_number: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-blue-600 mb-1 block">Agreement Date</label>
              <input type="date" value={formData.agreement_date} onChange={(e) => setFormData({ ...formData, agreement_date: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-blue-600 mb-1 block">Start Date</label>
              <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-blue-600 mb-1 block">End Date</label>
              <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-blue-600 mb-1 block">Agreement Type</label>
              <select value={formData.agreement_type} onChange={(e) => setFormData({ ...formData, agreement_type: e.target.value })} className={inputClass}>
                <option value="">Select Type</option>
                <option value="service">Service Agreement</option>
                <option value="license">License Agreement</option>
                <option value="support">Support Agreement</option>
                <option value="nda">NDA</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-blue-600 mb-1 block">Currency</label>
              <select value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} className={inputClass}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="PKR">PKR</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-blue-600 mb-1 block">Value</label>
              <input type="number" value={formData.agreement_value} onChange={(e) => setFormData({ ...formData, agreement_value: parseFloat(e.target.value) || 0 })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-blue-600 mb-1 block">Terms</label>
            <textarea value={formData.terms} onChange={(e) => setFormData({ ...formData, terms: e.target.value })} className="w-full h-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-blue-600 mb-1 block">Special Conditions</label>
            <textarea value={formData.special_conditions} onChange={(e) => setFormData({ ...formData, special_conditions: e.target.value })} className="w-full h-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-blue-600 mb-1 block">Customer Signatory</label>
              <input type="text" value={formData.customer_signatory} onChange={(e) => setFormData({ ...formData, customer_signatory: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-blue-600 mb-1 block">Company Signatory</label>
              <input type="text" value={formData.company_signatory} onChange={(e) => setFormData({ ...formData, company_signatory: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={formData.signed_by_customer} onChange={(e) => setFormData({ ...formData, signed_by_customer: e.target.checked })} />
              Signed by Customer
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={formData.signed_by_company} onChange={(e) => setFormData({ ...formData, signed_by_company: e.target.checked })} />
              Signed by Company
            </label>
          </div>
          <div>
            <label className="text-xs font-medium text-blue-600 mb-1 block">Status</label>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputClass}>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="signed">Signed</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 p-3 border-t">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

// ============== Call Log Modal ==============
function CallLogModal({ isOpen, onClose, crId, editingItem, refreshData }: any) {
  const [formData, setFormData] = useState({
    call_date: editingItem?.call_date || '',
    call_time: editingItem?.call_time || '',
    duration_minutes: editingItem?.duration_minutes || '',
    call_type: editingItem?.call_type || 'outbound',
    subject: editingItem?.subject || '',
    notes: editingItem?.notes || '',
    outcome: editingItem?.outcome || '',
    follow_up_required: editingItem?.follow_up_required || false,
    follow_up_date: editingItem?.follow_up_date || '',
  });
  const [saving, setSaving] = useState(false);

  const inputClass = "w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500";

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingItem) {
        await api.updateCRCallLog(crId, editingItem.id, formData);
      } else {
        await api.createCRCallLog(crId, formData);
      }
      refreshData();
      onClose();
    } catch (err) {
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-[500px]">
        <div className="flex items-center justify-between p-3 border-b bg-blue-600 text-white rounded-t-lg">
          <h3 className="font-medium">{editingItem ? 'Edit Call Log' : 'New Call Log'}</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-blue-600 mb-1 block">Date</label>
              <input type="date" value={formData.call_date} onChange={(e) => setFormData({ ...formData, call_date: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-blue-600 mb-1 block">Time</label>
              <input type="time" value={formData.call_time} onChange={(e) => setFormData({ ...formData, call_time: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-blue-600 mb-1 block">Duration (min)</label>
              <input type="number" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || '' })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-blue-600 mb-1 block">Call Type</label>
            <select value={formData.call_type} onChange={(e) => setFormData({ ...formData, call_type: e.target.value })} className={inputClass}>
              <option value="outbound">Outbound</option>
              <option value="inbound">Inbound</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-blue-600 mb-1 block">Subject</label>
            <input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-blue-600 mb-1 block">Notes</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full h-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-blue-600 mb-1 block">Outcome</label>
            <select value={formData.outcome} onChange={(e) => setFormData({ ...formData, outcome: e.target.value })} className={inputClass}>
              <option value="">Select Outcome</option>
              <option value="connected">Connected</option>
              <option value="voicemail">Voicemail</option>
              <option value="no_answer">No Answer</option>
              <option value="busy">Busy</option>
              <option value="callback_requested">Callback Requested</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="follow_up" checked={formData.follow_up_required} onChange={(e) => setFormData({ ...formData, follow_up_required: e.target.checked })} />
            <label htmlFor="follow_up" className="text-xs text-gray-700">Follow-up Required</label>
          </div>
          {formData.follow_up_required && (
            <div>
              <label className="text-xs font-medium text-blue-600 mb-1 block">Follow-up Date</label>
              <input type="date" value={formData.follow_up_date} onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })} className={inputClass} />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 p-3 border-t">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}
