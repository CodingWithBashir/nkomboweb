'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Eye,
  Loader2,
  Mail,
  MailCheck,
  RefreshCw,
  RotateCw,
  Search,
  Send,
  Server,
  Trash2,
  X,
} from 'lucide-react';
import api from '@/lib/axios';

type MailStatus = {
  provider: 'smtp' | 'resend' | 'none';
  configured: boolean;
  from: string;
  host: string;
  port: number;
  note: string;
  counts: { all: number; sent: number; logged: number; failed: number; queued: number };
};

type MailRow = {
  id: number;
  to: string;
  subject: string;
  kind: string;
  reference: string;
  provider: string;
  status: 'sent' | 'logged' | 'failed' | 'queued';
  error: string;
  attempts: number;
  created_at: string;
  sent_at: string | null;
  preview: string;
};

type MailDetail = MailRow & { html: string; text: string };

const STATUS_TABS = [
  { key: 'all', label: 'Everything' },
  { key: 'sent', label: 'Delivered' },
  { key: 'logged', label: 'Waiting' },
  { key: 'failed', label: 'Failed' },
] as const;

const KIND_LABEL: Record<string, string> = {
  account: 'Account',
  application: 'Admission',
  result: 'Results',
  info: 'Message',
  test: 'Test',
};

function statusChip(status: MailRow['status']) {
  if (status === 'sent') return { label: 'Delivered', className: 'bg-emerald-50 text-emerald-700' };
  if (status === 'failed') return { label: 'Failed', className: 'bg-red-50 text-red-700' };
  if (status === 'logged') return { label: 'Waiting', className: 'bg-amber-50 text-amber-700' };
  return { label: 'Sending…', className: 'bg-navy-50 text-navy-500' };
}

