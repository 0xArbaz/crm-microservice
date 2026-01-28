'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

const leadSchema = z.object({
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
  lead_since: z.string().optional(),
  lead_status: z.string().optional(),
  group_id: z.string().optional(),
  industry_id: z.string().optional(),
  region_id: z.string().optional(),
  from_timings: z.string().optional(),
  to_timings: z.string().optional(),
  timezone: z.string().optional(),
  sales_rep: z.string().optional(),
  source: z.string().optional(),
  lead_score: z.string().optional(),
  remarks: z.string().optional(),
  first_name: z.string().optional(),
  priority: z.string().optional(),
});

type LeadForm = z.infer<typeof leadSchema>;

const sourceOptions = [
  { value: '', label: 'Select Lead Source' },
  { value: 'direct', label: 'Direct' },
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
  { value: 'proposal_sent', label: 'Proposal Sent' },
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

export default function NewLeadPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadForm>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      source: 'direct',
      lead_since: new Date().toISOString().split('T')[0],
      priority: 'medium',
    },
  });

  const onSubmit = async (data: LeadForm) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Combine office timings
      let office_timings = '';
      if (data.from_timings && data.to_timings) {
        office_timings = `${data.from_timings} - ${data.to_timings}`;
      }

      const apiData = {
        first_name: data.company_name,
        company_name: data.company_name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        source: data.source || 'direct',
        priority: data.priority || 'medium',
        industry: data.industry_id ? `Industry ${data.industry_id}` : undefined,
        city: data.city_id ? `City ${data.city_id}` : undefined,
        state: data.state_id ? `State ${data.state_id}` : undefined,
        country: data.country_id ? 'India' : 'India',
        notes: data.remarks,
        // Extended fields stored in notes or custom fields
      };

      await api.createLead(apiData as any);
      setSuccess('Lead created successfully!');
      setTimeout(() => {
        router.push('/leads');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full h-9 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500";
  const selectClass = "w-full h-9 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white";
  const labelClass = "w-40 text-sm font-medium flex-shrink-0";

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <h1 className="text-lg font-semibold text-gray-800">NEW LEAD</h1>
          <button className="p-2 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Company Details Header */}
          <div className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-t">
            Company Details
          </div>

          <div className="bg-white border border-t-0 border-gray-200 rounded-b p-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 text-green-600 p-3 rounded text-sm mb-4">
                {success}
              </div>
            )}

            <div className="grid grid-cols-2 gap-x-16 gap-y-3">
              {/* Left Column */}
              <div className="space-y-3">
                {/* Company Name */}
                <div className="flex items-center gap-4">
                  <label className={`${labelClass} text-blue-600`}>Company Name</label>
                  <input
                    type="text"
                    placeholder="Company Name"
                    className={`${inputClass} flex-1`}
                    {...register('company_name')}
                  />
                </div>
                {errors.company_name && (
                  <p className="text-red-500 text-xs ml-44">{errors.company_name.message}</p>
                )}

                {/* Address */}
                <div className="flex items-center gap-4">
                  <label className={`${labelClass} text-blue-600`}>Address</label>
                  <input
                    type="text"
                    placeholder="Address"
                    className={`${inputClass} flex-1`}
                    {...register('address_line1')}
                  />
                </div>

                {/* Address 2 */}
                <div className="flex items-center gap-4">
                  <label className={labelClass}></label>
                  <input
                    type="text"
                    placeholder="Address 2"
                    className={`${inputClass} flex-1`}
                    {...register('address_line2')}
                  />
                </div>

                {/* Country */}
                <div className="flex items-center gap-4">
                  <label className={`${labelClass} text-blue-600`}>Country</label>
                  <select className={`${selectClass} flex-1`} {...register('country_id')}>
                    {countryOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* State/Province */}
                <div className="flex items-center gap-4">
                  <label className={`${labelClass} text-blue-600`}>State/Province</label>
                  <select className={`${selectClass} flex-1`} {...register('state_id')}>
                    {stateOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div className="flex items-center gap-4">
                  <label className={`${labelClass} text-blue-600`}>City</label>
                  <div className="flex gap-2 flex-1">
                    <select className={`${selectClass} flex-1`} {...register('city_id')}>
                      {cityOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <button type="button" className="px-3 h-9 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-gray-600">+</button>
                  </div>
                </div>

                {/* Postal/Zip Code */}
                <div className="flex items-center gap-4">
                  <label className={`${labelClass} text-blue-600`}>Postal/Zip Code</label>
                  <input
                    type="text"
                    placeholder="Postal/Zip Code"
                    className={`${inputClass} flex-1`}
                    {...register('zip_code')}
                  />
                </div>

                {/* Phone */}
                <div className="flex items-center gap-4">
                  <label className={`${labelClass} text-blue-600`}>Phone</label>
                  <input
                    type="text"
                    placeholder="+(Country Code)(Area Code)(Phone)"
                    className={`${inputClass} flex-1`}
                    {...register('phone_no')}
                  />
                </div>

                {/* Fax */}
                <div className="flex items-center gap-4">
                  <label className={`${labelClass} text-blue-600`}>Fax</label>
                  <input
                    type="text"
                    placeholder="+(Country Code)(Area Code)(Fax)"
                    className={`${inputClass} flex-1`}
                    {...register('fax')}
                  />
                </div>

                {/* Website */}
                <div className="flex items-center gap-4">
                  <label className={`${labelClass} text-blue-600`}>Website</label>
                  <input
                    type="text"
                    placeholder="Website"
                    className={`${inputClass} flex-1`}
                    {...register('website')}
                  />
                </div>

                {/* Name of Rep. */}
                <div className="flex items-center gap-4">
                  <label className={`${labelClass} text-blue-600`}>Name of Rep.</label>
                  <input
                    type="text"
                    placeholder="Name of Rep."
                    className={`${inputClass} flex-1`}
                    {...register('nof_representative')}
                  />
                </div>

                {/* Contact Phone */}
                <div className="flex items-center gap-4">
                  <label className={`${labelClass} text-blue-600`}>Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+(Country Code)(Area Code)(Contact Phone)"
                    className={`${inputClass} flex-1`}
                    {...register('phone')}
                  />
                </div>

                {/* Email ID */}
                <div className="flex items-center gap-4">
                  <label className={`${labelClass} text-blue-600`}>Email ID</label>
                  <input
                    type="email"
                    placeholder="Email ID"
                    className={`${inputClass} flex-1`}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs ml-44">{errors.email.message}</p>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-3">
                {/* Lead Registered */}
                <div className="flex items-center gap-4">
                  <label className={`${labelClass} text-blue-600`}>Lead Registered</label>
                  <input
                    type="date"
                    className={`${inputClass} flex-1`}
                    {...register('lead_since')}
                  />
                </div>

                {/* Lead Status */}
                <div className="flex items-center gap-4">
                  <label className={`${labelClass} text-blue-600`}>Lead Status</label>
                  <select className={`${selectClass} flex-1`} {...register('lead_status')}>
                    {leadStatusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Group */}
                <div className="flex items-center gap-4">
                  <label className={`${labelClass} text-blue-600`}>Group</label>
                  <div className="flex gap-2 flex-1">
                    <select className={`${selectClass} flex-1`} {...register('group_id')}>
                      {groupOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <button type="button" className="px-3 h-9 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-gray-600">+</button>
                  </div>
                </div>

                {/* Industry */}
                <div className="flex items-center gap-4">
                  <label className={`${labelClass} text-blue-600`}>Industry</label>
                  <div className="flex gap-2 flex-1">
                    <select className={`${selectClass} flex-1`} {...register('industry_id')}>
                      {industryOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <button type="button" className="px-3 h-9 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-gray-600">+</button>
                  </div>
                </div>

                {/* Company Region */}
                <div className="flex items-center gap-4">
                  <label className={`${labelClass} text-blue-600`}>Company Region</label>
                  <div className="flex gap-2 flex-1">
                    <select className={`${selectClass} flex-1`} {...register('region_id')}>
                      {regionOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <button type="button" className="px-3 h-9 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-gray-600">+</button>
                  </div>
                </div>

                {/* Office Timing */}
                <div className="flex items-center gap-4">
                  <label className={`${labelClass} text-blue-600`}>Office Timing</label>
                  <div className="flex gap-2 flex-1">
                    <input
                      type="time"
                      className={`${inputClass} flex-1`}
                      {...register('from_timings')}
                    />
                    <input
                      type="time"
                      className={`${inputClass} flex-1`}
                      {...register('to_timings')}
                    />
                  </div>
                </div>

                {/* Company Timezone */}
                <div className="flex items-center gap-4">
                  <label className={`${labelClass} text-blue-600`}>Company Timezone</label>
                  <select className={`${selectClass} flex-1`} {...register('timezone')}>
                    {timezoneOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Sales Representative */}
                <div className="flex items-center gap-4">
                  <label className={`${labelClass} text-blue-600`}>Sales Representative</label>
                  <select className={`${selectClass} flex-1`} {...register('sales_rep')}>
                    {salesRepOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Lead Source */}
                <div className="flex items-center gap-4">
                  <label className={`${labelClass} text-blue-600`}>Lead Source</label>
                  <div className="flex gap-2 flex-1">
                    <select className={`${selectClass} flex-1`} {...register('source')}>
                      {sourceOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <button type="button" className="px-3 h-9 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-gray-600">+</button>
                  </div>
                </div>

                {/* Lead Score */}
                <div className="flex items-center gap-4">
                  <label className={`${labelClass} text-blue-600`}>Lead Score</label>
                  <select className={`${selectClass} flex-1`} {...register('lead_score')}>
                    {leadScoreOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Remarks */}
                <div className="flex items-start gap-4">
                  <label className={`${labelClass} text-blue-600 pt-2`}>Remarks</label>
                  <textarea
                    placeholder="Remarks"
                    rows={3}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    {...register('remarks')}
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-center mt-6">
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 rounded"
              >
                Save
              </Button>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
