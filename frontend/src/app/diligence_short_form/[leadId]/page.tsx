'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export default function DiligenceShortFormPage() {
  const params = useParams();
  const leadId = Number(params.leadId);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
        const crRes = await axios.get(`${API_URL}/public/forms/customer-requirement/${leadId}`);
        const cr = crRes.data;
        if (!cr || !cr.id) {
          setError('Form not found');
          setLoading(false);
          return;
        }

        setCompanyName(cr.company_name || '');

        // Load diligence form data (public endpoint)
        const diligenceRes = await axios.get(`${API_URL}/public/forms/diligence/${leadId}`);
        const diligenceData = diligenceRes.data;
        if (diligenceData) {
          setForm(diligenceData);
        }

        // Load countries
        try {
          const countriesRes = await axios.get(`${API_URL}/location/countries`);
          setCountries(countriesRes.data || []);

          // Load states if country is selected
          if (diligenceData?.country) {
            const statesRes = await axios.get(`${API_URL}/location/states?country_id=${diligenceData.country}`);
            setStates(statesRes.data || []);
          }

          // Load cities if state is selected
          if (diligenceData?.state) {
            const citiesRes = await axios.get(`${API_URL}/location/cities?state_id=${diligenceData.state}`);
            setCities(citiesRes.data || []);
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

  const updateForm = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const toggleCheckbox = (field: string, checked: boolean) => {
    setForm((prev: any) => ({ ...prev, [field]: checked }));
  };

  const handleCountryChange = async (countryId: number) => {
    updateForm('country', countryId);
    updateForm('state', null);
    updateForm('city', null);
    setStates([]);
    setCities([]);

    if (countryId) {
      try {
        const res = await axios.get(`${API_URL}/location/states?country_id=${countryId}`);
        setStates(res.data || []);
      } catch (e) {}
    }
  };

  const handleStateChange = async (stateId: number) => {
    updateForm('state', stateId);
    updateForm('city', null);
    setCities([]);

    if (stateId) {
      try {
        const res = await axios.get(`${API_URL}/location/cities?state_id=${stateId}`);
        setCities(res.data || []);
      } catch (e) {}
    }
  };

  const handleSave = async (submitStatus: number = 1) => {
    if (!leadId) return;

    setSaving(true);
    setSuccessMessage(null);
    try {
      const dataToSave = { ...form, submit_status: submitStatus };
      await axios.put(`${API_URL}/public/forms/diligence/${leadId}`, dataToSave);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow">
          <div className="text-red-500 text-5xl mb-4">&#9888;</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Styles matching the Laravel blade template
  const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: "'Raleway', sans-serif" },
    sectionTitle: { color: '#797979', fontSize: '11px', fontWeight: 500, marginBottom: '8px', textTransform: 'uppercase' as const, letterSpacing: '0.03em' },
    subTitle: { color: '#0062FF', fontSize: '10px', fontWeight: 500, marginBottom: '8px', textTransform: 'uppercase' as const, marginLeft: '18px' },
    label: { fontSize: '10px', fontWeight: 400, color: '#212529c7', padding: '3px 5px', fontFamily: "'Raleway', sans-serif" },
    input: { fontSize: '10px', padding: '2px 6px', height: '22px', border: '1px solid #ced4da', borderRadius: '4px', width: '100%' },
    select: { fontSize: '10px', padding: '2px 6px', height: '22px', border: '1px solid #ced4da', borderRadius: '4px', width: '100%' },
    checkbox: { marginRight: '8px' },
    checkLabel: { fontSize: '10px', fontWeight: 400, color: '#212529c7', cursor: 'pointer' },
    btnSubmit: { background: '#5CD259', color: '#fff', borderRadius: '3px', fontSize: '12px', padding: '8px 20px', border: '2px solid #5CD259', cursor: 'pointer' },
  };

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', paddingTop: '20px', paddingBottom: '40px' }}>
      <div style={styles.container}>
        {/* Success Message Banner */}
        {successMessage && (
          <div style={{
            background: '#d4edda',
            border: '1px solid #c3e6cb',
            color: '#155724',
            padding: '12px 20px',
            borderRadius: '4px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#155724' }}
            >
              &times;
            </button>
          </div>
        )}

        {/* Form Status Indicator */}
        {form.submit_status === 2 && (
          <div style={{
            background: '#cce5ff',
            border: '1px solid #b8daff',
            color: '#004085',
            padding: '10px 20px',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '12px'
          }}>
            This form has been submitted. You can still make changes and update it anytime.
          </div>
        )}

        <h4 style={{ marginBottom: '16px', marginTop: '16px', paddingLeft: '21px', fontSize: '1rem' }}>
          Pre-Demo Business Questionnaire
        </h4>

        {/* 1. GENERAL INFORMATION */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ ...styles.sectionTitle, color: '#212529d1', marginLeft: '21px', marginTop: '15px' }}>1. General Information</h3>
          <div style={{ paddingLeft: '26px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {/* Left Column */}
              <div style={{ flex: '1', minWidth: '300px', paddingRight: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ ...styles.label, width: '120px', color: '#0062FF' }}>Company Name</label>
                  <input type="text" value={form.company_name || ''} onChange={(e) => updateForm('company_name', e.target.value)} style={{ ...styles.input, flex: 1 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ ...styles.label, width: '120px', color: '#0062FF' }}>Address</label>
                  <input type="text" value={form.address || ''} onChange={(e) => updateForm('address', e.target.value)} style={{ ...styles.input, flex: 1 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ ...styles.label, width: '120px', color: '#0062FF' }}>Country</label>
                  <select value={form.country || ''} onChange={(e) => handleCountryChange(Number(e.target.value))} style={{ ...styles.select, flex: 1 }}>
                    <option value="">Select Country</option>
                    {countries.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ ...styles.label, width: '120px', color: '#0062FF' }}>Province</label>
                  <select value={form.state || ''} onChange={(e) => handleStateChange(Number(e.target.value))} style={{ ...styles.select, flex: 1 }}>
                    <option value="">Select State</option>
                    {states.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ ...styles.label, width: '120px', color: '#0062FF' }}>City</label>
                  <select value={form.city || ''} onChange={(e) => updateForm('city', Number(e.target.value))} style={{ ...styles.select, flex: 1 }}>
                    <option value="">Select City</option>
                    {cities.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ ...styles.label, width: '120px', color: '#0062FF' }}>Postal Code</label>
                  <input type="text" value={form.postal_code || ''} onChange={(e) => updateForm('postal_code', e.target.value)} style={{ ...styles.input, flex: 1 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ ...styles.label, width: '120px', color: '#0062FF' }}>Any Branch Offices</label>
                  <input type="text" value={form.years_operation || ''} onChange={(e) => updateForm('years_operation', e.target.value)} style={{ ...styles.input, flex: 1 }} />
                </div>
              </div>
              {/* Right Column */}
              <div style={{ flex: '1', minWidth: '300px', paddingLeft: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ ...styles.label, width: '120px', color: '#0062FF' }}>Key Person (Name)</label>
                  <input type="text" value={form.key_person || ''} onChange={(e) => updateForm('key_person', e.target.value)} style={{ ...styles.input, flex: 1 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ ...styles.label, width: '120px', color: '#0062FF' }}>Email</label>
                  <input type="email" value={form.email || ''} onChange={(e) => updateForm('email', e.target.value)} style={{ ...styles.input, flex: 1 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ ...styles.label, width: '120px', color: '#0062FF' }}>Phone</label>
                  <input type="text" value={form.phone || ''} onChange={(e) => updateForm('phone', e.target.value)} style={{ ...styles.input, flex: 1 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ ...styles.label, width: '120px', color: '#0062FF' }}>Website</label>
                  <input type="url" value={form.website || ''} onChange={(e) => updateForm('website', e.target.value)} style={{ ...styles.input, flex: 1 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ ...styles.label, width: '120px', color: '#0062FF' }}>Designation</label>
                  <input type="text" value={form.designation || ''} onChange={(e) => updateForm('designation', e.target.value)} style={{ ...styles.input, flex: 1 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ ...styles.label, width: '120px', color: '#0062FF' }}>Branch Address</label>
                  <input type="text" value={form.branch_address || ''} onChange={(e) => updateForm('branch_address', e.target.value)} style={{ ...styles.input, flex: 1 }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. ABOUT YOUR BUSINESS */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ ...styles.sectionTitle, color: '#212529d1', marginLeft: '21px' }}>2. About Your Business</h3>

          {/* Years in Operation */}
          <label style={styles.subTitle}>Years in Operation:</label>
          <div style={{ paddingLeft: '18px', marginBottom: '12px' }}>
            {[
              { field: 'years_1_5', label: '1-5' },
              { field: 'years_6_10', label: '6-10' },
              { field: 'years_11_50', label: '11-20' },
              { field: 'years_51_100', label: '20+' },
            ].map(({ field, label }) => (
              <div key={field} style={{ marginBottom: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form[field] || false} onChange={(e) => toggleCheckbox(field, e.target.checked)} style={styles.checkbox} />
                  <span style={styles.checkLabel}>{label}</span>
                </label>
              </div>
            ))}
          </div>

          {/* Company Size */}
          <label style={styles.subTitle}>Company Size (Number of Employees):</label>
          <div style={{ paddingLeft: '18px', marginBottom: '12px' }}>
            {[
              { field: 'size_1_5', label: '1-10' },
              { field: 'size_11_50', label: '11-50' },
              { field: 'size_51_100', label: '51-100' },
              { field: 'size_100_plus', label: '100+' },
            ].map(({ field, label }) => (
              <div key={field} style={{ marginBottom: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form[field] || false} onChange={(e) => toggleCheckbox(field, e.target.checked)} style={styles.checkbox} />
                  <span style={styles.checkLabel}>{label}</span>
                </label>
              </div>
            ))}
          </div>

          {/* Industry Type */}
          <label style={styles.subTitle}>Industry Type (Select one):</label>
          <div style={{ paddingLeft: '18px', marginBottom: '12px' }}>
            {[
              { field: 'industry_trading', label: 'Trading (Buy & Sell Products)' },
              { field: 'industry_manufacturing', label: 'Manufacturing (Produce Goods)' },
              { field: 'industry_services', label: 'Services (Provide Services to Clients)' },
              { field: 'industry_distribution', label: 'Distribution / Wholesale' },
              { field: 'industry_retail', label: 'Retail / Point of Sale' },
              { field: 'industry_projects', label: 'Projects / EPC (Project-based Work)' },
              { field: 'industry_consulting', label: 'Consulting (Advisory, Professional Services)' },
            ].map(({ field, label }) => (
              <div key={field} style={{ marginBottom: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form[field] || false} onChange={(e) => toggleCheckbox(field, e.target.checked)} style={styles.checkbox} />
                  <span style={styles.checkLabel}>{label}</span>
                </label>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '5px' }}>
              <input type="checkbox" checked={form.industry_other_chk || false} onChange={(e) => toggleCheckbox('industry_other_chk', e.target.checked)} />
              <label style={styles.checkLabel}>Other</label>
              <input type="text" value={form.industry_other || ''} onChange={(e) => updateForm('industry_other', e.target.value)}
                style={{ width: '350px', padding: '4px 6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '10px' }} placeholder="Please specify" />
            </div>
          </div>

          {/* Annual Revenue */}
          <label style={styles.subTitle}>Annual Revenue (Approx.):</label>
          <div style={{ paddingLeft: '18px', marginBottom: '12px', display: 'flex', flexWrap: 'wrap' }}>
            {[
              { field: 'rev_100k', label: 'Upto US$ 100,000' },
              { field: 'rev_250k', label: 'US$ 100,000 - 250,000' },
              { field: 'rev_1m', label: 'US$ 250,000 - 1,000,000' },
              { field: 'rev_5m', label: 'US$ 1,000,000 - 5,000,000' },
              { field: 'rev_10m', label: 'US$ 5,000,000 - 10,000,000' },
              { field: 'rev_above_10m', label: 'Above US$ 10,000,000' },
            ].map(({ field, label }) => (
              <div key={field} style={{ width: '33%', marginBottom: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form[field] || false} onChange={(e) => toggleCheckbox(field, e.target.checked)} style={styles.checkbox} />
                  <span style={styles.checkLabel}>{label}</span>
                </label>
              </div>
            ))}
          </div>

          {/* Markets Served */}
          <label style={styles.subTitle}>Markets Served (Select all that apply):</label>
          <div style={{ paddingLeft: '18px', marginBottom: '12px' }}>
            {[
              { field: 'market_local', label: 'Local' },
              { field: 'market_national', label: 'National' },
              { field: 'market_international', label: 'International' },
            ].map(({ field, label }) => (
              <div key={field} style={{ marginBottom: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form[field] || false} onChange={(e) => toggleCheckbox(field, e.target.checked)} style={styles.checkbox} />
                  <span style={styles.checkLabel}>{label}</span>
                </label>
              </div>
            ))}
          </div>

          {/* Legal Structure */}
          <label style={styles.subTitle}>Company Legal Structure:</label>
          <div style={{ paddingLeft: '18px', marginBottom: '12px' }}>
            {[
              { field: 'legal_sole', label: 'Sole Proprietorship' },
              { field: 'legal_partnership', label: 'Partnership' },
              { field: 'legal_llc', label: 'LLC (Limited Liability Company)' },
            ].map(({ field, label }) => (
              <div key={field} style={{ marginBottom: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form[field] || false} onChange={(e) => toggleCheckbox(field, e.target.checked)} style={styles.checkbox} />
                  <span style={styles.checkLabel}>{label}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* 3. CURRENT SYSTEMS */}
        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ ...styles.sectionTitle, color: '#212529d1', marginLeft: '21px' }}>3. Current Systems</h5>
          <label style={styles.subTitle}>How do you currently manage your operations? (Select all that apply)</label>
          <div style={{ paddingLeft: '18px', marginBottom: '12px' }}>
            {[
              { field: 'sys_paper', label: 'Paper / Excel Sheets' },
              { field: 'sys_account', label: 'Accounting Software (Tally, QuickBooks, Zoho, etc.)' },
              { field: 'sys_crm', label: 'CRM Software (Sales tracking, follow-ups)' },
              { field: 'sys_hrm', label: 'HRM Software (Employee & Leave Management)' },
              { field: 'sys_inv', label: 'Inventory / Stock Management System' },
              { field: 'sys_erp', label: 'ERP System (SAP, Oracle, Netsuite, etc.)' },
            ].map(({ field, label }) => (
              <div key={field} style={{ marginBottom: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form[field] || false} onChange={(e) => toggleCheckbox(field, e.target.checked)} style={styles.checkbox} />
                  <span style={styles.checkLabel}>{label}</span>
                </label>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '5px' }}>
              <input type="checkbox" checked={form.sys_other_chk || false} onChange={(e) => toggleCheckbox('sys_other_chk', e.target.checked)} />
              <label style={styles.checkLabel}>Other</label>
              <input type="text" value={form.sys_other || ''} onChange={(e) => updateForm('sys_other', e.target.value)}
                style={{ width: '350px', padding: '4px 6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '10px' }} placeholder="Please specify" />
            </div>
          </div>
        </div>

        {/* 4. KEY BUSINESS PRIORITIES */}
        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ ...styles.sectionTitle, color: '#212529d1', marginLeft: '21px' }}>4. Key Business Priorities</h5>
          <label style={styles.subTitle}>What matters most to you? (Select all that apply)</label>
          <div style={{ paddingLeft: '18px', marginBottom: '12px' }}>
            {[
              { field: 'key_cust', label: 'Getting More Customers (Sales & CRM)' },
              { field: 'key_suppliers', label: 'Managing Suppliers & Vendors Better' },
              { field: 'key_proposal', label: 'Faster Proposal / Quotation Process' },
              { field: 'key_inventory', label: 'Tracking Inventory & Stock Easily' },
              { field: 'key_financial', label: 'Better Financial Control (Invoices, Payments, Reports)' },
              { field: 'key_projects', label: 'Tracking Projects, Tasks, Timesheets' },
              { field: 'key_employees', label: 'Managing Employees (HR & Payroll)' },
              { field: 'key_dms', label: 'Easy Access to Documents (DMS)' },
              { field: 'key_reports', label: 'Quick & Accurate Business Reports' },
              { field: 'key_integration', label: 'Smooth Integration Across Departments' },
              { field: 'key_multicurrency', label: 'Multi-Currency Support' },
              { field: 'key_errors', label: 'Reduce Manual Errors' },
              { field: 'key_costs', label: 'Reduce Operational Costs' },
            ].map(({ field, label }) => (
              <div key={field} style={{ marginBottom: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form[field] || false} onChange={(e) => toggleCheckbox(field, e.target.checked)} style={styles.checkbox} />
                  <span style={styles.checkLabel}>{label}</span>
                </label>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '5px' }}>
              <input type="checkbox" checked={form.key_other_chk || false} onChange={(e) => toggleCheckbox('key_other_chk', e.target.checked)} />
              <label style={styles.checkLabel}>Other</label>
              <input type="text" value={form.key_other || ''} onChange={(e) => updateForm('key_other', e.target.value)}
                style={{ width: '350px', padding: '4px 6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '10px' }} placeholder="Please specify" />
            </div>
          </div>
        </div>

        {/* 5. MAIN BUSINESS CHALLENGES */}
        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ ...styles.sectionTitle, color: '#212529d1', marginLeft: '21px' }}>5. Main Business Challenges</h5>
          <label style={styles.subTitle}>What are the main challenges you face? (Select all that apply)</label>
          <div style={{ paddingLeft: '18px', marginBottom: '12px' }}>
            {[
              { field: 'main_manual', label: 'Too much manual work in Excel / Paper' },
              { field: 'main_tracking', label: 'Hard to track orders, stock, or shipments' },
              { field: 'main_delay', label: 'Delays in sending Quotations / Invoices' },
              { field: 'main_payments', label: 'No clear view of payments & collections' },
              { field: 'main_inventory', label: 'Inventory or supply chain issues' },
              { field: 'main_suppliers', label: 'Difficulty in managing suppliers/vendors' },
              { field: 'main_emp', label: 'Employee leave, payroll, or performance issues' },
              { field: 'main_lack', label: 'Lack of reports for decision making' },
              { field: 'main_diff', label: 'Difficult to manage multiple currencies' },
              { field: 'main_branch', label: 'Difficult to manage multiple branches/locations' },
            ].map(({ field, label }) => (
              <div key={field} style={{ marginBottom: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form[field] || false} onChange={(e) => toggleCheckbox(field, e.target.checked)} style={styles.checkbox} />
                  <span style={styles.checkLabel}>{label}</span>
                </label>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '5px' }}>
              <input type="checkbox" checked={form.main_other_chk || false} onChange={(e) => toggleCheckbox('main_other_chk', e.target.checked)} />
              <label style={styles.checkLabel}>Other</label>
              <input type="text" value={form.main_other || ''} onChange={(e) => updateForm('main_other', e.target.value)}
                style={{ width: '350px', padding: '4px 6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '10px' }} placeholder="Please specify" />
            </div>
          </div>
        </div>

        {/* 6. OTHER REQUIREMENTS / NOTES */}
        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ ...styles.sectionTitle, color: '#212529d1', marginLeft: '21px' }}>6. Other Requirements / Notes</h5>
          <label style={styles.subTitle}>(Please mention any special features, compliance needs, or integrations you require)</label>
          <div style={{ paddingLeft: '18px', marginBottom: '12px' }}>
            <input type="text" value={form.other_notes || ''} onChange={(e) => updateForm('other_notes', e.target.value)}
              style={{ width: '100%', maxWidth: '1078px', padding: '10px 6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '10px' }} placeholder="Please specify" />
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button type="button" onClick={() => handleSave(2)} disabled={saving} style={styles.btnSubmit}>
            {saving ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}
