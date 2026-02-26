'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Lead, EnrichedLead, EnrichLeadRequest } from '@/types';
import api from '@/lib/api';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  User,
  Briefcase,
  ArrowRight,
  Plus,
  Loader2,
} from 'lucide-react';

function hasVal(v: string | null | undefined): v is string {
  return v !== null && v !== undefined && v.trim() !== '';
}

// Props
interface LeadEnrichmentProps {
  lead: Lead;
  leadId: number;
  onLeadUpdated: () => void;
  onContactAdded: () => void;
}

// Enrichment options
type EnrichField = 'email' | 'phone' | 'address' | 'contact_name' | 'contact_title';

const FIELD_OPTIONS: { value: EnrichField; label: string; icon: React.ElementType }[] = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'address', label: 'Address', icon: MapPin },
  { value: 'contact_name', label: 'Contact Name', icon: User },
  { value: 'contact_title', label: 'Contact Title', icon: Briefcase },
];

const PROVIDER_OPTIONS = [
  { value: 'auto', label: 'Auto (Full Waterfall)' },
  { value: 'scrape_only', label: 'Free - Website Scrape Only' },
  { value: 'hunter', label: 'Hunter.io' },
  { value: 'apollo', label: 'Apollo' },
  { value: 'website_scrape,hunter', label: 'Scrape + Hunter' },
];

// Validation badge
function ValidationBadge({ valid, label }: { valid: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
      valid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`}>
      {valid ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {label}
    </span>
  );
}

// Source badge
function SourceBadge({ source }: { source?: string }) {
  if (!source) return null;
  return (
    <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
      via {source}
    </span>
  );
}

// Confidence bar
function ConfidenceBar({ confidence }: { confidence: number }) {
  let color = 'bg-red-500';
  if (confidence >= 80) color = 'bg-green-500';
  else if (confidence >= 60) color = 'bg-yellow-500';
  else if (confidence >= 40) color = 'bg-orange-500';

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${confidence}%` }} />
      </div>
      <span>{confidence}%</span>
    </div>
  );
}

