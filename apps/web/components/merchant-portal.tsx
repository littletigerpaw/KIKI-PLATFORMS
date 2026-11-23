'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { apiFetch } from '@/lib/api';
import { useRequireAuth } from '@/lib/use-auth';

type MerchantSession = {
  merchantId?: string;
  storeId?: string;
  merchantName: string;
  storeName: string;
  businessType: string;
  email: string;
  tenantId: string;
  plan: string;
};

const defaultSession: MerchantSession = {
  merchantName: 'Your merchant account',
  storeName: 'Your storefront',
  businessType: 'commerce',
  email: 'merchant@brand.com',
  tenantId: 'tenant-local-demo',
  plan: 'Pro merchant',
};

const businessCopy: Record<string, { label: string; subtitle: string; modules: string[]; widgets: string[] }> = {
  commerce: {
    label: 'Commerce business',
    subtitle: 'Own-product storefront',
    modules: ['Storefront builder', 'Catalog & inventory', 'Customers & emails', 'Orders & fulfillment'],
    widgets: ['Hero banner', 'Featured products', 'Testimonials', 'Brand story', 'Checkout CTA'],
  },
  dropshipping: {
    label: 'Dropshipping business',
    subtitle: 'Supplier fulfillment workflow',
    modules: ['Supplier product sync', 'Profit tracking', 'Stock alerts', 'Shipping rules'],
    widgets: ['Best sellers', 'Supplier highlights', 'Bundle offers', 'Shipping promise', 'FAQ'],
  },
  restaurant: {
    label: 'Restaurant brand',
    subtitle: 'Food ordering & reservation flow',
    modules: ['Menu editor', 'Ordering tools', 'Reservations', 'Pickup & delivery'],
    widgets: ["Today's specials", 'Popular dishes', 'Reviews', 'Order CTA', 'Location hours'],
  },
  booking: {
    label: 'Bookings & services',
    subtitle: 'Appointments and experiences',
    modules: ['Calendar booking', 'Availability rules', 'Appointment payments', 'Service packages'],
    widgets: ['Service cards', 'Availability', 'Success stories', 'Pricing', 'Book now'],
  },
};

const metrics = [
  { label: 'Revenue', value: '$34,280', change: '+18.4%' },
  { label: 'Orders', value: '1,284', change: '+12.2%' },
  { label: 'Conversion', value: '4.9%', change: '+0.8%' },
  { label: 'Active customers', value: '7,942', change: '+26.1%' },
];

const recentActivity = [
  { text: 'New preorder campaign launched for the premium bundle', time: '12 mins ago' },
  { text: 'Inventory sync completed across 3 product groups', time: '1 hour ago' },
  { text: 'Membership page updated with early-access offer', time: '2 hours ago' },
  { text: 'Custom domain added and verified for the storefront', time: 'Yesterday' },
];

const customerAccounts = [
  { name: 'Ava Thompson', status: 'Active', orders: 18, lastOrder: '2 hours ago', type: 'VIP customer' },
  { name: 'Marcus Lee', status: 'Pending', orders: 6, lastOrder: 'Yesterday', type: 'New account' },
  { name: 'Sofia Ramos', status: 'Active', orders: 32, lastOrder: 'Today', type: 'Repeat buyer' },
];

const employeeAccounts = [
  { name: 'Jordan Chen', role: 'Store manager', status: 'Active', permissions: 'Orders, inventory, staff' },
  { name: 'Priya Patel', role: 'Marketing lead', status: 'Active', permissions: 'Campaigns, contacts, content' },
  { name: 'Luis Gomez', role: 'Support agent', status: 'Pending', permissions: 'Tickets, refunds, chat' },
];

