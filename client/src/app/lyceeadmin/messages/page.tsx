'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, MessageCircle, MessageSquare, RefreshCw, Send } from 'lucide-react';
import api from '@/lib/axios';
import {
  Btn,
  Chip,
  Empty,
  LEVELS,
  Notice,
  PageHead,
  Panel,
  flatten,
  input,
} from '@/components/admin/ui';

type Trade = { id: number; code: string; name: string };

type Status = {
  sms: { configured: boolean; provider: string; note: string };
  whatsapp: { configured: boolean; provider: string; note: string };
};

type Counts = { all: number; sent: number; queued: number; failed: number; sms: number; whatsapp: number };

type Message = {
  id: number;
  channel: 'sms' | 'whatsapp';
  recipient: string;
  body: string;
  status: 'sent' | 'queued' | 'failed';
  provider: string;
  error: string;
  student_id: number | null;
  sent_by: string;
  created_at: string;
};

const statusTone = (status: string) =>
  status === 'sent' ? 'green' : status === 'queued' ? 'amber' : 'red';

export default function MessagesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [status, setStatus] = useState<Status | null>(null);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [log, setLog] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [broadcast, setBroadcast] = useState({ channel: 'sms', level: 'L3', trade_id: '', body: '' });
  const [single, setSingle] = useState({ channel: 'sms', to: '', body: '' });

  useEffect(() => {
    api
      .get('/academics/trades/', { params: { page_size: 100 } })
      .then((response) => setTrades(response.data.results ?? []))
      .catch(() => setTrades([]));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/messages/log/', { params: { limit: 120 } });
      setStatus(data.status);
      setCounts(data.counts);
      setLog(data.results ?? []);
    } catch (error) {
      setNotice({ kind: 'error', text: flatten(error) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const sendBroadcast = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      const { data } = await api.post('/messages/broadcast/', {
        channel: broadcast.channel,
        level: broadcast.level,
        trade_id: broadcast.trade_id ? Number(broadcast.trade_id) : null,
        body: broadcast.body,
      });
      setNotice({
        kind: 'ok',
        text: `${data.detail} ${data.recipients} parent number(s) in scope · ${data.sent} sent · ${data.queued} waiting · ${data.failed} failed.`,
      });
      setBroadcast({ ...broadcast, body: '' });
      await load();
    } catch (error) {
      setNotice({ kind: 'error', text: flatten(error) });
    } finally {
      setBusy(false);
    }
  };

  const sendSingle = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      const { data } = await api.post('/messages/', {
        channel: single.channel,
        to: single.to,
        body: single.body,
      });
      setNotice({ kind: data.status === 'failed' ? 'error' : 'ok', text: data.detail });
      setSingle({ ...single, to: '', body: '' });
      await load();
    } catch (error) {
      setNotice({ kind: 'error', text: flatten(error) });
    } finally {
      setBusy(false);
    }
  };

  const characters = useMemo(() => broadcast.body.length, [broadcast.body]);
  const smsParts = Math.max(1, Math.ceil(characters / 160));

  return (
    <div className="min-h-screen bg-navy-50/50">
      <div className="mx-auto max-w-[1100px] px-5 py-10">
        <PageHead
          eyebrow="Communication"
          title="SMS & WhatsApp"
          description="Reach parents where they are. Without a gateway every message is still written to the log, so nothing is lost and the office can see what was meant to go out."
          actions={
            <Btn variant="ghost" icon={RefreshCw} onClick={() => void load()}>
              Reload
            </Btn>
          }
        />

        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Messages', value: counts?.all ?? 0 },
            { label: 'Sent', value: counts?.sent ?? 0 },
            { label: 'Waiting', value: counts?.queued ?? 0 },
            { label: 'Failed', value: counts?.failed ?? 0 },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-navy-100 bg-white px-4 py-3.5 shadow-sm">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-navy-400">
                {item.label}
              </p>
              <p className="mt-1.5 font-heading text-[19px] font-extrabold text-navy-500">{item.value}</p>
            </div>
          ))}
        </div>

        <Panel className="mb-5" title="Gateways" icon={MessageSquare}>
          <div className="grid gap-3 sm:grid-cols-2">
            {(['sms', 'whatsapp'] as const).map((channel) => {
              const item = status?.[channel];
              return (
                <div key={channel} className="rounded-lg border border-navy-100 px-3.5 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[12.5px] font-bold text-navy-500">
                      {channel === 'sms' ? 'SMS' : 'WhatsApp'}
                    </p>
                    <Chip tone={item?.configured ? 'green' : 'amber'}>
                      {item?.configured ? 'live' : 'not configured'}
                    </Chip>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-navy-400">
                    {item?.note ?? 'Checking…'}
                  </p>
                </div>
              );
            })}
          </div>
        </Panel>

        {notice ? (
          <div className="mb-4">
            <Notice kind={notice.kind}>{notice.text}</Notice>
          </div>
        ) : null}

        <div className="mb-5 grid gap-4 lg:grid-cols-2">
          <Panel title="Message a whole class" icon={Send}>
            <form className="space-y-3" onSubmit={sendBroadcast}>
              <div className="grid gap-3 sm:grid-cols-3">
                <select
                  className={input}
                  value={broadcast.channel}
                  onChange={(event) => setBroadcast({ ...broadcast, channel: event.target.value })}
                >
                  <option value="sms">SMS</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
                <select
                  className={input}
                  value={broadcast.level}
                  onChange={(event) => setBroadcast({ ...broadcast, level: event.target.value })}
                >
                  {LEVELS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <select
                  className={input}
                  value={broadcast.trade_id}
                  onChange={(event) => setBroadcast({ ...broadcast, trade_id: event.target.value })}
                >
                  <option value="">All trades</option>
                  {trades.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.code}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                className={`${input} min-h-[110px]`}
                value={broadcast.body}
                onChange={(event) => setBroadcast({ ...broadcast, body: event.target.value })}
                placeholder="Dear parent, the closing day is Friday 12 December at 10:00…"
              />
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-navy-300">
                  {characters} characters · {smsParts} SMS part{smsParts === 1 ? '' : 's'}
                </p>
                <Btn type="submit" icon={Send} loading={busy} disabled={!broadcast.body.trim()}>
                  Send to parents
                </Btn>
              </div>
            </form>
          </Panel>

          <Panel title="Message one number" icon={MessageCircle}>
            <form className="space-y-3" onSubmit={sendSingle}>
              <div className="grid gap-3 sm:grid-cols-3">
                <select
                  className={input}
                  value={single.channel}
                  onChange={(event) => setSingle({ ...single, channel: event.target.value })}
                >
                  <option value="sms">SMS</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
                <input
                  className={`${input} sm:col-span-2`}
                  value={single.to}
                  onChange={(event) => setSingle({ ...single, to: event.target.value })}
                  placeholder="+250 788 000 000"
                />
              </div>
              <textarea
                className={`${input} min-h-[110px]`}
                value={single.body}
                onChange={(event) => setSingle({ ...single, body: event.target.value })}
                placeholder="Hello, this is Lycée de Nyanza…"
              />
              <Btn type="submit" icon={Send} loading={busy} disabled={!single.to.trim() || !single.body.trim()}>
                Send message
              </Btn>
            </form>
          </Panel>
        </div>

        <Panel title="Message log" icon={RefreshCw} description="Everything the school tried to send, newest first.">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-[12.5px] text-navy-400">
              <Loader2 size={15} className="animate-spin" /> Loading the log…
            </div>
          ) : log.length === 0 ? (
            <Empty>No message yet. Taking the roll call with parents alerted creates the first ones.</Empty>
          ) : (
            <ul className="divide-y divide-navy-50">
              {log.map((message) => (
                <li key={message.id} className="py-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip tone="navy">{message.channel}</Chip>
                    <Chip tone={statusTone(message.status)}>{message.status}</Chip>
                    <span className="text-[12px] font-bold text-navy-500">{message.recipient}</span>
                    <span className="ml-auto text-[10.5px] text-navy-300">
                      {new Date(message.created_at).toLocaleString('en-GB')} · {message.sent_by || 'system'}
                    </span>
                  </div>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-navy-400">{message.body}</p>
                  {message.error ? (
                    <p className="mt-0.5 text-[10.5px] text-red-500">{message.error}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
