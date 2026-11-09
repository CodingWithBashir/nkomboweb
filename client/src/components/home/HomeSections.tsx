import Link from 'next/link';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Building2,
  GraduationCap,
  Handshake,
  Home as HomeIcon,
  Quote,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import type { Trade } from '@/lib/content';
import TradeIcon from '@/components/TradeIcon';

const STATS = [
  { value: '640+', label: 'Students' },
  { value: '22', label: 'Teachers & trainers' },
  { value: '10', label: 'TVET trades' },
  { value: '96%', label: 'Pass rate' },
];

/** Dark band of headline numbers directly under the herg. */
export function StatsBand() {
  return (
    <section aria-label="School at a glance" className="bg-navy-600">
      <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-y-6 px-5 py-8 sm:grid-cols-4">
        {STATS.map((stat, index) => (
          <div
            key={stat.label}
            className={`px-2 ${index !== 0 ? 'sm:border-l sm:border-white/15' : ''}`}
          >
            <p className="font-heading text-[26px] font-extrabold leading-none text-white">
              {stat.value}
            </p>
            <p className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/55">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

const REASONS = [
  {
    icon: Wrench,
    title: 'Practical, trade-first teaching',
    body: 'More than half of every week is spent in a workshop, lab or studio — students graduate with something they can do, not only something they have read.',
  },
  {
    icon: GraduationCap,
    title: 'Progress from L3 to L5',
    body: 'Each trade runs the full three-level pathway, so a student can enter at L3 and leave with a recognised TVET certificate or diploma.',
  },
  {
    icon: Handshake,
    title: 'Links to real employers',
    body: 'Work placements, guest trainers and site visits with garages, hotels, ISPs and construction firms in Nyanza and Kigali.',
  },
  {
    icon: ShieldCheck,
    title: 'Discipline and boarding care',
    body: 'A boarding house with resident staff, a structured study timetable and the school motto — Excellence Through Discipline.',
  },
];

/** Four-column value proposition band. */
export function WhyUs() {
  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-[1240px] px-5">
        <div className="max-w-[620px]">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-gold-600">
            Why Lycée de Nyanza
          </p>
          <h2 className="mt-2 font-heading text-[28px] font-extrabold leading-tight text-navy-500">
            A technical school built around work
          </h2>
          <span className="mt-3 block h-[3px] w-[80px] bg-navy-500" />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="flex h-full flex-col rounded-xl border border-navy-100 bg-white p-5 transition hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-card"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-50 text-navy-500">
                <Icon size={18} strokeWidth={1.8} />
              </span>
              <h3 className="mt-3.5 font-heading text-[14px] font-extrabold leading-snug text-navy-500">
                {title}
              </h3>
              <p className="mt-2 text-[12px] leading-relaxed text-navy-400">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Every trade, linking through to its L3-L5 page and teaching team. */
export function TradesGrid({ trades }: { trades: Trade[] }) {
  return (
    <section id="trades" className="bg-navy-50/40 py-14">
      <div className="mx-auto max-w-[1240px] px-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-gold-600">
              Trades
            </p>
            <h2 className="mt-2 font-heading text-[28px] font-extrabold leading-tight text-navy-500">
              Ten trades. One campus.
            </h2>
            <span className="mt-3 block h-[3px] w-[80px] bg-navy-500" />
          </div>
          <Link
            href="/academics"
            className="inline-flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wide text-navy-500 hover:underline"
          >
            Academics overview
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {trades.map((trade) => (
            <Link
              key={trade.slug}
              href={`/academics/${trade.slug}`}
              className="group flex h-full flex-col rounded-xl border border-navy-100 bg-white p-4 transition hover:-translate-y-0.5 hover:border-navy-400 hover:shadow-card"
            >
              <div className="flex items-start justify-between">
                <span className="text-navy-500">
                  <TradeIcon icon={trade.icon} size={24} />
                </span>
                <span className="rounded-full bg-navy-50 px-2 py-[3px] text-[9px] font-extrabold uppercase tracking-wide text-navy-500">
                  {trade.code}
                </span>
              </div>
              <h3 className="mt-3 font-heading text-[12.5px] font-extrabold leading-snug text-navy-500">
                {trade.name}
              </h3>
              <p className="mt-1.5 line-clamp-3 text-[11px] leading-relaxed text-navy-400">
                {trade.summary}
              </p>
              <span className="mt-auto flex items-center justify-between pt-3 text-[9.5px] font-bold uppercase tracking-[0.14em] text-navy-300">
                L3 - L5 · {trade.teacher_count} teachers
                <ArrowRight size={11} className="text-navy-300 group-hover:text-navy-500" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  {
    quote:
      'I joined at L3 with no idea how to code. By L5 I had built the attendance system our school still uses.',
    name: 'Aline Uwase',
    role: 'Software Development, L5',
  },
  {
    quote:
      'The workshop hours are what changed everything for me. I could already service a car before I finished L4.',
    name: 'Eric Nsengimana',
    role: 'Automobile Technology, graduate',
  },
  {
    quote:
      'My daughter boards here and I see the discipline at home. The teachers call me when something matters.',
    name: 'Joséphine Mukamana',
    role: 'Parent, Nyanza',
  },
];

export function Testimonials() {
  return (
    <section className="bg-navy-500 py-14">
      <div className="mx-auto max-w-[1240px] px-5">
        <div className="max-w-[560px]">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-gold-300">
            Voices
          </p>
          <h2 className="mt-2 font-heading text-[28px] font-extrabold leading-tight text-white">
            Students, graduates and parents
          </h2>
          <span className="mt-3 block h-[3px] w-[80px] bg-gold-400" />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <figure key={item.name} className="flex h-full flex-col rounded-xl bg-white/[0.06] p-5">
              <Quote size={18} className="text-white/40" />
              <blockquote className="mt-3 flex-1 text-[13px] leading-relaxed text-white/85">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-4 border-t border-white/15 pt-3">
                <p className="text-[12px] font-bold text-white">{item.name}</p>
                <p className="text-[10.5px] font-semibold uppercase tracking-wide text-white/50">
                  {item.role}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export const FAQ_ITEMS = [
  {
    question: 'What levels does Lycée de Nyanza offer?',
    answer:
      'Every trade runs from L3 to L5, the three levels of Rwanda TVET certification. Students can join at L3 or transfer in at L4 with the right results.',
  },
  {
    question: 'How do I apply for a trade?',
    answer:
      'Applications are open all year. Bring your O-level or Senior 3 results slip, two passport photos and the school fees to the office in Nyanza, or submit the online application form.',
  },
  {
    question: 'Is the school boarding or day?',
    answer:
      'Lycée de Nyanza is a private boarding school with resident staff; a limited number of day places are available for students living in Nyanza.',
  },
  {
    question: 'Who teaches the trades?',
    answer:
      'Each trade has a head of department plus two or more trainers. Every teacher has a public profile showing their qualifications and the classes they teach.',
  },
  {
    question: 'Can I visit the campus?',
    answer:
      'Yes. Guided visits run on weekday afternoons — call the school office on +250 788 123 456 to arrange a time.',
  },
];

export function Faq() {
  return (
    <section id="faq" className="bg-white py-14">
      <div className="mx-auto grid max-w-[1240px] gap-8 px-5 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-gold-600">
            Questions
          </p>
          <h2 className="mt-2 font-heading text-[28px] font-extrabold leading-tight text-navy-500">
            What families ask us
          </h2>
          <span className="mt-3 block h-[3px] w-[80px] bg-navy-500" />
          <p className="mt-4 text-[12.5px] leading-relaxed text-navy-400">
            Still unsure? The school office answers calls on weekdays between 8:00 and 17:00.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-navy-500 px-5 py-2.5 text-[11.5px] font-bold text-white transition hover:bg-navy-600"
          >
            Contact the school
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="lg:col-span-8">
          <div className="divide-y divide-navy-100 border-y border-navy-100">
            {FAQ_ITEMS.map((item) => (
              <details key={item.question} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[13.5px] font-bold text-navy-500">
                  {item.question}
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-navy-200 text-[15px] font-normal text-navy-400 transition group-open:rotate-45 group-open:border-navy-500 group-open:text-navy-500">
                    +
                  </span>
                </summary>
                <p className="mt-2.5 max-w-[640px] text-[12.5px] leading-relaxed text-navy-400">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Compact teaser that sends visitors to the teacher directory. */
export function TeachersTeaser() {
  return (
    <section className="bg-white pb-14">
      <div className="mx-auto max-w-[1240px] px-5">
        <div className="grid items-center gap-6 rounded-xl border border-navy-100 bg-navy-50/50 p-6 sm:grid-cols-12">
          <div className="sm:col-span-8">
            <div className="flex items-center gap-2">
              <BadgeCheck size={16} className="text-navy-500" />
              <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-navy-400">
                Teaching staff
              </p>
            </div>
            <h2 className="mt-2 font-heading text-[22px] font-extrabold leading-tight text-navy-500">
              Explore every teacher, by trade
            </h2>
            <p className="mt-2 max-w-[560px] text-[12.5px] leading-relaxed text-navy-400">
              Heads of department, senior trainers and workshop instructors — with their
              qualifications, classes and full profiles.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:col-span-4 sm:justify-end">
            <Link
              href="/teachers"
              className="inline-flex items-center gap-2 rounded-full bg-navy-500 px-5 py-2.5 text-[11.5px] font-bold text-white transition hover:bg-navy-600"
            >
              Meet the teachers
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Small footer-ish strip used before the CTA with quick trust points. */
export function TrustStrip() {
  const items = [
    { icon: Award, label: 'Registered TVET school' },
    { icon: Building2, label: 'Boarding campus in Nyanza' },
    { icon: HomeIcon, label: 'Day places available' },
    { icon: ShieldCheck, label: 'Safe, disciplined environment' },
  ];
  return (
    <div className="border-y border-navy-100 bg-white">
      <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-y-3 px-5 py-4 sm:grid-cols-4">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-navy-400">
            <Icon size={13} strokeWidth={2} />
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
