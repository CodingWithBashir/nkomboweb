'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import api from '@/lib/axios';
import ImageField from '@/components/ImageField';
import { Card, Stat } from '@/components/dashboard/PortalShell';

type Trade = { id: number; code: string; name: string; slug: string };

type Teacher = {
  id: number;
  full_name: string;
  initials: string;
  email: string;
  phone: string;
  employee_id: string;
  title: string;
  is_hod: boolean;
  slug: string;
  qualification: string;
  bio: string;
  levels: string;
  classes: string;
  years_experience: number;
  is_public: boolean;
  photo_url: string | null;
  trade: Trade | null;
  department: { id: number; name: string } | null;
};

type FormState = {
  name: string;
  photo: string;
  email: string;
  phone: string;
  trade_id: string;
  title: string;
  is_hod: boolean;
  qualification: string;
  levels: string[];
  classes: string;
  years_experience: string;
  bio: string;
  is_public: boolean;
  invite: boolean;
};

const LEVELS = ['L3', 'L4', 'L5'];

const emptyForm: FormState = {
  name: '',
  photo: '',
  email: '',
  phone: '',
  trade_id: '',
  title: 'Trainer',
  is_hod: false,
  qualification: '',
  levels: ['L3'],
  classes: '',
  years_experience: '',
  bio: '',
  is_public: true,
  invite: true,
};

