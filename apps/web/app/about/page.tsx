const benefits = [
  {
    title: 'Built for operating businesses, not just storefronts',
    description: 'KIKI brings together storefronts, products, orders, mobile apps, team permissions, and subscriptions into a single operating layer.',
  },
  {
    title: 'White-label by design',
    description: 'Merchants can launch under their own brand, custom domain, and storefront theme without rebuilding their business stack from scratch.',
  },
  {
    title: 'Modular growth',
    description: 'Start with commerce, then expand into travel, restaurant ordering, appointments, memberships, and digital products as the business grows.',
  },
  {
    title: 'Shared infrastructure with tenant isolation',
    description: 'The platform shares the underlying software and cloud architecture while keeping each merchant’s data, permissions, and workflows separated.',
  },
];

const categories = [
  'E-commerce for brands and product businesses',
  'Booking and appointment workflows for local businesses',
  'Travel and tour packages with guided experiences',
  'Restaurants and ordering experiences',
  'Memberships, digital products, and subscriptions',
  'Multi-store operations and app publishing',
];

export default function AboutPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#f5f7fb', padding: '40px 24px', color: '#111827' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <section style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280' }}>About KIKI</div>
          <h1 style={{ margin: '12px 0 16px', fontSize: '3rem', lineHeight: 1.1 }}>A platform built to help merchants launch and scale their business.</h1>
          <p style={{ maxWidth: '960px', color: '#4b5563', fontSize: '1.08rem', lineHeight: 1.8 }}>
            KIKI is a merchant SaaS platform designed for businesses that want an online store, a branded mobile app, order management, bookings, and operations tools without needing a custom software team.
          </p>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '28px' }}>
          {benefits.map((benefit) => (
            <div key={benefit.title} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '18px', padding: '22px' }}>
              <h2 style={{ margin: '0 0 10px', fontSize: '22px' }}>{benefit.title}</h2>
              <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.7 }}>{benefit.description}</p>
            </div>
          ))}
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '18px', padding: '24px' }}>
            <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280' }}>Product focus</div>
            <h2 style={{ margin: '12px 0 18px', fontSize: '28px' }}>What the platform supports</h2>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#374151', lineHeight: 1.9 }}>
              {categories.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div style={{ background: '#111827', color: '#ffffff', borderRadius: '18px', padding: '24px' }}>
            <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.8 }}>Platform value</div>
            <h2 style={{ margin: '12px 0 18px', fontSize: '28px' }}>The real advantage is speed and consistency.</h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
              Instead of building a separate system for each merchant, KIKI gives businesses a shared software foundation that can be branded, configured, and extended into new verticals without rebuilding the platform every time.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
