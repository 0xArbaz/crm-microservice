'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Edit, Trash2, FileText, XCircle, Sparkles } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { Lead } from '@/types';
import { BulkEnrichmentModal } from '@/components/leads/BulkEnrichmentModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const countryOptions = [
  { value: '', label: 'Country' },
  { value: '1', label: 'India' },
  { value: '2', label: 'Oman' },
  { value: '3', label: 'Jordan' },
  { value: '4', label: 'Hungary' },
  { value: '5', label: 'Chad' },
  { value: '6', label: 'Bahrain' },
  { value: '7', label: 'United States' },
];

const stateOptions = [
  { value: '', label: 'State' },
  { value: '1', label: 'Maharashtra' },
  { value: '2', label: 'Karnataka' },
  { value: '3', label: 'Delhi' },
  { value: '4', label: 'Tamil Nadu' },
];

const cityOptions = [
  { value: '', label: 'City' },
  { value: '1', label: 'Mumbai' },
  { value: '2', label: 'Muscat' },
  { value: '3', label: 'Bangalore' },
  { value: '4', label: 'Delhi' },
];

const industryOptions = [
  { value: '', label: 'Industry' },
  { value: '1', label: 'Technology' },
  { value: '2', label: 'Manufacturing' },
  { value: '3', label: 'Power' },
  { value: '4', label: 'Consumer Products' },
  { value: '5', label: 'Petrochemical' },
];

const regionOptions = [
  { value: '', label: 'Region' },
  { value: '1', label: 'Europe' },
  { value: '2', label: 'Asia' },
  { value: '3', label: 'Africa' },
  { value: '4', label: 'North America' },
  { value: '5', label: 'South America' },
  { value: '6', label: 'Middle East' },
];

const sourceOptions = [
  { value: '', label: 'Lead Source' },
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'erp', label: 'ERP' },
  { value: 'pre_lead', label: 'Pre-Lead' },
];

