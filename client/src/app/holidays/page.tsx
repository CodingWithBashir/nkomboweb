'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronDown,
  Download,
  FileText,
  FolderOpen,
  GraduationCap,
  Info,
  Lightbulb,
  Megaphone,
  Package,
  RefreshCw,
  Search,
  Send,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/lib/axios';

type Resource = {
  id: number;
  title: string;
  classLevel: string;
  year: string;
  term: string;
  type: string;
  uploaded: string;
  size: string;
  file: string;
};

const DEFAULT_FILTERS = {
  classLevel: 'All classes',
  year: '2024 – 2025',
  term: 'Term 1',
  type: 'All resource types',
};

const TYPE_LABELS: Record<string, string> = {
  assignment: 'Holiday Assignment',
  revision: 'Revision Notes',
  guide: 'Study Guide',
  past_paper: 'Past Paper',
};

const SAMPLE_RESOURCES: Resource[] = [
  {
    id: 1,
    title: 'Mathematics Holiday Assignment',
    classLevel: 'L3',
    year: '2024 – 2025',
    term: 'Term 1',
    type: 'Holiday Assignment',
    uploaded: 'Dec 20, 2024',
    size: '245 KB',
    file: '#',
  },
  {
    id: 2,
    title: 'Physics Revision Notes',
    classLevel: 'L4',
    year: '2024 – 2025',
    term: 'Term 1',
    type: 'Revision Notes',
    uploaded: 'Dec 18, 2024',
    size: '1.2 MB',
    file: '#',
  },
  {
    id: 3,
    title: 'Chemistry Study Guide',
    classLevel: 'L5',
    year: '2024 – 2025',
    term: 'Term 1',
    type: 'Study Guide',
    uploaded: 'Dec 18, 2024',
    size: '980 KB',
    file: '#',
  },
];

const ANNOUNCEMENTS = [
  {
    month: 'Dec',
    day: '20',
    title: 'Holiday Assignments for Term 1 are Now Available',
    text: 'Download your assignments and prepare for the next term.',
  },
  {
    month: 'Dec',
    day: '18',
    title: 'School Reopens on January 6, 2025',
    text: 'All students are expected back on time.',
  },
  {
    month: 'Dec',
    day: '15',
    title: 'End of Term 1 Successfully Completed',
    text: 'Congratulations to all our students!',
  },
];

const HELP_STEPS = [
  'Select your class and academic year.',
  'Choose the type of resource you need.',
  'Click Search and download your files.',
];

function FilterField({
  icon: Icon,
  label,
  value,
  onChange,
  options,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        <Icon size={13} className="text-navy-500" />
        <span className="text-[12px] font-bold text-navy-500">{label}</span>
      </div>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-md border border-navy-100 bg-white px-3 py-2.5 pr-9 text-[12.5px] text-navy-500 outline-none transition focus:border-gold-400"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-300"
        />
      </div>
    </div>
  );
}

