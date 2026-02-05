'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Plus, ArrowUpDown, Link2, X } from 'lucide-react';
import api from '@/lib/api';

interface LeadContact {
  id: number;
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
  status?: string;
  notes?: string;
  created_at?: string;
  // Lead/Company info
  company_name?: string;
  industry_id?: number;
  group_id?: number;
}

// Contact type options
const contactTypeOptions = [
  { value: 'all', label: 'All' },
  { value: 'primary', label: 'Primary' },
  { value: 'management', label: 'Management' },
  { value: 'technical', label: 'Technical' },
  { value: 'sales', label: 'Sales' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'accounts', label: 'Accounts' },
];

// Sample industry and group data
const industryOptions: Record<number, string> = {
  1: 'Consumer Products',
  2: 'Software Development',
  3: 'Services',
  4: 'Distribution',
  5: 'Manufacturing',
};

const groupOptions: Record<number, string> = {
  1: 'Contractor',
  2: 'Technology Partners',
  3: 'Trader',
  4: 'Manufacturer',
  5: 'Other',
};

export default function LeadContactsPage() {
  const [contacts, setContacts] = useState<LeadContact[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [filters, setFilters] = useState({
    contact_name: '',
    designation: '',
    company_name: '',
    work_email: '',
    work_phone: '',
    ext: '',
    cell_phone: '',
    industry: '',
    group: '',
    contact_type: 'all',
  });

  // Sort state
  const [sortField, setSortField] = useState<string>('first_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Social Media Links Modal state (view-only)
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<LeadContact | null>(null);

  // Activity Modal state
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityForm, setActivityForm] = useState({
    activity_type: 'email',
    subject: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    start_time: '',
    end_date: new Date().toISOString().split('T')[0],
    end_time: '',
    status: 'in_progress',
    priority: '',
    assigned_to: '',
  });

  const handleViewLinks = (contact: LeadContact) => {
    setSelectedContact(contact);
    setShowLinksModal(true);
  };

  const handleOpenActivity = (contact: LeadContact) => {
    setSelectedContact(contact);
    setActivityForm({
      activity_type: 'email',
      subject: '',
      description: '',
      start_date: new Date().toISOString().split('T')[0],
      start_time: '',
      end_date: new Date().toISOString().split('T')[0],
      end_time: '',
      status: 'in_progress',
      priority: '',
      assigned_to: '',
    });
    setShowActivityModal(true);
  };

  const handleSaveActivity = async () => {
    if (!selectedContact) return;
    try {
      const payload = {
        activity_type: activityForm.activity_type,
        subject: activityForm.subject,
        description: activityForm.description,
        activity_date: activityForm.start_date,
        status: activityForm.status,
        priority: activityForm.priority || 'medium',
      };
      await api.createLeadActivity(selectedContact.lead_id, payload);
      setShowActivityModal(false);
      alert('Activity saved successfully!');
    } catch (err) {
      console.error('Failed to save activity:', err);
      alert('Failed to save activity');
    }
  };

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await api.getAllLeadContacts({ limit: 200 });
      setContacts(response || []);
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
      // Sample data for display
      setContacts([
        { id: 1, lead_id: 1, first_name: '5222 cppp', last_name: '', designation: '', company_name: 'Deirdre Foley', work_email: 'dd@mail.com', work_phone: '8745965825', ext: '', cell_phone: '', industry_id: 1, group_id: 1, contact_type: 'accounts' },
        { id: 2, lead_id: 2, first_name: 'A Name', last_name: '', designation: 'Developer', company_name: 'C1', work_email: 'a@gmail.com', work_phone: '1234567890', ext: '', cell_phone: '', contact_type: 'accounts' },
        { id: 3, lead_id: 3, first_name: 'Abram Alam', last_name: '', designation: '', company_name: 'Caleb Puckett', work_email: 'nepywow@mailinator.com', work_phone: '+1 (455) 596-8993', ext: '', cell_phone: '', contact_type: 'accounts' },
        { id: 4, lead_id: 4, first_name: 'Ali Akbar', last_name: '', designation: 'AAA', company_name: 'Naveen Absolute New L...', work_email: 'ali@gmail.com', work_phone: '234567890', ext: '', cell_phone: '', industry_id: 1, contact_type: 'accounts' },
        { id: 5, lead_id: 5, first_name: 'Ali Ansari', last_name: '', designation: 'AAAA', company_name: 'Naveen Absolute New L...', work_email: 'ali@gmail.com', work_phone: '234567890', ext: '', cell_phone: '', industry_id: 1, group_id: 5, contact_type: 'accounts' },
        { id: 6, lead_id: 6, first_name: 'Alice Johnson', last_name: '', designation: 'Business Develo...', company_name: 'TechSphere Innovations', work_email: 'alice.johnson@techsphere.com', work_phone: '+1-415-555-1002', ext: '102', cell_phone: '+1 415 555 3002', industry_id: 2, group_id: 2, contact_type: 'management' },
        { id: 7, lead_id: 7, first_name: 'Amela Stafford Jasper Liv...', last_name: '', designation: '', company_name: 'Lenovo Pvt. Lmt.', work_email: 'soconiy@mailinator.com', work_phone: '+918569954858545', ext: '', cell_phone: '+1 (894) 457-3505', industry_id: 1, group_id: 1, contact_type: 'purchase' },
        { id: 8, lead_id: 8, first_name: 'Anwer Mustafa', last_name: '', designation: '', company_name: 'Saphire LLC', work_email: 'anwer@saphireinc.com', work_phone: '+1 (905) 997-8598', ext: '', cell_phone: '', group_id: 5, contact_type: 'management' },
        { id: 9, lead_id: 9, first_name: 'Anwer Mustafa', last_name: '', designation: 'General Manager', company_name: 'Saphire Incorporated', work_email: 'anwer@saphireinc.com', work_phone: '1.800.540.3594', ext: '', cell_phone: '', industry_id: 3, contact_type: 'management' },
        { id: 10, lead_id: 10, first_name: 'Anwer Mustafa', last_name: '', designation: '', company_name: 'Kanwall Incorporation', work_email: 'anwer@axiever.com', work_phone: '+1-647 886 3245', ext: '', cell_phone: '', industry_id: 4, group_id: 3, contact_type: 'management' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSearch = () => {
    // Filter is applied automatically through filteredContacts
  };

  const getContactName = (contact: LeadContact) => {
    return `${contact.first_name || ''} ${contact.last_name || ''}`.trim();
  };

  // Filter and sort contacts
  const filteredContacts = contacts.filter(contact => {
    const contactName = getContactName(contact).toLowerCase();
    if (filters.contact_name && !contactName.includes(filters.contact_name.toLowerCase())) return false;
    if (filters.designation && !contact.designation?.toLowerCase().includes(filters.designation.toLowerCase())) return false;
    if (filters.company_name && !contact.company_name?.toLowerCase().includes(filters.company_name.toLowerCase())) return false;
    if (filters.work_email && !contact.work_email?.toLowerCase().includes(filters.work_email.toLowerCase())) return false;
    if (filters.work_phone && !contact.work_phone?.includes(filters.work_phone)) return false;
    if (filters.ext && !contact.ext?.includes(filters.ext)) return false;
    if (filters.cell_phone && !contact.cell_phone?.includes(filters.cell_phone)) return false;
    if (filters.contact_type && filters.contact_type !== 'all' && contact.contact_type !== filters.contact_type) return false;
    return true;
  }).sort((a, b) => {
    let aVal = '', bVal = '';
    if (sortField === 'first_name') {
      aVal = getContactName(a);
      bVal = getContactName(b);
    } else if (sortField === 'company_name') {
      aVal = a.company_name || '';
      bVal = b.company_name || '';
    } else if (sortField === 'work_email') {
      aVal = a.work_email || '';
      bVal = b.work_email || '';
    } else if (sortField === 'work_phone') {
      aVal = a.work_phone || '';
      bVal = b.work_phone || '';
    }
    return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  // Styles
  const thClass = "px-2 py-2 text-left text-xs font-medium text-white bg-blue-600 border-r border-blue-500";
  const tdClass = "px-2 py-2 text-xs border-b border-r border-gray-200";
  const inputClass = "w-full h-7 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500";
  const selectClass = "w-full h-7 px-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white";

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <h1 className="text-xl font-bold text-blue-600">LEAD CONTACTS</h1>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                {/* Header Row */}
                <tr>
                  <th className={thClass} style={{ width: '150px' }}>
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('first_name')}>
                      Contact Name
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className={thClass} style={{ width: '100px' }}>
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('designation')}>
                      Designation
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className={thClass} style={{ width: '150px' }}>
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('company_name')}>
                      Company Name
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className={thClass} style={{ width: '180px' }}>
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('work_email')}>
                      Work Email
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className={thClass} style={{ width: '120px' }}>
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('work_phone')}>
                      Work Phone
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className={thClass} style={{ width: '50px' }}>Ext.</th>
                  <th className={thClass} style={{ width: '110px' }}>Cell Phone</th>
                  <th className={thClass} style={{ width: '120px' }}>Industry</th>
                  <th className={thClass} style={{ width: '120px' }}>Group</th>
                  <th className={thClass} style={{ width: '100px' }}>Cont. Type</th>
                  <th className={thClass} style={{ width: '80px' }}>Action</th>
                </tr>

                {/* Filter Row */}
                <tr className="bg-gray-50">
                  <td className={tdClass}>
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={filters.contact_name}
                      onChange={(e) => setFilters({ ...filters, contact_name: e.target.value })}
                      className={inputClass}
                    />
                  </td>
                  <td className={tdClass}>
                    <input
                      type="text"
                      placeholder="Designation"
                      value={filters.designation}
                      onChange={(e) => setFilters({ ...filters, designation: e.target.value })}
                      className={inputClass}
                    />
                  </td>
                  <td className={tdClass}>
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={filters.company_name}
                      onChange={(e) => setFilters({ ...filters, company_name: e.target.value })}
                      className={inputClass}
                    />
                  </td>
                  <td className={tdClass}>
                    <input
                      type="text"
                      placeholder="Work Email"
                      value={filters.work_email}
                      onChange={(e) => setFilters({ ...filters, work_email: e.target.value })}
                      className={inputClass}
                    />
                  </td>
                  <td className={tdClass}>
                    <input
                      type="text"
                      placeholder="Work Phone"
                      value={filters.work_phone}
                      onChange={(e) => setFilters({ ...filters, work_phone: e.target.value })}
                      className={inputClass}
                    />
                  </td>
                  <td className={tdClass}>
                    <input
                      type="text"
                      placeholder="Ext"
                      value={filters.ext}
                      onChange={(e) => setFilters({ ...filters, ext: e.target.value })}
                      className={inputClass}
                    />
                  </td>
                  <td className={tdClass}>
                    <input
                      type="text"
                      placeholder="Cell Phone"
                      value={filters.cell_phone}
                      onChange={(e) => setFilters({ ...filters, cell_phone: e.target.value })}
                      className={inputClass}
                    />
                  </td>
                  <td className={tdClass}>
                    <input
                      type="text"
                      placeholder="Industry"
                      value={filters.industry}
                      onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                      className={inputClass}
                    />
                  </td>
                  <td className={tdClass}>
                    <input
                      type="text"
                      placeholder="Group"
                      value={filters.group}
                      onChange={(e) => setFilters({ ...filters, group: e.target.value })}
                      className={inputClass}
                    />
                  </td>
                  <td className={tdClass}>
                    <select
                      value={filters.contact_type}
                      onChange={(e) => setFilters({ ...filters, contact_type: e.target.value })}
                      className={selectClass}
                    >
                      {contactTypeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className={tdClass}>
                    <button
                      onClick={handleSearch}
                      className="px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
                    >
                      Search
                    </button>
                  </td>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                      No contacts found
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact) => (
                    <React.Fragment key={contact.id}>
                      <tr className="hover:bg-gray-50">
                        <td className={tdClass}>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenActivity(contact)}
                              className="p-0.5 text-green-600 hover:bg-green-50 rounded"
                              title="Add Activity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <span className="text-orange-600">{getContactName(contact)}</span>
                          </div>
                        </td>
                        <td className={tdClass}>{contact.designation}</td>
                        <td className={`${tdClass} text-blue-600`}>{contact.company_name}</td>
                        <td className={`${tdClass} text-blue-600`}>{contact.work_email}</td>
                        <td className={`${tdClass} text-blue-600`}>{contact.work_phone}</td>
                        <td className={tdClass}>{contact.ext}</td>
                        <td className={`${tdClass} text-blue-600`}>{contact.cell_phone}</td>
                        <td className={`${tdClass} text-orange-600`}>
                          {contact.industry_id ? industryOptions[contact.industry_id] || '' : ''}
                        </td>
                        <td className={`${tdClass} text-orange-600`}>
                          {contact.group_id ? groupOptions[contact.group_id] || '' : ''}
                        </td>
                        <td className={`${tdClass} text-orange-600 capitalize`}>{contact.contact_type}</td>
                        <td className={tdClass}>
                          <button
                            onClick={() => handleViewLinks(contact)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="View Contact Links"
                          >
                            <Link2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contact Links Modal (View Only) */}
        {showLinksModal && selectedContact && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-blue-600">
                <h3 className="text-lg font-semibold text-white">CONTACT LINKS</h3>
                <button onClick={() => setShowLinksModal(false)} className="p-1 hover:bg-blue-700 rounded text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Contact Info Header */}
                <div className="mb-4 pb-4 border-b">
                  <h4 className="text-lg font-medium text-gray-900">
                    {getContactName(selectedContact)}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {selectedContact.designation && `${selectedContact.designation} at `}
                    {selectedContact.company_name}
                  </p>
                </div>

                {/* Social Media Links */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {/* LinkedIn */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full">
                        <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">LinkedIn</p>
                        {selectedContact.linkedin_url ? (
                          <a href={selectedContact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                            {selectedContact.linkedin_url}
                          </a>
                        ) : (
                          <p className="text-sm text-gray-400">Not provided</p>
                        )}
                      </div>
                    </div>

                    {/* Facebook */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.737-.9 10.125-5.864 10.125-11.854z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">Facebook</p>
                        {selectedContact.facebook_url ? (
                          <a href={selectedContact.facebook_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                            {selectedContact.facebook_url}
                          </a>
                        ) : (
                          <p className="text-sm text-gray-400">Not provided</p>
                        )}
                      </div>
                    </div>

                    {/* Twitter */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full">
                        <svg className="w-5 h-5 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">Twitter / X</p>
                        {selectedContact.twitter_url ? (
                          <a href={selectedContact.twitter_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                            {selectedContact.twitter_url}
                          </a>
                        ) : (
                          <p className="text-sm text-gray-400">Not provided</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowLinksModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Modal */}
        {showActivityModal && selectedContact && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-[580px] overflow-hidden shadow-xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-3 bg-blue-600">
                <h3 className="text-base font-semibold text-white">NEW ACTIVITY</h3>
                <button onClick={() => setShowActivityModal(false)} className="p-1 hover:bg-blue-700 rounded text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="px-5 py-4">
                {/* Form Grid - Row by Row */}
                <div className="space-y-3">
                  {/* Row 1: Contact | Subject */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-600 mb-1">Contact</label>
                      <input
                        type="text"
                        value={getContactName(selectedContact)}
                        readOnly
                        className="w-full h-8 px-3 text-sm bg-gray-100 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-600 mb-1">Subject</label>
                      <input
                        type="text"
                        value={activityForm.subject}
                        onChange={(e) => setActivityForm({ ...activityForm, subject: e.target.value })}
                        className="w-full h-8 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Row 2: Email | Activity Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-600 mb-1">Email</label>
                      <input
                        type="text"
                        value={selectedContact.work_email || selectedContact.email || ''}
                        readOnly
                        className="w-full h-8 px-3 text-sm bg-gray-100 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-600 mb-1">Activity Type</label>
                      <select
                        value={activityForm.activity_type}
                        onChange={(e) => setActivityForm({ ...activityForm, activity_type: e.target.value })}
                        className="w-full h-8 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      >
                        <option value="call">Call</option>
                        <option value="email">Email</option>
                        <option value="meeting">Meeting</option>
                        <option value="task">Task</option>
                        <option value="follow_up">Follow Up</option>
                        <option value="note">Note</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Priority | Assigned To */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-600 mb-1">Priority</label>
                      <select
                        value={activityForm.priority}
                        onChange={(e) => setActivityForm({ ...activityForm, priority: e.target.value })}
                        className="w-full h-8 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Select Priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-600 mb-1">Assigned To</label>
                      <select
                        value={activityForm.assigned_to}
                        onChange={(e) => setActivityForm({ ...activityForm, assigned_to: e.target.value })}
                        className="w-full h-8 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Select User</option>
                        <option value="1">Admin User</option>
                        <option value="2">Sales Team</option>
                        <option value="3">Support Team</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 4: Start Date/Time | Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-600 mb-1">Start Date / Time</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={activityForm.start_date}
                          onChange={(e) => setActivityForm({ ...activityForm, start_date: e.target.value })}
                          className="w-full h-8 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <input
                          type="time"
                          value={activityForm.start_time}
                          onChange={(e) => setActivityForm({ ...activityForm, start_time: e.target.value })}
                          className="w-full h-8 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-600 mb-1">Status</label>
                      <select
                        value={activityForm.status}
                        onChange={(e) => setActivityForm({ ...activityForm, status: e.target.value })}
                        className="w-full h-8 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      >
                        <option value="planned">Planned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 5: End Date/Time | Empty */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-600 mb-1">End Date / Time</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={activityForm.end_date}
                          onChange={(e) => setActivityForm({ ...activityForm, end_date: e.target.value })}
                          className="w-full h-8 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <input
                          type="time"
                          value={activityForm.end_time}
                          onChange={(e) => setActivityForm({ ...activityForm, end_time: e.target.value })}
                          className="w-full h-8 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div></div>
                  </div>
                </div>

                {/* Description - Full Width */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-blue-600 mb-1">Description</label>
                  {/* Rich Text Editor Toolbar */}
                  <div className="flex items-center gap-1 px-2 py-1.5 border border-gray-300 border-b-0 rounded-t bg-gray-50">
                    <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded font-bold text-sm">B</button>
                    <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded italic text-sm">I</button>
                    <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded underline text-sm">U</button>
                    <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded text-sm">✏️</button>
                    <div className="w-px h-5 bg-gray-300 mx-1"></div>
                    <select className="h-7 px-2 text-xs border border-gray-300 rounded bg-white">
                      <option>jost</option>
                      <option>Arial</option>
                      <option>Times</option>
                    </select>
                    <select className="h-7 w-14 px-2 text-xs border border-gray-300 rounded bg-white">
                      <option>14</option>
                      <option>12</option>
                      <option>16</option>
                      <option>18</option>
                    </select>
                    <div className="w-px h-5 bg-gray-300 mx-1"></div>
                    <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded text-sm bg-yellow-200 font-bold">A</button>
                    <div className="w-px h-5 bg-gray-300 mx-1"></div>
                    <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded text-sm">☰</button>
                    <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded text-sm">☰</button>
                    <button type="button" className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded text-sm">≡</button>
                  </div>
                  <textarea
                    value={activityForm.description}
                    onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-b focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                </div>

                {/* Save Button */}
                <div className="mt-5 flex justify-center">
                  <button
                    onClick={handleSaveActivity}
                    className="px-6 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
