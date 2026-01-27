'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import api from '@/lib/api';
import { SalesTarget } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

const periodOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const typeOptions = [
  { value: 'revenue', label: 'Revenue' },
  { value: 'lead_count', label: 'Lead Count' },
  { value: 'conversion', label: 'Conversion Rate' },
  { value: 'customer_count', label: 'Customer Count' },
];

export default function SalesTargetPage() {
  const [targets, setTargets] = useState<SalesTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchTargets = async () => {
    setLoading(true);
    try {
      const response = await api.getSalesTargets({ active_only: true });
      setTargets(response.items);
    } catch (error) {
      console.error('Failed to fetch targets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTargets();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Targets</h1>
            <p className="text-gray-500">Set and track sales goals</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Target
          </Button>
        </div>

        {/* Targets Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : targets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No sales targets set</p>
              <Button className="mt-4" onClick={() => setShowModal(true)}>
                Create Your First Target
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {targets.map((target) => (
              <Card key={target.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{target.name}</h3>
                    <span className="text-xs text-gray-500 capitalize">
                      {target.period}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span className="font-medium">
                          {target.progress_percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            target.progress_percentage >= 100
                              ? 'bg-green-500'
                              : target.progress_percentage >= 75
                              ? 'bg-blue-500'
                              : target.progress_percentage >= 50
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{
                            width: `${Math.min(target.progress_percentage, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Values */}
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Achieved</p>
                        <p className="font-semibold text-green-600">
                          {target.target_type === 'revenue'
                            ? formatCurrency(Number(target.achieved_value))
                            : target.achieved_value}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Target</p>
                        <p className="font-semibold">
                          {target.target_type === 'revenue'
                            ? formatCurrency(Number(target.target_value))
                            : target.target_value}
                        </p>
                      </div>
                    </div>

                    {/* Period */}
                    <div className="text-xs text-gray-500 pt-2 border-t">
                      {formatDate(target.start_date)} - {formatDate(target.end_date)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Target Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Create Sales Target"
          size="md"
        >
          <form className="space-y-4">
            <Input label="Target Name" placeholder="Q1 Revenue Target" />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Type" options={typeOptions} />
              <Select label="Period" options={periodOptions} />
            </div>
            <Input label="Target Value" type="number" placeholder="1000000" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Start Date" type="date" />
              <Input label="End Date" type="date" />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button>Create Target</Button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
}
