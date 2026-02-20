'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, Eye, Upload, Trash2, Mail, FileText, Clock, CheckCircle, X, Bold, Italic, Underline, Link2, Search, ExternalLink, ClipboardList } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { getEmailTemplatesByTab, getEmailTemplateById, EmailPlaceholderData, templateGroups } from '@/lib/emailTemplates';

interface Lead {
  id: number;
  company_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country_id: number;
  country_name?: string;
  country?: string;  // Alternative field name from API
  state_id: number;
  state_name?: string;
  state?: string;  // Alternative field name from API
  city_id: number;
  city_name?: string;
  city?: string;  // Alternative field name from API
  industry_id: number;
  industry_name?: string;
  industry?: string;  // Alternative field name from API
  group_id: number;
  group_name?: string;
  lead_source_id: number;
  lead_source_name?: string;
  lead_source?: string;  // Alternative field name from API
  source?: string;  // Alternative field name from API
  source_details?: string;  // Detailed source info
  status: string;
  lead_status?: string;  // Alternative field name from API
  sales_rep_id: number;
  sales_rep_name?: string;
  sales_rep?: string;  // Alternative field name from API
  assigned_to?: number;  // User ID of assigned sales rep
  contacts?: any[];
}

interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  work_email: string;
  personal_email: string;
}

interface Document {
  id: number;
  name: string;
  notes: string;
  size: number;
  created_at: string;
  url: string;
}

interface EmailHistory {
  id: number;
  lead_id: number;
  lead_name: string;
  subject: string;
  sent_at: string;
  attachments: string[];
}

