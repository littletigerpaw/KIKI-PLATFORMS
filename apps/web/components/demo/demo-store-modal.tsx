type DemoForm = {
  storeName: string;
  domain: string;
  businessType: string;
  service: string;
  products: string;
  headline: string;
  subtitle: string;
};

type DemoStoreModalProps = {
  isOpen: boolean;
  form: DemoForm;
  onClose: () => void;
  onChange: (field: keyof DemoForm, value: string) => void;
  onSubmit: () => void;
};

export default function DemoStoreModal({ isOpen, form, onClose, onChange, onSubmit }: DemoStoreModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'grid', placeItems: 'center', padding: '20px', zIndex: 30 }}>
      <div style={{ width: '100%', maxWidth: '720px', background: '#fff', borderRadius: '22px', padding: '28px', boxShadow: '0 24px 70px rgba(15, 23, 42, 0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280' }}>Beta storefront setup</div>
            <h3 style={{ margin: '8px 0 0', fontSize: '32px' }}>Build your mock launch</h3>
          </div>
          <button type="button" onClick={onClose} style={{ border: 'none', background: '#f3f4f6', color: '#111827', width: '38px', height: '38px', borderRadius: '999px', cursor: 'pointer', fontSize: '20px' }}>×</button>
        </div>

        <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
          <label style={{ display: 'grid', gap: '8px', color: '#374151', fontWeight: 600 }}>
            Store name
            <input
              value={form.storeName}
              onChange={(event) => onChange('storeName', event.target.value)}
              style={{ border: '1px solid #d1d5db', borderRadius: '12px', padding: '12px 14px', fontSize: '16px' }}
            />
          </label>

          <label style={{ display: 'grid', gap: '8px', color: '#374151', fontWeight: 600 }}>
            Domain
            <input
              value={form.domain}
              onChange={(event) => onChange('domain', event.target.value)}
              style={{ border: '1px solid #d1d5db', borderRadius: '12px', padding: '12px 14px', fontSize: '16px' }}
            />
          </label>

          <label style={{ display: 'grid', gap: '8px', color: '#374151', fontWeight: 600 }}>
            Business type
            <input
              value={form.businessType}
              onChange={(event) => onChange('businessType', event.target.value)}
              style={{ border: '1px solid #d1d5db', borderRadius: '12px', padding: '12px 14px', fontSize: '16px' }}
            />
          </label>

          <label style={{ display: 'grid', gap: '8px', color: '#374151', fontWeight: 600 }}>
            Service you want
            <select
              value={form.service}
              onChange={(event) => onChange('service', event.target.value)}
              style={{ border: '1px solid #d1d5db', borderRadius: '12px', padding: '12px 14px', fontSize: '16px', background: '#fff' }}
            >
              <option>E-commerce storefront</option>
              <option>Booking and appointments</option>
              <option>Travel and tour platform</option>
              <option>Restaurant ordering system</option>
            </select>
          </label>

          <label style={{ display: 'grid', gap: '8px', color: '#374151', fontWeight: 600, gridColumn: '1 / -1' }}>
            Store headline
            <input
              value={form.headline}
              onChange={(event) => onChange('headline', event.target.value)}
              style={{ border: '1px solid #d1d5db', borderRadius: '12px', padding: '12px 14px', fontSize: '16px' }}
            />
          </label>

          <label style={{ display: 'grid', gap: '8px', color: '#374151', fontWeight: 600, gridColumn: '1 / -1' }}>
            Shop intro
            <textarea
              value={form.subtitle}
              onChange={(event) => onChange('subtitle', event.target.value)}
              rows={3}
              style={{ border: '1px solid #d1d5db', borderRadius: '12px', padding: '12px 14px', fontSize: '16px', resize: 'vertical' }}
            />
          </label>
        </div>

        <label style={{ display: 'grid', gap: '8px', color: '#374151', fontWeight: 600, marginTop: '18px' }}>
          Products or offerings you sell
          <textarea
            value={form.products}
            onChange={(event) => onChange('products', event.target.value)}
            rows={4}
            style={{ border: '1px solid #d1d5db', borderRadius: '12px', padding: '12px 14px', fontSize: '16px', resize: 'vertical' }}
          />
        </label>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ color: '#4b5563', fontSize: '14px' }}>This is a beta prototype of the merchant launch flow.</div>
          <button type="button" onClick={onSubmit} style={{ border: 'none', background: '#111827', color: '#fff', padding: '12px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700 }}>
            Generate demo preview
          </button>
        </div>
      </div>
    </div>
  );
}