export function MerchantPortal() {
  const [session, setSession] = useState<MerchantSession>(defaultSession);
  const [merchantSummary, setMerchantSummary] = useState({ store_count: 1, product_count: 0, team_member_count: 0 });
  const auth = useRequireAuth();

  useEffect(() => {
    if (!auth) return;
    try {
      const raw = window.localStorage.getItem('kiki-merchant-session');
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<MerchantSession>;
        setSession({
          ...defaultSession,
          ...parsed,
        });

        if (parsed.merchantId) {
          apiFetch(`/merchants/${parsed.merchantId}/summary`)
            .then((response) => (response.ok ? response.json() : null))
            .then((summary) => {
              if (summary) {
                setMerchantSummary({
                  store_count: Number(summary.store_count) || 0,
                  product_count: Number(summary.product_count) || 0,
                  team_member_count: Number(summary.team_member_count) || 0,
                });
              }
            })
            .catch(() => undefined);
        }
      }
    } catch {
      setSession(defaultSession);
    }
  }, [auth]);

  const profile = useMemo(() => businessCopy[session.businessType] || businessCopy.commerce, [session.businessType]);
  const liveMetrics = [
    { label: 'Stores', value: String(merchantSummary.store_count), change: 'Tenant count' },
    { label: 'Products', value: String(merchantSummary.product_count), change: 'Catalog health' },
    { label: 'Team members', value: String(merchantSummary.team_member_count), change: 'Roles assigned' },
    { label: 'Merchant plan', value: session.plan, change: 'Current subscription' },
  ];

  return (
    <main style={{ minHeight: '100vh', background: '#f5f7fb', padding: '32px 24px 64px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <header
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #312e81 100%)',
            borderRadius: '28px',
            padding: '28px 30px',
            color: '#fff',
            boxShadow: '0 22px 50px rgba(17, 24, 39, 0.18)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.75 }}>Private merchant workspace</div>
              <h1 style={{ margin: '12px 0 8px', fontSize: '2.5rem' }}>Welcome back, {session.merchantName}</h1>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px' }}>{profile.label} · {session.storeName}</div>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/products" style={{ background: '#fff', color: '#111827', border: 'none', borderRadius: '12px', padding: '12px 18px', fontWeight: 700, textDecoration: 'none' }}>Manage products</Link>
              <Link href="/studio" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid rgba(255,255,255,0.35)', color: '#fff', borderRadius: '12px', padding: '12px 18px', textDecoration: 'none', fontWeight: 700 }}>Design studio</Link>
              <Link href="/mobile" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid rgba(255,255,255,0.35)', color: '#fff', borderRadius: '12px', padding: '12px 18px', textDecoration: 'none', fontWeight: 700 }}>Mobile app</Link>
            </div>
          </div>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px', marginTop: '24px' }}>
          {(session.merchantId ? liveMetrics : metrics).map((metric) => (
            <div key={metric.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '18px', padding: '20px', boxShadow: '0 8px 24px rgba(15,23,42,0.03)' }}>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>{metric.label}</div>
              <div style={{ fontSize: '32px', fontWeight: 800, margin: '10px 0 6px' }}>{metric.value}</div>
              <div style={{ color: '#10b981', fontWeight: 700, fontSize: '13px' }}>{metric.change}</div>
            </div>
          ))}
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.9fr', gap: '22px', marginTop: '28px' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '22px', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{profile.subtitle}</h2>
              <button style={{ background: '#eef2ff', color: '#3730a3', border: 'none', borderRadius: '10px', padding: '8px 12px', fontWeight: 700 }}>Open builder</button>
            </div>

            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '18px', padding: '18px', marginBottom: '18px' }}>
              <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280' }}>This merchant account includes</div>
              <div style={{ marginTop: '12px', display: 'grid', gap: '10px' }}>
                {profile.widgets.map((widget) => (
                  <div key={widget} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px 14px', fontWeight: 600, color: '#374151' }}>
                    {widget}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              {recentActivity.map((item) => (
                <div key={item.text} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', padding: '12px 14px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontWeight: 600, color: '#374151' }}>{item.text}</div>
                  <div style={{ whiteSpace: 'nowrap', color: '#6b7280', fontSize: '13px' }}>{item.time}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gap: '20px' }}>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '18px', padding: '22px' }}>
              <h3 style={{ margin: '0 0 18px', fontSize: '1.2rem' }}>Business modules</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {profile.modules.map((module) => (
                  <div key={module} style={{ background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '12px 14px', fontWeight: 700, color: '#374151' }}>
                    {module}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '18px', padding: '22px' }}>
              <h3 style={{ margin: '0 0 18px', fontSize: '1.2rem' }}>Account & access</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ background: '#eef2ff', borderRadius: '12px', padding: '12px 14px' }}>
                  <div style={{ color: '#4338ca', fontWeight: 700 }}>Merchant ID</div>
                  <div style={{ marginTop: '6px', fontSize: '16px', fontWeight: 700 }}>{session.merchantId ?? 'demo-account'}</div>
                </div>
                <div style={{ background: '#ecfeff', borderRadius: '12px', padding: '12px 14px' }}>
                  <div style={{ color: '#0f766e', fontWeight: 700 }}>Store ID</div>
                  <div style={{ marginTop: '6px', fontSize: '16px', fontWeight: 700 }}>{session.storeId ?? 'demo-store'}</div>
                </div>
                <div style={{ background: '#f5f3ff', borderRadius: '12px', padding: '12px 14px' }}>
                  <div style={{ color: '#6d28d9', fontWeight: 700 }}>Tenant ID</div>
                  <div style={{ marginTop: '6px', fontSize: '16px', fontWeight: 700 }}>{session.tenantId}</div>
                </div>
                <div style={{ background: '#ecfeff', borderRadius: '12px', padding: '12px 14px' }}>
                  <div style={{ color: '#0f766e', fontWeight: 700 }}>Membership</div>
                  <div style={{ marginTop: '6px', fontSize: '18px', fontWeight: 700 }}>{session.plan}</div>
                </div>
                <div style={{ background: '#fef2f2', borderRadius: '12px', padding: '12px 14px' }}>
                  <div style={{ color: '#b91c1c', fontWeight: 700 }}>Privacy</div>
                  <div style={{ marginTop: '6px', fontSize: '18px', fontWeight: 700 }}>Only this merchant account can access customer and product data</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px', marginTop: '28px' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '22px', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Customer accounts</h2>
              <button style={{ background: '#ecfdf5', color: '#047857', border: 'none', borderRadius: '10px', padding: '8px 12px', fontWeight: 700 }}>Add customer</button>
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              {customerAccounts.map((customer) => (
                <div key={customer.name} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 800, color: '#111827' }}>{customer.name}</div>
                    <span style={{
                      background: customer.status === 'Active' ? '#dcfce7' : '#fef3c7',
                      color: customer.status === 'Active' ? '#166534' : '#92400e',
                      borderRadius: '999px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}>{customer.status}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280', gap: '12px' }}>
                    <span>{customer.type}</span>
                    <span>{customer.orders} orders</span>
                    <span>Last order: {customer.lastOrder}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '22px', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Employee accounts</h2>
              <button style={{ background: '#eef2ff', color: '#3730a3', border: 'none', borderRadius: '10px', padding: '8px 12px', fontWeight: 700 }}>Invite team</button>
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              {employeeAccounts.map((employee) => (
                <div key={employee.name} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: '#111827' }}>{employee.name}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{employee.role}</div>
                    </div>
                    <span style={{
                      background: employee.status === 'Active' ? '#dbeafe' : '#fef3c7',
                      color: employee.status === 'Active' ? '#1d4ed8' : '#92400e',
                      borderRadius: '999px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}>{employee.status}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#4b5563' }}>{employee.permissions}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
