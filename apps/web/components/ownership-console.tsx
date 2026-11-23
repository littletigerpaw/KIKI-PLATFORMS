'use client';

const merchantRows = [
  { name: 'Nova Atelier', plan: 'Pro', status: 'Active', region: 'United States', owner: 'Avery Stone' },
  { name: 'North Harbor Foods', plan: 'Growth', status: 'Active', region: 'Canada', owner: 'Mila Chen' },
  { name: 'Palm & Pine Travel', plan: 'Enterprise', status: 'Pending review', region: 'United Kingdom', owner: 'Connor Miles' },
  { name: 'Haven & Co. Studio', plan: 'Starter', status: 'Active', region: 'Australia', owner: 'Rae Brooks' },
];

const ownerControls = [
  { title: 'Platform access', description: 'Manage tenant visibility, permissions, and merchant-level admin rights.' },
  { title: 'Billing controls', description: 'Review invoicing, subscriptions, payouts, and platform revenue split.' },
  { title: 'Merchant isolation', description: 'Ensure each store and customer record remains locked to its merchant account.' },
  { title: 'Security oversight', description: 'Monitor MFA, attempted access, and policy enforcement across the platform.' },
];

export function OwnershipConsole() {
  return (
    <main style={{ minHeight: '100vh', background: '#f5f7fb', padding: '32px 24px 64px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <header style={{ background: '#111827', color: '#fff', borderRadius: '28px', padding: '28px 30px', boxShadow: '0 20px 50px rgba(17,24,39,0.15)' }}>
          <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.75 }}>Platform ownership</div>
          <h1 style={{ margin: '12px 0 0', fontSize: '2.6rem' }}>Owner control center</h1>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '18px', marginTop: '24px' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '18px', padding: '22px' }}>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Total merchants</div>
            <div style={{ fontSize: '34px', fontWeight: 800, margin: '10px 0 4px' }}>102,440</div>
            <div style={{ color: '#10b981', fontWeight: 700 }}>+1,284 this month</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '18px', padding: '22px' }}>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Active subscriptions</div>
            <div style={{ fontSize: '34px', fontWeight: 800, margin: '10px 0 4px' }}>81.3%</div>
            <div style={{ color: '#2563eb', fontWeight: 700 }}>Healthy retention</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '18px', padding: '22px' }}>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Platform revenue</div>
            <div style={{ fontSize: '34px', fontWeight: 800, margin: '10px 0 4px' }}>$2.6M</div>
            <div style={{ color: '#10b981', fontWeight: 700 }}>+14.2% MRR</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '18px', padding: '22px' }}>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Security status</div>
            <div style={{ fontSize: '34px', fontWeight: 800, margin: '10px 0 4px' }}>99.98%</div>
            <div style={{ color: '#10b981', fontWeight: 700 }}>MFA protected</div>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '22px', marginTop: '28px' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '22px', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Merchant network</h2>
              <button style={{ background: '#111827', color: '#fff', border: 'none', borderRadius: '10px', padding: '8px 12px', fontWeight: 700 }}>Export report</button>
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              {merchantRows.map((merchant) => (
                <div key={merchant.name} style={{ display: 'grid', gridTemplateColumns: '1.4fr .7fr .7fr .8fr', gap: '12px', alignItems: 'center', padding: '12px 14px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{merchant.name}</div>
                    <div style={{ color: '#6b7280', fontSize: '13px' }}>{merchant.owner}</div>
                  </div>
                  <div style={{ fontWeight: 700 }}>{merchant.plan}</div>
                  <div style={{ color: merchant.status === 'Active' ? '#047857' : '#b45309', fontWeight: 700 }}>{merchant.status}</div>
                  <div style={{ color: '#4b5563', fontWeight: 600 }}>{merchant.region}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '22px', padding: '22px' }}>
            <h2 style={{ margin: '0 0 18px', fontSize: '1.4rem' }}>Owner controls</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {ownerControls.map((control) => (
                <div key={control.title} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontWeight: 800, marginBottom: '8px' }}>{control.title}</div>
                  <div style={{ color: '#6b7280', lineHeight: 1.5 }}>{control.description}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
