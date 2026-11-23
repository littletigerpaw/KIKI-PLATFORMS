const collections = [
  { name: 'New arrivals', accent: '#fdf2f8' },
  { name: 'Best sellers', accent: '#eef2ff' },
  { name: 'Limited edition', accent: '#ecfeff' },
];

const featuredProducts = [
  { name: 'Classic Leather Tote', price: '$128', tag: 'Best seller' },
  { name: 'Minimal Desk Lamp', price: '$74', tag: 'New arrival' },
  { name: 'Cozy Knit Set', price: '$96', tag: 'Limited drop' },
  { name: 'Trail Runner', price: '$146', tag: 'Popular' },
];

const brandHighlights = [
  'Free shipping over $75',
  'Easy returns within 30 days',
  'Gift-ready packaging',
];

export function StorefrontPreview() {
  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '22px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#6b7280', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Storefront</div>
          <h2 style={{ margin: '8px 0 0', fontSize: '26px' }}>Nova Atelier</h2>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button style={{ background: '#ffffff', color: '#111827', border: '1px solid #d1d5db', borderRadius: '999px', padding: '10px 18px', fontWeight: 600 }}>Collections</button>
          <button style={{ background: '#111827', color: '#fff', border: 'none', borderRadius: '999px', padding: '10px 18px', fontWeight: 600 }}>Shop now</button>
        </div>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)', borderRadius: '18px', minHeight: '260px', padding: '24px', display: 'flex', alignItems: 'flex-end' }}>
        <div style={{ background: 'rgba(255,255,255,0.86)', backdropFilter: 'blur(4px)', borderRadius: '16px', padding: '18px 20px', width: 'min(78%, 620px)' }}>
          <div style={{ fontSize: '13px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.12em' }}>New arrivals</div>
          <h3 style={{ margin: '10px 0', fontSize: '34px', lineHeight: 1.1 }}>Discover your next favorite</h3>
          <p style={{ margin: '0 0 18px', color: '#4b5563', fontSize: '16px' }}>Minimal luxury essentials for everyday living.</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button style={{ background: '#111827', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 16px', fontWeight: 700 }}>Shop collection</button>
            <button style={{ background: '#fff', color: '#111827', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 16px', fontWeight: 700 }}>Book a styling call</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px', marginTop: '20px' }}>
        {collections.map((collection) => (
          <div key={collection.name} style={{ background: collection.accent, border: '1px solid #e5e7eb', borderRadius: '14px', padding: '18px', minHeight: '120px', display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ fontWeight: 700, fontSize: '18px' }}>{collection.name}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '18px' }}>
        {featuredProducts.map((product) => (
          <div key={product.name} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '14px', boxShadow: '0 6px 16px rgba(15, 23, 42, 0.03)' }}>
            <div style={{ background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)', borderRadius: '12px', minHeight: '138px', marginBottom: '12px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ background: '#eef2ff', color: '#4338ca', borderRadius: '999px', padding: '4px 8px', fontSize: '11px', fontWeight: 700 }}>{product.tag}</span>
              <span style={{ fontWeight: 700 }}>{product.price}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: '16px' }}>{product.name}</div>
            <button style={{ width: '100%', marginTop: '12px', background: '#111827', color: '#fff', border: 'none', borderRadius: '10px', padding: '9px 12px', fontWeight: 700 }}>Add to cart</button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '18px' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '18px' }}>
          <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280' }}>Why shoppers stay</div>
          <h3 style={{ margin: '10px 0 12px', fontSize: '24px' }}>Thoughtful pieces, built for real life.</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            {brandHighlights.map((item) => (
              <div key={item} style={{ background: '#f9fafb', borderRadius: '10px', padding: '10px 12px', border: '1px solid #e5e7eb' }}>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#111827', borderRadius: '16px', padding: '18px', color: '#fff' }}>
          <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.8 }}>Customer favorite</div>
          <h3 style={{ margin: '10px 0', fontSize: '24px' }}>“It feels elevated without trying too hard.”</h3>
          <div style={{ fontSize: '15px', opacity: 0.8 }}>Alicia M. • Verified buyer</div>
        </div>
      </div>
    </div>
  );
}
