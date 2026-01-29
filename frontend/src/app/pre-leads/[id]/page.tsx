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
  Clock
} from 'lucide-react';
import api from '@/lib/api';
import { PreLead } from '@/types';
import { formatDate, getStatusColor } from '@/lib/utils';

export default function PreLeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const preLeadId = parseInt(params.id as string);

  const [preLead, setPreLead] = useState<PreLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreLead = async () => {
      try {
        const data = await api.getPreLead(preLeadId);
        setPreLead(data);
      } catch (err: any) {
        setError('Failed to load pre-lead details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (preLeadId) {
      fetchPreLead();
    }
  }, [preLeadId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !preLead) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500 mb-4">{error || 'Pre-lead not found'}</p>
          <Button variant="secondary" onClick={() => router.push('/pre-leads')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Pre-Leads
          </Button>
        </div>
      </MainLayout>
    );
  }

  const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null | undefined }) => (
    <div className="flex items-start gap-3 py-2">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm text-gray-900">{value || '-'}</p>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/pre-leads')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {preLead.company_name || preLead.first_name}
              </h1>
              <p className="text-sm text-gray-500">Pre-Lead ID: {preLead.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(preLead.status)}>
              {preLead.status}
            </Badge>
            <Link href={`/pre-leads/${preLead.id}/edit`}>
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
              <InfoRow icon={Building2} label="Company Name" value={preLead.company_name} />
              <InfoRow icon={Globe} label="Website" value={preLead.website} />
              <InfoRow icon={User} label="Representative" value={preLead.nof_representative} />
              <InfoRow icon={Tag} label="Industry" value={preLead.industry_id ? `Industry ${preLead.industry_id}` : null} />
              <InfoRow icon={Tag} label="Group" value={preLead.group_id ? `Group ${preLead.group_id}` : null} />
              <InfoRow icon={Tag} label="Region" value={preLead.region_id ? `Region ${preLead.region_id}` : null} />
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
              <InfoRow icon={User} label="Contact Name" value={`${preLead.first_name} ${preLead.last_name || ''}`.trim()} />
              <InfoRow icon={Mail} label="Email" value={preLead.email} />
              <InfoRow icon={Phone} label="Phone" value={preLead.phone || preLead.phone_no} />
              <InfoRow icon={Phone} label="Fax" value={preLead.fax} />
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
              <InfoRow icon={MapPin} label="Address Line 1" value={preLead.address_line1} />
              <InfoRow icon={MapPin} label="Address Line 2" value={preLead.address_line2} />
              <InfoRow icon={MapPin} label="City" value={preLead.city} />
              <InfoRow icon={MapPin} label="State" value={preLead.state} />
              <InfoRow icon={MapPin} label="Country" value={preLead.country} />
              <InfoRow icon={MapPin} label="Zip Code" value={preLead.zip_code} />
            </CardContent>
          </Card>

          {/* Lead Details */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Lead Details
              </h2>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow icon={Tag} label="Source" value={preLead.source} />
              <InfoRow icon={Tag} label="Lead Score" value={preLead.lead_score} />
              <InfoRow icon={Tag} label="Lead Status" value={preLead.lead_status} />
              <InfoRow icon={Calendar} label="Lead Since" value={preLead.lead_since ? formatDate(preLead.lead_since) : null} />
              <InfoRow icon={Clock} label="Office Timings" value={preLead.office_timings} />
              <InfoRow icon={Clock} label="Timezone" value={preLead.timezone} />
            </CardContent>
          </Card>

          {/* Additional Info */}
          {(preLead.remarks || preLead.notes || preLead.requirements) && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <h2 className="text-sm font-semibold text-gray-700">Additional Information</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                {preLead.remarks && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Remarks</p>
                    <p className="text-sm text-gray-900">{preLead.remarks}</p>
                  </div>
                )}
                {preLead.notes && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                    <p className="text-sm text-gray-900">{preLead.notes}</p>
                  </div>
                )}
                {preLead.requirements && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Requirements</p>
                    <p className="text-sm text-gray-900">{preLead.requirements}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t text-sm text-gray-500 flex justify-between">
          <span>Created: {preLead.created_at ? formatDate(preLead.created_at) : '-'}</span>
          <span>Updated: {preLead.updated_at ? formatDate(preLead.updated_at) : '-'}</span>
        </div>
      </div>
    </MainLayout>
  );
}
