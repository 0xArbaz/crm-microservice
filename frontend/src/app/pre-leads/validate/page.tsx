'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckSquare, Trash2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { PreLead } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const countryOptions = [
  { value: '', label: 'Country' },
  { value: '1', label: 'India' },
  { value: '2', label: 'Oman' },
  { value: '3', label: 'United States' },
  { value: '4', label: 'United Arab Emirates' },
  { value: '5', label: 'Canada' },
  { value: '6', label: 'Jordan' },
  { value: '7', label: 'Hungary' },
];

const stateOptions = [
  { value: '', label: 'State' },
  { value: '1', label: 'Maharashtra' },
  { value: '2', label: 'Karnataka' },
  { value: '3', label: 'Alaska' },
  { value: '4', label: 'Dubai' },
  { value: '5', label: 'Tennessee' },
  { value: '6', label: 'New York' },
  { value: '7', label: 'British Columbia' },
  { value: '8', label: 'Jharkhand' },
  { value: '9', label: 'Sultanate of Oman' },
];

const cityOptions = [
  { value: '', label: 'City' },
  { value: '1', label: 'Mumbai' },
  { value: '2', label: 'Muscat' },
  { value: '3', label: 'Bangalore' },
  { value: '4', label: 'Nashville' },
  { value: '5', label: 'Hartford' },
  { value: '6', label: 'Negotno' },
  { value: '7', label: 'Dhanbad' },
  { value: '8', label: 'Huế' },
];

const groupOptions = [
  { value: '', label: 'Group' },
  { value: '1', label: 'Service Provider' },
  { value: '2', label: 'Contractor' },
  { value: '3', label: 'Group A' },
  { value: '4', label: 'Group B' },
];

const industryOptions = [
  { value: '', label: 'Industry' },
  { value: '1', label: 'Information Technology' },
  { value: '2', label: 'Distribution' },
  { value: '3', label: 'Manufacturing' },
  { value: '4', label: 'Power' },
  { value: '5', label: 'Consumer Products' },
  { value: '6', label: 'Petrochemical' },
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
  { value: 'outbound_phone', label: 'Outbound Phone Called' },
  { value: 'direct_marketing', label: 'Direct Marketing' },
];

