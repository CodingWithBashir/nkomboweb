'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  CalendarCheck,
  FolderOpen,
  Download,
  FileText,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import api from '@/lib/axios';
import RequireAuth from '@/components/RequireAuth';
import PortalShell, { Card, Stat, initials } from '@/components/dashboard/PortalShell';

type Profile = {
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  role?: string;
};

type StudentProfile = {
  student_id: string;
  enrollment_date: string;
  program: { name: string; level: string };
  full_name: string;
  is_active: boolean;
};

type Result = {
  id: number;
  score: string;
  max_score: string;
  term: string;
  academic_year: string;
  subject: { name: string; code: string };
};

type GradeResponse = {
  student: { student_id: string; full_name: string; program: string };
  results: Result[];
  average: number | null;
  count: number;
};

type AttendanceResponse = {
  counts: Record<string, number>;
  total: number;
  attendance_rate: number | null;
  records: { id: number; date: string; status: string; notes?: string }[];
};

type Resource = {
  id: number;
  title: string;
  class_level: string;
  academic_year: string;
  term_display: string;
  file: string | null;
  file_size: string;
  upload_date: string;
};

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'results', label: 'My Results', icon: GraduationCap },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { id: 'resources', label: 'Resources', icon: FolderOpen },
];

const grade = (percent: number) =>
  percent >= 80 ? 'A' : percent >= 70 ? 'B' : percent >= 60 ? 'C' : percent >= 50 ? 'D' : 'E';

const statusStyles: Record<string, string> = {
  present: 'bg-navy-500 text-white',
  absent: 'border border-navy-300 bg-white text-navy-500',
  late: 'bg-navy-100 text-navy-500',
  excused: 'bg-navy-50 text-navy-400',
};

