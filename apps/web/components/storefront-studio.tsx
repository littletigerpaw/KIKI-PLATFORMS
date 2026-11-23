'use client';

import { useState } from 'react';

const starterSections = [
  'Hero banner',
  'Featured products',
  'Brand story',
  'Customer reviews',
  'Membership CTA',
  'Footer links',
];

export function StorefrontStudio() {
  const [sections, setSections] = useState(starterSections);
  const [brandColor, setBrandColor] = useState('#4f46e5');
  const [accentColor, setAccentColor] = useState('#f59e0b');
  const [ctaText, setCtaText] = useState('Shop the collection');

  const addSection = () => {
    setSections((current) => [...current, `New section ${current.length + 1}`]);
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f5f7fb', padding: '32px 24px 64px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <header style={{ background: '#0f172a', color: '#fff', borderRadius: '24px', padding: '28px 30px' }}>
          <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.75 }}>Storefront studio</div>
          <h1 style={{ margin: '12px 0 0', fontSize: '2.6rem' }}>Design your merchant storefront</h1>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: '0.95fr 1.05fr', gap: '22px', marginTop: '24px' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '22px', padding: '22px' }}>
            <h2 style={{ margin: '0 0 18px', fontSize: '1.4rem' }}>Studio controls</h2>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Primary color</label>
                <input type="color" value={brandColor} onChange={(event) => setBrandColor(event.target.value)} style={{ width: '100%', height: '44px', border: '1px solid #d1d5db', borderRadius: '12px', background: '#fff' }} />
              </div>

              <div>
                <label style={labelStyle}>Accent color</label>
                <input type="color" value={accentColor} onChange={(event) => setAccentColor(event.target.value)} style={{ width: '100%', height: '44px', border: '1px solid #d1d5db', borderRadius: '12px', background: '#fff' }} />
              </div>

              <div>
                <label style={labelStyle}>Primary CTA text</label>
                <input value={ctaText} onChange={(event) => setCtaText(event.target.value)} style={inputStyle} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={labelStyle}>Page sections</label>
                  <button type="button" onClick={addSection} style={{ background: '#eef2ff', color: '#3730a3', border: 'none', borderRadius: '10px', padding: '8px 12px', fontWeight: 700 }}>Add section</button>
                </div>

                <div style={{ display: 'grid', gap: '10px' }}>
                  {sections.map((section) => (
                    <div key={section} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px 14px', fontWeight: 600, color: '#374151' }}>
                      {section}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '22px', padding: '22px' }}>
            <h2 style={{ margin: '0 0 18px', fontSize: '1.4rem' }}>Live preview</h2>
            <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '18px', padding: '18px' }}>
              <div style={{ background: brandColor, color: '#fff', borderRadius: '18px', padding: '24px 18px' }}>
                <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.8 }}>Merchant brand</div>
                <h3 style={{ margin: '12px 0 10px', fontSize: '2rem' }}>Build your digital storefront</h3>
                <p style={{ margin: 0, opacity: 0.9 }}>Sell products, bookings, subscriptions, and experiences from one branded experience.</p>
                <button style={{ background: '#fff', color: '#111827', border: 'none', borderRadius: '12px', padding: '12px 18px', marginTop: '18px', fontWeight: 800 }}>{ctaText}</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px', marginTop: '18px' }}>
                {[1,2,3].map((item) => (
                  <div key={item} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px' }}>
                    <div style={{ height: '90px', borderRadius: '10px', background: accentColor, opacity: 0.2 }} />
                    <div style={{ marginTop: '10px', fontWeight: 800 }}>Signature item {item}</div>
                    <div style={{ color: '#6b7280', marginTop: '6px' }}>$89</div>
                  </div>
                ))}
              </div>
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
