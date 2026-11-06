'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Facebook, Twitter, Youtube, Instagram } from 'lucide-react';

const topLinks = [
  { href: 'tel:+250788692199', icon: 'phone', label: '+250 788 123 456' },
  { href: 'mailto:info@lyceenyanza.rw', icon: 'mail', label: 'info@lyceenyanza.rw' },
  { href: '/contact', icon: 'map-pin', label: 'Nyanza District, Southern Province - Rwanda' },
];

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/academics', label: 'Academics' },
  { href: '/admissions', label: 'Admissions' },
  { href: '/campus-life', label: 'Campus Life' },
  { href: '/news', label: 'News & Events' },
  { href: '/holidays', label: 'Holidays' },
  { href: '/contact', label: 'Contact' },
];

const socials = [
  { href: '#', icon: Facebook },
  { href: '#', icon: Twitter },
  { href: '#', icon: Youtube },
  { href: '#', icon: Instagram },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-[60] border-b border-white/10">
      {/* Top contact bar */}
      <div className="bg-navy-900 border-b border-white/5 px-4 px-md-6 py-1.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-amber-100 md:flex-nowrap md:justify-start">
          <div className="flex items-center gap-4 md:gap-6">
            {topLinks.map((l) => (
              <a key={l.label} href={l.href} className="flex items-center gap-1.5 hover:text-white transition-colors">
                <span className="text-amber-500">{l.label}</span>
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {socials.map((s, i) => (
              <a key={i} href={s.href} className="text-amber-300 hover:text-white transition-colors">
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 px-md-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 border border-white/20">
                <span className="text-white font-extrabold tracking-tighter text-xl">LN</span>
              </div>
              <div className="text-left">
                <span className="block text-amber-500 font-bold text-lg tracking-tight">Lycée de Nyanza</span>
                <span className="block text-[10px] text-white/70 uppercase tracking-wider font-medium">Excellence Through Discipline</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-white/80 uppercase tracking-wider">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-amber-400 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <a href="/login" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-bold transition-colors">
                Student Portal
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-white/80"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-navy-800 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-white/80 hover:text-amber-400 transition-colors uppercase text-xs font-semibold tracking-wider"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="/login"
              className="block py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white text-center rounded text-xs font-bold transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Student Portal
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
