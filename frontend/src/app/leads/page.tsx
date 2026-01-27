'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Eye, UserCheck, XCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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
import { Lead } from '@/types';
import { formatDate, formatCurrency, getStatusColor, getPriorityColor } from '@/lib/utils';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal_sent', label: 'Proposal Sent' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

const priorityOptions = [
  { value: '', label: 'All Priority' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params: any = { page, page_size: 20 };
      if (search) params.search = search;
      if (status) params.status = status;
      if (priority) params.priority = priority;

      const response = await api.getLeads(params);
      setLeads(response.items);
      setTotalPages(response.total_pages);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, status, priority]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
            <p className="text-gray-500">Manage your sales leads and pipeline</p>
          </div>
          <Link href="/leads/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Lead
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
                    placeholder="Search by name, email, company..."
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
                options={priorityOptions}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
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
            ) : leads.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No leads found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell isHeader>Name / Company</TableCell>
                    <TableCell isHeader>Contact</TableCell>
                    <TableCell isHeader>Value</TableCell>
                    <TableCell isHeader>Priority</TableCell>
                    <TableCell isHeader>Status</TableCell>
                    <TableCell isHeader>Stage</TableCell>
                    <TableCell isHeader>Created</TableCell>
                    <TableCell isHeader>Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {lead.first_name} {lead.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {lead.company_name || '-'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{lead.email || '-'}</p>
                          <p className="text-gray-500">{lead.phone || '-'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {lead.expected_value
                          ? formatCurrency(Number(lead.expected_value))
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(lead.priority)}>
                          {lead.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{
                                width: `${(lead.pipeline_stage / 6) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm">{lead.pipeline_stage}/6</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(lead.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link href={`/leads/${lead.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          {!lead.is_converted && lead.status !== 'lost' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600"
                              >
                                <UserCheck className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600"
                              >
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
