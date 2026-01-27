'use client';

import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw, CheckCircle, XCircle, Eye } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/Table';
import api from '@/lib/api';
import { WebhookLog } from '@/types';
import { formatDateTime } from '@/lib/utils';

export default function IncomingWebhooksPage() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.getWebhookLogs({
        page,
        direction: 'incoming',
      });
      setLogs(response.items);
      setTotalPages(response.total_pages);
    } catch (error) {
      console.error('Failed to fetch webhook logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Incoming Webhooks</h1>
            <p className="text-gray-500">
              View webhooks received from external systems (ERP, website forms)
            </p>
          </div>
          <Button variant="secondary" onClick={fetchLogs}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Endpoint Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Webhook Endpoint</p>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                  POST /api/v1/webhooks/incoming
                </code>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Recent Webhook Logs</h2>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No incoming webhooks received yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell isHeader>Event</TableCell>
                    <TableCell isHeader>Status</TableCell>
                    <TableCell isHeader>Entity</TableCell>
                    <TableCell isHeader>Received At</TableCell>
                    <TableCell isHeader>Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge className="bg-gray-100 text-gray-800">
                          {log.event || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.is_successful ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Success
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <XCircle className="w-4 h-4 mr-1" />
                            Failed
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.entity_type && log.entity_id
                          ? `${log.entity_type} #${log.entity_id}`
                          : '-'}
                      </TableCell>
                      <TableCell>{formatDateTime(log.created_at)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t flex justify-between items-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </Card>

        {/* Log Detail Modal */}
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title="Webhook Log Details"
          size="lg"
        >
          {selectedLog && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Event</p>
                <p>{selectedLog.event || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p>{selectedLog.is_successful ? 'Success' : 'Failed'}</p>
              </div>
              {selectedLog.error_message && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Error</p>
                  <p className="text-red-600">{selectedLog.error_message}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Received At</p>
                <p>{formatDateTime(selectedLog.created_at)}</p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
}
