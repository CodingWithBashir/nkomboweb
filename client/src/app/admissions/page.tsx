import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  GraduationCap,
  Phone,
  Wallet,
} from 'lucide-react';
import AdmissionsContent from '@/components/AdmissionsContent';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import Navbar from '@/components/Navbar';
import { REVALIDATE, getTrades } from '@/lib/content';
import { SCHOOL } from '@/lib/school';
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo';

export const revalidate = REVALIDATE;

export const metadata: Metadata = pageMetadata({
  title: 'Admissions — Apply Online',
  description:
    'Apply online to Lycée de Nyanza: choose one of ten TVET trades, submit the form and receive a reference number to follow your application.',
  path: '/admissions',
  keywords: [
    'Lycée de Nyanza admissions',
    'apply TVET Rwanda',
    'school application Nyanza',
    'inscriptions Lycée de Nyanza',
  ],
});

const steps = [
  {
    title: 'Apply online',
    body: 'Fill in the form below — two minutes, no fee. You get a reference number immediately.',
  },
  {
    title: 'We review the file',
    body: 'The admissions office checks your results and the trade you chose, then calls you.',
  },
  {
    title: 'Bring the documents',
    body: 'Bring the originals to the school so we can complete and sign your enrolment.',
  },
  {
    title: 'Start classes',
    body: 'You receive your student number, class and timetable at the beginning of the term.',
  },
];

const requirements = [
  'Primary leaving certificate (P6) or Ordinary Level results (S3)',
  'Birth certificate or national ID',
  'Report card from the previous school',
  'Four passport-size photographs',
  'Copy of the parent or guardian ID',
  'Medical certificate (can follow after enrolment)',
];

/** Fees are per term, in Rwandan francs; the school publishes them each year. */
const fees = [
  { level: 'L3 — first year', tuition: 500_000, other: 150_000 },
  { level: 'L4 — second year', tuition: 450_000, other: 100_000 },
  { level: 'L5 — final year', tuition: 400_000, other: 100_000 },
];

const money = (value: number) =>
  new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(value);

