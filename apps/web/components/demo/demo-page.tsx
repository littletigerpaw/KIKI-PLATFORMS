'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import DemoStoreModal from './demo-store-modal';
import DemoStorePreview from './demo-store-preview';

const demoShowcase = [
  {
    title: 'E-commerce storefronts',
    description: 'Launch fully branded online stores with catalogs, product variants, promotions, and orders.',
  },
  {
    title: 'Bookings and appointments',
    description: 'Turn service businesses into online booking engines for reservations, appointments, and schedules.',
  },
  {
    title: 'Travel & tours',
    description: 'Sell packages, itinerary add-ons, departures, and guided tours from one operational dashboard.',
  },
  {
    title: 'Restaurants & local brands',
    description: 'Offer menu ordering, reservations, local delivery setup, and brand-specific customer experiences.',
  },
];

const steps = [
  'Create your merchant account and choose your business type.',
  'Customize your storefront, branding, domain, and product catalog.',
  'Launch your store, mobile app, and operations tools in a single workflow.',
];

const defaultDemo = {
  storeName: 'Nova Atelier',
  domain: 'novaatelier.kiki',
  businessType: 'Lifestyle & retail',
  service: 'E-commerce storefront',
  products: 'Hand-poured candles, skincare sets, curated gift boxes',
  headline: 'Curated essentials for everyday rituals',
  subtitle: 'Thoughtful products for slower mornings, warm homes, and elevated routines.',
};

export default function DemoPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(defaultDemo);

  const handleSubmit = () => {
    const params = new URLSearchParams({
      storeName: form.storeName,
      domain: form.domain,
      businessType: form.businessType,
      service: form.service,
      products: form.products,
      headline: form.headline,
      subtitle: form.subtitle,
    });

    setIsOpen(false);
    router.push(`/demo/preview?${params.toString()}`);
  };

  const previewProducts = useMemo(() => {
    return form.products
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 4);
  }, [form.products]);

  const updateField = (field: keyof typeof defaultDemo, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f5f7fb', padding: '40px 24px', color: '#111827' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <section style={{ background: 'linear-gradient(135deg, #111827 0%, #312e81 100%)', color: '#ffffff', borderRadius: '28px', padding: '40px', marginBottom: '28px' }}>
          <div style={{ fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.8 }}>Platform demonstration</div>
          <h1 style={{ margin: '14px 0 18px', fontSize: '3rem', lineHeight: 1.1 }}>See what KIKI can power for your business.</h1>
          <p style={{ maxWidth: '760px', fontSize: '1.08rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.8)' }}>
            KIKI is a white-label merchant platform that helps businesses launch storefronts, app experiences, bookings, and operations tools from one shared backbone.
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '22px', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{ background: '#ffffff', color: '#111827', padding: '12px 18px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700 }}>Start free</Link>
            <Link href="/about" style={{ border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '12px 18px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700 }}>Learn more</Link>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.5)', color: '#fff', padding: '12px 18px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              Demo store
            </button>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '28px' }}>
          {demoShowcase.map((item) => (
            <div key={item.title} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '18px', padding: '24px', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)' }}>
              <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280' }}>Use case</div>
              <h2 style={{ margin: '12px 0 10px', fontSize: '24px' }}>{item.title}</h2>
              <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.6 }}>{item.description}</p>
            </div>
          ))}
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '28px' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '18px', padding: '24px' }}>
            <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280' }}>Demo flow</div>
            <h2 style={{ margin: '12px 0 18px', fontSize: '28px' }}>How a merchant gets started</h2>
            <div style={{ display: 'grid', gap: '14px' }}>
              {steps.map((step, index) => (
                <div key={step} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '14px 16px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '999px', background: '#111827', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700 }}>{index + 1}</div>
                  <div style={{ color: '#374151', lineHeight: 1.6 }}>{step}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#eef2ff', border: '1px solid #dfe3ff', borderRadius: '18px', padding: '24px' }}>
            <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4f46e5' }}>Why merchants choose KIKI</div>
            <h2 style={{ margin: '12px 0 18px', fontSize: '28px' }}>One platform, many business models.</h2>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#374151', lineHeight: 1.8 }}>
              <li>Launch stores, apps, and booking products from one dashboard.</li>
              <li>Brand the experience to match the merchant’s identity.</li>
              <li>Manage products, orders, billing, and permissions in one place.</li>
              <li>Scale into travel, restaurants, memberships, and digital goods later.</li>
            </ul>
          </div>
        </section>

        <DemoStorePreview
          form={form}
          previewProducts={previewProducts}
          onEdit={() => setIsOpen(true)}
        />
      </div>

      <DemoStoreModal
        isOpen={isOpen}
        form={form}
        onClose={() => setIsOpen(false)}
        onChange={updateField}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
