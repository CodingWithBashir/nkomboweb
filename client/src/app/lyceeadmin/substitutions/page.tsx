'use client';

import { useCallback, useEffect, useState } from 'react';
import { CalendarClock, Loader2, RefreshCw, Trash2, UserCheck } from 'lucide-react';
import api from '@/lib/axios';
import {
  Btn,
  Chip,
  Empty,
  Notice,
  PageHead,
  Panel,
  flatten,
  input,
} from '@/components/admin/ui';

type Teacher = { id: number; full_name: string };

type Cover = {
  id: number;
  substitute_teacher_id: number;
  substitute_teacher: string | null;
  absent_teacher: string | null;
  reason: string;
  note: string;
};

type Lesson = {
  slot_id: number;
  trade_code: string | null;
  level: string;
  start_time: string;
  end_time: string;
  subject: string | null;
  teacher_id: number | null;
  teacher: string | null;
  room: string;
  substitution: Cover | null;
  conflict: boolean;
};

type Day = {
  date: string;
  day_name: string;
  count: number;
  covered: number;
  results: Lesson[];
};

const today = () => new Date().toISOString().slice(0, 10);

export default function SubstitutionsPage() {
  const [date, setDate] = useState(today());
  const [day, setDay] = useState<Day | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [choice, setChoice] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    api
      .get('/academics/teachers/', { params: { page_size: 100 } })
      .then((response) => setTeachers(response.data.results ?? []))
      .catch(() => setTeachers([]));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setNotice(null);
    try {
      const { data } = await api.get('/substitutions/day/', { params: { date } });
      setDay(data as Day);
    } catch (error) {
      setNotice({ kind: 'error', text: flatten(error) });
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    void load();
  }, [load]);

  const assign = async (lesson: Lesson, force = false) => {
    const teacherId = choice[lesson.slot_id];
    if (!teacherId) {
      setNotice({ kind: 'error', text: 'Choose the teacher who covers this lesson.' });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      await api.post('/substitutions/', {
        date,
        slot_id: lesson.slot_id,
        substitute_teacher_id: Number(teacherId),
        absent_teacher_id: lesson.teacher_id,
        reason: 'Absent',
        note: lesson.room,
        force,
      });
      setNotice({
        kind: 'ok',
        text: `${teachers.find((item) => String(item.id) === teacherId)?.full_name ?? 'The teacher'} covers ${lesson.subject ?? 'the lesson'} at ${lesson.start_time}. They were notified.`,
      });
      await load();
    } catch (error) {
      const detail =
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? flatten(error);
      setNotice({ kind: 'error', text: detail });
      const response = (error as { response?: { status?: number } }).response;
      if (force || response?.status !== 409) return;
      if (window.confirm(`${detail}\n\nAssign anyway?`)) {
        await assign(lesson, true);
      }
    } finally {
      setBusy(false);
    }
  };

  const remove = async (cover: Cover) => {
    setBusy(true);
    try {
      await api.delete(`/substitutions/${cover.id}/`);
      await load();
      setNotice({ kind: 'ok', text: 'Cover removed from the sheet.' });
    } catch (error) {
      setNotice({ kind: 'error', text: flatten(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-50/50">
      <div className="mx-auto max-w-[1100px] px-5 py-10">
        <PageHead
          eyebrow="Teaching"
          title="Cover & substitutions"
          description="Pick a day and see every lesson that needs a teacher. Assign a colleague in one click — they get a message and an e-mail with the room and hour, and the class never sits unattended."
          actions={
            <Btn variant="ghost" icon={RefreshCw} onClick={() => void load()}>
              Reload
            </Btn>
          }
        />

        <Panel className="mb-5">
          <div className="flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                Day
              </span>
              <input
                type="date"
                className={input}
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </label>
            {day ? (
              <div className="flex flex-wrap items-center gap-2 pb-1">
                <Chip tone="navy">{day.day_name}</Chip>
                <Chip tone="green">{day.covered} covered</Chip>
                <Chip tone="amber">{Math.max(0, day.count - day.covered)} open</Chip>
              </div>
            ) : null}
          </div>
        </Panel>

        {notice ? (
          <div className="mb-4">
            <Notice kind={notice.kind}>{notice.text}</Notice>
          </div>
        ) : null}

        <Panel title="Lessons of the day" icon={CalendarClock}>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-[12.5px] text-navy-400">
              <Loader2 size={15} className="animate-spin" /> Reading the timetable…
            </div>
          ) : !day || day.results.length === 0 ? (
            <Empty>
              Nothing scheduled for {day?.day_name?.toLowerCase() ?? 'that day'} — the weekend, or no timetable
              entered yet for these classes.
            </Empty>
          ) : (
            <ul className="divide-y divide-navy-50">
              {day.results.map((lesson) => (
                <li key={lesson.slot_id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="w-[92px] flex-none">
                    <p className="text-[12px] font-bold text-navy-500">
                      {lesson.start_time.slice(0, 5)}–{lesson.end_time.slice(0, 5)}
                    </p>
                    <p className="text-[10.5px] text-navy-300">{lesson.room || '—'}</p>
                  </div>
                  <div className="min-w-[180px] flex-1">
                    <p className="text-[12.5px] font-bold text-navy-500">
                      {lesson.subject ?? 'Lesson'}
                    </p>
                    <p className="text-[10.5px] text-navy-300">
                      {lesson.trade_code ?? ''} {lesson.level} · {lesson.teacher ?? 'no teacher'}
                    </p>
                  </div>

                  {lesson.substitution ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <Chip tone="green">
                        <UserCheck size={10} /> {lesson.substitution.substitute_teacher}
                      </Chip>
                      {lesson.conflict ? <Chip tone="amber">also booked</Chip> : null}
                      <Btn variant="danger" icon={Trash2} loading={busy} onClick={() => void remove(lesson.substitution!)} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <select
                        className={`${input} max-w-[210px]`}
                        value={choice[lesson.slot_id] ?? ''}
                        onChange={(event) =>
                          setChoice((current) => ({ ...current, [lesson.slot_id]: event.target.value }))
                        }
                      >
                        <option value="">Who covers?</option>
                        {teachers
                          .filter((teacher) => teacher.id !== lesson.teacher_id)
                          .map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                              {teacher.full_name}
                            </option>
                          ))}
                      </select>
                      <Btn icon={UserCheck} loading={busy} onClick={() => void assign(lesson)}>
                        Cover
                      </Btn>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <p className="mt-5 text-[11px] leading-relaxed text-navy-300">
          The substitute is warned when they already have a lesson at the same hour; you can still
          override it. Every cover is written into the audit log with your name.
        </p>
      </div>
    </div>
  );
}
