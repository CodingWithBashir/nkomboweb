'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import SafeImage from '@/components/SafeImage';
import Link from 'next/link';
import {
  GraduationCap,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import ImageField from '@/components/ImageField';
import api from '@/lib/axios';

type Trade = { id: number; slug: string; name: string; code: string; program_id?: number };

type Student = {
  id: number;
  full_name: string;
  student_id: string;
  level: string;
  promotion_year: number;
  photo_url: string | null;
  initials?: string;
  gender?: string;
  is_public: boolean;
  program_id: number;
  trade: { id: number; name: string; slug: string } | null;
};

type FormState = {
  name: string;
  email: string;
  trade_id: string;
  level: string;
  promotion_year: string;
  photo: string;
  gender: string;
  parent_name: string;
  parent_phone: string;
  is_public: boolean;
};

const emptyForm: FormState = {
  name: '',
  email: '',
  trade_id: '',
  level: 'L3',
  promotion_year: String(new Date().getFullYear() + 1),
  photo: '',
  gender: 'F',
  parent_name: '',
  parent_phone: '',
  is_public: true,
};

const LEVELS = ['L3', 'L4', 'L5'];

export default function StudentsAdminPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [tradeFilter, setTradeFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [studentRes, tradeRes] = await Promise.all([
        api.get('/academics/students/?page_size=300'),
        api.get('/academics/trades/?page_size=100'),
      ]);
      setStudents(studentRes.data?.results ?? []);
      setTrades(tradeRes.data?.results ?? []);
    } catch {
      setError('Could not load the student list.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, trade_id: trades[0] ? String(trades[0].id) : '' });
    setOpen(true);
    setNotice('');
  };

  const openEdit = (student: Student) => {
    setEditing(student);
    setForm({
      name: student.full_name,
      email: '',
      trade_id: student.trade ? String(student.trade.id) : '',
      level: student.level || 'L3',
      promotion_year: String(student.promotion_year || ''),
      photo: student.photo_url ?? '',
      gender: student.gender ?? 'F',
      parent_name: '',
      parent_phone: '',
      is_public: student.is_public,
    });
    setOpen(true);
    setNotice('');
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        trade_id: Number(form.trade_id),
        level: form.level,
        promotion_year: Number(form.promotion_year) || 0,
        photo: form.photo,
        gender: form.gender,
        parent_name: form.parent_name,
        parent_phone: form.parent_phone,
        is_public: form.is_public,
      };
      if (form.email.trim()) payload.email = form.email.trim();

      if (editing) {
        const { data } = await api.patch(`/academics/students/${editing.id}/`, payload);
        setStudents((current) => current.map((item) => (item.id === data.id ? data : item)));
        setNotice(`${data.full_name}'s record was updated.`);
      } else {
        const { data } = await api.post('/academics/students/', payload);
        setStudents((current) => [data, ...current]);
        setNotice(`${data.full_name} was enrolled.`);
      }
      setOpen(false);
    } catch (err: any) {
      const detail = err?.response?.data;
      setError(
        typeof detail === 'object' && detail
          ? Object.entries(detail)
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(' ') : value}`)
              .join(' · ')
          : 'Could not save this student.'
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (student: Student) => {
    if (!window.confirm(`Remove ${student.full_name} from the student list?`)) return;
    try {
      await api.delete(`/academics/students/${student.id}/`);
      setStudents((current) => current.filter((item) => item.id !== student.id));
      setNotice(`${student.full_name} was removed.`);
    } catch {
      setError('Could not remove this student.');
    }
  };

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return students.filter((student) => {
      if (tradeFilter !== 'all' && student.trade?.slug !== tradeFilter) return false;
      if (levelFilter !== 'all' && student.level !== levelFilter) return false;
      if (!needle) return true;
      return (
        student.full_name.toLowerCase().includes(needle) ||
        student.student_id.toLowerCase().includes(needle)
      );
    });
  }, [students, tradeFilter, levelFilter, query]);

  return (
    <>
      <div className="min-h-screen bg-navy-50/50">
        <div className="mx-auto max-w-[1240px] px-5 py-10">

          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-gold-600">
                Student records
              </p>
              <h1 className="mt-2 font-heading text-[28px] font-extrabold text-navy-500">
                Students &amp; promotions
              </h1>
              <p className="mt-1.5 text-[13px] text-navy-400">
                Enrol students, move them between L3 and L5, and publish their photos to the website.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-[12.5px] font-bold text-white transition hover:bg-gold-600"
            >
              <Plus size={15} /> Add student
            </button>
          </div>

          {(notice || error) && (
            <p
              className={`mt-5 rounded-xl px-4 py-3 text-[12.5px] font-medium ${
                error ? 'bg-red-50 text-red-700' : 'bg-gold-50 text-gold-700'
              }`}
            >
              {error || notice}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2.5 rounded-2xl border border-navy-100 bg-white p-3">
            <div className="relative min-w-[200px] flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-300" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name or student number…"
                className="w-full rounded-xl border border-transparent bg-navy-50/70 py-2.5 pl-10 pr-3 text-[13px] text-navy-600 outline-none focus:border-navy-200 focus:bg-white"
              />
            </div>
            <select
              value={tradeFilter}
              onChange={(event) => setTradeFilter(event.target.value)}
              className="rounded-xl border border-navy-200 px-3 py-2.5 text-[12.5px] font-semibold text-navy-500"
            >
              <option value="all">All trades</option>
              {trades.map((trade) => (
                <option key={trade.slug} value={trade.slug}>
                  {trade.name}
                </option>
              ))}
            </select>
            <select
              value={levelFilter}
              onChange={(event) => setLevelFilter(event.target.value)}
              className="rounded-xl border border-navy-200 px-3 py-2.5 text-[12.5px] font-semibold text-navy-500"
            >
              <option value="all">All levels</option>
              {LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            <span className="text-[12px] font-semibold text-navy-300">{filtered.length} shown</span>
          </div>

          {loading ? (
            <div className="mt-16 flex items-center justify-center gap-2 text-navy-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading students…
            </div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-2xl border border-navy-100 bg-white">
              <div className="divide-y divide-navy-100">
                {filtered.map((student) => (
                  <div key={student.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy-50 ring-1 ring-navy-100">
                      {student.photo_url ? (
                        <SafeImage
                          src={student.photo_url}
                          alt=""
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[12px] font-extrabold text-navy-500">
                          {student.initials}
                        </span>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-bold text-navy-600">{student.full_name}</p>
                      <p className="truncate text-[11.5px] text-navy-400">
                        {student.student_id} · {student.trade?.name ?? 'No trade'}
                      </p>
                    </div>
                    <span className="hidden rounded-full bg-navy-50 px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wide text-navy-500 sm:block">
                      {student.level}
                    </span>
                    <span className="hidden text-[11.5px] text-navy-400 sm:block">
                      Class of {student.promotion_year || '—'}
                    </span>
                    {!student.is_public && (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase text-red-600">
                        Hidden
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => openEdit(student)}
                      className="rounded-lg p-2 text-navy-400 transition hover:bg-navy-50 hover:text-navy-600"
                      aria-label={`Edit ${student.full_name}`}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(student)}
                      className="rounded-lg p-2 text-navy-300 transition hover:bg-red-50 hover:text-red-600"
                      aria-label={`Remove ${student.full_name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <p className="px-5 py-14 text-center text-[13px] text-navy-400">
                    No students match those filters.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {open && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy-900/50 p-4 backdrop-blur-sm">
            <form
              onSubmit={submit}
              className="my-8 w-full max-w-[560px] rounded-3xl bg-white p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-gold-600">
                    {editing ? 'Edit record' : 'New student'}
                  </p>
                  <h2 className="mt-1 flex items-center gap-2 font-heading text-[20px] font-extrabold text-navy-500">
                    <GraduationCap size={18} /> {editing ? editing.full_name : 'Enrol a student'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 text-navy-300 hover:bg-navy-50 hover:text-navy-500"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-5 grid gap-4">
                <ImageField value={form.photo} onChange={(photo) => setForm({ ...form, photo })} label="Student photo" />

                <label className="block">
                  <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.12em] text-navy-400">
                    Full name
                  </span>
                  <input
                    required
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    className="w-full rounded-xl border border-navy-200 px-3 py-2.5 text-[13px] text-navy-600 outline-none focus:border-navy-400"
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.12em] text-navy-400">
                      Trade
                    </span>
                    <select
                      value={form.trade_id}
                      onChange={(event) => setForm({ ...form, trade_id: event.target.value })}
                      className="w-full rounded-xl border border-navy-200 px-3 py-2.5 text-[13px] text-navy-600"
                    >
                      {trades.map((trade) => (
                        <option key={trade.id} value={trade.id}>
                          {trade.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.12em] text-navy-400">
                      Level
                    </span>
                    <select
                      value={form.level}
                      onChange={(event) => setForm({ ...form, level: event.target.value })}
                      className="w-full rounded-xl border border-navy-200 px-3 py-2.5 text-[13px] text-navy-600"
                    >
                      {LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.12em] text-navy-400">
                      Promotion (class of)
                    </span>
                    <input
                      type="number"
                      value={form.promotion_year}
                      onChange={(event) => setForm({ ...form, promotion_year: event.target.value })}
                      className="w-full rounded-xl border border-navy-200 px-3 py-2.5 text-[13px] text-navy-600 outline-none focus:border-navy-400"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.12em] text-navy-400">
                      Gender
                    </span>
                    <select
                      value={form.gender}
                      onChange={(event) => setForm({ ...form, gender: event.target.value })}
                      className="w-full rounded-xl border border-navy-200 px-3 py-2.5 text-[13px] text-navy-600"
                    >
                      <option value="F">Female</option>
                      <option value="M">Male</option>
                    </select>
                  </label>
                </div>

                {!editing && (
                  <label className="block">
                    <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.12em] text-navy-400">
                      School e-mail (optional)
                    </span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm({ ...form, email: event.target.value })}
                      placeholder="student@student.lyceedenyanza.rw"
                      className="w-full rounded-xl border border-navy-200 px-3 py-2.5 text-[13px] text-navy-600 outline-none focus:border-navy-400"
                    />
                  </label>
                )}

                <label className="flex items-center gap-2.5 rounded-xl bg-navy-50/70 px-3.5 py-3">
                  <input
                    type="checkbox"
                    checked={form.is_public}
                    onChange={(event) => setForm({ ...form, is_public: event.target.checked })}
                    className="h-4 w-4 rounded border-navy-300"
                  />
                  <span className="text-[12.5px] font-semibold text-navy-600">
                    Show this student in the public directory
                  </span>
                </label>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-navy-200 px-4 py-2.5 text-[12.5px] font-bold text-navy-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-navy-500 px-5 py-2.5 text-[12.5px] font-bold text-white disabled:opacity-60"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {editing ? 'Save changes' : 'Enrol student'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
