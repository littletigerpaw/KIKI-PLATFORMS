'use client';

const securityFeatures = [
  'Multi-factor authentication required for all merchant logins',
  'Tenant-scoped access ensures each merchant only sees their store data',
  'Secure wallet and billing details stay isolated from other merchants',
  'Password and session policies are managed centrally by the platform',
];

const planDetails = [
  { label: 'Plan', value: 'Pro Merchant' },
  { label: 'Billing', value: '$49 / month' },
  { label: 'Status', value: 'Active' },
  { label: 'Member since', value: 'March 2025' },
];

const merchantBenefits = [
  'Custom storefront publishing',
  'Branding and domain controls',
  'Advanced reporting and analytics',
  'Membership and subscription tools',
  'Secure login and team roles',
];

export function MembershipHub() {
  return (
    <main style={{ minHeight: '100vh', background: '#f5f7fb', padding: '32px 24px 64px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <header style={{ background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)', color: '#fff', borderRadius: '28px', padding: '30px 28px', boxShadow: '0 22px 50px rgba(15,23,42,0.14)' }}>
          <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.75 }}>Membership area</div>
          <h1 style={{ margin: '12px 0 10px', fontSize: '2.6rem' }}>Merchant account & access</h1>
          <p style={{ margin: 0, maxWidth: '700px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>
            Secure member access for every merchant account, with data isolation, wallet protection, MFA, and a clear purchase history tied to the tenant that owns the store.
          </p>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '22px', marginTop: '24px' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '22px', padding: '24px' }}>
            <h2 style={{ margin: '0 0 18px', fontSize: '1.5rem' }}>Account summary</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
              {planDetails.map((item) => (
                <div key={item.label} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ color: '#6b7280', fontSize: '13px' }}>{item.label}</div>
                  <div style={{ marginTop: '8px', fontSize: '1.1rem', fontWeight: 800 }}>{item.value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px' }}>
              <h3 style={{ margin: '0 0 12px' }}>Merchant benefits included</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                {merchantBenefits.map((benefit) => (
                  <div key={benefit} style={{ background: '#ecfdf5', color: '#065f46', borderRadius: '10px', padding: '10px 12px', fontWeight: 700 }}>
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '22px', padding: '24px' }}>
            <h2 style={{ margin: '0 0 18px', fontSize: '1.5rem' }}>Security status</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {securityFeatures.map((feature) => (
                <div key={feature} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px 14px', color: '#374151', lineHeight: 1.6 }}>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
