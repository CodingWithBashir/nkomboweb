'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  MailCheck,
  MailWarning,
  Phone,
  RefreshCw,
  Send,
  ShieldCheck,
  UserRoundCheck,
  UserRoundX,
  X,
} from 'lucide-react';
import api from '@/lib/axios';

type Delivery = { status: 'sent' | 'logged' | 'failed' | 'queued'; subject?: string; error?: string } | null;

type Account = {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  phone: string;
  approval: 'pending' | 'rejected' | 'approved';
  has_student_record: boolean;
  created: string | null;
  decided_at: string | null;
  decided_by: string;
  note: string;
  last_email: Delivery;
};

function flatten(error: unknown): string {
  const detail = (error as { response?: { data?: unknown } })?.response?.data;
  if (!detail) return 'Something went wrong. Please try again.';
  if (typeof detail === 'string') return detail;
  if (typeof detail === 'object') {
    return Object.entries(detail as Record<string, unknown>)
      .map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(' ') : String(value)}`)
      .join(' · ');
  }
  return 'Something went wrong. Please try again.';
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

function DeliveryChip({ delivery }: { delivery: Delivery }) {
  if (!delivery) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-navy-50 px-2 py-0.5 font-bold uppercase tracking-wide text-navy-400">
        <Mail size={9} /> no letter yet
      </span>
    );
  }
  if (delivery.status === 'sent') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-bold uppercase tracking-wide text-emerald-700">
        <MailCheck size={9} /> e-mail delivered
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-bold uppercase tracking-wide text-amber-700">
      <MailWarning size={9} /> {delivery.status === 'failed' ? 'e-mail failed' : 'e-mail waiting'}
    </span>
  );
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filter, setFilter] = useState<'pending' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [refusing, setRefusing] = useState<Account | null>(null);
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/auth/registrations/');
      setAccounts(data.results ?? []);
    } catch (err) {
      setError(flatten(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 6000);
    return () => clearTimeout(timer);
  }, [notice]);

  const decide = async (account: Account, approve: boolean, refuseReason = '') => {
    setBusyId(account.id);
    setError('');
    try {
      const { data } = await api.post(
        `/auth/registrations/${account.id}/${approve ? 'approve' : 'reject'}/`,
        refuseReason ? { reason: refuseReason } : {}
      );
      setNotice(data.detail ?? 'Saved.');
      setRefusing(null);
      setReason('');
      await load();
    } catch (err) {
      setError(flatten(err));
    } finally {
      setBusyId(null);
    }
  };

  const resend = async (account: Account) => {
    setBusyId(account.id);
    setError('');
    try {
      const { data } = await api.post(`/auth/registrations/${account.id}/email/`);
      setNotice(data.detail ?? 'E-mail sent.');
      await load();
    } catch (err) {
      setError(flatten(err));
    } finally {
      setBusyId(null);
    }
  };

  const pending = accounts.filter((account) => account.approval === 'pending');
  const rejected = accounts.filter((account) => account.approval === 'rejected');
  const visible = filter === 'pending' ? pending : rejected;

  const undelivered = accounts.filter(
    (account) => account.last_email && account.last_email.status !== 'sent'
  ).length;

  const counts = useMemo(
    () => [
      { label: 'Waiting for approval', value: pending.length, icon: Clock3, tone: 'text-amber-600' },
      { label: 'Refused', value: rejected.length, icon: UserRoundX, tone: 'text-red-500' },
      { label: 'Letters not delivered', value: undelivered, icon: MailWarning, tone: 'text-gold-600' },
    ],
    [pending.length, rejected.length, undelivered]
  );

  return (
    <>
      <div className="min-h-screen bg-navy-50/50">
        <div className="mx-auto max-w-[1040px] px-5 py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-gold-600">
                Accounts
              </p>
              <h1 className="mt-2 font-heading text-[28px] font-extrabold text-navy-500">
                Registrations waiting for you
              </h1>
              <p className="mt-1.5 max-w-2xl text-[13px] text-navy-400">
                Students and parents can create their own account, but they cannot use it until the
                school accepts them. Accepting sends them an e-mail at the address they entered;
                refusing sends the decision and your reason.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/lyceeadmin/outbox"
                className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white px-4 py-2.5 text-[12.5px] font-bold text-navy-500 hover:border-navy-300"
              >
                <Mail size={14} /> E-mail outbox
              </Link>
              <button
                type="button"
                onClick={() => void load()}
                className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white px-4 py-2.5 text-[12.5px] font-bold text-navy-500 hover:border-navy-300"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
          </div>

          {(notice || error) && (
            <p
              className={`mt-5 rounded-xl px-4 py-3 text-[12.5px] font-medium ${
                error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {error || notice}
            </p>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {counts.map((card) => (
              <div key={card.label} className="rounded-2xl border border-navy-100 bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-300">
                    {card.label}
                  </p>
                  <card.icon className={`h-4 w-4 ${card.tone}`} />
                </div>
                <p className="mt-2 font-heading text-[26px] font-extrabold text-navy-500">
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-1.5">
            {(
              [
                { key: 'pending', label: `Waiting (${pending.length})` },
                { key: 'rejected', label: `Refused (${rejected.length})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`rounded-full px-3.5 py-1.5 text-[11.5px] font-bold transition ${
                  filter === tab.key
                    ? 'bg-navy-500 text-white'
                    : 'bg-white text-navy-500 hover:bg-navy-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-navy-100 bg-white">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-[13px] text-navy-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading accounts…
              </div>
            ) : visible.length === 0 ? (
              <div className="py-16 text-center">
                <ShieldCheck className="mx-auto h-8 w-8 text-navy-200" />
                <p className="mt-3 font-heading text-[15px] font-extrabold text-navy-500">
                  Nothing waiting
                </p>
                <p className="mt-1 text-[12.5px] text-navy-400">
                  New self-registrations appear here as soon as someone signs up on{' '}
                  <Link href="/login" className="font-semibold text-gold-600 underline">
                    the login page
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-navy-100">
                {visible.map((account) => (
                  <li key={account.id} className="flex flex-wrap items-center gap-4 px-4 py-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-500 font-heading text-[12.5px] font-extrabold text-white">
                      {initialsOf(account.full_name || account.username)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-heading text-[14px] font-extrabold text-navy-500">
                        {account.full_name || account.username}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] text-navy-400">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {account.email || '—'}
                        </span>
                        {account.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {account.phone}
                          </span>
                        )}
                        <span className="rounded-full bg-navy-50 px-2 py-0.5 font-bold uppercase tracking-wide text-navy-500">
                          {account.role}
                        </span>
                        <DeliveryChip delivery={account.last_email} />
                        {account.has_student_record && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-bold uppercase tracking-wide text-emerald-700">
                            has student record
                          </span>
                        )}
                      </p>
                      {account.approval === 'rejected' && (
                        <p className="mt-1 text-[11.5px] leading-relaxed text-navy-400">
                          Refused
                          {account.decided_by ? ` by ${account.decided_by}` : ''}
                          {account.decided_at ? ` on ${account.decided_at}` : ''}
                          {account.note ? ` — “${account.note}”` : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {account.approval === 'pending' ? (
                        <>
                          <button
                            type="button"
                            disabled={busyId === account.id}
                            onClick={() => void decide(account, true)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-2 text-[12px] font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {busyId === account.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <UserRoundCheck size={13} />
                            )}
                            Accept
                          </button>
                          <button
                            type="button"
                            disabled={busyId === account.id}
                            onClick={() => {
                              setRefusing(account);
                              setReason('');
                            }}
                            className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3.5 py-2 text-[12px] font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
                          >
                            <UserRoundX size={13} /> Refuse
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          disabled={busyId === account.id}
                          onClick={() => void decide(account, true)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-2 text-[12px] font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          <UserRoundCheck size={13} /> Accept anyway
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busyId === account.id || !account.email}
                        onClick={() => void resend(account)}
                        title={
                          account.email
                            ? 'Send the decision letter again'
                            : 'This account has no e-mail address'
                        }
                        className="inline-flex items-center gap-1.5 rounded-full border border-navy-200 px-3.5 py-2 text-[12px] font-bold text-navy-500 hover:border-navy-300 disabled:opacity-40"
                      >
                        <Send size={12} /> Send e-mail
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="mt-4 flex items-start gap-2 rounded-2xl border border-navy-100 bg-white px-4 py-3 text-[12px] leading-relaxed text-navy-400">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
            Every decision is stored for the person (it also appears in their portal) and e-mailed to
            the address they typed. If a letter cannot leave, it waits in the{' '}
            <Link href="/lyceeadmin/outbox" className="font-semibold text-gold-600 underline">
              e-mail outbox
            </Link>{' '}
            where you can read it and send it again.
          </p>
        </div>
      </div>

      {refusing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-600/50 p-4">
          <div className="w-full max-w-[470px] rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-[16px] font-extrabold text-navy-500">
                  Refuse {refusing.full_name || refusing.email}?
                </h2>
                <p className="mt-1 text-[12px] leading-relaxed text-navy-400">
                  They will receive an e-mail at{' '}
                  <span className="font-semibold text-navy-600">{refusing.email || 'no address'}</span>{' '}
                  explaining that the account was not accepted. You can add a short reason — it helps
                  the family understand and keeps a record for the school.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRefusing(null)}
                className="rounded-full p-1.5 text-navy-400 hover:bg-navy-50"
              >
                <X size={16} />
              </button>
            </div>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.12em] text-navy-400">
                Reason (optional)
              </span>
              <textarea
                autoFocus
                value={reason}
                onChange={(event) => setReason(event.target.value.slice(0, 600))}
                rows={3}
                placeholder="e.g. This person is already registered with their school address."
                className="w-full rounded-xl border border-navy-200 px-3.5 py-2.5 text-[13px] leading-relaxed text-navy-600 outline-none focus:border-navy-400"
              />
              <span className="mt-1 block text-right text-[10.5px] text-navy-300">
                {reason.length}/600
              </span>
            </label>

            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRefusing(null)}
                className="rounded-full border border-navy-200 px-4 py-2 text-[12.5px] font-bold text-navy-500"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busyId === refusing.id}
                onClick={() => void decide(refusing, false, reason.trim())}
                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-[12.5px] font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {busyId === refusing.id ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <UserRoundX size={13} />
                )}
                Refuse and send e-mail
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