export default function HeadmasterTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [tradeFilter, setTradeFilter] = useState('all');
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [user, setUser] = useState<{ first_name?: string; last_name?: string; username?: string } | null>(
    null
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [teacherRes, tradeRes] = await Promise.all([
        api.get('/academics/teachers/?page_size=200'),
        api.get('/academics/trades/?page_size=100'),
      ]);
      const teacherList = teacherRes.data.results ?? teacherRes.data;
      const tradeList = tradeRes.data.results ?? tradeRes.data;
      setTeachers(teacherList);
      setTrades(tradeList);
    } catch {
      setError('Could not load the teaching staff. Check that the API is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    try {
      setUser(JSON.parse(localStorage.getItem('user') || 'null'));
    } catch {
      setUser(null);
    }
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, trade_id: trades[0] ? String(trades[0].id) : '' });
    setFormOpen(true);
    setNotice('');
  };

  const openEdit = (teacher: Teacher) => {
    setEditing(teacher);
    setForm({
      name: teacher.full_name,
      photo: teacher.photo_url ?? '',
      email: teacher.email ?? '',
      phone: teacher.phone ?? '',
      trade_id: teacher.trade ? String(teacher.trade.id) : '',
      title: teacher.title || 'Trainer',
      is_hod: teacher.is_hod,
      qualification: teacher.qualification ?? '',
      levels: (teacher.levels || 'L3')
        .split(',')
        .map((level) => level.trim())
        .filter(Boolean),
      classes: teacher.classes ?? '',
      years_experience: teacher.years_experience ? String(teacher.years_experience) : '',
      bio: teacher.bio ?? '',
      is_public: teacher.is_public,
      invite: false,
    });
    setFormOpen(true);
    setNotice('');
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const toggleLevel = (level: string) => {
    setForm((current) => ({
      ...current,
      levels: current.levels.includes(level)
        ? current.levels.filter((value) => value !== level)
        : [...current.levels, level].sort(),
    }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');

    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      photo: form.photo,
      email: form.email.trim(),
      phone: form.phone.trim(),
      title: form.title.trim() || 'Trainer',
      is_hod: form.is_hod,
      qualification: form.qualification.trim(),
      levels: form.levels.join(', '),
      classes: form.classes.trim(),
      years_experience: Number(form.years_experience) || 0,
      bio: form.bio.trim(),
      is_public: form.is_public,
    };
    if (form.trade_id) payload.trade_id = Number(form.trade_id);
    if (form.invite && !editing) payload.invite = true;

    try {
      if (editing) {
        const { data } = await api.patch(`/academics/teachers/${editing.slug}/`, payload);
        setTeachers((current) => current.map((t) => (t.id === data.id ? data : t)));
        setNotice(`${data.full_name}'s profile was updated.`);
      } else {
        const { data } = await api.post('/academics/teachers/', payload);
        setTeachers((current) => [data, ...current]);
        const invite = (data as { invite?: { status: string; to?: string } }).invite;
        setNotice(
          !form.email.trim() || (invite && invite.status === 'sent')
            ? `${data.full_name} was added and an invitation e-mail was sent to ${form.email.trim()} with a link to choose a password.`
            : !form.email.trim()
              ? `${data.full_name} was added. Add an e-mail address to invite them to the portal.`
              : `${data.full_name} was added. The invitation could not be delivered — it is waiting in the e-mail outbox.`
        );
      }
      closeForm();
    } catch (err) {
      const detail = (err as { response?: { data?: Record<string, unknown> } })?.response?.data;
      const message =
        detail && typeof detail === 'object'
          ? Object.entries(detail)
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(' ') : value}`)
              .join(' · ')
          : 'Could not save this teacher.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (teacher: Teacher) => {
    if (!window.confirm(`Remove ${teacher.full_name} from the teaching staff?`)) return;
    setError('');
    try {
      await api.delete(`/academics/teachers/${teacher.slug}/`);
      setTeachers((current) => current.filter((t) => t.id !== teacher.id));
      setNotice(`${teacher.full_name} was removed.`);
    } catch {
      setError('Could not remove this teacher.');
    }
  };

  const filtered = useMemo(
    () =>
      teachers.filter((teacher) => {
        const matchesTrade =
          tradeFilter === 'all' || String(teacher.trade?.id ?? '') === tradeFilter;
        const term = query.trim().toLowerCase();
        const matchesQuery =
          !term ||
          teacher.full_name.toLowerCase().includes(term) ||
          teacher.qualification.toLowerCase().includes(term) ||
          (teacher.trade?.name ?? '').toLowerCase().includes(term);
        return matchesTrade && matchesQuery;
      }),
    [teachers, tradeFilter, query]
  );

  const hods = teachers.filter((teacher) => teacher.is_hod).length;

  return (
    <>
      <div className="mx-auto max-w-[1240px] space-y-4 px-5 py-8">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Teachers" value={teachers.length} accent />
            <Stat label="Heads of department" value={hods} hint="one per trade" />
            <Stat label="Trades covered" value={trades.length} />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-navy-300 bg-navy-50 px-4 py-3 text-[12.5px] font-medium text-navy-600">
              <AlertCircle size={15} className="mt-[1px] shrink-0" />
              {error}
            </div>
          )}
          {notice && (
            <div className="flex items-start gap-2 rounded-lg border border-navy-200 bg-white px-4 py-3 text-[12.5px] font-medium text-navy-500">
              <CheckCircle2 size={15} className="mt-[1px] shrink-0" />
              {notice}
            </div>
          )}

          {formOpen && (
            <Card title={editing ? `Edit ${editing.full_name}` : 'Add a teacher'}>
              <form onSubmit={submit} className="space-y-4">
                <ImageField
                  value={form.photo}
                  onChange={(photo) => setForm({ ...form, photo })}
                  label="Profile photo"
                  hint="Shown on the website profile"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Full name" required>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Mukamana Diane"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Trade">
                    <select
                      value={form.trade_id}
                      onChange={(e) => setForm({ ...form, trade_id: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">No trade</option>
                      {trades.map((trade) => (
                        <option key={trade.id} value={trade.id}>
                          {trade.code} — {trade.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Role title">
                    <input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Trainer, Senior Trainer, Head of Department"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Qualification">
                    <input
                      value={form.qualification}
                      onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                      placeholder="BSc Computer Science, University of Rwanda"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="name@lyceedenyanza.rw"
                      className={inputClass}
                    />
                    {!editing && (
                      <label className="mt-1.5 flex cursor-pointer items-start gap-2 text-[11.5px] leading-relaxed text-navy-400">
                        <input
                          type="checkbox"
                          checked={form.invite}
                          onChange={(e) => setForm({ ...form, invite: e.target.checked })}
                          className="mt-0.5 h-3.5 w-3.5 rounded border-navy-300"
                        />
                        <span>
                          E-mail an invitation with a link to choose their own password (valid for 3
                          days). Without it the account keeps the default <em>teacher123</em>.
                        </span>
                      </label>
                    )}
                  </Field>
                  <Field label="Phone">
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+250 7…"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Classes taught">
                    <input
                      value={form.classes}
                      onChange={(e) => setForm({ ...form, classes: e.target.value })}
                      placeholder="L3 SOD-A, L4 SOD-B"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Years of experience">
                    <input
                      type="number"
                      min={0}
                      value={form.years_experience}
                      onChange={(e) => setForm({ ...form, years_experience: e.target.value })}
                      placeholder="6"
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-navy-400">
                      Levels
                    </p>
                    <div className="flex gap-2">
                      {LEVELS.map((level) => {
                        const active = form.levels.includes(level);
                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() => toggleLevel(level)}
                            aria-pressed={active}
                            className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${
                              active
                                ? 'bg-navy-500 text-white'
                                : 'border border-navy-200 text-navy-400 hover:border-navy-400'
                            }`}
                          >
                            {level}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-[12px] font-semibold text-navy-500">
                    <input
                      type="checkbox"
                      checked={form.is_hod}
                      onChange={(e) => setForm({ ...form, is_hod: e.target.checked })}
                      className="h-4 w-4 accent-black"
                    />
                    Head of Department
                  </label>
                  <label className="flex items-center gap-2 text-[12px] font-semibold text-navy-500">
                    <input
                      type="checkbox"
                      checked={form.is_public}
                      onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
                      className="h-4 w-4 accent-black"
                    />
                    Show profile on the website
                  </label>
                </div>

                <Field label="Profile / biography">
                  <textarea
                    rows={4}
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="A short paragraph about what this teacher teaches and their background."
                    className={inputClass}
                  />
                </Field>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-md bg-navy-500 px-4 py-2.5 text-[12.5px] font-bold text-white transition hover:bg-navy-600 disabled:opacity-60"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    {editing ? 'Save changes' : 'Add teacher'}
                  </button>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="inline-flex items-center gap-2 rounded-md border border-navy-200 px-4 py-2.5 text-[12.5px] font-semibold text-navy-500 transition hover:bg-navy-50"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                </div>
              </form>
            </Card>
          )}

          <Card
            title="Teaching staff"
            action={
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search
                    size={13}
                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-navy-300"
                  />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search teachers"
                    aria-label="Search teachers"
                    className="w-[190px] rounded-md border border-navy-100 py-1.5 pl-8 pr-3 text-[12px] outline-none focus:border-navy-400"
                  />
                </div>
                <select
                  value={tradeFilter}
                  onChange={(e) => setTradeFilter(e.target.value)}
                  aria-label="Filter by trade"
                  className="rounded-md border border-navy-100 px-2.5 py-1.5 text-[12px] text-navy-500 outline-none focus:border-navy-400"
                >
                  <option value="all">All trades</option>
                  {trades.map((trade) => (
                    <option key={trade.id} value={trade.id}>
                      {trade.code}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={openCreate}
                  className="inline-flex items-center gap-1.5 rounded-md bg-navy-500 px-3 py-1.5 text-[11.5px] font-bold text-white transition hover:bg-navy-600"
                >
                  <Plus size={13} />
                  Add teacher
                </button>
              </div>
            }
          >
            {loading ? (
              <div className="flex items-center gap-2 py-8 text-[12.5px] text-navy-400">
                <Loader2 size={16} className="animate-spin" />
                Loading teaching staff…
              </div>
            ) : filtered.length === 0 ? (
              <p className="py-6 text-[12.5px] text-navy-400">No teachers match this filter.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                  <thead>
                    <tr className="border-b border-navy-100 text-[10px] uppercase tracking-wide text-navy-300">
                      <th className="pb-2 font-bold">Teacher</th>
                      <th className="pb-2 font-bold">Trade</th>
                      <th className="pb-2 font-bold">Classes</th>
                      <th className="pb-2 font-bold">Profile</th>
                      <th className="pb-2 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((teacher) => (
                      <tr key={teacher.id} className="border-b border-navy-50 last:border-b-0">
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-100 text-[11px] font-extrabold text-navy-500">
                              {teacher.initials || <UserRound size={13} />}
                            </span>
                            <div className="min-w-0">
                              <p className="text-[12.5px] font-bold text-navy-500">
                                {teacher.full_name}
                                {teacher.is_hod && (
                                  <span className="ml-2 rounded-full bg-navy-500 px-2 py-[2px] text-[8.5px] font-bold uppercase tracking-wide text-white">
                                    HOD
                                  </span>
                                )}
                              </p>
                              <p className="text-[10.5px] text-navy-400">
                                {teacher.title} · {teacher.qualification || 'No qualification listed'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-3 text-[11.5px] text-navy-500">
                          {teacher.trade ? `${teacher.trade.code} — ${teacher.trade.name}` : '—'}
                        </td>
                        <td className="py-3 pr-3 text-[11.5px] text-navy-500">
                          {teacher.classes || '—'}
                          <span className="mt-0.5 block text-[10px] text-navy-300">
                            {teacher.levels || 'L3'}
                          </span>
                        </td>
                        <td className="py-3 pr-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[9.5px] font-bold uppercase tracking-wide ${
                              teacher.is_public
                                ? 'bg-navy-100 text-navy-500'
                                : 'border border-navy-200 text-navy-300'
                            }`}
                          >
                            {teacher.is_public ? 'Public' : 'Hidden'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(teacher)}
                              aria-label={`Edit ${teacher.full_name}`}
                              className="rounded-md border border-navy-100 p-1.5 text-navy-500 transition hover:bg-navy-50"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(teacher)}
                              aria-label={`Remove ${teacher.full_name}`}
                              className="rounded-md border border-navy-100 p-1.5 text-navy-500 transition hover:bg-navy-50"
                            >
                              <Trash2 size={12} />
                            </button>
                            <a
                              href={`/teachers/${teacher.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`Open ${teacher.full_name}'s public profile`}
                              className="rounded-md border border-navy-100 p-1.5 text-navy-500 transition hover:bg-navy-50"
                            >
                              <BookOpen size={12} />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

const inputClass =
  'w-full rounded-md border border-navy-100 px-3 py-2 text-[12.5px] text-navy-500 outline-none focus:border-navy-400';

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-wide text-navy-400">
        {label}
        {required && <span className="text-navy-500"> *</span>}
      </span>
      {children}
    </label>
  );
}
