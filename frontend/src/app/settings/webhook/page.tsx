'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import api from '@/lib/api';
import { Settings, ToggleLeft, ToggleRight, ExternalLink, Book, Code } from 'lucide-react';
import Link from 'next/link';

interface WebhookSetting {
  id: number;
  menu_key: string;
  menu_name: string;
  menu_path: string;
  is_enabled: boolean;
  created_at: string | null;
  updated_at: string | null;
  warning?: string;
}

export default function WebhookSettingsPage() {
  const [settings, setSettings] = useState<WebhookSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [dbWarning, setDbWarning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getWebhookSettings();
      setSettings(data || []);
      // Check if any settings have created_at - if none do, DB might not be set up
      const hasPersistedData = data?.some((s: WebhookSetting) => s.created_at !== null);
      if (!hasPersistedData && data?.length > 0) {
        setDbWarning(true);
      } else {
        setDbWarning(false);
      }
    } catch (err: any) {
      console.error('Failed to load webhook settings:', err);
      const errorMsg = err?.response?.data?.detail || err?.message || 'Failed to load settings';
      setError(errorMsg);
      setDbWarning(true);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (menuKey: string, currentValue: boolean) => {
    setUpdating(menuKey);
    try {
      const result = await api.updateWebhookSetting(menuKey, !currentValue);
      if (result.warning) {
        alert('Warning: Database migration pending. Run "alembic upgrade head" in the backend folder to persist settings.');
      }
      setSettings(prev =>
        prev.map(s =>
          s.menu_key === menuKey ? { ...s, is_enabled: !currentValue } : s
        )
      );
    } catch (error) {
      console.error('Failed to update setting:', error);
      alert('Failed to update webhook setting. Make sure the database migration has been run.');
    } finally {
      setUpdating(null);
    }
  };

  // Group settings by parent menu
  const groupedSettings = settings.reduce((acc, setting) => {
    const parts = setting.menu_name.split(' > ');
    const parent = parts.length > 1 ? parts[0] : 'Other';
    if (!acc[parent]) acc[parent] = [];
    acc[parent].push(setting);
    return acc;
  }, {} as Record<string, WebhookSetting[]>);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Webhook Settings</h1>
              <p className="text-gray-500 mt-1">
                Enable or disable webhook support for each menu/page in the system.
              </p>
            </div>
          </div>
        </div>

        {/* Database Warning */}
        {dbWarning && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 flex items-start gap-3">
            <div className="text-yellow-600 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-yellow-800">Database Migration Required</h3>
              <p className="text-sm text-yellow-700 mt-1">
                The webhook settings tables have not been created yet. Run the following command in the backend folder:
              </p>
              <pre className="mt-2 px-3 py-2 bg-yellow-100 rounded text-sm font-mono text-yellow-800">
                alembic upgrade head
              </pre>
              <p className="text-sm text-yellow-700 mt-2">
                Until then, settings will not persist after page refresh.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-4 flex items-start gap-3">
            <div className="text-red-600 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-red-800">Error Loading Settings</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={loadSettings}
                className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Settings Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
              <div>Loading settings...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Menu Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Route Path
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Webhook Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Configure
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(groupedSettings).map(([parent, items]) => (
                    <React.Fragment key={parent}>
                      {/* Parent Header */}
                      <tr className="bg-gray-100">
                        <td colSpan={4} className="px-6 py-2 text-sm font-semibold text-gray-700">
                          {parent}
                        </td>
                      </tr>
                      {/* Child Items */}
                      {items.map((setting) => {
                        const displayName = setting.menu_name.includes(' > ')
                          ? setting.menu_name.split(' > ').slice(1).join(' > ')
                          : setting.menu_name;

                        return (
                          <tr key={setting.menu_key} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900 pl-10">
                              {displayName}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                              {setting.menu_path}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => handleToggle(setting.menu_key, setting.is_enabled)}
                                disabled={updating === setting.menu_key}
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                  setting.is_enabled
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                } ${updating === setting.menu_key ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                {updating === setting.menu_key ? (
                                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                ) : setting.is_enabled ? (
                                  <ToggleRight className="w-5 h-5" />
                                ) : (
                                  <ToggleLeft className="w-5 h-5" />
                                )}
                                {setting.is_enabled ? 'Enabled' : 'Disabled'}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {setting.is_enabled && (
                                <Link
                                  href={`/settings/webhook/configure/${setting.menu_key}`}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm font-medium"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  Configure
                                </Link>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">How Webhooks Work</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>When a menu is <strong>Enabled</strong>, a small "Webhook" button will appear on that page.</li>
            <li>Clicking the button opens the webhook configuration for that specific menu.</li>
            <li>Each menu has its own independent webhook configuration.</li>
            <li>Disabling a menu removes the webhook button from that page.</li>
          </ul>
        </div>

        {/* Link to API Documentation */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Book className="w-6 h-6 text-gray-600" />
            <div>
              <h3 className="font-medium text-gray-900">Full API Documentation</h3>
              <p className="text-sm text-gray-500">View complete webhook API documentation with code examples</p>
            </div>
          </div>
          <Link
            href="/webhooks"
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
          >
            <Code className="w-4 h-4" />
            View API Docs
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
