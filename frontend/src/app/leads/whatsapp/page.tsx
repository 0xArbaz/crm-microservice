'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, Eye, Upload, Trash2, MessageSquare, FileText, X, Phone, Download, Printer } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

interface Lead {
  id: number;
  company_name: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  country: string;
  country_id: number;
  state: string;
  state_id: number;
  city: string;
  city_id: number;
  group_id: number;
  industry: string;
  industry_id: number;
  sales_rep: string;
  assigned_to: number;
  lead_source: string;
  source: string;
  lead_status: string;
}

interface Contact {
  id: number;
  name: string;
  phone: string;
  work_phone?: string;
  mobile_phone?: string;
  email: string;
}

interface Document {
  id: number;
  name: string;
  link: string;
  size: string;
  uploaded_at: string;
}

interface SentMessage {
  id: number;
  lead_id: number;
  phone_number: string;
  contact_name: string;
  company_name: string;
  message_body: string;
  template_key: string;
  status: string;
  file_attachment: any;
  sent_at: string;
  created_at: string;
}

interface ReceivedMessage {
  id: number;
  phone_number: string;
  contact_name: string;
  lead_id: number;
  event_type: string;
  response_body: string;
  created_at: string;
}

interface AuditLog {
  id: number;
  user_id: number;
  user_name: string;
  action_type: string;
  comment: string;
  lead_id: number;
  message_id: number;
  created_at: string;
}

interface ConversationMessage {
  id: number;
  direction: string;
  message_body: string;
  template_key: string;
  status: string;
  file_attachment: any;
  created_at: string;
}

// WhatsApp message templates
const whatsappTemplates = [
  { value: 'axie_intro_001', label: 'Test Intro.' },
  { value: 'test_axiever', label: 'Test Axiever' },
  { value: 'custom', label: 'Custom' },
];

