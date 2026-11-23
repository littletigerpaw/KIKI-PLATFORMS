import { getProductImageUrl } from '../../lib/product-image';

type DemoForm = {
  storeName: string;
  domain: string;
  businessType: string;
  service: string;
  products: string;
};

type DemoStorePreviewProps = {
  form: DemoForm;
  previewProducts: string[];
  onEdit: () => void;
};

export default function DemoStorePreview({ form, previewProducts, onEdit }: DemoStorePreviewProps) {
  return (
    <section style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '22px', padding: '28px', boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '18px' }}>
        <div>
          <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280' }}>Beta preview</div>
          <h2 style={{ margin: '8px 0 0', fontSize: '28px' }}>Your demo store foundation</h2>
        </div>
        <button type="button" onClick={onEdit} style={{ border: '1px solid #111827', background: '#111827', color: '#fff', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}>
          Edit demo setup
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '18px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontWeight: 800, fontSize: '20px' }}>{form.storeName}</div>
            <span style={{ background: '#ecfeff', color: '#0f766e', padding: '6px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 700 }}>BETA</span>
          </div>

          <div style={{ padding: '14px 16px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', marginBottom: '18px', color: '#374151' }}>
            {form.domain} · {form.service}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
            {previewProducts.length ? previewProducts.map((product) => (
              <div key={product} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '14px', color: '#374151' }}>
                <img
                  src={getProductImageUrl(product)}
                  alt={product}
                  loading="lazy"
                  style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '10px', display: 'block', marginBottom: '10px' }}
                />
                <div style={{ fontWeight: 700, marginBottom: '6px' }}>{product}</div>
                <div style={{ color: '#6b7280', fontSize: '13px' }}>Custom branded product</div>
              </div>
            )) : (
              <div style={{ gridColumn: '1 / -1', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '14px', color: '#374151' }}>
                Add products to preview your storefront catalog.
              </div>
            )}
          </div>
        </div>

        <div style={{ background: '#111827', color: '#fff', borderRadius: '18px', padding: '20px' }}>
          <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.75 }}>Included in the build</div>
          <ul style={{ margin: '18px 0 0 0', paddingLeft: '18px', lineHeight: 1.9, color: 'rgba(255,255,255,0.9)' }}>
            <li>Custom storefront</li>
            <li>Merchant dashboard</li>
            <li>Mobile app shell</li>
            <li>Product catalog</li>
            <li>Branding &amp; domain setup</li>
            <li>Launch workflow</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
