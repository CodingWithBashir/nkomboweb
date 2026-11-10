'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  UserRoundCheck,
  UserRoundX,
} from 'lucide-react';
import api from '@/lib/axios';

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

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filter, setFilter] = useState<'pending' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

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
    const timer = setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const decide = async (account: Account, approve: boolean) => {
    setBusyId(account.id);
    setError('');
    try {
      await api.post(`/auth/registrations/${account.id}/${approve ? 'approve' : 'reject'}/`);
      setNotice(
        approve
          ? `${account.full_name || account.email} can now sign in — an acceptance message was sent to them.`
          : `${account.full_name || account.email} was refused and told about the decision.`
      );
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

  const counts = useMemo(
    () => [
      { label: 'Waiting for approval', value: pending.length, icon: Clock3, tone: 'text-amber-600' },
      { label: 'Refused', value: rejected.length, icon: UserRoundX, tone: 'text-red-500' },
    ],
    [pending.length, rejected.length]
  );

  return (
    <>
      <div className="min-h-screen bg-navy-50/50">
        <div className="mx-auto max-w-[1040px] px-5 py-10">

          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-gold-600">
                Accounts
              </p>
              <h1 className="mt-2 font-heading text-[28px] font-extrabold text-navy-500">
                Registrations waiting for you
              </h1>
              <p className="mt-1.5 max-w-2xl text-[13px] text-navy-400">
                Students and parents can create their own account, but they cannot use it until the
                school accepts them. Accepting sends them a message; refusing tells them why they
                cannot sign in.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white px-4 py-2.5 text-[12.5px] font-bold text-navy-500 hover:border-navy-300"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
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

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
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
                        {account.has_student_record && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-bold uppercase tracking-wide text-emerald-700">
                            has student record
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
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
                      {account.approval === 'pending' && (
                        <button
                          type="button"
                          disabled={busyId === account.id}
                          onClick={() => void decide(account, false)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3.5 py-2 text-[12px] font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          <UserRoundX size={13} /> Refuse
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="mt-4 flex items-start gap-2 rounded-2xl border border-navy-100 bg-white px-4 py-3 text-[12px] leading-relaxed text-navy-400">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
            Nothing is sent silently: every accept or refuse stores a message for the person (shown
            in the portal) and e-mails it when e-mail delivery is configured.
          </p>
        </div>
      </div>
    </>
  );
}
