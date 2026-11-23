'use client';

import { useEffect, useState } from 'react';

import { AuthSession, getAuth, redirectToLogin } from '@/lib/api';

/** Current sign-in, kept in sync across tabs and components. `undefined` while loading. */
export function useAuth(): AuthSession | null | undefined {
  const [auth, setAuthState] = useState<AuthSession | null | undefined>(undefined);

  useEffect(() => {
    const sync = () => setAuthState(getAuth());
    sync();
    window.addEventListener('kiki-auth-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('kiki-auth-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return auth;
}

/** For private pages: sends signed-out visitors to /login and back afterwards. */
export function useRequireAuth(): AuthSession | null {
  const auth = useAuth();
  useEffect(() => {
    if (auth === null) redirectToLogin();
  }, [auth]);
  return auth ?? null;
}
