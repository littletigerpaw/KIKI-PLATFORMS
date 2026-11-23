'use client';

import { useState } from 'react';

export function MobileAppConsole() {
  const [publishStatus, setPublishStatus] = useState('Draft');
  const [bundleId, setBundleId] = useState('com.novaatelier.store');
  const [platform, setPlatform] = useState('iOS + Android');

  return (
    <main style={{ minHeight: '100vh', background: '#f5f7fb', padding: '32px 24px 64px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <header style={{ background: '#111827', color: '#fff', borderRadius: '24px', padding: '28px 30px' }}>
          <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.75 }}>Mobile app</div>
          <h1 style={{ margin: '12px 0 0', fontSize: '2.5rem' }}>App publishing and brand settings</h1>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px', marginTop: '24px' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '22px', padding: '22px' }}>
            <h2 style={{ margin: '0 0 18px', fontSize: '1.4rem' }}>App configuration</h2>
            <div style={{ display: 'grid', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Bundle ID</label>
                <input value={bundleId} onChange={(event) => setBundleId(event.target.value)} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Platform</label>
                <select value={platform} onChange={(event) => setPlatform(event.target.value)} style={inputStyle}>
                  <option value="iOS + Android">iOS + Android</option>
                  <option value="Android">Android</option>
                  <option value="iOS">iOS</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Publish status</label>
                <select value={publishStatus} onChange={(event) => setPublishStatus(event.target.value)} style={inputStyle}>
                  <option value="Draft">Draft</option>
                  <option value="Ready for review">Ready for review</option>
                  <option value="Live">Live</option>
                </select>
              </div>

              <button type="button" onClick={() => setPublishStatus('Ready for review')} style={{ background: '#111827', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px 16px', fontWeight: 700 }}>
                Submit for review
              </button>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '22px', padding: '22px' }}>
            <h2 style={{ margin: '0 0 18px', fontSize: '1.4rem' }}>Preview</h2>
            <div style={{ background: '#0f172a', color: '#fff', borderRadius: '18px', padding: '18px', minHeight: '250px' }}>
              <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.8 }}>Brand mobile</div>
              <h3 style={{ margin: '16px 0 10px', fontSize: '2rem' }}>Nova Atelier</h3>
              <div style={{ background: '#1e293b', borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>Featured offers</div>
              <div style={{ background: '#1e293b', borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>Bookings</div>
              <div style={{ background: '#1e293b', borderRadius: '12px', padding: '14px' }}>Membership perks</div>
              <div style={{ marginTop: '18px', fontWeight: 700, color: '#cbd5e1' }}>Status: {publishStatus}</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: 700,
  color: '#374151',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #d1d5db',
  borderRadius: '12px',
  padding: '12px 14px',
  fontSize: '15px',
  background: '#fff',
  color: '#111827',
};
