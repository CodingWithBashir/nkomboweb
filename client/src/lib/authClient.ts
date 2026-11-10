'use client';

import { SUPABASE_ANON_KEY, SUPABASE_BRIDGE_URL, supabase } from './supabase';

/**
 * Sign-in for the school site.
 *
 * Accounts live in Supabase: the browser signs in there, and the resulting
 * session is exchanged for a token from this site's own API (which keeps the
 * school data in its own database). If Supabase cannot be reached — offline
 * preview, blocked network — the same credentials are tried against the local
 * user directory so the portal stays usable.
 */

export type AppUser = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  role: string;
  phone?: string;
  is_staff?: boolean;
  can_manage_staff?: boolean;
};

export type AppSession = { token: string; user: AppUser; provider: 'supabase' | 'local' };

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export function readSession(): { token: string | null; user: AppUser | null } {
  if (typeof window === 'undefined') return { token: null, user: null };
  const token = window.localStorage.getItem(TOKEN_KEY);
  let user: AppUser | null = null;
  try {
    user = JSON.parse(window.localStorage.getItem(USER_KEY) || 'null');
  } catch {
    user = null;
  }
  return { token, user };
}

export function saveSession(session: { token: string; user: AppUser }) {
  window.localStorage.setItem(TOKEN_KEY, session.token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function dashboardFor(role?: string) {
  switch (role) {
    case 'headmaster':
    case 'admin':
      return '/lyceeadmin';
    case 'dos':
      return '/dashboard/dos';
    case 'teacher':
      return '/dashboard/teacher';
    case 'student':
      return '/dashboard/student';
    default:
      return '/';
  }
}

async function postJson<T>(url: string, body: unknown, token?: string): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as T & { detail?: string; error?: string };
  if (!response.ok) {
    throw new Error(data?.detail || data?.error || 'That sign-in could not be completed.');
  }
  return data;
}

/** Asks the Supabase edge function to vouch for the session we just created. */
async function bridgeSession(accessToken: string) {
  const response = await fetch(SUPABASE_BRIDGE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });
  if (!response.ok) throw new Error('bridge-unavailable');
  return (await response.json()) as { uid: string; email: string; exp: number; sig: string };
}

async function exchange(accessToken: string, fullName?: string) {
  const bridge = await bridgeSession(accessToken);
  const data = await postJson<{ token: string; user: AppUser }>('/api/auth/supabase/', {
    access_token: accessToken,
    bridge,
    full_name: fullName,
  });
  const session: AppSession = { ...data, provider: 'supabase' };
  saveSession(session);
  return session;
}

async function localFallback(email: string, password: string): Promise<AppSession> {
  const data = await postJson<{ token: string; user: AppUser }>('/api/auth/login/', {
    username: email,
    password,
  });
  const session: AppSession = { ...data, provider: 'local' };
  saveSession(session);
  return session;
}

export async function signIn(email: string, password: string): Promise<AppSession> {
  const address = email.trim().toLowerCase();

  try {
    const { data, error } = await supabase().auth.signInWithPassword({
      email: address,
      password,
    });
    if (error) {
      // Supabase answered and refused the credentials; do not fall through.
      throw new Error(error.message);
    }
    if (!data.session?.access_token) throw new Error('Your session could not be created.');
    return await exchange(data.session.access_token, data.user?.user_metadata?.full_name);
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    const unreachable =
      message === 'bridge-unavailable' ||
      message.includes('could not be verified') ||
      message.includes('Failed to fetch') ||
      message.includes('NetworkError') ||
      message.includes('Load failed');

    if (!unreachable) throw err;
    return localFallback(address, password);
  }
}

export async function signUp(input: {
  fullName: string;
  email: string;
  password: string;
}): Promise<{ session?: AppSession; needsConfirmation?: boolean; pending?: boolean }> {
  const address = input.email.trim().toLowerCase();
  const { data, error } = await supabase().auth.signUp({
    email: address,
    password: input.password,
    options: { data: { full_name: input.fullName, role: 'student' } },
  });
  if (error) throw new Error(error.message);
  if (!data.session?.access_token) return { needsConfirmation: true };

  try {
    return { session: await exchange(data.session.access_token, input.fullName) };
  } catch (err) {
    // The account exists but the school has not approved it yet — that is the
    // normal path for students and parents who register themselves.
    const message = err instanceof Error ? err.message : '';
    if (message.includes('waiting for the school') || message.includes('not accepted')) {
      await supabase().auth.signOut().catch(() => undefined);
      return { pending: true };
    }
    throw err;
  }
}

export async function signOut() {
  try {
    const { token } = readSession();
    if (token) {
      await fetch('/api/auth/logout/', {
        method: 'POST',
        headers: { Authorization: `Token ${token}` },
      });
    }
  } catch {
    /* signing out locally is enough */
  }
  try {
    await supabase().auth.signOut();
  } catch {
    /* the Supabase session may already be gone */
  }
  clearSession();
}
