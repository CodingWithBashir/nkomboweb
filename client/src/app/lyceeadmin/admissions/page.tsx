'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  GraduationCap,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  School,
  Trash2,
  UserRound,
  X,
  XCircle,
} from 'lucide-react';
import RequireAuth from '@/components/RequireAuth';
import api from '@/lib/axios';

type Trade = { id: number; name: string; code: string };

type Application = {
  id: number;
  reference: string;
  full_name: string;
  initials: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string | null;
  level: string;
  status: string;
  previous_school: string;
  parent_name: string;
  parent_phone: string;
  address: string;
  message: string;
  notes: string;
  trade: { id: number; name: string; code: string } | null;
  trade_name: string;
  submitted_at: string;
  decision_at: string | null;
  reviewed_by: string;
  is_enrolled: boolean;
};

type Stats = { total: number; pending: number; reviewing: number; accepted: number; waitlisted: number; rejected: number };

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'New' },
  { key: 'reviewing', label: 'In review' },
  { key: 'waitlisted', label: 'Waiting list' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'rejected', label: 'Not successful' },
];

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-navy-50 text-navy-600',
  reviewing: 'bg-amber-50 text-amber-700',
  waitlisted: 'bg-amber-50 text-amber-700',
  accepted: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'New',
  reviewing: 'In review',
  waitlisted: 'Waiting list',
  accepted: 'Accepted',
  rejected: 'Not successful',
};

const dateOf = (value: string | null) => (value ? value.slice(0, 10) : '—');

