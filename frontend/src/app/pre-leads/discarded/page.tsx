'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Eye, Edit, RotateCcw, Trash2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { PreLead } from '@/types';

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

const groupOptions = [
  { value: '', label: 'Group' },
  { value: '1', label: 'Group A' },
  { value: '2', label: 'Group B' },
  { value: '3', label: 'Group C' },
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
];

export default function DiscardedPreLeadsPage() {
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
    region: '',
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

  const fetchDiscardedPreLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, page_size: 20, status: 1 };  // 1 = discarded
      if (filters.company) params.search = filters.company;
      if (filters.source) params.source = filters.source;

      const response = await api.getPreLeads(params);
      setPreLeads(response.items);
      setTotalPages(response.total_pages);
      setTotal(response.total);
    } catch (err) {
      console.error('Failed to fetch discarded pre-leads:', err);
      showError('Failed to load discarded pre-leads');
    } finally {
      setLoading(false);
    }
  }, [page, filters.company, filters.source, showError]);

  useEffect(() => {
    fetchDiscardedPreLeads();
  }, [fetchDiscardedPreLeads]);

  const handleSearch = () => {
    setPage(1);
    fetchDiscardedPreLeads();
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleRestore = async (id: number) => {
    if (!window.confirm('Are you sure you want to restore this pre-lead?')) return;
    try {
      await api.updatePreLead(id, { status: 0 } as Partial<PreLead>);  // 0 = active
      showSuccess('Pre-lead restored successfully');
      fetchDiscardedPreLeads();
    } catch (err) {
      console.error('Failed to restore pre-lead:', err);
      showError('Failed to restore pre-lead');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to permanently delete this pre-lead? This action cannot be undone.')) return;
    try {
      await api.deletePreLead(id);
      showSuccess('Pre-lead deleted permanently');
      fetchDiscardedPreLeads();
    } catch (err) {
      console.error('Failed to delete pre-lead:', err);
      showError('Failed to delete pre-lead');
    }
  };

  const inputClass = "w-full h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500";
  const selectClass = "w-full h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white";
  const thClass = "px-2 py-2 text-left text-xs font-semibold text-blue-600 border-b border-gray-200 cursor-pointer hover:bg-gray-50";
  const tdClass = "px-2 py-2 text-xs text-gray-700 border-b border-gray-100";

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
          <h1 className="text-lg font-semibold text-gray-800">DISCARDED PRE-LEADS</h1>
          <div className="flex gap-2">
            <Link href="/pre-leads">
              <button className="px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600">
                Back to Pre-Leads
              </button>
            </Link>
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
                  <th className={thClass} style={{ width: '12%' }}>Company <span className="text-gray-400">&#9650;&#9660;</span></th>
                  <th className={thClass} style={{ width: '15%' }}>Address</th>
                  <th className={thClass} style={{ width: '8%' }}>Country <span className="text-gray-400">&#9650;&#9660;</span></th>
                  <th className={thClass} style={{ width: '10%' }}>State/Province <span className="text-gray-400">&#9650;&#9660;</span></th>
                  <th className={thClass} style={{ width: '8%' }}>City <span className="text-gray-400">&#9650;&#9660;</span></th>
                  <th className={thClass} style={{ width: '8%' }}>Group <span className="text-gray-400">&#9650;&#9660;</span></th>
                  <th className={thClass} style={{ width: '10%' }}>Industry <span className="text-gray-400">&#9650;&#9660;</span></th>
                  <th className={thClass} style={{ width: '8%' }}>Region</th>
                  <th className={thClass} style={{ width: '9%' }}>Lead Source <span className="text-gray-400">&#9650;&#9660;</span></th>
                  <th className={thClass} style={{ width: '12%' }}>Action</th>
                </tr>
                {/* Filter Row */}
                <tr className="bg-white border-b">
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
                    <td colSpan={10} className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </td>
                  </tr>
                ) : preLeads.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-gray-500">
                      No discarded pre-leads found
                    </td>
                  </tr>
                ) : (
                  preLeads.map((preLead, index) => (
                    <tr key={preLead.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className={tdClass}>
                        <span className="text-gray-700 font-medium">
                          {preLead.company_name || preLead.first_name}
                        </span>
                      </td>
                      <td className={tdClass}>{preLead.address_line1 || '-'}</td>
                      <td className={tdClass}>{preLead.country || '-'}</td>
                      <td className={tdClass}>{preLead.state || '-'}</td>
                      <td className={tdClass}>{preLead.city || '-'}</td>
                      <td className={tdClass}>{preLead.group_id ? `Group ${preLead.group_id}` : '-'}</td>
                      <td className={tdClass}>{preLead.industry_id ? `Industry ${preLead.industry_id}` : '-'}</td>
                      <td className={tdClass}>{preLead.region_id ? `Region ${preLead.region_id}` : '-'}</td>
                      <td className={tdClass}>{preLead.source?.replace('_', ' ') || '-'}</td>
                      <td className={tdClass}>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleRestore(preLead.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                            title="Restore"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <Link href={`/pre-leads/${preLead.id}`}>
                            <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="View">
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                          <Link href={`/pre-leads/${preLead.id}/edit`}>
                            <button className="p-1.5 text-orange-600 hover:bg-orange-50 rounded" title="Edit">
                              <Edit className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(preLead.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Delete Permanently"
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
