import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  Clock3,
  Layers,
  Users,
} from 'lucide-react';
import JsonLd from '@/components/JsonLd';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TeacherCard from '@/components/TeacherCard';
import TradeIcon from '@/components/TradeIcon';
import { REVALIDATE, getTrade, getTrades, splitTeam } from '@/lib/content';
import { absoluteUrl, SCHOOL } from '@/lib/school';
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo';

export const revalidate = REVALIDATE;
export const dynamicParams = true;

type Params = { trade: string };

export async function generateStaticParams() {
  const trades = await getTrades();
  return trades.map((trade) => ({ trade: trade.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const trade = await getTrade(params.trade);
  if (!trade) {
    return { title: 'Trade not found', robots: { index: false, follow: false } };
  }
  const metadata = pageMetadata({
    title: `${trade.name} (${trade.code}) — L3 to L5`,
    description: trade.summary,
    path: `/academics/${trade.slug}`,
    keywords: [
      `${trade.name} Rwanda`,
      `${trade.code} TVET Rwanda`,
      `${trade.name} L3 L4 L5`,
      `study ${trade.name} Nyanza`,
    ],
    image: trade.image,
  });
  return metadata;
}

export default async function TradePage({ params }: { params: Params }) {
  const [trade, allTrades] = await Promise.all([getTrade(params.trade), getTrades()]);
  if (!trade) notFound();

  const { hod, trainers } = splitTeam(trade.teachers);
  const related = allTrades.filter((t) => t.slug !== trade.slug).slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Academics', path: '/academics' },
            { name: trade.name, path: `/academics/${trade.slug}` },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'Course',
            name: `${trade.name} (${trade.code})`,
            description: trade.description || trade.summary,
            url: absoluteUrl(`/academics/${trade.slug}`),
            courseCode: trade.code,
            provider: {
              '@type': 'School',
              name: SCHOOL.name,
              url: absoluteUrl('/'),
            },
            hasCourseInstance: trade.curriculum.map((level) => ({
              '@type': 'CourseInstance',
              name: `${level.level} — ${level.title}`,
              courseMode: 'full-time',
              courseWorkload: 'P1Y',
            })),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `${trade.name} teaching team`,
            itemListElement: trade.teachers.map((teacher, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'Person',
                name: teacher.full_name,
                jobTitle: teacher.title,
                url: absoluteUrl(`/teachers/${teacher.slug}`),
              },
            })),
          },
        ]}
      />

      <main id="main-content">
        {/* -------------------------------- HERO -------------------------------- */}
        <section className="relative isolate overflow-hidden bg-navy-500">
          <div className="absolute inset-y-0 right-0 hidden w-[52%] lg:block">
            <Image
              src={trade.image || '/images/campus-lab.jpg'}
              alt={`${trade.name} training at Lycée de Nyanza`}
              fill
              priority
              sizes="52vw"
              className="object-cover opacity-70"
              style={{ clipPath: 'polygon(18% 0, 100% 0, 100% 100%, 0 100%)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-500 via-navy-500/60 to-transparent" />
          </div>

          <div className="relative mx-auto max-w-[1240px] px-5 py-12">
            <nav aria-label="Breadcrumb" className="text-[11px] font-semibold text-white/60">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-white">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/academics" className="hover:text-white">
                    Academics
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-white">
                  {trade.name}
                </li>
              </ol>
            </nav>

            <div className="mt-6 max-w-[620px]">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/80">
                <TradeIcon icon={trade.icon} size={12} />
                {trade.code} · TVET Trade
              </span>
              <h1 className="mt-4 font-heading text-[34px] font-extrabold leading-[1.08] text-white sm:text-[46px]">
                {trade.name}
              </h1>
              <span className="mt-4 block h-[3px] w-[88px] bg-white" />
              <p className="mt-5 max-w-[520px] text-[14px] leading-relaxed text-white/85">
                {trade.tagline || trade.summary}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/admissions"
                  className="flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-[12.5px] font-bold text-navy-500 transition hover:bg-gold-500"
                >
                  Apply for {trade.code}
                  <ArrowRight size={15} />
                </Link>
                <a
                  href="#team"
                  className="flex items-center gap-2 rounded-full border border-white/60 px-6 py-3 text-[12.5px] font-bold text-white transition hover:bg-white hover:text-navy-500"
                >
                  Meet the teachers
                  <Users size={14} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ----------------------------- QUICK FACTS ---------------------------- */}
        <section className="border-b border-navy-100 bg-white">
          <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-px px-5 py-6 sm:grid-cols-4">
            {[
              { icon: Layers, label: 'Levels', value: 'L3 · L4 · L5' },
              { icon: Clock3, label: 'Duration', value: '3 years' },
              { icon: Award, label: 'Award', value: 'TVET Certificate / Diploma' },
              { icon: Briefcase, label: 'Department', value: trade.department },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 px-1 py-2">
                <Icon size={17} className="mt-[2px] shrink-0 text-navy-400" strokeWidth={1.8} />
                <div>
                  <p className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-navy-300">
                    {label}
                  </p>
                  <p className="mt-1 text-[12.5px] font-bold leading-snug text-navy-500">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------- OVERVIEW ----------------------------- */}
        <section className="bg-white py-12">
          <div className="mx-auto grid max-w-[1240px] gap-10 px-5 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-navy-300">
                About the trade
              </p>
              <h2 className="mt-2 font-heading text-[26px] font-extrabold leading-tight text-navy-500">
                What you will study
              </h2>
              <p className="mt-4 text-[13.5px] leading-[1.8] text-navy-400">{trade.description}</p>
              <p className="mt-4 text-[13.5px] leading-[1.8] text-navy-400">{trade.summary}</p>

              <h3 className="mt-8 font-heading text-[15px] font-extrabold uppercase tracking-wide text-navy-500">
                Entry requirements
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-navy-400">
                {trade.entry_requirements || 'Senior 3 pass, or direct entry at L3. Talk to the school office for guidance.'}
              </p>
            </div>

            <aside className="lg:col-span-5">
              <div className="rounded-xl border border-navy-100 bg-navy-50/60 p-5">
                <h2 className="font-heading text-[13px] font-extrabold uppercase tracking-wide text-navy-500">
                  Where it can take you
                </h2>
                <ul className="mt-3 space-y-2">
                  {trade.career_paths.map((path) => (
                    <li key={path} className="flex items-start gap-2 text-[12.5px] text-navy-500">
                      <BadgeCheck size={14} className="mt-[1px] shrink-0 text-navy-400" />
                      {path}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/admissions"
                  className="mt-5 inline-flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wide text-navy-500 hover:underline"
                >
                  Start your application
                  <ArrowRight size={12} />
                </Link>
              </div>
            </aside>
          </div>
        </section>

        {/* ------------------------------ CURRICULUM ---------------------------- */}
        <section id="curriculum" className="bg-navy-50/40 py-12">
          <div className="mx-auto max-w-[1240px] px-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-navy-300">
                  Curriculum
                </p>
                <h2 className="mt-2 font-heading text-[26px] font-extrabold text-navy-500">
                  From L3 to L5
                </h2>
              </div>
              <p className="max-w-[420px] text-[12.5px] leading-relaxed text-navy-400">
                Each level builds on the last — technical modules are taught alongside general subjects,
                work placement and a final project.
              </p>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {trade.curriculum.map((level, index) => (
                <div
                  key={level.level}
                  className={`flex flex-col rounded-xl border bg-white p-5 ${
                    index === 0 ? 'border-navy-500' : 'border-navy-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-full px-3 py-1 text-[10.5px] font-extrabold uppercase tracking-wide ${
                        index === 0 ? 'bg-navy-500 text-white' : 'bg-navy-100 text-navy-500'
                      }`}
                    >
                      {level.level}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-navy-300">
                      Year {index + 1}
                    </span>
                  </div>
                  <h3 className="mt-3 font-heading text-[15px] font-extrabold leading-snug text-navy-500">
                    {level.title}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {level.modules.map((module) => (
                      <li
                        key={module}
                        className="flex items-start gap-2 text-[12px] leading-snug text-navy-400"
                      >
                        <CheckCircle2 size={12} className="mt-[2px] shrink-0 text-navy-300" />
                        {module}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* -------------------------------- TEAM -------------------------------- */}
        <section id="team" className="bg-white py-12">
          <div className="mx-auto max-w-[1240px] px-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-navy-300">
                  Teaching team
                </p>
                <h2 className="mt-2 font-heading text-[26px] font-extrabold text-navy-500">
                  {trade.code} teachers
                </h2>
                <span className="mt-3 block h-[3px] w-[72px] bg-navy-500" />
              </div>
              <Link
                href="/teachers"
                className="inline-flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wide text-navy-500 hover:underline"
              >
                All teachers
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="mt-7 grid gap-4 lg:grid-cols-12">
              {hod && (
                <div className="lg:col-span-6">
                  <TeacherCard teacher={hod} featured />
                </div>
              )}
              <div
                className={`grid gap-4 sm:grid-cols-2 ${hod ? 'lg:col-span-6' : 'lg:col-span-12 lg:grid-cols-3'}`}
              >
                {trainers.map((teacher) => (
                  <TeacherCard key={teacher.slug} teacher={teacher} />
                ))}
              </div>
            </div>

            {!hod && trainers.length === 0 && (
              <p className="mt-6 rounded-lg border border-navy-100 bg-navy-50/60 p-5 text-[12.5px] text-navy-400">
                The teaching team for this trade is being updated. Contact the school office for the
                current list of trainers.
              </p>
            )}
          </div>
        </section>

        {/* ------------------------------ OTHER TRADES -------------------------- */}
        <section className="bg-navy-50/40 py-12">
          <div className="mx-auto max-w-[1240px] px-5">
            <h2 className="font-heading text-[20px] font-extrabold text-navy-500">
              Other trades at Lycée de Nyanza
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/academics/${item.slug}`}
                  className="group flex items-center gap-3 rounded-lg border border-navy-100 bg-white px-4 py-3.5 transition hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-card"
                >
                  <span className="text-navy-500">
                    <TradeIcon icon={item.icon} size={22} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-bold leading-tight text-navy-500">
                      {item.name}
                    </span>
                    <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-wide text-navy-300">
                      {item.code} · L3–L5
                    </span>
                  </span>
                  <ArrowRight size={12} className="shrink-0 text-navy-300 group-hover:text-navy-500" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* --------------------------------- CTA -------------------------------- */}
        <section className="bg-white py-12">
          <div className="mx-auto max-w-[1240px] px-5">
            <div className="flex flex-col items-start justify-between gap-5 rounded-xl bg-navy-500 px-6 py-8 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-heading text-[22px] font-extrabold text-white">
                  Ready to join the {trade.code} trade?
                </h2>
                <p className="mt-1.5 max-w-[520px] text-[12.5px] text-white/75">
                  Applications are open throughout the year. Bring your results slip and two passport
                  photos to the school office, or apply online.
                </p>
              </div>
              <Link
                href="/admissions"
                className="flex shrink-0 items-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-[12.5px] font-bold text-navy-500 transition hover:bg-gold-500"
              >
                Apply now
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
