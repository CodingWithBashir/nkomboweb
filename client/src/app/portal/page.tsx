'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BookOpenCheck,
  CalendarCheck,
  GraduationCap,
  Loader2,
  Printer,
  Wallet,
} from 'lucide-react';
import api from '@/lib/axios';
import RequireAuth from '@/components/RequireAuth';
import PortalShell, { Card, Stat } from '@/components/dashboard/PortalShell';
import BulletinCard, { type Bulletin } from '@/components/BulletinCard';
import { Chip, Empty, money } from '@/components/admin/ui';
import { LanguageSwitch, useLocale } from '@/lib/i18n';

type Child = {
  relation: string;
  is_primary: boolean;
  student: {
    id: number;
    student_id: string;
    full_name: string;
    level: string;
    program: string;
    trade_code: string | null;
  };
  report: Bulletin | null;
  fees: { billed: number; paid: number; balance: number; currency: string };
};

type Profile = {
  first_name?: string;
  last_name?: string;
  username?: string;
  role?: string;
  email?: string;
};

function monthsAgo(months: number) {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function ChildPanel({ child }: { child: Child }) {
  const { t } = useLocale();
  const report = child.report;
  const average = report?.average ?? null;
  const attendance = report?.attendance;
  const fees = child.fees ?? report?.fees;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-navy-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-gold-600">
              {child.student.program}
            </p>
            <h2 className="mt-1 font-heading text-[22px] font-extrabold text-navy-500">
              {child.student.full_name}
            </h2>
            <p className="text-[12px] text-navy-400">
              {child.student.student_id} · {child.student.level}
              {child.student.trade_code ? ` · ${child.student.trade_code}` : ''} · {t('portal.relation')}{' '}
              {child.relation.toLowerCase()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Chip tone="green">{t('portal.enrolled')}</Chip>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-full border border-navy-100 px-3 py-1.5 text-[11.5px] font-bold text-navy-500 hover:border-navy-300"
            >
              <Printer size={12} /> {t('common.print')}
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stat
            label={t('portal.average')}
            value={average === null ? '—' : `${average}%`}
            hint={
              report?.rank
                ? `${t('portal.position')} ${report.rank} ${t('portal.of')} ${report.class_size}`
                : t('portal.nomarks')
            }
          />
          <Stat
            label={t('portal.attendance')}
            value={attendance ? `${attendance.rate}%` : '—'}
            hint={
              attendance
                ? `${attendance.present} ${t('portal.present')} · ${attendance.absent} ${t('portal.absent')} · ${attendance.late} ${t('portal.late')}`
                : t('portal.notrecorded')
            }
          />
          <Stat
            label={t('portal.fees')}
            value={fees ? money(fees.balance, fees.currency) : '—'}
            hint={
              fees
                ? `${money(fees.paid, fees.currency)} ${t('portal.paidof')} ${money(fees.billed, fees.currency)}`
                : ''
            }
          />
        </div>
      </div>

      {report && report.subjects.length ? (
        <div className="rounded-xl border border-navy-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <BookOpenCheck size={15} className="text-gold-600" />
            <h3 className="text-[13.5px] font-bold text-navy-500">
              {t('portal.results')} — {report.term} {report.academic_year}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-[12px]">
              <thead>
                <tr className="border-b border-navy-50 text-[10px] uppercase tracking-[0.12em] text-navy-300">
                  <th className="py-2 pr-3">{t('portal.subject')}</th>
                  <th className="py-2 pr-3 text-right">{t('portal.mark')}</th>
                  <th className="py-2 pr-3 text-right">%</th>
                  <th className="py-2 text-right">{t('portal.grade')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {report.subjects.map((subject) => (
                  <tr key={subject.code + subject.subject}>
                    <td className="py-1.5 pr-3 font-semibold text-navy-500">
                      {subject.subject}
                      <span className="ml-1.5 text-[10.5px] font-normal text-navy-300">
                        {subject.code}
                      </span>
                    </td>
                    <td className="py-1.5 pr-3 text-right text-navy-500">
                      {subject.score}/{subject.max_score}
                    </td>
                    <td className="py-1.5 pr-3 text-right text-navy-500">{subject.percent}%</td>
                    <td className="py-1.5 text-right font-bold text-navy-600">
                      {subject.percent >= 80
                        ? 'A'
                        : subject.percent >= 70
                          ? 'B'
                          : subject.percent >= 60
                            ? 'C'
                            : subject.percent >= 50
                              ? 'D'
                              : 'E'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[10.5px] text-navy-300">
            {monthsAgo(0)} · {t('portal.meet')}
          </p>
        </div>
      ) : (
        <Empty>{t('portal.nomarksbody')}</Empty>
      )}
    </div>
  );
}

export default function ParentPortalPage() {
  const { t } = useLocale();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [active, setActive] = useState('');
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [profileResponse, childrenResponse] = await Promise.all([
          api.get('/auth/profile/'),
          api.get('/guardians/children/'),
        ]);
        setProfile(profileResponse.data as Profile);
        const list: Child[] = childrenResponse.data.results ?? [];
        setChildren(list);
        setActive(list.length ? String(list[0].student.id) : '');
      } catch (error) {
        setFailed(
          (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
            t('portal.failed')
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const tabs = useMemo(
    () =>
      children.length
        ? children.map((child) => ({
            id: String(child.student.id),
            label: child.student.full_name.split(' ')[0] || child.student.full_name,
            icon: GraduationCap,
          }))
        : [{ id: 'none', label: 'Overview', icon: GraduationCap }],
    [children]
  );

  const current = children.find((child) => String(child.student.id) === active) ?? children[0];

  return (
    <RequireAuth>
      <PortalShell
        user={profile}
        subtitle={t('brand.portal')}
        tabs={tabs}
        activeTab={active || tabs[0].id}
        onTabChange={setActive}
      >
        <div className="mb-3 flex justify-end">
          <LanguageSwitch />
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-[13px] text-navy-400">
            <Loader2 size={16} className="animate-spin" /> {t('common.loading')}
          </div>
        ) : failed ? (
          <Card>
            <p className="text-[13px] font-semibold text-red-600">{failed}</p>
          </Card>
        ) : current ? (
          <ChildPanel child={current} />
        ) : (
          <Card>
            <h2 className="text-[15px] font-bold text-navy-500">{t('portal.notlinked.title')}</h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-navy-400">
              {t('portal.notlinked.body')}
            </p>
            <p className="mt-2 text-[11.5px] text-navy-300">{t('portal.notlinked.hint')}</p>
          </Card>
        )}

        <div className="mt-4 hidden print:block">
          {current?.report ? <BulletinCard card={current.report} /> : null}
        </div>
      </PortalShell>
    </RequireAuth>
  );
}
