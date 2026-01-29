'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  ArrowLeft,
  Edit,
  Building2,
  Mail,
  Phone,
  User,
  Tag,
  DollarSign,
  Calendar,
  Heart
} from 'lucide-react';
import api from '@/lib/api';
import { Customer } from '@/types';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = parseInt(params.id as string);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const data = await api.getCustomer(customerId);
        setCustomer(data);
      } catch (err: any) {
        setError('Failed to load customer details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !customer) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500 mb-4">{error || 'Customer not found'}</p>
          <Button variant="secondary" onClick={() => router.push('/customers')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Customers
          </Button>
        </div>
      </MainLayout>
    );
  }

  const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number | null | undefined }) => (
    <div className="flex items-start gap-3 py-2">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm text-gray-900">{value?.toString() || '-'}</p>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/customers')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {customer.company_name || `${customer.first_name} ${customer.last_name || ''}`.trim()}
              </h1>
              <p className="text-sm text-gray-500">Customer ID: {customer.id} | Code: {customer.customer_code || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(customer.status)}>
              {customer.status}
            </Badge>
            <Link href={`/customers/${customer.id}/edit`}>
              <Button size="sm" className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Customer Information
              </h2>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow icon={Building2} label="Company Name" value={customer.company_name} />
              <InfoRow icon={Tag} label="Customer Code" value={customer.customer_code} />
              <InfoRow icon={Tag} label="ERP Customer ID" value={customer.erp_customer_id} />
              <InfoRow icon={Tag} label="Customer Type" value={customer.customer_type} />
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Contact Information
              </h2>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow icon={User} label="Contact Name" value={`${customer.first_name} ${customer.last_name || ''}`.trim()} />
              <InfoRow icon={Mail} label="Email" value={customer.email} />
              <InfoRow icon={Phone} label="Phone" value={customer.phone} />
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Financial Summary
              </h2>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow icon={DollarSign} label="Total Revenue" value={formatCurrency(customer.total_revenue)} />
              <InfoRow icon={DollarSign} label="Outstanding Amount" value={formatCurrency(customer.outstanding_amount)} />
              <InfoRow icon={Tag} label="Total Orders" value={customer.total_orders} />
              <InfoRow icon={Calendar} label="Last Order Date" value={customer.last_order_date ? formatDate(customer.last_order_date) : null} />
            </CardContent>
          </Card>

          {/* Health Score */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Health Score
              </h2>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-gray-900">{customer.health_score}</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        customer.health_score >= 70 ? 'bg-green-500' :
                        customer.health_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${customer.health_score}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {customer.health_score >= 70 ? 'Healthy' :
                     customer.health_score >= 40 ? 'Needs Attention' : 'At Risk'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t text-sm text-gray-500 flex justify-between">
          <span>Created: {customer.created_at ? formatDate(customer.created_at) : '-'}</span>
          <span>Updated: {customer.updated_at ? formatDate(customer.updated_at) : '-'}</span>
        </div>
      </div>
    </MainLayout>
  );
}
