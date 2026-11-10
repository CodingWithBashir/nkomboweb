'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Copy,
  Loader2,
  Search,
  Send,
  XCircle,
} from 'lucide-react';
import api from '@/lib/axios';

export type ApplyTrade = { id: number; code: string; name: string; tagline?: string };

type FormState = {
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  level: string;
  trade_id: string;
  previous_school: string;
  phone: string;
  email: string;
  parent_name: string;
  parent_phone: string;
  address: string;
  message: string;
};

const emptyForm: FormState = {
  first_name: '',
  last_name: '',
  gender: 'F',
  date_of_birth: '',
  level: 'L3',
  trade_id: '',
  previous_school: '',
  phone: '',
  email: '',
  parent_name: '',
  parent_phone: '',
  address: '',
  message: '',
};

const STATUS_META: Record<string, { label: string; hint: string; tone: string; icon: typeof Clock3 }> = {
  pending: {
    label: 'Received',
    hint: 'Your application is waiting to be reviewed. This usually takes a few working days.',
    tone: 'bg-navy-50 text-navy-600',
    icon: Clock3,
  },
  reviewing: {
    label: 'Under review',
    hint: 'The admissions office is looking at your file. Keep your phone reachable.',
    tone: 'bg-amber-50 text-amber-700',
    icon: ClipboardList,
  },
  waitlisted: {
    label: 'Waiting list',
    hint: 'You meet the requirements but the trade is full. We will call you if a place opens.',
    tone: 'bg-amber-50 text-amber-700',
    icon: Clock3,
  },
  accepted: {
    label: 'Accepted',
    hint: 'Congratulations. Bring the original documents to the school to complete enrolment.',
    tone: 'bg-emerald-50 text-emerald-700',
    icon: BadgeCheck,
  },
  rejected: {
    label: 'Not successful',
    hint: 'We could not offer you a place this time. You are welcome to apply again next intake.',
    tone: 'bg-red-50 text-red-700',
    icon: XCircle,
  },
};

const LEVELS = [
  { value: 'L3', label: 'Senior 1 (L3) — first year' },
  { value: 'L4', label: 'Senior 2 (L4) — transfer' },
  { value: 'L5', label: 'Senior 3 (L5) — transfer' },
];

