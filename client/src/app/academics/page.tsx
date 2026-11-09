import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { absoluteUrl } from '@/lib/school';
import { breadcrumbJsonLd, pageMetadata, webPageJsonLd } from '@/lib/seo';
import {
  ArrowRight,
  Video,
  MonitorPlay,
  Wrench,
  FlaskConical,
  GraduationCap,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TradeIcon from '@/components/TradeIcon';
import { REVALIDATE, getTrades } from '@/lib/content';

const pageTitle = 'Academic Programs & TVET Courses';
const pageDescription =
  'Explore the 10 career-focused TVET programs at Lycée de Nyanza — software development, networking, multimedia, computer systems, automobile technology, construction, electrical, tourism, food & beverage and electronics — each offered at L3, L4 and L5 level.';

export const metadata: Metadata = pageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/academics',
  keywords: [
    'TVET programs Rwanda',
    'Lycée de Nyanza programs',
    'L3 L4 L5 courses Rwanda',
    'technical courses Nyanza',
    'software development course Rwanda',
  ],
});

export const revalidate = REVALIDATE;

const levels = ['L3', 'L4', 'L5'];

const facilities = [
  { label: 'Computer Lab', icon: MonitorPlay, image: '/images/campus-lab.jpg' },
  { label: 'Workshop', icon: Wrench, image: '/images/workshop.jpg' },
  { label: 'Multimedia Studio', icon: Video, image: '/images/studio.jpg' },
  { label: 'Science & Practical Learning', icon: FlaskConical, image: '/images/campus-study.jpg' },
];

