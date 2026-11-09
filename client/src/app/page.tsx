import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { absoluteUrl } from '@/lib/school';
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, OG_IMAGE, pageMetadata, webPageJsonLd } from '@/lib/seo';
import { ArrowRight, ClipboardList } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeadTeachers from '@/components/HeadTeachers';
import TradeIcon from '@/components/TradeIcon';
import {
  FAQ_ITEMS,
  Faq,
  StatsBand,
  TeachersTeaser,
  Testimonials,
  TradesGrid,
  TrustStrip,
  WhyUs,
} from '@/components/home/HomeSections';
import { REVALIDATE, getStudents, getTrades } from '@/lib/content';
import StudentCard from '@/components/StudentCard';

export const metadata: Metadata = {
  ...pageMetadata({
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    path: '/',
    keywords: [
      'Lycée de Nyanza',
      'technical secondary school Nyanza Rwanda',
      'TVET school Rwanda admissions',
      'boarding school Southern Province Rwanda',
    ],
  }),
  // keep the homepage title absolute (no "| Lycée de Nyanza" duplication)
  title: { absolute: DEFAULT_TITLE },
};

const heroOverlay =
  'linear-gradient(90deg, #002a6b 0%, #002a6b 34%, rgba(0,42,107,0.94) 48%, rgba(0,42,107,0.55) 72%, rgba(0,42,107,0.12) 100%)';

export const revalidate = REVALIDATE;

const campusImages = [
  { src: '/images/campus-study.jpg', alt: 'Students learning together' },
  { src: '/images/campus-sports.jpg', alt: 'Students playing basketball' },
  { src: '/images/campus-lab.jpg', alt: 'Students in the computer laboratory' },
];

const news = [
  {
    title: 'Admission for the 2025–2026 Academic Year is Open',
    day: 'Apr 25',
    year: '2025',
    image: '/images/news-graduation.jpg',
  },
  {
    title: 'Career Guidance Session for Our Students',
    day: 'Apr 15',
    year: '2025',
    image: '/images/news-guidance.jpg',
  },
  {
    title: 'Celebrating Excellence at Lycée de Nyanza',
    day: 'Apr 10',
    year: '2025',
    image: '/images/school-building.jpg',
  },
];

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`h-[2.5px] w-7 ${light ? 'bg-gold-400' : 'bg-gold-400'}`} />
      <span
        className={`text-[11.5px] font-bold uppercase tracking-[0.14em] ${
          light ? 'text-gold-300' : 'text-gold-600'
        }`}
      >
        {children}
      </span>
    </div>
  );
}

