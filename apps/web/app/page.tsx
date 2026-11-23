import Link from 'next/link';

const categoryCards = [
  {
    title: 'E-commerce',
    description: 'Launch a storefront, manage inventory, and sell from your branded digital space.',
  },
  {
    title: 'Bookings',
    description: 'Offer calendars, appointments, reservations, and scheduling tools for service businesses.',
  },
  {
    title: 'Travel & tours',
    description: 'Sell itineraries, tours, excursions, and guided experiences from one operating system.',
  },
  {
    title: 'Restaurants',
    description: 'Run orders, reservations, delivery flows, and customer experiences under one brand.',
  },
];

const valuePillars = [
  'Launch faster with merchant-ready templates',
  'Customize branding, domain, and storefront layouts',
  'Manage billing, team access, and operations in one dashboard',
  'Expand into new business models as your company grows',
];

export default function HomePage() {
  return (
    <main style={{ padding: '3rem', fontFamily: 'sans-serif', background: '#f5f7fb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <section style={{ background: 'linear-gradient(135deg, #111827 0%, #312e81 100%)', color: '#fff', borderRadius: '28px', padding: '40px', boxShadow: '0 24px 60px rgba(17,24,39,0.2)' }}>
          <div style={{ fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.8 }}>Merchant SaaS platform</div>
          <h1 style={{ margin: '14px 0 16px', fontSize: '3rem', lineHeight: 1.1 }}>Turn any business into a branded commerce and operations platform.</h1>
          <p style={{ maxWidth: '760px', fontSize: '1.1rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.8)' }}>
            KIKI gives merchants a shared system for storefronts, product catalogs, bookings, subscriptions, mobile apps, and team workflows without custom software rebuilds.
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '22px', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{ background: '#ffffff', color: '#111827', padding: '12px 18px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700 }}>Create merchant account</Link>
            <Link href="/dashboard" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '12px 18px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700 }}>Open merchant dashboard</Link>
            <Link href="/demo" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '12px 18px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700 }}>See the demo</Link>
          </div>
        </section>

        <section style={{ marginTop: '2rem', display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {categoryCards.map((card) => (
            <div key={card.title} style={{ border: '1px solid #dfe7f1', borderRadius: '16px', padding: '1.25rem', background: '#ffffff', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)' }}>
              <strong style={{ display: 'block', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{card.title}</strong>
              <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.5 }}>{card.description}</p>
            </div>
          ))}
        </section>

        <section style={{ marginTop: '2.5rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '20px', padding: '28px' }}>
          <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280' }}>Why merchants choose KIKI</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '18px' }}>
            {valuePillars.map((pillar) => (
              <div key={pillar} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '16px', color: '#374151', lineHeight: 1.6 }}>
                {pillar}
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: '2.5rem', display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          <Link href="/merchant" style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '1rem', background: '#fff', color: '#111827', textDecoration: 'none' }}>
            <strong>Merchant portal</strong>
            <p>After signup and purchase, merchants land here to build products, launch storefronts, and manage performance.</p>
          </Link>

          <Link href="/owner" style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '1rem', background: '#fff', color: '#111827', textDecoration: 'none' }}>
            <strong>Platform ownership</strong>
            <p>Review merchant networks, subscriptions, and platform-level access from the owner control center.</p>
          </Link>

          <Link href="/membership" style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '1rem', background: '#fff', color: '#111827', textDecoration: 'none' }}>
            <strong>Membership security</strong>
            <p>Each merchant account is isolated, MFA-protected, and scoped to their own purchase, store, and billing data.</p>
          </Link>
        </section>
      </div>
    </main>
  );
}
