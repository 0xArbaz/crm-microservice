'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Edit2, Trash2 } from 'lucide-react';
import api from '@/lib/api';

interface LeadActivity {
  id: number;
  lead_id: number;
  activity_type: string;
  subject: string;
  description?: string;
  activity_date?: string;
  due_date?: string;
  is_completed: boolean;
  completed_at?: string;
  contact_id?: number;
  created_at?: string;
  created_by?: number;
  company_name?: string;
  lead_status?: string;
  priority?: string;
  status?: string;
  assigned_to?: string;
  contact_name?: string;
}

// Activity type options
const activityTypeOptions = [
  { value: 'all', label: 'All' },
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'task', label: 'Task' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'note', label: 'Note' },
];

// Status options
const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
];

// Priority options
const priorityOptions = [
  { value: 'all', label: 'All' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

// Sales representatives (sample)
const salesRepOptions = [
  { value: '', label: 'Select Sales Rep' },
  { value: '1', label: 'Junaid Ali' },
  { value: '2', label: 'Admin User' },
  { value: '3', label: 'Sales Team' },
];

export default function LeadActivitiesPage() {
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'open' | 'closed' | 'all'>('all');
  const [selectedSalesRep, setSelectedSalesRep] = useState('');

  // Filter states
  const [filters, setFilters] = useState({
    activity_type: 'all',
    lead: '',
    contact: '',
    subject: '',
    due_date: '',
    priority: 'all',
    status: 'all',
    start_date: '',
    assigned_to: 'all',
  });

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 500 };
      if (activeTab !== 'all') {
        params.status = activeTab;
      }
      if (selectedSalesRep) {
        params.assigned_to = parseInt(selectedSalesRep);
      }
      const response = await api.getAllLeadActivities(params);
      console.log('Activities response:', response);
      setActivities(response || []);
    } catch (err: any) {
      console.error('Failed to fetch activities:', err);
      console.error('Error details:', err.response?.data || err.message);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [activeTab, selectedSalesRep]);

  const handleSearch = () => {
    fetchActivities();
  };

  const handleDeleteActivity = async (activity: LeadActivity) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    try {
      await api.deleteLeadActivity(activity.lead_id, activity.id);
      fetchActivities();
    } catch (err) {
      console.error('Failed to delete activity:', err);
      alert('Failed to delete activity');
    }
  };

  // Filter activities based on tab and filters
  const filteredActivities = activities.filter(activity => {
    // Tab filter (open/closed/all)
    if (activeTab === 'open' && activity.is_completed === true) return false;
    if (activeTab === 'closed' && activity.is_completed !== true) return false;

    // Column filters
    if (filters.activity_type !== 'all' && activity.activity_type !== filters.activity_type) return false;
    if (filters.lead && !activity.company_name?.toLowerCase().includes(filters.lead.toLowerCase())) return false;
    if (filters.contact && !activity.contact_name?.toLowerCase().includes(filters.contact.toLowerCase())) return false;
    if (filters.subject && !activity.subject?.toLowerCase().includes(filters.subject.toLowerCase())) return false;
    if (filters.priority !== 'all' && activity.priority !== filters.priority) return false;
    return true;
  });

  // Styles
  const thClass = "px-2 py-2 text-left text-xs font-medium text-white bg-blue-600 border-r border-blue-500";
  const tdClass = "px-2 py-1.5 text-xs border-b border-r border-gray-200";
  const inputClass = "w-full h-7 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500";
  const selectClass = "w-full h-7 px-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white";

  const tabClass = (tab: string) =>
    `px-4 py-1.5 text-xs font-medium rounded-t ${
      activeTab === tab
        ? 'bg-green-500 text-white'
        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
    }`;

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <h1 className="text-lg font-bold text-blue-600">TRACK LEAD ACTIVITY</h1>

        {/* Sales Representative Filter */}
        <div className="flex items-center justify-center gap-4">
          <label className="text-sm font-medium text-gray-700">Sales Representative</label>
          <select
            value={selectedSalesRep}
            onChange={(e) => setSelectedSalesRep(e.target.value)}
            className="w-64 h-8 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            {salesRepOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('open')}
            className={tabClass('open')}
          >
            Open Activities
          </button>
          <button
            onClick={() => setActiveTab('closed')}
            className={tabClass('closed')}
          >
            Close Activities
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={tabClass('all')}
          >
            All Activities
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                {/* Header Row */}
                <tr>
                  <th className={thClass} style={{ width: '100px' }}>Activity Type</th>
                  <th className={thClass} style={{ width: '150px' }}>Lead</th>
                  <th className={thClass} style={{ width: '120px' }}>Contact</th>
                  <th className={thClass} style={{ width: '150px' }}>Subject</th>
                  <th className={thClass} style={{ width: '100px' }}>Due Date</th>
                  <th className={thClass} style={{ width: '90px' }}>Priority</th>
                  <th className={thClass} style={{ width: '90px' }}>Status</th>
                  <th className={thClass} style={{ width: '100px' }}>Start Date</th>
                  <th className={thClass} style={{ width: '120px' }}>Assigned To</th>
                  <th className={thClass} style={{ width: '80px' }}>Action</th>
                </tr>

                {/* Filter Row */}
                <tr className="bg-gray-50">
                  <td className={tdClass}>
                    <select
                      value={filters.activity_type}
                      onChange={(e) => setFilters({ ...filters, activity_type: e.target.value })}
                      className={selectClass}
                    >
                      {activityTypeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className={tdClass}>
                    <input
                      type="text"
                      placeholder=""
                      value={filters.lead}
                      onChange={(e) => setFilters({ ...filters, lead: e.target.value })}
                      className={inputClass}
                    />
                  </td>
                  <td className={tdClass}>
                    <input
                      type="text"
                      placeholder=""
                      value={filters.contact}
                      onChange={(e) => setFilters({ ...filters, contact: e.target.value })}
                      className={inputClass}
                    />
                  </td>
                  <td className={tdClass}>
                    <input
                      type="text"
                      placeholder=""
                      value={filters.subject}
                      onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                      className={inputClass}
                    />
                  </td>
                  <td className={tdClass}>
                    <input
                      type="text"
                      placeholder=""
                      value={filters.due_date}
                      onChange={(e) => setFilters({ ...filters, due_date: e.target.value })}
                      className={inputClass}
                    />
                  </td>
                  <td className={tdClass}>
                    <select
                      value={filters.priority}
                      onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                      className={selectClass}
                    >
                      {priorityOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className={tdClass}>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className={selectClass}
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className={tdClass}>
                    <input
                      type="text"
                      placeholder=""
                      value={filters.start_date}
                      onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                      className={inputClass}
                    />
                  </td>
                  <td className={tdClass}>
                    <select
                      value={filters.assigned_to}
                      onChange={(e) => setFilters({ ...filters, assigned_to: e.target.value })}
                      className={selectClass}
                    >
                      <option value="all">All</option>
                      {salesRepOptions.filter(o => o.value).map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className={tdClass}>
                    <button
                      onClick={handleSearch}
                      className="px-3 py-1 text-xs font-medium text-white bg-green-500 rounded hover:bg-green-600"
                    >
                      Search
                    </button>
                  </td>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                      No activities found
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className={`${tdClass} text-blue-600 capitalize`}>{activity.activity_type}</td>
                      <td className={`${tdClass} text-orange-600`}>{activity.company_name}</td>
                      <td className={`${tdClass} text-orange-600`}>{activity.contact_name || '-'}</td>
                      <td className={tdClass}>{activity.subject}</td>
                      <td className={tdClass}>{activity.due_date || '-'}</td>
                      <td className={`${tdClass} text-orange-600`}>{activity.priority || '-'}</td>
                      <td className={`${tdClass} text-orange-600`}>{activity.status || (activity.is_completed ? 'closed' : 'open')}</td>
                      <td className={tdClass}>{activity.activity_date || '-'}</td>
                      <td className={`${tdClass} text-orange-600`}>{activity.assigned_to || '-'}</td>
                      <td className={tdClass}>
                        <div className="flex items-center gap-1">
                          <button
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteActivity(activity)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded border border-red-200"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
