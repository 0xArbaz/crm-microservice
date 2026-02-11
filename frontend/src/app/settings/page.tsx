'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Settings,
  Building2,
  Globe,
  Mail,
  Bell,
  Shield,
  Database,
  Save,
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: 'CRM Company',
    companyEmail: 'info@company.com',
    companyPhone: '+1 234 567 890',
    companyAddress: '123 Business Street',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    currency: 'USD',
    emailNotifications: true,
    pushNotifications: true,
    weeklyReport: true,
  });

  const handleSave = () => {
    // In real app, this would save to API
    alert('Settings saved successfully!');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
          <p className="text-gray-500">Configure your CRM system preferences and settings.</p>
        </div>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold">Company Information</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Company Name"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              />
              <Input
                label="Company Email"
                type="email"
                value={settings.companyEmail}
                onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
              />
              <Input
                label="Company Phone"
                value={settings.companyPhone}
                onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
              />
              <Input
                label="Company Address"
                value={settings.companyAddress}
                onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold">Regional Settings</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time (US)</option>
                  <option value="America/Los_Angeles">Pacific Time (US)</option>
                  <option value="Europe/London">London (UK)</option>
                  <option value="Asia/Tokyo">Tokyo (Japan)</option>
                  <option value="Asia/Kolkata">India Standard Time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold">Notification Settings</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive email updates for important events</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-500">Get browser notifications for real-time updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium">Weekly Report</p>
                  <p className="text-sm text-gray-500">Receive weekly summary report via email</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.weeklyReport}
                  onChange={(e) => setSettings({ ...settings, weeklyReport: e.target.checked })}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold">Quick Settings</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/settings/option-master"
                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Database className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="font-medium">Option Master</p>
                  <p className="text-sm text-gray-500">Manage dropdown options</p>
                </div>
              </a>
              <a
                href="/webhooks"
                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Globe className="w-8 h-8 text-green-500" />
                <div>
                  <p className="font-medium">Webhooks</p>
                  <p className="text-sm text-gray-500">Configure integrations</p>
                </div>
              </a>
              <a
                href="#"
                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Shield className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="font-medium">Security</p>
                  <p className="text-sm text-gray-500">User roles & permissions</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