const priorityOptions = [
  { value: '', label: 'Priority' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const statusOptions = [
  { value: '', label: 'Status' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal_sent', label: 'Proposal Sent' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filter states
  const [filters, setFilters] = useState({
    company: '',
    address: '',
    country: '',
    state: '',
    city: '',
    industry: '',
    region: '',
    source: '',
    priority: '',
    status: '',
  });

  // Selection states
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showEnrichModal, setShowEnrichModal] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      // Only fetch active leads (status = 0)
      const params: any = { page, page_size: 20, status: 0 };
      if (filters.company) params.search = filters.company;
      if (filters.source) params.source = filters.source;
      if (filters.priority) params.priority = filters.priority;
      if (filters.status) params.lead_status = filters.status;  // Use lead_status for workflow filter

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

  // Clear selection when page changes or data reloads
  useEffect(() => {
    setSelectedIds(new Set());
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchLeads();
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to discard this lead?')) {
      try {
        // Mark as discarded (status = 1)
        await api.updateLead(id, { status: 1, lead_status: 'lost' } as Partial<Lead>);
        fetchLeads();
      } catch (error) {
        console.error('Failed to discard lead:', error);
      }
    }
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map(l => l.id)));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSelected = leads.length > 0 && selectedIds.size === leads.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < leads.length;
  const selectedLeads = leads.filter(l => selectedIds.has(l.id));

  const exportCSV = () => {
    if (leads.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Company', 'Address', 'Country', 'State', 'City', 'Industry', 'Region', 'Source', 'Priority', 'Status'];
    const rows = leads.map(lead => [
      lead.company_name || '',
      lead.address_line1 || '',
      lead.country || '',
      lead.state || '',
      lead.city || '',
      lead.industry_id ? `Industry ${lead.industry_id}` : '',
      lead.region_id ? `Region ${lead.region_id}` : '',
      lead.source?.replace('_', ' ') || '',
      lead.priority || '',
      lead.lead_status?.replace('_', ' ') || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportExcel = () => {
    // Excel export uses CSV format which Excel can open
    exportCSV();
  };

  const exportPDF = () => {
    if (leads.length === 0) {
      alert('No data to export');
      return;
    }

    const doc = new jsPDF('landscape', 'mm', 'a4');

    // Add title
    doc.setFontSize(16);
    doc.text('Manage Leads', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

    // Prepare table data
    const headers = [['Company', 'Address', 'Country', 'State', 'City', 'Industry', 'Region', 'Source', 'Priority', 'Status']];
    const rows = leads.map(lead => [
      lead.company_name || '-',
      lead.address_line1 || '-',
      lead.country || '-',
      lead.state || '-',
      lead.city || '-',
      lead.industry_id ? `Industry ${lead.industry_id}` : '-',
      lead.region_id ? `Region ${lead.region_id}` : '-',
      lead.source?.replace('_', ' ') || '-',
      lead.priority || '-',
      lead.lead_status?.replace('_', ' ') || '-'
    ]);

    // Generate table
    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 28,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // Save PDF
    doc.save(`leads-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-700';
      case 'contacted':
        return 'bg-purple-100 text-purple-700';
      case 'qualified':
        return 'bg-indigo-100 text-indigo-700';
      case 'proposal_sent':
        return 'bg-cyan-100 text-cyan-700';
      case 'negotiation':
        return 'bg-amber-100 text-amber-700';
      case 'won':
        return 'bg-green-100 text-green-700';
      case 'lost':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const inputClass = "w-full h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500";
  const selectClass = "w-full h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white";
  const thClass = "px-2 py-2 text-left text-xs font-semibold text-blue-600 border-b border-gray-200 cursor-pointer hover:bg-gray-50";
  const tdClass = "px-2 py-2 text-xs text-gray-700 border-b border-gray-100";

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">MANAGE LEAD</h1>
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              CSV
            </button>
            <button
              onClick={exportExcel}
              className="px-3 py-1.5 text-xs font-medium text-white bg-green-500 rounded hover:bg-green-600"
            >
              EXCEL
            </button>
            <button
              onClick={exportPDF}
              className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600"
            >
              PDF
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Filter Row + Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                {/* Column Headers */}
                <tr className="bg-gray-50">
                  <th className="px-2 py-2 border-b border-gray-200 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => { if (el) el.indeterminate = someSelected; }}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className={thClass} style={{ width: '11%' }}>Company <span className="text-gray-400">&#9650;&#9660;</span></th>
                  <th className={thClass} style={{ width: '14%' }}>Address</th>
                  <th className={thClass} style={{ width: '7%' }}>Country <span className="text-gray-400">&#9650;&#9660;</span></th>
                  <th className={thClass} style={{ width: '8%' }}>State/Province <span className="text-gray-400">&#9650;&#9660;</span></th>
                  <th className={thClass} style={{ width: '6%' }}>City <span className="text-gray-400">&#9650;&#9660;</span></th>
                  <th className={thClass} style={{ width: '7%' }}>Industry <span className="text-gray-400">&#9650;&#9660;</span></th>
                  <th className={thClass} style={{ width: '6%' }}>Region</th>
                  <th className={thClass} style={{ width: '8%' }}>Lead Source <span className="text-gray-400">&#9650;&#9660;</span></th>
                  <th className={thClass} style={{ width: '7%' }}>Priority <span className="text-gray-400">&#9650;&#9660;</span></th>
                  <th className={thClass} style={{ width: '7%' }}>Status <span className="text-gray-400">&#9650;&#9660;</span></th>
                  <th className={thClass} style={{ width: '11%' }}>Action</th>
                </tr>
                {/* Filter Row */}
                <tr className="bg-white border-b">
                  <td className="px-2 py-2"></td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      placeholder="Company"
                      value={filters.company}
                      onChange={(e) => handleFilterChange('company', e.target.value)}
                      className={inputClass}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      placeholder="Address"
                      value={filters.address}
                      onChange={(e) => handleFilterChange('address', e.target.value)}
                      className={inputClass}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <select
                      value={filters.country}
                      onChange={(e) => handleFilterChange('country', e.target.value)}
                      className={selectClass}
                    >
                      {countryOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <select
                      value={filters.state}
                      onChange={(e) => handleFilterChange('state', e.target.value)}
                      className={selectClass}
                    >
                      {stateOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <select
                      value={filters.city}
                      onChange={(e) => handleFilterChange('city', e.target.value)}
                      className={selectClass}
                    >
                      {cityOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <select
                      value={filters.industry}
                      onChange={(e) => handleFilterChange('industry', e.target.value)}
                      className={selectClass}
                    >
                      {industryOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <select
                      value={filters.region}
                      onChange={(e) => handleFilterChange('region', e.target.value)}
                      className={selectClass}
                    >
                      {regionOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <select
                      value={filters.source}
                      onChange={(e) => handleFilterChange('source', e.target.value)}
                      className={selectClass}
                    >
                      {sourceOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <select
                      value={filters.priority}
                      onChange={(e) => handleFilterChange('priority', e.target.value)}
                      className={selectClass}
                    >
                      {priorityOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className={selectClass}
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <button
                      onClick={handleSearch}
                      className="w-full h-8 px-4 text-xs font-medium text-white bg-green-500 rounded hover:bg-green-600"
                    >
                      Search
                    </button>
                  </td>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={12} className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="text-center py-12 text-gray-500">
                      No leads found
                    </td>
                  </tr>
                ) : (
                  leads.map((lead, index) => (
                    <tr
                      key={lead.id}
                      className={`${
                        selectedIds.has(lead.id)
                          ? 'bg-primary-50'
                          : index % 2 === 0
                          ? 'bg-white'
                          : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-2 py-2 border-b border-gray-100">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(lead.id)}
                          onChange={() => toggleSelect(lead.id)}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                      <td className={tdClass}>
                        <Link href={`/leads/${lead.id}`} className="text-blue-600 hover:underline font-medium">
                          {lead.company_name || `${lead.first_name} ${lead.last_name || ''}`}
                        </Link>
                      </td>
                      <td className={tdClass}>{lead.address_line1 || lead.address || '-'}</td>
                      <td className={tdClass}>{lead.country || '-'}</td>
                      <td className={tdClass}>{lead.state || '-'}</td>
                      <td className={tdClass}>{lead.city || '-'}</td>
                      <td className={tdClass}>{lead.industry || (lead.industry_id ? `Industry ${lead.industry_id}` : '-')}</td>
                      <td className={tdClass}>{lead.region_id ? `Region ${lead.region_id}` : '-'}</td>
                      <td className={tdClass}>{lead.source?.replace('_', ' ') || '-'}</td>
                      <td className={tdClass}>
                        <span className={`px-2 py-0.5 text-xs rounded ${getPriorityBadgeClass(lead.priority)}`}>
                          {lead.priority}
                        </span>
                      </td>
                      <td className={tdClass}>
                        <span className={`px-2 py-0.5 text-xs rounded ${getStatusBadgeClass(lead.lead_status || 'new')}`}>
                          {(lead.lead_status || 'new').replace('_', ' ')}
                        </span>
                      </td>
                      <td className={tdClass}>
                        <div className="flex items-center gap-1">
                          <Link href={`/leads/${lead.id}/view`}>
                            <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="View">
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                          <Link href={`/leads/${lead.id}/edit`}>
                            <button className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Edit">
                              <Edit className="w-4 h-4" />
                            </button>
                          </Link>
                          {!lead.is_converted && lead.lead_status !== 'won' && (
                            <>
                              <Link href={`/leads/${lead.id}/customer-requirement`}>
                                <button className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded" title="Customer Requirement Information">
                                  <FileText className="w-4 h-4" />
                                </button>
                              </Link>
                              <button
                                onClick={() => handleDelete(lead.id)}
                                className="p-1.5 text-orange-600 hover:bg-orange-50 rounded"
                                title="Mark as Lost"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {lead.lead_status === 'won' && (
                            <button
                              onClick={() => handleDelete(lead.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              title="Discard"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex justify-between items-center bg-gray-50">
              <span className="text-xs text-gray-500">
                Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} entries
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
                  {page}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Floating Action Bar */}
        {selectedIds.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
            <div className="flex items-center gap-4 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl">
              <span className="text-sm font-medium">
                {selectedIds.size} lead{selectedIds.size !== 1 ? 's' : ''} selected
              </span>
              <div className="w-px h-5 bg-gray-600" />
              <button
                onClick={() => setShowEnrichModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm font-medium transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Enrich Selected
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Enrichment Modal */}
      {showEnrichModal && (
        <BulkEnrichmentModal
          leads={selectedLeads}
          onClose={() => setShowEnrichModal(false)}
          onComplete={() => {
            fetchLeads();
            setSelectedIds(new Set());
          }}
        />
      )}
    </MainLayout>
  );
}
