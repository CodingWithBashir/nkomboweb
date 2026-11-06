import Link from 'next/link';
import { Facebook, Twitter, Youtube, Instagram, MapPin, Phone, Mail } from 'lucide-react';

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/academics', label: 'Academics' },
  { href: '/admissions', label: 'Admissions' },
  { href: '/campus-life', label: 'Campus Life' },
  { href: '/news', label: 'News & Events' },
  { href: '/holidays', label: 'Holidays' },
  { href: '/contact', label: 'Contact' },
];

const contactInfo = [
  { icon: Phone, label: '+250 788 123 456' },
  { icon: Mail, label: 'info@lyceenyanza.rw' },
  { icon: MapPin, label: 'Nyanza District, Rwanda' },
];

const socials = [
  { href: '#', icon: Facebook },
  { href: '#', icon: Twitter },
  { href: '#', icon: Youtube },
  { href: '#', icon: Instagram },
];

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 px-md-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* School info */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 border border-white/20">
                <span className="text-white font-extrabold tracking-tighter text-xl">LN</span>
              </div>
              <div className="text-left">
                <span className="block text-amber-500 font-bold text-lg tracking-tight">Lycée de Nyanza</span>
                <span className="block text-[10px] text-white/70 uppercase tracking-wider font-medium">Excellence Through Discipline</span>
              </div>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              A premier secondary school in Nyanza District, Southern Province, Rwanda, offering academic
              and technical programs with excellence in education and discipline.
            </p>
            <div className="flex gap-4">
              {socials.map((s, i) => (
                <a key={i} href={s.href} className="w-8 h-8 rounded bg-white/10 flex items-center justify-center hover:bg-amber-500 transition-colors">
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-amber-400 font-bold text-sm uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-white/70 text-sm hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-amber-400 font-bold text-sm uppercase tracking-wider mb-4">Contact Us</h3>
            <ul className="space-y-2">
              {contactInfo.map((c, i) => (
                <li key={i} className="flex items-start gap-2.5 text-white/70 text-sm">
                  <c.icon className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>{c.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Stay Connected */}
          <div>
            <h3 className="text-amber-400 font-bold text-sm uppercase tracking-wider mb-4">Stay Connected</h3>
            <p className="text-white/60 text-sm mb-4">Follow us for updates</p>
            <div className="flex gap-3">
              {socials.map((s, i) => (
                <a key={i} href={s.href} className="w-8 h-8 rounded bg-white/10 flex items-center justify-center hover:bg-amber-500 transition-colors">
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Lycée de Nyanza. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
