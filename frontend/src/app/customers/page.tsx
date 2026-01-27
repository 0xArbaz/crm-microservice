'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Eye, Heart, TrendingUp } from 'lucide-react';
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
import { Customer } from '@/types';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'churned', label: 'Churned' },
  { value: 'on_hold', label: 'On Hold' },
];

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'individual', label: 'Individual' },
  { value: 'business', label: 'Business' },
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'government', label: 'Government' },
];

function HealthScore({ score }: { score: number }) {
  const color =
    score >= 80
      ? 'text-green-600 bg-green-100'
      : score >= 50
      ? 'text-yellow-600 bg-yellow-100'
      : 'text-red-600 bg-red-100';

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${color}`}>
      <Heart className="w-3 h-3 mr-1" />
      {score}%
    </div>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [customerType, setCustomerType] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params: any = { page, page_size: 20 };
      if (search) params.search = search;
      if (status) params.status = status;
      if (customerType) params.customer_type = customerType;

      const response = await api.getCustomers(params);
      setCustomers(response.items);
      setTotalPages(response.total_pages);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, status, customerType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-500">Track and manage your customers</p>
          </div>
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
                    placeholder="Search by name, email, customer code..."
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
                options={typeOptions}
                value={customerType}
                onChange={(e) => setCustomerType(e.target.value)}
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
            ) : customers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No customers found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell isHeader>Customer</TableCell>
                    <TableCell isHeader>Code</TableCell>
                    <TableCell isHeader>Contact</TableCell>
                    <TableCell isHeader>Type</TableCell>
                    <TableCell isHeader>Revenue</TableCell>
                    <TableCell isHeader>Health</TableCell>
                    <TableCell isHeader>Status</TableCell>
                    <TableCell isHeader>Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {customer.first_name} {customer.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {customer.company_name || '-'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {customer.customer_code || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{customer.email || '-'}</p>
                          <p className="text-gray-500">{customer.phone || '-'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-gray-100 text-gray-800">
                          {customer.customer_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-green-600">
                            {formatCurrency(Number(customer.total_revenue))}
                          </p>
                          <p className="text-xs text-gray-500">
                            {customer.total_orders} orders
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <HealthScore score={customer.health_score} />
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(customer.status)}>
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link href={`/customers/${customer.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/activities/customer?id=${customer.id}`}>
                            <Button variant="ghost" size="sm">
                              <TrendingUp className="w-4 h-4" />
                            </Button>
                          </Link>
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