// Single enrichment field row with compare + apply
function EnrichFieldRow({
  label,
  icon: Icon,
  currentValue,
  enrichedValue,
  source,
  validation,
  confidence,
  onApply,
  applied,
}: {
  label: string;
  icon: React.ElementType;
  currentValue: string;
  enrichedValue: string;
  source?: string;
  validation?: { valid: boolean; reason: string; warnings?: string[] };
  confidence?: number;
  onApply: () => void;
  applied: boolean;
}) {
  const hasNew = hasVal(enrichedValue);
  const hasCurrent = hasVal(currentValue);
  const isImproved = hasNew && (!hasCurrent || enrichedValue !== currentValue);

  return (
    <div className={`border rounded-lg p-4 ${applied ? 'bg-green-50 border-green-200' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Icon className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{label}</span>
            {source && <SourceBadge source={source} />}
          </div>

          <div className="space-y-1">
            {/* Current */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400 w-16 shrink-0">Current:</span>
              <span className={hasCurrent ? 'text-gray-700' : 'text-gray-400 italic'}>
                {hasCurrent ? currentValue : 'Empty'}
              </span>
            </div>

            {/* Enriched */}
            {hasNew && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-primary-600 w-16 shrink-0">New:</span>
                <span className="text-gray-900 font-medium">{enrichedValue}</span>
                {isImproved && <ArrowRight className="w-3 h-3 text-green-600" />}
              </div>
            )}
            {!hasNew && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400 w-16 shrink-0">New:</span>
                <span className="text-gray-400 italic">Not found</span>
              </div>
            )}
          </div>

          {/* Validation & confidence */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {validation && (
              <ValidationBadge valid={validation.valid} label={validation.reason} />
            )}
            {validation?.warnings && validation.warnings.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                <AlertTriangle className="w-3 h-3" />
                {validation.warnings[0]}
              </span>
            )}
            {confidence !== undefined && <ConfidenceBar confidence={confidence} />}
          </div>
        </div>

        {/* Apply button */}
        {isImproved && !applied && (
          <Button size="sm" variant="ghost" onClick={onApply} className="shrink-0">
            Apply
          </Button>
        )}
        {applied && (
          <Badge className="bg-green-100 text-green-700 shrink-0">Applied</Badge>
        )}
      </div>
    </div>
  );
}


export function LeadEnrichment({ lead, leadId, onLeadUpdated, onContactAdded }: LeadEnrichmentProps) {
  // Options
  const [selectedFields, setSelectedFields] = useState<Set<EnrichField>>(
    new Set<EnrichField>(['email', 'phone', 'address', 'contact_name', 'contact_title'])
  );
  const [provider, setProvider] = useState('auto');
  const [verifyExisting, setVerifyExisting] = useState(true);
  const [verifyDeliverability, setVerifyDeliverability] = useState(false);

  // State
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichResult, setEnrichResult] = useState<EnrichedLead | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appliedFields, setAppliedFields] = useState<Set<string>>(new Set());
  const [isApplying, setIsApplying] = useState(false);
  const [contactAdded, setContactAdded] = useState(false);

  const toggleField = (field: EnrichField) => {
    setSelectedFields(prev => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  };

  const handleEnrich = async () => {
    setIsEnriching(true);
    setError(null);
    setEnrichResult(null);
    setAppliedFields(new Set());
    setContactAdded(false);

    const request: EnrichLeadRequest = {
      leads: [{
        company_name: lead.company_name || '',
        website: lead.website || '',
        email: lead.email || '',
        phone: lead.phone || lead.phone_no || '',
        location: [lead.address_line1, lead.city, lead.state, lead.country].filter(Boolean).join(', '),
        contact_name: '',
        contact_title: '',
        extra: { crm_id: leadId },
      }],
      enrich_fields: Array.from(selectedFields),
      verify_existing: verifyExisting,
      verify_deliverability: verifyDeliverability,
      enrichment_providers: provider.includes(',') ? provider.split(',') : [provider],
    };

    try {
      const response = await api.enrichLead(request);
      if (response.status === 'success' && response.leads?.length > 0) {
        setEnrichResult(response.leads[0]);
      } else {
        setError('Enrichment returned no results.');
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } }; message?: string };
      setError(axiosError.response?.data?.detail || axiosError.message || 'Enrichment failed.');
    } finally {
      setIsEnriching(false);
    }
  };

  // Apply a single field to the lead
  const applyField = async (field: string, value: string) => {
    if (!hasVal(value)) return;
    setIsApplying(true);
    try {
      const updateData: Record<string, unknown> = {};

      if (field === 'email') updateData.email = value;
      if (field === 'phone') {
        // Use normalized phone if available
        const normalized = enrichResult?.format_validation?.phone?.normalized;
        updateData.phone = normalized || value;
        updateData.phone_no = normalized || value;
      }
      if (field === 'address') {
        const standardized = enrichResult?.address_verification?.standardized || value;
        updateData.address_line1 = standardized;
        // Also apply parsed components if available
        const comp = enrichResult?.address_verification?.components;
        if (comp) {
          if (comp.city) updateData.city = comp.city;
          if (comp.state) updateData.state = comp.state;
          if (comp.country) updateData.country = comp.country;
          if (comp.zip) updateData.zip_code = comp.zip;
        }
      }
      if (field === 'website' && enrichResult?.website) {
        updateData.website = enrichResult.website;
      }
      if (field === 'linkedin') {
        updateData.website = updateData.website || enrichResult?.linkedin;
      }
      if (field === 'company_size') {
        updateData.company_size = enrichResult?.company_size;
      }

      await api.updateLead(leadId, updateData as Partial<Lead>);
      setAppliedFields(prev => new Set(prev).add(field));
      onLeadUpdated();
    } catch {
      setError(`Failed to apply ${field}.`);
    } finally {
      setIsApplying(false);
    }
  };

  // Apply all enriched fields at once
  const applyAll = async () => {
    if (!enrichResult) return;
    setIsApplying(true);
    try {
      const updateData: Record<string, unknown> = {};

      if (hasVal(enrichResult.email) && enrichResult.email !== (lead.email || '')) {
        updateData.email = enrichResult.email;
      }
      if (hasVal(enrichResult.phone) && enrichResult.phone !== (lead.phone || '')) {
        const normalized = enrichResult.format_validation?.phone?.normalized;
        updateData.phone = normalized || enrichResult.phone;
        updateData.phone_no = normalized || enrichResult.phone;
      }
      if (hasVal(enrichResult.location) || enrichResult.address_verification?.standardized) {
        const addr = enrichResult.address_verification?.standardized || enrichResult.location;
        if (addr) updateData.address_line1 = addr;
        const comp = enrichResult.address_verification?.components;
        if (comp) {
          if (comp.city) updateData.city = comp.city;
          if (comp.state) updateData.state = comp.state;
          if (comp.country) updateData.country = comp.country;
          if (comp.zip) updateData.zip_code = comp.zip;
        }
      }
      if (hasVal(enrichResult.website) && enrichResult.website !== (lead.website || '')) {
        updateData.website = enrichResult.website;
      }
      if (hasVal(enrichResult.linkedin)) {
        // Store in notes or a future field
      }
      if (hasVal(enrichResult.company_size)) {
        updateData.company_size = enrichResult.company_size;
      }

      if (Object.keys(updateData).length > 0) {
        await api.updateLead(leadId, updateData as Partial<Lead>);
        const applied = new Set(appliedFields);
        if (updateData.email) applied.add('email');
        if (updateData.phone) applied.add('phone');
        if (updateData.address_line1) applied.add('address');
        if (updateData.website) applied.add('website');
        if (updateData.company_size) applied.add('company_size');
        setAppliedFields(applied);
        onLeadUpdated();
      }
    } catch {
      setError('Failed to apply changes.');
    } finally {
      setIsApplying(false);
    }
  };

  // Add discovered contact to lead contacts
  const addAsContact = async () => {
    if (!enrichResult) return;
    setIsApplying(true);
    try {
      const contactData: Record<string, unknown> = {
        lead_id: leadId,
        first_name: enrichResult.contact_name?.split(' ')[0] || lead.company_name || 'Contact',
        last_name: enrichResult.contact_name?.split(' ').slice(1).join(' ') || '',
        designation: enrichResult.contact_title || '',
        email: enrichResult.email || '',
        work_email: enrichResult.email || '',
        phone: enrichResult.phone || '',
        work_phone: enrichResult.phone || '',
        linkedin_url: enrichResult.linkedin || '',
        contact_type: 'management',
        is_primary: false,
        status: 'active',
      };
      await api.createLeadContact(leadId, contactData);
      setContactAdded(true);
      onContactAdded();
    } catch {
      setError('Failed to add contact.');
    } finally {
      setIsApplying(false);
    }
  };

  const r = enrichResult;
  const fv = r?.format_validation;

  return (
    <div className="space-y-6">
      {/* Options Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Enrich Lead Data</h3>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Fill missing data and verify existing information using AI and data providers.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Current Lead Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Current Lead Data</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div><span className="text-gray-500">Company:</span> <span className="font-medium">{lead.company_name || '—'}</span></div>
              <div><span className="text-gray-500">Website:</span> <span className="font-medium">{lead.website || '—'}</span></div>
              <div><span className="text-gray-500">Email:</span> <span className="font-medium">{lead.email || '—'}</span></div>
              <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{lead.phone || lead.phone_no || '—'}</span></div>
              <div><span className="text-gray-500">Address:</span> <span className="font-medium">{lead.address_line1 || '—'}</span></div>
              <div><span className="text-gray-500">Industry:</span> <span className="font-medium">{lead.industry || '—'}</span></div>
            </div>
          </div>

          {/* Fields to Enrich */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fields to Enrich</label>
            <div className="flex flex-wrap gap-3">
              {FIELD_OPTIONS.map(opt => (
                <label
                  key={opt.value}
                  className={`inline-flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer select-none transition-colors ${
                    selectedFields.has(opt.value)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFields.has(opt.value)}
                    onChange={() => toggleField(opt.value)}
                    className="sr-only"
                  />
                  <opt.icon className="w-4 h-4" />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Provider & Verification */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider Strategy</label>
              <select
                value={provider}
                onChange={e => setProvider(e.target.value)}
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                {PROVIDER_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-4">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={verifyExisting}
                  onChange={e => setVerifyExisting(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Verify Format</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={verifyDeliverability}
                  onChange={e => setVerifyDeliverability(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Verify Deliverability</span>
              </label>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleEnrich}
                isLoading={isEnriching}
                disabled={isEnriching || selectedFields.size === 0}
                className="w-full"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Enrich Lead
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Loading */}
      {isEnriching && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-3" />
          <p className="text-sm text-gray-500">Enriching lead data... This may take up to a minute.</p>
        </div>
      )}

      {/* Results */}
      {r && !isEnriching && (
        <div className="space-y-4">
          {/* Enrichment Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {r.enrichment_metadata && (
                <>
                  <Badge className="bg-green-100 text-green-700">
                    {r.enrichment_metadata.fields_enriched.length} fields enriched
                  </Badge>
                  {r.enrichment_metadata.fields_still_missing.length > 0 && (
                    <Badge className="bg-yellow-100 text-yellow-700">
                      {r.enrichment_metadata.fields_still_missing.length} not found
                    </Badge>
                  )}
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-500">
                    Providers: {r.enrichment_metadata.providers_used.join(', ') || 'none'}
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-500">
                    {(r.enrichment_metadata.enrichment_duration_ms / 1000).toFixed(1)}s
                  </span>
                </>
              )}
            </div>
            <Button
              onClick={applyAll}
              isLoading={isApplying}
              disabled={isApplying}
              size="sm"
            >
              Apply All to Lead
            </Button>
          </div>

          {/* Field-by-field Results */}
          <div className="grid grid-cols-1 gap-3">
            <EnrichFieldRow
              label="Email"
              icon={Mail}
              currentValue={lead.email || ''}
              enrichedValue={r.email || ''}
              source={r.email_source}
              validation={fv?.email ? { valid: fv.email.valid, reason: fv.email.reason, warnings: fv.email.warnings } : undefined}
              confidence={r.email_verification?.confidence}
              onApply={() => applyField('email', r.email)}
              applied={appliedFields.has('email')}
            />
            <EnrichFieldRow
              label="Phone"
              icon={Phone}
              currentValue={lead.phone || lead.phone_no || ''}
              enrichedValue={fv?.phone?.national_format || r.phone || ''}
              source={r.phone_source}
              validation={fv?.phone ? { valid: fv.phone.valid, reason: fv.phone.reason, warnings: fv.phone.warnings } : undefined}
              confidence={r.phone_verification?.confidence}
              onApply={() => applyField('phone', r.phone)}
              applied={appliedFields.has('phone')}
            />
            <EnrichFieldRow
              label="Address"
              icon={MapPin}
              currentValue={lead.address_line1 || ''}
              enrichedValue={r.address_verification?.standardized || r.location || ''}
              source={r.address_source}
              validation={fv?.address ? { valid: fv.address.valid, reason: fv.address.reason, warnings: fv.address.warnings } : undefined}
              confidence={r.address_verification?.confidence}
              onApply={() => applyField('address', r.address_verification?.standardized || r.location)}
              applied={appliedFields.has('address')}
            />
          </div>

          {/* Contact Person Card */}
          {(hasVal(r.contact_name) || hasVal(r.contact_title)) && (
            <Card>
              <CardHeader>
                <h4 className="text-sm font-semibold text-gray-700">Discovered Contact Person</h4>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1 text-sm">
                    {hasVal(r.contact_name) && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{r.contact_name}</span>
                        {r.contact_name_source && <SourceBadge source={r.contact_name_source} />}
                      </div>
                    )}
                    {hasVal(r.contact_title) && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <span>{r.contact_title}</span>
                        {r.contact_title_source && <SourceBadge source={r.contact_title_source} />}
                      </div>
                    )}
                    {hasVal(r.linkedin) && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs">LinkedIn:</span>
                        <a href={r.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-xs truncate max-w-[300px]">
                          {r.linkedin}
                        </a>
                      </div>
                    )}
                  </div>
                  {!contactAdded ? (
                    <Button size="sm" onClick={addAsContact} isLoading={isApplying} disabled={isApplying}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add as Lead Contact
                    </Button>
                  ) : (
                    <Badge className="bg-green-100 text-green-700">Contact Added</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Email Deliverability Details */}
          {r.email_verification && (
            <Card>
              <CardHeader>
                <h4 className="text-sm font-semibold text-gray-700">Email Deliverability</h4>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Status:</span>{' '}
                    <Badge className={r.email_verification.deliverable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                      {r.email_verification.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-500">Deliverable:</span>{' '}
                    <span className="font-medium">{r.email_verification.deliverable ? 'Yes' : 'No'}</span>
                  </div>
                  {r.email_verification.details?.smtp_check !== undefined && (
                    <div>
                      <span className="text-gray-500">SMTP:</span>{' '}
                      <span className="font-medium">{r.email_verification.details.smtp_check ? 'Pass' : 'Fail'}</span>
                    </div>
                  )}
                  {r.email_verification.details?.mx_records !== undefined && (
                    <div>
                      <span className="text-gray-500">MX Records:</span>{' '}
                      <span className="font-medium">{r.email_verification.details.mx_records ? 'Found' : 'Missing'}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Phone Verification Details */}
          {r.phone_verification && (
            <Card>
              <CardHeader>
                <h4 className="text-sm font-semibold text-gray-700">Phone Verification</h4>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Valid:</span>{' '}
                    <span className="font-medium">{r.phone_verification.valid ? 'Yes' : 'No'}</span>
                  </div>
                  {hasVal(r.phone_verification.line_type) && (
                    <div>
                      <span className="text-gray-500">Type:</span>{' '}
                      <span className="font-medium capitalize">{r.phone_verification.line_type}</span>
                    </div>
                  )}
                  {hasVal(r.phone_verification.carrier) && (
                    <div>
                      <span className="text-gray-500">Carrier:</span>{' '}
                      <span className="font-medium">{r.phone_verification.carrier}</span>
                    </div>
                  )}
                  {hasVal(r.phone_verification.location) && (
                    <div>
                      <span className="text-gray-500">Location:</span>{' '}
                      <span className="font-medium">{r.phone_verification.location}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
