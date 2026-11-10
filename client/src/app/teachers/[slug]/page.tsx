import type { Metadata } from 'next';
import SafeImage from '@/components/SafeImage';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Layers,
  Mail,
  Phone,
  Users,
} from 'lucide-react';
import JsonLd from '@/components/JsonLd';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TeacherCard from '@/components/TeacherCard';
import TradeIcon from '@/components/TradeIcon';
import { REVALIDATE, getTeacher, getTeachers, splitTeam } from '@/lib/content';
import { absoluteUrl, SCHOOL } from '@/lib/school';
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo';

export const revalidate = REVALIDATE;
export const dynamicParams = true;

type Params = { slug: string };

export async function generateStaticParams() {
  const teachers = await getTeachers();
  return teachers.map((teacher) => ({ slug: teacher.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const teacher = await getTeacher(params.slug);
  if (!teacher) {
    return { title: 'Teacher not found', robots: { index: false, follow: false } };
  }
  return pageMetadata({
    title: `${teacher.full_name} — ${teacher.title}`,
    description: `${teacher.full_name} is ${teacher.title.toLowerCase()}${
      teacher.trade ? ` in ${teacher.trade.name}` : ''
    } at Lycée de Nyanza. ${teacher.qualification ? `Qualification: ${teacher.qualification}.` : ''} Teaches ${teacher.classes || teacher.levels}.`,
    path: `/teachers/${teacher.slug}`,
    keywords: [teacher.full_name, `${teacher.full_name} Lycée de Nyanza`, teacher.qualification],
  });
}

export default async function TeacherProfilePage({ params }: { params: Params }) {
  const teacher = await getTeacher(params.slug);
  if (!teacher) notFound();

  const tradeSlug = teacher.trade?.slug;
  const { trainers } = tradeSlug ? splitTeam((await getTeachers()).filter((t) => t.trade?.slug === tradeSlug)) : { trainers: [] };
  const colleagues = trainers.filter((t) => t.slug !== teacher.slug).slice(0, 3);
  const classes = teacher.classes
    ? teacher.classes.split(',').map((value) => value.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Teachers', path: '/teachers' },
            { name: teacher.full_name, path: `/teachers/${teacher.slug}` },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: teacher.full_name,
            jobTitle: teacher.title,
            url: absoluteUrl(`/teachers/${teacher.slug}`),
            description: teacher.bio,
            email: teacher.email || undefined,
            telephone: teacher.phone || undefined,
            worksFor: {
              '@type': 'School',
              name: SCHOOL.name,
              url: absoluteUrl('/'),
            },
            knowsAbout: tradeSlug ? teacher.trade?.name : undefined,
            alumniOf: teacher.qualification || undefined,
          },
        ]}
      />

      <main id="main-content">
        {/* -------------------------------- PROFILE ----------------------------- */}
        <section className="bg-navy-500 py-10">
          <div className="mx-auto max-w-[1240px] px-5">
            <nav aria-label="Breadcrumb" className="text-[11px] font-semibold text-white/60">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-white">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/teachers" className="hover:text-white">
                    Teachers
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-white">
                  {teacher.full_name}
                </li>
              </ol>
            </nav>

            <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
              <span className="flex h-[104px] w-[104px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-4 ring-white/20">
                {teacher.photo_url ? (
                  <SafeImage
                    src={teacher.photo_url}
                    alt={`${teacher.full_name}, ${teacher.title} at Lycée de Nyanza`}
                    width={104}
                    height={104}
                    priority
                    sizes="104px"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-heading text-[32px] font-extrabold tracking-[-0.02em] text-navy-500">
                    {teacher.initials}
                  </span>
                )}
              </span>

              <div className="min-w-0">
                {teacher.is_hod && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-navy-500">
                    <Users size={10} strokeWidth={3} />
                    Head of Department
                  </span>
                )}
                <h1 className="mt-2 font-heading text-[32px] font-extrabold leading-tight text-white sm:text-[38px]">
                  {teacher.full_name}
                </h1>
                <p className="mt-1 text-[13px] font-semibold text-white/75">
                  {teacher.title}
                  {teacher.trade ? ` · ${teacher.trade.name} (${teacher.trade.code})` : ''}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {teacher.levels && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white/85">
                      <Layers size={10} strokeWidth={3} />
                      {teacher.levels}
                    </span>
                  )}
                  {teacher.years_experience > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white/85">
                      <CalendarDays size={10} strokeWidth={3} />
                      {teacher.years_experience} yr{teacher.years_experience === 1 ? '' : 's'} experience
                    </span>
                  )}
                  {teacher.trade && (
                    <Link
                      href={`/academics/${teacher.trade.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-navy-500"
                    >
                      <TradeIcon icon="code" size={10} />
                      {teacher.trade.code} trade
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------- DETAILS ---------------------------- */}
        <section className="bg-white py-12">
          <div className="mx-auto grid max-w-[1240px] gap-10 px-5 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <h2 className="font-heading text-[20px] font-extrabold text-navy-500">Profile</h2>
              <span className="mt-2.5 block h-[3px] w-[64px] bg-navy-500" />
              <p className="mt-4 text-[13.5px] leading-[1.85] text-navy-400">
                {teacher.bio || `${teacher.full_name} teaches ${teacher.classes || teacher.levels} at Lycée de Nyanza.`}
              </p>

              <dl className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-navy-100 p-4">
                  <dt className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-navy-300">
                    <GraduationCap size={12} />
                    Qualification
                  </dt>
                  <dd className="mt-1.5 text-[12.5px] font-semibold leading-snug text-navy-500">
                    {teacher.qualification || 'Not listed'}
                  </dd>
                </div>
                <div className="rounded-lg border border-navy-100 p-4">
                  <dt className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-navy-300">
                    <BookOpen size={12} />
                    Classes taught
                  </dt>
                  <dd className="mt-1.5 flex flex-wrap gap-1.5">
                    {classes.length ? (
                      classes.map((value) => (
                        <span
                          key={value}
                          className="rounded-full bg-navy-50 px-2.5 py-1 text-[10.5px] font-bold text-navy-500"
                        >
                          {value}
                        </span>
                      ))
                    ) : (
                      <span className="text-[12.5px] text-navy-400">Not listed</span>
                    )}
                  </dd>
                </div>
                <div className="rounded-lg border border-navy-100 p-4">
                  <dt className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-navy-300">
                    <Layers size={12} />
                    Levels
                  </dt>
                  <dd className="mt-1.5 text-[12.5px] font-semibold text-navy-500">
                    {teacher.levels || 'L3 - L5'}
                  </dd>
                </div>
                <div className="rounded-lg border border-navy-100 p-4">
                  <dt className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-navy-300">
                    <Users size={12} />
                    Department
                  </dt>
                  <dd className="mt-1.5 text-[12.5px] font-semibold text-navy-500">
                    {teacher.department?.name || 'Lycée de Nyanza'}
                  </dd>
                </div>
              </dl>

              {(teacher.email || teacher.phone) && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {teacher.email && (
                    <a
                      href={`mailto:${teacher.email}`}
                      className="inline-flex items-center gap-2 rounded-full border border-navy-200 px-4 py-2 text-[11.5px] font-semibold text-navy-500 transition hover:bg-navy-50"
                    >
                      <Mail size={13} />
                      {teacher.email}
                    </a>
                  )}
                  {teacher.phone && (
                    <a
                      href={`tel:${teacher.phone.replace(/\s+/g, '')}`}
                      className="inline-flex items-center gap-2 rounded-full border border-navy-200 px-4 py-2 text-[11.5px] font-semibold text-navy-500 transition hover:bg-navy-50"
                    >
                      <Phone size={13} />
                      {teacher.phone}
                    </a>
                  )}
                </div>
              )}
            </div>

            <aside className="lg:col-span-4">
              {teacher.trade && (
                <div className="rounded-xl bg-navy-500 p-6">
                  <span className="text-white/70">
                    <TradeIcon icon="code" size={26} />
                  </span>
                  <h2 className="mt-3 font-heading text-[16px] font-extrabold text-white">
                    {teacher.trade.name}
                  </h2>
                  <p className="mt-2 text-[12px] leading-relaxed text-white/70">
                    {teacher.trade.tagline ||
                      `Explore the ${teacher.trade.code} trade, its L3-L5 curriculum and the rest of the team.`}
                  </p>
                  <Link
                    href={`/academics/${teacher.trade.slug}`}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold-500 px-4 py-2 text-[11px] font-bold text-white transition hover:bg-gold-600"
                  >
                    View trade
                    <ArrowRight size={12} />
                  </Link>
                </div>
              )}
              <Link
                href="/teachers"
                className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-navy-500 hover:underline"
              >
                <ArrowLeft size={12} />
                All teachers
              </Link>
            </aside>
          </div>
        </section>

        {colleagues.length > 0 && (
          <section className="bg-navy-50/40 py-12">
            <div className="mx-auto max-w-[1240px] px-5">
              <h2 className="font-heading text-[20px] font-extrabold text-navy-500">
                More {teacher.trade?.code} teachers
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {colleagues.map((colleague) => (
                  <TeacherCard key={colleague.slug} teacher={colleague} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
