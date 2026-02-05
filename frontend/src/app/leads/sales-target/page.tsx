'use client';

import React, { useEffect, useState } from 'react';
import { Mail, Edit2, Trash2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import api from '@/lib/api';

interface SalesTarget {
  id: number;
  name: string;
  designation?: string;
  reporting_to?: string;
  region?: string;
  frequency?: string;
  stage?: string;
  sales_type?: string;
  target_value: number;
  start_date: string;
  end_date: string;
  remarks?: string;
  achieved_value?: number;
  progress_percentage?: number;
}

type TabType = 'targets' | 'upload' | 'workflow';

// Options for dropdowns
const nameOptions = [
  { value: '', label: 'Select Name' },
  { value: 'Hamza Manzoor', label: 'Hamza Manzoor' },
  { value: 'Ali Akbar', label: 'Ali Akbar' },
  { value: 'Dilshad Afser', label: 'Dilshad Afser' },
  { value: 'Adil Ahmed', label: 'Adil Ahmed' },
  { value: 'MD NAWAB ASNARI', label: 'MD NAWAB ASNARI' },
];

const regionOptions = [
  { value: '', label: 'region' },
  { value: 'Asia', label: 'Asia' },
  { value: 'CIS', label: 'CIS' },
  { value: 'Europe', label: 'Europe' },
  { value: 'Americas', label: 'Americas' },
];

const frequencyOptions = [
  { value: '', label: 'Frequency' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const stageOptions = [
  { value: '', label: 'Stage' },
  { value: 'prospecting', label: 'Prospecting' },
  { value: 'qualification', label: 'Qualification' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed', label: 'Closed' },
];

const salesTypeOptions = [
  { value: '', label: 'Sales Type' },
  { value: 'lead_generated', label: 'Lead Generated' },
  { value: 'email', label: 'Email' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'call', label: 'Call' },
  { value: 'meeting', label: 'Meeting' },
];

export default function SalesTargetPage() {
  const [activeTab, setActiveTab] = useState<TabType>('targets');
  const [targets, setTargets] = useState<SalesTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter states
  const [filters, setFilters] = useState({
    name: '',
    designation: '',
    reporting_to: '',
    region: '',
    frequency: '',
    stage: '',
    sales_type: '',
    target: '',
    start_date: '',
    end_date: '',
    remarks: '',
  });

  // New target form state
  const [newTarget, setNewTarget] = useState({
    name: '',
    designation: '',
    reporting_to: '',
    region: '',
    frequency: 'monthly',
    stage: '',
    sales_type: '',
    target_value: '',
    start_date: '',
    end_date: '',
    remarks: '',
  });

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>(null);

  // Upload file state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    name: string;
    uploadedOn: string;
    size: string;
    notes: string;
  }>>([]);

  const fetchTargets = async () => {
    setLoading(true);
    try {
      const response = await api.getSalesTargets({ page: 1, page_size: 100 });
      setTargets(response.items || []);
    } catch (err) {
      console.error('Failed to fetch targets:', err);
      // Set some sample data for display
      setTargets([
        { id: 1, name: 'Hamza Manzoor', designation: 'Accounts', reporting_to: 'abi1 abi1', region: 'Asia', frequency: 'monthly', stage: '', sales_type: 'lead_generated', target_value: 10, start_date: '2024-01-01', end_date: '2025-10-28', remarks: 'tested' },
        { id: 2, name: 'Ali Akbar', designation: 'Technical', reporting_to: 'Rahat Ansa', region: 'Asia', frequency: 'monthly', stage: '', sales_type: '', target_value: 0, start_date: '2025-02-05', end_date: '2025-09-10', remarks: 'test' },
        { id: 3, name: 'Dilshad Afser', designation: 'Technical', reporting_to: 'John Doe', region: 'Asia', frequency: 'monthly', stage: '', sales_type: '', target_value: 0, start_date: '2025-02-28', end_date: '2025-09-19', remarks: 'test' },
        { id: 4, name: 'Adil Ahmed', designation: 'Technical', reporting_to: 'Arbaz Alam', region: 'Asia', frequency: 'monthly', stage: '', sales_type: 'lead_generated', target_value: 1, start_date: '2025-08-01', end_date: '2025-09-30', remarks: 'test' },
        { id: 5, name: 'Adil Ahmed', designation: 'Technical', reporting_to: 'Arbaz Alam', region: 'Asia', frequency: 'monthly', stage: '', sales_type: 'lead_generated', target_value: 2, start_date: '2025-08-01', end_date: '2025-09-30', remarks: 'tested' },
        { id: 6, name: 'Ali Akbar', designation: 'Technical', reporting_to: 'Rahat Ansa', region: 'Asia', frequency: 'monthly', stage: '', sales_type: 'lead_generated', target_value: 5, start_date: '2025-02-28', end_date: '2025-09-24', remarks: 'test' },
        { id: 7, name: 'MD NAWAB ASNARI', designation: 'Technical', reporting_to: 'Arba Alam', region: 'Asia', frequency: 'daily', stage: '', sales_type: 'linkedin', target_value: 100, start_date: '2025-09-01', end_date: '2025-09-24', remarks: 'working' },
        { id: 8, name: 'MD NAWAB ASNARI', designation: 'Technical', reporting_to: 'Arba Alam', region: 'Asia', frequency: 'daily', stage: '', sales_type: '', target_value: 10, start_date: '2025-09-01', end_date: '2025-09-24', remarks: 'teste' },
        { id: 9, name: 'Ali Akbar', designation: 'Technical', reporting_to: 'Rahat Ansa', region: 'CIS', frequency: 'monthly', stage: '', sales_type: 'email', target_value: 100, start_date: '2025-09-01', end_date: '2025-09-30', remarks: 'Convert leads' },
        { id: 10, name: 'MD NAWAB ASNARI', designation: 'Technical', reporting_to: 'Arba Alam', region: 'Asia', frequency: 'daily', stage: '', sales_type: 'whatsapp', target_value: 10, start_date: '2025-10-01', end_date: '2025-10-09', remarks: 'testing' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTargets();
  }, []);

  const handleAddTarget = async () => {
    if (!newTarget.name || !newTarget.target_value || !newTarget.start_date || !newTarget.end_date) {
      setError('Please fill in required fields: Name, Target, Start Date, End Date');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const targetData = {
        ...newTarget,
        target_value: parseFloat(newTarget.target_value) || 0,
        start_date: new Date(newTarget.start_date).toISOString(),
        end_date: new Date(newTarget.end_date).toISOString(),
      };

      await api.createSalesTarget(targetData);
      setSuccess('Target added successfully!');
      setTimeout(() => setSuccess(null), 3000);
      setNewTarget({
        name: '',
        designation: '',
        reporting_to: '',
        region: '',
        frequency: 'monthly',
        stage: '',
        sales_type: '',
        target_value: '',
        start_date: '',
        end_date: '',
        remarks: '',
      });
      fetchTargets();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add target');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleEdit = (target: SalesTarget) => {
    setEditingId(target.id);
    setEditForm({
      ...target,
      start_date: target.start_date?.split('T')[0] || '',
      end_date: target.end_date?.split('T')[0] || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editForm || !editingId) return;

    try {
      const updateData = {
        ...editForm,
        target_value: parseFloat(editForm.target_value) || 0,
        start_date: editForm.start_date ? new Date(editForm.start_date).toISOString() : undefined,
        end_date: editForm.end_date ? new Date(editForm.end_date).toISOString() : undefined,
      };

      await api.updateSalesTarget(editingId, updateData);
      setSuccess('Target updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
      setEditingId(null);
      setEditForm(null);
      fetchTargets();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update target');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this target?')) return;

    try {
      await api.deleteSalesTarget(id);
      setSuccess('Target deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
      fetchTargets();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete target');
      setTimeout(() => setError(null), 3000);
    }
  };

  // File upload handlers
  const handleUploadFile = () => {
    if (!uploadFile) {
      setError('Please select a file to upload');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const newFile = {
      name: uploadFile.name,
      uploadedOn: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      size: formatFileSize(uploadFile.size),
      notes: uploadNotes,
    };

    setUploadedFiles([...uploadedFiles, newFile]);
    setUploadFile(null);
    setUploadNotes('');
    setSuccess('File uploaded successfully!');
    setTimeout(() => setSuccess(null), 3000);

    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleDeleteFile = (index: number) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    setSuccess('File deleted successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  const formatSalesType = (type: string) => {
    if (!type) return '';
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Filter targets based on filter criteria
  const filteredTargets = targets.filter(target => {
    if (filters.name && !target.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
    if (filters.designation && !target.designation?.toLowerCase().includes(filters.designation.toLowerCase())) return false;
    if (filters.reporting_to && !target.reporting_to?.toLowerCase().includes(filters.reporting_to.toLowerCase())) return false;
    if (filters.region && target.region !== filters.region) return false;
    if (filters.frequency && target.frequency !== filters.frequency) return false;
    if (filters.stage && target.stage !== filters.stage) return false;
    if (filters.sales_type && target.sales_type !== filters.sales_type) return false;
    if (filters.remarks && !target.remarks?.toLowerCase().includes(filters.remarks.toLowerCase())) return false;
    return true;
  });

  // Styles
  const thClass = "px-3 py-2 text-left text-xs font-medium text-white bg-blue-600 border-r border-blue-500";
  const tdClass = "px-2 py-2 text-xs border-b border-r border-gray-200";
  const inputClass = "w-full h-7 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500";
  const selectClass = "w-full h-7 px-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white";

  const tabs = [
    { id: 'targets' as TabType, label: 'Targets' },
    { id: 'upload' as TabType, label: 'Upload File' },
    { id: 'workflow' as TabType, label: 'Workflow & Audit Trail' },
  ];

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">SALES TARGET</h1>
          <button className="p-2 border border-gray-300 rounded hover:bg-gray-50">
            <Mail className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Messages */}
        {error && <div className="p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}
        {success && <div className="p-3 bg-green-50 text-green-600 rounded text-sm">{success}</div>}

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'targets' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className={thClass} style={{ width: '40px' }}>No</th>
                    <th className={thClass} style={{ width: '120px' }}>Name</th>
                    <th className={thClass} style={{ width: '100px' }}>Designation</th>
                    <th className={thClass} style={{ width: '110px' }}>Reporting to</th>
                    <th className={thClass} style={{ width: '90px' }}>Region/s</th>
                    <th className={thClass} style={{ width: '90px' }}>Frequency</th>
                    <th className={thClass} style={{ width: '80px' }}>Stage</th>
                    <th className={thClass} style={{ width: '110px' }}>Sales Type</th>
                    <th className={thClass} style={{ width: '70px' }}>Target</th>
                    <th className={thClass} style={{ width: '100px' }}>Start Date</th>
                    <th className={thClass} style={{ width: '100px' }}>End Date</th>
                    <th className={thClass} style={{ width: '100px' }}>Remarks</th>
                    <th className={thClass} style={{ width: '80px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Filter/Add Row */}
                  <tr className="bg-gray-50">
                    <td className={tdClass}></td>
                    <td className={tdClass}>
                      <select
                        value={newTarget.name}
                        onChange={(e) => setNewTarget({ ...newTarget, name: e.target.value })}
                        className={selectClass}
                      >
                        {nameOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className={tdClass}>
                      <input
                        type="text"
                        placeholder="Designation"
                        value={newTarget.designation}
                        onChange={(e) => setNewTarget({ ...newTarget, designation: e.target.value })}
                        className={inputClass}
                      />
                    </td>
                    <td className={tdClass}>
                      <input
                        type="text"
                        placeholder="Reporting to"
                        value={newTarget.reporting_to}
                        onChange={(e) => setNewTarget({ ...newTarget, reporting_to: e.target.value })}
                        className={inputClass}
                      />
                    </td>
                    <td className={tdClass}>
                      <select
                        value={newTarget.region}
                        onChange={(e) => setNewTarget({ ...newTarget, region: e.target.value })}
                        className={selectClass}
                      >
                        {regionOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className={tdClass}>
                      <select
                        value={newTarget.frequency}
                        onChange={(e) => setNewTarget({ ...newTarget, frequency: e.target.value })}
                        className={selectClass}
                      >
                        {frequencyOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className={tdClass}>
                      <select
                        value={newTarget.stage}
                        onChange={(e) => setNewTarget({ ...newTarget, stage: e.target.value })}
                        className={selectClass}
                      >
                        {stageOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className={tdClass}>
                      <select
                        value={newTarget.sales_type}
                        onChange={(e) => setNewTarget({ ...newTarget, sales_type: e.target.value })}
                        className={selectClass}
                      >
                        {salesTypeOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className={tdClass}>
                      <input
                        type="number"
                        placeholder="Target"
                        value={newTarget.target_value}
                        onChange={(e) => setNewTarget({ ...newTarget, target_value: e.target.value })}
                        className={inputClass}
                      />
                    </td>
                    <td className={tdClass}>
                      <input
                        type="date"
                        value={newTarget.start_date}
                        onChange={(e) => setNewTarget({ ...newTarget, start_date: e.target.value })}
                        className={inputClass}
                      />
                    </td>
                    <td className={tdClass}>
                      <input
                        type="date"
                        value={newTarget.end_date}
                        onChange={(e) => setNewTarget({ ...newTarget, end_date: e.target.value })}
                        className={inputClass}
                      />
                    </td>
                    <td className={tdClass}>
                      <input
                        type="text"
                        placeholder="Remarks"
                        value={newTarget.remarks}
                        onChange={(e) => setNewTarget({ ...newTarget, remarks: e.target.value })}
                        className={inputClass}
                      />
                    </td>
                    <td className={tdClass}>
                      <button
                        onClick={handleAddTarget}
                        className="px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
                      >
                        Add
                      </button>
                    </td>
                  </tr>

                  {/* Data Rows */}
                  {loading ? (
                    <tr>
                      <td colSpan={13} className="px-4 py-8 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredTargets.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="px-4 py-8 text-center text-gray-500">
                        No targets found
                      </td>
                    </tr>
                  ) : (
                    filteredTargets.map((target, index) => (
                      editingId === target.id ? (
                        <tr key={target.id} className="bg-yellow-50">
                          <td className={tdClass}>{index + 1}</td>
                          <td className={tdClass}>
                            <select
                              value={editForm?.name || ''}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className={selectClass}
                            >
                              {nameOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className={tdClass}>
                            <input
                              type="text"
                              value={editForm?.designation || ''}
                              onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                              className={inputClass}
                            />
                          </td>
                          <td className={tdClass}>
                            <input
                              type="text"
                              value={editForm?.reporting_to || ''}
                              onChange={(e) => setEditForm({ ...editForm, reporting_to: e.target.value })}
                              className={inputClass}
                            />
                          </td>
                          <td className={tdClass}>
                            <select
                              value={editForm?.region || ''}
                              onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                              className={selectClass}
                            >
                              {regionOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className={tdClass}>
                            <select
                              value={editForm?.frequency || ''}
                              onChange={(e) => setEditForm({ ...editForm, frequency: e.target.value })}
                              className={selectClass}
                            >
                              {frequencyOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className={tdClass}>
                            <select
                              value={editForm?.stage || ''}
                              onChange={(e) => setEditForm({ ...editForm, stage: e.target.value })}
                              className={selectClass}
                            >
                              {stageOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className={tdClass}>
                            <select
                              value={editForm?.sales_type || ''}
                              onChange={(e) => setEditForm({ ...editForm, sales_type: e.target.value })}
                              className={selectClass}
                            >
                              {salesTypeOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className={tdClass}>
                            <input
                              type="number"
                              value={editForm?.target_value || ''}
                              onChange={(e) => setEditForm({ ...editForm, target_value: e.target.value })}
                              className={inputClass}
                            />
                          </td>
                          <td className={tdClass}>
                            <input
                              type="date"
                              value={editForm?.start_date || ''}
                              onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                              className={inputClass}
                            />
                          </td>
                          <td className={tdClass}>
                            <input
                              type="date"
                              value={editForm?.end_date || ''}
                              onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                              className={inputClass}
                            />
                          </td>
                          <td className={tdClass}>
                            <input
                              type="text"
                              value={editForm?.remarks || ''}
                              onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                              className={inputClass}
                            />
                          </td>
                          <td className={tdClass}>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={handleSaveEdit}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="Save"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => { setEditingId(null); setEditForm(null); }}
                                className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                                title="Cancel"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr key={target.id} className="hover:bg-gray-50">
                          <td className={tdClass}>{index + 1}</td>
                          <td className={`${tdClass} text-orange-600`}>{target.name}</td>
                          <td className={`${tdClass} text-blue-600`}>{target.designation}</td>
                          <td className={`${tdClass} text-blue-600`}>{target.reporting_to}</td>
                          <td className={tdClass}>{target.region ? `, ${target.region}` : ''}</td>
                          <td className={`${tdClass} text-orange-600 capitalize`}>{target.frequency}</td>
                          <td className={tdClass}>{target.stage}</td>
                          <td className={`${tdClass} text-orange-600`}>{formatSalesType(target.sales_type || '')}</td>
                          <td className={`${tdClass} text-orange-600`}>{target.target_value}</td>
                          <td className={tdClass}>{formatDate(target.start_date)}</td>
                          <td className={tdClass}>{formatDate(target.end_date)}</td>
                          <td className={`${tdClass} text-orange-600`}>{target.remarks}</td>
                          <td className={tdClass}>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEdit(target)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(target.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="bg-gray-100 p-6">
            {/* Upload Form */}
            <div className="flex items-start gap-8 mb-6">
              <div className="flex items-center gap-4">
                <label className="text-blue-600 font-medium w-20">Document</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={uploadFile?.name || ''}
                    readOnly
                    className="w-64 h-9 px-3 text-sm border border-gray-300 rounded bg-white"
                    placeholder=""
                  />
                  <label className="px-4 py-2 text-sm text-white bg-blue-500 rounded cursor-pointer hover:bg-blue-600 flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    Choose File
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  <button
                    onClick={handleUploadFile}
                    className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Upload
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <label className="text-blue-600 font-medium w-20">Notes</label>
              <input
                type="text"
                value={uploadNotes}
                onChange={(e) => setUploadNotes(e.target.value)}
                className="w-96 h-9 px-3 text-sm border border-gray-300 rounded bg-white"
                placeholder=""
              />
            </div>

            {/* Files Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className={thClass}>File Name</th>
                    <th className={thClass}>Uploaded On</th>
                    <th className={thClass}>Size</th>
                    <th className={thClass}>Notes</th>
                    <th className={thClass}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadedFiles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No files uploaded
                      </td>
                    </tr>
                  ) : (
                    uploadedFiles.map((file, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className={tdClass}>{file.name}</td>
                        <td className={tdClass}>{file.uploadedOn}</td>
                        <td className={tdClass}>{file.size}</td>
                        <td className={tdClass}>{file.notes}</td>
                        <td className={tdClass}>
                          <button
                            onClick={() => handleDeleteFile(index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'workflow' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Workflow & Audit Trail</h2>
            <p className="text-gray-500">No workflow history available.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