export default function WhatsAppMarketingPage() {
  const { user } = useAuthStore();

  // Tabs
  const [activeTab, setActiveTab] = useState<'send' | 'sent' | 'received' | 'audit'>('send');

  // Send Message Form
  const [selectedLeadId, setSelectedLeadId] = useState<string>('0');
  const [selectedContactId, setSelectedContactId] = useState<string>('0');
  const [selectedContactNumber, setSelectedContactNumber] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('axie_intro_001');
  const [customMessage, setCustomMessage] = useState<string>('');

  // Company/Contact dropdowns
  const [leadList, setLeadList] = useState<Lead[]>([]);
  const [contactList, setContactList] = useState<Contact[]>([]);

  // Documents
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docFile, setDocFile] = useState<File | null>(null);
  const docFileRef = useRef<HTMLInputElement>(null);

  // Leads Table
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [perPage, setPerPage] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    log_name: '',
    log_phone: '',
    log_country: '',
    log_state: '',
    log_city: '',
    log_group: '',
    log_industry: '',
    log_sales: '',
    log_source: '',
    log_status: '',
  });

  // Filter options
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [industries, setIndustries] = useState<any[]>([]);
  const [salesReps, setSalesReps] = useState<any[]>([]);
  const [leadSources, setLeadSources] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);

  // Sent/Received messages
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);
  const [receivedMessages, setReceivedMessages] = useState<ReceivedMessage[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Conversation Modal
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [conversationPhone, setConversationPhone] = useState('');
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const conversationBodyRef = useRef<HTMLDivElement>(null);

  // Custom Message Modal
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Sending state
  const [sending, setSending] = useState(false);

  // Load initial data
  useEffect(() => {
    loadFilterOptions();
    loadDocuments();
    loadLeadList();
    loadLeads();
  }, []);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'sent') {
      loadSentMessages();
    } else if (activeTab === 'received') {
      loadReceivedMessages();
    } else if (activeTab === 'audit') {
      loadAuditLogs();
    }
  }, [activeTab]);

  // Load contacts when lead is selected
  useEffect(() => {
    if (selectedLeadId && selectedLeadId !== '0') {
      loadContacts(parseInt(selectedLeadId));
    } else {
      setContactList([]);
      setSelectedContactId('0');
      setSelectedContactNumber('');
    }
  }, [selectedLeadId]);

  const loadFilterOptions = async () => {
    try {
      // Load countries
      const countriesData = await api.getCountries().catch(() => []);
      setCountries(Array.isArray(countriesData) ? countriesData.filter((c: any) => c && c.id) : []);

      // Load option categories
      const optionsWithDropdowns = await api.getOptionsWithDropdowns().catch(() => []);
      const validOptions = Array.isArray(optionsWithDropdowns) ? optionsWithDropdowns.filter((o: any) => o && o.id) : [];

      const industryOption = validOptions.find((o: any) => o.title?.toLowerCase() === 'industry');
      const groupOption = validOptions.find((o: any) => o.title?.toLowerCase() === 'group');
      const leadSourceOption = validOptions.find((o: any) => o.title?.toLowerCase() === 'lead source' || o.title?.toLowerCase() === 'lead_source');
      const statusOption = validOptions.find((o: any) => o.title?.toLowerCase() === 'lead status' || o.title?.toLowerCase() === 'lead_status');

      setIndustries(industryOption?.dropdowns?.filter((d: any) => d && d.id) || []);
      setGroups(groupOption?.dropdowns?.filter((d: any) => d && d.id) || []);
      setLeadSources(leadSourceOption?.dropdowns?.filter((d: any) => d && d.id) || []);
      setStatuses(statusOption?.dropdowns?.filter((d: any) => d && d.id) || []);

      // Load sales reps
      const users = await api.getUsers().catch(() => []);
      setSalesReps(Array.isArray(users) ? users.filter((u: any) => u && u.id) : []);
    } catch (error) {
      console.error('Failed to load filter options:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      const docs = await api.getWhatsAppDocuments().catch(() => []);
      const validDocs = Array.isArray(docs) ? docs.filter((d: any) => d && d.id) : [];
      setDocuments(validDocs.map((d: any) => ({
        id: d.id,
        name: d.name,
        link: d.url,
        size: `${Math.round((d.size || 0) / 1024)} KB`,
        uploaded_at: d.created_at ? new Date(d.created_at).toLocaleDateString() : '',
      })));
    } catch (error) {
      console.error('Failed to load documents:', error);
      setDocuments([]);
    }
  };

  const loadLeadList = async () => {
    try {
      // Load all leads by paginating through results (backend limit is 100 per page)
      let allLeads: Lead[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await api.getLeads({ page, page_size: 100 });
        const items = response.items || [];
        allLeads = [...allLeads, ...items.filter((l: any) => l && l.id && l.company_name)];
        hasMore = items.length === 100;
        page++;
        // Safety limit to prevent infinite loops
        if (page > 50) break;
      }

      setLeadList(allLeads);
    } catch (error) {
      console.error('Failed to load lead list:', error);
      setLeadList([]);
    }
  };

  const loadContacts = async (leadId: number) => {
    try {
      const response = await api.getLeadContactsForWhatsApp(leadId);
      setContactList(response.contacts || []);
    } catch (error) {
      console.error('Failed to load contacts:', error);
      setContactList([]);
    }
  };

  const loadLeads = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        page_size: perPage,
      };

      if (filters.log_name) params.search = filters.log_name;
      if (filters.log_country) params.country_id = parseInt(filters.log_country);
      if (filters.log_state) params.state_id = parseInt(filters.log_state);
      if (filters.log_city) params.city_id = parseInt(filters.log_city);
      if (filters.log_group) params.group_id = parseInt(filters.log_group);
      if (filters.log_industry) params.industry_id = parseInt(filters.log_industry);
      if (filters.log_sales) params.sales_rep = parseInt(filters.log_sales);
      if (filters.log_source) params.lead_source = filters.log_source;
      if (filters.log_status) params.lead_status = filters.log_status;

      const response = await api.getWhatsAppLeads(params);
      setLeads(response.items || []);
      setTotalLeads(response.total || 0);
    } catch (error) {
      console.error('Failed to load leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSentMessages = async () => {
    try {
      const messages = await api.getWhatsAppSentMessages();
      setSentMessages(Array.isArray(messages) ? messages : []);
    } catch (error) {
      console.error('Failed to load sent messages:', error);
      setSentMessages([]);
    }
  };

  const loadReceivedMessages = async () => {
    try {
      const messages = await api.getWhatsAppReceivedMessages();
      setReceivedMessages(Array.isArray(messages) ? messages : []);
    } catch (error) {
      console.error('Failed to load received messages:', error);
      setReceivedMessages([]);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const logs = await api.getWhatsAppAuditLog();
      setAuditLogs(Array.isArray(logs) ? logs : []);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      setAuditLogs([]);
    }
  };

  const handleCountryChange = async (countryId: string) => {
    setFilters({ ...filters, log_country: countryId, log_state: '', log_city: '' });
    if (countryId) {
      try {
        const statesData = await api.getStates(parseInt(countryId));
        setStates(Array.isArray(statesData) ? statesData.filter((s: any) => s && s.id) : []);
      } catch {
        setStates([]);
      }
    } else {
      setStates([]);
    }
    setCities([]);
  };

  const handleStateChange = async (stateId: string) => {
    setFilters({ ...filters, log_state: stateId, log_city: '' });
    if (stateId) {
      try {
        const citiesData = await api.getCities(parseInt(stateId));
        setCities(Array.isArray(citiesData) ? citiesData.filter((c: any) => c && c.id) : []);
      } catch {
        setCities([]);
      }
    } else {
      setCities([]);
    }
  };

  const handleUploadDocument = async () => {
    if (!docFile) {
      alert('Please select a file to upload.');
      return;
    }

    setUploadingDoc(true);
    try {
      const result = await api.uploadWhatsAppDocument(docFile);
      if (result.success && result.document) {
        setDocuments([...documents, result.document]);
        setDocFile(null);
        if (docFileRef.current) docFileRef.current.value = '';
      } else {
        alert('Upload failed.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed.');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId: number) => {
    if (!confirm('Remove this document?')) return;
    try {
      await api.deleteWhatsAppDocument(docId);
      setDocuments(documents.filter(d => d.id !== docId));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete document.');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      const newSelected = new Set<number>();
      leads.forEach(lead => {
        if (lead.phone) {
          newSelected.add(lead.id);
        }
      });
      setSelectedLeads(newSelected);
    } else {
      setSelectedLeads(new Set());
    }
  };

  const handleLeadSelect = (leadId: number, checked: boolean) => {
    const newSelected = new Set(selectedLeads);
    if (checked) {
      newSelected.add(leadId);
    } else {
      newSelected.delete(leadId);
    }
    setSelectedLeads(newSelected);
    setSelectAll(newSelected.size === leads.filter(l => l.phone).length);
  };

  const getUploadedDocuments = (): { link: string }[] => {
    return documents.map(doc => ({ link: doc.link }));
  };

  const handleSendWhatsApp = async () => {
    if (selectedLeadId === '0' || selectedContactId === '0' || !selectedContactNumber) {
      alert('Please select company, contact, and ensure contact number is available.');
      return;
    }

    if (selectedTemplate === 'custom') {
      setShowCustomModal(true);
      return;
    }

    await sendWhatsAppMessage(selectedTemplate, null);
  };

  const handleSendCustomMessage = async () => {
    if (!customMessage.trim()) {
      alert('Please enter a message.');
      return;
    }

    setShowCustomModal(false);
    await sendWhatsAppMessage('custom', customMessage);
    setCustomMessage('');
  };

  const sendWhatsAppMessage = async (templateKey: string, customMsg: string | null) => {
    setSending(true);
    try {
      const selectedLead = leadList.find(l => l.id === parseInt(selectedLeadId));
      const selectedContact = contactList.find(c => c.id === parseInt(selectedContactId));

      const recipients = [{
        number: selectedContactNumber,
        lead_id: parseInt(selectedLeadId),
        name: selectedContact?.name || '',
        company: selectedLead?.company_name || '',
      }];

      const result = await api.sendWhatsAppAdvanced({
        recipients,
        template_key: templateKey,
        documents: getUploadedDocuments(),
        custom_message: customMsg || undefined,
      });

      if (result.status === 'sent') {
        alert('WhatsApp message sent successfully!');
      } else if (result.status === 'partial') {
        alert('Some WhatsApp messages were sent, some failed.');
      } else {
        alert('WhatsApp message failed. Please check template or attachment.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send WhatsApp message.');
    } finally {
      setSending(false);
    }
  };

  const handleSendBulkWhatsApp = async () => {
    if (selectedLeads.size === 0) {
      alert('Please select at least one contact with a valid number.');
      return;
    }

    const recipients = leads
      .filter(lead => selectedLeads.has(lead.id) && lead.phone)
      .map(lead => ({
        number: lead.phone,
        lead_id: lead.id,
        name: lead.company_name,
        company: lead.company_name,
      }));

    if (recipients.length === 0) {
      alert('No valid phone numbers found.');
      return;
    }

    setSending(true);
    try {
      const result = await api.sendWhatsAppAdvanced({
        recipients,
        template_key: selectedTemplate,
        documents: getUploadedDocuments(),
        custom_message: selectedTemplate === 'custom' ? customMessage : undefined,
      });

      alert(result.message || 'WhatsApp messages sent!');
      setSelectedLeads(new Set());
      setSelectAll(false);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send WhatsApp messages.');
    } finally {
      setSending(false);
    }
  };

  const openConversation = async (phoneNumber: string) => {
    setConversationPhone(phoneNumber);
    try {
      const messages = await api.getWhatsAppConversation(phoneNumber);
      setConversationMessages(Array.isArray(messages) ? messages : []);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      setConversationMessages([]);
    }
    setShowConversationModal(true);
  };

  const handleSendConversationMessage = async () => {
    if (!chatMessage.trim()) return;

    try {
      await api.sendWhatsAppConversationMessage(conversationPhone, chatMessage);
      setChatMessage('');
      // Reload conversation
      const messages = await api.getWhatsAppConversation(conversationPhone);
      setConversationMessages(Array.isArray(messages) ? messages : []);
      // Scroll to bottom
      if (conversationBodyRef.current) {
        conversationBodyRef.current.scrollTop = conversationBodyRef.current.scrollHeight;
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Message not sent!');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="text-gray-400" title="Pending">⏳</span>;
      case 'sent':
      case 'accepted':
        return <span className="text-gray-600" title="Sent">✓</span>;
      case 'delivered':
        return <span className="text-gray-600" title="Delivered">✓✓</span>;
      case 'read':
        return <span className="text-blue-500" title="Read">✓✓</span>;
      case 'failed':
        return <span className="text-red-500" title="Failed">❌</span>;
      default:
        return null;
    }
  };

  const totalPages = Math.ceil(totalLeads / perPage);

  return (
    <MainLayout>
      <div className="space-y-0">
        {/* Header */}
        <div className="bg-blue-600 px-4 py-3">
          <h1 className="text-lg font-bold text-white">WhatsApp Marketing</h1>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-b-lg shadow-sm border border-t-0">
          <div className="bg-gray-100 px-2 pt-2">
            <nav className="flex gap-1">
              <button
                onClick={() => setActiveTab('send')}
                className={`px-4 py-2 text-sm font-medium rounded-t ${
                  activeTab === 'send'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                Send Message
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`px-4 py-2 text-sm font-medium rounded-t ${
                  activeTab === 'sent'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                Sent Message
              </button>
              <button
                onClick={() => setActiveTab('received')}
                className={`px-4 py-2 text-sm font-medium rounded-t ${
                  activeTab === 'received'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                Received Message
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
            {/* Send Message Tab */}
            {activeTab === 'send' && (
              <div className="space-y-4">
                {/* Top Section - Two Columns */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column - Company/Contact/Template Selection */}
                  <div className="space-y-3">
                    {/* Company Name */}
                    <div className="flex items-center gap-3">
                      <label className="w-40 text-sm font-medium text-blue-600">Company Name</label>
                      <select
                        value={selectedLeadId}
                        onChange={(e) => setSelectedLeadId(e.target.value)}
                        className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="0">Select Company Name</option>
                        {leadList.map((lead) => (
                          <option key={lead.id} value={lead.id}>{lead.company_name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Contact Name */}
                    <div className="flex items-center gap-3">
                      <label className="w-40 text-sm font-medium text-blue-600">Contact Name</label>
                      <select
                        value={selectedContactId}
                        onChange={(e) => {
                          setSelectedContactId(e.target.value);
                          const contact = contactList.find(c => c.id === parseInt(e.target.value));
                          // Auto-select first available phone number
                          const firstPhone = contact?.phone || contact?.work_phone || contact?.mobile_phone || '';
                          setSelectedContactNumber(firstPhone);
                        }}
                        className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="0">Select Contact Name</option>
                        {contactList.map((contact) => (
                          <option key={contact.id} value={contact.id}>{contact.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Contact Number */}
                    <div className="flex items-center gap-3">
                      <label className="w-40 text-sm font-medium text-blue-600">Contact Number</label>
                      <select
                        value={selectedContactNumber}
                        onChange={(e) => setSelectedContactNumber(e.target.value)}
                        className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select Contact Number</option>
                        {(() => {
                          const contact = contactList.find(c => c.id === parseInt(selectedContactId));
                          if (!contact) return null;
                          const phones: string[] = [];
                          if (contact.phone) phones.push(contact.phone);
                          if (contact.work_phone && contact.work_phone !== contact.phone) phones.push(contact.work_phone);
                          if (contact.mobile_phone && contact.mobile_phone !== contact.phone && contact.mobile_phone !== contact.work_phone) phones.push(contact.mobile_phone);
                          return phones.map((phone, idx) => (
                            <option key={idx} value={phone}>{phone}</option>
                          ));
                        })()}
                      </select>
                    </div>

                    {/* WhatsApp Template */}
                    <div className="flex items-center gap-3">
                      <label className="w-40 text-sm font-medium text-blue-600">WhatsApp Message Template</label>
                      <div className="flex-1 flex gap-2">
                        <select
                          value={selectedTemplate}
                          onChange={(e) => setSelectedTemplate(e.target.value)}
                          className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {whatsappTemplates.map((template) => (
                            <option key={template.value} value={template.value}>{template.label}</option>
                          ))}
                        </select>
                        {selectedTemplate !== 'custom' ? (
                          <button
                            onClick={handleSendWhatsApp}
                            disabled={sending}
                            className="px-3 h-9 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center disabled:opacity-50"
                            title="Send WhatsApp Message"
                          >
                            <MessageSquare className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setShowCustomModal(true)}
                            className="px-3 h-9 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center"
                            title="Custom WhatsApp Message"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Documents */}
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
                              <td className="px-3 py-2">{doc.name}</td>
                              <td className="px-3 py-2">
                                <a href={doc.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  View
                                </a>
                              </td>
                              <td className="px-3 py-2 text-gray-500">{doc.size}</td>
                              <td className="px-3 py-2 text-gray-500">{doc.uploaded_at}</td>
                              <td className="px-3 py-2 text-center">
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
                          <th className="px-3 py-2 text-left font-medium">Company</th>
                          <th className="px-3 py-2 text-left font-medium">WhatsApp Contact</th>
                          <th className="px-3 py-2 text-left font-medium">Country</th>
                          <th className="px-3 py-2 text-left font-medium">State/Province</th>
                          <th className="px-3 py-2 text-left font-medium">City</th>
                          <th className="px-3 py-2 text-left font-medium">Group</th>
                          <th className="px-3 py-2 text-left font-medium">Industry</th>
                          <th className="px-3 py-2 text-left font-medium">Sales Rep</th>
                          <th className="px-3 py-2 text-left font-medium">Lead Source</th>
                          <th className="px-3 py-2 text-left font-medium">Status</th>
                          <th className="px-3 py-2 text-center font-medium">Action</th>
                        </tr>
                        {/* Filter Row */}
                        <tr className="bg-gray-100">
                          <td className="px-3 py-2"></td>
                          <td className="px-3 py-1">
                            <input
                              type="text"
                              placeholder="Company"
                              value={filters.log_name}
                              onChange={(e) => setFilters({ ...filters, log_name: e.target.value })}
                              className="w-full h-7 px-2 text-xs border rounded"
                            />
                          </td>
                          <td className="px-3 py-1">
                            <input
                              type="text"
                              placeholder="WhatsApp Contact"
                              value={filters.log_phone}
                              onChange={(e) => setFilters({ ...filters, log_phone: e.target.value })}
                              className="w-full h-7 px-2 text-xs border rounded"
                            />
                          </td>
                          <td className="px-3 py-1">
                            <select
                              value={filters.log_country}
                              onChange={(e) => handleCountryChange(e.target.value)}
                              className="w-full h-7 px-1 text-xs border rounded bg-green-100"
                            >
                              <option value="">Country</option>
                              {countries.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-1">
                            <select
                              value={filters.log_state}
                              onChange={(e) => handleStateChange(e.target.value)}
                              className="w-full h-7 px-1 text-xs border rounded bg-green-100"
                            >
                              <option value="">State</option>
                              {states.map((s: any) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-1">
                            <select
                              value={filters.log_city}
                              onChange={(e) => setFilters({ ...filters, log_city: e.target.value })}
                              className="w-full h-7 px-1 text-xs border rounded bg-green-100"
                            >
                              <option value="">City</option>
                              {cities.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-1">
                            <select
                              value={filters.log_group}
                              onChange={(e) => setFilters({ ...filters, log_group: e.target.value })}
                              className="w-full h-7 px-1 text-xs border rounded bg-green-100"
                            >
                              <option value="">Group</option>
                              {groups.map((g: any) => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-1">
                            <select
                              value={filters.log_industry}
                              onChange={(e) => setFilters({ ...filters, log_industry: e.target.value })}
                              className="w-full h-7 px-1 text-xs border rounded bg-green-100"
                            >
                              <option value="">Industry</option>
                              {industries.map((i: any) => (
                                <option key={i.id} value={i.id}>{i.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-1">
                            <select
                              value={filters.log_sales}
                              onChange={(e) => setFilters({ ...filters, log_sales: e.target.value })}
                              className="w-full h-7 px-1 text-xs border rounded bg-green-100"
                            >
                              <option value="">Sales Rep</option>
                              {salesReps.map((s: any) => (
                                <option key={s.id} value={s.id}>{s.full_name || s.email}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-1">
                            <select
                              value={filters.log_source}
                              onChange={(e) => setFilters({ ...filters, log_source: e.target.value })}
                              className="w-full h-7 px-1 text-xs border rounded bg-green-100"
                            >
                              <option value="">Lead Source</option>
                              {leadSources.map((l: any) => (
                                <option key={l.id} value={l.name}>{l.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-1">
                            <select
                              value={filters.log_status}
                              onChange={(e) => setFilters({ ...filters, log_status: e.target.value })}
                              className="w-full h-7 px-1 text-xs border rounded bg-green-100"
                            >
                              <option value="">Status</option>
                              {statuses.map((s: any) => (
                                <option key={s.id} value={s.name}>{s.name}</option>
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
                          leads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedLeads.has(lead.id)}
                                  disabled={!lead.phone}
                                  onChange={(e) => handleLeadSelect(lead.id, e.target.checked)}
                                />
                              </td>
                              <td className="px-3 py-2 font-medium">{lead.company_name || ''}</td>
                              <td className="px-3 py-2">{lead.phone || ''}</td>
                              <td className="px-3 py-2 text-gray-600">{lead.country || ''}</td>
                              <td className="px-3 py-2 text-gray-600">{lead.state || ''}</td>
                              <td className="px-3 py-2 text-gray-600">{lead.city || ''}</td>
                              <td className="px-3 py-2 text-gray-600">
                                {groups.find((g: any) => g.id === lead.group_id)?.name || ''}
                              </td>
                              <td className="px-3 py-2 text-gray-600">{lead.industry || ''}</td>
                              <td className="px-3 py-2 text-gray-600">{lead.sales_rep || ''}</td>
                              <td className="px-3 py-2 text-gray-600">{lead.lead_source || lead.source || ''}</td>
                              <td className="px-3 py-2">{lead.lead_status || ''}</td>
                              <td className="px-3 py-2 text-center"></td>
                            </tr>
                          ))
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
                        {[30, 50, 100, 200, 500].map((size) => (
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

                {/* Send WhatsApp Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleSendBulkWhatsApp}
                    disabled={sending || selectedLeads.size === 0}
                    className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    <MessageSquare className="w-5 h-5" />
                    {sending ? 'Sending...' : 'Send WhatsApp'}
                  </button>
                </div>
              </div>
            )}

            {/* Sent Message Tab */}
            {activeTab === 'sent' && (
              <div className="border rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Phone No.</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Message Sent To</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Attachments</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Sent On</th>
                      <th className="px-3 py-2 text-center font-medium text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {sentMessages.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-3 py-8 text-center text-gray-500">No sent messages found</td>
                      </tr>
                    ) : (
                      sentMessages.map((msg) => (
                        <tr key={msg.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2">{msg.phone_number}</td>
                          <td className="px-3 py-2">{msg.contact_name || msg.company_name}</td>
                          <td className="px-3 py-2">
                            {msg.file_attachment && Array.isArray(msg.file_attachment) ? (
                              msg.file_attachment.map((att: any, idx: number) => (
                                <a key={idx} href={att.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
                                  view
                                </a>
                              ))
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2">{msg.sent_at ? new Date(msg.sent_at).toLocaleDateString() : ''}</td>
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={() => openConversation(msg.phone_number)}
                              className="text-blue-600 hover:text-blue-800"
                              title="View"
                            >
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

            {/* Received Message Tab */}
            {activeTab === 'received' && (
              <div className="border rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Phone No.</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Contact Name</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Interest</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Received On</th>
                      <th className="px-3 py-2 text-center font-medium text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {receivedMessages.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-3 py-8 text-center text-gray-500">No received messages found</td>
                      </tr>
                    ) : (
                      receivedMessages.map((msg) => (
                        <tr key={msg.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2">{msg.phone_number}</td>
                          <td className="px-3 py-2">{msg.contact_name || '—'}</td>
                          <td className="px-3 py-2">
                            {msg.event_type === 'interested' ? (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Interested</span>
                            ) : msg.event_type === 'not_interested' ? (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Not Interested</span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{msg.event_type}</span>
                            )}
                          </td>
                          <td className="px-3 py-2">{msg.created_at ? new Date(msg.created_at).toLocaleDateString() : ''}</td>
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={() => openConversation(msg.phone_number)}
                              className="text-blue-600 hover:text-blue-800"
                              title="View Conversation"
                            >
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

            {/* Audit Trail Tab */}
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
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-3 py-8 text-center text-gray-500">No audit trail found</td>
                      </tr>
                    ) : (
                      auditLogs.map((log, index) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2">{index + 1}</td>
                          <td className="px-3 py-2">{log.user_name}</td>
                          <td className="px-3 py-2">{log.action_type}</td>
                          <td className="px-3 py-2">{log.created_at ? new Date(log.created_at).toLocaleString() : ''}</td>
                          <td className="px-3 py-2">{log.comment}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conversation Modal */}
      {showConversationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Conversation</h2>
              <div className="flex items-center gap-2">
                <button
                  className="p-2 text-gray-600 hover:text-gray-800"
                  title="Print PDF"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button onClick={() => setShowConversationModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div ref={conversationBodyRef} className="flex-1 overflow-y-auto p-6" style={{ maxHeight: '500px' }}>
              {conversationMessages.length === 0 ? (
                <p className="text-center text-gray-500">No messages found.</p>
              ) : (
                conversationMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex mb-3 ${msg.direction === 'inbound' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${
                        msg.direction === 'inbound' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">{msg.message_body || '—'}</div>
                      {msg.file_attachment && (
                        <div className="mt-2">
                          {(Array.isArray(msg.file_attachment) ? msg.file_attachment : [msg.file_attachment]).map((att: any, idx: number) => (
                            <a key={idx} href={att.link || att} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs block">
                              View attachment
                            </a>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-end gap-1 mt-2 text-xs text-gray-500">
                        <span>{msg.created_at ? new Date(msg.created_at).toLocaleString() : ''}</span>
                        {msg.direction === 'outbound' && getStatusIcon(msg.status)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center gap-3 px-6 py-4 border-t">
              <textarea
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendConversationMessage();
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 h-10 px-4 py-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={handleSendConversationMessage}
                className="px-4 h-10 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Message Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Send Custom WhatsApp Message</h2>
              <button onClick={() => setShowCustomModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Type your custom message..."
                className="w-full h-40 px-4 py-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 text-sm text-gray-600 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSendCustomMessage}
                disabled={sending}
                className="px-4 py-2 text-sm text-white bg-green-500 rounded hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
