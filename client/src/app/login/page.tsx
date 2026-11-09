'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { Crest } from '@/components/Logo';
import { dashboardFor, signIn, signUp } from '@/lib/authClient';
import { SCHOOL } from '@/lib/school';

type Mode = 'signin' | 'signup';

const DEMO_ACCOUNTS = [
  { label: 'Head teacher', email: 'admin@lyceedenyanza.rw', password: 'Admin@2026' },
  { label: 'Director of studies', email: 'dos@lyceedenyanza.rw', password: 'Dos@2026' },
  { label: 'Teacher', email: 'teacher@lyceedenyanza.rw', password: 'Teacher@2026' },
  { label: 'Student', email: 'student@lyceedenyanza.rw', password: 'Student@2026' },
];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      const session =
        mode === 'signin'
          ? await signIn(email, password)
          : await (async () => {
              const result = await signUp({ fullName, email, password });
              if (!result.session) {
                setNotice(
                  'Almost there — confirm your e-mail address, then sign in with the same details.'
                );
                setMode('signin');
                return null;
              }
              return result.session;
            })();

      if (!session) return;
      if (session.provider === 'local') {
        setNotice('Supabase could not be reached, so you were signed in with the school directory.');
      }
      router.push(dashboardFor(session.user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That sign-in could not be completed.');
    } finally {
      setBusy(false);
    }
  };

  const fillDemo = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setMode('signin');
    setEmail(account.email);
    setPassword(account.password);
    setError('');
    setNotice('');
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* ---------------------------------------------------------- brand side */}
      <div className="relative hidden overflow-hidden bg-navy-500 lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: "url('/images/hero-students.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-700/90 via-navy-600/80 to-navy-500/70" />
        <div
          className="absolute -right-24 top-1/3 h-[420px] w-[420px] rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #3fc800 0%, transparent 65%)' }}
        />

        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-3">
            <Crest variant="light" size={52} />
            <span className="flex flex-col leading-none">
              <span className="font-heading text-[21px] font-extrabold uppercase text-white">
                Lycée de Nyanza
              </span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-300">
                Excellence through discipline
              </span>
            </span>
          </Link>

          <div className="max-w-[420px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-gold-300">
              School portal
            </p>
            <h1 className="mt-3 font-heading text-[38px] font-extrabold leading-[1.08] text-white">
              One account for the whole school year.
            </h1>
            <p className="mt-4 text-[13.5px] leading-relaxed text-white/70">
              Marks, attendance, holiday material and staff profiles — for the head teacher, the
              director of studies, teachers and students. Accounts are secured by Supabase.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {[
                { icon: ShieldCheck, label: 'Supabase-secured sign-in' },
                { icon: LockKeyhole, label: 'Role-based access' },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11.5px] font-semibold text-white/80"
                >
                  <Icon size={13} className="text-gold-300" /> {label}
                </span>
              ))}
            </div>
          </div>

          <p className="text-[11.5px] text-white/45">
            {SCHOOL.location} · {SCHOOL.phone}
          </p>
        </div>
      </div>

      {/* ----------------------------------------------------------- form side */}
      <div className="flex items-center justify-center bg-white px-5 py-10 sm:px-10">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Crest size={44} />
            <span className="font-heading text-[17px] font-extrabold uppercase text-navy-500">
              Lycée de Nyanza
            </span>
          </div>

          <h2 className="font-heading text-[26px] font-extrabold leading-tight text-navy-500">
            {mode === 'signin' ? 'Sign in to the portal' : 'Create your account'}
          </h2>
          <p className="mt-1.5 text-[13px] text-navy-400">
            {mode === 'signin'
              ? 'Use the e-mail address the school gave you.'
              : 'Students and parents can register; staff roles are assigned by the school.'}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-1 rounded-full bg-navy-50 p-1">
            {(['signin', 'signup'] as Mode[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMode(item);
                  setError('');
                  setNotice('');
                }}
                className={`rounded-full py-2 text-[12.5px] font-bold transition ${
                  mode === item ? 'bg-white text-navy-500 shadow-sm' : 'text-navy-400'
                }`}
              >
                {item === 'signin' ? 'Sign in' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === 'signup' && (
              <label className="block">
                <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.12em] text-navy-400">
                  Full name
                </span>
                <div className="relative">
                  <UserRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-300" />
                  <input
                    required
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Aline Uwase"
                    className="w-full rounded-xl border border-navy-200 bg-white py-3 pl-10 pr-3 text-[13.5px] text-navy-600 outline-none transition focus:border-navy-400 focus:ring-2 focus:ring-navy-100"
                  />
                </div>
              </label>
            )}

            <label className="block">
              <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.12em] text-navy-400">
                E-mail address
              </span>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-300" />
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@lyceedenyanza.rw"
                  className="w-full rounded-xl border border-navy-200 bg-white py-3 pl-10 pr-3 text-[13.5px] text-navy-600 outline-none transition focus:border-navy-400 focus:ring-2 focus:ring-navy-100"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.12em] text-navy-400">
                Password
              </span>
              <div className="relative">
                <LockKeyhole size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-300" />
                <input
                  required
                  minLength={6}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-navy-200 bg-white py-3 pl-10 pr-11 text-[13.5px] text-navy-600 outline-none transition focus:border-navy-400 focus:ring-2 focus:ring-navy-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-300 hover:text-navy-500"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            {error && (
              <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[12.5px] font-medium text-red-700">
                {error}
              </p>
            )}
            {notice && (
              <p className="rounded-xl bg-gold-50 px-3.5 py-2.5 text-[12.5px] font-medium text-gold-700">
                {notice}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold-500 py-3.5 text-[13.5px] font-bold text-white shadow-sm transition hover:bg-gold-600 disabled:opacity-60"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : null}
              {busy ? 'Signing you in…' : mode === 'signin' ? 'Sign in' : 'Create account'}
              {!busy && <ArrowRight size={15} />}
            </button>
          </form>

          <div className="mt-8 rounded-2xl border border-navy-100 bg-navy-50/60 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-navy-400">
              Demo accounts
            </p>
            <div className="mt-2.5 grid gap-1.5">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => fillDemo(account)}
                  className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-left text-[11.5px] transition hover:shadow-sm"
                >
                  <span className="font-bold text-navy-500">{account.label}</span>
                  <span className="text-navy-400">{account.email}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-[12px] text-navy-400">
            <Link href="/" className="font-semibold text-navy-500 hover:underline">
              Back to the school website
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