export default async function AdmissionsPage() {
  const trades = await getTrades();
  const tradeOptions = trades.map((trade) => ({
    id: trade.id,
    code: trade.code,
    name: trade.name,
    tagline: trade.tagline,
  }));

  const timeline = [
    { term: 'Term 1', window: 'Applications close 30 September', start: 'Classes start in October' },
    { term: 'Term 2', window: 'Transfers until 10 January', start: 'Classes resume in January' },
    { term: 'Term 3', window: 'Transfers until 20 April', start: 'Classes resume in April' },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Admissions', path: '/admissions' },
        ])}
      />
      <Navbar />

      <main id="main-content" className="flex-1">
        {/* ------------------------------------------------------------- hero */}
        <section className="relative overflow-hidden bg-navy-500 text-white">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-500/15 blur-3xl" />
          <div className="mx-auto max-w-[1240px] px-5 py-16">
            <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.24em] text-gold-400">
              <GraduationCap className="h-4 w-4" /> Admissions 2027
            </div>
            <h1 className="mt-4 max-w-2xl font-heading text-[38px] font-extrabold leading-[1.08] sm:text-[46px]">
              Join one of ten trades and leave with a qualification employers know.
            </h1>
            <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-white/70">
              Applications are open for Senior 1 and for transfers into Senior 2 and Senior 3. Choose a
              trade, send the form online, and follow it with the reference number you receive.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="#apply"
                className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-[13px] font-bold text-white transition hover:bg-gold-600"
              >
                Apply online <ArrowRight size={15} />
              </Link>
              <Link
                href="#status"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-[13px] font-bold text-white transition hover:bg-white/10"
              >
                Check my status
              </Link>
            </div>
            <div className="mt-10 grid max-w-2xl gap-4 border-t border-white/15 pt-6 sm:grid-cols-3">
              {[
                { label: 'Trades open', value: String(trades.length) },
                { label: 'Application fee', value: 'Free' },
                { label: 'Office hours', value: 'Mon–Fri 7:30–16:30' },
              ].map((item) => (
                <div key={item.label}>
                  <p className="font-heading text-[22px] font-extrabold text-gold-400">{item.value}</p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-white/50">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ steps */}
        <section className="bg-white py-14">
          <div className="mx-auto max-w-[1240px] px-5">
            <h2 className="font-heading text-[26px] font-extrabold text-navy-500">How it works</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <div key={step.title} className="rounded-2xl border border-navy-100 bg-white p-5">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-navy-500 font-heading text-[13px] font-extrabold text-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-3 font-heading text-[15px] font-extrabold text-navy-500">{step.title}</h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-navy-400">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------- apply form */}
        <AdmissionsContent trades={tradeOptions} />

        {/* --------------------------------------------- documents and fees */}
        <section className="bg-navy-50/50 py-14">
          <div className="mx-auto grid max-w-[1240px] gap-6 px-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-navy-100 bg-white p-6">
              <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.2em] text-gold-600">
                <FileCheck2 className="h-4 w-4" /> Documents
              </div>
              <h2 className="mt-2 font-heading text-[20px] font-extrabold text-navy-500">
                What to bring on enrolment day
              </h2>
              <ul className="mt-4 space-y-2.5">
                {requirements.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[13px] text-navy-500">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-navy-100 bg-white p-6">
              <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.2em] text-gold-600">
                <Wallet className="h-4 w-4" /> Fees
              </div>
              <h2 className="mt-2 font-heading text-[20px] font-extrabold text-navy-500">
                School fees per term
              </h2>
              <table className="mt-4 w-full text-left text-[12.5px]">
                <thead>
                  <tr className="text-[10.5px] uppercase tracking-[0.12em] text-navy-300">
                    <th className="pb-2 font-bold">Level</th>
                    <th className="pb-2 text-right font-bold">Tuition</th>
                    <th className="pb-2 text-right font-bold">Other</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {fees.map((row) => (
                    <tr key={row.level} className="text-navy-600">
                      <td className="py-2.5 font-semibold">{row.level}</td>
                      <td className="py-2.5 text-right">{money(row.tuition)} RWF</td>
                      <td className="py-2.5 text-right">{money(row.other)} RWF</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 flex items-start gap-2 rounded-xl bg-navy-50 px-3 py-2.5 text-[11.5px] leading-relaxed text-navy-400">
                <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-navy-400" />
                Payment is made at the school office after acceptance. Students supported by the
                government bursary pay only the other costs.
              </p>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- calendar */}
        <section className="bg-white py-14">
          <div className="mx-auto max-w-[1240px] px-5">
            <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.2em] text-gold-600">
              <ClipboardList className="h-4 w-4" /> Intake calendar
            </div>
            <h2 className="mt-2 font-heading text-[24px] font-extrabold text-navy-500">When to apply</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {timeline.map((item) => (
                <div key={item.term} className="rounded-2xl border border-navy-100 p-5">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-navy-300">{item.term}</p>
                  <p className="mt-2 font-heading text-[14.5px] font-extrabold text-navy-500">{item.window}</p>
                  <p className="mt-1 text-[12px] text-navy-400">{item.start}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------- CTA */}
        <section className="bg-navy-500 py-12 text-white">
          <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-5 px-5">
            <div>
              <h2 className="font-heading text-[22px] font-extrabold">Questions about a trade?</h2>
              <p className="mt-1 text-[13px] text-white/70">
                Call the admissions office on {SCHOOL.phone} or write to {SCHOOL.email}.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-[12.5px] font-bold text-white hover:bg-gold-600"
              >
                <Phone size={14} /> Contact the school
              </Link>
              <Link
                href="/academics"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-[12.5px] font-bold text-white hover:bg-white/10"
              >
                Explore the trades <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
