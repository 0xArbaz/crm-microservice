'use client';

import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { GeneratedLead, LeadSearchMetadata } from '@/types';

interface LeadTableProps {
  leads: GeneratedLead[];
  metadata: LeadSearchMetadata | null;
  discoveryMode: string | null;
  selectedIndices: Set<number>;
  onToggleSelect: (index: number) => void;
  onToggleSelectAll: () => void;
}

// Treat null and empty string as "no value"
function hasValue(val: string | null | undefined): val is string {
  return val !== null && val !== undefined && val.trim() !== '';
}

function ScoreBadge({ score }: { score: number }) {
  let colorClass = 'bg-red-100 text-red-800';
  if (score >= 8) colorClass = 'bg-green-100 text-green-800';
  else if (score >= 6) colorClass = 'bg-yellow-100 text-yellow-800';
  else if (score >= 4) colorClass = 'bg-orange-100 text-orange-800';

  return <Badge className={colorClass}>{score.toFixed(1)}</Badge>;
}

function ConfidenceBadge({ score }: { score: number }) {
  let colorClass = 'bg-red-100 text-red-800';
  if (score >= 80) colorClass = 'bg-green-100 text-green-800';
  else if (score >= 60) colorClass = 'bg-yellow-100 text-yellow-800';
  else if (score >= 40) colorClass = 'bg-orange-100 text-orange-800';

  return <Badge className={colorClass}>{score}%</Badge>;
}

function ModeBadge({ mode }: { mode: string }) {
  const colorClass =
    mode === 'platform'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-purple-100 text-purple-800';
  return <Badge className={colorClass}>{mode === 'ai_only' ? 'AI Only' : mode}</Badge>;
}

// Mobile card view for a single lead
function LeadCard({
  lead,
  index,
  isSelected,
  onToggle,
}: {
  lead: GeneratedLead;
  index: number;
  isSelected: boolean;
  onToggle: (index: number) => void;
}) {
  return (
    <div
      className={`border rounded-lg p-4 space-y-2 cursor-pointer transition-colors ${
        isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
      }`}
      onClick={() => onToggle(index)}
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(index)}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 shrink-0"
        />
        <h3 className="font-medium text-gray-900 truncate flex-1">{lead.company_name}</h3>
        <ScoreBadge score={lead.score} />
      </div>
      {hasValue(lead.website) && (
        <a
          href={lead.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary-600 hover:underline truncate block ml-7"
          onClick={(e) => e.stopPropagation()}
        >
          {lead.website}
        </a>
      )}
      <div className="grid grid-cols-2 gap-2 text-sm ml-7">
        <div>
          <span className="text-gray-500">Email:</span>{' '}
          <span className="text-gray-900">{hasValue(lead.email) ? lead.email : '—'}</span>
        </div>
        <div>
          <span className="text-gray-500">Phone:</span>{' '}
          <span className="text-gray-900">{hasValue(lead.phone) ? lead.phone : '—'}</span>
        </div>
        <div>
          <span className="text-gray-500">Confidence:</span>{' '}
          <ConfidenceBadge score={lead.confidence_score} />
        </div>
        <div>
          <span className="text-gray-500">Source:</span>{' '}
          <span className="text-gray-900">{lead.source}</span>
        </div>
        <div>
          <span className="text-gray-500">Engine:</span>{' '}
          <span className="text-gray-900">{lead.ai_engine}</span>
        </div>
        <div>
          <span className="text-gray-500">Mode:</span>{' '}
          <ModeBadge mode={lead.discovery_mode} />
        </div>
      </div>
      {hasValue(lead.snippet) && (
        <p className="text-xs text-gray-500 line-clamp-2 ml-7">{lead.snippet}</p>
      )}
    </div>
  );
}

export function LeadTable({
  leads,
  metadata,
  discoveryMode,
  selectedIndices,
  onToggleSelect,
  onToggleSelectAll,
}: LeadTableProps) {
  if (leads.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="text-gray-400 mb-3">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No leads found</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Try broadening your search by adjusting the industry, location, or lowering the minimum score.
            Adding more sources may also help discover additional leads.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Handle both discovery_sources and sources from the API
  const metadataSources = metadata?.discovery_sources || metadata?.sources || [];
  const allSelected = leads.length > 0 && selectedIndices.size === leads.length;
  const someSelected = selectedIndices.size > 0 && selectedIndices.size < leads.length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      {metadata && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-medium text-gray-900">
            {metadata.total_found} lead{metadata.total_found !== 1 ? 's' : ''} found
          </span>
          {discoveryMode && (
            <>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">
                Mode: <ModeBadge mode={discoveryMode} />
              </span>
            </>
          )}
          {metadataSources.length > 0 && (
            <>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">
                Sources: {metadataSources.join(', ')}
              </span>
            </>
          )}
          {metadata.errors_encountered > 0 && (
            <>
              <span className="text-gray-400">|</span>
              <span className="text-amber-600">
                {metadata.errors_encountered} error{metadata.errors_encountered !== 1 ? 's' : ''} encountered
              </span>
            </>
          )}
          {selectedIndices.size > 0 && (
            <>
              <span className="text-gray-400">|</span>
              <span className="font-medium text-primary-600">
                {selectedIndices.size} selected
              </span>
            </>
          )}
        </div>
      )}

      {/* Desktop Table */}
      <Card className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader className="w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={onToggleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </TableCell>
              <TableCell isHeader>Company Name</TableCell>
              <TableCell isHeader>Website</TableCell>
              <TableCell isHeader>Email</TableCell>
              <TableCell isHeader>Phone</TableCell>
              <TableCell isHeader>Score</TableCell>
              <TableCell isHeader>Confidence</TableCell>
              <TableCell isHeader>Source</TableCell>
              <TableCell isHeader>AI Engine</TableCell>
              <TableCell isHeader>Mode</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead, idx) => (
              <TableRow
                key={`${lead.company_name}-${idx}`}
                className={selectedIndices.has(idx) ? 'bg-primary-50' : undefined}
              >
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedIndices.has(idx)}
                    onChange={() => onToggleSelect(idx)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </TableCell>
                <TableCell>
                  <span className="font-medium">{lead.company_name}</span>
                </TableCell>
                <TableCell>
                  {hasValue(lead.website) ? (
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline truncate block max-w-[200px]"
                    >
                      {lead.website.replace(/^https?:\/\//, '')}
                    </a>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {hasValue(lead.email) ? (
                    <a href={`mailto:${lead.email}`} className="text-primary-600 hover:underline">
                      {lead.email}
                    </a>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {hasValue(lead.phone) ? lead.phone : <span className="text-gray-400">—</span>}
                </TableCell>
                <TableCell><ScoreBadge score={lead.score} /></TableCell>
                <TableCell><ConfidenceBadge score={lead.confidence_score} /></TableCell>
                <TableCell>{lead.source}</TableCell>
                <TableCell>{lead.ai_engine}</TableCell>
                <TableCell><ModeBadge mode={lead.discovery_mode} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile Card Grid */}
      <div className="md:hidden space-y-3">
        {/* Mobile select all */}
        <label className="inline-flex items-center gap-2 cursor-pointer select-none px-1">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected;
            }}
            onChange={onToggleSelectAll}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-700">Select All</span>
        </label>
        {leads.map((lead, idx) => (
          <LeadCard
            key={`${lead.company_name}-${idx}`}
            lead={lead}
            index={idx}
            isSelected={selectedIndices.has(idx)}
            onToggle={onToggleSelect}
          />
        ))}
      </div>
    </div>
  );
}