export default async function AcademicsPage() {
  const trades = await getTrades();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <JsonLd
        data={[
          webPageJsonLd({ title: pageTitle, description: pageDescription, path: '/academics' }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Academics', path: '/academics' },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Academic programs at Lycée de Nyanza',
            itemListElement: trades.map((trade, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'Course',
                name: `${trade.name} (${trade.code})`,
                url: absoluteUrl(`/academics/${trade.slug}`),
                provider: { '@type': 'School', name: 'Lycée de Nyanza', url: absoluteUrl('/') },
              },
            })),
          },
        ]}
      />

      <main id="main-content">
        {/* ------------------------------- HERO ------------------------------- */}
        <section className="relative isolate overflow-hidden bg-navy-500">
          {/* photo with slanted left edge + gold wedge */}
          <div className="absolute inset-y-0 right-0 w-full sm:w-[68%]">
            <Image
              src="/images/academics-hero.jpg"
              alt="Students writing in their exercise books during a lesson at Lycée de Nyanza"
              fill
              priority
              sizes="(max-width: 640px) 100vw, 68vw"
              className="object-cover"
              style={{ clipPath: 'polygon(17% 0, 100% 0, 100% 100%, 0 100%)' }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(90deg, #000000 0%, rgba(0,0,0,0.9) 12%, rgba(0,0,0,0.15) 48%, rgba(0,0,0,0) 70%)',
              }}
            />
            <div
              className="absolute inset-0 bg-gold-400"
              style={{ clipPath: 'polygon(16.6% 0, 18.4% 0, 1.8% 100%, 0 100%)' }}
            />
          </div>

          <div className="relative mx-auto flex min-h-[320px] max-w-[1240px] items-center px-5 py-14">
            <div className="max-w-[520px]">
              <h1 className="font-heading text-[40px] font-extrabold leading-[1.1] text-white sm:text-[52px]">
                Learn Skills.
                <br />
                <span className="text-gold-400">Build Your Future.</span>
              </h1>
              <p className="mt-5 max-w-[430px] text-[14px] leading-relaxed text-white/90">
                Practical, career-focused TVET education for a brighter tomorrow.
              </p>
              <Link
                href="#programs"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-[12.5px] font-bold text-navy-500 transition hover:bg-gold-500"
              >
                Explore Our Programs
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* ---------------------------- PROGRAMS ------------------------------ */}
        <section id="programs" className="bg-white py-12">
          <div className="mx-auto max-w-[1240px] px-5">
            <div className="text-center">
              <div className="flex items-center justify-center gap-4">
                <span className="hidden h-[2.5px] w-12 bg-navy-500 sm:block" />
                <h2 className="font-heading text-[26px] font-extrabold text-navy-500">
                  Our Academic Programs
                </h2>
                <span className="hidden h-[2.5px] w-12 bg-navy-500 sm:block" />
              </div>
              <p className="mt-2 text-[13px] text-navy-300">
                Hands-on training in modern and in-demand fields
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {trades.map((trade) => (
                <Link
                  key={trade.slug}
                  href={`/academics/${trade.slug}`}
                  aria-label={`${trade.name} — levels L3 to L5, ${trade.teacher_count} teachers`}
                  className="group flex items-center gap-3 rounded-lg border border-navy-50 bg-white px-4 py-4 shadow-card transition hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-soft"
                >
                  <span className="text-navy-500">
                    <TradeIcon icon={trade.icon} size={30} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[12.5px] font-bold leading-[1.3] text-navy-500">{trade.name}</h3>
                    <div className="mt-2 flex items-center gap-1.5">
                      {levels.map((level, index) => (
                        <span
                          key={level}
                          className={`rounded-full px-2 py-[2px] text-[9px] font-bold ${
                            index === 0 ? 'bg-navy-500 text-white' : 'bg-navy-100 text-navy-500'
                          }`}
                        >
                          {level}
                        </span>
                      ))}
                    </div>
                    <p className="mt-1.5 text-[9.5px] font-semibold uppercase tracking-wide text-navy-300">
                      {trade.teacher_count} teacher{trade.teacher_count === 1 ? '' : 's'}
                    </p>
                  </div>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-navy-200 text-navy-400 transition group-hover:border-navy-400 group-hover:text-navy-500">
                    <ArrowRight size={11} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* --------------------- BEYOND THE CLASSROOM ------------------------- */}
        <section className="bg-white pb-12">
          <div className="mx-auto grid max-w-[1240px] items-center gap-6 px-5 lg:grid-cols-12 lg:gap-4">
            <div className="lg:col-span-3">
              <h2 className="font-heading text-[19px] font-extrabold leading-snug text-navy-500">
                Learning Beyond the Classroom
              </h2>
              <p className="mt-3 text-[12px] leading-[1.7] text-navy-300">
                Modern facilities, experienced teachers, and a vibrant student life.
              </p>
              <Link
                href="/campus-life"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-navy-500 px-5 py-2.5 text-[11.5px] font-bold text-white transition hover:bg-navy-600"
              >
                Discover Our Campus
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2 lg:col-span-7 lg:grid-cols-4">
              {facilities.map(({ label, icon: Icon, image }) => (
                <div key={label} className="relative h-[150px] overflow-hidden rounded-md">
                  <Image
                    src={image}
                    alt={`${label} at Lycée de Nyanza`}
                    fill
                    sizes="(max-width: 1024px) 50vw, 170px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-500/95 via-navy-500/20 to-transparent" />
                  <div className="absolute inset-x-2 bottom-2 flex items-center gap-1.5 text-white">
                    <Icon size={11} className="shrink-0" />
                    <span className="text-[10px] font-semibold leading-tight">{label}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-2">
              <div className="flex h-full flex-col items-center justify-center gap-3 rounded-lg bg-navy-500 px-4 py-6 text-center">
                <GraduationCap size={30} className="text-gold-400" strokeWidth={1.6} />
                <h3 className="font-heading text-[14px] font-extrabold uppercase leading-tight text-white">
                  Join Lycée
                  <br />
                  de Nyanza
                </h3>
                <p className="text-[10.5px] text-white/75">Your Future Starts Here</p>
                <Link
                  href="/admissions"
                  className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-gold-400 px-4 py-2 text-[11px] font-bold text-navy-500 transition hover:bg-gold-500"
                >
                  Apply Now
                  <ArrowRight size={11} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
