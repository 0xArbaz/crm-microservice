'use client';

import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Mail,
  Search,
  ChevronRight,
  FileText,
  FolderOpen,
  Eye,
} from 'lucide-react';
import {
  templateGroups,
  allEmailTemplates,
  defaultPlaceholderData,
  generateEmailHtml,
} from '@/lib/emailTemplates';

export default function EmailTemplatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(Object.keys(templateGroups))
  );
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const filteredGroups = useMemo(() => {
    return Object.entries(templateGroups).map(([key, group]) => ({
      key,
      label: group.label,
      templates: group.templates.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    })).filter(group =>
      group.templates.length > 0 ||
      group.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const previewHtml = useMemo(() => {
    if (!previewTemplate) return '';
    try {
      return generateEmailHtml(previewTemplate, defaultPlaceholderData);
    } catch {
      return '<p>Error generating preview</p>';
    }
  }, [previewTemplate]);

  const selectedTemplate = previewTemplate
    ? allEmailTemplates.find(t => t.id === previewTemplate)
    : null;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-gray-500">
            View and preview email templates for different stages of customer interaction.
            Templates are defined in frontend components.
          </p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search templates by name, ID, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Template List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Available Templates ({allEmailTemplates.length})
            </h2>

            {filteredGroups.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No Templates Found</h3>
                  <p className="text-gray-500 mt-1">No templates match your search.</p>
                </CardContent>
              </Card>
            ) : (
              filteredGroups.map((group) => (
                <Card key={group.key}>
                  <CardHeader
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleGroup(group.key)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FolderOpen className="w-5 h-5 text-primary-600" />
                        <div>
                          <h3 className="font-semibold">{group.label}</h3>
                          <p className="text-sm text-gray-500">
                            {group.templates.length} template(s)
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedGroups.has(group.key) ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </CardHeader>

                  {expandedGroups.has(group.key) && group.templates.length > 0 && (
                    <CardContent>
                      <div className="space-y-2">
                        {group.templates.map((template) => (
                          <div
                            key={template.id}
                            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                              previewTemplate === template.id
                                ? 'bg-primary-50 border-primary-500'
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => setPreviewTemplate(template.id)}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <div className="min-w-0">
                                <h4 className="font-medium text-gray-900 text-sm truncate">
                                  {template.name}
                                </h4>
                                <p className="text-xs text-gray-500 truncate">
                                  ID: {template.id}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewTemplate(template.id);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>

          {/* Preview Panel */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Preview</h2>

            <Card className="sticky top-4">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary-600" />
                  <h3 className="font-semibold">
                    {selectedTemplate ? selectedTemplate.name : 'Select a template'}
                  </h3>
                </div>
                {selectedTemplate && (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="text-gray-500">ID:</span>{' '}
                      <code className="bg-gray-100 px-1 rounded">{selectedTemplate.id}</code>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Tab:</span>{' '}
                      <span className="capitalize">{selectedTemplate.tab}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Subject:</span>{' '}
                      {selectedTemplate.subject}
                    </p>
                  </div>
                )}
              </CardHeader>

              <CardContent>
                {previewTemplate ? (
                  <div
                    className="border rounded-lg bg-white p-4 max-h-[600px] overflow-auto"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Click on a template to preview it</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Placeholders Info */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Available Placeholders</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(defaultPlaceholderData).slice(0, 12).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-1">
                      <code className="bg-gray-100 px-1 rounded text-xs">{`{{${key}}}`}</code>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Placeholders are automatically replaced with actual values when sending emails.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
