import Link from 'next/link';
import {
  ArrowRight,
  Code2,
  Network,
  Video,
  Car,
  ClipboardList,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const heroOverlay =
  'linear-gradient(90deg, #0a2540 0%, #0a2540 34%, rgba(10,37,64,0.94) 48%, rgba(10,37,64,0.55) 72%, rgba(10,37,64,0.15) 100%)';

const programs = [
  { title: 'Software Development', icon: Code2 },
  { title: 'Networking & Internet Technology', icon: Network },
  { title: 'Multimedia Production', icon: Video },
  { title: 'Automobile Technology', icon: Car },
];

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

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-[2.5px] w-7 bg-gold-400" />
      <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-navy-500">
        {children}
      </span>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        {/* ------------------------------- HERO ------------------------------- */}
        <section className="relative isolate overflow-hidden bg-navy-500">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-students.jpg"
            alt="Lycée de Nyanza students working on laptops"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0" style={{ background: heroOverlay }} />

          <div className="relative mx-auto flex min-h-[500px] max-w-[1240px] items-center px-5 py-16">
            <div className="max-w-[620px]">
              <h1 className="font-heading text-[42px] font-extrabold leading-[1.08] text-white sm:text-[54px]">
                Building Skills.
                <br />
                <span className="text-gold-400">Shaping Tomorrow.</span>
              </h1>
              <span className="mt-6 block h-[3px] w-[92px] bg-gold-400" />
              <p className="mt-6 max-w-[500px] text-[14.5px] leading-relaxed text-white/90">
                Welcome to Lycée de Nyanza, a place where knowledge, discipline and innovation
                come together to build a brighter future.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/about"
                  className="flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-[12.5px] font-bold text-navy-500 transition hover:bg-gold-500"
                >
                  Explore Our School
                  <ArrowRight size={15} />
                </Link>
                <Link
                  href="/academics"
                  className="flex items-center gap-2 rounded-full border border-white/90 px-6 py-3 text-[12.5px] font-bold text-white transition hover:bg-white hover:text-navy-500"
                >
                  Explore Programs
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------ ABOUT + OUR PROGRAMS ----------------------- */}
        <section className="bg-white py-14">
          <div className="mx-auto grid max-w-[1240px] items-start gap-x-12 gap-y-12 px-5 lg:grid-cols-12">
            {/* about */}
            <div className="lg:col-span-5">
              <div className="flex gap-5">
                <div className="relative w-[46%] shrink-0 overflow-hidden rounded-md">
                  <span className="absolute inset-y-0 left-0 z-10 w-[5px] bg-gold-400" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/school-building.jpg"
                    alt="Lycée de Nyanza campus"
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
                {programs.map(({ title, icon: Icon }) => (
                  <Link
                    key={title}
                    href="/academics"
                    className="group flex flex-col items-center rounded-lg border border-navy-50 bg-white px-3 py-6 text-center shadow-card transition hover:-translate-y-1 hover:shadow-soft"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-navy-100 text-navy-500 transition group-hover:border-gold-400 group-hover:text-gold-500">
                      <Icon size={22} strokeWidth={1.7} />
                    </span>
                    <span className="mt-3.5 text-[12px] font-bold leading-snug text-navy-500">
                      {title}
                    </span>
                    <span className="mt-2.5 h-[2.5px] w-8 rounded-full bg-gold-400" />
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
              <Eyebrow>
                <span className="text-gold-400">Campus Life</span>
              </Eyebrow>
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
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-[12.5px] font-bold text-navy-500 transition hover:bg-gold-500"
              >
                Discover Campus Life
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-1 pb-10 lg:pb-0 xl:-mr-[calc((100vw-1240px)/2)]">
              {campusImages.map((image) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={image.src}
                  src={image.src}
                  alt={image.alt}
                  className="h-[260px] w-full object-cover lg:h-[320px]"
                />
              ))}
            </div>
          </div>
        </section>

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
                className="flex items-center gap-2 rounded-md bg-navy-500 px-5 py-2.5 text-[12px] font-bold text-white transition hover:bg-navy-600"
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
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
                      className="mt-3.5 inline-flex items-center gap-2 text-[11.5px] font-bold text-navy-500 transition hover:text-gold-500"
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

        {/* ------------------------------- CTA -------------------------------- */}
        <section className="bg-white pb-14">
          <div className="mx-auto max-w-[1240px] px-5">
            <div className="relative overflow-hidden rounded-xl bg-navy-500">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/news-guidance.jpg"
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-25"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-navy-500 via-navy-500/90 to-navy-500/40" />

              <div className="relative flex flex-wrap items-center justify-between gap-6 px-8 py-7">
                <div className="flex items-center gap-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-white/30 bg-white/10 text-white">
                    <ClipboardList size={24} strokeWidth={1.7} />
                  </span>
                  <span className="hidden h-12 w-px bg-white/30 sm:block" />
                  <div>
                    <h3 className="font-heading text-[21px] font-extrabold text-white">
                      Ready to Join Our School?
                    </h3>
                    <p className="mt-1 text-[12.5px] text-white/85">
                      Apply today and be part of the Lycée de Nyanza family.
                    </p>
                  </div>
                </div>
                <Link
                  href="/admissions"
                  className="flex items-center gap-2 rounded-full bg-gold-400 px-7 py-3 text-[12.5px] font-bold text-navy-500 transition hover:bg-gold-500"
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
