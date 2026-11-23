'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Plus, RefreshCw, ShieldAlert, Trash2 } from 'lucide-react';
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
type Student = { id: number; student_id: string; full_name: string };

type Case = {
  id: number;
  date: string;
  category: string;
  severity: 'minor' | 'major' | 'critical';
  description: string;
  action: string;
  status: 'open' | 'resolved' | 'escalated';
  reported_by: string;
  parent_notified: boolean;
  student: { id: number; student_id: string; full_name: string; level: string; trade_code: string | null };
};

const CATEGORIES = [
  'tardiness',
  'absence',
  'uniform',
  'disrespect',
  'fighting',
  'property',
  'cheating',
  'other',
];

const severityTone = (severity: string) =>
  severity === 'critical' ? 'red' : severity === 'major' ? 'amber' : 'navy';

const statusTone = (status: string) =>
  status === 'resolved' ? 'green' : status === 'escalated' ? 'red' : 'amber';

const today = () => new Date().toISOString().slice(0, 10);

export default function DisciplinePage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [level, setLevel] = useState('L3');
  const [trade, setTrade] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState({
    student_id: '',
    date: today(),
    category: 'tardiness',
    severity: 'minor',
    description: '',
    action: '',
    notify_parent: true,
  });

  useEffect(() => {
    api
      .get('/academics/trades/', { params: { page_size: 100 } })
      .then((response) => setTrades(response.data.results ?? []))
      .catch(() => setTrades([]));
  }, []);

  useEffect(() => {
    api
      .get('/reports/', { params: { level, ...(trade ? { trade } : {}) } })
      .then((response) => setStudents(response.data.results ?? []))
      .catch(() => setStudents([]));
  }, [level, trade]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/discipline/', {
        params: { ...(status ? { status } : {}), ...(level ? { level } : {}) },
      });
      setCases(data.results ?? []);
    } catch (error) {
      setNotice({ kind: 'error', text: flatten(error) });
    } finally {
      setLoading(false);
    }
  }, [status, level]);

  useEffect(() => {
    void load();
  }, [load]);

  const record = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.student_id) {
      setNotice({ kind: 'error', text: 'Choose the student.' });
      return;
    }
    if (!form.description.trim()) {
      setNotice({ kind: 'error', text: 'Describe what happened — the parents will read it.' });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      await api.post('/discipline/', { ...form, student_id: Number(form.student_id) });
      setNotice({
        kind: 'ok',
        text: form.notify_parent
          ? 'Case recorded. The guardians were messaged and an SMS was queued.'
          : 'Case recorded.',
      });
      setForm({ ...form, student_id: '', description: '', action: '' });
      await load();
    } catch (error) {
      setNotice({ kind: 'error', text: flatten(error) });
    } finally {
      setBusy(false);
    }
  };

  const update = async (item: Case, next: 'open' | 'resolved' | 'escalated') => {
    setBusy(true);
    try {
      await api.patch(`/discipline/${item.id}/`, { status: next });
      await load();
      setNotice({ kind: 'ok', text: `Case marked ${next}.` });
    } catch (error) {
      setNotice({ kind: 'error', text: flatten(error) });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item: Case) => {
    if (!window.confirm('Delete this discipline record? The audit log keeps the trace.')) return;
    setBusy(true);
    try {
      await api.delete(`/discipline/${item.id}/`);
      await load();
    } catch (error) {
      setNotice({ kind: 'error', text: flatten(error) });
    } finally {
      setBusy(false);
    }
  };

  const open = cases.filter((item) => item.status === 'open').length;
  const serious = cases.filter((item) => item.severity !== 'minor').length;

  return (
    <div className="min-h-screen bg-navy-50/50">
      <div className="mx-auto max-w-[1100px] px-5 py-10">
        <PageHead
          eyebrow="Discipline"
          title="Discipline register"
          description="The book the school already keeps, in the portal: what happened, who saw it, what was decided, and whether the family has been told."
          actions={
            <Btn variant="ghost" icon={RefreshCw} onClick={() => void load()}>
              Reload
            </Btn>
          }
        />

        <div className="mb-5 flex flex-wrap items-center gap-2">
          <Chip tone="navy">{cases.length} records</Chip>
          <Chip tone="amber">
            <AlertTriangle size={10} /> {open} open
          </Chip>
          <Chip tone="red">
            <ShieldAlert size={10} /> {serious} major or critical
          </Chip>
          <div className="ml-auto flex items-center gap-2">
            <select className={`${input} max-w-[130px]`} value={level} onChange={(event) => setLevel(event.target.value)}>
              {LEVELS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <select className={`${input} max-w-[150px]`} value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">All cases</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
              <option value="escalated">Escalated</option>
            </select>
          </div>
        </div>

        {notice ? (
          <div className="mb-4">
            <Notice kind={notice.kind}>{notice.text}</Notice>
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[1fr_330px]">
          <Panel title="Cases" icon={ShieldAlert}>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-[12.5px] text-navy-400">
                <Loader2 size={15} className="animate-spin" /> Loading the register…
              </div>
            ) : cases.length === 0 ? (
              <Empty>No case recorded for this class. That is usually good news.</Empty>
            ) : (
              <ul className="divide-y divide-navy-50">
                {cases.map((item) => (
                  <li key={item.id} className="py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[12.5px] font-bold text-navy-500">{item.student.full_name}</p>
                      <span className="text-[10.5px] text-navy-300">
                        {item.student.student_id} · {item.student.level}
                        {item.student.trade_code ? ` · ${item.student.trade_code}` : ''}
                      </span>
                      <Chip tone={severityTone(item.severity)}>{item.severity}</Chip>
                      <Chip tone={statusTone(item.status)}>{item.status}</Chip>
                      {item.parent_notified ? <Chip tone="green">parents told</Chip> : null}
                      <span className="ml-auto text-[10.5px] text-navy-300">{item.date}</span>
                    </div>
                    <p className="mt-1 text-[12px] leading-relaxed text-navy-500">
                      <strong className="capitalize">{item.category}</strong> — {item.description}
                    </p>
                    {item.action ? (
                      <p className="mt-0.5 text-[11.5px] text-navy-400">Decision: {item.action}</p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {item.status !== 'resolved' ? (
                        <Btn variant="ghost" icon={CheckCircle2} loading={busy} onClick={() => void update(item, 'resolved')}>
                          Resolve
                        </Btn>
                      ) : (
                        <Btn variant="ghost" loading={busy} onClick={() => void update(item, 'open')}>
                          Reopen
                        </Btn>
                      )}
                      {item.status !== 'escalated' ? (
                        <Btn variant="ghost" loading={busy} onClick={() => void update(item, 'escalated')}>
                          Escalate
                        </Btn>
                      ) : null}
                      <Btn variant="danger" icon={Trash2} loading={busy} onClick={() => void remove(item)} />
                      <span className="text-[10.5px] text-navy-300">recorded by {item.reported_by}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Record a case" icon={Plus}>
            <form className="space-y-3" onSubmit={record}>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                    Level
                  </span>
                  <select className={input} value={level} onChange={(event) => setLevel(event.target.value)}>
                    {LEVELS.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                    Trade
                  </span>
                  <select className={input} value={trade} onChange={(event) => setTrade(event.target.value)}>
                    <option value="">All</option>
                    {trades.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.code}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                  Student
                </span>
                <select
                  className={input}
                  value={form.student_id}
                  onChange={(event) => setForm({ ...form, student_id: event.target.value })}
                >
                  <option value="">Choose…</option>
                  {students.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.full_name} — {item.student_id}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                    Date
                  </span>
                  <input
                    type="date"
                    className={input}
                    value={form.date}
                    onChange={(event) => setForm({ ...form, date: event.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                    Category
                  </span>
                  <select
                    className={`${input} capitalize`}
                    value={form.category}
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                  >
                    {CATEGORIES.map((item) => (
                      <option key={item} value={item} className="capitalize">
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                  Severity
                </span>
                <select
                  className={input}
                  value={form.severity}
                  onChange={(event) => setForm({ ...form, severity: event.target.value })}
                >
                  <option value="minor">Minor</option>
                  <option value="major">Major</option>
                  <option value="critical">Critical</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                  What happened
                </span>
                <textarea
                  className={`${input} min-h-[84px]`}
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="Arrived 40 minutes after the register without a note."
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                  Decision
                </span>
                <input
                  className={input}
                  value={form.action}
                  onChange={(event) => setForm({ ...form, action: event.target.value })}
                  placeholder="Warning, parents informed."
                />
              </label>
              <label className="flex items-center gap-2 text-[11.5px] font-semibold text-navy-500">
                <input
                  type="checkbox"
                  checked={form.notify_parent}
                  onChange={(event) => setForm({ ...form, notify_parent: event.target.checked })}
                  className="h-4 w-4 rounded border-navy-200"
                />
                Tell the family (message + SMS)
              </label>
              <Btn type="submit" icon={Plus} loading={busy} size="md" className="w-full">
                Save case
              </Btn>
            </form>
          </Panel>
        </div>
      </div>
    </div>
  );
}