function flatten(error: unknown): string {
  const detail = (error as { response?: { data?: unknown } })?.response?.data;
  if (!detail) return 'Something went wrong. Please try again.';
  if (typeof detail === 'string') return detail;
  if (typeof detail === 'object') {
    const entries = Object.entries(detail as Record<string, unknown>);
    if (!entries.length) return 'Something went wrong. Please try again.';
    return entries
      .map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(' ') : String(value)}`)
      .join(' · ');
  }
  return 'Something went wrong. Please try again.';
}

export default function AdmissionsBoardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [selected, setSelected] = useState<Application | null>(null);
  const [notes, setNotes] = useState('');
  const [level, setLevel] = useState('L3');
  const [tradeId, setTradeId] = useState('');
  const [trades, setTrades] = useState<Trade[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string | number> = { page_size: 200 };
      if (filter !== 'all') params.status = filter;
      if (query.trim()) params.search = query.trim();
      const [list, summary] = await Promise.all([
        api.get('/admissions/applications/', { params }),
        api.get('/admissions/applications/stats/'),
      ]);
      setApplications(list.data.results ?? list.data);
      setStats(summary.data);
    } catch (err) {
      setError(flatten(err));
    } finally {
      setLoading(false);
    }
  }, [filter, query]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    api
      .get('/academics/trades/', { params: { page_size: 100 } })
      .then((response) => setTrades(response.data.results ?? response.data))
      .catch(() => setTrades([]));
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const open = (application: Application) => {
    setSelected(application);
    setNotes(application.notes || '');
    setLevel(application.level || 'L3');
    setTradeId(application.trade?.id ? String(application.trade.id) : '');
    setError('');
  };

  const patch = async (payload: Record<string, unknown>, successMessage: string) => {
    if (!selected) return;
    setBusy(true);
    setError('');
    try {
      const { data } = await api.patch(`/admissions/applications/${selected.id}/`, payload);
      setSelected(data);
      setNotes(data.notes || '');
      setNotice(successMessage);
      await load();
    } catch (err) {
      setError(flatten(err));
    } finally {
      setBusy(false);
    }
  };

  const enrol = async () => {
    if (!selected) return;
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post(`/admissions/applications/${selected.id}/enrol/`);
      setSelected(data.application);
      setNotice(`${data.application.full_name} is now a student (${data.student.student_id}).`);
      await load();
    } catch (err) {
      setError(flatten(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!selected) return;
    if (!window.confirm(`Delete the application of ${selected.full_name}? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await api.delete(`/admissions/applications/${selected.id}/`);
      setSelected(null);
      setNotice('Application deleted.');
      await load();
    } catch (err) {
      setError(flatten(err));
    } finally {
      setBusy(false);
    }
  };

  const cards = useMemo(
    () => [
      { key: 'total', label: 'Applications', value: stats?.total ?? 0, icon: ClipboardList, tone: 'text-navy-500' },
      { key: 'pending', label: 'Waiting for review', value: stats?.pending ?? 0, icon: Clock3, tone: 'text-amber-600' },
      { key: 'accepted', label: 'Accepted', value: stats?.accepted ?? 0, icon: BadgeCheck, tone: 'text-emerald-600' },
      { key: 'waitlisted', label: 'Waiting list', value: stats?.waitlisted ?? 0, icon: GraduationCap, tone: 'text-navy-400' },
    ],
    [stats]
  );

  return (
    <RequireAuth roles={['headmaster', 'admin', 'dos']}>
      <div className="min-h-screen bg-navy-50/50">
        <div className="mx-auto max-w-[1240px] px-5 py-10">
          <Link
            href="/lyceeadmin"
            className="inline-flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-[0.12em] text-navy-400 hover:text-navy-600"
          >
            <ArrowLeft size={13} /> Overview
          </Link>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-gold-600">Admissions</p>
              <h1 className="mt-2 font-heading text-[28px] font-extrabold text-navy-500">Applications</h1>
              <p className="mt-1.5 text-[13px] text-navy-400">
                Review every online application, take notes, accept or refuse, and turn an accepted
                applicant into a student record in one click.
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

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
              <div key={card.key} className="rounded-2xl border border-navy-100 bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-300">{card.label}</p>
                  <card.icon className={`h-4 w-4 ${card.tone}`} />
                </div>
                <p className="mt-2 font-heading text-[26px] font-extrabold text-navy-500">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2.5 rounded-2xl border border-navy-100 bg-white p-3">
            <div className="relative min-w-[220px] flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-300" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, reference or previous school…"
                className="w-full rounded-xl border border-transparent bg-navy-50/70 py-2.5 pl-10 pr-3 text-[13px] text-navy-600 outline-none focus:border-navy-200 focus:bg-white"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  className={`rounded-full px-3 py-1.5 text-[11.5px] font-bold transition ${
                    filter === item.key
                      ? 'bg-navy-500 text-white'
                      : 'bg-navy-50 text-navy-500 hover:bg-navy-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-navy-100 bg-white">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-[13px] text-navy-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading applications…
              </div>
            ) : applications.length === 0 ? (
              <div className="py-16 text-center">
                <ClipboardList className="mx-auto h-8 w-8 text-navy-200" />
                <p className="mt-3 font-heading text-[15px] font-extrabold text-navy-500">No applications here yet</p>
                <p className="mt-1 text-[12.5px] text-navy-400">
                  Applications sent through <Link href="/admissions" className="font-semibold text-gold-600 underline">/admissions</Link> appear in this list.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-navy-100">
                {applications.map((application) => (
                  <li key={application.id}>
                    <button
                      type="button"
                      onClick={() => open(application)}
                      className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition hover:bg-navy-50/60"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-500 font-heading text-[12.5px] font-extrabold text-white">
                        {application.initials}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="truncate font-heading text-[14px] font-extrabold text-navy-500">
                            {application.full_name}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLE[application.status] ?? 'bg-navy-50 text-navy-600'}`}>
                            {STATUS_LABEL[application.status] ?? application.status}
                          </span>
                          {application.is_enrolled && (
                            <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                              Enrolled
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] text-navy-400">
                          <span className="font-mono">{application.reference}</span>
                          <span>{application.trade_name || 'Trade not chosen'}</span>
                          <span>{application.level}</span>
                          <span>{dateOf(application.submitted_at)}</span>
                        </span>
                      </span>
                      <span className="hidden shrink-0 text-[11.5px] font-semibold text-navy-300 sm:block">
                        {application.phone || application.parent_phone || '—'}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- detail */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy-900/50 p-4 sm:p-8">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-navy-100 p-5">
              <div>
                <p className="font-mono text-[11.5px] font-bold tracking-wide text-gold-600">{selected.reference}</p>
                <h2 className="mt-1 font-heading text-[21px] font-extrabold text-navy-500">{selected.full_name}</h2>
                <p className="mt-0.5 text-[12px] text-navy-400">
                  Applied {dateOf(selected.submitted_at)} · {selected.trade_name || 'no trade'} · {selected.level}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full p-2 text-navy-300 hover:bg-navy-50 hover:text-navy-500"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-2">
              <Detail icon={UserRound} label="Sex / date of birth" value={`${selected.gender || '—'} · ${dateOf(selected.date_of_birth)}`} />
              <Detail icon={School as typeof UserRound} label="Previous school" value={selected.previous_school || '—'} />
              <Detail icon={Phone} label="Student phone" value={selected.phone || '—'} />
              <Detail icon={Mail} label="E-mail" value={selected.email || '—'} />
              <Detail icon={UserRound} label="Parent / guardian" value={`${selected.parent_name || '—'}${selected.parent_phone ? ` · ${selected.parent_phone}` : ''}`} />
              <Detail icon={MapPin} label="Address" value={selected.address || '—'} />
              {selected.message && (
                <div className="sm:col-span-2">
                  <Detail icon={ClipboardList} label="Applicant message" value={selected.message} />
                </div>
              )}
              {selected.reviewed_by && (
                <div className="sm:col-span-2 text-[11.5px] text-navy-300">
                  Last decision by {selected.reviewed_by} on {dateOf(selected.decision_at)}
                </div>
              )}
            </div>

            <div className="border-t border-navy-100 p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">Trade</span>
                  <select
                    value={tradeId}
                    onChange={(event) => setTradeId(event.target.value)}
                    className="w-full rounded-xl border border-navy-100 px-3 py-2.5 text-[13px] text-navy-600 outline-none focus:border-navy-300"
                  >
                    <option value="">Not chosen</option>
                    {trades.map((trade) => (
                      <option key={trade.id} value={trade.id}>
                        {trade.name} ({trade.code})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">Entry level</span>
                  <select
                    value={level}
                    onChange={(event) => setLevel(event.target.value)}
                    className="w-full rounded-xl border border-navy-100 px-3 py-2.5 text-[13px] text-navy-600 outline-none focus:border-navy-300"
                  >
                    <option value="L3">L3 — Senior 1</option>
                    <option value="L4">L4 — Senior 2</option>
                    <option value="L5">L5 — Senior 3</option>
                  </select>
                </label>
              </div>

              <label className="mt-3 block">
                <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">Internal notes</span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={2}
                  placeholder="Documents received, phone call, interview…"
                  className="w-full rounded-xl border border-navy-100 px-3 py-2.5 text-[13px] text-navy-600 outline-none focus:border-navy-300"
                />
              </label>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void patch({ status: 'reviewing', notes, level, trade_id: tradeId ? Number(tradeId) : null }, 'Marked as in review.')}
                  className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-2 text-[12px] font-bold text-amber-800 hover:bg-amber-200 disabled:opacity-50"
                >
                  <Clock3 size={13} /> In review
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void patch({ status: 'waitlisted', notes, level, trade_id: tradeId ? Number(tradeId) : null }, 'Moved to the waiting list.')}
                  className="inline-flex items-center gap-1.5 rounded-full bg-navy-100 px-3.5 py-2 text-[12px] font-bold text-navy-600 hover:bg-navy-200 disabled:opacity-50"
                >
                  <CalendarDays size={13} /> Waiting list
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void patch({ status: 'rejected', notes, level, trade_id: tradeId ? Number(tradeId) : null }, 'Application marked as not successful.')}
                  className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3.5 py-2 text-[12px] font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
                >
                  <XCircle size={13} /> Refuse
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void patch({ status: 'accepted', notes, level, trade_id: tradeId ? Number(tradeId) : null }, 'Applicant accepted. Use “Enrol as student” to create the record.')}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-2 text-[12px] font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle2 size={13} /> Accept
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-navy-100 pt-4">
                <button
                  type="button"
                  onClick={() => void remove()}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 text-[12px] font-bold text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  <Trash2 size={13} /> Delete application
                </button>
                <button
                  type="button"
                  onClick={() => void enrol()}
                  disabled={busy || selected.is_enrolled}
                  className="inline-flex items-center gap-2 rounded-full bg-navy-500 px-5 py-2.5 text-[12.5px] font-bold text-white hover:bg-navy-600 disabled:opacity-40"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <GraduationCap size={14} />}
                  {selected.is_enrolled ? 'Already enrolled' : 'Enrol as student'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </RequireAuth>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-navy-50/60 px-3 py-2.5">
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-navy-300">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p className="mt-1 text-[12.5px] font-medium text-navy-600">{value}</p>
    </div>
  );
}
