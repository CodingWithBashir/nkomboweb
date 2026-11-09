import type { Metadata } from 'next';
import Link from 'next/link';
import { GraduationCap, Sparkles, Users } from 'lucide-react';
import StudentDirectory from '@/components/StudentDirectory';
import { getStudents, getTrades, REVALIDATE } from '@/lib/content';
import { SCHOOL, absoluteUrl } from '@/lib/school';

export const revalidate = REVALIDATE;

export const metadata: Metadata = {
  title: 'Our Students',
  description:
    'Meet the students of Lycée de Nyanza by trade and class level — the first, second and final year cohorts preparing for their national examinations.',
  alternates: { canonical: absoluteUrl('/students') },
  openGraph: {
    title: `Our Students · ${SCHOOL.name}`,
    description:
      'Students of Lycée de Nyanza, grouped by trade and class level, with their current promotion.',
    url: absoluteUrl('/students'),
  },
};

export default async function StudentsPage() {
  const [students, trades] = await Promise.all([getStudents(), getTrades()]);

  const counts = {
    total: students.length,
    finalists: students.filter((student) => student.level === 'L5').length,
    trades: new Set(students.map((student) => student.trade?.slug).filter(Boolean)).size,
  };

  return (
    <>
      <section className="relative overflow-hidden bg-navy-500">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/images/campus-study.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-700 via-navy-600/95 to-navy-500/70" />
        <div className="relative mx-auto max-w-[1240px] px-5 py-16 lg:py-20">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.26em] text-gold-300">
            The student body
          </p>
          <h1 className="mt-3 max-w-[720px] font-heading text-[34px] font-extrabold leading-[1.1] text-white lg:text-[42px]">
            Students learning a trade they can build a life on.
          </h1>
          <p className="mt-4 max-w-[560px] text-[13.5px] leading-relaxed text-white/70">
            Every student at Lycée de Nyanza belongs to a trade and a class level. Browse the
            current cohorts below — three years from L3 to L5, ending in the national practical
            examination.
          </p>

          <div className="mt-9 grid max-w-[560px] grid-cols-3 gap-3">
            {[
              { icon: Users, value: counts.total, label: 'Listed students' },
              { icon: GraduationCap, value: counts.finalists, label: 'Final-year candidates' },
              { icon: Sparkles, value: counts.trades, label: 'Trades represented' },
            ].map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="rounded-2xl border border-white/12 bg-white/5 px-4 py-3 backdrop-blur-sm"
              >
                <Icon size={15} className="text-gold-300" />
                <p className="mt-2 font-heading text-[24px] font-extrabold leading-none text-white">
                  {value}
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy-50/40 py-14">
        <div className="mx-auto max-w-[1240px] px-5">
          <StudentDirectory
            students={students}
            trades={trades.map((trade) => ({ slug: trade.slug, name: trade.name, code: trade.code }))}
          />

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-navy-100 bg-white p-6">
            <div>
              <h2 className="font-heading text-[17px] font-extrabold text-navy-500">
                Are you joining us next year?
              </h2>
              <p className="mt-1 text-[12.5px] text-navy-400">
                Applications for the next academic year are open — choose a trade and apply online.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/admissions"
                className="rounded-full bg-gold-500 px-5 py-2.5 text-[12.5px] font-bold text-white transition hover:bg-gold-600"
              >
                Apply for admission
              </Link>
              <Link
                href="/academics"
                className="rounded-full border border-navy-200 px-5 py-2.5 text-[12.5px] font-bold text-navy-500 transition hover:border-navy-400"
              >
                Browse trades
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
