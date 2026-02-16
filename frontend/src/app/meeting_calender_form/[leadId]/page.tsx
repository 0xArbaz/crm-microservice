'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Timezone list (common timezones)
const TIMEZONES = [
  { id: 1, timezone: 'UTC', utc_offset: '+00:00' },
  { id: 2, timezone: 'America/New_York', utc_offset: '-05:00' },
  { id: 3, timezone: 'America/Chicago', utc_offset: '-06:00' },
  { id: 4, timezone: 'America/Denver', utc_offset: '-07:00' },
  { id: 5, timezone: 'America/Los_Angeles', utc_offset: '-08:00' },
  { id: 6, timezone: 'America/Toronto', utc_offset: '-05:00' },
  { id: 7, timezone: 'Europe/London', utc_offset: '+00:00' },
  { id: 8, timezone: 'Europe/Paris', utc_offset: '+01:00' },
  { id: 9, timezone: 'Europe/Berlin', utc_offset: '+01:00' },
  { id: 10, timezone: 'Asia/Dubai', utc_offset: '+04:00' },
  { id: 11, timezone: 'Asia/Kolkata', utc_offset: '+05:30' },
  { id: 12, timezone: 'Asia/Singapore', utc_offset: '+08:00' },
  { id: 13, timezone: 'Asia/Tokyo', utc_offset: '+09:00' },
  { id: 14, timezone: 'Australia/Sydney', utc_offset: '+11:00' },
  { id: 15, timezone: 'Pacific/Auckland', utc_offset: '+13:00' },
];

