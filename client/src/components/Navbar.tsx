'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Youtube,
  Linkedin,
  ChevronDown,
  UserRound,
  Menu,
  X,
} from 'lucide-react';
import Logo from './Logo';
import { SCHOOL } from '@/lib/school';

// re-exported for consumers that imported it from here
export { SCHOOL };

const NAV_ITEMS = [
  { label: 'Home', href: '/', caret: false },
  { label: 'About', href: '/about', caret: true },
  { label: 'Academics', href: '/academics', caret: true },
  { label: 'Teachers', href: '/teachers', caret: false },
  { label: 'Students', href: '/students', caret: false },
  { label: 'Admissions', href: '/admissions', caret: true },
  { label: 'Campus', href: '/campus-life', caret: true },
  { label: 'News', href: '/news', caret: true },
  { label: 'Holidays', href: '/holidays', caret: false },
  { label: 'Contact', href: '/contact', caret: false },
];

function SocialIcons({ className = '' }: { className?: string }) {
  const items = [
    { Icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { Icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
    { Icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  ];
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {items.map(({ Icon, href, label }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-gold-400 hover:text-white"
        >
          <Icon size={12} strokeWidth={2.2} />
        </a>
      ))}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isHome = pathname === '/';

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50">
      {isHome ? (
        /* ---------- Home: white navigation with navy contact bar ---------- */
        <>
          <div className="bg-navy-500 text-white">
            <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-y-1 px-5 py-2 text-[11.5px]">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-white/85">
                <span className="flex items-center gap-1.5">
                  <Phone size={12} className="text-gold-400" />
                  {SCHOOL.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail size={12} className="text-gold-400" />
                  {SCHOOL.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-gold-400" />
                  {SCHOOL.location}
                </span>
              </div>
              <SocialIcons />
            </div>
          </div>

          <div className="border-b border-navy-100 bg-white shadow-sm">
            <div className="mx-auto flex h-[72px] max-w-[1240px] items-center gap-3 px-5">
              <div className="shrink-0">
                <Logo variant="dark" />
              </div>

              <nav
                aria-label="Main navigation"
                className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 xl:flex"
              >
                {NAV_ITEMS.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={`flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full px-2 py-2 text-[11.5px] font-semibold leading-none transition ${
                        active
                          ? 'bg-gold-500 text-white shadow-sm'
                          : 'text-navy-500 hover:bg-navy-50 hover:text-navy-600'
                      }`}
                    >
                      {item.label}
                      {item.caret && (
                        <ChevronDown
                          size={13}
                          className={active ? 'text-white/80' : 'text-navy-300'}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href="/login"
                  className="hidden items-center gap-1.5 whitespace-nowrap rounded-full bg-gold-500 px-3.5 py-2.5 text-[12px] font-bold leading-none text-white shadow-sm transition hover:bg-gold-600 sm:flex"
                >
                  <UserRound size={15} strokeWidth={2.4} />
                  Student Portal
                </Link>
                <button
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  aria-label="Toggle menu"
                  className="rounded-md p-2 text-navy-500 xl:hidden"
                >
                  {open ? <X size={22} /> : <Menu size={22} />}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ---------- Inner pages: navy navigation ---------- */
        <div className="bg-navy-500">
          <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-3">
            <div className="shrink-0">
              <Logo variant="light" />
            </div>

            <div className="hidden items-center gap-5 text-[12px] text-white/90 lg:flex">
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-gold-400" />
                {SCHOOL.shortLocation}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone size={13} className="text-gold-400" />
                {SCHOOL.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail size={13} className="text-gold-400" />
                {SCHOOL.email}
              </span>
              <span className="h-5 w-px bg-white/20" />
              <SocialIcons />
            </div>
          </div>

          <div className="border-t border-white/10">
            <div className="mx-auto flex h-[52px] max-w-[1240px] items-center gap-4 px-5">
              <nav
                aria-label="Main navigation"
                className="hidden min-w-0 flex-1 items-center justify-start gap-1 xl:flex"
              >
                {NAV_ITEMS.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={`relative flex h-[52px] shrink-0 items-center gap-1 whitespace-nowrap px-2 text-[12px] font-semibold leading-none transition ${
                        active ? 'text-gold-300' : 'text-white/85 hover:text-gold-300'
                      }`}
                    >
                      {item.label}
                      {item.caret && <ChevronDown size={12} />}
                      {active && (
                        <span className="absolute inset-x-0 bottom-0 h-[2.5px] bg-gold-400" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex items-center gap-2 xl:ml-auto">
                <Link
                  href="/login"
                  className="hidden items-center gap-2 rounded-full bg-gold-500 px-5 py-2 text-[13px] font-bold text-white transition hover:bg-gold-600 sm:flex"
                >
                  <UserRound size={15} strokeWidth={2.4} />
                  Student Portal
                </Link>
                <button
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  aria-label="Toggle menu"
                  className="rounded-md p-2 text-white xl:hidden"
                >
                  {open ? <X size={22} /> : <Menu size={22} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* mobile drawer */}
      {open && (
        <div className="border-t border-navy-100 bg-white shadow-lg xl:hidden">
          <nav aria-label="Mobile navigation" className="mx-auto grid max-w-[1240px] gap-1 px-5 py-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-2.5 text-sm font-semibold ${
                  isActive(item.href)
                    ? 'bg-navy-50 text-navy-500'
                    : 'text-navy-400 hover:bg-navy-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-white"
            >
              <UserRound size={15} />
              Student Portal
            </Link>
            <div className="mt-3 flex flex-col gap-1.5 border-t border-navy-100 pt-3 text-xs text-navy-400">
              <span className="flex items-center gap-2">
                <Phone size={12} className="text-navy-400" /> {SCHOOL.phone}
              </span>
              <span className="flex items-center gap-2">
                <Mail size={12} className="text-navy-400" /> {SCHOOL.email}
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={12} className="text-navy-400" /> {SCHOOL.location}
              </span>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