function formatDate(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function StudentDashboard() {
  return (
    <RequireAuth roles={['student']}>
      <Dashboard />
    </RequireAuth>
  );
}

function Dashboard() {
  const [tab, setTab] = useState('overview');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [grades, setGrades] = useState<GradeResponse | null>(null);
  const [attendance, setAttendance] = useState<AttendanceResponse | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [profileRes, studentRes, gradesRes, attendanceRes, resourceRes] = await Promise.all([
        api.get('/auth/profile/'),
        api.get('/academics/students/me/'),
        api.get('/academics/grades/mine/'),
        api.get('/academics/attendance/mine/'),
        api.get('/holiday-resources/', { params: { page_size: 100 } }),
      ]);
      setProfile(profileRes.data);
      setStudent(studentRes.data);
      setGrades(gradesRes.data);
      setAttendance(attendanceRes.data);
      setResources(resourceRes.data?.results ?? resourceRes.data ?? []);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setError(
          'Your account is signed in but has no student record yet. Please ask the school office to link your profile.'
        );
      } else if (err?.response?.status !== 401) {
        setError('We could not load your portal data. Check that the school server is running and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const fullName =
    student?.full_name ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
    profile?.username ||
    'Student';

  const results = grades?.results ?? [];

  const bestSubject = useMemo(() => {
    if (!results.length) return null;
    return results.reduce((best, current) =>
      Number(current.score) / Number(current.max_score) >
      Number(best.score) / Number(best.max_score)
        ? current
        : best
    );
  }, [results]);

  return (
    <PortalShell
      user={profile}
      subtitle="Student Portal"
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
    >
      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-lg border border-navy-300 bg-navy-50 p-3 text-[12.5px] text-navy-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={load} className="font-bold underline">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-3 rounded-xl border border-navy-100 bg-white p-8 text-navy-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading your records…</span>
        </div>
      ) : (
        <>
          {/* ------------------------------- OVERVIEW ------------------------------ */}
          {tab === 'overview' && (
            <div className="grid gap-5 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-500 text-lg font-extrabold text-gold-400">
                    {initials(profile)}
                  </span>
                  <div>
                    <h1 className="font-heading text-[19px] font-extrabold text-navy-500">
                      {fullName}
                    </h1>
                    <p className="text-[12.5px] text-navy-400">
                      {student?.program?.name ?? 'Student'} ·{' '}
                      <span className="font-semibold text-navy-500">
                        {student?.student_id ?? '—'}
                      </span>
                    </p>
                  </div>
                </div>

                <dl className="mt-5 grid gap-4 border-t border-navy-100 pt-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-navy-300">
                      Programme
                    </dt>
                    <dd className="text-[13px] font-semibold text-navy-500">
                      {student?.program?.name ?? '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-navy-300">
                      Enrolled
                    </dt>
                    <dd className="text-[13px] font-semibold text-navy-500">
                      {formatDate(student?.enrollment_date)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-navy-300">
                      Email
                    </dt>
                    <dd className="text-[13px] font-semibold text-navy-500">
                      {profile?.email || '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-navy-300">
                      Status
                    </dt>
                    <dd className="text-[13px] font-semibold text-black">
                      {student?.is_active === false ? 'Inactive' : 'Active'}
                    </dd>
                  </div>
                </dl>
              </Card>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <Stat
                  label="Average mark"
                  value={grades?.average != null ? `${grades.average}%` : '—'}
                  hint={grades?.average != null ? `Grade ${grade(grades.average)}` : 'No marks yet'}
                  accent
                />
                <Stat
                  label="Attendance"
                  value={
                    attendance?.attendance_rate != null
                      ? `${attendance.attendance_rate}%`
                      : '—'
                  }
                  hint={`${attendance?.total ?? 0} recorded days`}
                />
                <Stat label="Resources" value={resources.length} hint="Available downloads" />
              </div>

              <Card
                title="Recent results"
                className="lg:col-span-2"
                action={
                  <button
                    type="button"
                    onClick={() => setTab('results')}
                    className="text-[11.5px] font-bold text-navy-500 hover:underline"
                  >
                    View all
                  </button>
                }
              >
                {results.length === 0 ? (
                  <p className="text-[12.5px] text-navy-400">No marks have been published yet.</p>
                ) : (
                  <ul className="divide-y divide-navy-50">
                    {results.slice(0, 4).map((item) => {
                      const percent = Math.round(
                        (Number(item.score) / Number(item.max_score)) * 100
                      );
                      return (
                        <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
                          <div>
                            <p className="text-[12.5px] font-bold text-navy-500">
                              {item.subject?.name}
                            </p>
                            <p className="text-[10.5px] text-navy-300">
                              {item.term} · {item.academic_year}
                            </p>
                          </div>
                          <span className="flex items-center gap-2">
                            <span className="text-[12.5px] font-bold text-navy-500">
                              {item.score}/{item.max_score}
                            </span>
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-100 text-[10px] font-extrabold text-navy-500">
                              {grade(percent)}
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>

              <Card title="Highlights">
                <ul className="space-y-3 text-[12px] text-navy-400">
                  <li className="flex gap-2">
                    <GraduationCap size={14} className="mt-0.5 shrink-0 text-navy-500" />
                    <span>
                      {bestSubject ? (
                        <>
                          Strongest subject:{' '}
                          <span className="font-bold text-navy-500">
                            {bestSubject.subject?.name}
                          </span>{' '}
                          ({bestSubject.score}/{bestSubject.max_score})
                        </>
                      ) : (
                        'Your strongest subject will appear once marks are published.'
                      )}
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <CalendarCheck size={14} className="mt-0.5 shrink-0 text-navy-500" />
                    <span>
                      {attendance?.counts?.absent
                        ? `${attendance.counts.absent} absence(s) recorded this term.`
                        : 'No absences recorded. Keep it up!'}
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <FolderOpen size={14} className="mt-0.5 shrink-0 text-navy-500" />
                    <span>
                      {resources.length} holiday resource{resources.length === 1 ? '' : 's'} ready
                      to download.
                    </span>
                  </li>
                </ul>
              </Card>
            </div>
          )}

          {/* -------------------------------- RESULTS ------------------------------ */}
          {tab === 'results' && (
            <Card
              title="My results"
              action={
                <div className="flex items-center gap-3">
                  <span className="text-[11.5px] text-navy-400">
                    Average: <strong className="text-navy-500">{grades?.average ?? '—'}%</strong>
                  </span>
                  <button
                    type="button"
                    onClick={load}
                    className="flex items-center gap-1 text-[11px] font-bold text-navy-400 hover:text-navy-500"
                  >
                    <RefreshCw size={11} /> Refresh
                  </button>
                </div>
              }
            >
              {results.length === 0 ? (
                <p className="text-[12.5px] text-navy-400">No marks published yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[12px]">
                    <thead>
                      <tr className="border-b border-navy-100 text-[10.5px] uppercase tracking-wide text-navy-300">
                        <th className="py-2 pr-3 font-semibold">Subject</th>
                        <th className="py-2 pr-3 font-semibold">Term</th>
                        <th className="py-2 pr-3 font-semibold">Year</th>
                        <th className="py-2 pr-3 font-semibold">Score</th>
                        <th className="py-2 pr-3 font-semibold">Performance</th>
                        <th className="py-2 font-semibold">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-50">
                      {results.map((item) => {
                        const percent = Math.round(
                          (Number(item.score) / Number(item.max_score)) * 100
                        );
                        return (
                          <tr key={item.id} className="text-navy-500">
                            <td className="py-2.5 pr-3 font-bold">{item.subject?.name}</td>
                            <td className="py-2.5 pr-3 text-navy-400">{item.term}</td>
                            <td className="py-2.5 pr-3 text-navy-400">{item.academic_year}</td>
                            <td className="py-2.5 pr-3 font-semibold">
                              {item.score}/{item.max_score}
                            </td>
                            <td className="py-2.5 pr-3">
                              <span className="flex items-center gap-2">
                                <span className="h-1.5 w-24 overflow-hidden rounded-full bg-navy-50">
                                  <span
                                    className="block h-full rounded-full bg-navy-500"
                                    style={{ width: `${percent}%` }}
                                  />
                                </span>
                                <span className="text-[10.5px] text-navy-400">{percent}%</span>
                              </span>
                            </td>
                            <td className="py-2.5">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-500 text-[10px] font-extrabold text-white">
                                {grade(percent)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* ------------------------------- ATTENDANCE ---------------------------- */}
          {tab === 'attendance' && (
            <div className="grid gap-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Stat
                  label="Attendance rate"
                  value={
                    attendance?.attendance_rate != null ? `${attendance.attendance_rate}%` : '—'
                  }
                  hint={`${attendance?.total ?? 0} days recorded`}
                  accent
                />
                <Stat label="Present" value={attendance?.counts?.present ?? 0} />
                <Stat label="Late" value={attendance?.counts?.late ?? 0} />
                <Stat label="Absent" value={attendance?.counts?.absent ?? 0} />
              </div>

              <Card title="Recent register">
                {!attendance?.records?.length ? (
                  <p className="text-[12.5px] text-navy-400">No attendance recorded yet.</p>
                ) : (
                  <ul className="divide-y divide-navy-50">
                    {attendance.records.map((record) => (
                      <li
                        key={record.id}
                        className="flex items-center justify-between gap-3 py-2.5 text-[12.5px]"
                      >
                        <span className="font-semibold text-navy-500">
                          {formatDate(record.date)}
                        </span>
                        <span className="flex items-center gap-2">
                          {record.notes && (
                            <span className="text-[10.5px] text-navy-300">{record.notes}</span>
                          )}
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${
                              statusStyles[record.status] ?? 'bg-navy-50 text-navy-500'
                            }`}
                          >
                            {record.status}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          )}

          {/* ------------------------------- RESOURCES ----------------------------- */}
          {tab === 'resources' && (
            <Card title="Holiday resources">
              {resources.length === 0 ? (
                <p className="text-[12.5px] text-navy-400">
                  No resources published yet. Check back during the holidays.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {resources.map((resource) => (
                    <article
                      key={resource.id}
                      className="rounded-lg border border-navy-100 bg-white p-4"
                    >
                      <div className="flex gap-3">
                        <span className="flex h-12 w-10 shrink-0 flex-col items-center justify-center rounded bg-navy-700 text-white">
                          <FileText size={15} />
                          <span className="text-[6.5px] font-bold">PDF</span>
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-[12.5px] font-bold leading-snug text-navy-500">
                            {resource.title}
                          </h3>
                          <p className="mt-1 text-[13px] text-navy-300">
                            <span className="font-semibold text-navy-500">Class:</span>{' '}
                            {resource.class_level} · {resource.term_display}
                          </p>
                          <p className="text-[10.5px] text-navy-300">
                            {resource.academic_year} · {resource.file_size || '—'}
                          </p>
                        </div>
                      </div>
                      {resource.file ? (
                        <a
                          href={resource.file}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 flex items-center justify-center gap-2 rounded-md bg-navy-500 px-4 py-2 text-[11.5px] font-bold text-white transition hover:bg-navy-600"
                        >
                          <Download size={13} />
                          Download
                        </a>
                      ) : (
                        <p className="mt-3 text-center text-[10.5px] text-navy-300">
                          File not attached
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </PortalShell>
  );
}
