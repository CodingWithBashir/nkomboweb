'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  LogOut,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { Crest } from '@/components/Logo';
import AdminShell, { isManager } from '@/components/admin/AdminShell';
import api from '@/lib/axios';
import { clearSession, readSession, signIn, type AppUser } from '@/lib/authClient';

type State = 'checking' | 'anon' | 'denied' | 'ready';

const DEMO = [
  { label: 'Head teacher', email: 'admin@lyceedenyanza.rw', password: 'Admin@2026' },
  { label: 'Director of studies', email: 'dos@lyceedenyanza.rw', password: 'Dos@2026' },
];

const MANAGER_ONLY_PREFIXES = [
  '/lyceeadmin/admissions',
  '/lyceeadmin/accounts',
  '/lyceeadmin/inbox',
  '/lyceeadmin/students',
  '/lyceeadmin/settings',
  '/lyceeadmin/reports',
  '/lyceeadmin/fees',
  '/lyceeadmin/timetable',
  '/lyceeadmin/messages',
  '/lyceeadmin/certificates',
  '/lyceeadmin/audit',
  '/lyceeadmin/system',
];

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/lyceeadmin';
  const [state, setState] = useState<State>('checking');
  const [user, setUser] = useState<AppUser | null>(null);

  const check = useCallback(async () => {
    const session = readSession();
    if (!session.token) {
      setUser(null);
      setState('anon');
      return;
    }
    try {
      const { data } = await api.get('/auth/profile/');
      setUser(data as AppUser);
      setState('ready');
    } catch {
      clearSession();
      setUser(null);
      setState('anon');
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  useEffect(() => {
    const onExpired = () => setState('anon');
    window.addEventListener('session-expired', onExpired);
    return () => window.removeEventListener('session-expired', onExpired);
  }, []);

  if (state === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-600 text-white">
        <span className="inline-flex items-center gap-2 text-[13px] text-white/70">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking your session…
        </span>
      </div>
    );
  }

  if (state === 'anon' || !user) {
    return <AdminLogin onSignedIn={check} />;
  }

  // Signed in, but not a member of staff.
  if (!isManager(user.role) && user.role !== 'teacher') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-600 px-5">
        <div className="w-full max-w-[420px] rounded-2xl bg-white p-7 text-center">
          <ShieldAlert className="mx-auto h-9 w-9 text-amber-500" />
          <h1 className="mt-3 font-heading text-[19px] font-extrabold text-navy-500">
            This area is for staff
          </h1>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-navy-400">
            You are signed in as a {user.role}, so the administration pages are not available. Your
            own portal is still open.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <Link
              href={user.role === 'student' ? '/dashboard/student' : '/dashboard/teacher'}
              className="rounded-xl bg-navy-500 py-2.5 text-[12.5px] font-bold text-white hover:bg-navy-600"
            >
              Go to my portal
            </Link>
            <button
              type="button"
              onClick={async () => {
                clearSession();
                setState('anon');
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-navy-200 py-2.5 text-[12.5px] font-bold text-navy-500 hover:border-navy-300"
            >
              <LogOut size={14} /> Sign in with a staff account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Teachers may only open their own profile.
  if (user.role === 'teacher' && MANAGER_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return (
      <AdminShell user={user}>
        <div className="mx-auto max-w-[640px] px-5 py-16">
          <div className="rounded-2xl border border-navy-100 bg-white p-7">
            <ShieldAlert className="h-8 w-8 text-amber-500" />
            <h1 className="mt-3 font-heading text-[19px] font-extrabold text-navy-500">
              Not available for teachers
            </h1>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-navy-400">
              This page is reserved for the head teacher, the director of studies and administrators.
              You can still update your own profile.
            </p>
            <Link
              href="/lyceeadmin/staff"
              className="mt-4 inline-flex rounded-xl bg-navy-500 px-4 py-2.5 text-[12.5px] font-bold text-white hover:bg-navy-600"
            >
              Open my profile
            </Link>
          </div>
        </div>
      </AdminShell>
    );
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}

/* ------------------------------------------------------------------ login */

function AdminLogin({ onSignedIn }: { onSignedIn: () => void | Promise<void> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setPending(false);
    try {
      await signIn(email, password);
      await onSignedIn();
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('waiting for the school')) setPending(true);
      else setError(message || 'That sign-in could not be completed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-navy-600">
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-gold-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-[1040px] items-center px-5 py-10">
        <div className="grid w-full gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          {/* left: identity */}
          <div className="hidden lg:block">
            <Link href="/" className="inline-flex items-center gap-3">
              <Crest variant="light" size={52} />
              <span className="flex flex-col leading-none">
                <span className="font-heading text-[19px] font-extrabold uppercase text-white">
                  Lycée de Nyanza
                </span>
                <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-400">
                  School administration
                </span>
              </span>
            </Link>

            <h1 className="mt-8 max-w-[420px] font-heading text-[36px] font-extrabold leading-[1.1] text-white">
              Staff sign-in
            </h1>
            <p className="mt-3 max-w-[380px] text-[13.5px] leading-relaxed text-white/65">
              Admissions, teaching staff, students, applications and messages — everything the school
              office works with, in one place.
            </p>

            <ul className="mt-8 space-y-2.5">
              {[
                'Head teacher, director of studies and administrators',
                'Supabase-secured sign-in',
                'Every action is tied to the person who did it',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-[12px] text-white/60">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/"
              className="mt-9 inline-flex items-center gap-1.5 text-[11.5px] font-bold text-white/50 hover:text-white"
            >
              <ArrowLeft size={13} /> Back to the website
            </Link>
          </div>

          {/* right: the form */}
          <div className="w-full">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <Crest variant="light" size={42} />
              <span className="font-heading text-[15px] font-extrabold uppercase text-white">
                Lycée de Nyanza
              </span>
            </div>

            <form
              onSubmit={submit}
              className="rounded-2xl border border-white/12 bg-white p-6 shadow-2xl sm:p-7"
            >
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold-600">
                <LockKeyhole className="h-3.5 w-3.5" /> Staff area
              </div>
              <h2 className="mt-2 font-heading text-[22px] font-extrabold text-navy-500">
                Sign in to continue
              </h2>
              <p className="mt-1 text-[12.5px] text-navy-400">
                Use the e-mail address the school gave you.
              </p>

              {pending && (
                <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[12px] leading-relaxed text-amber-900">
                  This account is still waiting for the school to approve it. You will be able to sign
                  in as soon as the administration accepts it.
                </p>
              )}
              {error && (
                <p className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-[12px] font-medium text-red-700">
                  {error}
                </p>
              )}

              <label className="mt-5 block">
                <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.16em] text-navy-400">
                  E-mail address
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="username"
                  placeholder="you@lyceedenyanza.rw"
                  className="w-full rounded-xl border border-navy-100 bg-white px-3.5 py-2.5 text-[13.5px] text-navy-600 outline-none transition placeholder:text-navy-300 focus:border-navy-300"
                />
              </label>

              <label className="mt-3.5 block">
                <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.16em] text-navy-400">
                  Password
                </span>
                <span className="relative block">
                  <input
                    type={show ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-navy-100 bg-white px-3.5 py-2.5 pr-11 text-[13.5px] text-navy-600 outline-none transition placeholder:text-navy-300 focus:border-navy-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((value) => !value)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-navy-300 hover:text-navy-500"
                    aria-label={show ? 'Hide password' : 'Show password'}
                  >
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </span>
                <a
                  href="/forgot-password"
                  className="mt-1.5 inline-block text-[11px] font-semibold text-navy-400 underline-offset-4 hover:text-navy-600 hover:underline"
                >
                  Forgot your password?
                </a>
              </label>

              <button
                type="submit"
                disabled={busy}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gold-500 py-3 text-[13.5px] font-bold text-white shadow-sm transition hover:bg-gold-600 disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {busy ? 'Signing in…' : 'Sign in'}
              </button>

              <div className="mt-5 border-t border-navy-100 pt-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-navy-300">
                  Demo accounts
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {DEMO.map((account) => (
                    <button
                      key={account.email}
                      type="button"
                      onClick={() => {
                        setEmail(account.email);
                        setPassword(account.password);
                        setError('');
                        setPending(false);
                      }}
                      className="rounded-full border border-navy-100 px-2.5 py-1 text-[10.5px] font-semibold text-navy-500 hover:border-navy-300"
                    >
                      {account.label}
                    </button>
                  ))}
                </div>
              </div>
            </form>

            <p className="mt-4 text-center text-[11.5px] text-white/50">
              Student or parent?{' '}
              <Link href="/login" className="font-bold text-white/80 underline underline-offset-4">
                Use the portal sign-in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
