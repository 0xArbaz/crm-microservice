'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import api from '@/lib/api';

const preLeadSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  company_name: z.string().optional(),
  designation: z.string().optional(),
  source: z.string().min(1, 'Source is required'),
  source_details: z.string().optional(),
  product_interest: z.string().optional(),
  requirements: z.string().optional(),
  budget_range: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('India'),
  notes: z.string().optional(),
});

type PreLeadForm = z.infer<typeof preLeadSchema>;

const sourceOptions = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'walk_in', label: 'Walk In' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'other', label: 'Other' },
];

export default function NewPreLeadPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PreLeadForm>({
    resolver: zodResolver(preLeadSchema),
    defaultValues: {
      country: 'India',
      source: 'website',
    },
  });

  const onSubmit = async (data: PreLeadForm) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await api.createPreLead(data);
      router.push('/pre-leads');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create pre-lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">New Pre-Lead</h1>
          <p className="text-gray-500">Capture a new inquiry or pre-lead</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Basic Information</h2>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name *"
                  placeholder="John"
                  error={errors.first_name?.message}
                  {...register('first_name')}
                />
                <Input
                  label="Last Name"
                  placeholder="Doe"
                  error={errors.last_name?.message}
                  {...register('last_name')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="john@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Input
                  label="Phone"
                  placeholder="+91 98765 43210"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  placeholder="Acme Corp"
                  error={errors.company_name?.message}
                  {...register('company_name')}
                />
                <Input
                  label="Designation"
                  placeholder="Manager"
                  error={errors.designation?.message}
                  {...register('designation')}
                />
              </div>
            </CardContent>

            <CardHeader>
              <h2 className="text-lg font-semibold">Lead Source</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Source *"
                  options={sourceOptions}
                  error={errors.source?.message}
                  {...register('source')}
                />
                <Input
                  label="Source Details"
                  placeholder="Campaign name, referrer, etc."
                  error={errors.source_details?.message}
                  {...register('source_details')}
                />
              </div>
            </CardContent>

            <CardHeader>
              <h2 className="text-lg font-semibold">Interest & Requirements</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Product Interest"
                  placeholder="Product or service interested in"
                  error={errors.product_interest?.message}
                  {...register('product_interest')}
                />
                <Input
                  label="Budget Range"
                  placeholder="e.g., 1-5 Lakhs"
                  error={errors.budget_range?.message}
                  {...register('budget_range')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requirements
                </label>
                <textarea
                  placeholder="Describe the requirements..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  {...register('requirements')}
                />
              </div>
            </CardContent>

            <CardHeader>
              <h2 className="text-lg font-semibold">Location</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="City"
                  placeholder="Mumbai"
                  error={errors.city?.message}
                  {...register('city')}
                />
                <Input
                  label="State"
                  placeholder="Maharashtra"
                  error={errors.state?.message}
                  {...register('state')}
                />
                <Input
                  label="Country"
                  placeholder="India"
                  error={errors.country?.message}
                  {...register('country')}
                />
              </div>
            </CardContent>

            <CardHeader>
              <h2 className="text-lg font-semibold">Notes</h2>
            </CardHeader>
            <CardContent>
              <textarea
                placeholder="Additional notes..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                {...register('notes')}
              />
            </CardContent>

            <CardFooter className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Create Pre-Lead
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </MainLayout>
  );
}
