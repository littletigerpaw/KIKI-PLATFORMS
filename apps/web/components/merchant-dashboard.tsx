'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { apiFetch, getWorkspace } from '@/lib/api';
import { useRequireAuth } from '@/lib/use-auth';
import { businessModules, dashboardStats, products as mockProducts, recentOrders, storefrontSections } from '@/lib/mock-data';

type MerchantRecord = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

type StoreRecord = {
  id: string;
  merchant_id: string;
  name: string;
  slug: string;
  domain?: string | null;
  status: string;
};

type ProductRecord = {
  id: string;
  store_id: string;
  name: string;
  description?: string | null;
  price: number;
  inventory: number;
  is_active: boolean;
};

type DashboardProduct = {
  id: string | number;
  name: string;
  price: string;
  stock: string;
  status: string;
};

type TabKey = 'overview' | 'products' | 'storefront' | 'mobile' | 'team' | 'settings';

export function MerchantDashboard() {
  const auth = useRequireAuth();
  const [merchantName, setMerchantName] = useState('Demo merchant');
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('Demo storefront');
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeDomain, setStoreDomain] = useState('your-brand.com');
  const [liveProducts, setLiveProducts] = useState<DashboardProduct[]>(mockProducts as DashboardProduct[]);
  const [isLiveDataLoaded, setIsLiveDataLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [isPublishing, setIsPublishing] = useState(false);
  const [mobileApp, setMobileApp] = useState({
    bundleId: 'com.merchant.nova-atelier-store',
    platform: 'android',
    publishStatus: 'draft',
  });
  const [teamMembers, setTeamMembers] = useState([
    { name: 'Avery Stone', email: 'avery@brand.com', role: 'Owner', permissions: ['Manage store', 'Billing', 'Team access'] },
    { name: 'Kait Lee', email: 'kait@brand.com', role: 'Manager', permissions: ['Products', 'Orders', 'Reports'] },
    { name: 'Milo Diaz', email: 'milo@brand.com', role: 'Member', permissions: ['View orders', 'View reports'] },
  ]);
  const [settings, setSettings] = useState({
    customDomain: 'your-brand.com',
    status: 'draft',
    businessType: 'commerce',
    theme: 'Minimal luxury',
    accentColor: '#4f46e5',
  });

  useEffect(() => {
    if (!auth) return;

    const loadDashboardData = async () => {
      try {
        const [merchantsResponse, storesResponse, productsResponse] = await Promise.all([
          apiFetch('/merchants'),
          apiFetch('/stores'),
          apiFetch('/products'),
        ]);

        if (!merchantsResponse.ok || !storesResponse.ok || !productsResponse.ok) {
          return;
        }

        const merchants = (await merchantsResponse.json()) as MerchantRecord[];
        const stores = (await storesResponse.json()) as StoreRecord[];
        const products = (await productsResponse.json()) as ProductRecord[];

        const workspace = getWorkspace();
        const merchant = merchants.find((item) => item.id === workspace?.merchantId) ?? merchants[0];
        const merchantStores = stores.filter((item) => item.merchant_id === merchant?.id);
        const store = merchantStores.find((item) => item.id === workspace?.storeId) ?? merchantStores[0];
        const storeProducts = products.filter((item) => item.store_id === store?.id);

        if (merchant) {
          setMerchantName(merchant.name);
          setMerchantId(merchant.id);
        }

        if (store) {
          setStoreName(store.name);
          setStoreDomain(store.domain || 'merchant-store.com');
          setStoreId(store.id);
        }

        if (merchant) {
          setLiveProducts(
            storeProducts.map((product) => ({
              id: product.id,
              name: product.name,
              price: `$${product.price.toFixed(2)}`,
              stock: `${product.inventory} in stock`,
              status: product.inventory < 10 ? 'Low stock' : 'Ready',
            })),
          );
        }
      } catch {
        // Leave the existing mock data in place when the local API is unavailable.
      } finally {
        setIsLiveDataLoaded(true);
      }
    };

    loadDashboardData();
  }, [auth]);

  useEffect(() => {
    if (!merchantId || !storeId) {
      return;
    }

    const loadAppStatus = async () => {
      try {
        const response = await apiFetch(`/merchants/${merchantId}/stores/${storeId}/mobile-app`);
        if (!response.ok) {
          return;
        }

        const payload = await response.json();
        setMobileApp({
          bundleId: payload.bundle_id,
          platform: payload.platform,
          publishStatus: payload.publish_status,
        });
      } catch {
        // Keep the static preview state if the app config endpoint is unavailable.
      }
    };

    loadAppStatus();
  }, [merchantId, storeId]);

  const displayProducts = useMemo(() => liveProducts, [liveProducts]);
  const statCards = useMemo(() => {
    const productCount = displayProducts.length;
    const liveStoreCount = isLiveDataLoaded ? 1 : 3;

    return [
      { label: 'Revenue', value: '$24.8k', delta: '+12.4%' },
      { label: 'Orders', value: '324', delta: '+8.1%' },
      { label: 'Products', value: String(productCount), delta: '+3 new' },
      { label: 'Stores', value: String(liveStoreCount), delta: 'Live' },
    ];
  }, [displayProducts.length, isLiveDataLoaded]);

  const publishChanges = async () => {
    if (!merchantId || !storeId) {
      return;
    }

    setIsPublishing(true);

    try {
      const response = await apiFetch(`/merchants/${merchantId}/stores/${storeId}/mobile-app`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: mobileApp.platform,
          publish_status: 'ready_for_review',
        }),
      });

      if (response.ok) {
        const payload = await response.json();
        setMobileApp({
          bundleId: payload.bundle_id,
          platform: payload.platform,
          publishStatus: payload.publish_status,
        });
      }
    } catch {
      setMobileApp((current) => ({ ...current, publishStatus: 'ready_for_review' }));
    } finally {
      setIsPublishing(false);
    }
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'products', label: 'Products' },
    { key: 'storefront', label: 'Studio' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'team', label: 'Membership' },
    { key: 'settings', label: 'E-commerce' },
  ] as const;

  const renderOverview = () => (
    <>
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {statCards.map((stat) => (
          <div key={stat.label} style={cardStyles}>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>{stat.label}</div>
            <div style={{ fontSize: '30px', fontWeight: 700, margin: '10px 0 4px' }}>{stat.value}</div>
            <div style={{ color: '#10b981', fontSize: '13px', fontWeight: 600 }}>{stat.delta}</div>
          </div>
        ))}
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={cardStyles}>
          <h2 style={{ margin: '0 0 18px', fontSize: '22px' }}>Business modules</h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {businessModules.map((module) => (
              <div key={module.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ fontWeight: 700 }}>{module.name}</div>
                <span style={{ background: module.status === 'Live' ? '#ecfdf5' : '#fef3c7', color: module.status === 'Live' ? '#047857' : '#b45309', borderRadius: '999px', padding: '6px 10px', fontSize: '12px', fontWeight: 700 }}>
                  {module.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={cardStyles}>
          <h2 style={{ margin: '0 0 18px', fontSize: '22px' }}>Store summary</h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ background: '#eef2ff', borderRadius: '12px', padding: '14px' }}>
              <div style={{ color: '#4f46e5', fontWeight: 700 }}>Domain</div>
              <div style={{ marginTop: '8px', fontSize: '18px' }}>{storeDomain}</div>
            </div>
            <div style={{ background: '#ecfeff', borderRadius: '12px', padding: '14px' }}>
              <div style={{ color: '#0f766e', fontWeight: 700 }}>Brand theme</div>
              <div style={{ marginTop: '8px', fontSize: '18px' }}>Minimal luxury</div>
            </div>
            <div style={{ background: '#fff7ed', borderRadius: '12px', padding: '14px' }}>
              <div style={{ color: '#c2410c', fontWeight: 700 }}>App status</div>
              <div style={{ marginTop: '8px', fontSize: '18px' }}>{mobileApp.publishStatus === 'ready_for_review' ? 'Ready for review' : 'Ready for preview'}</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );

  const renderProducts = () => (
    <section style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
      <div style={cardStyles}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h2 style={{ margin: 0, fontSize: '22px' }}>Products</h2>
          <button style={primaryButtonStyles}>Add product</button>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          {displayProducts.map((product) => (
            <div key={product.id} style={{ display: 'grid', gridTemplateColumns: '1.8fr 0.9fr 0.8fr 0.7fr', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px 14px' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{product.name}</div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>{product.stock}</div>
              </div>
              <div style={{ fontWeight: 600 }}>{product.price}</div>
              <div style={{ color: product.status === 'Low stock' ? '#f59e0b' : '#10b981', fontWeight: 600 }}>{product.status}</div>
              <button style={secondaryButtonStyles}>Edit</button>
            </div>
          ))}
        </div>
      </div>

      <div style={cardStyles}>
        <h2 style={{ margin: '0 0 18px', fontSize: '22px' }}>Quick actions</h2>
        <div style={{ display: 'grid', gap: '12px' }}>
          {['Bulk pricing', 'Inventory sync', 'Seasonal bundles'].map((label) => (
            <button key={label} style={{ ...secondaryButtonStyles, textAlign: 'left' }}>{label}</button>
          ))}
        </div>
      </div>
    </section>
  );

  const renderStorefront = () => (
    <section style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
      <div style={cardStyles}>
        <h2 style={{ margin: '0 0 18px', fontSize: '22px' }}>Storefront blocks</h2>
        <div style={{ display: 'grid', gap: '12px' }}>
          {storefrontSections.map((section) => (
            <div key={section} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px 14px', fontWeight: 600 }}>
              {section}
            </div>
          ))}
        </div>
      </div>

      <div style={cardStyles}>
        <h2 style={{ margin: '0 0 18px', fontSize: '22px' }}>Brand settings</h2>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ background: '#eef2ff', borderRadius: '12px', padding: '14px' }}>
            <div style={{ color: '#4f46e5', fontWeight: 700 }}>Theme</div>
            <div style={{ marginTop: '8px', fontSize: '18px' }}>Minimal luxury</div>
          </div>
          <div style={{ background: '#ecfeff', borderRadius: '12px', padding: '14px' }}>
            <div style={{ color: '#0f766e', fontWeight: 700 }}>Domain</div>
            <div style={{ marginTop: '8px', fontSize: '18px' }}>{storeDomain}</div>
          </div>
          <div style={{ background: '#fff7ed', borderRadius: '12px', padding: '14px' }}>
            <div style={{ color: '#c2410c', fontWeight: 700 }}>Store status</div>
            <div style={{ marginTop: '8px', fontSize: '18px' }}>Live and publishing</div>
          </div>
        </div>
      </div>
    </section>
  );

  const renderMobile = () => (
    <section style={{ marginBottom: '24px' }}>
      <div style={cardStyles}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h2 style={{ margin: 0, fontSize: '22px' }}>Mobile app publishing</h2>
          <button onClick={publishChanges} disabled={isPublishing || !merchantId || !storeId} style={{ ...primaryButtonStyles, opacity: isPublishing ? 0.7 : 1 }}>
            {isPublishing ? 'Publishing...' : 'Publish changes'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px' }}>
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280' }}>Bundle ID</div>
            <div style={{ marginTop: '8px', fontSize: '18px', fontWeight: 700 }}>{mobileApp.bundleId}</div>
          </div>
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280' }}>Platform</div>
            <div style={{ marginTop: '8px', fontSize: '18px', fontWeight: 700 }}>{mobileApp.platform.toUpperCase()}</div>
          </div>
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280' }}>Status</div>
            <div style={{ marginTop: '8px', fontSize: '18px', fontWeight: 700 }}>
              {mobileApp.publishStatus === 'ready_for_review' ? 'Ready for review' : 'Draft'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const renderTeam = () => (
    <section style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.9fr', gap: '20px', marginBottom: '24px' }}>
      <div style={cardStyles}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h2 style={{ margin: 0, fontSize: '22px' }}>Team access</h2>
          <button style={primaryButtonStyles}>Invite member</button>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          {teamMembers.map((member) => (
            <div key={member.email} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '14px', display: 'grid', gridTemplateColumns: '1.3fr 0.8fr 1.2fr', gap: '12px', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{member.name}</div>
                <div style={{ color: '#6b7280', fontSize: '13px' }}>{member.email}</div>
              </div>
              <span style={{ background: '#eef2ff', color: '#4338ca', borderRadius: '999px', padding: '6px 10px', fontSize: '12px', fontWeight: 700, textAlign: 'center' }}>
                {member.role}
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {member.permissions.map((permission) => (
                  <span key={permission} style={{ background: '#f3f4f6', borderRadius: '999px', padding: '5px 8px', fontSize: '11px', fontWeight: 600 }}>
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={cardStyles}>
        <h2 style={{ margin: '0 0 18px', fontSize: '22px' }}>Permission model</h2>
        <div style={{ display: 'grid', gap: '12px' }}>
          {[
            ['Owner', 'Full access to store, billing, team, and settings'],
            ['Manager', 'Products, orders, discounts, and reports'],
            ['Member', 'Read-only access for operations and reporting'],
          ].map(([role, summary]) => (
            <div key={role} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ fontWeight: 700 }}>{role}</div>
              <div style={{ color: '#6b7280', marginTop: '6px', lineHeight: 1.5 }}>{summary}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderSettings = () => (
    <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '24px' }}>
      <div style={cardStyles}>
        <h2 style={{ margin: '0 0 18px', fontSize: '22px' }}>Store configuration</h2>

        <div style={{ display: 'grid', gap: '14px' }}>
          <label style={{ display: 'grid', gap: '8px', fontWeight: 600 }}>
            Custom domain
            <input
              value={settings.customDomain}
              onChange={(event) => setSettings((current) => ({ ...current, customDomain: event.target.value }))}
              style={{ border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px', fontSize: '15px' }}
            />
          </label>

          <label style={{ display: 'grid', gap: '8px', fontWeight: 600 }}>
            Store status
            <select
              value={settings.status}
              onChange={(event) => setSettings((current) => ({ ...current, status: event.target.value }))}
              style={{ border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px', fontSize: '15px' }}
            >
              <option value="draft">Draft</option>
              <option value="live">Live</option>
              <option value="paused">Paused</option>
            </select>
          </label>

          <label style={{ display: 'grid', gap: '8px', fontWeight: 600 }}>
            Business type
            <select
              value={settings.businessType}
              onChange={(event) => setSettings((current) => ({ ...current, businessType: event.target.value }))}
              style={{ border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px', fontSize: '15px' }}
            >
              <option value="commerce">Commerce</option>
              <option value="booking">Booking</option>
              <option value="restaurant">Restaurant</option>
              <option value="travel">Travel & tours</option>
            </select>
          </label>

          <button onClick={async () => {
            if (!merchantId || !storeId) return;

            try {
              await apiFetch(`/merchants/${merchantId}/stores/${storeId}/settings`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  custom_domain: settings.customDomain,
                  status: settings.status,
                  business_type: settings.businessType,
                }),
              });
            } catch {
              // Keep the local configuration state for demo usage when the API is unavailable.
            }
          }} style={primaryButtonStyles}>
            Save settings
          </button>
        </div>
      </div>

      <div style={cardStyles}>
        <h2 style={{ margin: '0 0 18px', fontSize: '22px' }}>Branding</h2>
        <div style={{ display: 'grid', gap: '14px' }}>
          <label style={{ display: 'grid', gap: '8px', fontWeight: 600 }}>
            Theme
            <input
              value={settings.theme}
              onChange={(event) => setSettings((current) => ({ ...current, theme: event.target.value }))}
              style={{ border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px', fontSize: '15px' }}
            />
          </label>

          <label style={{ display: 'grid', gap: '8px', fontWeight: 600 }}>
            Accent color
            <input
              type="color"
              value={settings.accentColor}
              onChange={(event) => setSettings((current) => ({ ...current, accentColor: event.target.value }))}
              style={{ width: '100%', minHeight: '46px', border: '1px solid #d1d5db', borderRadius: '10px', padding: '6px', background: '#fff' }}
            />
          </label>

          <div style={{ background: 'linear-gradient(135deg, #fff 0%, #f3f4f6 100%)', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '18px' }}>
            <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280' }}>Brand preview</div>
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: settings.accentColor }} />
              <div>
                <div style={{ fontWeight: 700 }}>{merchantName}</div>
                <div style={{ color: '#6b7280', fontSize: '13px' }}>{settings.theme}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <main style={{ padding: '32px', background: '#f3f6fb', minHeight: '100vh', color: '#111827' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '20px',
            padding: '18px 24px',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Merchant dashboard
            </div>
            <h1 style={{ margin: '6px 0 0', fontSize: '28px' }}>{merchantName}</h1>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link href="/store" style={{ ...secondaryButtonStyles, display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
              View demo storefront
            </Link>
            <button onClick={publishChanges} disabled={isPublishing || !merchantId || !storeId} style={{ ...primaryButtonStyles, opacity: isPublishing ? 0.7 : 1 }}>
              {isPublishing ? 'Publishing...' : 'Publish changes'}
            </button>
          </div>
        </header>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: activeTab === tab.key ? '#111827' : '#ffffff',
                color: activeTab === tab.key ? '#ffffff' : '#111827',
                border: '1px solid #e5e7eb',
                borderRadius: '999px',
                padding: '10px 16px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'products' && renderProducts()}
        {activeTab === 'storefront' && renderStorefront()}
        {activeTab === 'mobile' && renderMobile()}
        {activeTab === 'team' && renderTeam()}
        {activeTab === 'settings' && renderSettings()}

        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={cardStyles}>
            <h2 style={{ margin: '0 0 18px', fontSize: '22px' }}>Recent orders</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {recentOrders.map((order) => (
                <div key={order.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px 14px', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700 }}>{order.id}</div>
                  <div>{order.customer}</div>
                  <div>{order.total}</div>
                  <span style={{ background: '#ecfdf5', color: '#047857', borderRadius: '999px', padding: '6px 10px', fontSize: '12px', fontWeight: 700 }}>{order.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={cardStyles}>
            <h2 style={{ margin: '0 0 18px', fontSize: '22px' }}>Product expansion</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '14px' }}>
                <div style={{ color: '#15803d', fontWeight: 700 }}>Travel & tours</div>
                <div style={{ marginTop: '8px', fontSize: '18px' }}>Itineraries, multi-day packages, and booking flows</div>
              </div>
              <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '14px' }}>
                <div style={{ color: '#1d4ed8', fontWeight: 700 }}>Restaurants</div>
                <div style={{ marginTop: '8px', fontSize: '18px' }}>Reservations, ordering, and local pickup experiences</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

const cardStyles: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '18px',
  padding: '20px',
  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
};

const primaryButtonStyles: React.CSSProperties = {
  background: '#111827',
  color: '#ffffff',
  border: 'none',
  borderRadius: '10px',
  padding: '10px 16px',
  fontWeight: 700,
  cursor: 'pointer',
};

const secondaryButtonStyles: React.CSSProperties = {
  background: '#f3f4f6',
  color: '#111827',
  border: '1px solid #e5e7eb',
  borderRadius: '10px',
  padding: '9px 12px',
  fontWeight: 600,
  cursor: 'pointer',
};
