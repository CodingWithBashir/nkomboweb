'use client';

import { useEffect, useState } from 'react';
import {
  ClipboardList,
  CalendarCheck,
  FolderUp,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Upload,
} from 'lucide-react';
import api from '@/lib/axios';
import RequireAuth from '@/components/RequireAuth';
import PortalShell, { Card } from '@/components/dashboard/PortalShell';

type Profile = { first_name?: string; last_name?: string; username?: string; role?: string };
type Student = { id: number; student_id: string; full_name: string; program?: { name: string } };
type Subject = { id: number; name: string; code: string };
type Grade = {
  id: number;
  score: string;
  max_score: string;
  term: string;
  academic_year: string;
  student: { full_name: string };
  subject: { name: string };
};
type Resource = {
  id: number;
  title: string;
  class_level: string;
  academic_year: string;
  term_display: string;
  file: string | null;
  file_size: string;
};

const TABS = [
  { id: 'marks', label: 'Enter Marks', icon: ClipboardList },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { id: 'resources', label: 'Upload Resources', icon: FolderUp },
];

const TERMS = ['Term 1', 'Term 2', 'Term 3'];
const YEARS = ['2024-2025', '2025-2026'];
const STATUSES = ['present', 'absent', 'late', 'excused'];

export default function TeacherDashboard() {
  return (
    <RequireAuth roles={['teacher', 'dos', 'headmaster', 'admin']}>
      <Dashboard />
    </RequireAuth>
  );
}