export default function BulkEmailPage() {
  const { user } = useAuthStore();

  // Tabs
  const [activeTab, setActiveTab] = useState<'email' | 'history' | 'audit'>('email');

  // Email Format
  const [selectedTab, setSelectedTab] = useState<string>('introduction');
  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Available tabs from templateGroups
  const availableTabs = Object.entries(templateGroups).map(([key, value]: [string, { label: string; templates: any[] }]) => ({
    key,
    label: value.label,
  }));

  // Documents
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<number[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docFile, setDocFile] = useState<File | null>(null);
  const docFileRef = useRef<HTMLInputElement>(null);

  // Filters
  const [filters, setFilters] = useState({
    company_name: '',
    country_id: '',
    state_id: '',
    city_id: '',
    group_id: '',
    industry_id: '',
    sales_rep_id: '',
    lead_source_id: '',
    status: '',
  });

  // Filter options
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [industries, setIndustries] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [leadSources, setLeadSources] = useState<any[]>([]);
  const [salesReps, setSalesReps] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);

  // Leads
  const [leads, setLeads] = useState<Lead[]>([]);
  const [allContacts, setAllContacts] = useState<any[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Map<number, { contactEmail: string; contactName: string }>>(new Map());
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [perPage, setPerPage] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);

  // Email Modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
  });
  const [sending, setSending] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const initialLoadDone = useRef(false);

  // Email History
  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([]);

  // Load initial data - all in parallel for faster loading
  useEffect(() => {
    setLoading(true);
    Promise.all([
      loadFilterOptions().catch(e => console.error('Filter options error:', e)),
      loadDocuments().catch(e => console.error('Documents error:', e)),
      loadAllContacts().catch(e => {
        console.error('Contacts error:', e);
        return [];
      }),
    ]).then((results) => {
      // Pass contacts directly to loadLeads since state might not be updated yet
      const contacts = results[2] || [];
      loadLeads(contacts);
      initialLoadDone.current = true;
    }).catch(e => {
      console.error('Initial load error:', e);
      setLoading(false);
      initialLoadDone.current = true;
    });
  }, []);

  // Load leads when filters or pagination change (after initial load)
  useEffect(() => {
    // Skip initial load - it's handled by the above useEffect
    if (initialLoadDone.current) {
      loadLeads();
    }
  }, [filters, perPage, currentPage]);

  const loadEmailTemplates = (tab: string = selectedTab) => {
    // Get templates from frontend for the selected tab
    const frontendTemplates = getEmailTemplatesByTab(tab);
    const converted = frontendTemplates.map((t, index) => ({
      id: index + 1,
      title: t.name,
      email_format: t.id,
      email_format_option_values: t.id,
      subject: t.subject,
    }));
    setEmailTemplates(converted);
    setSelectedTemplate(''); // Reset selected template when tab changes

    // Also try to load from database
    api.getCRIEmailTemplates(tab).then((dbTemplates) => {
      if (dbTemplates && Array.isArray(dbTemplates) && dbTemplates.length > 0) {
        // Filter out any error objects from database templates
        const validTemplates = dbTemplates.filter((t: any) => {
          if (!t || typeof t !== 'object') return false;
          if ('type' in t && 'loc' in t && 'msg' in t) return false;
          return t.id;
        });
        if (validTemplates.length > 0) {
          setEmailTemplates(validTemplates);
        }
      }
    }).catch(() => {});
  };

  // Reload templates when tab changes
  useEffect(() => {
    loadEmailTemplates(selectedTab);
  }, [selectedTab]);

  const loadFilterOptions = async () => {
    try {
      // Load countries
      const countriesData = await api.getCountries().catch(() => []);
      setCountries(filterValidItems(countriesData));

      // Load option categories with their dropdowns
      const optionsWithDropdowns = await api.getOptionsWithDropdowns().catch(() => []);
      const validOptions = filterValidItems(optionsWithDropdowns);

      // Find each category and get its dropdowns
      const industryOption = validOptions.find((o: any) => o.title?.toLowerCase() === 'industry');
      const groupOption = validOptions.find((o: any) => o.title?.toLowerCase() === 'group');
      const leadSourceOption = validOptions.find((o: any) => o.title?.toLowerCase() === 'lead source' || o.title?.toLowerCase() === 'lead_source');
      const statusOption = validOptions.find((o: any) => o.title?.toLowerCase() === 'lead status' || o.title?.toLowerCase() === 'lead_status');

      setIndustries(filterValidItems(industryOption?.dropdowns || []));
      setGroups(filterValidItems(groupOption?.dropdowns || []));
      setLeadSources(filterValidItems(leadSourceOption?.dropdowns || []));
      setStatuses(filterValidItems(statusOption?.dropdowns || []));

      // Load sales reps (users) - may fail if not admin
      const users = await api.getUsers().catch(() => []);
      setSalesReps(filterValidItems(users));
    } catch (error) {
      console.error('Failed to load filter options:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      // Load bulk email documents
      const docs = await api.getBulkEmailDocuments().catch(() => []);
      // Filter out any error objects
      const validDocs = Array.isArray(docs)
        ? docs.filter((d: any) => {
            if (!d || typeof d !== 'object') return false;
            if ('type' in d && 'loc' in d && 'msg' in d) return false;
            return d.id;
          })
        : [];
      setDocuments(validDocs);
    } catch (error) {
      console.error('Failed to load documents:', error);
      setDocuments([]);
    }
  };

  const loadAllContacts = async () => {
    try {
      // Fetch contacts from lead_contacts table (same as CRI page uses)
      // Use skip=0 and limit=1000 to get contacts
      const response = await api.getAllLeadContacts({ skip: 0, limit: 1000 }).catch((err) => {
        console.error('Error fetching all contacts:', err);
        return [];
      });

      // Helper to check if object is a valid contact (not an error object)
      const isValidContact = (c: any) => {
        if (!c || typeof c !== 'object') return false;
        // Filter out Pydantic/FastAPI error objects
        if ('type' in c && 'loc' in c && 'msg' in c) return false;
        // Must have lead_id
        return c.lead_id;
      };

      // Ensure response is an array and filter out invalid entries
      const leadContacts = Array.isArray(response)
        ? response.filter(isValidContact)
        : [];

      console.log('Loaded contacts from lead_contacts:', leadContacts.length);

      // Log sample contact to debug email fields
      if (leadContacts.length > 0) {
        console.log('Sample contact:', {
          id: leadContacts[0].id,
          lead_id: leadContacts[0].lead_id,
          email: leadContacts[0].email,
          work_email: leadContacts[0].work_email,
          personal_email: leadContacts[0].personal_email,
        });
      }

      setAllContacts(leadContacts);
      return leadContacts;
    } catch (error) {
      console.error('Failed to load contacts:', error);
      setAllContacts([]);
      return [];
    }
  };

  const loadLeads = async (contactsOverride?: any[]) => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        page_size: perPage,
      };

      // Add filters
      if (filters.company_name) params.search = filters.company_name;
      if (filters.status) params.lead_status = filters.status;

      const leadsResponse = await api.getLeads(params).catch(() => ({ items: [], total: 0 }));
      const rawLeadsData = leadsResponse.items || leadsResponse || [];

      // Filter out any error objects from leads
      const leadsData = Array.isArray(rawLeadsData)
        ? rawLeadsData.filter((lead: any) => {
            if (!lead || typeof lead !== 'object') return false;
            if ('type' in lead && 'loc' in lead && 'msg' in lead) return false;
            return lead.id;
          })
        : [];

      // Helper to check if object is a valid contact
      const isValidContact = (c: any) => {
        if (!c || typeof c !== 'object') return false;
        if ('type' in c && 'loc' in c && 'msg' in c) return false;
        return c.id || c.first_name || c.email || c.work_email || c.personal_email;
      };

      // Group contacts by lead_id - use contactsOverride if provided, otherwise use state
      const contactsByLead: { [key: number]: any[] } = {};
      const contactsToUse = contactsOverride !== undefined ? contactsOverride : allContacts;
      const validContacts = Array.isArray(contactsToUse) ? contactsToUse.filter(isValidContact) : [];
      validContacts.forEach((contact: any) => {
        const leadId = contact.lead_id;
        if (leadId) {
          if (!contactsByLead[leadId]) {
            contactsByLead[leadId] = [];
          }
          contactsByLead[leadId].push(contact);
        }
      });

      // Helper to sanitize lead properties - convert error objects to null
      const sanitizeLead = (lead: any) => {
        const sanitized: any = {};
        for (const key in lead) {
          const val = lead[key];
          // If value is an error object, set to null
          if (val && typeof val === 'object' && 'type' in val && 'loc' in val && 'msg' in val) {
            sanitized[key] = null;
          } else {
            sanitized[key] = val;
          }
        }
        return sanitized;
      };

      // Merge contacts into leads and sanitize
      const leadsWithContacts = leadsData.map((lead: any) => ({
        ...sanitizeLead(lead),
        contacts: contactsByLead[lead.id] || [],
      }));

      setLeads(leadsWithContacts);
      setTotalLeads(leadsResponse.total || leadsData.length || 0);
    } catch (error) {
      console.error('Failed to load leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to filter out error objects from API responses
  const filterValidItems = (items: any[]) => {
    if (!Array.isArray(items)) return [];
    return items.filter((item: any) => {
      if (!item || typeof item !== 'object') return false;
      // Filter out Pydantic/FastAPI error objects
      if ('type' in item && 'loc' in item && 'msg' in item) return false;
      return item.id;
    });
  };

  const handleCountryChange = async (countryId: string) => {
    setFilters({ ...filters, country_id: countryId, state_id: '', city_id: '' });
    if (countryId) {
      try {
        const statesData = await api.getStates(parseInt(countryId));
        setStates(filterValidItems(statesData));
      } catch (error) {
        setStates([]);
      }
    } else {
      setStates([]);
    }
    setCities([]);
  };

  const handleStateChange = async (stateId: string) => {
    setFilters({ ...filters, state_id: stateId, city_id: '' });
    if (stateId) {
      try {
        const citiesData = await api.getCities(parseInt(stateId));
        setCities(filterValidItems(citiesData));
      } catch (error) {
        setCities([]);
      }
    } else {
      setCities([]);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      const newSelected = new Map<number, { contactEmail: string; contactName: string }>();
      leads.forEach(lead => {
        if (lead.contacts && lead.contacts.length > 0) {
          const contact = lead.contacts[0];
          newSelected.set(lead.id, {
            contactEmail: contact.work_email || contact.personal_email || '',
            contactName: `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
          });
        }
      });
      setSelectedLeads(newSelected);
    } else {
      setSelectedLeads(new Map());
    }
  };

  const handleLeadSelect = (leadId: number, checked: boolean, contactEmail: string, contactName: string) => {
    const newSelected = new Map(selectedLeads);
    if (checked) {
      newSelected.set(leadId, { contactEmail, contactName });
    } else {
      newSelected.delete(leadId);
    }
    setSelectedLeads(newSelected);
    setSelectAll(newSelected.size === leads.filter(l => l.contacts && l.contacts.length > 0).length);
  };

  const handleContactChange = (leadId: number, contactEmail: string, contactName: string) => {
    if (selectedLeads.has(leadId)) {
      const newSelected = new Map(selectedLeads);
      newSelected.set(leadId, { contactEmail, contactName });
      setSelectedLeads(newSelected);
    }
  };

  const handleUploadDocument = async () => {
    if (!docFile) {
      alert('Please select a file');
      return;
    }

    setUploadingDoc(true);
    try {
      await api.uploadBulkEmailDocument(docFile);
      await loadDocuments();
      setDocFile(null);
      if (docFileRef.current) docFileRef.current.value = '';
    } catch (error) {
      console.error('Failed to upload document:', error);
      alert('Failed to upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId: number) => {
    if (!confirm('Delete this document?')) return;
    try {
      await api.deleteBulkEmailDocument(docId);
      await loadDocuments();
      setSelectedDocIds(selectedDocIds.filter(id => id !== docId));
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const openEmailModal = (singleLeadData?: { leadId: number; contactEmail: string; contactName: string }) => {
    // If single lead data is provided, use it directly
    const emailRecipients = singleLeadData
      ? [singleLeadData]
      : Array.from(selectedLeads.entries()).map(([leadId, contact]) => ({
          leadId,
          contactEmail: contact.contactEmail,
          contactName: contact.contactName,
        }));

    if (emailRecipients.length === 0) {
      alert('Please select at least one lead');
      return;
    }

    // Load template content
    const template = emailTemplates.find(t => t.email_format_option_values === selectedTemplate || t.email_format === selectedTemplate);

    let subject = '';
    let body = '';

    if (template) {
      subject = template.subject || '';

      // Try to get body from frontend template
      const frontendTemplate = getEmailTemplateById(template.email_format_option_values || template.email_format);
      if (frontendTemplate && frontendTemplate.getBody) {
        const placeholderData: EmailPlaceholderData = {
          contact_name: '{{contact_name}}',
          company_name: '{{company_name}}',
          contact_email: '',
          contact_phone: '',
          lead_id: '',
          user_name: user?.full_name || '',
          user_email: user?.email || '',
          user_title: '',
          user_ext: '',
          user_first_name: user?.full_name?.split(' ')[0] || '',
          user_last_name: user?.full_name?.split(' ').slice(1).join(' ') || '',
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          meeting_date: '',
          meeting_time: '',
          form_link: '',
          form_links: [],
          portal_link: '',
          dueid: 0,
          dueshortid: 0,
          ecomid: '',
          url: '',
          url1: '',
          url2: '',
          url3: '',
          url4: '',
          url8: '',
          config_url_warehouse: '',
          config_url_impex: '',
          config_url_service: '',
          attachments: [],
        };
        body = frontendTemplate.getBody(placeholderData);
      }
    }

    setEmailForm({
      to: emailRecipients.map(r => r.contactEmail).join(', '),
      cc: '',
      bcc: '',
      subject,
      body,
    });

    // If single lead, also add to selectedLeads for sending
    if (singleLeadData) {
      const newSelected = new Map(selectedLeads);
      newSelected.set(singleLeadData.leadId, {
        contactEmail: singleLeadData.contactEmail,
        contactName: singleLeadData.contactName,
      });
      setSelectedLeads(newSelected);
    }

    setShowEmailModal(true);

    // Set editor content after modal opens
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = body;
      }
    }, 100);
  };

  const handleSendEmail = async () => {
    if (!emailForm.subject) {
      alert('Please enter a subject');
      return;
    }

    const body = editorRef.current?.innerHTML || emailForm.body;
    if (!body) {
      alert('Please enter email body');
      return;
    }

    setSending(true);
    try {
      // Prepare lead data with contacts
      const leadData = Array.from(selectedLeads.entries()).map(([leadId, contact]) => ({
        lead_id: leadId,
        contact_email: contact.contactEmail,
        contact_name: contact.contactName,
      }));

      await api.sendBulkEmailAdvanced({
        leads: leadData,
        subject: emailForm.subject,
        body: body,
        cc: emailForm.cc,
        bcc: emailForm.bcc,
        attachment_ids: selectedDocIds,
        template_id: selectedTemplate,
      });

      alert('Emails sent successfully!');
      setShowEmailModal(false);
      setSelectedLeads(new Map());
      setSelectAll(false);

      // Reload email history
      loadEmailHistory();
    } catch (error: any) {
      console.error('Failed to send emails:', error);
      alert(error.response?.data?.detail || 'Failed to send emails');
    } finally {
      setSending(false);
    }
  };

  const loadEmailHistory = async () => {
    try {
      const history = await api.getBulkEmailHistory();
      // Filter out any error objects
      const validHistory = Array.isArray(history)
        ? history.filter((h: any) => {
            if (!h || typeof h !== 'object') return false;
            if ('type' in h && 'loc' in h && 'msg' in h) return false;
            return h.id;
          })
        : [];
      setEmailHistory(validHistory);
    } catch (error) {
      console.error('Failed to load email history:', error);
      setEmailHistory([]);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadEmailHistory();
    }
  }, [activeTab]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const totalPages = Math.ceil(totalLeads / perPage);

  return (
    <MainLayout>
      <div className="space-y-0">
        {/* Header */}
        <div className="bg-blue-600 px-4 py-3">
          <h1 className="text-lg font-bold text-white">BULK EMAIL</h1>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-b-lg shadow-sm border border-t-0">
          <div className="bg-gray-100 px-2 pt-2">
            <nav className="flex gap-1">
              <button
                onClick={() => setActiveTab('email')}
                className={`px-4 py-2 text-sm font-medium rounded-t ${
                  activeTab === 'email'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                Email
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 text-sm font-medium rounded-t ${
                  activeTab === 'history'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                Sent Email
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`px-4 py-2 text-sm font-medium rounded-t ${
                  activeTab === 'audit'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                Workflow & Audit Trail
              </button>
            </nav>
          </div>

          <div className="p-4">
            {activeTab === 'email' && (
              <div className="space-y-4">
                {/* Top Section - Email Format and Documents */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Left - Tab and Email Format */}
                  <div className="space-y-3">
                    {/* Tab Selection */}
                    <div className="flex items-center gap-3">
                      <label className="w-36 text-sm font-medium text-blue-600">Tab</label>
                      <div className="flex-1">
                        <select
                          value={selectedTab}
                          onChange={(e) => setSelectedTab(e.target.value)}
                          className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-green-50"
                        >
                          {availableTabs.map((tab) => (
                            <option key={tab.key} value={tab.key}>
                              {tab.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Email Format Selection */}
                    <div className="flex items-center gap-3">
                      <label className="w-36 text-sm font-medium text-blue-600">Email Format / Type</label>
                      <div className="flex-1 flex gap-2">
                        <select
                          value={selectedTemplate}
                          onChange={(e) => setSelectedTemplate(e.target.value)}
                          className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Select Email Format</option>
                          {emailTemplates.filter((t: any) => t && typeof t === 'object' && !('loc' in t && 'msg' in t) && t.id).map((template) => (
                            <option key={template.id} value={typeof template.email_format_option_values === 'string' ? template.email_format_option_values : (typeof template.email_format === 'string' ? template.email_format : '')}>
                              {typeof template.email_format === 'string' ? template.email_format : (typeof template.title === 'string' ? template.title : '')}
                            </option>
                          ))}
                          <option value="new-email">New Email</option>
                        </select>
                        <button
                          onClick={() => openEmailModal()}
                          className="px-3 h-9 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center"
                          title="Send Bulk Email"
                        >
                          <Mail className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right - Documents */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="w-24 text-sm font-medium text-gray-700">Document</label>
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={docFile?.name || ''}
                          readOnly
                          placeholder="No file chosen"
                          className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded bg-gray-50"
                        />
                        <input
                          type="file"
                          ref={docFileRef}
                          onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <button
                          onClick={() => docFileRef.current?.click()}
                          className="px-4 h-9 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center gap-1"
                        >
                          <FileText className="w-4 h-4" />
                          Choose File
                        </button>
                        <button
                          onClick={handleUploadDocument}
                          disabled={uploadingDoc || !docFile}
                          className="px-4 h-9 bg-gray-100 text-gray-700 text-sm rounded border hover:bg-gray-200 disabled:opacity-50"
                        >
                          {uploadingDoc ? 'Uploading...' : 'Upload'}
                        </button>
                      </div>
                    </div>

                    {/* Documents Table */}
                    <div className="border rounded overflow-hidden max-h-40 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-blue-600 text-white">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium">File Name</th>
                            <th className="px-3 py-2 text-left font-medium">Link</th>
                            <th className="px-3 py-2 text-left font-medium">Size</th>
                            <th className="px-3 py-2 text-left font-medium">Upload On</th>
                            <th className="px-3 py-2 text-center font-medium">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {documents.map((doc) => (
                            <tr key={doc.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2">{typeof doc.name === 'string' ? doc.name : ''}</td>
                              <td className="px-3 py-2">
                                <a href={typeof doc.url === 'string' ? doc.url : '#'} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                                  {typeof doc.url === 'string' && doc.url ? doc.url.substring(0, 20) + '...' : '-'}
                                </a>
                              </td>
                              <td className="px-3 py-2 text-gray-500">{typeof doc.size === 'number' ? (doc.size / 1024).toFixed(2) : '0'} Kb</td>
                              <td className="px-3 py-2 text-gray-500">{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : ''}</td>
                              <td className="px-3 py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedDocIds.includes(doc.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedDocIds([...selectedDocIds, doc.id]);
                                    } else {
                                      setSelectedDocIds(selectedDocIds.filter(id => id !== doc.id));
                                    }
                                  }}
                                  className="mr-2"
                                />
                                <button
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4 inline" />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {documents.length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-3 py-4 text-center text-gray-500">No documents uploaded</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Leads Table */}
                <div className="border rounded overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-blue-600 text-white">
                          <th className="px-3 py-2 text-center w-10">
                            <input
                              type="checkbox"
                              checked={selectAll}
                              onChange={(e) => handleSelectAll(e.target.checked)}
                            />
                          </th>
                          <th className="px-3 py-2 text-left font-medium">Company Name <span className="text-xs">↕</span></th>
                          <th className="px-3 py-2 text-left font-medium">Contact Email <span className="text-xs">↕</span></th>
                          <th className="px-3 py-2 text-left font-medium">Country <span className="text-xs">↕</span></th>
                          <th className="px-3 py-2 text-left font-medium">State/Province <span className="text-xs">↕</span></th>
                          <th className="px-3 py-2 text-left font-medium">City <span className="text-xs">↕</span></th>
                          <th className="px-3 py-2 text-left font-medium">Group <span className="text-xs">↕</span></th>
                          <th className="px-3 py-2 text-left font-medium">Industry <span className="text-xs">↕</span></th>
                          <th className="px-3 py-2 text-left font-medium">Sales Rep. <span className="text-xs">↕</span></th>
                          <th className="px-3 py-2 text-left font-medium">Lead Source <span className="text-xs">↕</span></th>
                          <th className="px-3 py-2 text-left font-medium">Status</th>
                          <th className="px-3 py-2 text-center font-medium">Action</th>
                        </tr>
                        {/* Filter Row */}
                        <tr className="bg-gray-100">
                          <td className="px-3 py-2"></td>
                          <td className="px-3 py-1">
                            <input
                              type="text"
                              placeholder="Company Name"
                              value={filters.company_name}
                              onChange={(e) => setFilters({ ...filters, company_name: e.target.value })}
                              className="w-full h-7 px-2 text-xs border rounded"
                            />
                          </td>
                          <td className="px-3 py-1"></td>
                          <td className="px-3 py-1">
                            <select
                              value={filters.country_id}
                              onChange={(e) => handleCountryChange(e.target.value)}
                              className="w-full h-7 px-1 text-xs border rounded bg-green-100"
                            >
                              <option value="">Country</option>
                              {countries.filter((c: any) => c && typeof c === 'object' && !('loc' in c && 'msg' in c) && c.id).map((c: any) => (
                                <option key={c.id} value={c.id}>{typeof c.name === 'string' ? c.name : ''}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-1">
                            <select
                              value={filters.state_id}
                              onChange={(e) => handleStateChange(e.target.value)}
                              className="w-full h-7 px-1 text-xs border rounded bg-green-100"
                            >
                              <option value="">State/Province</option>
                              {states.filter((s: any) => s && typeof s === 'object' && !('loc' in s && 'msg' in s) && s.id).map((s: any) => (
                                <option key={s.id} value={s.id}>{typeof s.name === 'string' ? s.name : ''}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-1">
                            <select
                              value={filters.city_id}
                              onChange={(e) => setFilters({ ...filters, city_id: e.target.value })}
                              className="w-full h-7 px-1 text-xs border rounded bg-green-100"
                            >
                              <option value="">City</option>
                              {cities.filter((c: any) => c && typeof c === 'object' && !('loc' in c && 'msg' in c) && c.id).map((c: any) => (
                                <option key={c.id} value={c.id}>{typeof c.name === 'string' ? c.name : ''}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-1">
                            <select
                              value={filters.group_id}
                              onChange={(e) => setFilters({ ...filters, group_id: e.target.value })}
                              className="w-full h-7 px-1 text-xs border rounded bg-green-100"
                            >
                              <option value="">Group</option>
                              {groups.filter((g: any) => g && typeof g === 'object' && !('loc' in g && 'msg' in g) && g.id).map((g: any) => (
                                <option key={g.id} value={g.id}>{typeof g.name === 'string' ? g.name : ''}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-1">
                            <select
                              value={filters.industry_id}
                              onChange={(e) => setFilters({ ...filters, industry_id: e.target.value })}
                              className="w-full h-7 px-1 text-xs border rounded bg-green-100"
                            >
                              <option value="">Industry</option>
                              {industries.filter((i: any) => i && typeof i === 'object' && !('loc' in i && 'msg' in i) && i.id).map((i: any) => (
                                <option key={i.id} value={i.id}>{typeof i.name === 'string' ? i.name : ''}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-1">
                            <select
                              value={filters.sales_rep_id}
                              onChange={(e) => setFilters({ ...filters, sales_rep_id: e.target.value })}
                              className="w-full h-7 px-1 text-xs border rounded bg-green-100"
                            >
                              <option value="">Sales Rep.</option>
                              {salesReps.filter((s: any) => s && typeof s === 'object' && !('loc' in s && 'msg' in s) && s.id).map((s: any) => (
                                <option key={s.id} value={s.id}>{typeof s.full_name === 'string' ? s.full_name : (typeof s.email === 'string' ? s.email : '')}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-1">
                            <select
                              value={filters.lead_source_id}
                              onChange={(e) => setFilters({ ...filters, lead_source_id: e.target.value })}
                              className="w-full h-7 px-1 text-xs border rounded bg-green-100"
                            >
                              <option value="">Lead Source</option>
                              {leadSources.filter((l: any) => l && typeof l === 'object' && !('loc' in l && 'msg' in l) && l.id).map((l: any) => (
                                <option key={l.id} value={l.id}>{typeof l.name === 'string' ? l.name : ''}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-1">
                            <select
                              value={filters.status}
                              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                              className="w-full h-7 px-1 text-xs border rounded bg-green-100"
                            >
                              <option value="">Status</option>
                              {statuses.filter((s: any) => s && typeof s === 'object' && !('loc' in s && 'msg' in s) && s.id).map((s: any) => (
                                <option key={s.id} value={typeof s.name === 'string' ? s.name : ''}>{typeof s.name === 'string' ? s.name : ''}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-1">
                            <button
                              onClick={() => loadLeads()}
                              className="w-full h-7 px-3 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                            >
                              Search
                            </button>
                          </td>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {loading ? (
                          <tr>
                            <td colSpan={12} className="px-3 py-8 text-center text-gray-500">Loading...</td>
                          </tr>
                        ) : leads.length === 0 ? (
                          <tr>
                            <td colSpan={12} className="px-3 py-8 text-center text-gray-500">No leads found</td>
                          </tr>
                        ) : (
                          leads.map((lead) => {
                            // Helper to get first available email from contact (ensure it's a string)
                            const getContactEmail = (contact: any) => {
                              if (!contact || typeof contact !== 'object') return '';
                              if (typeof contact.email === 'string' && contact.email) return contact.email;
                              if (typeof contact.work_email === 'string' && contact.work_email) return contact.work_email;
                              if (typeof contact.personal_email === 'string' && contact.personal_email) return contact.personal_email;
                              return '';
                            };

                            // Helper to safely get string value
                            const safeString = (val: any): string => {
                              if (val === null || val === undefined) return '';
                              if (typeof val === 'string') return val;
                              if (typeof val === 'number') return String(val);
                              return '';
                            };

                            // Helper to look up names from filter options
                            const getCountryName = (): string => {
                              // First check if string field has value
                              if (typeof lead.country === 'string' && lead.country) return lead.country;
                              // Fall back to looking up by ID
                              if (!lead.country_id) return '';
                              const country = countries.find((c: any) => c.id === lead.country_id);
                              return safeString(country?.name);
                            };
                            const getStateName = (): string => {
                              // First check if string field has value
                              if (typeof lead.state === 'string' && lead.state) return lead.state;
                              // Fall back to looking up by ID
                              if (!lead.state_id) return '';
                              const state = states.find((s: any) => s.id === lead.state_id);
                              return safeString(state?.name);
                            };
                            const getCityName = (): string => {
                              // First check if string field has value
                              if (typeof lead.city === 'string' && lead.city) return lead.city;
                              // Fall back to looking up by ID
                              if (!lead.city_id) return '';
                              const city = cities.find((c: any) => c.id === lead.city_id);
                              return safeString(city?.name);
                            };
                            const getGroupName = (): string => {
                              if (!lead.group_id) return '';
                              const group = groups.find((g: any) => g.id === lead.group_id);
                              return safeString(group?.name);
                            };
                            const getIndustryName = (): string => {
                              if (typeof lead.industry === 'string' && lead.industry) return lead.industry;
                              if (!lead.industry_id) return '';
                              const industry = industries.find((i: any) => i.id === lead.industry_id);
                              return safeString(industry?.name);
                            };
                            // Get sales rep name from assigned_to user ID
                            const getSalesRepName = (): string => {
                              // First check if string field has value
                              if (typeof lead.sales_rep === 'string' && lead.sales_rep) return lead.sales_rep;
                              // Fall back to looking up by assigned_to user ID
                              const repId = (lead as any).assigned_to || lead.sales_rep_id;
                              if (!repId) return '';
                              const rep = salesReps.find((s: any) => s.id === repId);
                              return safeString(rep?.full_name) || safeString(rep?.email);
                            };
                            // Get lead source from source enum or lead_source string
                            const getLeadSourceName = (): string => {
                              // First check lead_source string field
                              if (typeof lead.lead_source === 'string' && lead.lead_source) return lead.lead_source;
                              // Check source_details
                              const details = (lead as any).source_details;
                              if (typeof details === 'string' && details) {
                                const match = details.match(/-\s*(.+)$/);
                                if (match) return match[1].trim();
                                return details;
                              }
                              // Check source enum field (capitalize it)
                              if (typeof lead.source === 'string' && lead.source) {
                                return lead.source.charAt(0).toUpperCase() + lead.source.slice(1).toLowerCase().replace(/_/g, ' ');
                              }
                              return '';
                            };

                            // Check if lead has contacts with valid emails (filter out error objects)
                            const validContacts = (lead.contacts || []).filter((c: any) => {
                              if (!c || typeof c !== 'object') return false;
                              if ('type' in c && 'loc' in c && 'msg' in c) return false;
                              return true;
                            });
                            const contactsWithEmail = validContacts.filter((c: any) => getContactEmail(c));
                            const hasContacts = contactsWithEmail.length > 0;
                            const isSelected = selectedLeads.has(lead.id);
                            const selectedContact = selectedLeads.get(lead.id);

                            return (
                              <tr key={lead.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    disabled={!hasContacts}
                                    onChange={(e) => {
                                      if (hasContacts) {
                                        const contact = contactsWithEmail[0];
                                        handleLeadSelect(
                                          lead.id,
                                          e.target.checked,
                                          getContactEmail(contact),
                                          `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
                                        );
                                      }
                                    }}
                                  />
                                </td>
                                <td className="px-3 py-2 font-medium">{typeof lead.company_name === 'string' ? lead.company_name : ''}</td>
                                <td className="px-3 py-2">
                                  {hasContacts ? (
                                    <select
                                      value={selectedContact?.contactEmail || getContactEmail(contactsWithEmail[0])}
                                      onChange={(e) => {
                                        // Find which contact has this email
                                        let foundContact = null;
                                        let foundEmail = e.target.value;
                                        for (const contact of lead.contacts!) {
                                          if (contact.email === foundEmail || contact.work_email === foundEmail || contact.personal_email === foundEmail) {
                                            foundContact = contact;
                                            break;
                                          }
                                        }
                                        if (foundContact) {
                                          handleContactChange(
                                            lead.id,
                                            foundEmail,
                                            `${foundContact.first_name || ''} ${foundContact.last_name || ''}`.trim()
                                          );
                                        }
                                      }}
                                      className="w-full h-7 px-2 text-xs border border-blue-300 rounded bg-blue-50 text-blue-700"
                                    >
                                      {lead.contacts!.flatMap((contact: any, idx: number) => {
                                        // Skip if contact is not a valid object or is an error object
                                        if (!contact || typeof contact !== 'object') return [];
                                        if ('type' in contact && 'loc' in contact && 'msg' in contact) return [];

                                        const emails: JSX.Element[] = [];
                                        const emailVal = typeof contact.email === 'string' ? contact.email : '';
                                        const workEmailVal = typeof contact.work_email === 'string' ? contact.work_email : '';
                                        const personalEmailVal = typeof contact.personal_email === 'string' ? contact.personal_email : '';

                                        // Add main email field
                                        if (emailVal) {
                                          emails.push(
                                            <option key={`${idx}-email`} value={emailVal}>
                                              {emailVal}
                                            </option>
                                          );
                                        }
                                        // Add work email if different from main email
                                        if (workEmailVal && workEmailVal !== emailVal) {
                                          emails.push(
                                            <option key={`${idx}-work`} value={workEmailVal}>
                                              {workEmailVal}
                                            </option>
                                          );
                                        }
                                        // Add personal email if different from both
                                        if (personalEmailVal && personalEmailVal !== emailVal && personalEmailVal !== workEmailVal) {
                                          emails.push(
                                            <option key={`${idx}-personal`} value={personalEmailVal}>
                                              {personalEmailVal}
                                            </option>
                                          );
                                        }
                                        return emails;
                                      })}
                                    </select>
                                  ) : (
                                    <select
                                      disabled
                                      className="w-full h-7 px-2 text-xs border border-orange-300 rounded bg-orange-100 text-orange-600"
                                    >
                                      <option>No Contact</option>
                                    </select>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-gray-600">{getCountryName()}</td>
                                <td className="px-3 py-2 text-gray-600">{getStateName()}</td>
                                <td className="px-3 py-2 text-gray-600">{getCityName()}</td>
                                <td className="px-3 py-2 text-gray-600">{getGroupName()}</td>
                                <td className="px-3 py-2 text-gray-600">{getIndustryName()}</td>
                                <td className="px-3 py-2 text-gray-600">{getSalesRepName()}</td>
                                <td className="px-3 py-2 text-gray-600">{getLeadSourceName()}</td>
                                <td className="px-3 py-2">{typeof lead.lead_status === 'string' ? lead.lead_status : ''}</td>
                                <td className="px-3 py-2 text-center">
                                  <a
                                    href={`/leads/${lead.id}/customer-requirement`}
                                    className="inline-flex p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                                    title="Customer Requirement Information"
                                  >
                                    <ClipboardList className="w-4 h-4" />
                                  </a>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Records per page:</label>
                      <select
                        value={perPage}
                        onChange={(e) => {
                          setPerPage(parseInt(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="h-8 px-2 text-sm border rounded"
                      >
                        {[30, 50, 100, 200, 500, 1000].map((size) => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages} ({totalLeads} total)
                      </span>
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>

                {/* Selected Count */}
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Users className="w-4 h-4" />
                  <span>{selectedLeads.size} leads selected</span>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="border rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Email Sent To</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Attachments</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Sent On</th>
                      <th className="px-3 py-2 text-center font-medium text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {emailHistory.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-3 py-8 text-center text-gray-500">No email history found</td>
                      </tr>
                    ) : (
                      emailHistory.filter((e: any) => e && typeof e === 'object' && !('loc' in e && 'msg' in e) && e.id).map((email) => (
                        <tr key={email.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2">{typeof email.lead_name === 'string' ? email.lead_name : ''}</td>
                          <td className="px-3 py-2">
                            {Array.isArray(email.attachments) && email.attachments.filter((a: any) => typeof a === 'string').map((att, idx) => (
                              <a key={idx} href={att} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
                                {att.split('/').pop()}
                              </a>
                            ))}
                          </td>
                          <td className="px-3 py-2">{email.sent_at ? new Date(email.sent_at).toLocaleString() : ''}</td>
                          <td className="px-3 py-2 text-center">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Eye className="w-4 h-4 inline" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="border rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">No.</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Action By</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Action</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Date & Time</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-gray-500">No audit trail found</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Bulk Email</h2>
              <button onClick={() => setShowEmailModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex items-center gap-3">
                <label className="w-16 text-sm font-medium text-gray-600">To:</label>
                <input
                  type="text"
                  value={emailForm.to}
                  readOnly
                  className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded bg-gray-50"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="w-16 text-sm font-medium text-gray-600">CC:</label>
                <input
                  type="text"
                  value={emailForm.cc}
                  onChange={(e) => setEmailForm({ ...emailForm, cc: e.target.value })}
                  placeholder="Enter CC emails (comma separated)"
                  className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="w-16 text-sm font-medium text-gray-600">BCC:</label>
                <input
                  type="text"
                  value={emailForm.bcc}
                  onChange={(e) => setEmailForm({ ...emailForm, bcc: e.target.value })}
                  placeholder="Enter BCC emails (comma separated)"
                  className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="w-16 text-sm font-medium text-gray-600">Subject:</label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded"
                />
              </div>

              {/* Rich Text Editor Toolbar */}
              <div className="flex items-center gap-1 p-2 border rounded-t bg-gray-50">
                <button onClick={() => execCommand('bold')} className="p-2 hover:bg-gray-200 rounded" title="Bold">
                  <Bold className="w-4 h-4" />
                </button>
                <button onClick={() => execCommand('italic')} className="p-2 hover:bg-gray-200 rounded" title="Italic">
                  <Italic className="w-4 h-4" />
                </button>
                <button onClick={() => execCommand('underline')} className="p-2 hover:bg-gray-200 rounded" title="Underline">
                  <Underline className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <button
                  onClick={() => {
                    const url = prompt('Enter URL:');
                    if (url) execCommand('createLink', url);
                  }}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Insert Link"
                >
                  <Link2 className="w-4 h-4" />
                </button>
              </div>

              {/* Rich Text Editor */}
              <div
                ref={editorRef}
                contentEditable
                className="min-h-[300px] p-4 border border-t-0 rounded-b focus:outline-none prose prose-sm max-w-none"
                style={{ fontFamily: 'Noto Sans, Helvetica, Arial, sans-serif', fontSize: '13px', color: '#1F497D' }}
              />

              {/* Attachments */}
              {selectedDocIds.length > 0 && (
                <div className="p-3 bg-gray-50 rounded border">
                  <div className="text-sm font-medium text-gray-600 mb-2">Attachments:</div>
                  <div className="flex flex-wrap gap-2">
                    {documents.filter(d => selectedDocIds.includes(d.id)).map((doc) => (
                      <div key={doc.id} className="flex items-center gap-2 px-2 py-1 bg-white border rounded text-sm">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>{typeof doc.name === 'string' ? doc.name : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 text-sm text-gray-600 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={sending}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {sending ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
