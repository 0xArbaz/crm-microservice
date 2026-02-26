'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Lead, EnrichedLead, BulkEnrichJobProgress } from '@/types';
import api from '@/lib/api';
import {
  X,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Mail,
  Phone,
  MapPin,
  User,
  Briefcase,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

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

function hasVal(v: string | null | undefined): v is string {
  return v !== null && v !== undefined && v.trim() !== '';
}

interface LeadApplyResult {
  lead: Lead;
  enriched: EnrichedLead;
  status: 'pending' | 'applied' | 'error';
  fieldsUpdated?: string[];
}

interface BulkEnrichmentModalProps {
  leads: Lead[];
  onClose: () => void;
  onComplete: () => void;
}

export function BulkEnrichmentModal({ leads, onClose, onComplete }: BulkEnrichmentModalProps) {
  // Config state
  const [selectedFields, setSelectedFields] = useState<Set<EnrichField>>(
    new Set<EnrichField>(['email', 'phone', 'address', 'contact_name', 'contact_title'])
  );
  const [provider, setProvider] = useState('auto');
  const [verifyExisting, setVerifyExisting] = useState(true);
  const [verifyDeliverability, setVerifyDeliverability] = useState(false);
  const [skipVerified, setSkipVerified] = useState(false);
  const [autoApply, setAutoApply] = useState(false);
  const [addContacts, setAddContacts] = useState(false);
  const [chunkSize, setChunkSize] = useState(25);

  // Phase management
  const [phase, setPhase] = useState<'config' | 'enriching' | 'results'>('config');
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobProgress, setJobProgress] = useState<BulkEnrichJobProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Results
  const [enrichedLeads, setEnrichedLeads] = useState<EnrichedLead[]>([]);
  const [applyResults, setApplyResults] = useState<LeadApplyResult[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [isApplyingAll, setIsApplyingAll] = useState(false);
  const [resultsPage, setResultsPage] = useState(1);
  const [totalResultPages, setTotalResultPages] = useState(1);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const toggleField = (field: EnrichField) => {
    setSelectedFields(prev => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  };

  const toggleExpanded = (index: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // Stop polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Submit bulk job
  const handleEnrich = useCallback(async () => {
    setPhase('enriching');
    setError(null);
    setJobProgress(null);
    setEnrichedLeads([]);
    setApplyResults([]);

    try {
      const response = await api.submitBulkEnrichment({
        leads: leads.map(lead => ({
          company_name: lead.company_name || '',
          website: lead.website || '',
          email: lead.email || '',
          phone: lead.phone || lead.phone_no || '',
          location: [lead.address_line1, lead.city, lead.state, lead.country].filter(Boolean).join(', '),
          contact_name: '',
          contact_title: '',
          extra: { crm_id: lead.id },
        })),
        enrich_fields: Array.from(selectedFields),
        verify_existing: verifyExisting,
        verify_deliverability: verifyDeliverability,
        enrichment_providers: provider.includes(',') ? provider.split(',') : [provider],
        skip_verified: skipVerified,
        chunk_size: chunkSize,
      });

      setJobId(response.job_id);

      // Start polling
      pollIntervalRef.current = setInterval(async () => {
        try {
          const progress = await api.pollBulkEnrichment(response.job_id);
          setJobProgress(progress);

          if (progress.status === 'completed' || progress.status === 'failed') {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;

            if (progress.status === 'completed') {
              await fetchAllResults(response.job_id);
            } else {
              setError(`Bulk enrichment failed. ${progress.errors?.join(', ') || ''}`);
              setPhase('results');
            }
          }
        } catch {
          // Polling error - keep trying
        }
      }, 3000);

    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } }; message?: string };
      setError(axiosError.response?.data?.detail || axiosError.message || 'Failed to submit bulk enrichment job.');
      setPhase('config');
    }
  }, [leads, selectedFields, provider, verifyExisting, verifyDeliverability, skipVerified, chunkSize]);

  // Fetch all results page by page
  const fetchAllResults = async (jId: string) => {
    const allResults: EnrichedLead[] = [];
    let page = 1;

    try {
      while (true) {
        const data = await api.fetchBulkEnrichmentResults(jId, page, 100);
        allResults.push(...data.leads);

        if (!data.pagination.has_next) break;
        page++;
      }

      setEnrichedLeads(allResults);

      // Match enriched results back to CRM leads by crm_id in extra
      // The API may return crm_id as string or number, so use loose comparison
      const applyList: LeadApplyResult[] = allResults.map((enriched, idx) => {
        const crmId = enriched.extra?.crm_id;
        const matchedLead = (crmId != null
          ? leads.find(l => String(l.id) === String(crmId))
          : undefined
        ) || leads.find(l =>
          l.company_name && enriched.company_name &&
          l.company_name.toLowerCase() === enriched.company_name.toLowerCase()
        ) || leads[idx] || leads[0];
        return { lead: matchedLead, enriched, status: 'pending' as const };
      });
      setApplyResults(applyList);
      setTotalResultPages(Math.ceil(allResults.length / 20));

      // Auto-apply if enabled
      if (autoApply) {
        await applyAllResults(applyList);
      }

      setPhase('results');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } }; message?: string };
      setError(axiosError.response?.data?.detail || axiosError.message || 'Failed to fetch results.');
      setPhase('results');
    }
  };

  // Apply enriched data to a single CRM lead
  const applyEnrichedData = async (lead: Lead, enriched: EnrichedLead, shouldAddContact: boolean): Promise<string[]> => {
    const updateData: Record<string, unknown> = {};
    const fieldsUpdated: string[] = [];

    if (hasVal(enriched.email) && enriched.email !== (lead.email || '')) {
      updateData.email = enriched.email;
      fieldsUpdated.push('email');
    }
    if (hasVal(enriched.phone) && enriched.phone !== (lead.phone || '')) {
      const normalized = enriched.format_validation?.phone?.normalized;
      updateData.phone = normalized || enriched.phone;
      updateData.phone_no = normalized || enriched.phone;
      fieldsUpdated.push('phone');
    }
    if (hasVal(enriched.location) || enriched.address_verification?.standardized) {
      const addr = enriched.address_verification?.standardized || enriched.location;
      if (addr && addr !== (lead.address_line1 || '')) {
        updateData.address_line1 = addr;
        fieldsUpdated.push('address');
        const comp = enriched.address_verification?.components;
        if (comp) {
          if (comp.city) updateData.city = comp.city;
          if (comp.state) updateData.state = comp.state;
          if (comp.country) updateData.country = comp.country;
          if (comp.zip) updateData.zip_code = comp.zip;
        }
      }
    }
    if (hasVal(enriched.website) && enriched.website !== (lead.website || '')) {
      updateData.website = enriched.website;
      fieldsUpdated.push('website');
    }
    if (hasVal(enriched.company_size)) {
      updateData.company_size = enriched.company_size;
      fieldsUpdated.push('company_size');
    }

    if (Object.keys(updateData).length > 0) {
      await api.updateLead(lead.id, updateData as Partial<Lead>);
    }

    if (shouldAddContact && (hasVal(enriched.contact_name) || hasVal(enriched.contact_title))) {
      try {
        await api.createLeadContact(lead.id, {
          lead_id: lead.id,
          first_name: enriched.contact_name?.split(' ')[0] || lead.company_name || 'Contact',
          last_name: enriched.contact_name?.split(' ').slice(1).join(' ') || '',
          designation: enriched.contact_title || '',
          email: enriched.email || '',
          phone: enriched.phone || '',
          linkedin_url: enriched.linkedin || '',
          contact_type: 'management',
          is_primary: false,
          status: 'active',
        });
        fieldsUpdated.push('contact');
      } catch {
        // Non-critical
      }
    }

    return fieldsUpdated;
  };

  // Apply all results
  const applyAllResults = async (list?: LeadApplyResult[]) => {
    setIsApplyingAll(true);
    const items = list || applyResults;
    const updated = [...items];

    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status === 'pending') {
        try {
          const fieldsUpdated = await applyEnrichedData(updated[i].lead, updated[i].enriched, addContacts);
          updated[i] = { ...updated[i], status: 'applied', fieldsUpdated };
        } catch {
          updated[i] = { ...updated[i], status: 'error' };
        }
      }
    }

    setApplyResults([...updated]);
    setIsApplyingAll(false);
    onComplete();
  };

  // Apply single result
  const handleApplySingle = async (index: number) => {
    const r = applyResults[index];
    if (r.status !== 'pending') return;

    const updated = [...applyResults];
    try {
      const fieldsUpdated = await applyEnrichedData(r.lead, r.enriched, addContacts);
      updated[index] = { ...updated[index], status: 'applied', fieldsUpdated };
    } catch {
      updated[index] = { ...updated[index], status: 'error' };
    }
    setApplyResults(updated);
  };

  const appliedCount = applyResults.filter(r => r.status === 'applied').length;
  const pendingApplyCount = applyResults.filter(r => r.status === 'pending').length;

  // Paginated view of results
  const PAGE_SIZE = 20;
  const paginatedResults = applyResults.slice((resultsPage - 1) * PAGE_SIZE, resultsPage * PAGE_SIZE);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Bulk Enrich Leads ({leads.length})
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Config Phase */}
          {phase === 'config' && (
            <div className="space-y-5">
              {/* Selected Leads Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Selected Leads ({leads.length})
                </h4>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {leads.map(lead => (
                    <span key={lead.id} className="inline-flex items-center text-xs px-2.5 py-1 bg-white border border-gray-200 rounded-full text-gray-700">
                      {lead.company_name || `${lead.first_name} ${lead.last_name || ''}`}
                    </span>
                  ))}
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

              {/* Provider & Options */}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chunk Size</label>
                  <select
                    value={chunkSize}
                    onChange={e => setChunkSize(Number(e.target.value))}
                    className="w-full h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    <option value={10}>10 (More progress updates)</option>
                    <option value={25}>25 (Default)</option>
                    <option value={50}>50 (Faster)</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end gap-3">
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
              </div>

              {/* Auto Apply Options */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={skipVerified}
                    onChange={e => setSkipVerified(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Skip leads with all fields already filled</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoApply}
                    onChange={e => setAutoApply(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Auto-apply enriched data to leads</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer select-none ml-6">
                  <input
                    type="checkbox"
                    checked={addContacts}
                    onChange={e => setAddContacts(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Also add discovered contacts to leads</span>
                </label>
                {autoApply && (
                  <p className="text-xs text-blue-600 ml-6">
                    Enriched data will be automatically applied to each lead after the job completes.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Enriching Phase - Progress */}
          {phase === 'enriching' && (
            <div className="space-y-6 py-4">
              <div className="text-center">
                <Loader2 className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {jobProgress?.status === 'pending' ? 'Preparing enrichment...' :
                   jobProgress?.status === 'processing' ? 'Enriching leads...' :
                   'Starting job...'}
                </h3>
                <p className="text-sm text-gray-500">
                  {jobId ? `Job ID: ${jobId}` : 'Submitting bulk enrichment job...'}
                </p>
              </div>

              {jobProgress && (
                <>
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">{jobProgress.progress_percent}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${jobProgress.progress_percent}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      Chunk {jobProgress.current_chunk} of {jobProgress.total_chunks}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-gray-900">{jobProgress.processed}</div>
                      <div className="text-xs text-gray-500">Processed</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-700">{jobProgress.enriched}</div>
                      <div className="text-xs text-green-600">Enriched</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-red-700">{jobProgress.failed}</div>
                      <div className="text-xs text-red-600">Failed</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-yellow-700">{jobProgress.skipped}</div>
                      <div className="text-xs text-yellow-600">Skipped</div>
                    </div>
                  </div>

                  {/* Errors */}
                  {jobProgress.errors && jobProgress.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-red-700 mb-1">Errors</h4>
                      {jobProgress.errors.map((err, i) => (
                        <p key={i} className="text-xs text-red-600">{err}</p>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Results Phase */}
          {phase === 'results' && applyResults.length > 0 && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="flex flex-wrap items-center gap-3">
                {jobProgress && (
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge className="bg-green-100 text-green-700">
                      {jobProgress.enriched} enriched
                    </Badge>
                    {jobProgress.failed > 0 && (
                      <Badge className="bg-red-100 text-red-700">
                        {jobProgress.failed} failed
                      </Badge>
                    )}
                    {jobProgress.skipped > 0 && (
                      <Badge className="bg-yellow-100 text-yellow-700">
                        {jobProgress.skipped} skipped
                      </Badge>
                    )}
                    {appliedCount > 0 && (
                      <Badge className="bg-blue-100 text-blue-700">
                        {appliedCount} applied to CRM
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Results Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-2 text-left font-medium text-gray-600">Company</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">Enriched Fields</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">Providers</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">Status</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedResults.map((r, relIdx) => {
                      const absIdx = (resultsPage - 1) * PAGE_SIZE + relIdx;
                      return (
                        <React.Fragment key={absIdx}>
                          <tr className={`border-b border-gray-100 ${r.status === 'applied' ? 'bg-green-50' : ''}`}>
                            <td className="px-4 py-2.5 font-medium text-gray-900">
                              <button
                                onClick={() => toggleExpanded(absIdx)}
                                className="flex items-center gap-1 hover:text-primary-600"
                              >
                                {expandedRows.has(absIdx) ? (
                                  <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                )}
                                {r.enriched.company_name || r.lead.company_name || `${r.lead.first_name} ${r.lead.last_name || ''}`}
                              </button>
                            </td>
                            <td className="px-4 py-2.5">
                              {r.enriched.enrichment_metadata ? (
                                <div className="flex flex-wrap gap-1">
                                  {r.enriched.enrichment_metadata.fields_enriched.map(f => (
                                    <span key={f} className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                                      {f}
                                    </span>
                                  ))}
                                  {r.enriched.enrichment_metadata.fields_still_missing.map(f => (
                                    <span key={f} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                                      {f}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-xs text-gray-500">
                              {r.enriched.enrichment_metadata?.providers_used.join(', ') || '-'}
                            </td>
                            <td className="px-4 py-2.5">
                              {r.status === 'pending' && (
                                <span className="text-gray-500">Ready</span>
                              )}
                              {r.status === 'applied' && (
                                <span className="flex items-center gap-1 text-blue-600">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Applied
                                </span>
                              )}
                              {r.status === 'error' && (
                                <span className="flex items-center gap-1 text-red-600">
                                  <XCircle className="w-3.5 h-3.5" />
                                  Error
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              {r.status === 'pending' && (
                                <Button size="sm" variant="ghost" onClick={() => handleApplySingle(absIdx)}>
                                  Apply
                                </Button>
                              )}
                              {r.status === 'applied' && r.fieldsUpdated && (
                                <span className="text-xs text-blue-600">
                                  {r.fieldsUpdated.join(', ')}
                                </span>
                              )}
                            </td>
                          </tr>

                          {/* Expanded Detail Row */}
                          {expandedRows.has(absIdx) && (
                            <tr className="bg-gray-50">
                              <td colSpan={5} className="px-4 py-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                  <div className="space-y-0.5">
                                    <span className="font-medium text-gray-600">Email</span>
                                    <div><span className="text-gray-400">Current:</span> {r.lead.email || '—'}</div>
                                    <div>
                                      <span className="text-primary-600">Enriched:</span>{' '}
                                      <span className="font-medium">{hasVal(r.enriched.email) ? r.enriched.email : '—'}</span>
                                      {r.enriched.email_source && <span className="ml-1 text-blue-500">via {r.enriched.email_source}</span>}
                                    </div>
                                    {r.enriched.format_validation?.email && (
                                      <span className={`inline-flex items-center gap-1 ${r.enriched.format_validation.email.valid ? 'text-green-600' : 'text-red-600'}`}>
                                        {r.enriched.format_validation.email.valid ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                        {r.enriched.format_validation.email.reason}
                                      </span>
                                    )}
                                  </div>

                                  <div className="space-y-0.5">
                                    <span className="font-medium text-gray-600">Phone</span>
                                    <div><span className="text-gray-400">Current:</span> {r.lead.phone || r.lead.phone_no || '—'}</div>
                                    <div>
                                      <span className="text-primary-600">Enriched:</span>{' '}
                                      <span className="font-medium">
                                        {r.enriched.format_validation?.phone?.national_format || (hasVal(r.enriched.phone) ? r.enriched.phone : '—')}
                                      </span>
                                      {r.enriched.phone_source && <span className="ml-1 text-blue-500">via {r.enriched.phone_source}</span>}
                                    </div>
                                  </div>

                                  <div className="space-y-0.5">
                                    <span className="font-medium text-gray-600">Address</span>
                                    <div><span className="text-gray-400">Current:</span> {r.lead.address_line1 || '—'}</div>
                                    <div>
                                      <span className="text-primary-600">Enriched:</span>{' '}
                                      <span className="font-medium">
                                        {r.enriched.address_verification?.standardized || (hasVal(r.enriched.location) ? r.enriched.location : '—')}
                                      </span>
                                    </div>
                                  </div>

                                  {(hasVal(r.enriched.contact_name) || hasVal(r.enriched.contact_title)) && (
                                    <div className="space-y-0.5">
                                      <span className="font-medium text-gray-600">Contact Person</span>
                                      {hasVal(r.enriched.contact_name) && (
                                        <div><span className="text-gray-400">Name:</span> <span className="font-medium">{r.enriched.contact_name}</span></div>
                                      )}
                                      {hasVal(r.enriched.contact_title) && (
                                        <div><span className="text-gray-400">Title:</span> {r.enriched.contact_title}</div>
                                      )}
                                      {hasVal(r.enriched.linkedin) && (
                                        <div>
                                          <span className="text-gray-400">LinkedIn:</span>{' '}
                                          <a href={r.enriched.linkedin!} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                                            {r.enriched.linkedin}
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {r.enriched.enrichment_metadata && (
                                    <div className="md:col-span-2 pt-2 border-t border-gray-200 flex flex-wrap gap-3 text-gray-500">
                                      <span>Duration: {(r.enriched.enrichment_metadata.enrichment_duration_ms / 1000).toFixed(1)}s</span>
                                      <span>API Calls: {r.enriched.enrichment_metadata.total_api_calls}</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>

                {/* Results Pagination */}
                {totalResultPages > 1 && (
                  <div className="px-4 py-2 border-t border-gray-200 flex items-center justify-between bg-gray-50 text-xs">
                    <span className="text-gray-500">
                      Page {resultsPage} of {totalResultPages} ({applyResults.length} results)
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setResultsPage(p => Math.max(1, p - 1))}
                        disabled={resultsPage === 1}
                        className="px-2 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-100"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => setResultsPage(p => Math.min(totalResultPages, p + 1))}
                        disabled={resultsPage === totalResultPages}
                        className="px-2 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-100"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No results */}
          {phase === 'results' && applyResults.length === 0 && !error && (
            <div className="text-center py-12 text-gray-500">
              <p>No enrichment results returned.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          {phase === 'config' && (
            <>
              <span className="text-sm text-gray-500">
                {leads.length} lead{leads.length !== 1 ? 's' : ''} selected
                {leads.length > 50 && (
                  <span className="ml-1 text-primary-600">(will use async bulk API)</span>
                )}
              </span>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button
                  onClick={handleEnrich}
                  disabled={selectedFields.size === 0}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Enrichment
                </Button>
              </div>
            </>
          )}
          {phase === 'enriching' && (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                Processing in background... You can close this modal.
              </div>
              <Button variant="secondary" onClick={onClose}>Close</Button>
            </>
          )}
          {phase === 'results' && (
            <>
              <div className="text-sm text-gray-500">
                {jobProgress?.enriched || enrichedLeads.length} enriched, {appliedCount} applied
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => { onComplete(); onClose(); }}>
                  Close
                </Button>
                {pendingApplyCount > 0 && (
                  <Button onClick={() => applyAllResults()} isLoading={isApplyingAll} disabled={isApplyingAll}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Apply All ({pendingApplyCount})
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
