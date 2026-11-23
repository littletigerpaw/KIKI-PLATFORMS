'use client';

import { useEffect, useMemo, useState } from 'react';

import { apiFetch, errorMessage } from '@/lib/api';
import { useRequireAuth } from '@/lib/use-auth';

type Product = {
  id: string | number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'Live' | 'Draft' | 'Low stock';
};

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

const seedProducts: Product[] = [
  { id: 101, name: 'Classic Leather Tote', category: 'Accessories', price: 128, stock: 24, status: 'Live' },
  { id: 102, name: 'Trail Runner', category: 'Footwear', price: 146, stock: 12, status: 'Low stock' },
  { id: 103, name: 'Minimal Desk Lamp', category: 'Home', price: 74, stock: 33, status: 'Live' },
  { id: 104, name: 'Cozy Knit Set', category: 'Apparel', price: 96, stock: 8, status: 'Low stock' },
];

const emptyDraft = {
  name: '',
  category: 'Accessories',
  price: '0',
  stock: '0',
  status: 'Draft' as Product['status'],
};

export function ProductManager() {
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [isLoadedFromApi, setIsLoadedFromApi] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const auth = useRequireAuth();

  useEffect(() => {
    if (!auth) return;
    const loadMerchantSession = async () => {
      try {
        const raw = window.localStorage.getItem('kiki-merchant-session');
        if (!raw) {
          setIsLoadedFromApi(false);
          return;
        }

        const session = JSON.parse(raw) as Partial<MerchantSession>;
        const merchantId = session.merchantId;
        const storeId = session.storeId;

        if (!merchantId || !storeId) {
          setProducts(seedProducts);
          setIsLoadedFromApi(false);
          return;
        }

        const response = await apiFetch(`/merchants/${merchantId}/stores/${storeId}/products`);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = await response.json();
        const nextProducts: Product[] = Array.isArray(payload)
          ? payload.map((item) => ({
              id: item.id,
              name: item.name,
              category: item.category ?? 'General',
              price: Number(item.price) || 0,
              stock: Number(item.inventory) || 0,
              status: (Number(item.inventory) === 0 ? 'Draft' : Number(item.inventory) < 10 ? 'Low stock' : 'Live') as Product['status'],
            }))
          : seedProducts;

        setProducts(nextProducts);
        setIsLoadedFromApi(true);
      } catch {
        setProducts(seedProducts);
        setIsLoadedFromApi(false);
      }
    };

    void loadMerchantSession();
  }, [auth]);

  const inventoryTotal = useMemo(
    () => products.reduce((total, product) => total + product.stock, 0),
    [products],
  );

  const totalRevenue = useMemo(
    () => products.reduce((total, product) => total + product.price * product.stock, 0),
    [products],
  );

  const handleSave = async () => {
    const cleanedName = draft.name.trim();
    if (!cleanedName) return;

    const productData: Product = {
      id: editingId ?? Date.now(),
      name: cleanedName,
      category: draft.category,
      price: Number(draft.price) || 0,
      stock: Number(draft.stock) || 0,
      status: draft.stock === '0' ? 'Draft' : Number(draft.stock) < 10 ? 'Low stock' : 'Live',
    };

    try {
      const raw = window.localStorage.getItem('kiki-merchant-session');
      if (raw) {
        const session = JSON.parse(raw) as Partial<MerchantSession>;
        const merchantId = session.merchantId;
        const storeId = session.storeId;

        if (merchantId && storeId) {
          setSaveError(null);
          const response = await apiFetch(`/merchants/${merchantId}/stores/${storeId}/products`, {
            method: 'POST',
            body: JSON.stringify({
              name: productData.name,
              description: `${productData.category} product`,
              price: productData.price,
              inventory: productData.stock,
              is_active: productData.status !== 'Draft',
            }),
          });

          if (response.ok) {
            const payload = await response.json();
            const refreshedProduct: Product = {
              id: payload.id,
              name: payload.name,
              category: draft.category,
              price: Number(payload.price) || 0,
              stock: Number(payload.inventory) || 0,
              status: (Number(payload.inventory) === 0 ? 'Draft' : Number(payload.inventory) < 10 ? 'Low stock' : 'Live') as Product['status'],
            };

            setProducts((current) => [refreshedProduct, ...current.filter((item) => item.id !== refreshedProduct.id)]);
            setDraft(emptyDraft);
            setEditingId(null);
            return;
          }

          // The server refused (e.g. your role can't add products): say so instead of faking a save.
          const payload = await response.json().catch(() => ({}));
          setSaveError(errorMessage(payload, `Could not save the product (error ${response.status}).`));
          return;
        }
      }
    } catch {
      // Fall through to local demo behavior when the backend is unavailable.
    }

    if (editingId) {
      setProducts((current) => current.map((item) => (item.id === editingId ? productData : item)));
    } else {
      setProducts((current) => [productData, ...current]);
    }

    setDraft(emptyDraft);
    setEditingId(null);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setDraft({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      status: product.status,
    });
  };

  const handleDelete = (id: number | string) => {
    setProducts((current) => current.filter((product) => product.id !== id));
    if (editingId === id) {
      setDraft(emptyDraft);
      setEditingId(null);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f5f7fb', padding: '32px 24px 64px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <header style={{ background: '#111827', color: '#fff', borderRadius: '24px', padding: '28px 30px', boxShadow: '0 20px 44px rgba(17, 24, 39, 0.14)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.75 }}>Product catalog</div>
              <h1 style={{ margin: '12px 0 0', fontSize: '2.6rem' }}>Manage storefront inventory</h1>
            </div>
            <button style={{ background: '#fff', color: '#111827', border: 'none', borderRadius: '12px', padding: '12px 18px', fontWeight: 700 }} onClick={() => { setEditingId(null); setDraft(emptyDraft); }}>
              Add new product
            </button>
          </div>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px', marginTop: '22px' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '18px', padding: '20px' }}>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Total products</div>
            <div style={{ fontSize: '32px', fontWeight: 800, margin: '10px 0 4px' }}>{products.length}</div>
            <div style={{ color: '#10b981', fontWeight: 700 }}>{isLoadedFromApi ? 'Live tenant catalog' : 'Demo catalog'}</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '18px', padding: '20px' }}>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Inventory units</div>
            <div style={{ fontSize: '32px', fontWeight: 800, margin: '10px 0 4px' }}>{inventoryTotal}</div>
            <div style={{ color: '#2563eb', fontWeight: 700 }}>Stocked</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '18px', padding: '20px' }}>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Projected revenue</div>
            <div style={{ fontSize: '32px', fontWeight: 800, margin: '10px 0 4px' }}>${totalRevenue.toLocaleString()}</div>
            <div style={{ color: '#10b981', fontWeight: 700 }}>{isLoadedFromApi ? 'Tenant market value' : 'Demo market value'}</div>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '22px', marginTop: '24px' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '22px', padding: '22px' }}>
            <h2 style={{ margin: '0 0 18px', fontSize: '1.4rem' }}>Product listings</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {products.map((product) => (
                <div key={product.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.8fr 0.8fr 0.8fr auto', gap: '12px', alignItems: 'center', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px 14px' }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{product.name}</div>
                    <div style={{ color: '#6b7280', fontSize: '13px' }}>{product.category}</div>
                  </div>
                  <div style={{ fontWeight: 700 }}>${product.price}</div>
                  <div style={{ fontWeight: 700 }}>{product.stock} units</div>
                  <div style={{ color: product.status === 'Live' ? '#047857' : product.status === 'Low stock' ? '#b45309' : '#4b5563', fontWeight: 700 }}>{product.status}</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => handleEdit(product)} style={{ background: '#eef2ff', color: '#3730a3', border: 'none', borderRadius: '10px', padding: '8px 10px', fontWeight: 700 }}>Edit</button>
                    <button type="button" onClick={() => handleDelete(product.id)} style={{ background: '#fef2f2', color: '#b91c1c', border: 'none', borderRadius: '10px', padding: '8px 10px', fontWeight: 700 }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '22px', padding: '22px' }}>
            <h2 style={{ margin: '0 0 18px', fontSize: '1.4rem' }}>{editingId ? 'Edit product' : 'Add product'}</h2>
            <div style={{ display: 'grid', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#374151' }}>Product name</label>
                <input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} style={inputStyle} placeholder="Premium travel kit" />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#374151' }}>Category</label>
                <select value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))} style={inputStyle}>
                  <option value="Accessories">Accessories</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Apparel">Apparel</option>
                  <option value="Home">Home</option>
                  <option value="Food">Food</option>
                  <option value="Travel">Travel</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#374151' }}>Price</label>
                  <input type="number" value={draft.price} onChange={(event) => setDraft((current) => ({ ...current, price: event.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#374151' }}>Stock</label>
                  <input type="number" value={draft.stock} onChange={(event) => setDraft((current) => ({ ...current, stock: event.target.value }))} style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#374151' }}>Status</label>
                <select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as Product['status'] }))} style={inputStyle}>
                  <option value="Live">Live</option>
                  <option value="Draft">Draft</option>
                  <option value="Low stock">Low stock</option>
                </select>
              </div>

              {saveError ? (
                <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '12px', padding: '10px 12px', fontSize: '14px', fontWeight: 600 }}>
                  {saveError}
                </div>
              ) : null}
              <button type="button" onClick={handleSave} style={{ background: '#111827', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px 16px', fontWeight: 700 }}>
                {editingId ? 'Save updates' : 'Create product'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #d1d5db',
  borderRadius: '12px',
  padding: '12px 14px',
  fontSize: '15px',
  background: '#fff',
  color: '#111827',
};
