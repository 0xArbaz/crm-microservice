'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Users } from 'lucide-react';
import api from '@/lib/api';
import { Customer } from '@/types';

export default function EditCustomerPage() {
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
        setError('Failed to load customer');
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

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/customers')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Edit Customer</h1>
              <p className="text-sm text-gray-500">ID: {customerId}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center h-64 bg-white border rounded-lg">
          <Users className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Customer: {customer.company_name || customer.first_name}</h2>
          <p className="text-gray-500">Full customer editing functionality is under development.</p>
          <p className="text-sm text-gray-400 mt-2">Status: {customer.status} | Code: {customer.customer_code || 'N/A'}</p>
        </div>
      </div>
    </MainLayout>
  );
}
