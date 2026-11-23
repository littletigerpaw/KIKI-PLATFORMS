import Link from 'next/link';
import { StorefrontPreview } from '@/components/storefront-preview';

export default function StorePage() {
  return (
    <main style={{ padding: '40px 24px', background: '#f5f7fb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#6b7280' }}>Store preview</div>
            <h1 style={{ margin: '8px 0 0', fontSize: '32px' }}>Brand storefront</h1>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/dashboard" style={{ background: '#ffffff', border: '1px solid #e5e7eb', color: '#111827', textDecoration: 'none', borderRadius: '10px', padding: '10px 14px', fontWeight: 700 }}>Back to dashboard</Link>
            <Link href="/onboarding" style={{ background: '#111827', color: '#fff', textDecoration: 'none', borderRadius: '10px', padding: '10px 14px', fontWeight: 700 }}>Create another store</Link>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          {[
            { label: 'Catalog', value: '128 products' },
            { label: 'Bookings', value: '16 active' },
            { label: 'Mobile app', value: 'Ready for review' },
            { label: 'Domain', value: 'novaatelier.com' },
          ].map((stat) => (
            <div key={stat.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '16px' }}>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#6b7280' }}>{stat.label}</div>
              <div style={{ marginTop: '8px', fontSize: '22px', fontWeight: 700 }}>{stat.value}</div>
            </div>
          ))}
        </div>

        <StorefrontPreview />
      </div>
    </main>
  );
}
