'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { AUTH_MODE, API_BASE_URL, Me, devToken, errorMessage, setAuth, setWorkspace, signOut, workspaceFromMe } from '@/lib/api';

const inputStyle = { border: '1px solid #d1d5db', borderRadius: '12px', padding: '12px 14px', fontSize: '15px' };

/** Only allow redirects back into this site, never to another domain. */
function safeNext(raw: string | null): string | null {
  return raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : null;
}

function LoginForm() {
  const params = useSearchParams();
  const next = safeNext(params.get('next'));
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const token = devToken(trimmedEmail);
      // Ask the backend who we are; this also proves the token is accepted.
      const response = await fetch(`${API_BASE_URL}/me`, { headers: { Authorization: `Bearer ${token}` } });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(errorMessage(payload, 'We could not sign you in.'));
      }

      signOut(); // drop any previous user's workspace
      setAuth({ token, email: trimmedEmail });

      const workspace = workspaceFromMe(payload as Me);
      if (workspace) {
        setWorkspace(workspace);
        window.location.assign(next ?? '/dashboard');
      } else {
        // Signed in but no business yet: set one up first.
        window.location.assign('/onboarding');
      }
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : '';
      setError(
        message.toLowerCase().includes('fetch')
          ? 'The KIKI server is not reachable. Is the backend running on port 8000?'
          : message || 'We could not sign you in right now.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (AUTH_MODE === 'firebase') {
    return (
      <p style={{ color: '#4b5563', lineHeight: 1.6 }}>
        Firebase sign-in is selected (NEXT_PUBLIC_AUTH_MODE=firebase) but is not connected yet. Add the Firebase web
        config to finish setting it up.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', borderRadius: '12px', padding: '10px 12px', fontSize: '13px', lineHeight: 1.5 }}>
        <strong>Local development sign-in.</strong> Enter any email to sign in as that person. No password is
        needed. This mode is turned off in production, where Firebase sign-in will be used.
      </div>

      <label style={{ display: 'grid', gap: '8px', fontWeight: 700, color: '#374151' }}>
        Email
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@brand.com"
          style={inputStyle}
          aria-invalid={Boolean(error)}
          autoFocus
        />
      </label>

      {error ? (
        <div aria-live="polite" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '12px', padding: '10px 12px', fontSize: '14px', fontWeight: 600 }}>
          {error}
        </div>
      ) : null}

      <button type="submit" disabled={loading} style={{ background: '#111827', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px 16px', fontWeight: 700, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}>
        {loading ? 'Signing in...' : 'Sign in'}
      </button>

      <div style={{ color: '#4b5563', fontSize: '14px', textAlign: 'center' }}>
        New here? Sign in with your email, then you&apos;ll set up your business.
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#f5f7fb', padding: '40px 24px', color: '#111827' }}>
      <div style={{ maxWidth: '460px', margin: '0 auto', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '24px', padding: '30px 24px', boxShadow: '0 12px 30px rgba(15,23,42,0.04)' }}>
        <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280' }}>Merchant login</div>
        <h1 style={{ margin: '12px 0 16px', fontSize: '32px' }}>Sign in to KIKI</h1>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
