'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { getProductImageUrl } from '../../lib/product-image';

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
};

type ThemeKey = 'midnight' | 'sage' | 'sunset' | 'lavender';
type EditorTab = 'design' | 'content' | 'sections';
type LayoutMode = 'wide' | 'editorial' | 'minimal';

type StoreConfig = {
  storeName: string;
  domain: string;
  businessType: string;
  service: string;
  headline: string;
  subtitle: string;
  products: string;
};

type SectionState = {
  hero: boolean;
  catalog: boolean;
  contact: boolean;
  testimonials: boolean;
};

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const themeOptions: Record<ThemeKey, { label: string; accent: string; accentSoft: string; pageBg: string; panelBg: string; chipBg: string; tint: string; text: string }> = {
  midnight: { label: 'Midnight', accent: '#111827', accentSoft: '#312e81', pageBg: '#f3f4f6', panelBg: '#ffffff', chipBg: '#ecfeff', tint: '#0f766e', text: '#111827' },
  sage: { label: 'Sage', accent: '#1f3a2f', accentSoft: '#2d6a4f', pageBg: '#f3f7f4', panelBg: '#ffffff', chipBg: '#ecfdf5', tint: '#166534', text: '#14322a' },
  sunset: { label: 'Sunset', accent: '#7c2d12', accentSoft: '#c2410c', pageBg: '#fff7ed', panelBg: '#ffffff', chipBg: '#ffedd5', tint: '#9a5b1d', text: '#431407' },
  lavender: { label: 'Lavender', accent: '#4c1d95', accentSoft: '#6d28d9', pageBg: '#f5f3ff', panelBg: '#ffffff', chipBg: '#ede9fe', tint: '#6d28d9', text: '#2e1065' },
};

const defaultSections: SectionState = { hero: true, catalog: true, contact: true, testimonials: true };

