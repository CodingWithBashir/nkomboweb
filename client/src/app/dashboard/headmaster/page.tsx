'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  FileText,
  GraduationCap,
  Loader2,
  Settings2,
  UserRoundCog,
  Users,
} from 'lucide-react';
import RequireAuth from '@/components/RequireAuth';
import api from '@/lib/axios';

type Stat = { label: string; value: string | number; hint: string };

export default function HeadmasterDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ first_name?: string; last_name?: string; role?: string } | null>(
    null
  );
  const [stats, setStats] = useState<Stat[]>([]);
  const [trades, setTrades] = useState<{ name: string; code: string; teachers: number; students: number }[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [profile, staff, students, tradesRes, resources] = await Promise.all([
          api.get('/auth/profile/'),
          api.get('/academics/teachers/?page_size=200'),
          api.get('/academics/students/?page_size=200'),
          api.get('/academics/trades/?page_size=100'),
          api.get('/holiday-resources/?page_size=100'),
        ]);
        if (!active) return;

        const staffRows = staff.data?.results ?? [];
        const studentRows = students.data?.results ?? [];
        const tradeRows = tradesRes.data?.results ?? [];
        const resourceRows = resources.data?.results ?? [];

        setUser(profile.data);
        setStats([
          { label: 'Teaching staff', value: staffRows.length, hint: `${staffRows.filter((row: any) => row.is_hod).length} heads of department` },
          { label: 'Students', value: studentRows.length, hint: `${studentRows.filter((row: any) => row.level === 'L5').length} in their final year` },
          { label: 'Trades', value: tradeRows.length, hint: 'L3 – L5 programmes' },
          { label: 'Holiday material', value: resourceRows.length, hint: 'assignment, notes and past papers' },
        ]);
        setTrades(
          tradeRows.map((trade: any) => ({
            name: trade.name,
            code: trade.code,
            teachers: trade.teacher_count ?? trade.teachers?.length ?? 0,
            students: studentRows.filter((row: any) => row.trade?.slug === trade.slug).length,
          }))
        );
      } catch {
        if (active) setError('Could not load the school overview. Check that the server is running.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const shortcuts = [
    { href: '/dashboard/headmaster/teachers', icon: UserRoundCog, title: 'Teaching staff', body: 'Add teachers, set HODs, upload photos and edit profiles.' },
    { href: '/dashboard/headmaster/students', icon: GraduationCap, title: 'Students & promotions', body: 'Enrol students, move them up a level and publish their photos.' },
    { href: '/dashboard/headmaster/settings', icon: Settings2, title: 'Image host', body: 'Connect the imgdb / imgbb API key used for every photo upload.' },
    { href: '/holidays', icon: FileText, title: 'Holiday material', body: 'Everything published for the current break, in one place.' },
  ];

  return (
    <RequireAuth roles={['headmaster', 'admin', 'dos']}>
      <div className="min-h-screen bg-navy-50/50">
        <div className="mx-auto max-w-[1240px] px-5 py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-gold-600">
                Head teacher
              </p>
              <h1 className="mt-2 font-heading text-[30px] font-extrabold leading-tight text-navy-500">
                {loading
                  ? 'Loading the school overview…'
                  : `Good day, ${user?.first_name || 'Head Teacher'}.`}
              </h1>
              <p className="mt-1.5 text-[13px] text-navy-400">
                Everything that is live on the school website right now.
              </p>
            </div>
            <Link
              href="/dashboard/headmaster/teachers"
              className="inline-flex items-center gap-2 rounded-full bg-navy-500 px-5 py-2.5 text-[12.5px] font-bold text-white transition hover:bg-navy-600"
            >
              Manage staff <ArrowRight size={14} />
            </Link>
          </div>

          {error && (
            <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-[12.5px] font-medium text-red-700">
              {error}
            </p>
          )}

          {loading ? (
            <div className="mt-16 flex items-center justify-center gap-2 text-navy-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : (
            <>
              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-navy-100 bg-white p-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-navy-300">
                      {stat.label}
                    </p>
                    <p className="mt-2 font-heading text-[30px] font-extrabold leading-none text-navy-500">
                      {stat.value}
                    </p>
                    <p className="mt-1.5 text-[11.5px] text-navy-400">{stat.hint}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {shortcuts.map(({ href, icon: Icon, title, body }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group flex items-start gap-3.5 rounded-2xl border border-navy-100 bg-white p-5 transition hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-card"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-500">
                      <Icon size={18} />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 font-heading text-[14px] font-extrabold text-navy-500">
                        {title}
                        <ArrowRight size={13} className="text-navy-200 transition group-hover:text-navy-500" />
                      </span>
                      <span className="mt-1 block text-[12px] leading-relaxed text-navy-400">
                        {body}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>

              <div className="mt-8 overflow-hidden rounded-2xl border border-navy-100 bg-white">
                <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
                  <h2 className="font-heading text-[15px] font-extrabold text-navy-500">
                    Trades and their teams
                  </h2>
                  <Link
                    href="/academics"
                    className="text-[11.5px] font-bold uppercase tracking-wide text-navy-400 hover:text-navy-600"
                  >
                    View site
                  </Link>
                </div>
                <div className="divide-y divide-navy-100">
                  {trades.map((trade) => (
                    <div key={trade.code} className="flex items-center gap-3 px-5 py-3">
                      <span className="w-12 rounded-full bg-navy-50 px-2 py-1 text-center text-[10px] font-extrabold uppercase tracking-wide text-navy-500">
                        {trade.code}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-navy-600">
                        {trade.name}
                      </span>
                      <span className="flex items-center gap-1 text-[11.5px] text-navy-400">
                        <Users size={12} /> {trade.teachers}
                      </span>
                      <span className="flex items-center gap-1 text-[11.5px] text-navy-400">
                        <GraduationCap size={12} /> {trade.students}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  { href: '/dashboard/teacher', icon: BookOpen, label: 'Teacher portal' },
                  { href: '/dashboard/student', icon: GraduationCap, label: 'Student portal' },
                  { href: '/holidays', icon: CalendarDays, label: 'Holiday calendar' },
                ].map(({ href, icon: Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2.5 rounded-2xl border border-navy-100 bg-white px-4 py-3 text-[12.5px] font-semibold text-navy-500 transition hover:border-navy-300"
                  >
                    <Icon size={15} className="text-navy-400" /> {label}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
