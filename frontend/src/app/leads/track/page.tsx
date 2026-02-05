'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Minus, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import api from '@/lib/api';
import { Lead } from '@/types';

// Dropdown Options
const countryOptions = [
  { value: '', label: 'Country' },
  { value: 'India', label: 'India' },
  { value: 'Oman', label: 'Oman' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Iran', label: 'Iran' },
  { value: 'United Arab Emirates', label: 'United Arab Emirates' },
  { value: 'USA', label: 'USA' },
];

const stateOptions = [
  { value: '', label: 'State' },
  { value: 'Maharashtra', label: 'Maharashtra' },
  { value: 'Jharkhand', label: 'Jharkhand' },
  { value: 'Ontario', label: 'Ontario' },
  { value: 'Alberta', label: 'Alberta' },
  { value: 'Dubai', label: 'Dubai' },
  { value: 'Fars', label: 'Fars' },
  { value: 'Sultanate of Oman', label: 'Sultanate of Oman' },
];

const cityOptions = [
  { value: '', label: 'City' },
  { value: 'Mumbai', label: 'Mumbai' },
  { value: 'Pune', label: 'Pune' },
  { value: 'Dhanbad', label: 'Dhanbad' },
  { value: 'Ranchi', label: 'Ranchi' },
  { value: 'Mississauga', label: 'Mississauga' },
  { value: 'Dobroste', label: 'Dobroste' },
  { value: 'Muscat', label: 'Muscat' },
  { value: 'Koderma', label: 'Koderma' },
  { value: 'Aliavo', label: 'Aliavo' },
];

const groupOptions = [
  { value: '', label: 'Group' },
  { value: 'Broker Real Estate', label: 'Broker Real Estate' },
  { value: 'Trader', label: 'Trader' },
  { value: 'Other', label: 'Other' },
  { value: 'dataentry', label: 'dataentry' },
  { value: 'New', label: 'New' },
];

const industryOptions = [
  { value: '', label: 'Industry' },
  { value: 'Real Estate', label: 'Real Estate' },
  { value: 'Consumer Products', label: 'Consumer Products' },
  { value: 'Distribution', label: 'Distribution' },
  { value: 'Information Technology', label: 'Information Technology' },
  { value: 'Services', label: 'Services' },
  { value: 'Oil & Gas', label: 'Oil & Gas' },
];

const salesRepOptions = [
  { value: '', label: 'Sales Rep.' },
  { value: 'Hamza Manzoor', label: 'Hamza Manzoor' },
  { value: 'Adil Ahmed', label: 'Adil Ahmed' },
  { value: 'Junaid Ali', label: 'Junaid Ali' },
  { value: 'Vidushi Dubey', label: 'Vidushi Dubey' },
  { value: 'Mohammed Umar', label: 'Mohammed Umar' },
];

interface LeadContact {
  id: number;
  first_name: string;
  last_name?: string;
  designation?: string;
  work_phone?: string;
  cell_phone?: string;
  work_email?: string;
  contact_type?: string;
}

interface LeadActivity {
  id: number;
  activity_type: string;
  subject: string;
  description?: string;
  activity_date: string;
  is_completed: boolean;
}

interface LeadMemo {
  id: number;
  title?: string;
  details?: string;
  created_at: string;
}

interface LeadDocument {
  id: number;
  name: string;
  original_name: string;
  file_type?: string;
  size?: number;
  created_at: string;
}

type TabType = 'details' | 'contacts' | 'open_activities' | 'closed_activities' | 'attachments' | 'memo';

export default function TrackLeadPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<{ [key: number]: TabType }>({});
  const [expandedContacts, setExpandedContacts] = useState<Set<string>>(new Set());

  // Lead details cache
  const [leadContacts, setLeadContacts] = useState<{ [key: number]: LeadContact[] }>({});
  const [leadActivities, setLeadActivities] = useState<{ [key: number]: LeadActivity[] }>({});
  const [leadMemos, setLeadMemos] = useState<{ [key: number]: LeadMemo[] }>({});
  const [leadDocuments, setLeadDocuments] = useState<{ [key: number]: LeadDocument[] }>({});

  // Filter states
  const [filters, setFilters] = useState({
    companyName: '',
    country: '',
    state: '',
    city: '',
    phone: '',
    group: '',
    industry: '',
    salesRep: '',
  });

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params: any = { page, page_size: 20, status: 0 };
      if (filters.companyName) params.search = filters.companyName;

      const response = await api.getLeads(params);
      setLeads(response.items);
      setTotalPages(response.total_pages);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchLeads();
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const toggleRow = async (leadId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(leadId)) {
      newExpanded.delete(leadId);
    } else {
      newExpanded.add(leadId);
      // Set default tab
      if (!activeTab[leadId]) {
        setActiveTab(prev => ({ ...prev, [leadId]: 'details' }));
      }
      // Load data if not cached
      await loadLeadData(leadId);
    }
    setExpandedRows(newExpanded);
  };

  const loadLeadData = async (leadId: number) => {
    try {
      // Load contacts
      if (!leadContacts[leadId]) {
        const contacts = await api.getLeadContactsForEdit(leadId);
        setLeadContacts(prev => ({ ...prev, [leadId]: contacts }));
      }
      // Load activities
      if (!leadActivities[leadId]) {
        const activities = await api.getLeadActivitiesForEdit(leadId);
        setLeadActivities(prev => ({ ...prev, [leadId]: activities }));
      }
      // Load memos
      if (!leadMemos[leadId]) {
        const memos = await api.getLeadMemos(leadId);
        setLeadMemos(prev => ({ ...prev, [leadId]: memos }));
      }
      // Load documents
      if (!leadDocuments[leadId]) {
        const documents = await api.getLeadDocuments(leadId);
        setLeadDocuments(prev => ({ ...prev, [leadId]: documents }));
      }
    } catch (error) {
      console.error('Failed to load lead data:', error);
    }
  };

  const toggleContact = (leadId: number, contactId: number) => {
    const key = `${leadId}-${contactId}`;
    const newExpanded = new Set(expandedContacts);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedContacts(newExpanded);
  };

  const handleTabChange = (leadId: number, tab: TabType) => {
    setActiveTab(prev => ({ ...prev, [leadId]: tab }));
  };

  const getOpenActivities = (leadId: number) => {
    return (leadActivities[leadId] || []).filter(a => !a.is_completed);
  };

  const getClosedActivities = (leadId: number) => {
    return (leadActivities[leadId] || []).filter(a => a.is_completed);
  };

  // Filter leads based on all filters
  const filteredLeads = leads.filter(lead => {
    if (filters.country && lead.country !== filters.country) return false;
    if (filters.state && lead.state !== filters.state) return false;
    if (filters.city && lead.city !== filters.city) return false;
    if (filters.industry && lead.industry !== filters.industry) return false;
    if (filters.salesRep && lead.sales_rep !== filters.salesRep) return false;
    if (filters.phone && !lead.phone?.includes(filters.phone)) return false;
    return true;
  });

  const renderTabContent = (lead: Lead) => {
    const tab = activeTab[lead.id] || 'details';
    const contacts = leadContacts[lead.id] || [];
    const openActivities = getOpenActivities(lead.id);
    const closedActivities = getClosedActivities(lead.id);
    const memos = leadMemos[lead.id] || [];
    const documents = leadDocuments[lead.id] || [];

    switch (tab) {
      case 'details':
        return (
          <div className="bg-white border border-gray-200">
            <div className="grid grid-cols-2 divide-x divide-gray-200">
              {/* Left Column */}
              <div className="divide-y divide-gray-200">
                <div className="grid grid-cols-3 text-sm">
                  <div className="px-4 py-2 bg-gray-50 text-blue-600 font-medium">Company Name</div>
                  <div className="col-span-2 px-4 py-2 border-l border-gray-200">{lead.company_name || '-'}</div>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <div className="px-4 py-2 bg-gray-50 text-blue-600 font-medium">Address</div>
                  <div className="col-span-2 px-4 py-2 border-l border-gray-200">
                    <div>{lead.address_line1 || '-'}</div>
                    {lead.address_line2 && <div>{lead.address_line2}</div>}
                  </div>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <div className="px-4 py-2 bg-gray-50 text-blue-600 font-medium">Country</div>
                  <div className="col-span-2 px-4 py-2 border-l border-gray-200">{lead.country || '-'}</div>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <div className="px-4 py-2 bg-gray-50 text-blue-600 font-medium">State/Province</div>
                  <div className="col-span-2 px-4 py-2 border-l border-gray-200">{lead.state || '-'}</div>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <div className="px-4 py-2 bg-gray-50 text-blue-600 font-medium">City</div>
                  <div className="col-span-2 px-4 py-2 border-l border-gray-200">{lead.city || '-'}</div>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <div className="px-4 py-2 bg-gray-50 text-blue-600 font-medium">Postal/Zip Code</div>
                  <div className="col-span-2 px-4 py-2 border-l border-gray-200">{lead.zip_code || lead.pincode || '-'}</div>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <div className="px-4 py-2 bg-gray-50 text-blue-600 font-medium">Phone</div>
                  <div className="col-span-2 px-4 py-2 border-l border-gray-200">{lead.phone || '-'}</div>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <div className="px-4 py-2 bg-gray-50 text-blue-600 font-medium">Fax</div>
                  <div className="col-span-2 px-4 py-2 border-l border-gray-200">{lead.fax || '-'}</div>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <div className="px-4 py-2 bg-gray-50 text-blue-600 font-medium">Website</div>
                  <div className="col-span-2 px-4 py-2 border-l border-gray-200">{lead.website || '-'}</div>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <div className="px-4 py-2 bg-gray-50 text-blue-600 font-medium">Name of Rep.</div>
                  <div className="col-span-2 px-4 py-2 border-l border-gray-200">{lead.nof_representative || '-'}</div>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <div className="px-4 py-2 bg-gray-50 text-blue-600 font-medium">Contact Phone</div>
                  <div className="col-span-2 px-4 py-2 border-l border-gray-200">{lead.phone_no || lead.alternate_phone || '-'}</div>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <div className="px-4 py-2 bg-gray-50 text-blue-600 font-medium">Email ID</div>
                  <div className="col-span-2 px-4 py-2 border-l border-gray-200">{lead.email || '-'}</div>
                </div>
              </div>

              {/* Right Column */}
              <div className="divide-y divide-gray-200">
                <div className="grid grid-cols-3 text-sm">
                  <div className="px-4 py-2 bg-gray-50 text-blue-600 font-medium">Lead Registered</div>
                  <div className="col-span-2 px-4 py-2 border-l border-gray-200">
                    {lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-GB') : '-'}
                  </div>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <div className="px-4 py-2 bg-gray-50 text-blue-600 font-medium">Lead Status</div>
                  <div className="col-span-2 px-4 py-2 border-l border-gray-200">{lead.lead_status || '-'}</div>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <div className="px-4 py-2 bg-gray-50 text-blue-600 font-medium">Group</div>
                  <div className="col-span-2 px-4 py-2 border-l border-gray-200">{lead.lead_status || '-'}</div>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <div className="px-4 py-2 bg-gray-50 text-blue-600 font-medium">Industry</div>
                  <div className="col-span-2 px-4 py-2 border-l border-gray-200">{lead.industry || '-'}</div>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <div className="px-4 py-2 bg-gray-50 text-blue-600 font-medium">Company Region</div>
                  <div className="col-span-2 px-4 py-2 border-l border-gray-200">{lead.region_id ? `Region ${lead.region_id}` : '-'}</div>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <div className="px-4 py-2 bg-gray-50 text-blue-600 font-medium">Company Timezone</div>
                  <div className="col-span-2 px-4 py-2 border-l border-gray-200">{lead.timezone || '-'}</div>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <div className="px-4 py-2 bg-gray-50 text-blue-600 font-medium">Sales Representative</div>
                  <div className="col-span-2 px-4 py-2 border-l border-gray-200">{lead.sales_rep || '-'}</div>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <div className="px-4 py-2 bg-gray-50 text-blue-600 font-medium">Lead Source</div>
                  <div className="col-span-2 px-4 py-2 border-l border-gray-200">{lead.lead_source || lead.source || '-'}</div>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <div className="px-4 py-2 bg-gray-50 text-blue-600 font-medium">Remarks</div>
                  <div className="col-span-2 px-4 py-2 border-l border-gray-200">
                    <div className="min-h-[80px]">{lead.remarks || lead.notes || '-'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'contacts':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-700 text-white">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">
                    <Plus className="w-4 h-4 inline mr-1" />Contact
                  </th>
                  <th className="px-3 py-2 text-left font-medium">Designation</th>
                  <th className="px-3 py-2 text-left font-medium">Phone</th>
                  <th className="px-3 py-2 text-left font-medium">Mobile</th>
                  <th className="px-3 py-2 text-left font-medium">Email ID</th>
                  <th className="px-3 py-2 text-left font-medium">Contact Type</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {contacts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-4 text-center text-gray-500">No contacts found</td>
                  </tr>
                ) : (
                  contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <button
                          onClick={() => toggleContact(lead.id, contact.id)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        >
                          {expandedContacts.has(`${lead.id}-${contact.id}`) ? (
                            <Minus className="w-4 h-4" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                          {contact.first_name} {contact.last_name || ''}
                        </button>
                      </td>
                      <td className="px-3 py-2 text-gray-700">{contact.designation || '-'}</td>
                      <td className="px-3 py-2 text-gray-700">{contact.work_phone || '-'}</td>
                      <td className="px-3 py-2 text-gray-700">{contact.cell_phone || '-'}</td>
                      <td className="px-3 py-2 text-blue-600">{contact.work_email || '-'}</td>
                      <td className="px-3 py-2 text-gray-700">{contact.contact_type || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );

      case 'open_activities':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-700 text-white">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Type</th>
                  <th className="px-3 py-2 text-left font-medium">Subject</th>
                  <th className="px-3 py-2 text-left font-medium">Description</th>
                  <th className="px-3 py-2 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {openActivities.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-gray-500">No open activities</td>
                  </tr>
                ) : (
                  openActivities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-700 capitalize">{activity.activity_type}</td>
                      <td className="px-3 py-2 text-gray-700">{activity.subject}</td>
                      <td className="px-3 py-2 text-gray-700">{activity.description || '-'}</td>
                      <td className="px-3 py-2 text-gray-700">{new Date(activity.activity_date).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );

      case 'closed_activities':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-700 text-white">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Type</th>
                  <th className="px-3 py-2 text-left font-medium">Subject</th>
                  <th className="px-3 py-2 text-left font-medium">Description</th>
                  <th className="px-3 py-2 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {closedActivities.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-gray-500">No closed activities</td>
                  </tr>
                ) : (
                  closedActivities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-700 capitalize">{activity.activity_type}</td>
                      <td className="px-3 py-2 text-gray-700">{activity.subject}</td>
                      <td className="px-3 py-2 text-gray-700">{activity.description || '-'}</td>
                      <td className="px-3 py-2 text-gray-700">{new Date(activity.activity_date).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );

      case 'attachments':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-700 text-white">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">File Name</th>
                  <th className="px-3 py-2 text-left font-medium">Original Name</th>
                  <th className="px-3 py-2 text-left font-medium">Type</th>
                  <th className="px-3 py-2 text-left font-medium">Size</th>
                  <th className="px-3 py-2 text-left font-medium">Uploaded</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-gray-500">No attachments</td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-blue-600">{doc.name}</td>
                      <td className="px-3 py-2 text-gray-700">{doc.original_name}</td>
                      <td className="px-3 py-2 text-gray-700">{doc.file_type || '-'}</td>
                      <td className="px-3 py-2 text-gray-700">{doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : '-'}</td>
                      <td className="px-3 py-2 text-gray-700">{new Date(doc.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );

      case 'memo':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-700 text-white">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Title</th>
                  <th className="px-3 py-2 text-left font-medium">Details</th>
                  <th className="px-3 py-2 text-left font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {memos.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-4 text-center text-gray-500">No memos</td>
                  </tr>
                ) : (
                  memos.map((memo) => (
                    <tr key={memo.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-700">{memo.title || '-'}</td>
                      <td className="px-3 py-2 text-gray-700">
                        <div dangerouslySetInnerHTML={{ __html: memo.details || '-' }} className="max-w-md truncate" />
                      </td>
                      <td className="px-3 py-2 text-gray-700">{new Date(memo.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-0">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-3">
          <h1 className="text-lg font-semibold">TRACK LEAD</h1>
        </div>

        {/* Filter Section */}
        <div className="bg-blue-700 px-4 py-3">
          {/* Column Headers */}
          <div className="grid grid-cols-9 gap-2 mb-2 text-white text-xs font-medium">
            <div>Company Name <span className="text-blue-300">&#9660;</span></div>
            <div>Country <span className="text-blue-300">&#9660;</span></div>
            <div>State <span className="text-blue-300">&#9660;</span></div>
            <div>City <span className="text-blue-300">&#9660;</span></div>
            <div>Phone <span className="text-blue-300">&#9660;</span></div>
            <div>Group</div>
            <div>Industry</div>
            <div>Sales Rep.</div>
            <div>Action</div>
          </div>

          {/* Filter Inputs */}
          <div className="grid grid-cols-9 gap-2">
            <input
              type="text"
              placeholder="Company Name"
              value={filters.companyName}
              onChange={(e) => handleFilterChange('companyName', e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <select
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              {countryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              {stateOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              {cityOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Phone"
              value={filters.phone}
              onChange={(e) => handleFilterChange('phone', e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <select
              value={filters.group}
              onChange={(e) => handleFilterChange('group', e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              {groupOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={filters.industry}
              onChange={(e) => handleFilterChange('industry', e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              {industryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={filters.salesRep}
              onChange={(e) => handleFilterChange('salesRep', e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              {salesRepOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={handleSearch}
              className="px-4 py-1.5 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="border-b border-gray-200">
                  {/* Lead Row */}
                  <div className="grid grid-cols-9 gap-2 px-4 py-2 items-center hover:bg-gray-50 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleRow(lead.id)}
                        className={`w-5 h-5 flex items-center justify-center border rounded text-xs font-bold ${
                          expandedRows.has(lead.id)
                            ? 'bg-orange-500 border-orange-500 text-white'
                            : 'bg-green-500 border-green-500 text-white'
                        }`}
                      >
                        {expandedRows.has(lead.id) ? '−' : '+'}
                      </button>
                      <span className="text-blue-600 hover:underline cursor-pointer">
                        {lead.company_name || `${lead.first_name} ${lead.last_name || ''}`}
                      </span>
                    </div>
                    <div className="text-blue-600">{lead.country || '-'}</div>
                    <div className="text-blue-600">{lead.state || '-'}</div>
                    <div className="text-blue-600">{lead.city || '-'}</div>
                    <div className="text-gray-700">{lead.phone || '-'}</div>
                    <div className="text-gray-700">{lead.lead_status || '-'}</div>
                    <div className="text-gray-700">{lead.industry || '-'}</div>
                    <div className="text-gray-700">{lead.sales_rep || '-'}</div>
                    <div>
                      <Link
                        href={`/leads/${lead.id}/edit`}
                        className="inline-flex items-center justify-center w-7 h-7 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedRows.has(lead.id) && (
                    <div className="bg-gray-50 border-t border-gray-200">
                      {/* Tabs */}
                      <div className="flex gap-0.5 px-4 pt-3">
                        <button
                          onClick={() => handleTabChange(lead.id, 'details')}
                          className={`px-4 py-2 text-sm font-medium border-t border-l border-r rounded-t ${
                            (activeTab[lead.id] || 'details') === 'details'
                              ? 'bg-green-500 text-white border-green-500'
                              : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          Lead Details
                        </button>
                        <button
                          onClick={() => handleTabChange(lead.id, 'contacts')}
                          className={`px-4 py-2 text-sm font-medium border-t border-l border-r rounded-t ${
                            activeTab[lead.id] === 'contacts'
                              ? 'bg-green-500 text-white border-green-500'
                              : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          Contacts
                        </button>
                        <button
                          onClick={() => handleTabChange(lead.id, 'open_activities')}
                          className={`px-4 py-2 text-sm font-medium border-t border-l border-r rounded-t ${
                            activeTab[lead.id] === 'open_activities'
                              ? 'bg-green-500 text-white border-green-500'
                              : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          Open Activities
                        </button>
                        <button
                          onClick={() => handleTabChange(lead.id, 'closed_activities')}
                          className={`px-4 py-2 text-sm font-medium border-t border-l border-r rounded-t ${
                            activeTab[lead.id] === 'closed_activities'
                              ? 'bg-green-500 text-white border-green-500'
                              : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          Closed Activities
                        </button>
                        <button
                          onClick={() => handleTabChange(lead.id, 'attachments')}
                          className={`px-4 py-2 text-sm font-medium border-t border-l border-r rounded-t ${
                            activeTab[lead.id] === 'attachments'
                              ? 'bg-green-500 text-white border-green-500'
                              : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          Attachments
                        </button>
                        <button
                          onClick={() => handleTabChange(lead.id, 'memo')}
                          className={`px-4 py-2 text-sm font-medium border-t border-l border-r rounded-t ${
                            activeTab[lead.id] === 'memo'
                              ? 'bg-green-500 text-white border-green-500'
                              : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          Memo
                        </button>
                      </div>

                      {/* Tab Content */}
                      <div className="px-4 pb-4">
                        {renderTabContent(lead)}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {filteredLeads.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500">
                  No leads found matching your criteria
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing page {page} of {totalPages} ({total} total leads)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
