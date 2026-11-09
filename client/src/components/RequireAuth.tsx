'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import { clearSession, readSession } from '@/lib/authClient';

type Props = {
  /** Roles allowed to view the page. Omit to allow any signed-in user. */
  roles?: string[];
  children: React.ReactNode;
};

/**
 * Client-side route guard for the portal pages. The API token lives in
 * localStorage, so protection happens here rather than in middleware.
 */
export default function RequireAuth({ roles, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<'checking' | 'allowed' | 'denied'>('checking');
  const roleKey = (roles ?? []).join(',');

  useEffect(() => {
    const { token } = readSession();
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(pathname || '/')}`);
      return;
    }

    let active = true;
    api
      .get('/auth/profile/')
      .then(({ data }) => {
        if (!active) return;
        const allowed = !roleKey || roleKey.split(',').includes(data.role);
        localStorage.setItem('user', JSON.stringify(data));
        setStatus(allowed ? 'allowed' : 'denied');
      })
      .catch(() => {
        if (!active) return;
        clearSession();
        router.replace(`/login?next=${encodeURIComponent(pathname || '/')}`);
      });

    return () => {
      active = false;
    };
  }, [router, pathname, roleKey]);

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-50">
        <div className="flex items-center gap-3 text-navy-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Checking your access…</span>
        </div>
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-navy-50 px-6 text-center">
        <h1 className="font-heading text-2xl font-extrabold text-navy-500">Not available for this account</h1>
        <p className="max-w-md text-sm text-navy-400">
          This dashboard belongs to a different role. Sign in with an account that matches, or
          return to the school website.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              clearSession();
              router.replace('/login');
            }}
            className="rounded-full bg-navy-500 px-5 py-2.5 text-[13px] font-bold text-white"
          >
            Sign out
          </button>
          <a href="/" className="rounded-full border border-navy-200 px-5 py-2.5 text-[13px] font-bold text-navy-500">
            Back to website
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