export default async function HomePage() {
  const [trades, students] = await Promise.all([getTrades(), getStudents()]);
  const spotlight = students.filter((student) => student.level === 'L5').slice(0, 3);
  const featuredTrades = trades.slice(0, 4);
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <JsonLd
        data={[
          webPageJsonLd({ title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, path: '/' }),
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'What programs does Lycée de Nyanza offer?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Lycée de Nyanza offers ten TVET programs at L3, L4 and L5 level: Software Development, Networking & Internet Technology, Multimedia Production, Computer System & Architecture, Automobile Technology, Building Construction, Electrical Technology, Tourism, Food & Beverage Operations and Electronics & Telecommunications.',
                },
              },
              {
                '@type': 'Question',
                name: 'Where is Lycée de Nyanza located?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Lycée de Nyanza is located in Nyanza District, Southern Province, Rwanda. You can reach the school on +250 788 123 456 or at info@lyceedenyanza.rw.',
                },
              },
              {
                '@type': 'Question',
                name: 'How do I apply for admission?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Applications for the 2025–2026 academic year are open. Visit the admissions page for requirements and documents, then submit your application online or at the school office.',
                },
              },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ_ITEMS.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: { '@type': 'Answer', text: item.answer },
            })),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'TVET trades at Lycée de Nyanza',
            itemListElement: trades.map((trade, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'Course',
                name: `${trade.name} (${trade.code})`,
                url: absoluteUrl(`/academics/${trade.slug}`),
                provider: {
                  '@type': 'School',
                  name: 'Lycée de Nyanza',
                  url: absoluteUrl('/'),
                },
              },
            })),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'ImageObject',
            contentUrl: absoluteUrl(OG_IMAGE.url),
            width: OG_IMAGE.width,
            height: OG_IMAGE.height,
            caption: OG_IMAGE.alt,
          },
        ]}
      />

      <main id="main-content">
        {/* ------------------------------- HERO ------------------------------- */}
        <section className="relative isolate overflow-hidden bg-navy-500">
          <Image
            src="/images/hero-students.jpg"
            alt="Lycée de Nyanza students working on laptops with their teacher in a bright classroom"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0" style={{ background: heroOverlay }} />

          <div className="relative mx-auto flex min-h-[500px] max-w-[1240px] items-center px-5 py-16">
            <div className="max-w-[640px]">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/85 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
                Technical secondary school · Nyanza, Rwanda
              </span>
              <h1 className="mt-5 font-heading text-[42px] font-extrabold leading-[1.06] text-white sm:text-[54px]">
                Building Skills.
                <br />
                <span className="text-gold-400">Shaping Tomorrow.</span>
              </h1>
              <span className="mt-6 block h-[3px] w-[92px] bg-gold-400" />
              <p className="mt-6 max-w-[520px] text-[15px] leading-relaxed text-white/90">
                Welcome to Lycée de Nyanza, a place where knowledge, discipline and innovation
                come together to build a brighter future.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/about"
                  className="flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-[12.5px] font-bold text-white transition hover:bg-gold-600"
                >
                  Explore Our School
                  <ArrowRight size={15} />
                </Link>
                <Link
                  href="/academics"
                  className="flex items-center gap-2 rounded-full border border-white/60 px-6 py-3 text-[12.5px] font-bold text-white transition hover:bg-white hover:text-navy-500"
                >
                  Explore Programs
                  <ArrowRight size={15} />
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 pt-6">
                {[
                  { value: '10', label: 'TVET trades' },
                  { value: 'L3 – L5', label: 'Three-year programmes' },
                  { value: 'Boarding', label: 'Full-time campus' },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="font-heading text-[19px] font-extrabold leading-none text-white">
                      {item.value}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* slanted white edge, as in the brand design */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-[26px] bg-white"
            style={{ clipPath: 'polygon(0 100%, 100% 34%, 100% 100%)' }}
          />
        </section>

        <StatsBand />

        {/* ------------------------ ABOUT + OUR PROGRAMS ----------------------- */}
        <section className="bg-white py-14">
          <div className="mx-auto grid max-w-[1240px] items-start gap-x-12 gap-y-12 px-5 lg:grid-cols-12">
            {/* about */}
            <div className="lg:col-span-5">
              <div className="flex gap-5">
                <div className="relative w-[46%] shrink-0 overflow-hidden rounded-md">
                  <span className="absolute inset-y-0 left-0 z-10 w-[5px] bg-navy-500" />
                  <Image
                    src="/images/school-building.jpg"
                    alt="The Lycée de Nyanza campus building and gardens in Nyanza District, Rwanda"
                    width={420}
                    height={210}
                    sizes="(max-width: 1024px) 45vw, 240px"
                    className="h-[210px] w-full object-cover"
                  />
                </div>
                <div>
                  <Eyebrow>About Our School</Eyebrow>
                  <h2 className="mt-2.5 font-heading text-[26px] font-extrabold leading-tight text-navy-500">
                    Lycée de Nyanza
                  </h2>
                  <p className="mt-3 text-[12.5px] leading-[1.7] text-navy-300">
                    Lycée de Nyanza is a private boarding Technical Secondary School located in
                    Nyanza District, Southern Province, Rwanda. We are committed to providing
                    quality education, technical skills and moral values for a successful future.
                  </p>
                  <Link
                    href="/about"
                    className="mt-4 inline-flex items-center gap-2 rounded-md bg-navy-500 px-5 py-2.5 text-[12px] font-bold text-white transition hover:bg-navy-600"
                  >
                    Learn More
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>

            {/* programs */}
            <div className="lg:col-span-7">
              <Eyebrow>Our Programs</Eyebrow>
              <h2 className="mt-2.5 font-heading text-[24px] font-extrabold leading-tight text-navy-500">
                Diverse Programs for Your Future
              </h2>

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {featuredTrades.map((trade) => (
                  <Link
                    key={trade.slug}
                    href={`/academics/${trade.slug}`}
                    className="group flex flex-col items-center rounded-xl border border-navy-100 bg-white px-3 py-6 text-center shadow-[0_2px_10px_-4px_rgba(0,42,107,0.16)] transition hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-card"
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-50 text-navy-500 transition group-hover:bg-gold-50 group-hover:text-gold-600">
                      <TradeIcon icon={trade.icon} size={24} strokeWidth={1.7} />
                    </span>
                    <span className="mt-3.5 text-[12px] font-bold leading-snug text-navy-500">
                      {trade.name}
                    </span>
                    <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-navy-300">
                      {trade.code} · L3-L5
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ----------------------------- CAMPUS LIFE --------------------------- */}
        <section className="bg-navy-500">
          <div className="mx-auto grid max-w-[1240px] items-center gap-8 px-5 lg:grid-cols-2 lg:gap-0 lg:pl-5 lg:pr-0">
            <div className="py-12 lg:py-16 lg:pr-12">
              <Eyebrow light>Campus Life</Eyebrow>
              <h2 className="mt-3 font-heading text-[28px] font-extrabold leading-tight text-white">
                A Supportive
                <br />
                and Inspiring Environment
              </h2>
              <p className="mt-4 max-w-[420px] text-[13px] leading-[1.75] text-white/80">
                Experience a vibrant campus life with modern facilities, extracurricular
                activities and a caring community.
              </p>
              <Link
                href="/campus-life"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-[12.5px] font-bold text-white transition hover:bg-gold-600"
              >
                Discover Campus Life
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-1 pb-10 lg:pb-0 xl:-mr-[calc((100vw-1240px)/2)]">
              {campusImages.map((image) => (
                <Image
                  key={image.src}
                  src={image.src}
                  alt={image.alt}
                  width={400}
                  height={320}
                  sizes="(max-width: 1024px) 33vw, 240px"
                  className="h-[260px] w-full object-cover lg:h-[320px]"
                />
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------ TRADES ------------------------------ */}
        <TradesGrid trades={trades} />

        {spotlight.length > 0 && (
          <section className="bg-white py-14">
            <div className="mx-auto max-w-[1240px] px-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-gold-600">
                    Our students
                  </p>
                  <h2 className="mt-2 font-heading text-[28px] font-extrabold leading-tight text-navy-500">
                    The class of 2026
                  </h2>
                  <span className="mt-3 block h-[3px] w-[80px] bg-navy-500" />
                  <p className="mt-3 max-w-[520px] text-[13px] leading-relaxed text-navy-400">
                    Final-year students finishing their trade and sitting the national practical
                    examination.
                  </p>
                </div>
                <Link
                  href="/students"
                  className="inline-flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wide text-navy-500 hover:underline"
                >
                  All students
                  <ArrowRight size={12} />
                </Link>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {spotlight.map((student) => (
                  <StudentCard key={student.id} student={student} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ------------------------------- WHY US ----------------------------- */}
        <WhyUs />

        {/* -------------------------- NEWS & EVENTS ---------------------------- */}
        <section className="bg-white py-14">
          <div className="mx-auto max-w-[1240px] px-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Eyebrow>Latest News &amp; Events</Eyebrow>
                <h2 className="mt-2.5 font-heading text-[28px] font-extrabold leading-tight text-navy-500">
                  Stay Informed
                </h2>
              </div>
              <Link
                href="/news"
                className="flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-[12px] font-bold text-white transition hover:bg-gold-600"
              >
                View All News
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {news.map((item) => (
                <article
                  key={item.title}
                  className="overflow-hidden rounded-lg border border-navy-50 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-soft"
                >
                  <div className="relative">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={400}
                      height={185}
                      sizes="(max-width: 768px) 100vw, 380px"
                      className="h-[185px] w-full object-cover"
                    />
                    <div className="absolute right-3 top-3 rounded bg-navy-500 px-2.5 py-1.5 text-center leading-tight text-white">
                      <div className="text-[11.5px] font-bold">{item.day}</div>
                      <div className="text-[10px] text-white/85">{item.year}</div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-heading text-[15px] font-bold leading-snug text-navy-500">
                      {item.title}
                    </h3>
                    <Link
                      href="/news"
                      className="mt-3.5 inline-flex items-center gap-2 text-[11.5px] font-bold text-gold-600 transition hover:text-gold-700 hover:underline"
                    >
                      Read More
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------- HEAD TEACHERS -------------------------- */}
        <HeadTeachers />

        {/* --------------------------- TEACHERS TEASER ------------------------- */}
        <TeachersTeaser />

        {/* ----------------------------- TESTIMONIALS -------------------------- */}
        <Testimonials />

        {/* -------------------------------- FAQ -------------------------------- */}
        <Faq />

        <TrustStrip />

        {/* ------------------------------- CTA -------------------------------- */}
        <section className="bg-white pb-14">
          <div className="mx-auto max-w-[1240px] px-5">
            <div className="relative overflow-hidden rounded-xl bg-gold-50 px-8 py-7">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-white text-gold-600 shadow-card">
                    <ClipboardList size={24} strokeWidth={1.7} />
                  </span>
                  <span className="hidden h-12 w-px bg-gold-200 sm:block" />
                  <div>
                    <h3 className="font-heading text-[21px] font-extrabold text-navy-600">
                      Ready to Join Our School?
                    </h3>
                    <p className="mt-1 text-[12.5px] text-navy-400">
                      Apply today and be part of the Lycée de Nyanza family.
                    </p>
                  </div>
                </div>
                <Link
                  href="/admissions"
                  className="flex items-center gap-2 rounded-full bg-gold-500 px-7 py-3 text-[12.5px] font-bold text-white shadow-card transition hover:bg-gold-600"
                >
                  Start Your Admission
                  <ArrowRight size={14} />
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