export default function HolidaysPage() {
  const [resources, setResources] = useState<Resource[]>(SAMPLE_RESOURCES);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [applied, setApplied] = useState(DEFAULT_FILTERS);

  useEffect(() => {
    let active = true;
    api
      .get('/holiday-resources/', { params: { page_size: 100 } })
      .then((response) => {
        const list = Array.isArray(response.data) ? response.data : response.data?.results;
        if (!active || !Array.isArray(list) || list.length === 0) return;
        setResources(
          list.map((item: any, index: number) => ({
            id: item.id ?? index,
            title: item.title ?? 'Holiday resource',
            classLevel: item.class_level ?? 'L3',
            year: item.academic_year ?? '2024 – 2025',
            term: item.term_display ?? 'Term 1',
            type: TYPE_LABELS[item.resource_type] ?? 'Holiday Assignment',
            uploaded: item.upload_date
              ? new Date(item.upload_date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : '—',
            size: item.file_size || '—',
            file: item.file || '#',
          }))
        );
      })
      .catch(() => {
        /* keep the sample resources when the API is unavailable */
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      resources.filter(
        (item) =>
          (!applied.classLevel ||
            applied.classLevel === 'All classes' ||
            item.classLevel === applied.classLevel) &&
          (!applied.year || item.year === applied.year) &&
          (!applied.term || item.term === applied.term) &&
          (!applied.type ||
            applied.type === 'All resource types' ||
            item.type === applied.type)
      ),
    [resources, applied]
  );

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setApplied(DEFAULT_FILTERS);
  };

  return (
    <div className="min-h-screen bg-navy-50/40">
      <Navbar />

      <main id="main-content">
        {/* ------------------------------- HERO ------------------------------- */}
        <section className="relative isolate overflow-hidden bg-navy-500">
          <div className="absolute inset-y-0 right-0 w-full sm:w-[58%]">
            <Image
              src="/images/school-building.jpg"
              alt="The Lycée de Nyanza campus building in Nyanza District, Rwanda"
              fill
              priority
              sizes="(max-width: 640px) 100vw, 58vw"
              className="object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(90deg, #0a2540 0%, rgba(10,37,64,0.92) 22%, rgba(10,37,64,0.35) 60%, rgba(10,37,64,0.15) 100%)',
              }}
            />
          </div>

          <div className="relative mx-auto max-w-[1240px] px-5 py-11">
            <div className="flex max-w-[560px] gap-4">
              <span className="w-[3px] shrink-0 rounded-full bg-gold-400" />
              <div>
                <h1 className="font-heading text-[30px] font-extrabold leading-[1.15] text-white sm:text-[38px]">
                  Student Learning &amp;
                  <br />
                  Holiday Resources
                </h1>
                <p className="mt-3 max-w-[430px] text-[13px] leading-relaxed text-white/85">
                  Access holiday assignments, revision materials and study guides to keep
                  learning even during holidays.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ----------------------------- FILTERS ------------------------------ */}
        <div className="relative z-10 mx-auto -mt-8 max-w-[1240px] px-5">
          <div className="rounded-lg border border-navy-100 bg-white p-5 shadow-soft">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              <FilterField
                icon={GraduationCap}
                label="Program/Class"
                value={filters.classLevel}
                onChange={(value) => setFilters({ ...filters, classLevel: value })}
                options={['All classes', 'L3', 'L4', 'L5']}
              />
              <FilterField
                icon={Calendar}
                label="Academic Year"
                value={filters.year}
                onChange={(value) => setFilters({ ...filters, year: value })}
                options={['2024 – 2025', '2025 – 2026']}
              />
              <FilterField
                icon={Send}
                label="Term"
                value={filters.term}
                onChange={(value) => setFilters({ ...filters, term: value })}
                options={['Term 1', 'Term 2', 'Term 3']}
              />
              <FilterField
                icon={FolderOpen}
                label="Resource Type"
                value={filters.type}
                onChange={(value) => setFilters({ ...filters, type: value })}
                options={['All resource types', 'Holiday Assignment', 'Revision Notes', 'Study Guide', 'Past Paper']}
              />

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setApplied(filters)}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-navy-500 px-4 py-2.5 text-[12.5px] font-bold text-white transition hover:bg-navy-600"
                >
                  <Search size={14} />
                  Search Resources
                </button>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-navy-200 bg-white px-4 py-2.5 text-[12.5px] font-bold text-navy-500 transition hover:border-navy-500"
                >
                  <RefreshCw size={14} />
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------ RESOURCES + HELP -------------------------- */}
        <section className="mx-auto max-w-[1240px] px-5 py-7">
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="lg:col-span-9">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-heading text-[17px] font-extrabold text-navy-500">
                  <BookOpen size={17} className="text-navy-500" />
                  Available Holiday Resources
                </h2>
                <span className="flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-[10.5px] font-medium text-sky-700">
                  <Info size={11} />
                  Only resources published by the school are shown.
                </span>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-lg border border-navy-100 bg-white p-4 shadow-card"
                  >
                    <div className="flex gap-3">
                      <span className="flex h-14 w-11 shrink-0 flex-col items-center justify-center rounded-md bg-red-600 text-white">
                        <FileText size={17} />
                        <span className="mt-0.5 text-[7px] font-bold tracking-wide">PDF</span>
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-[13px] font-bold leading-snug text-navy-500">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 text-[11px] text-navy-300">
                          <span className="font-semibold text-navy-500">Class:</span>{' '}
                          {item.classLevel} <span className="text-navy-200">|</span>{' '}
                          <span className="font-semibold text-navy-500">Year:</span> {item.year}
                        </p>
                        <p className="mt-0.5 text-[11px] text-navy-300">
                          <span className="font-semibold text-navy-500">Term:</span> {item.term}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-navy-100 pt-2.5 text-[10.5px] text-navy-300">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={11} />
                        Uploaded: {item.uploaded || '—'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Package size={11} />
                        Size: {item.size}
                      </span>
                    </div>

                    <a
                      href={item.file}
                      className="mt-3 flex items-center justify-center gap-2 rounded-md bg-navy-500 px-4 py-2.5 text-[11.5px] font-bold text-white transition hover:bg-navy-600"
                    >
                      <Download size={13} />
                      Download
                    </a>
                  </article>
                ))}

                {filtered.length === 0 && (
                  <div className="col-span-full rounded-lg border border-dashed border-navy-200 bg-white p-8 text-center">
                    <p className="text-[12.5px] text-navy-400">
                      No resources match your selection yet. Try another class, year or term.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <aside className="lg:col-span-3">
              <div className="overflow-hidden rounded-lg border border-navy-100 bg-white shadow-card">
                <div className="flex items-center gap-2 bg-navy-500 px-4 py-3">
                  <GraduationCap size={16} className="text-gold-400" />
                  <h3 className="font-heading text-[13.5px] font-extrabold text-white">
                    Student Help
                  </h3>
                </div>
                <ol className="space-y-3 px-4 py-4">
                  {HELP_STEPS.map((step, index) => (
                    <li key={step} className="flex gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-500 text-[10px] font-bold text-white">
                        {index + 1}
                      </span>
                      <span className="text-[11px] leading-[1.5] text-navy-400">{step}</span>
                    </li>
                  ))}
                </ol>
                <div className="mx-4 mb-4 flex gap-2 rounded-md bg-gold-100 px-3 py-2.5">
                  <Lightbulb size={14} className="shrink-0 text-gold-600" />
                  <p className="text-[10.5px] leading-[1.5] text-navy-500">
                    <span className="font-bold">Keep studying hard!</span> You can do it.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* -------------------------- ANNOUNCEMENTS --------------------------- */}
        <section className="mx-auto max-w-[1240px] px-5 pb-10">
          <div className="rounded-lg border border-navy-100 bg-white shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-100 px-5 py-3">
              <h2 className="flex items-center gap-2 font-heading text-[14.5px] font-extrabold text-navy-500">
                <Megaphone size={15} />
                Latest Announcements
              </h2>
              <Link
                href="/news"
                className="flex items-center gap-1.5 rounded-full bg-gold-400 px-4 py-1.5 text-[11px] font-bold text-navy-500 transition hover:bg-gold-500"
              >
                View All
                <ArrowRight size={11} />
              </Link>
            </div>

            <div className="grid divide-y divide-navy-100 md:grid-cols-3 md:divide-x md:divide-y-0">
              {ANNOUNCEMENTS.map((item) => (
                <div key={item.title} className="flex gap-3 px-5 py-4">
                  <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded bg-navy-500 leading-none text-white">
                    <span className="text-[8px] font-bold uppercase tracking-wide text-gold-400">
                      {item.month}
                    </span>
                    <span className="mt-1 text-[15px] font-extrabold">{item.day}</span>
                  </div>
                  <div>
                    <h3 className="text-[12px] font-bold leading-snug text-navy-500">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-[10.5px] leading-snug text-navy-300">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