function Dashboard() {
  const [tab, setTab] = useState('marks');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [recentGrades, setRecentGrades] = useState<Grade[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // marks form
  const [markForm, setMarkForm] = useState({
    student_id: '',
    subject_id: '',
    score: '',
    max_score: '100',
    term: 'Term 1',
    academic_year: '2024-2025',
  });
  const [savingMark, setSavingMark] = useState(false);

  // attendance form
  const [registerDate, setRegisterDate] = useState(new Date().toISOString().slice(0, 10));
  const [register, setRegister] = useState<Record<number, string>>({});
  const [savingRegister, setSavingRegister] = useState(false);

  // resource form
  const [resourceForm, setResourceForm] = useState({
    title: '',
    class_level: 'L3',
    year: '2024',
    term: '1',
    resource_type: 'assignment',
  });
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const flash = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(''), 4000);
  };

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [profileRes, studentsRes, subjectsRes, gradesRes, resourcesRes] = await Promise.all([
        api.get('/auth/profile/'),
        api.get('/academics/students/', { params: { page_size: 100 } }),
        api.get('/academics/subjects/', { params: { page_size: 100 } }),
        api.get('/academics/grades/', { params: { page_size: 10 } }),
        api.get('/holiday-resources/', { params: { page_size: 50 } }),
      ]);
      setProfile(profileRes.data);
      setStudents(studentsRes.data?.results ?? []);
      setSubjects(subjectsRes.data?.results ?? []);
      setRecentGrades(gradesRes.data?.results ?? []);
      setResources(resourcesRes.data?.results ?? []);
    } catch {
      setError('Could not load portal data. Make sure the school server is running, then retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveMark = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingMark(true);
    setError('');
    try {
      await api.post('/academics/grades/', {
        student_id: Number(markForm.student_id),
        subject_id: Number(markForm.subject_id),
        score: markForm.score,
        max_score: markForm.max_score,
        term: markForm.term,
        academic_year: markForm.academic_year,
      });
      flash('Mark saved.');
      setMarkForm((form) => ({ ...form, score: '' }));
      const gradesRes = await api.get('/academics/grades/', { params: { page_size: 10 } });
      setRecentGrades(gradesRes.data?.results ?? []);
    } catch (err: any) {
      const detail = err?.response?.data;
      setError(
        detail?.non_field_errors?.[0] ||
          detail?.score?.[0] ||
          detail?.student_id?.[0] ||
          'Could not save the mark. A mark for this student, subject and term may already exist.'
      );
    } finally {
      setSavingMark(false);
    }
  };

  const saveRegister = async () => {
    const entries = Object.entries(register).filter(([, status]) => status);
    if (!entries.length) {
      setError('Choose a status for at least one student first.');
      return;
    }
    setSavingRegister(true);
    setError('');
    try {
      await Promise.all(
        entries.map(([studentId, status]) =>
          api.post('/academics/attendance/', {
            student_id: Number(studentId),
            date: registerDate,
            status,
          })
        )
      );
      flash(`Register saved for ${entries.length} student(s).`);
      setRegister({});
    } catch (err: any) {
      setError(
        err?.response?.data?.non_field_errors?.[0] ||
          'Some entries could not be saved — attendance may already exist for that date.'
      );
    } finally {
      setSavingRegister(false);
    }
  };

  const uploadResource = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resourceForm.title.trim()) {
      setError('Give the resource a title first.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const data = new FormData();
      data.append('title', resourceForm.title);
      data.append('class_level', resourceForm.class_level);
      data.append('year', resourceForm.year);
      data.append('term', resourceForm.term);
      data.append('resource_type', resourceForm.resource_type);
      if (resourceFile) data.append('file', resourceFile);

      await api.post('/holiday-resources/', data);
      flash('Resource published.');
      setResourceForm((form) => ({ ...form, title: '' }));
      setResourceFile(null);
      const resourcesRes = await api.get('/holiday-resources/', { params: { page_size: 50 } });
      setResources(resourcesRes.data?.results ?? []);
    } catch {
      setError('Upload failed. Check the file type and try again.');
    } finally {
      setUploading(false);
    }
  };

  const deleteResource = async (id: number) => {
    try {
      await api.delete(`/holiday-resources/${id}/`);
      setResources((list) => list.filter((item) => item.id !== id));
      flash('Resource removed.');
    } catch {
      setError('Could not delete that resource.');
    }
  };

  return (
    <PortalShell
      user={profile}
      subtitle="Teacher Portal"
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
    >
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-[12.5px] text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-[12.5px] text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          <span>{notice}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-3 rounded-xl border border-navy-100 bg-white p-8 text-navy-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading portal…</span>
        </div>
      ) : (
        <>
          {/* --------------------------------- MARKS -------------------------------- */}
          {tab === 'marks' && (
            <div className="grid gap-5 lg:grid-cols-2">
              <Card title="Record a mark">
                <form onSubmit={saveMark} className="grid gap-4">
                  <label className="grid gap-1.5">
                    <span className="text-[11.5px] font-bold text-navy-500">Student</span>
                    <select
                      required
                      value={markForm.student_id}
                      onChange={(e) => setMarkForm({ ...markForm, student_id: e.target.value })}
                      className="rounded-md border border-navy-100 px-3 py-2 text-[12.5px] text-navy-500 outline-none focus:border-gold-400"
                    >
                      <option value="">Select a student</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.full_name} — {student.student_id}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1.5">
                    <span className="text-[11.5px] font-bold text-navy-500">Subject</span>
                    <select
                      required
                      value={markForm.subject_id}
                      onChange={(e) => setMarkForm({ ...markForm, subject_id: e.target.value })}
                      className="rounded-md border border-navy-100 px-3 py-2 text-[12.5px] text-navy-500 outline-none focus:border-gold-400"
                    >
                      <option value="">Select a subject</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code})
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="grid gap-1.5">
                      <span className="text-[11.5px] font-bold text-navy-500">Score</span>
                      <input
                        required
                        type="number"
                        step="0.01"
                        min="0"
                        value={markForm.score}
                        onChange={(e) => setMarkForm({ ...markForm, score: e.target.value })}
                        className="rounded-md border border-navy-100 px-3 py-2 text-[12.5px] outline-none focus:border-gold-400"
                        placeholder="82"
                      />
                    </label>
                    <label className="grid gap-1.5">
                      <span className="text-[11.5px] font-bold text-navy-500">Out of</span>
                      <input
                        required
                        type="number"
                        step="0.01"
                        min="1"
                        value={markForm.max_score}
                        onChange={(e) => setMarkForm({ ...markForm, max_score: e.target.value })}
                        className="rounded-md border border-navy-100 px-3 py-2 text-[12.5px] outline-none focus:border-gold-400"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="grid gap-1.5">
                      <span className="text-[11.5px] font-bold text-navy-500">Term</span>
                      <select
                        value={markForm.term}
                        onChange={(e) => setMarkForm({ ...markForm, term: e.target.value })}
                        className="rounded-md border border-navy-100 px-3 py-2 text-[12.5px] text-navy-500 outline-none focus:border-gold-400"
                      >
                        {TERMS.map((term) => (
                          <option key={term}>{term}</option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-1.5">
                      <span className="text-[11.5px] font-bold text-navy-500">Academic year</span>
                      <select
                        value={markForm.academic_year}
                        onChange={(e) =>
                          setMarkForm({ ...markForm, academic_year: e.target.value })
                        }
                        className="rounded-md border border-navy-100 px-3 py-2 text-[12.5px] text-navy-500 outline-none focus:border-gold-400"
                      >
                        {YEARS.map((year) => (
                          <option key={year}>{year}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={savingMark}
                    className="mt-1 flex items-center justify-center gap-2 rounded-md bg-navy-500 px-4 py-2.5 text-[12.5px] font-bold text-white transition hover:bg-navy-600 disabled:opacity-60"
                  >
                    {savingMark && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Save mark
                  </button>
                </form>
              </Card>

              <Card title="Recently recorded">
                {recentGrades.length === 0 ? (
                  <p className="text-[12.5px] text-navy-400">No marks recorded yet.</p>
                ) : (
                  <ul className="divide-y divide-navy-50">
                    {recentGrades.map((item) => (
                      <li key={item.id} className="flex items-center justify-between py-2.5">
                        <div>
                          <p className="text-[12.5px] font-bold text-navy-500">
                            {item.student?.full_name}
                          </p>
                          <p className="text-[10.5px] text-navy-300">
                            {item.subject?.name} · {item.term}
                          </p>
                        </div>
                        <span className="text-[12.5px] font-bold text-navy-500">
                          {item.score}/{item.max_score}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          )}

          {/* ------------------------------- ATTENDANCE ----------------------------- */}
          {tab === 'attendance' && (
            <Card
              title="Daily register"
              action={
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={registerDate}
                    onChange={(e) => setRegisterDate(e.target.value)}
                    className="rounded-md border border-navy-100 px-2.5 py-1.5 text-[11.5px] text-navy-500 outline-none focus:border-gold-400"
                  />
                  <button
                    type="button"
                    onClick={saveRegister}
                    disabled={savingRegister}
                    className="flex items-center gap-1.5 rounded-md bg-navy-500 px-3 py-1.5 text-[11.5px] font-bold text-white disabled:opacity-60"
                  >
                    {savingRegister && <Loader2 className="h-3 w-3 animate-spin" />}
                    Save register
                  </button>
                </div>
              }
            >
              {students.length === 0 ? (
                <p className="text-[12.5px] text-navy-400">No students registered yet.</p>
              ) : (
                <div className="divide-y divide-navy-50">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                    >
                      <div>
                        <p className="text-[12.5px] font-bold text-navy-500">
                          {student.full_name}
                        </p>
                        <p className="text-[10.5px] text-navy-300">{student.student_id}</p>
                      </div>
                      <div className="flex gap-1.5">
                        {STATUSES.map((option) => {
                          const active = register[student.id] === option;
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() =>
                                setRegister((current) => ({ ...current, [student.id]: option }))
                              }
                              className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold capitalize transition ${
                                active
                                  ? 'bg-navy-500 text-white'
                                  : 'border border-navy-100 text-navy-400 hover:border-navy-300'
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* -------------------------------- RESOURCES ----------------------------- */}
          {tab === 'resources' && (
            <div className="grid gap-5 lg:grid-cols-2">
              <Card title="Publish a resource">
                <form onSubmit={uploadResource} className="grid gap-4">
                  <label className="grid gap-1.5">
                    <span className="text-[11.5px] font-bold text-navy-500">Title</span>
                    <input
                      required
                      value={resourceForm.title}
                      onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                      className="rounded-md border border-navy-100 px-3 py-2 text-[12.5px] outline-none focus:border-gold-400"
                      placeholder="Mathematics Holiday Assignment"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="grid gap-1.5">
                      <span className="text-[11.5px] font-bold text-navy-500">Class</span>
                      <select
                        value={resourceForm.class_level}
                        onChange={(e) =>
                          setResourceForm({ ...resourceForm, class_level: e.target.value })
                        }
                        className="rounded-md border border-navy-100 px-3 py-2 text-[12.5px] text-navy-500 outline-none focus:border-gold-400"
                      >
                        {['L3', 'L4', 'L5'].map((level) => (
                          <option key={level}>{level}</option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-1.5">
                      <span className="text-[11.5px] font-bold text-navy-500">Year</span>
                      <select
                        value={resourceForm.year}
                        onChange={(e) => setResourceForm({ ...resourceForm, year: e.target.value })}
                        className="rounded-md border border-navy-100 px-3 py-2 text-[12.5px] text-navy-500 outline-none focus:border-gold-400"
                      >
                        {['2024', '2025', '2026'].map((year) => (
                          <option key={year}>{year}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="grid gap-1.5">
                      <span className="text-[11.5px] font-bold text-navy-500">Term</span>
                      <select
                        value={resourceForm.term}
                        onChange={(e) => setResourceForm({ ...resourceForm, term: e.target.value })}
                        className="rounded-md border border-navy-100 px-3 py-2 text-[12.5px] text-navy-500 outline-none focus:border-gold-400"
                      >
                        <option value="1">Term 1</option>
                        <option value="2">Term 2</option>
                        <option value="3">Term 3</option>
                      </select>
                    </label>
                    <label className="grid gap-1.5">
                      <span className="text-[11.5px] font-bold text-navy-500">Type</span>
                      <select
                        value={resourceForm.resource_type}
                        onChange={(e) =>
                          setResourceForm({ ...resourceForm, resource_type: e.target.value })
                        }
                        className="rounded-md border border-navy-100 px-3 py-2 text-[12.5px] text-navy-500 outline-none focus:border-gold-400"
                      >
                        <option value="assignment">Holiday Assignment</option>
                        <option value="revision">Revision Notes</option>
                        <option value="guide">Study Guide</option>
                        <option value="past_paper">Past Paper</option>
                      </select>
                    </label>
                  </div>

                  <label className="grid gap-1.5">
                    <span className="text-[11.5px] font-bold text-navy-500">File</span>
                    <div className="flex items-center gap-3 rounded-md border border-dashed border-navy-200 px-3 py-3">
                      <Upload size={16} className="text-navy-300" />
                      <span className="truncate text-[11.5px] text-navy-400">
                        {resourceFile ? resourceFile.name : 'Choose a PDF or document'}
                      </span>
                      <input
                        type="file"
                        onChange={(e) => setResourceFile(e.target.files?.[0] ?? null)}
                        className="ml-auto text-[11px]"
                        accept=".pdf,.doc,.docx"
                      />
                    </div>
                  </label>

                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex items-center justify-center gap-2 rounded-md bg-gold-400 px-4 py-2.5 text-[12.5px] font-bold text-navy-500 transition hover:bg-gold-500 disabled:opacity-60"
                  >
                    {uploading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Publish resource
                  </button>
                </form>
              </Card>

              <Card title="Published resources">
                {resources.length === 0 ? (
                  <p className="text-[12.5px] text-navy-400">Nothing published yet.</p>
                ) : (
                  <ul className="divide-y divide-navy-50">
                    {resources.map((resource) => (
                      <li key={resource.id} className="flex items-center justify-between gap-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-[12.5px] font-bold text-navy-500">
                            {resource.title}
                          </p>
                          <p className="text-[10.5px] text-navy-300">
                            {resource.class_level} · {resource.term_display} ·{' '}
                            {resource.academic_year} · {resource.file_size || 'no file'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteResource(resource.id)}
                          aria-label={`Delete ${resource.title}`}
                          className="rounded-md p-1.5 text-navy-300 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          )}
        </>
      )}
    </PortalShell>
  );
}
