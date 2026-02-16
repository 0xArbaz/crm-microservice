'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

export default function PublicDiligenceFormPage() {
  const params = useParams();
  const leadId = Number(params.leadId);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [crId, setCrId] = useState<number | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  // Diligence form state
  const [form, setForm] = useState<any>({});

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!leadId) {
        setError('Invalid form link');
        setLoading(false);
        return;
      }

      try {
        // Get customer requirement by lead ID (public endpoint)
        const cr = await api.getPublicCustomerRequirement(leadId);
        if (!cr || !cr.id) {
          setError('Form not found');
          setLoading(false);
          return;
        }

        setCrId(cr.id);
        setCompanyName(cr.company_name || '');

        // Load diligence form data (public endpoint)
        const diligenceData = await api.getPublicDiligenceForm(leadId);
        if (diligenceData) {
          setForm(diligenceData);
        }

        // Load countries
        try {
          const countriesData = await api.getCountries();
          setCountries(countriesData || []);

          // Load states if country is selected
          if (diligenceData?.country) {
            const statesData = await api.getStates(diligenceData.country);
            setStates(statesData || []);
          }

          // Load cities if state is selected
          if (diligenceData?.state) {
            const citiesData = await api.getCities(diligenceData.state);
            setCities(citiesData || []);
          }
        } catch (e) {
          // Location data not critical, continue
        }
      } catch (err: any) {
        console.error('Error loading form:', err);
        setError('Unable to load form. Please contact support.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [leadId]);

  const handleCountryChange = async (countryId: number | null) => {
    updateForm('country', countryId);
    updateForm('state', null);
    updateForm('city', null);
    setStates([]);
    setCities([]);

    if (countryId) {
      try {
        const statesData = await api.getStates(countryId);
        setStates(statesData || []);
      } catch (e) {}
    }
  };

  const handleStateChange = async (stateId: number | null) => {
    updateForm('state', stateId);
    updateForm('city', null);
    setCities([]);

    if (stateId) {
      try {
        const citiesData = await api.getCities(stateId);
        setCities(citiesData || []);
      } catch (e) {}
    }
  };

  const updateForm = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const toggleCheckbox = (field: string, checked: boolean) => {
    setForm((prev: any) => ({ ...prev, [field]: checked }));
  };

  const handleSave = async (submitStatus: number = 1) => {
    if (!leadId) return;

    setSaving(true);
    setSuccessMessage(null);
    try {
      const dataToSave = { ...form, submit_status: submitStatus };
      await api.updatePublicDiligenceForm(leadId, dataToSave);
      setForm({ ...form, submit_status: submitStatus });

      if (submitStatus === 2) {
        setSuccessMessage('Form submitted successfully! You can still edit and update the form anytime.');
      } else {
        setSuccessMessage('Form saved as draft successfully!');
      }

      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">!</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const sectionTitle = "text-lg font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2";
  const subSectionTitle = "text-sm font-semibold text-blue-600 mb-2";
  const labelClass = "text-sm text-gray-700 w-40 flex-shrink-0";
  const inputClass = "flex-1 h-9 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500";
  const checkLabel = "text-sm text-gray-700 ml-2 cursor-pointer";
  const rowClass = "flex items-center gap-3 mb-3";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Message Banner */}
        {successMessage && (
          <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg mb-4 flex justify-between items-center">
            <span>{successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-800 hover:text-green-900 text-xl font-bold"
            >
              &times;
            </button>
          </div>
        )}

        {/* Form Status Indicator */}
        {form.submit_status === 2 && !successMessage && (
          <div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-3 rounded-lg mb-4 text-sm">
            This form has been submitted. You can still make changes and update it anytime.
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
          <h1 className="text-2xl font-bold">Pre-Demo Business Questionnaire</h1>
          {companyName && <p className="text-blue-100 mt-1">For: {companyName}</p>}
        </div>

        {/* Form */}
        <div className="bg-white p-6 rounded-b-lg shadow-lg space-y-8">
          {/* 1. GENERAL INFORMATION */}
          <div>
            <h2 className={sectionTitle}>1. GENERAL INFORMATION</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={rowClass}>
                <label className={labelClass}>Company Name:</label>
                <input type="text" value={form.company_name || ''} onChange={(e) => updateForm('company_name', e.target.value)} className={inputClass} />
              </div>
              <div className={rowClass}>
                <label className={labelClass}>Key Person (Name):</label>
                <input type="text" value={form.key_person || ''} onChange={(e) => updateForm('key_person', e.target.value)} className={inputClass} />
              </div>
              <div className={rowClass}>
                <label className={labelClass}>Designation:</label>
                <input type="text" value={form.designation || ''} onChange={(e) => updateForm('designation', e.target.value)} className={inputClass} />
              </div>
              <div className={rowClass}>
                <label className={labelClass}>Email:</label>
                <input type="email" value={form.email || ''} onChange={(e) => updateForm('email', e.target.value)} className={inputClass} />
              </div>
              <div className={rowClass}>
                <label className={labelClass}>Phone:</label>
                <input type="text" value={form.phone || ''} onChange={(e) => updateForm('phone', e.target.value)} className={inputClass} />
              </div>
              <div className={rowClass}>
                <label className={labelClass}>Website:</label>
                <input type="text" value={form.website || ''} onChange={(e) => updateForm('website', e.target.value)} className={inputClass} />
              </div>
              <div className={rowClass}>
                <label className={labelClass}>Address:</label>
                <input type="text" value={form.address || ''} onChange={(e) => updateForm('address', e.target.value)} className={inputClass} />
              </div>
              <div className={rowClass}>
                <label className={labelClass}>Postal Code:</label>
                <input type="text" value={form.postal_code || ''} onChange={(e) => updateForm('postal_code', e.target.value)} className={inputClass} />
              </div>
              <div className={rowClass}>
                <label className={labelClass}>Country:</label>
                <select value={form.country || ''} onChange={(e) => handleCountryChange(parseInt(e.target.value) || null)} className={inputClass}>
                  <option value="">Select Country</option>
                  {countries.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className={rowClass}>
                <label className={labelClass}>State/Province:</label>
                <select value={form.state || ''} onChange={(e) => handleStateChange(parseInt(e.target.value) || null)} className={inputClass}>
                  <option value="">Select State</option>
                  {states.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className={rowClass}>
                <label className={labelClass}>City:</label>
                <select value={form.city || ''} onChange={(e) => updateForm('city', parseInt(e.target.value) || null)} className={inputClass}>
                  <option value="">Select City</option>
                  {cities.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className={rowClass}>
                <label className={labelClass}>Years in Operation:</label>
                <input type="text" value={form.years_operation || ''} onChange={(e) => updateForm('years_operation', e.target.value)} className={inputClass} />
              </div>
              <div className={`${rowClass} md:col-span-2`}>
                <label className={labelClass}>Branch Offices:</label>
                <input type="text" value={form.branch_address || ''} onChange={(e) => updateForm('branch_address', e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>

          {/* 2. ABOUT YOUR BUSINESS */}
          <div>
            <h2 className={sectionTitle}>2. ABOUT YOUR BUSINESS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <p className={subSectionTitle}>Years in Business:</p>
                  <div className="space-y-2">
                    {[
                      { field: 'years_1_5', label: '1-5 years' },
                      { field: 'years_6_10', label: '6-10 years' },
                      { field: 'years_11_50', label: '11-50 years' },
                      { field: 'years_51_100', label: '51-100 years' },
                    ].map(({ field, label }) => (
                      <label key={field} className="flex items-center cursor-pointer">
                        <input type="checkbox" checked={form[field] || false} onChange={(e) => toggleCheckbox(field, e.target.checked)} className="w-4 h-4 rounded" />
                        <span className={checkLabel}>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className={subSectionTitle}>Company Size (Employees):</p>
                  <div className="space-y-2">
                    {[
                      { field: 'size_1_5', label: '1-5' },
                      { field: 'size_6_10', label: '6-10' },
                      { field: 'size_11_50', label: '11-50' },
                      { field: 'size_51_100', label: '51-100' },
                      { field: 'size_100_plus', label: '100+' },
                    ].map(({ field, label }) => (
                      <label key={field} className="flex items-center cursor-pointer">
                        <input type="checkbox" checked={form[field] || false} onChange={(e) => toggleCheckbox(field, e.target.checked)} className="w-4 h-4 rounded" />
                        <span className={checkLabel}>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className={subSectionTitle}>Annual Revenue (Approx.):</p>
                  <div className="space-y-2">
                    {[
                      { field: 'rev_100k', label: 'Upto US$ 100,000' },
                      { field: 'rev_250k', label: 'US$ 100,000 - 250,000' },
                      { field: 'rev_1m', label: 'US$ 250,000 - 1,000,000' },
                      { field: 'rev_5m', label: 'US$ 1,000,000 - 5,000,000' },
                      { field: 'rev_10m', label: 'US$ 5,000,000 - 10,000,000' },
                      { field: 'rev_above_10m', label: 'Above US$ 10,000,000' },
                    ].map(({ field, label }) => (
                      <label key={field} className="flex items-center cursor-pointer">
                        <input type="checkbox" checked={form[field] || false} onChange={(e) => toggleCheckbox(field, e.target.checked)} className="w-4 h-4 rounded" />
                        <span className={checkLabel}>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <p className={subSectionTitle}>Industry Type:</p>
                  <div className="space-y-2">
                    {[
                      { field: 'industry_trading', label: 'Trading (Buy & Sell Products)' },
                      { field: 'industry_manufacturing', label: 'Manufacturing (Produce Goods)' },
                      { field: 'industry_services', label: 'Services (Provide Services to Clients)' },
                      { field: 'industry_distribution', label: 'Distribution / Wholesale' },
                      { field: 'industry_retail', label: 'Retail / POS' },
                      { field: 'industry_projects', label: 'Projects / EPC' },
                      { field: 'industry_consulting', label: 'Consulting / Advisory' },
                    ].map(({ field, label }) => (
                      <label key={field} className="flex items-center cursor-pointer">
                        <input type="checkbox" checked={form[field] || false} onChange={(e) => toggleCheckbox(field, e.target.checked)} className="w-4 h-4 rounded" />
                        <span className={checkLabel}>{label}</span>
                      </label>
                    ))}
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" checked={form.industry_other_chk || false} onChange={(e) => toggleCheckbox('industry_other_chk', e.target.checked)} className="w-4 h-4 rounded" />
                      <span className={checkLabel}>Other:</span>
                      <input type="text" value={form.industry_other || ''} onChange={(e) => updateForm('industry_other', e.target.value)} className="ml-2 h-8 w-48 px-2 text-sm border border-gray-300 rounded" placeholder="Please specify" />
                    </label>
                  </div>
                </div>

                <div>
                  <p className={subSectionTitle}>Markets Served:</p>
                  <div className="space-y-2">
                    {[
                      { field: 'market_local', label: 'Local' },
                      { field: 'market_national', label: 'National' },
                      { field: 'market_international', label: 'International' },
                    ].map(({ field, label }) => (
                      <label key={field} className="flex items-center cursor-pointer">
                        <input type="checkbox" checked={form[field] || false} onChange={(e) => toggleCheckbox(field, e.target.checked)} className="w-4 h-4 rounded" />
                        <span className={checkLabel}>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className={subSectionTitle}>Company Legal Structure:</p>
                  <div className="space-y-2">
                    {[
                      { field: 'legal_sole', label: 'Sole Proprietorship' },
                      { field: 'legal_partnership', label: 'Partnership' },
                      { field: 'legal_llc', label: 'LLC (Limited Liability Company)' },
                    ].map(({ field, label }) => (
                      <label key={field} className="flex items-center cursor-pointer">
                        <input type="checkbox" checked={form[field] || false} onChange={(e) => toggleCheckbox(field, e.target.checked)} className="w-4 h-4 rounded" />
                        <span className={checkLabel}>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. CURRENT SYSTEMS USED */}
          <div>
            <h2 className={sectionTitle}>3. CURRENT SYSTEMS USED</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                { field: 'sys_paper', label: 'Paper / Excel Sheets' },
                { field: 'sys_account', label: 'Accounting Software (Tally, QuickBooks, Zoho, etc.)' },
                { field: 'sys_crm', label: 'CRM Software' },
                { field: 'sys_hrm', label: 'HRM Software' },
                { field: 'sys_inv', label: 'Inventory / Stock System' },
                { field: 'sys_erp', label: 'ERP System' },
              ].map(({ field, label }) => (
                <label key={field} className="flex items-center cursor-pointer py-1">
                  <input type="checkbox" checked={form[field] || false} onChange={(e) => toggleCheckbox(field, e.target.checked)} className="w-4 h-4 rounded" />
                  <span className={checkLabel}>{label}</span>
                </label>
              ))}
              <label className="flex items-center cursor-pointer py-1 md:col-span-2">
                <input type="checkbox" checked={form.sys_other_chk || false} onChange={(e) => toggleCheckbox('sys_other_chk', e.target.checked)} className="w-4 h-4 rounded" />
                <span className={checkLabel}>Other:</span>
                <input type="text" value={form.sys_other || ''} onChange={(e) => updateForm('sys_other', e.target.value)} className="ml-2 h-8 w-64 px-2 text-sm border border-gray-300 rounded" placeholder="Please specify" />
              </label>
            </div>
          </div>

          {/* 4. KEY BUSINESS PRIORITIES */}
          <div>
            <h2 className={sectionTitle}>4. KEY BUSINESS PRIORITIES</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                { field: 'key_cust', label: 'Getting More Customers (Sales & CRM)' },
                { field: 'key_suppliers', label: 'Managing Suppliers & Vendors Better' },
                { field: 'key_proposal', label: 'Faster Proposal / Quotation Process' },
                { field: 'key_inventory', label: 'Tracking Inventory & Stock Easily' },
                { field: 'key_financial', label: 'Better Financial Control' },
                { field: 'key_projects', label: 'Tracking Projects, Tasks, Timesheets' },
                { field: 'key_employees', label: 'Managing Employees (HR & Payroll)' },
                { field: 'key_dms', label: 'Easy Access to Documents (DMS)' },
                { field: 'key_reports', label: 'Quick & Accurate Business Reports' },
                { field: 'key_integration', label: 'Smooth Integration Across Departments' },
                { field: 'key_multicurrency', label: 'Multi-Currency Support' },
                { field: 'key_errors', label: 'Reduce Manual Errors' },
                { field: 'key_costs', label: 'Reduce Operational Costs' },
              ].map(({ field, label }) => (
                <label key={field} className="flex items-center cursor-pointer py-1">
                  <input type="checkbox" checked={form[field] || false} onChange={(e) => toggleCheckbox(field, e.target.checked)} className="w-4 h-4 rounded" />
                  <span className={checkLabel}>{label}</span>
                </label>
              ))}
              <label className="flex items-center cursor-pointer py-1 md:col-span-2">
                <input type="checkbox" checked={form.key_other_chk || false} onChange={(e) => toggleCheckbox('key_other_chk', e.target.checked)} className="w-4 h-4 rounded" />
                <span className={checkLabel}>Other:</span>
                <input type="text" value={form.key_other || ''} onChange={(e) => updateForm('key_other', e.target.value)} className="ml-2 h-8 w-64 px-2 text-sm border border-gray-300 rounded" placeholder="Please specify" />
              </label>
            </div>
          </div>

          {/* 5. MAIN BUSINESS CHALLENGES */}
          <div>
            <h2 className={sectionTitle}>5. MAIN BUSINESS CHALLENGES</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                { field: 'main_manual', label: 'Too much manual work in Excel / Paper' },
                { field: 'main_tracking', label: 'Hard to track orders, stock, or shipments' },
                { field: 'main_delay', label: 'Delays in sending Quotations / Invoices' },
                { field: 'main_payments', label: 'No clear view of payments & collections' },
                { field: 'main_inventory', label: 'Inventory or supply chain issues' },
                { field: 'main_suppliers', label: 'Difficulty in managing suppliers/vendors' },
                { field: 'main_hr', label: 'Employee leave, payroll, or performance issues' },
                { field: 'main_reports', label: 'Lack of reports for decision making' },
                { field: 'main_currency', label: 'Difficult to manage multiple currencies' },
                { field: 'main_branches', label: 'Difficult to manage multiple branches/locations' },
              ].map(({ field, label }) => (
                <label key={field} className="flex items-center cursor-pointer py-1">
                  <input type="checkbox" checked={form[field] || false} onChange={(e) => toggleCheckbox(field, e.target.checked)} className="w-4 h-4 rounded" />
                  <span className={checkLabel}>{label}</span>
                </label>
              ))}
              <label className="flex items-center cursor-pointer py-1 md:col-span-2">
                <input type="checkbox" checked={form.main_other_chk || false} onChange={(e) => toggleCheckbox('main_other_chk', e.target.checked)} className="w-4 h-4 rounded" />
                <span className={checkLabel}>Other:</span>
                <input type="text" value={form.main_other || ''} onChange={(e) => updateForm('main_other', e.target.value)} className="ml-2 h-8 w-64 px-2 text-sm border border-gray-300 rounded" placeholder="Please specify" />
              </label>
            </div>
          </div>

          {/* 6. OTHER REQUIREMENTS / NOTES */}
          <div>
            <h2 className={sectionTitle}>6. OTHER REQUIREMENTS / NOTES</h2>
            <p className="text-sm text-gray-500 mb-3 italic">Please mention any special features, compliance needs, or integrations you require</p>
            <textarea
              value={form.other_notes || ''}
              onChange={(e) => updateForm('other_notes', e.target.value)}
              className="w-full h-32 px-4 py-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your additional requirements here..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleSave(1)}
              disabled={saving}
              className="px-8 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 border border-gray-300"
            >
              {saving ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              onClick={() => handleSave(2)}
              disabled={saving}
              className="px-8 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-xs mt-4">
          Powered by CRM Microservice
        </div>
      </div>
    </div>
  );
}
