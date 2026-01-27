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
  // Company Details - Left Column
  company_name: z.string().min(1, 'Company name is required'),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  country_id: z.string().optional(),
  state_id: z.string().optional(),
  city_id: z.string().optional(),
  zip_code: z.string().optional(),
  phone_no: z.string().optional(),
  fax: z.string().optional(),
  website: z.string().optional(),
  nof_representative: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),

  // Right Column
  lead_since: z.string().optional(),
  lead_status: z.string().optional(),
  group_id: z.string().optional(),
  industry_id: z.string().optional(),
  region_id: z.string().optional(),
  from_timings: z.string().optional(),
  to_timings: z.string().optional(),
  timezone: z.string().optional(),
  sales_rep: z.string().optional(),
  lead_source: z.string().optional(),
  lead_score: z.string().optional(),
  remarks: z.string().optional(),

  // Hidden/default fields
  source: z.string().default('website'),
  first_name: z.string().optional(),
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

const leadStatusOptions = [
  { value: '', label: 'Select Lead Status' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
];

const groupOptions = [
  { value: '', label: 'Select Group' },
  { value: '1', label: 'Group A' },
  { value: '2', label: 'Group B' },
  { value: '3', label: 'Group C' },
];

const industryOptions = [
  { value: '', label: 'Select Industry' },
  { value: '1', label: 'Technology' },
  { value: '2', label: 'Manufacturing' },
  { value: '3', label: 'Healthcare' },
  { value: '4', label: 'Finance' },
  { value: '5', label: 'Retail' },
];

const regionOptions = [
  { value: '', label: 'Select Company Region' },
  { value: '1', label: 'North' },
  { value: '2', label: 'South' },
  { value: '3', label: 'East' },
  { value: '4', label: 'West' },
];

const timezoneOptions = [
  { value: '', label: 'Select Company Timezone' },
  { value: 'Asia/Kolkata', label: 'IST (Asia/Kolkata)' },
  { value: 'America/New_York', label: 'EST (America/New_York)' },
  { value: 'America/Los_Angeles', label: 'PST (America/Los_Angeles)' },
  { value: 'Europe/London', label: 'GMT (Europe/London)' },
  { value: 'Asia/Dubai', label: 'GST (Asia/Dubai)' },
];

const salesRepOptions = [
  { value: '', label: 'Select Sales Representative' },
  { value: '1', label: 'Admin User' },
];

const leadScoreOptions = [
  { value: '', label: 'Select Lead Score' },
  { value: 'hot', label: 'Hot' },
  { value: 'warm', label: 'Warm' },
  { value: 'cold', label: 'Cold' },
];

const countryOptions = [
  { value: '', label: 'Select Country' },
  { value: '1', label: 'India' },
  { value: '2', label: 'United States' },
  { value: '3', label: 'United Kingdom' },
  { value: '4', label: 'Canada' },
  { value: '5', label: 'Australia' },
];

const stateOptions = [
  { value: '', label: 'Nothing selected' },
  { value: '1', label: 'Maharashtra' },
  { value: '2', label: 'Karnataka' },
  { value: '3', label: 'Delhi' },
  { value: '4', label: 'Tamil Nadu' },
  { value: '5', label: 'Gujarat' },
];

const cityOptions = [
  { value: '', label: 'Nothing selected' },
  { value: '1', label: 'Mumbai' },
  { value: '2', label: 'Bangalore' },
  { value: '3', label: 'Delhi' },
  { value: '4', label: 'Chennai' },
  { value: '5', label: 'Ahmedabad' },
];

export default function NewPreLeadPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PreLeadForm>({
    resolver: zodResolver(preLeadSchema),
    defaultValues: {
      source: 'website',
      lead_since: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: PreLeadForm) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Map form data to API format
      const apiData = {
        ...data,
        first_name: data.company_name, // Use company name as first name
        country_id: data.country_id ? parseInt(data.country_id) : undefined,
        state_id: data.state_id ? parseInt(data.state_id) : undefined,
        city_id: data.city_id ? parseInt(data.city_id) : undefined,
        group_id: data.group_id ? parseInt(data.group_id) : undefined,
        industry_id: data.industry_id ? parseInt(data.industry_id) : undefined,
        region_id: data.region_id ? parseInt(data.region_id) : undefined,
        sales_rep: data.sales_rep ? parseInt(data.sales_rep) : undefined,
      };

      await api.createPreLead(apiData);
      setSuccess('Pre-lead created successfully!');
      setTimeout(() => {
        router.push('/pre-leads');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create pre-lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">NEW LEAD</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader className="bg-blue-600 text-white py-2 px-4 rounded-t-lg">
              <h2 className="text-sm font-semibold">Company Details</h2>
            </CardHeader>
            <CardContent className="p-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <label className="w-36 text-sm text-blue-600 font-medium">Company Name</label>
                    <Input
                      placeholder="Company Name"
                      className="flex-1"
                      error={errors.company_name?.message}
                      {...register('company_name')}
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="w-36 text-sm text-blue-600 font-medium">Address</label>
                    <Input
                      placeholder="Address"
                      className="flex-1"
                      {...register('address_line1')}
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="w-36 text-sm text-gray-400"></label>
                    <Input
                      placeholder="Address 2"
                      className="flex-1"
                      {...register('address_line2')}
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="w-36 text-sm text-blue-600 font-medium">Country</label>
                    <Select
                      options={countryOptions}
                      className="flex-1"
                      {...register('country_id')}
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="w-36 text-sm text-blue-600 font-medium">State/Province</label>
                    <Select
                      options={stateOptions}
                      className="flex-1"
                      {...register('state_id')}
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="w-36 text-sm text-blue-600 font-medium">City</label>
                    <div className="flex-1 flex gap-2">
                      <Select
                        options={cityOptions}
                        className="flex-1"
                        {...register('city_id')}
                      />
                      <Button type="button" variant="secondary" className="px-3">+</Button>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <label className="w-36 text-sm text-blue-600 font-medium">Postal/Zip Code</label>
                    <Input
                      placeholder="Postal/Zip Code"
                      className="flex-1"
                      {...register('zip_code')}
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="w-36 text-sm text-blue-600 font-medium">Phone</label>
                    <Input
                      placeholder="+(Country Code)(Area Code)(Phone)"
                      className="flex-1"
                      {...register('phone_no')}
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="w-36 text-sm text-blue-600 font-medium">Fax</label>
                    <Input
                      placeholder="+(Country Code)(Area Code)(Fax)"
                      className="flex-1"
                      {...register('fax')}
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="w-36 text-sm text-blue-600 font-medium">Website</label>
                    <Input
                      placeholder="Website"
                      className="flex-1"
                      {...register('website')}
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="w-36 text-sm text-blue-600 font-medium">Name of Rep.</label>
                    <Input
                      placeholder="Name of Rep."
                      className="flex-1"
                      {...register('nof_representative')}
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="w-36 text-sm text-blue-600 font-medium">Contact Phone</label>
                    <Input
                      placeholder="+(Country Code)(Area Code)(Contact Phone)"
                      className="flex-1"
                      {...register('phone')}
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="w-36 text-sm text-blue-600 font-medium">Email ID</label>
                    <Input
                      type="email"
                      placeholder="Email ID"
                      className="flex-1"
                      error={errors.email?.message}
                      {...register('email')}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <label className="w-40 text-sm text-blue-600 font-medium">Lead Registered</label>
                    <Input
                      type="date"
                      className="flex-1"
                      {...register('lead_since')}
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="w-40 text-sm text-blue-600 font-medium">Lead Status</label>
                    <Select
                      options={leadStatusOptions}
                      className="flex-1"
                      {...register('lead_status')}
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="w-40 text-sm text-blue-600 font-medium">Group</label>
                    <div className="flex-1 flex gap-2">
                      <Select
                        options={groupOptions}
                        className="flex-1"
                        {...register('group_id')}
                      />
                      <Button type="button" variant="secondary" className="px-3">+</Button>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <label className="w-40 text-sm text-blue-600 font-medium">Industry</label>
                    <div className="flex-1 flex gap-2">
                      <Select
                        options={industryOptions}
                        className="flex-1"
                        {...register('industry_id')}
                      />
                      <Button type="button" variant="secondary" className="px-3">+</Button>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <label className="w-40 text-sm text-blue-600 font-medium">Company Region</label>
                    <div className="flex-1 flex gap-2">
                      <Select
                        options={regionOptions}
                        className="flex-1"
                        {...register('region_id')}
                      />
                      <Button type="button" variant="secondary" className="px-3">+</Button>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <label className="w-40 text-sm text-blue-600 font-medium">Office Timing</label>
                    <div className="flex-1 flex gap-2">
                      <Input
                        type="time"
                        placeholder="08:00 AM"
                        className="flex-1"
                        {...register('from_timings')}
                      />
                      <Input
                        type="time"
                        placeholder="05:00 PM"
                        className="flex-1"
                        {...register('to_timings')}
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <label className="w-40 text-sm text-blue-600 font-medium">Company Timezone</label>
                    <Select
                      options={timezoneOptions}
                      className="flex-1"
                      {...register('timezone')}
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="w-40 text-sm text-blue-600 font-medium">Sales Representative</label>
                    <Select
                      options={salesRepOptions}
                      className="flex-1"
                      {...register('sales_rep')}
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="w-40 text-sm text-blue-600 font-medium">Lead Source</label>
                    <div className="flex-1 flex gap-2">
                      <Select
                        options={sourceOptions}
                        className="flex-1"
                        {...register('source')}
                      />
                      <Button type="button" variant="secondary" className="px-3">+</Button>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <label className="w-40 text-sm text-blue-600 font-medium">Lead Score</label>
                    <Select
                      options={leadScoreOptions}
                      className="flex-1"
                      {...register('lead_score')}
                    />
                  </div>

                  <div className="flex items-start">
                    <label className="w-40 text-sm text-blue-600 font-medium pt-2">Remarks</label>
                    <textarea
                      placeholder="Remarks"
                      rows={3}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register('remarks')}
                    />
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-center py-4">
              <Button type="submit" isLoading={isSubmitting} className="bg-green-500 hover:bg-green-600 px-8">
                Save
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </MainLayout>
  );
}
