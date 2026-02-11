'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Edit2, Trash2, Plus, RefreshCw } from 'lucide-react';
import api from '@/lib/api';

interface OptionDropdown {
  id: number;
  name: string;
  option_id: number;
  status: string;
  default_value: boolean;
  created_by?: number;
  company_id?: number;
  created?: string;
  updated?: string;
}

interface Option {
  id: number;
  title: string;
  created?: string;
  updated?: string;
  dropdowns: OptionDropdown[];
}

export default function OptionMasterPage() {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    isDefault: 'No',
    status: 'Active',
  });
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    isDefault: 'No',
    status: 'Active',
  });
  const [showAddOption, setShowAddOption] = useState(false);
  const [newOptionTitle, setNewOptionTitle] = useState('');

  const selectedOption = options.find(opt => opt.id === selectedOptionId);

  // Fetch options on load
  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const data = await api.getOptionsWithDropdowns();
      setOptions(data);
    } catch (error) {
      console.error('Failed to fetch options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = async () => {
    if (!newOptionTitle.trim()) return;

    try {
      console.log('Creating option:', newOptionTitle);
      const result = await api.createOption({ title: newOptionTitle });
      console.log('Option created:', result);
      await fetchOptions();
      setNewOptionTitle('');
      setShowAddOption(false);
    } catch (error: any) {
      console.error('Error creating option:', error);
      const errorMsg = error?.response?.data?.detail || error?.message || 'Failed to create option';
      alert(`Error: ${errorMsg}\n\nPlease check:\n1. Is the backend server running?\n2. Have you run the database migration?`);
    }
  };

  const handleDeleteOption = async (optionId: number) => {
    if (!confirm('Are you sure you want to delete this option category and all its items?')) return;

    try {
      await api.deleteOption(optionId);
      await fetchOptions();
      if (selectedOptionId === optionId) {
        setSelectedOptionId(null);
      }
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to delete option');
    }
  };

  const handleAdd = async () => {
    if (!selectedOptionId || !newItem.name.trim()) return;

    try {
      await api.createOptionDropdown(selectedOptionId, {
        name: newItem.name,
        option_id: selectedOptionId,
        status: newItem.status,
        default_value: newItem.isDefault === 'Yes',
      });
      await fetchOptions();
      setNewItem({ name: '', isDefault: 'No', status: 'Active' });
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to create dropdown');
    }
  };

  const handleEdit = (item: OptionDropdown) => {
    setEditingItem(item.id);
    setEditForm({
      name: item.name,
      isDefault: item.default_value ? 'Yes' : 'No',
      status: item.status,
    });
  };

  const handleUpdate = async (itemId: number) => {
    if (!selectedOptionId || !editForm.name.trim()) return;

    try {
      await api.updateOptionDropdown(selectedOptionId, itemId, {
        name: editForm.name,
        status: editForm.status,
        default_value: editForm.isDefault === 'Yes',
      });
      await fetchOptions();
      setEditingItem(null);
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to update dropdown');
    }
  };

  const handleDelete = async (itemId: number) => {
    if (!selectedOptionId) return;
    if (!confirm('Are you sure you want to delete this option?')) return;

    try {
      await api.deleteOptionDropdown(selectedOptionId, itemId);
      await fetchOptions();
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to delete dropdown');
    }
  };

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
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-4 rounded-t-lg -mx-6 -mt-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">OPTION MASTER</h1>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowAddOption(true)}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
              <Button
                onClick={fetchOptions}
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Add New Category Form */}
        {showAddOption && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Lead Source"
                    value={newOptionTitle}
                    onChange={(e) => setNewOptionTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <Button onClick={handleAddOption}>Save</Button>
                <Button variant="outline" onClick={() => setShowAddOption(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Select Options */}
        <div className="flex items-center justify-center gap-4 py-4">
          <label className="text-blue-600 font-medium">Select Options</label>
          <select
            value={selectedOptionId || ''}
            onChange={(e) => setSelectedOptionId(e.target.value ? Number(e.target.value) : null)}
            className="w-80 px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Option</option>
            {options.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.title}</option>
            ))}
          </select>
          {selectedOptionId && (
            <button
              onClick={() => handleDeleteOption(selectedOptionId)}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
              title="Delete Category"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Add New Item Form */}
        {selectedOptionId && (
          <div className="bg-blue-600 rounded-lg overflow-hidden">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-2 px-4 py-3 text-white font-medium text-sm">
              <div className="col-span-2">Default</div>
              <div className="col-span-6">Display Name</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Action</div>
            </div>

            {/* Input Row */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-blue-600">
              <div className="col-span-2">
                <select
                  value={newItem.isDefault}
                  onChange={(e) => setNewItem({ ...newItem, isDefault: e.target.value })}
                  className="w-full px-3 py-2 border border-blue-400 rounded text-red-500 font-medium"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              <div className="col-span-6">
                <input
                  type="text"
                  placeholder="Display Name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3 py-2 border border-blue-400 rounded placeholder-blue-300"
                />
              </div>
              <div className="col-span-2">
                <select
                  value={newItem.status}
                  onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
                  className="w-full px-3 py-2 border border-blue-400 rounded"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="col-span-2">
                <Button
                  onClick={handleAdd}
                  className="w-full bg-blue-500 hover:bg-blue-400 text-white border border-white"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Items Table */}
        {selectedOptionId && selectedOption && (
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">S.No</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Default</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Display Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedOption.dropdowns.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No options available. Add one above.
                      </td>
                    </tr>
                  ) : (
                    selectedOption.dropdowns.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                        <td className="px-4 py-3">
                          {editingItem === item.id ? (
                            <select
                              value={editForm.isDefault}
                              onChange={(e) => setEditForm({ ...editForm, isDefault: e.target.value })}
                              className="w-20 px-2 py-1 border rounded text-sm"
                            >
                              <option value="No">No</option>
                              <option value="Yes">Yes</option>
                            </select>
                          ) : (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              item.default_value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {item.default_value ? 'Yes' : 'No'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingItem === item.id ? (
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full px-2 py-1 border rounded text-sm"
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-900">{item.name}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingItem === item.id ? (
                            <select
                              value={editForm.status}
                              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                              className="w-24 px-2 py-1 border rounded text-sm"
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                          ) : (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              item.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.status}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {editingItem === item.id ? (
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleUpdate(item.id)}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs px-3"
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingItem(null)}
                                className="text-xs px-3"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Placeholder when no category selected */}
        {!selectedOptionId && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">&#9881;</div>
            <p className="text-gray-500">Please select an option category from the dropdown above.</p>
            {options.length === 0 && (
              <p className="text-gray-400 text-sm mt-2">
                No categories found. Click "Add Category" to create one.
              </p>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
