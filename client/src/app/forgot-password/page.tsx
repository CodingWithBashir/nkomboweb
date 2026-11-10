'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Loader2, Mail, ShieldAlert } from 'lucide-react';
import api from '@/lib/axios';
import { Crest } from '@/components/Logo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState('');
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSending(true);
    setError('');
    try {
      const { data } = await api.post('/auth/password/forgot/', { email: email.trim() });
      setDone(data.detail ?? 'Check your inbox for the link.');
    } catch (err) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
      setError(
        typeof detail === 'string'
          ? detail
          : 'We could not send the message just now. Please try again in a minute.'
      );
    } finally {
      setSending(false);
    }
  };

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
                One link, then a new password.
              </h2>
              <p className="mt-3 max-w-[300px] text-[13px] leading-relaxed text-white/70">
                For your safety the link is single-use and expires after 30 minutes. Your current
                password keeps working until you choose a new one.
              </p>
            </div>
            <p className="text-[11px] leading-relaxed text-white/50">
              Trouble receiving the message? Call the office on +250 788 502 229 — they can check the
              address on your record.
            </p>
          </div>

          <div className="p-7 sm:p-9">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-gold-600">
              Password help
            </p>
            <h1 className="mt-2 font-heading text-[26px] font-extrabold text-navy-500">
              Forgot your password?
            </h1>
            <p className="mt-1.5 text-[13px] leading-relaxed text-navy-400">
              Type the e-mail address you registered with. We will send a link to choose a new
              password.
            </p>

            {done ? (
              <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 size={18} />
                  <p className="font-heading text-[14.5px] font-extrabold">Message sent</p>
                </div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-emerald-800">{done}</p>
                <p className="mt-2 text-[11.5px] leading-relaxed text-emerald-700/80">
                  Nothing after a few minutes? Check the spam folder, or ask the school office to
                  confirm which e-mail address is on your record.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDone('');
                      setEmail('');
                    }}
                    className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-[12px] font-bold text-emerald-700"
                  >
                    Use another address
                  </button>
                  <Link
                    href="/login"
                    className="rounded-full bg-emerald-600 px-4 py-2 text-[12px] font-bold text-white hover:bg-emerald-700"
                  >
                    Back to sign in
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-6 space-y-4">
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

                {error && (
                  <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-[12.5px] font-medium leading-relaxed text-red-700">
                    <ShieldAlert size={15} className="mt-0.5 shrink-0" /> {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={sending || !email.trim()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-500 px-5 py-3 text-[13px] font-bold text-white transition hover:bg-gold-600 disabled:opacity-50"
                >
                  {sending ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
                  Send the reset link
                </button>

                <p className="text-center text-[11.5px] leading-relaxed text-navy-400">
                  Accounts still waiting for approval cannot reset a password — the school writes to
                  you first.
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
