'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, ShieldAlert } from 'lucide-react';
import api from '@/lib/axios';
import { Crest } from '@/components/Logo';

function ResetForm() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Please use at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('The two passwords are not the same.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/auth/password/reset/', { token, password });
      setDone(true);
    } catch (err) {
      const detail = (err as { response?: { data?: { detail?: unknown; password?: string[] } } })
        ?.response?.data;
      const message =
        typeof detail?.detail === 'string'
          ? detail.detail
          : Array.isArray(detail?.password)
            ? detail.password.join(' ')
            : 'We could not change the password. Please ask for a new link.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const strength = password.length >= 12 ? 'Strong' : password.length >= 8 ? 'Good' : 'Too short';
  const strengthTone =
    password.length >= 12
      ? 'text-emerald-600'
      : password.length >= 8
        ? 'text-gold-600'
        : 'text-navy-300';

  return (
    <div className="flex min-h-screen flex-col bg-navy-50/60">
      <div className="mx-auto w-full max-w-[1020px] flex-1 px-5 py-10">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-[12px] font-bold text-navy-400 hover:text-navy-600"
        >
          <ArrowLeft size={14} /> Back to sign in
        </Link>

        <div className="mt-6 grid overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-card md:grid-cols-[0.9fr_1.1fr]">
          <div className="hidden flex-col justify-between bg-navy-600 p-8 md:flex">
            <div className="flex items-center gap-3">
              <Crest variant="light" size={44} />
              <div>
                <p className="font-heading text-[14px] font-extrabold uppercase tracking-wide text-white">
                  Lycée de Nyanza
                </p>
                <p className="text-[10.5px] uppercase tracking-[0.18em] text-gold-400">
                  School portal
                </p>
              </div>
            </div>
            <div>
              <h2 className="font-heading text-[24px] font-extrabold leading-tight text-white">
                Choose something you will remember.
              </h2>
              <p className="mt-3 max-w-[300px] text-[13px] leading-relaxed text-white/70">
                At least 8 characters. A short phrase with a number is easier to remember than a
                single word — and far safer than your name.
              </p>
            </div>
            <p className="text-[11px] leading-relaxed text-white/50">
              Every other device signed in to your account is signed out when the password changes.
            </p>
          </div>

          <div className="p-7 sm:p-9">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-gold-600">
              Password
            </p>
            <h1 className="mt-2 font-heading text-[26px] font-extrabold text-navy-500">
              Set a new password
            </h1>

            {!token ? (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-center gap-2 text-amber-800">
                  <ShieldAlert size={17} />
                  <p className="font-heading text-[14px] font-extrabold">This link is incomplete</p>
                </div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-amber-900">
                  The address is missing its token. Open the link from the e-mail exactly as it was
                  sent, or ask for a new one.
                </p>
                <Link
                  href="/forgot-password"
                  className="mt-4 inline-block rounded-full bg-amber-600 px-4 py-2 text-[12px] font-bold text-white hover:bg-amber-700"
                >
                  Ask for a new link
                </Link>
              </div>
            ) : done ? (
              <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 size={18} />
                  <p className="font-heading text-[14.5px] font-extrabold">Password changed</p>
                </div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-emerald-800">
                  You can now sign in with your new password. We sent you a short confirmation
                  message as well.
                </p>
                <Link
                  href="/login"
                  className="mt-4 inline-block rounded-full bg-emerald-600 px-4 py-2 text-[12px] font-bold text-white hover:bg-emerald-700"
                >
                  Sign in
                </Link>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.12em] text-navy-400">
                    New password
                  </span>
                  <div className="relative">
                    <LockKeyhole
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-300"
                    />
                    <input
                      required
                      type={show ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full rounded-xl border border-navy-200 bg-white py-3 pl-10 pr-11 text-[13.5px] text-navy-600 outline-none transition focus:border-navy-400 focus:ring-2 focus:ring-navy-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShow((value) => !value)}
                      aria-label={show ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-300 hover:text-navy-500"
                    >
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {password && (
                    <span className={`mt-1 block text-[11px] font-semibold ${strengthTone}`}>
                      {strength}
                    </span>
                  )}
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.12em] text-navy-400">
                    Repeat it
                  </span>
                  <input
                    required
                    type={show ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    placeholder="Same password again"
                    className="w-full rounded-xl border border-navy-200 bg-white px-3.5 py-3 text-[13.5px] text-navy-600 outline-none transition focus:border-navy-400 focus:ring-2 focus:ring-navy-100"
                  />
                </label>

                {error && (
                  <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-[12.5px] font-medium leading-relaxed text-red-700">
                    <ShieldAlert size={15} className="mt-0.5 shrink-0" /> {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-500 px-5 py-3 text-[13px] font-bold text-white transition hover:bg-gold-600 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <LockKeyhole size={15} />}
                  Save the new password
                </button>

                <p className="text-center text-[11.5px] text-navy-400">
                  Link expired?{' '}
                  <Link href="/forgot-password" className="font-semibold text-navy-500 hover:underline">
                    Ask for another one
                  </Link>
                  .
                </p>
              </form>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-[12px] text-navy-400">
          <Link href="/" className="font-semibold text-navy-500 hover:underline">
            Back to the school website
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-navy-50/60" />}>
      <ResetForm />
    </Suspense>
  );
}