export default function DemoPreviewPage() {
  const params = useSearchParams();
  const [activeTab, setActiveTab] = useState<'Home' | 'Shop' | 'Contact'>('Home');
  const [filterTag, setFilterTag] = useState<'All' | 'New arrivals' | 'Best sellers'>('All');
  const [editorTab, setEditorTab] = useState<EditorTab>('design');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('wide');
  const [sections, setSections] = useState<SectionState>(defaultSections);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showCheckout, setShowCheckout] = useState(false);
  const [themeKey, setThemeKey] = useState<ThemeKey>('midnight');

  const initialConfig = useMemo<StoreConfig>(() => ({
    storeName: params.get('storeName') || 'Nova Atelier',
    domain: params.get('domain') || 'novaatelier.kiki',
    businessType: params.get('businessType') || 'Lifestyle & retail',
    service: params.get('service') || 'E-commerce storefront',
    headline: params.get('headline') || 'The new collection is here',
    subtitle: params.get('subtitle') || 'Thoughtful essentials for slower mornings, warm homes, and elevated routines.',
    products: params.get('products') || 'Hand-poured candles, skincare sets, curated gift boxes',
  }), [params]);

  const [storeConfig, setStoreConfig] = useState<StoreConfig>(initialConfig);

  useEffect(() => {
    setStoreConfig(initialConfig);
  }, [initialConfig]);

  const theme = themeOptions[themeKey];
  const products = storeConfig.products;

  const productList = useMemo<Product[]>(() => {
    return products
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 6)
      .map((item, index) => ({
        id: `${item}-${index}`,
        name: item,
        price: 32 + index * 18,
        category: index % 2 === 0 ? 'Best sellers' : 'New arrivals',
        description: 'Crafted for daily rituals and elevated gifting.',
        image: getProductImageUrl(item),
      }));
  }, [products]);

  const filteredProductList = useMemo(() => {
    if (filterTag === 'All') {
      return productList;
    }
    return productList.filter((product) => product.category === filterTag);
  }, [filterTag, productList]);

  const cartItems = useMemo(() => {
    return productList.filter((product) => cart[product.id]);
  }, [cart, productList]);

  const subtotal = cartItems.reduce((sum, product) => sum + product.price * (cart[product.id] || 0), 0);
  const shipping = subtotal > 0 ? 12 : 0;
  const total = subtotal + shipping;

  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const addToCart = (product: Product) => {
    setCart((current) => ({ ...current, [product.id]: (current[product.id] || 0) + 1 }));
    setActiveTab('Shop');
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((current) => {
      const nextQty = (current[productId] || 0) + delta;
      if (nextQty <= 0) {
        const { [productId]: _removed, ...rest } = current;
        return rest;
      }
      return { ...current, [productId]: nextQty };
    });
  };

  const updateField = (field: keyof StoreConfig, value: string) => {
    setStoreConfig((current) => ({ ...current, [field]: value }));
  };

  const toggleSection = (section: keyof SectionState) => {
    setSections((current) => ({ ...current, [section]: !current[section] }));
  };

  const layoutStyles = {
    wide: {
      previewFrame: { maxWidth: '100%', width: '100%', transition: 'all 0.2s ease' },
      container: { display: 'grid', gridTemplateColumns: '1.7fr 0.7fr', gap: '22px', marginTop: '22px', alignItems: 'start' },
      hero: { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' },
      panel: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '20px', padding: '22px' },
    },
    editorial: {
      previewFrame: { maxWidth: '980px', width: '100%', margin: '0 auto', transition: 'all 0.2s ease' },
      container: { display: 'grid', gridTemplateColumns: '1fr', gap: '22px', marginTop: '22px' },
      hero: { display: 'grid', gridTemplateColumns: '1fr', gap: '20px' },
      panel: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '20px', padding: '22px', boxShadow: '0 18px 35px rgba(15, 23, 42, 0.04)' },
    },
    minimal: {
      previewFrame: { maxWidth: '860px', width: '100%', margin: '0 auto', transition: 'all 0.2s ease' },
      container: { display: 'grid', gridTemplateColumns: '1.8fr 0.8fr', gap: '18px', marginTop: '22px', alignItems: 'start' },
      hero: { display: 'grid', gridTemplateColumns: '1fr', gap: '16px' },
      panel: { background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '18px', padding: '18px', boxShadow: '0 10px 20px rgba(15, 23, 42, 0.02)' },
    },
  }[layoutMode];

  const renderProductGrid = (compact = false) => (
    <div style={{ display: 'grid', gridTemplateColumns: compact ? 'repeat(auto-fit, minmax(180px, 1fr))' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
      {filteredProductList.map((product) => (
        <article key={product.id} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '18px', padding: '14px' }}>
          <img src={product.image} alt={product.name} style={{ width: '100%', height: compact ? '150px' : '180px', objectFit: 'cover', borderRadius: '12px', display: 'block' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', gap: '8px' }}>
            <span style={{ background: theme.chipBg, color: theme.tint, borderRadius: '999px', padding: '6px 8px', fontSize: '10px', fontWeight: 800 }}>{product.category}</span>
            <span style={{ fontWeight: 800, color: '#111827' }}>{currency.format(product.price)}</span>
          </div>
          <h4 style={{ margin: '12px 0 8px', fontSize: '1.1rem' }}>{product.name}</h4>
          <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.6, minHeight: '48px' }}>{product.description}</p>
          <button type="button" onClick={() => addToCart(product)} style={{ marginTop: '14px', width: '100%', border: 'none', background: theme.accent, color: '#fff', padding: '12px 14px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Add to cart</button>
        </article>
      ))}
    </div>
  );

  const renderCartPanel = () => (
    <aside style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '20px', padding: '20px', position: 'sticky', top: '20px' }}>
      <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280' }}>Cart</div>
      <h3 style={{ margin: '10px 0 16px', fontSize: '1.6rem' }}>Your order</h3>

      {cartItems.length === 0 ? (
        <div style={{ border: '1px dashed #d1d5db', borderRadius: '12px', padding: '18px', color: '#4b5563', background: '#f9fafb' }}>Your cart is empty. Add a few products to see the checkout flow.</div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {cartItems.map((product) => (
            <div key={product.id} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{product.name}</div>
                  <div style={{ color: '#4b5563', fontSize: '13px', marginTop: '4px' }}>{currency.format(product.price)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button type="button" onClick={() => updateQty(product.id, -1)} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>−</button>
                  <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 700 }}>{cart[product.id]}</span>
                  <button type="button" onClick={() => updateQty(product.id, 1)} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '18px', borderTop: '1px solid #e5e7eb', paddingTop: '14px', display: 'grid', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><strong>{currency.format(subtotal)}</strong></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Shipping</span><strong>{currency.format(shipping)}</strong></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800 }}><span>Total</span><span>{currency.format(total)}</span></div>
        <button type="button" onClick={() => setShowCheckout(true)} style={{ marginTop: '12px', width: '100%', border: 'none', background: theme.accent, color: '#fff', borderRadius: '12px', padding: '12px 16px', fontWeight: 800, cursor: 'pointer' }}>Proceed to checkout</button>
      </div>
    </aside>
  );

  const renderHomePage = () => (
    <>
      {sections.hero && (
        <section style={{ marginTop: '22px', background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentSoft} 100%)`, color: '#fff', borderRadius: '24px', padding: '28px 30px', ...(layoutStyles.hero as React.CSSProperties) }}>
          <div>
            <div style={{ fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.8 }}>Featured launch</div>
            <h2 style={{ margin: '14px 0 12px', fontSize: '3rem', lineHeight: 1.08 }}>{storeConfig.headline}</h2>
            <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.8)', maxWidth: '620px' }}>{storeConfig.subtitle}</p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '18px', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => setActiveTab('Shop')} style={{ background: '#fff', color: theme.text, border: 'none', borderRadius: '12px', padding: '12px 18px', fontWeight: 800, cursor: 'pointer' }}>Shop collection</button>
              <button type="button" onClick={() => setShowCheckout(true)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', borderRadius: '12px', padding: '12px 18px', fontWeight: 800, cursor: 'pointer' }}>View cart</button>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '18px', padding: '18px' }}>
            <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.75 }}>Demo only</div>
            <div style={{ fontWeight: 800, fontSize: '2rem', marginTop: '10px' }}>{storeConfig.businessType}</div>
            <div style={{ marginTop: '10px', color: 'rgba(255,255,255,0.85)' }}>{storeConfig.service}</div>
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}>This is a storefront prototype for a merchant demo. The full builder is not included here.</div>
          </div>
        </section>
      )}

      {sections.testimonials && (
        <section style={{ marginTop: '22px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '20px', padding: '22px' }}>
          <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280' }}>Merchant feedback</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginTop: '16px' }}>
            {[
              ['“The storefront feels premium and easy to brand.”', 'Avery Stone'],
              ['“Our launch page converted far faster than our old setup.”', 'Mila Ross'],
              ['“We launched in a day with the right storefront system.”', 'Jason Benoit'],
            ].map(([quote, author]) => (
              <div key={author} style={{ border: '1px solid #e5e7eb', borderRadius: '14px', padding: '18px', background: '#f9fafb' }}>
                <div style={{ fontSize: '1.05rem', lineHeight: 1.7, color: '#374151' }}>{quote}</div>
                <div style={{ marginTop: '12px', fontWeight: 700, color: '#111827' }}>{author}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );

  const renderShopPage = () => (
    <section style={layoutStyles.container as React.CSSProperties}>
      <div style={layoutStyles.panel as React.CSSProperties}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280' }}>Catalog</div>
            <h3 style={{ margin: '8px 0 0', fontSize: '2rem' }}>Shop the collection</h3>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(['All', 'New arrivals', 'Best sellers'] as const).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setFilterTag(tag);
                  setActiveTab('Shop');
                }}
                style={{
                  border: filterTag === tag ? `1px solid ${theme.accent}` : '1px solid #d1d5db',
                  background: filterTag === tag ? theme.accent : '#fff',
                  color: filterTag === tag ? '#fff' : '#111827',
                  borderRadius: '999px',
                  padding: '8px 12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {renderProductGrid(layoutMode === 'minimal')}
      </div>

      {renderCartPanel()}
    </section>
  );

  const renderContactPage = () => (
    <section style={{ marginTop: '22px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '20px', padding: '24px' }}>
      <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280' }}>Contact</div>
      <h3 style={{ margin: '10px 0 18px', fontSize: '2rem' }}>Questions about your storefront?</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '14px', padding: '18px' }}>
          <div style={{ fontWeight: 700, marginBottom: '8px' }}>Email</div>
          <div style={{ color: '#4b5563' }}>hello@{storeConfig.domain}</div>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '14px', padding: '18px' }}>
          <div style={{ fontWeight: 700, marginBottom: '8px' }}>Support</div>
          <div style={{ color: '#4b5563' }}>Mon–Fri · 9am–6pm</div>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '14px', padding: '18px' }}>
          <div style={{ fontWeight: 700, marginBottom: '8px' }}>Location</div>
          <div style={{ color: '#4b5563' }}>Remote-first, serving merchants worldwide</div>
        </div>
      </div>
    </section>
  );

  return (
    <main style={{ minHeight: '100vh', background: theme.pageBg, color: theme.text, padding: '32px 20px 48px' }}>
      <div style={{ maxWidth: '1380px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) 400px', gap: '24px', alignItems: 'start' }}>
          <div>
            <header style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '20px', padding: '18px 24px', boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6b7280' }}>Demo storefront</div>
                  <h1 style={{ margin: '8px 0 0', fontSize: '2rem' }}>{storeConfig.storeName}</h1>
                </div>

                <nav style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {(['Home', 'Shop', 'Contact'] as const).map((tab) => (
                    <button key={tab} type="button" onClick={() => setActiveTab(tab)} style={{ border: activeTab === tab ? `1px solid ${theme.accent}` : '1px solid #d1d5db', background: activeTab === tab ? theme.accent : '#fff', color: activeTab === tab ? '#fff' : '#111827', borderRadius: '999px', padding: '9px 14px', fontWeight: 700, cursor: 'pointer' }}>{tab}</button>
                  ))}
                </nav>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ color: '#374151', fontWeight: 700 }}>{storeConfig.domain}</div>
                  <button type="button" onClick={() => setShowCheckout(true)} style={{ background: theme.accent, color: '#fff', border: 'none', borderRadius: '999px', padding: '10px 16px', fontWeight: 700, cursor: 'pointer' }}>Cart {cartCount > 0 ? `(${cartCount})` : ''}</button>
                </div>
              </div>
            </header>

            <div style={layoutStyles.previewFrame as React.CSSProperties}>
              {activeTab === 'Home' && renderHomePage()}
              {activeTab === 'Shop' && renderShopPage()}
              {activeTab === 'Contact' && renderContactPage()}
            </div>

            {showCheckout && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'grid', placeItems: 'center', padding: '20px', zIndex: 40 }}>
                <div style={{ width: '100%', maxWidth: '700px', background: '#fff', borderRadius: '22px', padding: '26px', boxShadow: '0 28px 70px rgba(15, 23, 42, 0.22)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                    <div>
                      <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280' }}>Checkout</div>
                      <h3 style={{ margin: '8px 0 0', fontSize: '2rem' }}>Demo purchase</h3>
                    </div>
                    <button type="button" onClick={() => setShowCheckout(false)} style={{ border: 'none', background: '#f3f4f6', color: '#111827', width: '40px', height: '40px', borderRadius: '999px', fontSize: '24px', cursor: 'pointer' }}>×</button>
                  </div>

                  <div style={{ display: 'grid', gap: '14px' }}>
                    <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '14px' }}>
                      <div style={{ fontWeight: 700 }}>Customer</div>
                      <div style={{ color: '#4b5563', marginTop: '6px' }}>Demo shopper · demo@{storeConfig.domain}</div>
                    </div>

                    {cartItems.length ? cartItems.map((product) => (
                      <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px 14px' }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{product.name}</div>
                          <div style={{ fontSize: '13px', color: '#4b5563' }}>Qty: {cart[product.id]}</div>
                        </div>
                        <strong>{currency.format(product.price * (cart[product.id] || 0))}</strong>
                      </div>
                    )) : (
                      <div style={{ color: '#4b5563', border: '1px dashed #d1d5db', borderRadius: '12px', padding: '18px', background: '#f9fafb' }}>No items in cart.</div>
                    )}
                  </div>

                  <div style={{ marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '16px', display: 'grid', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><strong>{currency.format(subtotal)}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Shipping</span><strong>{currency.format(shipping)}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 800 }}><span>Total</span><span>{currency.format(total)}</span></div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => setShowCheckout(false)} style={{ background: '#fff', border: '1px solid #d1d5db', color: '#111827', padding: '12px 18px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Back to shop</button>
                    <Link href="/signup" style={{ background: theme.accent, color: '#fff', padding: '12px 18px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700 }}>Start building</Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside style={{ position: 'sticky', top: '20px', background: 'linear-gradient(180deg, #0f172a 0%, #111827 100%)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '22px', padding: '18px', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.18)', color: '#e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#94a3b8' }}>Builder studio</div>
                <h3 style={{ margin: '8px 0 0', fontSize: '1.5rem', color: '#fff' }}>Editor</h3>
              </div>
              <span style={{ background: '#dbeafe', color: '#1d4ed8', borderRadius: '999px', padding: '6px 10px', fontSize: '11px', fontWeight: 800 }}>Live</span>
            </div>

            <div style={{ display: 'grid', gap: '14px' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(148, 163, 184, 0.18)', borderRadius: '16px', padding: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  {(['design', 'content', 'sections'] as EditorTab[]).map((tab) => (
                    <button key={tab} type="button" onClick={() => setEditorTab(tab)} style={{ flex: 1, border: editorTab === tab ? '1px solid rgba(255,255,255,0.18)' : '1px solid transparent', background: editorTab === tab ? 'rgba(255,255,255,0.08)' : 'transparent', color: '#e5e7eb', borderRadius: '10px', padding: '8px 10px', fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize' }}>{tab}</button>
                  ))}
                </div>

                {editorTab === 'design' && (
                  <>
                    <div style={{ marginBottom: '10px', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94a3b8' }}>Brand palette</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
                      {(Object.keys(themeOptions) as ThemeKey[]).map((optionKey) => {
                        const option = themeOptions[optionKey];
                        const selected = optionKey === themeKey;
                        return (
                          <button key={optionKey} type="button" onClick={() => setThemeKey(optionKey)} style={{ border: selected ? '1px solid rgba(255,255,255,0.9)' : '1px solid rgba(148, 163, 184, 0.2)', background: selected ? 'rgba(255,255,255,0.08)' : 'rgba(15, 23, 42, 0.45)', color: '#fff', borderRadius: '12px', padding: '10px 8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <span style={{ width: '12px', height: '12px', borderRadius: '999px', background: option.accent, display: 'inline-block', border: '2px solid rgba(255,255,255,0.7)' }} />
                            {option.label}
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ marginTop: '16px' }}>
                      <div style={{ marginBottom: '10px', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94a3b8' }}>Layout</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }}>
                        {(['wide', 'editorial', 'minimal'] as LayoutMode[]).map((layout) => (
                          <button key={layout} type="button" onClick={() => setLayoutMode(layout)} style={{ border: layoutMode === layout ? '1px solid rgba(255,255,255,0.28)' : '1px solid transparent', background: layoutMode === layout ? 'rgba(255,255,255,0.08)' : 'rgba(15, 23, 42, 0.3)', color: '#f8fafc', borderRadius: '10px', padding: '8px 6px', fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize' }}>{layout}</button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {editorTab === 'content' && (
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <label style={{ display: 'grid', gap: '8px', fontWeight: 600, color: '#e5e7eb' }}>Store name<input value={storeConfig.storeName} onChange={(event) => updateField('storeName', event.target.value)} style={{ border: '1px solid rgba(148, 163, 184, 0.25)', borderRadius: '10px', padding: '10px 12px', fontSize: '15px', background: 'rgba(15, 23, 42, 0.45)', color: '#fff' }} /></label>
                    <label style={{ display: 'grid', gap: '8px', fontWeight: 600, color: '#e5e7eb' }}>Domain<input value={storeConfig.domain} onChange={(event) => updateField('domain', event.target.value)} style={{ border: '1px solid rgba(148, 163, 184, 0.25)', borderRadius: '10px', padding: '10px 12px', fontSize: '15px', background: 'rgba(15, 23, 42, 0.45)', color: '#fff' }} /></label>
                    <label style={{ display: 'grid', gap: '8px', fontWeight: 600, color: '#e5e7eb' }}>Business type<input value={storeConfig.businessType} onChange={(event) => updateField('businessType', event.target.value)} style={{ border: '1px solid rgba(148, 163, 184, 0.25)', borderRadius: '10px', padding: '10px 12px', fontSize: '15px', background: 'rgba(15, 23, 42, 0.45)', color: '#fff' }} /></label>
                    <label style={{ display: 'grid', gap: '8px', fontWeight: 600, color: '#e5e7eb' }}>Headline<input value={storeConfig.headline} onChange={(event) => updateField('headline', event.target.value)} style={{ border: '1px solid rgba(148, 163, 184, 0.25)', borderRadius: '10px', padding: '10px 12px', fontSize: '15px', background: 'rgba(15, 23, 42, 0.45)', color: '#fff' }} /></label>
                    <label style={{ display: 'grid', gap: '8px', fontWeight: 600, color: '#e5e7eb' }}>Subtitle<textarea value={storeConfig.subtitle} onChange={(event) => updateField('subtitle', event.target.value)} rows={3} style={{ border: '1px solid rgba(148, 163, 184, 0.25)', borderRadius: '10px', padding: '10px 12px', fontSize: '15px', resize: 'vertical', background: 'rgba(15, 23, 42, 0.45)', color: '#fff' }} /></label>
                    <label style={{ display: 'grid', gap: '8px', fontWeight: 600, color: '#e5e7eb' }}>Product list<textarea value={storeConfig.products} onChange={(event) => updateField('products', event.target.value)} rows={4} style={{ border: '1px solid rgba(148, 163, 184, 0.25)', borderRadius: '10px', padding: '10px 12px', fontSize: '15px', resize: 'vertical', background: 'rgba(15, 23, 42, 0.45)', color: '#fff' }} /></label>
                  </div>
                )}

                {editorTab === 'sections' && (
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {([
                      ['hero', 'Hero section'],
                      ['catalog', 'Catalog section'],
                      ['contact', 'Contact section'],
                      ['testimonials', 'Testimonials'],
                    ] as Array<[keyof SectionState, string]>).map(([key, label]) => (
                      <label key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(148, 163, 184, 0.16)', borderRadius: '12px', padding: '11px 12px', color: '#f8fafc', fontWeight: 600 }}>
                        <span>{label}</span>
                        <input type="checkbox" checked={sections[key]} onChange={() => toggleSection(key)} style={{ width: '18px', height: '18px' }} />
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: '14px', padding: '12px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94a3b8' }}>Store status</div>
                <div style={{ marginTop: '8px', fontWeight: 700, color: '#fff' }}>Draft storefront demo</div>
                <div style={{ marginTop: '8px', color: '#cbd5e1', lineHeight: 1.5 }}>This is a preview-only builder experience for a merchant demo.</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
