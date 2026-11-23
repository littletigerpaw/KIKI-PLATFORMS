'use client';

import { FormEvent, useEffect, useState } from 'react';

import { apiFetch, errorMessage, setWorkspace } from '@/lib/api';
import { useRequireAuth } from '@/lib/use-auth';

type FormState = {
  merchantName: string;
  merchantEmail: string;
  storeName: string;
  storeSlug: string;
  storeDomain: string;
  businessType: string;
};

const businessTypeOptions = [
  { value: 'commerce', label: 'Sell my own products' },
  { value: 'dropshipping', label: 'Dropshipping' },
  { value: 'restaurant', label: 'Restaurant / food brand' },
  { value: 'booking', label: 'Bookings / services' },
];

const initialState: FormState = {
  merchantName: '',
  merchantEmail: '',
  storeName: '',
  storeSlug: '',
  storeDomain: '',
  businessType: 'commerce',
};

const getFriendlyOnboardingError = (rawMessage: string): string => {
  const normalized = rawMessage.toLowerCase();

  if (normalized.includes('fetch') || normalized.includes('network') || normalized.includes('connection')) {
    return 'Your connection is temporarily unavailable. Please try again in a moment.';
  }

  if (normalized.includes('already exists') || normalized.includes('duplicate') || normalized.includes('taken') || normalized.includes('slug')) {
    return 'That store name or URL is already in use. Please choose a different one.';
  }

  if (normalized.includes('email')) {
    return 'Please use a valid business email address.';
  }

  if (normalized.includes('required') || normalized.includes('missing')) {
    return 'Please complete every required field before continuing.';
  }

  return 'We could not finish setting up your storefront. Please review your details and try again.';
};

export function OnboardingForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const auth = useRequireAuth();

  // Suggest the signed-in email as the business contact; the user can change it.
  useEffect(() => {
    if (auth?.email) {
      setForm((current) => (current.merchantEmail ? current : { ...current, merchantEmail: auth.email }));
    }
  }, [auth?.email]);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const requiredFields = [form.merchantName, form.merchantEmail, form.storeName, form.storeSlug];
    if (requiredFields.some((value) => !value.trim())) {
      setError('Please complete every required field before continuing.');
      setLoading(false);
      return;
    }

    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.merchantEmail.trim());
    if (!emailIsValid) {
      setError('Please use a valid business email address.');
      setLoading(false);
      return;
    }

    try {
      const response = await apiFetch('/onboarding', {
        method: 'POST',
        body: JSON.stringify({
          merchant_name: form.merchantName,
          merchant_email: form.merchantEmail,
          store_name: form.storeName,
          store_slug: form.storeSlug.trim().toLowerCase(),
          store_domain: form.storeDomain || null,
          business_type: form.businessType,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (response.status === 401) {
        return; // apiFetch is already sending the user to sign in
      }
      if (response.status === 409) {
        setError(getFriendlyOnboardingError(errorMessage(payload, 'already exists')));
        return;
      }
      if (!response.ok) {
        setError(errorMessage(payload, 'We could not create your merchant account right now.'));
        return;
      }

      setWorkspace({
        merchantId: payload?.merchant?.id ?? undefined,
        storeId: payload?.store?.id ?? undefined,
        merchantName: form.merchantName,
        storeName: form.storeName,
        businessType: form.businessType,
        email: auth?.email ?? form.merchantEmail,
        tenantId: payload?.merchant?.id ?? '',
        plan: 'Pro merchant',
      });
      setMessage(`Your ${form.businessType} workspace is ready. Redirecting you to your private dashboard...`);
      window.location.assign('/dashboard');
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Something went wrong while setting up your store.';
      setError(getFriendlyOnboardingError(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f3f6fb', padding: '40px 24px', color: '#111827' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#6b7280' }}>
            Merchant onboarding
          </div>
          <h1 style={{ margin: '10px 0 0', fontSize: '38px' }}>Set up your business on KIKI</h1>
        </div>

        <form onSubmit={handleSubmit} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '24px', padding: '28px', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Merchant name</label>
              <input
                value={form.merchantName}
                onChange={(event) => updateField('merchantName', event.target.value)}
                placeholder="North Shore Tours"
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Merchant email</label>
              <input
                type="email"
                value={form.merchantEmail}
                onChange={(event) => updateField('merchantEmail', event.target.value)}
                placeholder="hello@northshoretours.com"
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Store name</label>
              <input
                value={form.storeName}
                onChange={(event) => updateField('storeName', event.target.value)}
                placeholder="North Shore Tours Co."
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Store slug</label>
              <input
                value={form.storeSlug}
                onChange={(event) => updateField('storeSlug', event.target.value)}
                placeholder="north-shore-tours"
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Custom domain</label>
              <input
                value={form.storeDomain}
                onChange={(event) => updateField('storeDomain', event.target.value)}
                placeholder="northshoretours.com"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Business type</label>
              <select
                value={form.businessType}
                onChange={(event) => updateField('businessType', event.target.value)}
                style={inputStyle}
              >
                {businessTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginTop: '18px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '16px 18px', color: '#374151', lineHeight: 1.6 }}>
            Each merchant gets an isolated workspace with its own customers, products, orders, mobile app, and brand settings. Platform owners can manage infrastructure, but your store data remains private to your account.
          </div>

          <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {error ? (
              <div aria-live="polite" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '12px', padding: '10px 12px', fontWeight: 600, flex: '1 1 240px' }}>{error}</div>
            ) : null}
            {message ? (
              <div aria-live="polite" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#166534', borderRadius: '12px', padding: '10px 12px', fontWeight: 600, flex: '1 1 240px' }}>{message}</div>
            ) : null}
            <button type="button" style={secondaryButtonStyles}>Save draft</button>
            <button type="submit" disabled={loading} style={{ ...primaryButtonStyles, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating account...' : 'Create merchant account'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  fontSize: '14px',
  fontWeight: 700,
  color: '#374151',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #d1d5db',
  borderRadius: '12px',
  padding: '12px 14px',
  fontSize: '15px',
  background: '#ffffff',
  color: '#111827',
  outline: 'none',
};

const primaryButtonStyles: React.CSSProperties = {
  background: '#111827',
  color: '#ffffff',
  border: 'none',
  borderRadius: '12px',
  padding: '12px 18px',
  fontWeight: 700,
  cursor: 'pointer',
};

const secondaryButtonStyles: React.CSSProperties = {
  background: '#f3f4f6',
  color: '#111827',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '11px 16px',
  fontWeight: 600,
  cursor: 'pointer',
};
