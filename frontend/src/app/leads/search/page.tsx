'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { LeadSearchForm, LeadSearchFormState, DEFAULT_FORM_STATE } from '@/components/leads/LeadSearchForm';
import { LeadTable } from '@/components/leads/LeadTable';
import { Button } from '@/components/ui/Button';
import { GeneratedLead, LeadSearchMetadata, LeadSearchParams, EnrichmentSource } from '@/types';
import api from '@/lib/api';

// Helper: treat null/undefined/empty as no value
function val(s: string | null | undefined): string | undefined {
  return s && s.trim() ? s.trim() : undefined;
}

export default function LeadSearchPage() {
  const router = useRouter();
  const [formState, setFormState] = useState<LeadSearchFormState>(DEFAULT_FORM_STATE);
  const [leads, setLeads] = useState<GeneratedLead[]>([]);
  const [metadata, setMetadata] = useState<LeadSearchMetadata | null>(null);
  const [discoveryMode, setDiscoveryMode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Selection state
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [addResult, setAddResult] = useState<{ success: number; failed: number } | null>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formState.industry.trim()) newErrors.industry = 'Industry is required';
    if (!formState.location.trim()) newErrors.location = 'Location is required';
    if (!formState.ai_engine) newErrors.ai_engine = 'AI Engine is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    setApiError(null);
    setHasSearched(true);
    setSelectedIndices(new Set());
    setAddResult(null);

    const allSources: string[] = [...formState.sources];
    const trimmedUrl = formState.custom_url.trim();
    if (trimmedUrl) {
      allSources.push(trimmedUrl);
    }

    const params: LeadSearchParams = {
      industry: formState.industry.trim(),
      location: formState.location.trim(),
      ai_engine: formState.ai_engine,
      min_score: formState.min_score,
      exclude_empty_contacts: formState.exclude_empty_contacts,
    };

    if (formState.job_title.trim()) params.job_title = formState.job_title.trim();
    if (formState.keywords.trim()) params.keywords = formState.keywords.trim();
    if (allSources.length > 0) params.sources = allSources;
    if (formState.enrichment_source) {
      params.enrichment_source = formState.enrichment_source as EnrichmentSource;
    }

    try {
      const response = await api.searchGeneratedLeads(params);
      setLeads(response.leads || []);
      setMetadata(response.search_metadata || null);
      setDiscoveryMode(response.discovery_mode || null);
    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number; data?: { detail?: string } }; message?: string };
      const status = axiosError.response?.status;
      const detail = axiosError.response?.data?.detail;

      if (status === 400) {
        setApiError(detail || 'Invalid search parameters. Please check your inputs.');
      } else if (status === 404) {
        setApiError('Search endpoint not found. Please check your API configuration.');
      } else if (status === 500) {
        setApiError('Server error occurred. Please try again later.');
      } else {
        setApiError(detail || axiosError.message || 'An unexpected error occurred. Please try again.');
      }
      setLeads([]);
      setMetadata(null);
      setDiscoveryMode(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormState(DEFAULT_FORM_STATE);
    setErrors({});
    setApiError(null);
    setLeads([]);
    setMetadata(null);
    setDiscoveryMode(null);
    setHasSearched(false);
    setSelectedIndices(new Set());
    setAddResult(null);
  };

  // Selection handlers
  const handleToggleSelect = (index: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedIndices.size === leads.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(leads.map((_, i) => i)));
    }
  };

  // Add selected leads to CRM
  const handleAddAsLeads = async () => {
    if (selectedIndices.size === 0) return;

    setIsAdding(true);
    setAddResult(null);

    let success = 0;
    let failed = 0;

    const selectedLeads = leads.filter((_, i) => selectedIndices.has(i));

    for (const lead of selectedLeads) {
      try {
        await api.createLead({
          first_name: lead.company_name,
          company_name: lead.company_name,
          email: val(lead.email),
          phone: val(lead.phone),
          website: val(lead.website),
          source: 'other',
          source_details: `AI Discovery (${lead.ai_engine} - ${lead.source})`,
          priority: 'medium',
          industry: val(lead.industry) || val(metadata?.industry),
          city: val(lead.location) || val(metadata?.location),
          country: 'India',
          lead_score: lead.score,
          notes: [
            lead.snippet,
            `Score: ${lead.score}/10 | Confidence: ${lead.confidence_score}%`,
            `Discovery: ${lead.discovery_mode} via ${lead.ai_engine}`,
            lead.reason,
          ].filter(Boolean).join('\n'),
        });
        success++;
      } catch {
        failed++;
      }
    }

    setAddResult({ success, failed });
    setIsAdding(false);

    // Remove successfully added leads from selection
    if (success > 0) {
      setSelectedIndices(new Set());
    }
  };

  const selectedCount = selectedIndices.size;

  return (
    <MainLayout>
      <div className="p-6 space-y-6 max-w-full pb-24">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Generation Search</h1>
          <p className="mt-1 text-sm text-gray-500">
            Discover new leads using AI-powered search across multiple platforms
          </p>
        </div>

        {/* Search Form (sticky on scroll) */}
        <div className="sticky top-0 z-10">
          <LeadSearchForm
            formState={formState}
            onChange={setFormState}
            onSubmit={handleSubmit}
            onReset={handleReset}
            isLoading={isLoading}
            errors={errors}
          />
        </div>

        {/* Error Display */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{apiError}</p>
          </div>
        )}

        {/* Success/Failure result banner */}
        {addResult && (
          <div className={`border rounded-lg p-4 ${
            addResult.failed === 0
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <p className={`text-sm ${addResult.failed === 0 ? 'text-green-700' : 'text-yellow-700'}`}>
              {addResult.success > 0 && (
                <span>
                  Successfully added {addResult.success} lead{addResult.success !== 1 ? 's' : ''}.
                </span>
              )}
              {addResult.failed > 0 && (
                <span>
                  {' '}{addResult.failed} lead{addResult.failed !== 1 ? 's' : ''} failed to add.
                </span>
              )}
              {addResult.success > 0 && (
                <button
                  onClick={() => router.push('/leads')}
                  className="ml-2 text-primary-600 hover:text-primary-700 underline font-medium"
                >
                  View in Manage Leads
                </button>
              )}
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <svg
              className="animate-spin h-8 w-8 text-primary-600 mb-3"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <p className="text-sm text-gray-500">Searching for leads...</p>
          </div>
        )}

        {/* Results */}
        {hasSearched && !isLoading && !apiError && (
          <LeadTable
            leads={leads}
            metadata={metadata}
            discoveryMode={discoveryMode}
            selectedIndices={selectedIndices}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
          />
        )}
      </div>

      {/* Floating Action Bar */}
      {selectedCount > 0 && (
        <div className="fixed bottom-0 left-64 right-0 z-20 bg-white border-t border-gray-200 shadow-lg">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                {selectedCount} lead{selectedCount !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setSelectedIndices(new Set())}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear selection
              </button>
            </div>
            <Button
              onClick={handleAddAsLeads}
              isLoading={isAdding}
              disabled={isAdding}
            >
              Add {selectedCount} Lead{selectedCount !== 1 ? 's' : ''} to CRM
            </Button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
