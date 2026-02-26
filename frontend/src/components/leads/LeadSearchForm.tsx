'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { AIEngine, EnrichmentSource, LeadSearchSource } from '@/types';

const AI_ENGINE_OPTIONS = [
  { value: 'Claude', label: 'Claude' },
  { value: 'ChatGPT', label: 'ChatGPT' },
  { value: 'Gemini', label: 'Gemini' },
];

const ENRICHMENT_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'Apollo', label: 'Apollo' },
  { value: 'Lusha', label: 'Lusha' },
  { value: 'Clearbit', label: 'Clearbit' },
  { value: 'ZoomInfo', label: 'ZoomInfo' },
];

const SOURCE_CHECKBOXES: { value: LeadSearchSource; label: string }[] = [
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'Yelp', label: 'Yelp' },
  { value: 'YellowPages', label: 'YellowPages' },
  { value: 'Crunchbase', label: 'Crunchbase' },
];

export interface LeadSearchFormState {
  industry: string;
  location: string;
  ai_engine: AIEngine;
  job_title: string;
  keywords: string;
  sources: LeadSearchSource[];
  custom_url: string;
  enrichment_source: string;
  min_score: number;
  exclude_empty_contacts: boolean;
}

export const DEFAULT_FORM_STATE: LeadSearchFormState = {
  industry: '',
  location: '',
  ai_engine: 'Claude',
  job_title: '',
  keywords: '',
  sources: [],
  custom_url: '',
  enrichment_source: '',
  min_score: 7,
  exclude_empty_contacts: false,
};

interface LeadSearchFormProps {
  formState: LeadSearchFormState;
  onChange: (state: LeadSearchFormState) => void;
  onSubmit: () => void;
  onReset: () => void;
  isLoading: boolean;
  errors: Record<string, string>;
}

export function LeadSearchForm({
  formState,
  onChange,
  onSubmit,
  onReset,
  isLoading,
  errors,
}: LeadSearchFormProps) {
  const updateField = <K extends keyof LeadSearchFormState>(
    field: K,
    value: LeadSearchFormState[K]
  ) => {
    onChange({ ...formState, [field]: value });
  };

  const toggleSource = (source: LeadSearchSource) => {
    const current = formState.sources;
    const updated = current.includes(source)
      ? current.filter((s) => s !== source)
      : [...current, source];
    updateField('sources', updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Required Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Industry *"
              placeholder="e.g., Dentists"
              value={formState.industry}
              onChange={(e) => updateField('industry', e.target.value)}
              error={errors.industry}
            />
            <Input
              label="Location *"
              placeholder="e.g., NYC"
              value={formState.location}
              onChange={(e) => updateField('location', e.target.value)}
              error={errors.location}
            />
            <Select
              label="AI Engine *"
              options={AI_ENGINE_OPTIONS}
              value={formState.ai_engine}
              onChange={(e) => updateField('ai_engine', e.target.value as AIEngine)}
              error={errors.ai_engine}
            />
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Job Title"
              placeholder="e.g., CEO"
              value={formState.job_title}
              onChange={(e) => updateField('job_title', e.target.value)}
            />
            <Input
              label="Keywords"
              placeholder="additional keywords"
              value={formState.keywords}
              onChange={(e) => updateField('keywords', e.target.value)}
            />
            <Select
              label="Enrichment Source"
              options={ENRICHMENT_OPTIONS}
              value={formState.enrichment_source}
              onChange={(e) => updateField('enrichment_source', e.target.value)}
            />
          </div>

          {/* Sources */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sources
              <span className="ml-2 text-xs font-normal text-gray-500">
                (leave empty for AI-only mode)
              </span>
            </label>
            <div className="flex flex-wrap items-center gap-4 mb-3">
              {SOURCE_CHECKBOXES.map((source) => (
                <label
                  key={source.value}
                  className="inline-flex items-center gap-2 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={formState.sources.includes(source.value)}
                    onChange={() => toggleSource(source.value)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{source.label}</span>
                </label>
              ))}
            </div>
            <Input
              placeholder="Custom URL (e.g., https://opentable.com)"
              value={formState.custom_url}
              onChange={(e) => updateField('custom_url', e.target.value)}
            />
          </div>

          {/* Score and Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Score
              </label>
              <input
                type="number"
                min={0}
                max={10}
                step={0.1}
                value={formState.min_score}
                onChange={(e) => updateField('min_score', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex items-center h-10">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formState.exclude_empty_contacts}
                  onChange={(e) => updateField('exclude_empty_contacts', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Exclude Empty Contacts</span>
              </label>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={onReset}
                disabled={isLoading}
              >
                Reset
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Search Leads
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
