'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock, Loader2, Plus, RefreshCw, Trash2 } from 'lucide-react';
import api from '@/lib/axios';
import {
  Btn,
  Chip,
  DAYS,
  Empty,
  LEVELS,
  Notice,
  PageHead,
  Panel,
  flatten,
  input,
} from '@/components/admin/ui';

type Trade = { id: number; code: string; name: string };
type Teacher = { id: number; full_name: string };
type Subject = { id: number; code: string; name: string };

type Slot = {
  id: number;
  trade_id: number;
  level: string;
  day: number;
  start_time: string;
  end_time: string;
  subject_id: number | null;
  subject: string | null;
  subject_code: string | null;
  teacher_id: number | null;
  teacher: string | null;
  room: string;
};

const DEFAULT_FORM = {
  day: '1',
  start_time: '08:00',
  end_time: '09:40',
  subject_id: '',
  teacher_id: '',
  room: '',
};

export default function TimetablePage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [trade, setTrade] = useState('');
  const [level, setLevel] = useState('L3');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    api
      .get('/academics/trades/', { params: { page_size: 100 } })
      .then((response) => {
        const list: Trade[] = response.data.results ?? [];
        setTrades(list);
        if (list.length) setTrade(String(list[0].id));
      })
      .catch(() => setTrades([]));
    api
      .get('/academics/teachers/', { params: { page_size: 100 } })
      .then((response) => setTeachers(response.data.results ?? []))
      .catch(() => setTeachers([]));
    api
      .get('/academics/subjects/', { params: { page_size: 200 } })
      .then((response) => setSubjects(response.data.results ?? []))
      .catch(() => setSubjects([]));
  }, []);

  const load = useCallback(async () => {
    if (!trade) return;
    setLoading(true);
    try {
      const { data } = await api.get('/timetable/week/', { params: { trade, level } });
      setSlots(data.results ?? []);
    } catch (error) {
      setNotice({ kind: 'error', text: flatten(error) });
    } finally {
      setLoading(false);
    }
  }, [trade, level]);

  useEffect(() => {
    void load();
  }, [load]);

  const addSlot = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      await api.post('/timetable/', {
        trade_id: Number(trade),
        level,
        day: Number(form.day),
        start_time: form.start_time,
        end_time: form.end_time,
        subject_id: form.subject_id ? Number(form.subject_id) : null,
        teacher_id: form.teacher_id ? Number(form.teacher_id) : null,
        room: form.room,
      });
      setNotice({ kind: 'ok', text: 'Lesson added to the week.' });
      setForm({ ...DEFAULT_FORM, day: form.day, start_time: form.end_time });
      await load();
    } catch (error) {
      setNotice({ kind: 'error', text: flatten(error) });
    } finally {
      setBusy(false);
    }
  };

  const removeSlot = async (slot: Slot) => {
    setBusy(true);
    setNotice(null);
    try {
      await api.delete(`/timetable/${slot.id}/`);
      await load();
      setNotice({ kind: 'ok', text: 'Lesson removed.' });
    } catch (error) {
      setNotice({ kind: 'error', text: flatten(error) });
    } finally {
      setBusy(false);
    }
  };

  const byDay = useMemo(() => {
    const map: Record<number, Slot[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    slots.forEach((slot) => {
      if (map[slot.day]) map[slot.day].push(slot);
    });
    Object.values(map).forEach((list) =>
      list.sort((a, b) => a.start_time.localeCompare(b.start_time))
    );
    return map;
  }, [slots]);

  const tradeName = trades.find((item) => String(item.id) === trade)?.code ?? '';

  return (
    <div className="min-h-screen bg-navy-50/50">
      <div className="mx-auto max-w-[1100px] px-5 py-10">
        <PageHead
          eyebrow="Teaching"
          title="Weekly timetable"
          description="One grid per trade and level. Every lesson gets a subject, a teacher and a room, and the same timetable is what students and parents see."
          actions={
            <Btn variant="ghost" icon={RefreshCw} onClick={() => void load()}>
              Reload
            </Btn>
          }
        />

        <Panel className="mb-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                Trade
              </span>
              <select className={input} value={trade} onChange={(event) => setTrade(event.target.value)}>
                {trades.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.code} — {item.name}
                  </option>
                ))}
              </select>
            </label>
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
            <div className="flex items-end">
              <Chip tone="navy">
                <CalendarDays size={11} /> {slots.length} lessons / week
              </Chip>
            </div>
          </div>
        </Panel>

        {notice ? (
          <div className="mb-4">
            <Notice kind={notice.kind}>{notice.text}</Notice>
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <Panel title={`${tradeName} · ${level}`} icon={CalendarDays}>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-[12.5px] text-navy-400">
                <Loader2 size={15} className="animate-spin" /> Loading the week…
              </div>
            ) : slots.length === 0 ? (
              <Empty>No lesson yet for this class — add the first one on the right.</Empty>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {DAYS.map((dayName, index) => (
                  <div key={dayName} className="rounded-lg bg-navy-50/50 p-2.5">
                    <p className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                      {dayName.slice(0, 3)}
                    </p>
                    <div className="space-y-2">
                      {byDay[index + 1].length === 0 ? (
                        <p className="text-[11px] text-navy-300">Free</p>
                      ) : (
                        byDay[index + 1].map((slot) => (
                          <div
                            key={slot.id}
                            className="group rounded-lg border border-navy-100 bg-white px-2.5 py-2"
                          >
                            <p className="flex items-center gap-1 text-[10.5px] font-bold text-gold-700">
                              <Clock size={10} />
                              {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                            </p>
                            <p className="mt-1 text-[12px] font-bold text-navy-500">
                              {slot.subject ?? 'Lesson'}
                            </p>
                            <p className="text-[10.5px] text-navy-300">
                              {slot.teacher ?? 'No teacher'}
                              {slot.room ? ` · ${slot.room}` : ''}
                            </p>
                            <button
                              type="button"
                              onClick={() => void removeSlot(slot)}
                              className="mt-1.5 hidden items-center gap-1 text-[10px] font-bold text-red-500 group-hover:flex"
                            >
                              <Trash2 size={10} /> remove
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Add a lesson" icon={Plus}>
            <form className="space-y-3" onSubmit={addSlot}>
              <label className="block">
                <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                  Day
                </span>
                <select
                  className={input}
                  value={form.day}
                  onChange={(event) => setForm({ ...form, day: event.target.value })}
                >
                  {DAYS.map((dayName, index) => (
                    <option key={dayName} value={index + 1}>
                      {dayName}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                    From
                  </span>
                  <input
                    type="time"
                    className={input}
                    value={form.start_time}
                    onChange={(event) => setForm({ ...form, start_time: event.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                    To
                  </span>
                  <input
                    type="time"
                    className={input}
                    value={form.end_time}
                    onChange={(event) => setForm({ ...form, end_time: event.target.value })}
                  />
                </label>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                  Subject
                </span>
                <select
                  className={input}
                  value={form.subject_id}
                  onChange={(event) => setForm({ ...form, subject_id: event.target.value })}
                >
                  <option value="">Choose…</option>
                  {subjects.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.code} — {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                  Teacher
                </span>
                <select
                  className={input}
                  value={form.teacher_id}
                  onChange={(event) => setForm({ ...form, teacher_id: event.target.value })}
                >
                  <option value="">Not assigned</option>
                  {teachers.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.full_name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                  Room
                </span>
                <input
                  className={input}
                  value={form.room}
                  onChange={(event) => setForm({ ...form, room: event.target.value })}
                  placeholder="Computer lab"
                />
              </label>
              <Btn type="submit" icon={Plus} loading={busy} size="md" className="w-full">
                Add lesson
              </Btn>
            </form>
          </Panel>
        </div>
      </div>
    </div>
  );
}
