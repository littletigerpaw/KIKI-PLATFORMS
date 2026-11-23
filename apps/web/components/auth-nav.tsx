'use client';

import Link from 'next/link';

import { signOut } from '@/lib/api';
import { useAuth } from '@/lib/use-auth';

const linkStyle = { color: '#374151', textDecoration: 'none', fontWeight: 600 } as const;

export function AuthNav() {
  const auth = useAuth();

  if (auth === undefined) return null; // avoid flashing the wrong links while loading

  if (!auth) {
    return (
      <>
        <Link href="/login" style={linkStyle}>Login</Link>
        <Link href="/signup" style={{ color: '#111827', textDecoration: 'none', fontWeight: 700 }}>Sign up</Link>
      </>
    );
  }

  return (
    <>
      <Link href="/dashboard" style={linkStyle}>Dashboard</Link>
      <span style={{ color: '#6b7280', fontSize: '14px' }}>{auth.email}</span>
      <button
        type="button"
        onClick={() => {
          signOut();
          window.location.assign('/');
        }}
        style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: '10px', padding: '6px 12px', fontWeight: 600, color: '#111827', cursor: 'pointer' }}
      >
        Sign out
      </button>
    </>
  );
}
