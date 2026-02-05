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
  Globe,
  MapPin,
  Calendar,
  User,
  Tag,
  DollarSign,
  Target
} from 'lucide-react';
import api from '@/lib/api';
import { Lead } from '@/types';
import { formatDate, formatCurrency, getStatusColor, getPriorityColor } from '@/lib/utils';

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = parseInt(params.id as string);

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const data = await api.getLead(leadId);
        setLead(data);
      } catch (err: any) {
        setError('Failed to load lead details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (leadId) {
      fetchLead();
    }
  }, [leadId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !lead) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500 mb-4">{error || 'Lead not found'}</p>
          <Button variant="secondary" onClick={() => router.push('/leads')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Leads
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
            <Button variant="ghost" size="sm" onClick={() => router.push('/leads')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {lead.company_name || `${lead.first_name} ${lead.last_name || ''}`.trim()}
              </h1>
              <p className="text-sm text-gray-500">Lead ID: {lead.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(lead.lead_status || (lead.status === 0 ? 'active' : 'inactive'))}>
              {lead.lead_status || (lead.status === 0 ? 'Active' : 'Inactive')}
            </Badge>
            <Badge className={getPriorityColor(lead.priority)}>
              {lead.priority}
            </Badge>
            <Link href={`/leads/${lead.id}/edit`}>
              <Button size="sm" className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Company Information
              </h2>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow icon={Building2} label="Company Name" value={lead.company_name} />
              <InfoRow icon={Tag} label="Company Code" value={lead.company_code} />
              <InfoRow icon={Globe} label="Website" value={lead.website} />
              <InfoRow icon={Tag} label="Industry" value={lead.industry} />
              <InfoRow icon={User} label="Company Size" value={lead.company_size} />
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
              <InfoRow icon={User} label="Contact Name" value={`${lead.first_name} ${lead.last_name || ''}`.trim()} />
              <InfoRow icon={Tag} label="Designation" value={lead.designation} />
              <InfoRow icon={Mail} label="Email" value={lead.email} />
              <InfoRow icon={Phone} label="Phone" value={lead.phone} />
              <InfoRow icon={Phone} label="Alternate Phone" value={lead.alternate_phone} />
            </CardContent>
          </Card>

          {/* Lead Value */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Lead Value
              </h2>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow icon={DollarSign} label="Expected Value" value={lead.expected_value ? formatCurrency(lead.expected_value, lead.currency) : null} />
              <InfoRow icon={DollarSign} label="Actual Value" value={lead.actual_value ? formatCurrency(lead.actual_value, lead.currency) : null} />
              <InfoRow icon={Target} label="Pipeline Stage" value={`Stage ${lead.pipeline_stage}`} />
              <InfoRow icon={Calendar} label="Expected Close Date" value={lead.expected_close_date ? formatDate(lead.expected_close_date) : null} />
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address
              </h2>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow icon={MapPin} label="Address" value={lead.address || lead.address_line1} />
              <InfoRow icon={MapPin} label="City" value={lead.city} />
              <InfoRow icon={MapPin} label="State" value={lead.state} />
              <InfoRow icon={MapPin} label="Country" value={lead.country} />
              <InfoRow icon={MapPin} label="Zip Code" value={lead.pincode || lead.zip_code} />
            </CardContent>
          </Card>

          {/* Lead Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Lead Details
              </h2>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <InfoRow icon={Tag} label="Source" value={lead.source} />
              <InfoRow icon={Tag} label="Lead Score" value={lead.lead_score} />
              <InfoRow icon={Calendar} label="Last Contacted" value={lead.last_contacted ? formatDate(lead.last_contacted) : null} />
              <InfoRow icon={Calendar} label="Next Follow Up" value={lead.next_follow_up ? formatDate(lead.next_follow_up) : null} />
              <InfoRow icon={Tag} label="Product Interest" value={lead.product_interest} />
              <InfoRow icon={Tag} label="Requirements" value={lead.requirements} />
            </CardContent>
          </Card>

          {/* Notes */}
          {(lead.notes || lead.remarks) && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <h2 className="text-sm font-semibold text-gray-700">Notes & Remarks</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                {lead.notes && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                    <p className="text-sm text-gray-900">{lead.notes}</p>
                  </div>
                )}
                {lead.remarks && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Remarks</p>
                    <p className="text-sm text-gray-900">{lead.remarks}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t text-sm text-gray-500 flex justify-between">
          <span>Created: {lead.created_at ? formatDate(lead.created_at) : '-'}</span>
          <span>Updated: {lead.updated_at ? formatDate(lead.updated_at) : '-'}</span>
        </div>
      </div>
    </MainLayout>
  );
}
