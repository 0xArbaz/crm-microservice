'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Eye, CheckCircle, XCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/Table';
import api from '@/lib/api';
import { PreLead, PaginatedResponse } from '@/types';
import { formatDate, getStatusColor } from '@/lib/utils';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'validated', label: 'Validated' },
  { value: 'discarded', label: 'Discarded' },
];

const sourceOptions = [
  { value: '', label: 'All Sources' },
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
];

export default function PreLeadsPage() {
  const [preLeads, setPreLeads] = useState<PreLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');

  const fetchPreLeads = async () => {
    setLoading(true);
    try {
      const params: any = { page, page_size: 20 };
      if (search) params.search = search;
      if (status) params.status = status;
      if (source) params.source = source;

      const response = await api.getPreLeads(params);
      setPreLeads(response.items);
      setTotalPages(response.total_pages);
    } catch (error) {
      console.error('Failed to fetch pre-leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreLeads();
  }, [page, status, source]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPreLeads();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pre-Leads</h1>
            <p className="text-gray-500">Manage and validate pre-lead inquiries</p>
          </div>
          <Link href="/pre-leads/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Pre-Lead
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by name, email, phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <Select
                options={statusOptions}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-40"
              />
              <Select
                options={sourceOptions}
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-40"
              />
              <Button type="submit" variant="secondary">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : preLeads.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No pre-leads found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell isHeader>Name</TableCell>
                    <TableCell isHeader>Contact</TableCell>
                    <TableCell isHeader>Company</TableCell>
                    <TableCell isHeader>Source</TableCell>
                    <TableCell isHeader>Status</TableCell>
                    <TableCell isHeader>Created</TableCell>
                    <TableCell isHeader>Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preLeads.map((preLead) => (
                    <TableRow key={preLead.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {preLead.first_name} {preLead.last_name}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{preLead.email || '-'}</p>
                          <p className="text-gray-500">{preLead.phone || '-'}</p>
                        </div>
                      </TableCell>
                      <TableCell>{preLead.company_name || '-'}</TableCell>
                      <TableCell>
                        <Badge className="bg-gray-100 text-gray-800">
                          {preLead.source.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(preLead.status)}>
                          {preLead.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(preLead.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link href={`/pre-leads/${preLead.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          {preLead.status === 'new' && (
                            <>
                              <Link href={`/pre-leads/${preLead.id}/validate`}>
                                <Button variant="ghost" size="sm" className="text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Button variant="ghost" size="sm" className="text-red-600">
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t flex justify-between items-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
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
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