export default function ValidatePreLeadsPage() {
  const router = useRouter();
  const [preLeads, setPreLeads] = useState<PreLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [filters, setFilters] = useState({
    company: '',
    address: '',
    country: '',
    state: '',
    city: '',
    group: '',
    industry: '',
    source: '',
  });

  const showSuccess = useCallback((msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  }, []);

  const showError = useCallback((msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 3000);
  }, []);

  const fetchPreLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, page_size: 20 };
      if (filters.company) params.search = filters.company;
      if (filters.source) params.source = filters.source;

      // Only fetch active pre-leads (status = 0) that are not converted
      params.status = 0;
      const response = await api.getPreLeads(params);
      // Filter to show only pre-leads that can be validated (not already validated and not converted)
      const validatablePreLeads = response.items.filter(
        (item: PreLead) => item.lead_status !== 'validated' && !item.is_converted
      );
      setPreLeads(validatablePreLeads);
      setTotalPages(response.total_pages);
      setTotal(response.total);
    } catch (err) {
      console.error('Failed to fetch pre-leads:', err);
      showError('Failed to load pre-leads');
    } finally {
      setLoading(false);
    }
  }, [page, filters.company, filters.source, showError]);

  useEffect(() => {
    fetchPreLeads();
  }, [fetchPreLeads]);

  const handleSearch = () => {
    setPage(1);
    fetchPreLeads();
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleValidate = async (id: number) => {
    try {
      const result = await api.validatePreLead(id, {});
      showSuccess('Pre-lead validated and converted to lead successfully');
      // Optionally redirect to the new lead
      router.push(`/leads/${result.lead_id}/edit`);
    } catch (err: any) {
      console.error('Failed to validate pre-lead:', err);
      showError(err.response?.data?.detail || 'Failed to validate pre-lead');
    }
  };

  const handleDiscard = async (id: number) => {
    if (!window.confirm('Are you sure you want to discard this pre-lead?')) return;
    try {
      await api.discardPreLead(id, 'Discarded from validation page');
      showSuccess('Pre-lead discarded successfully');
      fetchPreLeads();
    } catch (err) {
      console.error('Failed to discard pre-lead:', err);
      showError('Failed to discard pre-lead');
    }
  };

  const exportCSV = () => {
    if (preLeads.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Company', 'Address', 'Country', 'State/Province', 'City', 'Group', 'Industry', 'Lead Source'];
    const rows = preLeads.map(pl => [
      pl.company_name || pl.first_name || '',
      pl.address_line1 || '',
      pl.country || '',
      pl.state || '',
      pl.city || '',
      pl.group_id ? `Group ${pl.group_id}` : '',
      pl.industry_id ? `Industry ${pl.industry_id}` : '',
      pl.source?.replace('_', ' ') || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `validate-pre-leads-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportExcel = () => {
    // Excel export uses CSV format which Excel can open
    exportCSV();
  };

  const exportPDF = () => {
    if (preLeads.length === 0) {
      alert('No data to export');
      return;
    }

    const doc = new jsPDF('landscape', 'mm', 'a4');

    // Add title
    doc.setFontSize(16);
    doc.text('Validate Pre Lead', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

    // Prepare table data
    const headers = [['Company', 'Address', 'Country', 'State', 'City', 'Group', 'Industry', 'Source']];
    const rows = preLeads.map(pl => [
      pl.company_name || pl.first_name || '-',
      pl.address_line1 || '-',
      pl.country || '-',
      pl.state || '-',
      pl.city || '-',
      pl.group_id ? `Group ${pl.group_id}` : '-',
      pl.industry_id ? `Industry ${pl.industry_id}` : '-',
      pl.source?.replace('_', ' ') || '-'
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
    doc.save(`validate-pre-leads-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const inputClass = "w-full h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500";
  const selectClass = "w-full h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white";

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Success/Error Messages */}
        {success && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">VALIDATE PRE LEAD</h1>
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
                {/* Column Headers - Blue Background */}
                <tr className="bg-blue-600 text-white">
                  <th className="px-3 py-2 text-left text-xs font-semibold" style={{ width: '12%' }}>
                    Company Name <span className="text-blue-300">&#9660;</span>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold" style={{ width: '15%' }}>
                    Address <span className="text-blue-300">&#9660;</span>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold" style={{ width: '10%' }}>
                    Country <span className="text-blue-300">&#9660;</span>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold" style={{ width: '10%' }}>
                    State/Province <span className="text-blue-300">&#9660;</span>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold" style={{ width: '8%' }}>
                    City <span className="text-blue-300">&#9660;</span>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold" style={{ width: '10%' }}>
                    Group <span className="text-blue-300">&#9660;</span>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold" style={{ width: '12%' }}>
                    Industry <span className="text-blue-300">&#9660;</span>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold" style={{ width: '12%' }}>
                    Lead Source <span className="text-blue-300">&#9660;</span>
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-semibold" style={{ width: '11%' }}>
                    Action
                  </th>
                </tr>
                {/* Filter Row */}
                <tr className="bg-blue-600 border-t border-blue-500">
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      placeholder="Company Name"
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
                      value={filters.group}
                      onChange={(e) => handleFilterChange('group', e.target.value)}
                      className={selectClass}
                    >
                      {groupOptions.map(opt => (
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
                    <input
                      type="text"
                      placeholder="Lead Source"
                      value={filters.source}
                      onChange={(e) => handleFilterChange('source', e.target.value)}
                      className={inputClass}
                    />
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
                    <td colSpan={9} className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </td>
                  </tr>
                ) : preLeads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-500">
                      No pre-leads found for validation
                    </td>
                  </tr>
                ) : (
                  preLeads.map((preLead, index) => (
                    <tr key={preLead.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2 text-xs border-b border-gray-100">
                        <Link href={`/pre-leads/${preLead.id}/edit`} className="text-blue-600 hover:underline font-medium">
                          {preLead.company_name || preLead.first_name}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-700 border-b border-gray-100">
                        {preLead.address_line1 || '-'}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-700 border-b border-gray-100">
                        {preLead.country || '-'}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-700 border-b border-gray-100">
                        {preLead.state || '-'}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-700 border-b border-gray-100">
                        {preLead.city || '-'}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-700 border-b border-gray-100">
                        {preLead.group_id ? `Group ${preLead.group_id}` : '-'}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-700 border-b border-gray-100">
                        {preLead.industry_id ? industryOptions.find(i => i.value === preLead.industry_id?.toString())?.label || `Industry ${preLead.industry_id}` : '-'}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-700 border-b border-gray-100">
                        {preLead.source?.replace('_', ' ') || preLead.lead_source || '-'}
                      </td>
                      <td className="px-3 py-2 text-xs border-b border-gray-100">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleValidate(preLead.id)}
                            className="p-1.5 text-white bg-green-500 hover:bg-green-600 rounded"
                            title="Validate & Convert to Lead"
                          >
                            <CheckSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDiscard(preLead.id)}
                            className="p-1.5 text-white bg-red-500 hover:bg-red-600 rounded"
                            title="Discard"
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
      </div>
    </MainLayout>
  );
}