export default function MeetingCalendarFormPage() {
  const params = useParams();
  const leadId = Number(params.leadId);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  // Form state
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
        // Get meeting calendar data (public endpoint)
        const formRes = await axios.get(`${API_URL}/public/forms/meeting-calendar/${leadId}`);
        const formData = formRes.data;

        if (formData) {
          setForm(formData);
        }

        // Load countries
        try {
          const countriesRes = await axios.get(`${API_URL}/location/countries`);
          setCountries(countriesRes.data || []);

          // Load states if country is selected
          if (formData?.gi_country) {
            const statesRes = await axios.get(`${API_URL}/location/states?country_id=${formData.gi_country}`);
            setStates(statesRes.data || []);
          }

          // Load cities if state is selected
          if (formData?.gi_province) {
            const citiesRes = await axios.get(`${API_URL}/location/cities?state_id=${formData.gi_province}`);
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

  const handleSave = async (submitStatus: number = 1) => {
    if (!leadId) return;

    setSaving(true);
    setSuccessMessage(null);
    try {
      const dataToSave = { ...form, submit_status: submitStatus };
      await axios.put(`${API_URL}/public/forms/meeting-calendar/${leadId}`, dataToSave);
      setForm({ ...form, submit_status: submitStatus });

      if (submitStatus === 2) {
        setSuccessMessage('Meeting schedule submitted successfully! You can still edit and update the form anytime.');
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

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (form && Object.keys(form).length > 0 && !saving) {
        // Silent auto-save (draft)
        axios.put(`${API_URL}/public/forms/meeting-calendar/${leadId}`, { ...form, submit_status: 1 }).catch(() => {});
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [form, leadId, saving]);

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
    label: { fontSize: '10px', fontWeight: 400, color: '#212529c7', padding: '3px 5px', fontFamily: "'Raleway', sans-serif", width: '120px', display: 'inline-block' },
    labelBlue: { fontSize: '10px', fontWeight: 400, color: '#0062FF', padding: '3px 5px', fontFamily: "'Raleway', sans-serif", width: '120px', display: 'inline-block' },
    input: { fontSize: '10px', padding: '2px 6px', height: '22px', border: '1px solid #ced4da', borderRadius: '4px', flex: 1 },
    select: { fontSize: '10px', padding: '2px 6px', height: '22px', border: '1px solid #ced4da', borderRadius: '4px', flex: 1 },
    btnSave: { background: '#5CD259', color: '#fff', borderRadius: '50%', fontSize: '25px', padding: '3px 10px', border: '2px solid #5CD259', cursor: 'pointer', height: '50px', width: '50px', position: 'fixed' as const, bottom: '30px', right: '50px' },
  };

  const getCountryName = (id: number) => countries.find((c) => c.id === id)?.name || '';
  const getStateName = (id: number) => states.find((s) => s.id === id)?.name || '';
  const getCityName = (id: number) => cities.find((c) => c.id === id)?.name || '';

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
        {form.submit_status === 2 && !successMessage && (
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

        <h4 style={{ marginBottom: '16px', marginTop: '16px', fontSize: '1rem' }}>
          Meeting Date & Time
        </h4>

        {/* General Information Section */}
        <h3 style={{ ...styles.sectionTitle, color: '#212529d1', marginLeft: '21px', marginTop: '15px' }}>
          General Information
        </h3>
        <div style={{ paddingLeft: '26px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {/* Left Column */}
            <div style={{ flex: '1', minWidth: '300px', paddingRight: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <label style={styles.labelBlue}>Key Person's Name:</label>
                <input type="text" value={form.gi_name || ''} style={{ ...styles.input, backgroundColor: '#e9ecef' }} readOnly />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <label style={styles.labelBlue}>Company Name:</label>
                <input type="text" value={form.gi_company || ''} style={{ ...styles.input, backgroundColor: '#e9ecef' }} readOnly />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <label style={styles.labelBlue}>Address:</label>
                <input type="text" value={form.gi_address || ''} style={{ ...styles.input, backgroundColor: '#e9ecef' }} readOnly />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <label style={styles.labelBlue}>Country:</label>
                <input type="text" value={getCountryName(form.gi_country)} style={{ ...styles.input, backgroundColor: '#e9ecef' }} readOnly />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <label style={styles.labelBlue}>Province:</label>
                <input type="text" value={getStateName(form.gi_province)} style={{ ...styles.input, backgroundColor: '#e9ecef' }} readOnly />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <label style={styles.labelBlue}>City:</label>
                <input type="text" value={getCityName(form.gi_city)} style={{ ...styles.input, backgroundColor: '#e9ecef' }} readOnly />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <label style={styles.labelBlue}>Postal Code:</label>
                <input type="text" value={form.gi_postal || ''} style={{ ...styles.input, backgroundColor: '#e9ecef' }} readOnly />
              </div>
            </div>

            {/* Right Column */}
            <div style={{ flex: '1', minWidth: '300px', paddingLeft: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <label style={styles.labelBlue}>Company Phone:</label>
                <input type="text" value={form.gi_phone || ''} style={{ ...styles.input, backgroundColor: '#e9ecef' }} readOnly />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <label style={styles.labelBlue}>EXT:</label>
                <input type="text" value={form.gi_ext || ''} style={{ ...styles.input, backgroundColor: '#e9ecef' }} readOnly />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <label style={styles.labelBlue}>Fax:</label>
                <input type="text" value={form.gi_fax || ''} style={{ ...styles.input, backgroundColor: '#e9ecef' }} readOnly />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <label style={styles.labelBlue}>Email:</label>
                <input type="text" value={form.gi_email || ''} style={{ ...styles.input, backgroundColor: '#e9ecef' }} readOnly />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <label style={styles.labelBlue}>Website:</label>
                <input type="text" value={form.gi_website || ''} style={{ ...styles.input, backgroundColor: '#e9ecef' }} readOnly />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <label style={styles.labelBlue}>Any Branch Office:</label>
                <input type="text" value={form.gi_branch_office || ''} style={{ ...styles.input, backgroundColor: '#e9ecef' }} readOnly />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <label style={styles.labelBlue}>Branch Address:</label>
                <input type="text" value={form.gi_branch_address || ''} style={{ ...styles.input, backgroundColor: '#e9ecef' }} readOnly />
              </div>
            </div>
          </div>
        </div>

        {/* Arrange Meeting Session */}
        <h3 style={{ ...styles.sectionTitle, color: '#212529d1', marginLeft: '21px', marginTop: '15px' }}>
          Arrange Meeting Session
        </h3>
        <div style={{ paddingLeft: '26px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {/* Left Column */}
            <div style={{ flex: '1', minWidth: '300px', paddingRight: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <label style={styles.labelBlue}>Preferred Date:</label>
                <input
                  type="date"
                  value={form.prefered_date2 || ''}
                  onChange={(e) => updateForm('prefered_date2', e.target.value)}
                  style={styles.input}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <label style={styles.labelBlue}>Preferred Time:</label>
                <input
                  type="time"
                  value={form.prefered_time2 || ''}
                  onChange={(e) => updateForm('prefered_time2', e.target.value)}
                  style={styles.input}
                  placeholder="HH:MM"
                />
              </div>
            </div>

            {/* Right Column */}
            <div style={{ flex: '1', minWidth: '300px', paddingLeft: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <label style={styles.labelBlue}>Remark:</label>
                <input
                  type="text"
                  value={form.gi_remark2 || ''}
                  onChange={(e) => updateForm('gi_remark2', e.target.value)}
                  style={styles.input}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <label style={styles.labelBlue}>TimeZone:</label>
                <select
                  value={form.timezone2 || ''}
                  onChange={(e) => updateForm('timezone2', parseInt(e.target.value) || null)}
                  style={styles.select}
                >
                  <option value="">Select TimeZone</option>
                  {TIMEZONES.map((tz) => (
                    <option key={tz.id} value={tz.id}>
                      {tz.timezone} ({tz.utc_offset})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Save Button */}
        <button
          type="button"
          onClick={() => handleSave(1)}
          disabled={saving}
          style={styles.btnSave}
          title="Save"
        >
          {saving ? (
            <span style={{ fontSize: '14px' }}>...</span>
          ) : (
            <span style={{ fontSize: '20px' }}>&#128190;</span>
          )}
        </button>

        {/* Submit Button */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            type="button"
            onClick={() => handleSave(2)}
            disabled={saving}
            style={{
              background: '#5CD259',
              color: '#fff',
              borderRadius: '3px',
              fontSize: '12px',
              padding: '8px 20px',
              border: '2px solid #5CD259',
              cursor: 'pointer'
            }}
          >
            {saving ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}
