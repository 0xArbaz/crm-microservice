'use client';

import React, { useState, useEffect } from 'react';
import { Send, Users, Eye } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import api from '@/lib/api';

const recipientTypeOptions = [
  { value: 'lead', label: 'Leads' },
  { value: 'customer', label: 'Customers' },
];

const leadStatusOptions = [
  { value: '', label: 'All Leads' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal_sent', label: 'Proposal Sent' },
  { value: 'negotiation', label: 'Negotiation' },
];

export default function BulkEmailPage() {
  const [recipientType, setRecipientType] = useState('lead');
  const [status, setStatus] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [preview, setPreview] = useState<{ total_count: number; sample: any[] } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{
    total_recipients: number;
    queued: number;
    message: string;
  } | null>(null);

  const fetchPreview = async () => {
    setIsLoading(true);
    try {
      const data = await api.previewEmailRecipients({
        recipient_type: recipientType,
        status: status || undefined,
      });
      setPreview(data);
    } catch (error) {
      console.error('Failed to fetch preview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, [recipientType, status]);

  const handleSend = async () => {
    if (!subject || !body) {
      alert('Please fill in subject and body');
      return;
    }

    setIsSending(true);
    setResult(null);

    try {
      const response = await api.sendBulkEmail({
        subject,
        body,
        recipient_type: recipientType,
      });
      setResult(response);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to send emails');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Email</h1>
          <p className="text-gray-500">Send bulk emails to leads or customers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Compose Email</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Subject"
                  placeholder="Enter email subject..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Body
                  </label>
                  <textarea
                    rows={10}
                    placeholder="Write your email content here...

You can use placeholders:
{{name}} - Recipient name
{{company}} - Company name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSend} isLoading={isSending}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Emails
                </Button>
              </CardFooter>
            </Card>

            {/* Result */}
            {result && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center text-green-600">
                    <Send className="w-5 h-5 mr-2" />
                    <div>
                      <p className="font-medium">{result.message}</p>
                      <p className="text-sm">
                        {result.queued} of {result.total_recipients} emails queued
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recipients Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Recipients</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  label="Recipient Type"
                  options={recipientTypeOptions}
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value)}
                />

                {recipientType === 'lead' && (
                  <Select
                    label="Filter by Status"
                    options={leadStatusOptions}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  />
                )}

                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={fetchPreview}
                  isLoading={isLoading}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Recipients
                </Button>
              </CardContent>
            </Card>

            {/* Preview */}
            {preview && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Preview</h2>
                    <div className="flex items-center text-primary-600">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="font-medium">{preview.total_count}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {preview.sample.length === 0 ? (
                    <p className="text-gray-500 text-sm">No recipients found</p>
                  ) : (
                    <div className="space-y-2">
                      {preview.sample.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm py-2 border-b last:border-0"
                        >
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-500">{item.email}</span>
                        </div>
                      ))}
                      {preview.total_count > preview.sample.length && (
                        <p className="text-xs text-gray-400 text-center pt-2">
                          and {preview.total_count - preview.sample.length} more...
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
