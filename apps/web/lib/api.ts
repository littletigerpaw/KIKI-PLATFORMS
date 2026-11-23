// Shared API + sign-in helpers. Every backend call should go through apiFetch
// so the signed-in user's token is attached and expired sessions are handled.

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// "dev": sign in with just an email (local development only; the backend refuses this in production).
// "firebase": real Firebase sign-in (needs NEXT_PUBLIC_FIREBASE_* config; not wired up yet).
export const AUTH_MODE = (process.env.NEXT_PUBLIC_AUTH_MODE ?? 'dev') as 'dev' | 'firebase';

const AUTH_KEY = 'kiki-auth';
const WORKSPACE_KEY = 'kiki-merchant-session';

export type AuthSession = { token: string; email: string };

export type Workspace = {
  merchantId?: string;
  storeId?: string;
  merchantName: string;
  storeName: string;
  businessType: string;
  email: string;
  tenantId: string;
  plan: string;
};

export type StoreRecord = {
  id: string;
  merchant_id: string;
  name: string;
  slug: string;
  domain?: string | null;
  status: string;
  business_type: string;
};

export type Membership = {
  merchant_id: string;
  merchant_name: string;
  role: string;
  permissions: string[];
  stores: StoreRecord[];
};

export type Me = { uid: string; email: string; memberships: Membership[] };

function readJson<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function getAuth(): AuthSession | null {
  const auth = readJson<AuthSession>(AUTH_KEY);
  return auth?.token ? auth : null;
}

export function setAuth(auth: AuthSession): void {
  window.localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  window.dispatchEvent(new Event('kiki-auth-changed'));
}

export function signOut(): void {
  window.localStorage.removeItem(AUTH_KEY);
  window.localStorage.removeItem(WORKSPACE_KEY);
  window.dispatchEvent(new Event('kiki-auth-changed'));
}

export function getWorkspace(): Partial<Workspace> | null {
  return readJson<Partial<Workspace>>(WORKSPACE_KEY);
}

export function setWorkspace(workspace: Workspace): void {
  window.localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace));
}

export function devToken(email: string): string {
  return `dev:${email.trim().toLowerCase()}`;
}

/** Send the user to the login page, coming back here afterwards. */
export function redirectToLogin(): void {
  const next = `${window.location.pathname}${window.location.search}`;
  window.location.assign(`/login?next=${encodeURIComponent(next)}`);
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const auth = getAuth();
  if (auth) headers.set('Authorization', `Bearer ${auth.token}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

  if (response.status === 401 && typeof window !== 'undefined') {
    signOut();
    redirectToLogin();
  }
  return response;
}

/** Turn a FastAPI error body (string or validation list) into one readable line. */
export function errorMessage(payload: unknown, fallback: string): string {
  const detail = (payload as { detail?: unknown })?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { loc?: unknown[]; msg?: string };
    const field = Array.isArray(first.loc) ? String(first.loc[first.loc.length - 1]) : '';
    return field ? `${field.replace(/_/g, ' ')}: ${first.msg}` : first.msg ?? fallback;
  }
  return fallback;
}

/** Pick the first workspace from /me and remember it for the dashboard. */
export function workspaceFromMe(me: Me): Workspace | null {
  const membership = me.memberships[0];
  if (!membership) return null;
  const store = membership.stores[0];
  return {
    merchantId: membership.merchant_id,
    storeId: store?.id,
    merchantName: membership.merchant_name,
    storeName: store?.name ?? 'Your storefront',
    businessType: store?.business_type ?? 'commerce',
    email: me.email,
    tenantId: membership.merchant_id,
    plan: 'Pro merchant',
  };
}
