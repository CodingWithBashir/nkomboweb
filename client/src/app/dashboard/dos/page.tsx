'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Loader2,
  RefreshCw,
  UserRoundCheck,
  UserRoundCog,
  Users,
} from 'lucide-react';
import api from '@/lib/axios';
import { readSession, type AppUser } from '@/lib/authClient';

type Trade = { id: number; slug: string; name: string; code: string };

type Stat = {
  label: string;
  value: string | number;
  hint: string;
  icon: typeof Users;
  href?: string;
};

export default function DosDashboardPage() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [counts, setCounts] = useState({
    teachers: 0,
    students: 0,
    promises: 0,
    resources: 0,
    uploads: 0,
  });
  const [perTrade, setPerTrade] = useState<{ code: string; name: string; teachers: number; students: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setUser(readSession().user);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [tradeRes, teacherRes, studentRes, applicationRes, resourceRes] = await Promise.all([
        api.get('/academics/trades/', { params: { page_size: 100 } }),
        api.get('/academics/teachers/', { params: { page_size: 200 } }),
        api.get('/academics/students/', { params: { page_size: 500 } }),
        api.get('/admissions/applications/', { params: { status: 'pending', page_size: 100 } }),
        api.get('/holiday-resources/', { params: { page_size: 100 } }),
      ]);

      const tradeRows: any[] = tradeRes.data.results ?? tradeRes.data;
      const teachers: any[] = teacherRes.data.results ?? teacherRes.data;
      const students: any[] = studentRes.data.results ?? studentRes.data;
      const applications: any[] = applicationRes.data.results ?? applicationRes.data;
      const resources: any[] = resourceRes.data.results ?? resourceRes.data;

      setTrades(tradeRows.map((trade) => ({ id: trade.id, slug: trade.slug, name: trade.name, code: trade.code })));
      setCounts({
        teachers: teacherRes.data.count ?? teachers.length,
        students: studentRes.data.count ?? students.length,
        promises: applications.length,
        resources: resourceRes.data.count ?? resources.length,
        uploads: resources.filter((item) => item.file_url).length,
      });

      setPerTrade(
        tradeRows.map((trade) => ({
          code: trade.code,
          name: trade.name,
          teachers: teachers.filter((teacher) => teacher.trade?.slug === trade.slug).length,
          students: students.filter((student) => student.trade?.slug === trade.slug).length,
        }))
      );
    } catch {
      setError('Could not load the academic overview. Check that the API is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats: Stat[] = [
    {
      label: 'Teachers',
      value: counts.teachers,
      hint: 'Across all trades',
      icon: UserRoundCog,
      href: '/lyceeadmin/staff',
    },
    {
      label: 'Students',
      value: counts.students,
      hint: 'Enrolled this year',
      icon: Users,
      href: '/lyceeadmin/students',
    },
    {
      label: 'Applications',
      value: counts.promises,
      hint: 'Waiting for a decision',
      icon: ClipboardCheck,
      href: '/lyceeadmin/admissions',
    },
    {
      label: 'Revision material',
      value: counts.resources,
      hint: `${counts.uploads} files published`,
      icon: FileText,
      href: '/holidays',
    },
  ];

  const shortcuts = [
    {
      href: '/lyceeadmin/admissions',
      icon: ClipboardCheck,
      title: 'Admissions',
      body: 'Review applications, accept or refuse them and enrol new students.',
    },
    {
      href: '/lyceeadmin/staff',
      icon: UserRoundCog,
      title: 'Teaching staff',
      body: 'Add teachers, set heads of department, update profiles and photos.',
    },
    {
      href: '/lyceeadmin/students',
      icon: GraduationCap,
      title: 'Students & promotions',
      body: 'Move students between L3 and L5 and publish their photos.',
    },
    {
      href: '/lyceeadmin/accounts',
      icon: UserRoundCheck,
      title: 'New accounts',
      body: 'Accept the students and parents who registered themselves.',
    },
  ];

  return (
    <>
      <div>
        <div className="mx-auto max-w-[1240px] px-5 py-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-gold-600">
                Director of studies
              </p>
              <h1 className="mt-2 font-heading text-[30px] font-extrabold leading-tight text-navy-500">
                {loading ? 'Loading the academic overview…' : `Good day, ${user?.first_name || 'Director'}.`}
              </h1>
              <p className="mt-1.5 text-[13px] text-navy-400">
                Teaching staff, enrolments and applications across the ten trades.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void load()}
                className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white px-4 py-2.5 text-[12.5px] font-bold text-navy-500 hover:border-navy-300"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
              <Link
                href="/lyceeadmin/admissions"
                className="inline-flex items-center gap-2 rounded-full bg-navy-500 px-5 py-2.5 text-[12.5px] font-bold text-white hover:bg-navy-600"
              >
                Review applications <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {error && (
            <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-[12.5px] font-medium text-red-700">
              {error}
            </p>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Link
                key={stat.label}
                href={stat.href ?? '/lyceeadmin'}
                className="rounded-2xl border border-navy-100 bg-white p-4 transition hover:border-navy-200"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-300">
                    {stat.label}
                  </p>
                  <stat.icon className="h-4 w-4 text-navy-400" />
                </div>
                <p className="mt-2 font-heading text-[26px] font-extrabold text-navy-500">{stat.value}</p>
                <p className="mt-0.5 text-[11.5px] text-navy-400">{stat.hint}</p>
              </Link>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
            <div className="rounded-2xl border border-navy-100 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-[16px] font-extrabold text-navy-500">Trades at a glance</h2>
                <Link
                  href="/academics"
                  className="text-[11.5px] font-bold text-navy-400 hover:text-gold-600"
                >
                  Website view
                </Link>
              </div>
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-[13px] text-navy-400">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </div>
              ) : (
                <table className="mt-3 w-full text-left text-[12.5px]">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.12em] text-navy-300">
                      <th className="pb-2 font-bold">Trade</th>
                      <th className="pb-2 text-right font-bold">Teachers</th>
                      <th className="pb-2 text-right font-bold">Students</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-100">
                    {perTrade.map((trade) => (
                      <tr key={trade.code} className="text-navy-600">
                        <td className="py-2">
                          <span className="font-semibold">{trade.name}</span>
                          <span className="ml-2 rounded bg-navy-50 px-1.5 py-0.5 text-[10px] font-bold text-navy-400">
                            {trade.code}
                          </span>
                        </td>
                        <td className="py-2 text-right">{trade.teachers}</td>
                        <td className="py-2 text-right">{trade.students}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="text-[12px] font-bold text-navy-500">
                      <td className="pt-2.5">Total</td>
                      <td className="pt-2.5 text-right">{counts.teachers}</td>
                      <td className="pt-2.5 text-right">{counts.students}</td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            <div className="space-y-3">
              {shortcuts.map((shortcut) => (
                <Link
                  key={shortcut.href}
                  href={shortcut.href}
                  className="flex items-start gap-3 rounded-2xl border border-navy-100 bg-white p-4 transition hover:border-navy-200"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-500">
                    <shortcut.icon size={16} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1 font-heading text-[14px] font-extrabold text-navy-500">
                      {shortcut.title} <ArrowRight size={13} className="text-navy-300" />
                    </span>
                    <span className="mt-0.5 block text-[11.5px] leading-relaxed text-navy-400">
                      {shortcut.body}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { href: '/dashboard/teacher', icon: BookOpen, label: 'Teacher portal', hint: 'Marks, attendance, material' },
              { href: '/dashboard/student', icon: GraduationCap, label: 'Student portal', hint: 'Results and resources' },
              { href: '/holidays', icon: CalendarDays, label: 'Holiday material', hint: 'Published for this break' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-2xl border border-navy-100 bg-white p-4 transition hover:border-navy-200"
              >
                <item.icon className="h-4 w-4 text-navy-400" />
                <span>
                  <span className="block font-heading text-[13px] font-extrabold text-navy-500">
                    {item.label}
                  </span>
                  <span className="block text-[11px] text-navy-400">{item.hint}</span>
                </span>
              </Link>
            ))}
          </div>

          <p className="mt-6 flex items-center gap-2 rounded-2xl border border-navy-100 bg-white px-4 py-3 text-[12px] text-navy-400">
            <BarChart3 className="h-4 w-4 text-gold-500" />
            Figures update every time you refresh — they come straight from the school API, the same
            data the website shows to visitors.
          </p>
        </div>
      </div>
    </>
  );
}
