import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import JsonLd from '@/components/JsonLd';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TeacherCard from '@/components/TeacherCard';
import TradeIcon from '@/components/TradeIcon';
import { REVALIDATE, getTrades } from '@/lib/content';
import { absoluteUrl } from '@/lib/school';
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo';

export const revalidate = REVALIDATE;

export const metadata: Metadata = pageMetadata({
  title: 'Our Teachers — Trade HODs and Trainers',
  description:
    'Meet the teachers of Lycée de Nyanza: the head of department and trainers behind each TVET trade, with their qualifications and the classes they teach.',
  path: '/teachers',
  keywords: [
    'Lycée de Nyanza teachers',
    'TVET trainers Rwanda',
    'trade head of department Nyanza',
    'school staff Rwanda',
  ],
});

export default async function TeachersPage() {
  const trades = await getTrades();
  const total = trades.reduce((sum, trade) => sum + trade.teachers.length, 0);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Teachers', path: '/teachers' },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Teachers at Lycée de Nyanza',
            numberOfItems: total,
            itemListElement: trades.flatMap((trade) =>
              trade.teachers.map((teacher) => ({
                '@type': 'ListItem',
                item: {
                  '@type': 'Person',
                  name: teacher.full_name,
                  jobTitle: teacher.title,
                  url: absoluteUrl(`/teachers/${teacher.slug}`),
                },
              }))
            ),
          },
        ]}
      />

      <main id="main-content">
        <section className="bg-navy-500 py-12">
          <div className="mx-auto max-w-[1240px] px-5">
            <nav aria-label="Breadcrumb" className="text-[11px] font-semibold text-white/60">
              <ol className="flex items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-white">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-white">
                  Teachers
                </li>
              </ol>
            </nav>
            <h1 className="mt-5 font-heading text-[34px] font-extrabold leading-tight text-white sm:text-[42px]">
              Our Teachers
            </h1>
            <span className="mt-4 block h-[3px] w-[88px] bg-white" />
            <p className="mt-5 max-w-[620px] text-[13.5px] leading-relaxed text-white/80">
              {total} trainers across {trades.length} trades. Every trade is led by a head of department
              and supported by trainers who teach the practical classes, the workshops and the labs.
            </p>
          </div>
        </section>

        {trades.map((trade) => (
          <section key={trade.slug} className="border-b border-navy-100 bg-white py-10 last:border-b-0">
            <div className="mx-auto max-w-[1240px] px-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-navy-500">
                    <TradeIcon icon={trade.icon} size={24} />
                  </span>
                  <div>
                    <h2 className="font-heading text-[18px] font-extrabold leading-tight text-navy-500">
                      {trade.name}
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-navy-300">
                      {trade.code} · {trade.teacher_count} teacher
                      {trade.teacher_count === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/academics/${trade.slug}`}
                  className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-navy-500 hover:underline"
                >
                  Trade page
                  <ArrowRight size={12} />
                </Link>
              </div>

              {trade.teachers.length > 0 ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {trade.teachers.map((teacher) => (
                    <TeacherCard
                      key={teacher.slug}
                      teacher={{ ...teacher, trade: teacher.trade ?? trade }}
                      featured={teacher.is_hod}
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-lg border border-navy-100 bg-navy-50/60 p-4 text-[12.5px] text-navy-400">
                  The teaching team for this trade is being updated.
                </p>
              )}
            </div>
          </section>
        ))}
      </main>

      <Footer />
    </div>
  );
}