function flatten(error: unknown): string {
  const detail = (error as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  return 'Something went wrong. Please try again.';
}

function when(value: string | null) {
  if (!value) return '—';
  const date = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OutboxPage() {
  const [status, setStatus] = useState<MailStatus | null>(null);
  const [messages, setMessages] = useState<MailRow[]>([]);
  const [tab, setTab] = useState<(typeof STATUS_TABS)[number]['key']>('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [preview, setPreview] = useState<MailDetail | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [testTo, setTestTo] = useState('');
  const [testing, setTesting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statusResponse, listResponse] = await Promise.all([
        api.get('/mail/'),
        api.get('/mail/outbox/', { params: { status: tab, q: query.trim() } }),
      ]);
      setStatus(statusResponse.data);
      setMessages(listResponse.data.results ?? []);
    } catch (err) {
      setError(flatten(err));
    } finally {
      setLoading(false);
    }
  }, [tab, query]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const openPreview = async (row: MailRow) => {
    setPreviewLoading(true);
    setPreview({ ...row, html: '', text: '' });
    try {
      const { data } = await api.get(`/mail/outbox/${row.id}/`);
      setPreview(data);
    } catch (err) {
      setError(flatten(err));
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const resend = async (row: MailRow) => {
    setBusyId(row.id);
    setError('');
    try {
      const { data } = await api.post(`/mail/outbox/${row.id}/resend/`);
      setNotice(data.detail ?? 'Message re-sent.');
      await load();
    } catch (err) {
      setError(flatten(err));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (row: MailRow) => {
    if (!window.confirm(`Remove the message “${row.subject}” from the outbox?\n\nThe recipient keeps any copy already delivered.`)) {
      return;
    }
    setBusyId(row.id);
    try {
      await api.delete(`/mail/outbox/${row.id}/`);
      setNotice('Removed from the outbox.');
      await load();
    } catch (err) {
      setError(flatten(err));
    } finally {
      setBusyId(null);
    }
  };

  const sendTest = async () => {
    setTesting(true);
    setError('');
    try {
      const { data } = await api.post('/mail/test/', { to: testTo.trim() });
      setNotice(data.detail ?? 'Test message sent.');
      setTestOpen(false);
      setTestTo('');
      await load();
    } catch (err) {
      setError(flatten(err));
    } finally {
      setTesting(false);
    }
  };

  const counts = useMemo(
    () => status?.counts ?? { all: 0, sent: 0, logged: 0, failed: 0, queued: 0 },
    [status]
  );

  return (
    <>
      <div className="min-h-screen bg-navy-50/50">
        <div className="mx-auto max-w-[1120px] px-5 py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-gold-600">
                Correspondence
              </p>
              <h1 className="mt-2 font-heading text-[28px] font-extrabold text-navy-500">
                E-mail outbox
              </h1>
              <p className="mt-1.5 max-w-[620px] text-[13px] leading-relaxed text-navy-400">
                Every letter the portal sends — acceptance, refusal, admission decisions, password
                resets — is kept here. If a message could not leave, you can read it and send it
                again.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTestOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-4 py-2.5 text-[12.5px] font-bold text-white hover:bg-gold-600"
              >
                <Send size={14} /> Send a test
              </button>
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

          {/* delivery channel */}
          <div
            className={`mt-6 rounded-2xl border p-5 ${
              status?.configured ? 'border-emerald-100 bg-emerald-50/50' : 'border-amber-200 bg-amber-50'
            }`}
          >
            <div className="flex flex-wrap items-start gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  status?.configured ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                }`}
              >
                {status?.configured ? <Server size={16} /> : <AlertTriangle size={16} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-heading text-[14px] font-extrabold text-navy-500">
                  {status?.configured
                    ? `Sending through ${status.provider === 'smtp' ? `your mail server (${status.host}:${status.port})` : 'Resend'}`
                    : 'No mail server configured yet'}
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-navy-400">{status?.note}</p>
                <p className="mt-1.5 text-[11.5px] text-navy-400">
                  Sender: <span className="font-semibold text-navy-600">{status?.from ?? '—'}</span>
                </p>
                {!status?.configured && (
                  <p className="mt-2 rounded-lg bg-white/70 px-3 py-2 font-mono text-[11px] leading-relaxed text-navy-500">
                    server/.env → SMTP_HOST=smtp.gmail.com · SMTP_PORT=587 · SMTP_USER=… ·
                    SMTP_PASS=… · MAIL_FROM=&quot;Lycée de Nyanza &lt;no-reply@lyceedenyanza.rw&gt;&quot;
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* counters */}
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Delivered', value: counts.sent, icon: MailCheck, tone: 'text-emerald-600' },
              { label: 'Waiting to send', value: counts.logged, icon: Clock3, tone: 'text-amber-600' },
              { label: 'Failed', value: counts.failed, icon: AlertTriangle, tone: 'text-red-500' },
            ].map((card) => (
              <div key={card.label} className="rounded-2xl border border-navy-100 bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-300">
                    {card.label}
                  </p>
                  <card.icon className={`h-4 w-4 ${card.tone}`} />
                </div>
                <p className="mt-2 font-heading text-[24px] font-extrabold text-navy-500">
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          {/* filters */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {STATUS_TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`rounded-full px-3.5 py-1.5 text-[11.5px] font-bold transition ${
                  tab === item.key
                    ? 'bg-navy-500 text-white'
                    : 'bg-white text-navy-500 hover:bg-navy-100'
                }`}
              >
                {item.label}
                {item.key === 'failed' && counts.failed > 0 ? ` (${counts.failed})` : ''}
                {item.key === 'logged' && counts.logged > 0 ? ` (${counts.logged})` : ''}
              </button>
            ))}
            <label className="ml-auto flex items-center gap-2 rounded-full border border-navy-200 bg-white px-3 py-1.5">
              <Search size={13} className="text-navy-300" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search address or subject"
                className="w-[210px] bg-transparent text-[12px] text-navy-600 outline-none placeholder:text-navy-300"
              />
            </label>
          </div>

          {/* list */}
          <div className="mt-4 overflow-hidden rounded-2xl border border-navy-100 bg-white">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-[13px] text-navy-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading the outbox…
              </div>
            ) : messages.length === 0 ? (
              <div className="py-16 text-center">
                <Mail className="mx-auto h-8 w-8 text-navy-200" />
                <p className="mt-3 font-heading text-[15px] font-extrabold text-navy-500">
                  Nothing here yet
                </p>
                <p className="mt-1 text-[12.5px] text-navy-400">
                  Accept or refuse an account and the letter will appear in this list.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-navy-100">
                {messages.map((row) => {
                  const chip = statusChip(row.status);
                  return (
                    <li key={row.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-500">
                        <Mail size={15} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-heading text-[13.5px] font-extrabold text-navy-500">
                          {row.subject}
                        </p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] text-navy-400">
                          <span className="truncate">To {row.to}</span>
                          <span className="rounded-full bg-navy-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy-500">
                            {KIND_LABEL[row.kind] ?? row.kind}
                          </span>
                          <span>{when(row.sent_at || row.created_at)}</span>
                          {row.reference && <span className="font-mono text-[11px]">{row.reference}</span>}
                        </p>
                        {row.status !== 'sent' && row.error && (
                          <p className="mt-1 line-clamp-2 text-[11px] text-red-600">{row.error}</p>
                        )}
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold ${chip.className}`}>
                        {chip.label}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => void openPreview(row)}
                          title="Read the message"
                          className="inline-flex items-center gap-1 rounded-full border border-navy-200 px-2.5 py-1.5 text-[11.5px] font-bold text-navy-500 hover:border-navy-300"
                        >
                          <Eye size={12} /> Read
                        </button>
                        <button
                          type="button"
                          disabled={busyId === row.id}
                          onClick={() => void resend(row)}
                          title="Send it again"
                          className="inline-flex items-center gap-1 rounded-full bg-navy-500 px-2.5 py-1.5 text-[11.5px] font-bold text-white hover:bg-navy-600 disabled:opacity-50"
                        >
                          {busyId === row.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <RotateCw size={12} />
                          )}
                          Resend
                        </button>
                        <button
                          type="button"
                          disabled={busyId === row.id}
                          onClick={() => void remove(row)}
                          title="Remove from the outbox"
                          className="rounded-full p-1.5 text-navy-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <p className="mt-4 flex items-start gap-2 rounded-2xl border border-navy-100 bg-white px-4 py-3 text-[12px] leading-relaxed text-navy-400">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
            Nothing is written to people by hand: accepting an account, refusing it, an admission
            decision or a password reset always passes through this outbox, so you have a record of
            what the school told whom.
          </p>
        </div>
      </div>

      {/* preview */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-600/50 p-4">
          <div className="flex h-[86vh] w-full max-w-[760px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-navy-100 px-5 py-4">
              <div className="min-w-0">
                <p className="truncate font-heading text-[15px] font-extrabold text-navy-500">
                  {preview.subject}
                </p>
                <p className="mt-0.5 text-[11.5px] text-navy-400">
                  To {preview.to} · {when(preview.sent_at || preview.created_at)} ·{' '}
                  {statusChip(preview.status).label}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void resend(preview)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-navy-500 px-3 py-2 text-[12px] font-bold text-white hover:bg-navy-600"
                >
                  <ArrowUpRight size={13} /> Resend
                </button>
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="rounded-full p-2 text-navy-400 hover:bg-navy-50"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            {previewLoading ? (
              <div className="flex flex-1 items-center justify-center gap-2 text-[13px] text-navy-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Opening…
              </div>
            ) : (
              <iframe
                title="E-mail preview"
                srcDoc={preview.html}
                sandbox=""
                className="h-full w-full flex-1 bg-navy-50"
              />
            )}
          </div>
        </div>
      )}

      {/* test send */}
      {testOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-600/50 p-4">
          <div className="w-full max-w-[440px] rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-heading text-[16px] font-extrabold text-navy-500">
                  Send a test e-mail
                </h2>
                <p className="mt-1 text-[12px] leading-relaxed text-navy-400">
                  Useful after changing the mail settings: the message is sent exactly like a real
                  letter and recorded in the outbox.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTestOpen(false)}
                className="rounded-full p-1.5 text-navy-400 hover:bg-navy-50"
              >
                <X size={16} />
              </button>
            </div>
            <label className="mt-5 block">
              <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.12em] text-navy-400">
                Send to
              </span>
              <input
                autoFocus
                value={testTo}
                onChange={(event) => setTestTo(event.target.value)}
                placeholder="office@lyceedenyanza.rw"
                className="w-full rounded-xl border border-navy-200 px-3.5 py-2.5 text-[13px] text-navy-600 outline-none focus:border-navy-400"
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTestOpen(false)}
                className="rounded-full border border-navy-200 px-4 py-2 text-[12.5px] font-bold text-navy-500"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={testing || !testTo.trim()}
                onClick={() => void sendTest()}
                className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-4 py-2 text-[12.5px] font-bold text-white hover:bg-gold-600 disabled:opacity-50"
              >
                {testing ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
