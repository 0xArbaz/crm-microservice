'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import { DashboardStats } from '@/types';
import { formatCurrency, formatDateTime, getStatusColor } from '@/lib/utils';

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  change: number;
  icon: React.ElementType;
  color: string;
}) {
  const isPositive = change >= 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
            <div className="flex items-center mt-2">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span
                className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}
              >
                {isPositive ? '+' : ''}
                {change.toFixed(1)}% vs last month
              </span>
            </div>
          </div>
          <div className={`p-4 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back! Here is your CRM overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Pre-Leads"
            value={stats?.pre_leads.total || 0}
            change={stats?.pre_leads.change_percentage || 0}
            icon={UserPlus}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Leads"
            value={stats?.leads.total || 0}
            change={stats?.leads.change_percentage || 0}
            icon={Target}
            color="bg-purple-500"
          />
          <StatCard
            title="Total Customers"
            value={stats?.customers.total || 0}
            change={stats?.customers.change_percentage || 0}
            icon={Users}
            color="bg-green-500"
          />
          <StatCard
            title="Conversion Rate"
            value={stats?.conversions.overall || 0}
            change={0}
            icon={TrendingUp}
            color="bg-orange-500"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Funnel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <h2 className="text-lg font-semibold">Sales Funnel test</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <span className="font-medium">Pre-Leads</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {stats?.funnel.pre_leads || 0}
                  </span>
                </div>
                <div className="flex justify-center">
                  <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-300"></div>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <span className="font-medium">Leads</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {stats?.funnel.leads || 0}
                  </span>
                </div>
                <div className="flex justify-center">
                  <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-300"></div>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <span className="font-medium">Customers</span>
                  <span className="text-2xl font-bold text-green-600">
                    {stats?.funnel.customers || 0}
                  </span>
                </div>
              </div>

              {/* Conversion Rates */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  Conversion Rates
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Pre-Lead to Lead</span>
                    <span className="font-medium">
                      {stats?.conversions.pre_lead_to_lead.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Lead to Customer</span>
                    <span className="font-medium">
                      {stats?.conversions.lead_to_customer.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <h2 className="text-lg font-semibold">Recent Activities</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recent_activities.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No recent activities
                  </p>
                ) : (
                  stats?.recent_activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="p-2 bg-gray-100 rounded-full">
                        <Activity className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.subject}
                        </p>
                        <p className="text-sm text-gray-500">
                          {activity.entity_type}: {activity.entity_name}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDateTime(activity.created_at)}
                          {activity.performed_by_name &&
                            ` by ${activity.performed_by_name}`}
                        </p>
                      </div>
                      <Badge className={getStatusColor(activity.activity_type)}>
                        {activity.activity_type}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales Targets & Lead Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Targets */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Sales Targets</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.sales_targets.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No active sales targets
                  </p>
                ) : (
                  stats?.sales_targets.map((target, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">
                          {target.target_name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatCurrency(Number(target.achieved_value))} /{' '}
                          {formatCurrency(Number(target.target_value))}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-primary-600 h-2.5 rounded-full"
                          style={{
                            width: `${Math.min(target.progress_percentage, 100)}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {target.progress_percentage.toFixed(1)}% achieved
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Leads by Status */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Leads by Status</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.leads_by_status.map((item) => (
                  <div
                    key={item.status}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
