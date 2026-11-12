'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Mail, MapPin, Facebook, Youtube, Linkedin } from 'lucide-react';
import Logo, { Crest } from './Logo';
import { SCHOOL } from './Navbar';

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Academics', href: '/academics' },
  { label: 'Teachers', href: '/teachers' },
  { label: 'Admissions', href: '/admissions' },
  { label: 'Campus Life', href: '/campus-life' },
  { label: 'News & Events', href: '/news' },
  { label: 'Holidays', href: '/holidays' },
  { label: 'Verify a certificate', href: '/verify' },
  { label: 'Contact', href: '/contact' },
];

const SOCIALS = [
  { Icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { Icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
  { Icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
];

export default function Footer() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  if (!isHome) {
    /* ---------- compact footer (inner pages) ---------- */
    const isHolidays = pathname === '/holidays';

    return (
      <footer className="bg-navy-500 text-white">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-5 px-5 py-4">
          <Logo variant="light" showTagline className="origin-left scale-90" />

          {isHolidays ? (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[11.5px] text-white/85">
              <span className="flex items-center gap-1.5">
                <MapPin size={12} className="text-gold-400" />
                Nyanza, Rwanda
              </span>
              <span className="flex items-center gap-1.5">
                <Phone size={12} className="text-gold-400" />
                {SCHOOL.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail size={12} className="text-gold-400" />
                {SCHOOL.email}
              </span>
            </div>
          ) : (
            <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-medium text-white/85">
              {QUICK_LINKS.map((link, i) => (
                <span key={link.href} className="flex items-center gap-3">
                  <Link href={link.href} className="transition hover:text-gold-400">
                    {link.label}
                  </Link>
                  {i < QUICK_LINKS.length - 1 && <span className="text-white/25">|</span>}
                </span>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {SOCIALS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white/30 text-white transition hover:border-gold-400 hover:bg-gold-400 hover:text-white"
                >
                  <Icon size={13} />
                </a>
              ))}
            </div>
            <span className="h-5 w-px bg-white/25" />
            <p className="text-[11px] text-white/70">
              &copy; 2025 Lyc&eacute;e de Nyanza. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    );
  }

  /* ---------- full footer (home page) ---------- */
  return (
    <footer className="bg-navy-600 text-white">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-12 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="flex items-center gap-3">
            <Crest variant="light" size={62} />
            <span className="flex flex-col leading-none">
              <span className="font-heading text-[21px] font-extrabold uppercase text-white">
                Lyc&eacute;e de Nyanza
              </span>
              <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-400">
                Excellence Through Discipline
              </span>
            </span>
          </div>
        </div>

        <div className="lg:col-span-3">
          <h3 className="font-heading text-[13px] font-bold uppercase tracking-wide text-white">
            Quick Links
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] text-white/75 transition hover:text-gold-400"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <h3 className="font-heading text-[13px] font-bold uppercase tracking-wide text-white">
            Contact Us
          </h3>
          <ul className="mt-4 space-y-3 text-[13px] text-white/75">
            <li className="flex items-center gap-2.5">
              <Phone size={14} className="text-gold-400" />
              {SCHOOL.phone}
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={14} className="text-gold-400" />
              {SCHOOL.email}
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin size={14} className="text-gold-400" />
              Nyanza District, Rwanda
            </li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h3 className="font-heading text-[13px] font-bold uppercase tracking-wide text-white">
            Stay Connected
          </h3>
          <p className="mt-4 text-[13px] text-white/75">Follow for updates</p>
          <div className="mt-3 flex items-center gap-2">
            {SOCIALS.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-white transition hover:border-gold-400 hover:bg-gold-400 hover:text-white"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gold-400/70">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-2 px-5 py-4 text-[12px]">
          <p className="text-white/70">&copy; 2025 Lyc&eacute;e de Nyanza. All rights reserved.</p>
          <p className="font-medium italic text-gold-400">Excellence Through Discipline</p>
        </div>
      </div>
    </footer>
  );
}