function Field({
  label,
  children,
  hint,
  required,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-navy-400">
        {label}
        {required && <span className="text-gold-600"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-navy-300">{hint}</span>}
    </label>
  );
}

const inputClass =
  'w-full rounded-xl border border-navy-100 bg-white px-3.5 py-2.5 text-[13.5px] text-navy-600 outline-none transition placeholder:text-navy-300 focus:border-navy-300';

export default function AdmissionsContent({ trades }: { trades: ApplyTrade[] }) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState<{ reference: string; full_name: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const [reference, setReference] = useState('');
  const [looking, setLooking] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [lookup, setLookup] = useState<{
    reference: string;
    full_name: string;
    status: string;
    level: string;
    trade: { name: string; code: string } | null;
    submitted_at: string;
    is_enrolled: boolean;
    messages?: { id: number; subject: string; body: string; created_at: string }[];
  } | null>(null);

  const update = (key: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const chosenTrade = useMemo(
    () => trades.find((trade) => String(trade.id) === form.trade_id),
    [trades, form.trade_id]
  );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});

    const nextErrors: Record<string, string> = {};
    if (!form.first_name.trim()) nextErrors.first_name = 'Enter the first name.';
    if (!form.last_name.trim()) nextErrors.last_name = 'Enter the last name.';
    if (!form.trade_id) nextErrors.trade_id = 'Choose a trade.';
    if (!form.phone.trim() && !form.parent_phone.trim()) {
      nextErrors.phone = 'Give a phone number we can reach you on.';
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/admissions/applications/', {
        ...form,
        trade_id: Number(form.trade_id),
      });
      setSent({ reference: data.reference, full_name: data.full_name });
      setForm(emptyForm);
      window.scrollTo({ top: window.scrollY, behavior: 'smooth' });
    } catch (error: any) {
      const detail = error?.response?.data;
      if (detail && typeof detail === 'object') {
        const flat: Record<string, string> = {};
        for (const [key, value] of Object.entries(detail)) {
          flat[key] = Array.isArray(value) ? String(value[0]) : String(value);
        }
        setErrors(flat);
      } else {
        setErrors({ form: 'We could not send the application. Please try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const checkStatus = async (event: React.FormEvent) => {
    event.preventDefault();
    const code = reference.trim();
    if (!code) return;
    setLooking(true);
    setLookupError('');
    setLookup(null);
    try {
      const { data } = await api.get('/admissions/applications/status/', {
        params: { reference: code },
      });
      setLookup(data);
    } catch (error: any) {
      setLookupError(
        error?.response?.status === 404
          ? 'No application matches that reference. Check the code on your receipt.'
          : 'We could not check that reference just now. Please try again.'
      );
    } finally {
      setLooking(false);
    }
  };

  const status = lookup ? STATUS_META[lookup.status] ?? STATUS_META.pending : null;

  return (
    <>
      {/* ------------------------------------------------------------ apply */}
      <section id="apply" className="bg-white py-16">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-gold-600">
              Online application
            </p>
            <h2 className="mt-2 font-heading text-[30px] font-extrabold leading-tight text-navy-500">
              Apply for the 2027 intake
            </h2>
            <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-navy-400">
              Fill in the form and you will receive a reference number on the spot. Keep it safe — the
              school may ask for it when you call, and you can use it to check your status at any time.
            </p>

            {sent ? (
              <div className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
                  <div>
                    <h3 className="font-heading text-[18px] font-extrabold text-emerald-900">
                      Application received, thank you {sent.full_name.split(' ')[0]}.
                    </h3>
                    <p className="mt-1 text-[13px] text-emerald-800">
                      Save this reference — the admissions office will use it to identify your file.
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-white px-4 py-2 font-mono text-[15px] font-bold tracking-wider text-navy-600">
                        {sent.reference}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(sent.reference);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-[12px] font-bold text-emerald-700 hover:bg-emerald-50"
                      >
                        <Copy size={13} /> {copied ? 'Copied' : 'Copy'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReference(sent.reference);
                          document.getElementById('status')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-navy-500 px-3 py-2 text-[12px] font-bold text-white hover:bg-navy-600"
                      >
                        <Search size={13} /> Check status
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSent(null)}
                      className="mt-5 text-[12.5px] font-semibold text-emerald-800 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-900"
                    >
                      Apply for another student
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
                {errors.form && (
                  <p className="rounded-xl bg-red-50 px-4 py-2.5 text-[12.5px] font-medium text-red-700">
                    {errors.form}
                  </p>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="First name" required>
                    <input value={form.first_name} onChange={update('first_name')} className={inputClass} placeholder="Aline" />
                    {errors.first_name && <span className="mt-1 block text-[11.5px] text-red-600">{errors.first_name}</span>}
                  </Field>
                  <Field label="Last name" required>
                    <input value={form.last_name} onChange={update('last_name')} className={inputClass} placeholder="Mukamana" />
                    {errors.last_name && <span className="mt-1 block text-[11.5px] text-red-600">{errors.last_name}</span>}
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Date of birth">
                    <input type="date" value={form.date_of_birth} onChange={update('date_of_birth')} className={inputClass} />
                  </Field>
                  <Field label="Sex">
                    <select value={form.gender} onChange={update('gender')} className={inputClass}>
                      <option value="F">Female</option>
                      <option value="M">Male</option>
                    </select>
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Trade you want" required>
                    <select value={form.trade_id} onChange={update('trade_id')} className={inputClass}>
                      <option value="">Choose a trade…</option>
                      {trades.map((trade) => (
                        <option key={trade.id} value={trade.id}>
                          {trade.name} ({trade.code})
                        </option>
                      ))}
                    </select>
                    {errors.trade_id && <span className="mt-1 block text-[11.5px] text-red-600">{errors.trade_id}</span>}
                  </Field>
                  <Field label="Entry level">
                    <select value={form.level} onChange={update('level')} className={inputClass}>
                      {LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                {chosenTrade?.tagline && (
                  <p className="rounded-xl bg-navy-50/70 px-3.5 py-2.5 text-[12px] text-navy-500">
                    <strong className="font-bold">{chosenTrade.name}:</strong> {chosenTrade.tagline}
                  </p>
                )}

                <Field label="Previous school">
                  <input value={form.previous_school} onChange={update('previous_school')} className={inputClass} placeholder="GS Nyamagana" />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Student phone" required>
                    <input value={form.phone} onChange={update('phone')} className={inputClass} placeholder="0788 000 000" />
                    {errors.phone && <span className="mt-1 block text-[11.5px] text-red-600">{errors.phone}</span>}
                  </Field>
                  <Field label="E-mail" hint="Optional, but useful for written replies">
                    <input type="email" value={form.email} onChange={update('email')} className={inputClass} placeholder="you@example.com" />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Parent / guardian">
                    <input value={form.parent_name} onChange={update('parent_name')} className={inputClass} placeholder="Jean Mukamana" />
                  </Field>
                  <Field label="Guardian phone">
                    <input value={form.parent_phone} onChange={update('parent_phone')} className={inputClass} placeholder="0788 111 111" />
                  </Field>
                </div>

                <Field label="Address (sector / district)">
                  <input value={form.address} onChange={update('address')} className={inputClass} placeholder="Busasamana, Nyanza" />
                </Field>

                <Field label="Anything we should know?" hint="Optional — achievements, special needs, questions.">
                  <textarea value={form.message} onChange={update('message')} rows={3} className={inputClass} />
                </Field>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-[13px] font-bold text-white transition hover:bg-gold-600 disabled:opacity-60"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={15} />}
                    {submitting ? 'Sending…' : 'Submit application'}
                  </button>
                  <span className="text-[11.5px] text-navy-300">No payment is required to apply.</span>
                </div>
              </form>
            )}
          </div>

          {/* -------------------------------------------------- status lookup */}
          <aside id="status" className="lg:pt-14">
            <div className="rounded-2xl border border-navy-100 bg-navy-500 p-6 text-white">
              <h3 className="font-heading text-[19px] font-extrabold">Check your application</h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/70">
                Enter the reference you received when you applied (it looks like ADM-2026-0007).
              </p>
              <form onSubmit={checkStatus} className="mt-4 flex gap-2">
                <input
                  value={reference}
                  onChange={(event) => setReference(event.target.value.toUpperCase())}
                  placeholder="ADM-2026-0007"
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 font-mono text-[13px] tracking-wide text-white outline-none placeholder:text-white/40 focus:border-white/50"
                />
                <button
                  type="submit"
                  disabled={looking}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gold-500 px-4 py-2.5 text-[12.5px] font-bold text-white hover:bg-gold-600 disabled:opacity-60"
                >
                  {looking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search size={14} />}
                </button>
              </form>

              {lookupError && <p className="mt-3 rounded-lg bg-red-500/20 px-3 py-2 text-[12px] text-red-100">{lookupError}</p>}

              {lookup && status && (
                <div className="mt-4 rounded-xl bg-white p-4 text-navy-600">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-heading text-[14.5px] font-extrabold">{lookup.full_name}</p>
                      <p className="text-[11.5px] text-navy-400">
                        {lookup.trade ? `${lookup.trade.name} · ${lookup.level}` : lookup.level} · {lookup.reference}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide ${status.tone}`}>
                      <status.icon className="h-3 w-3" /> {status.label}
                    </span>
                  </div>
                  <p className="mt-3 text-[12px] leading-relaxed text-navy-500">{status.hint}</p>
                  {lookup.messages && lookup.messages.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {lookup.messages.map((message) => (
                        <details
                          key={message.id}
                          className="rounded-lg border border-navy-100 bg-navy-50/60 px-3 py-2"
                          open={lookup.messages?.length === 1}
                        >
                          <summary className="cursor-pointer text-[11.5px] font-bold text-navy-600">
                            {message.subject}
                          </summary>
                          <p className="mt-1.5 whitespace-pre-line text-[11.5px] leading-relaxed text-navy-500">
                            {message.body}
                          </p>
                        </details>
                      ))}
                    </div>
                  )}
                  {lookup.is_enrolled && (
                    <p className="mt-2 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11.5px] font-semibold text-emerald-700">
                      Enrolled — your student record has been created.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-navy-100 bg-white p-6">
              <h3 className="font-heading text-[15px] font-extrabold text-navy-500">Prefer to talk to us?</h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-navy-400">
                Visit the admissions office at the school in Busasamana, Nyanza, Monday to Friday between
                7:30 and 16:30.
              </p>
              <Link
                href="/contact"
                className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-navy-500 hover:text-gold-600"
              >
                Contact the school <ArrowRight size={14} />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
