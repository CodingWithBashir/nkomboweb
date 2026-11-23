'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarCheck, CheckCheck, Loader2, RefreshCw, Save, Search, Users } from 'lucide-react';
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

type Row = {
  id: number;
  student_id: string;
  full_name: string;
  level: string;
  status: string | null;
  notes: string;
  rate: number;
  parent_phone: string;
};

const STATES: { id: string; label: string; tone: string }[] = [
  { id: 'present', label: 'P', tone: 'bg-gold-500 text-white border-gold-500' },
  { id: 'absent', label: 'A', tone: 'bg-red-500 text-white border-red-500' },
  { id: 'late', label: 'L', tone: 'bg-amber-500 text-white border-amber-500' },
  { id: 'excused', label: 'E', tone: 'bg-navy-400 text-white border-navy-400' },
];

const today = () => new Date().toISOString().slice(0, 10);

/**
 * The register is often taken where the signal drops. When a save cannot reach
 * the server the whole class is kept on this device and sent the next time the
 * page opens with a connection.
 */
const QUEUE_KEY = 'attendance-queue';

type Queued = { date: string; entries: { student_id: number; status: string; notes: string }[]; notify: boolean };

function readQueue(): Queued[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Queued[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(items: Queued[]) {
  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(items.slice(-50)));
}

function enqueue(item: Queued) {
  const queue = readQueue().filter((entry) => entry.date !== item.date || entry.entries.length === 0);
  queue.push(item);
  writeQueue(queue);
}

export default function AttendancePage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [level, setLevel] = useState('L3');
  const [trade, setTrade] = useState('');
  const [date, setDate] = useState(today());
  const [rows, setRows] = useState<Row[]>([]);
  const [draft, setDraft] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [notify, setNotify] = useState(true);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error' | 'info'; text: string } | null>(null);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    api
      .get('/academics/trades/', { params: { page_size: 100 } })
      .then((response) => setTrades(response.data.results ?? []))
      .catch(() => setTrades([]));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setNotice(null);
    try {
      const { data } = await api.get('/academics/attendance/register/', {
        params: { date, level, ...(trade ? { trade } : {}) },
      });
      setRows(data.results ?? []);
      const next: Record<number, string> = {};
      const nextNotes: Record<number, string> = {};
      (data.results ?? []).forEach((row: Row) => {
        next[row.id] = row.status ?? 'present';
        nextNotes[row.id] = row.notes ?? '';
      });
      setDraft(next);
      setNotes(nextNotes);
    } catch (error) {
      setNotice({ kind: 'error', text: flatten(error) });
    } finally {
      setLoading(false);
    }
  }, [date, level, trade]);

  useEffect(() => {
    void load();
  }, [load]);

  /** Send anything the register saved while it was offline. */
  useEffect(() => {
    const flush = async () => {
      const queue = readQueue();
      setPending(queue.length);
      if (!queue.length || !navigator.onLine) return;
      const left: Queued[] = [];
      for (const item of queue) {
        try {
          await api.post('/academics/attendance/register/', item);
        } catch {
          left.push(item);
        }
      }
      writeQueue(left);
      setPending(left.length);
      if (left.length !== queue.length) {
        setNotice({
          kind: 'ok',
          text: `${queue.length - left.length} register(s) taken offline were sent to the school server.`,
        });
        await load();
      }
    };
    void flush();
    window.addEventListener('online', flush);
    return () => window.removeEventListener('online', flush);
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(
      (row) => row.full_name.toLowerCase().includes(term) || row.student_id.toLowerCase().includes(term)
    );
  }, [rows, search]);

  const counts = useMemo(() => {
    const tally = { present: 0, absent: 0, late: 0, excused: 0 };
    rows.forEach((row) => {
      const status = draft[row.id] as keyof typeof tally;
      if (status && status in tally) tally[status] += 1;
    });
    return tally;
  }, [rows, draft]);

  const markAll = (status: string) => {
    const next: Record<number, string> = {};
    rows.forEach((row) => {
      next[row.id] = status;
    });
    setDraft(next);
  };

  const save = async () => {
    const entries = rows.map((row) => ({
      student_id: row.id,
      status: draft[row.id] ?? 'present',
      notes: notes[row.id] ?? '',
    }));
    setSaving(true);
    setNotice(null);
    try {
      const { data } = await api.post('/academics/attendance/register/', { date, entries, notify });
      setNotice({
        kind: 'ok',
        text: `${data.saved} student(s) saved for ${date}. ${
          data.absent ? `${data.absent} parent(s) alerted, ${data.notified} message(s) queued.` : 'Nobody was absent.'
        }`,
      });
      await load();
    } catch (error) {
      const reachable = (error as { response?: unknown }).response !== undefined;
      if (!reachable) {
        enqueue({ date, entries, notify });
        setPending(readQueue().length);
        setNotice({
          kind: 'info',
          text: 'No connection: the register is saved on this device and will be sent automatically when the network comes back.',
        });
        return;
      }
      setNotice({ kind: 'error', text: flatten(error) });
    } finally {
      setSaving(false);
    }
  };

  const saved = rows.filter((row) => row.status !== null).length;

  return (
    <div className="min-h-screen bg-navy-50/50">
      <div className="mx-auto max-w-[1100px] px-5 py-10">
        <PageHead
          eyebrow="Teaching"
          title="Daily attendance"
          description="Take the roll call for one class, then save. Absent and late students trigger a message to their parents automatically — the SMS goes out only when an SMS gateway is configured, otherwise it waits in the message log."
          actions={
            <Btn variant="ghost" icon={RefreshCw} onClick={() => void load()}>
              Reload
            </Btn>
          }
        />

        <Panel className="mb-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="block">
              <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                Level
              </span>
              <select className={input} value={level} onChange={(event) => setLevel(event.target.value)}>
                {LEVELS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                Trade
              </span>
              <select className={input} value={trade} onChange={(event) => setTrade(event.target.value)}>
                <option value="">All trades</option>
                {trades.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.code} — {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                Date
              </span>
              <input
                type="date"
                className={input}
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                Find a student
              </span>
              <div className="relative">
                <Search size={13} className="pointer-events-none absolute left-3 top-2.5 text-navy-300" />
                <input
                  className={`${input} pl-8`}
                  placeholder="Name or student number"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </label>
            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-2 text-[11.5px] font-semibold text-navy-500">
                <input
                  type="checkbox"
                  checked={notify}
                  onChange={(event) => setNotify(event.target.checked)}
                  className="h-4 w-4 rounded border-navy-200"
                />
                Alert parents
              </label>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-navy-50 pt-3">
            <Chip tone="navy">
              <Users size={11} /> {rows.length} students
            </Chip>
            <Chip tone="green">Present {counts.present}</Chip>
            <Chip tone="red">Absent {counts.absent}</Chip>
            <Chip tone="amber">Late {counts.late}</Chip>
            <Chip tone="navy">Excused {counts.excused}</Chip>
            <span className="ml-auto text-[11px] text-navy-300">
              {pending > 0 ? `${pending} register(s) waiting on this device · ` : ''}
              {saved} already saved for this day
            </span>
            <Btn variant="ghost" icon={CheckCheck} onClick={() => markAll('present')}>
              Mark everyone present
            </Btn>
            <Btn icon={Save} loading={saving} onClick={() => void save()}>
              Save register
            </Btn>
          </div>
        </Panel>

        {notice ? (
          <div className="mb-4">
            <Notice kind={notice.kind}>{notice.text}</Notice>
          </div>
        ) : null}

        <Panel
          title={`${level}${trade ? ` · ${trades.find((item) => String(item.id) === trade)?.code ?? ''}` : ''} — ${date}`}
          icon={CalendarCheck}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-[12.5px] text-navy-400">
              <Loader2 size={15} className="animate-spin" /> Loading the class…
            </div>
          ) : filtered.length === 0 ? (
            <Empty>
              No students in this class yet. Add them under <strong>Students</strong> first, or change the
              level and trade above.
            </Empty>
          ) : (
            <ul className="divide-y divide-navy-50">
              {filtered.map((row) => {
                const status = draft[row.id] ?? 'present';
                const state = STATES.find((item) => item.id === status);
                return (
                  <li key={row.id} className="flex flex-wrap items-center gap-3 py-2.5">
                    <div className="min-w-[190px] flex-1">
                      <p className="text-[12.5px] font-bold text-navy-500">{row.full_name}</p>
                      <p className="text-[10.5px] text-navy-300">
                        {row.student_id} · attendance {row.rate}%
                        {row.status ? ` · saved as ${row.status}` : ' · not saved yet'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {STATES.map((item) => {
                        const active = state?.id === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              setDraft((current) => ({ ...current, [row.id]: item.id }))
                            }
                            className={`h-8 w-8 rounded-full border text-[11.5px] font-extrabold transition ${
                              active
                                ? item.tone
                                : 'border-navy-100 bg-white text-navy-300 hover:border-navy-300'
                            }`}
                            title={item.id}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                    <input
                      className="w-full max-w-[220px] rounded-lg border border-navy-100 px-2.5 py-1.5 text-[11.5px] outline-none focus:border-navy-400"
                      placeholder="Note (optional)"
                      value={notes[row.id] ?? ''}
                      onChange={(event) =>
                        setNotes((current) => ({ ...current, [row.id]: event.target.value }))
                      }
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
