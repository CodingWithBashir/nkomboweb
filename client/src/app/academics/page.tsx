'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  ArrowRight,
  Laptop,
  Wifi,
  Play,
  Car,
  Home,
  Zap,
  Briefcase,
  Wifi as Wifi2,
  BookOpen,
} from 'lucide-react';

const programs = [
  { name: 'Software Development', icon: Laptop, color: 'text-amber-500' },
  { name: 'Networking & Internet Technology', icon: Wifi, color: 'text-primary-500' },
  { name: 'Multimedia Production', icon: Play, color: 'text-purple-500' },
  { name: 'Computer System & Architecture', icon: Laptop, color: 'text-blue-500' },
  { name: 'Automobile Technology', icon: Car, color: 'text-indigo-500' },
  { name: 'Building Construction', icon: Home, color: 'text-emerald-500' },
  { name: 'Electrical Technology', icon: Zap, color: 'text-yellow-500' },
  { name: 'Tourism', icon: Briefcase, color: 'text-rose-500' },
  { name: 'Food & Beverage Operations', icon: Home, color: 'text-orange-500' },
  { name: 'Electronics & Telecommunications', icon: Wifi2, color: 'text-cyan-500' },
];

const facilities = [
  { name: 'Computer Lab', icon: Laptop },
  { name: 'Workshop', icon: Briefcase },
  { name: 'Multimedia Studio', icon: Play },
  { name: 'Science & Practical Learning', icon: BookOpen },
];

export default function AcademicsPage() {
  return (
    <div className="min-h-screen flex flex-col text-navy-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-navy-800 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544717305-2788956b906f?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-60"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/80 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 px-md-6 py-20 md:py-32 text-white">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-6 border border-amber-500/30">
              Academic Programs
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              Learn Skills.<br />
              <span className="text-amber-400">Build Your Future.</span>
            </h1>
            <p className="text-white/80 text-lg mb-10 leading-relaxed max-w-lg">
              Practical, career-focused TVET education for a brighter tomorrow.
            </p>
            <Link
              href="/admissions"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
            >
              Explore Our Programs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Academic Programs */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 px-md-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-800 mb-3">Our Academic Programs</h2>
            <p className="text-navy-600">Hands-on training in modern and in-demand fields</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {programs.map((p, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 border border-navy-100 hover:border-amber-300 hover:shadow-xl transition-all group"
              >
                <div className={`w-10 h-10 rounded-lg ${p.color}20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-navy-800 mb-2">{p.name}</h3>
                <div className="flex gap-1">
                  {['L3', 'L4', 'L5'].map((level) => (
                    <span
                      key={level}
                      className="px-2 py-0.5 rounded text-[10px] font-bold border border-navy-200 text-navy-600 bg-white"
                    >
                      {level}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Beyond the Classroom */}
      <section className="py-20 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 px-md-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-navy-800 mb-4">
                <span className="block text-amber-500 text-xs font-bold uppercase tracking-wider mb-2">
                  Learning Beyond the Classroom
                </span>
                Modern facilities for hands-on training
              </h2>
              <p className="text-navy-600 leading-relaxed mb-8">
                Modern facilities, experienced teachers, and a vibrant student life.
              </p>
              <Link
                href="/campus-life"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-800 hover:bg-navy-700 text-white rounded-lg font-bold transition-colors"
              >
                Discover Our Campus <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {facilities.map((f, i) => (
                <div key={i} className="aspect-[1] bg-white rounded-xl overflow-hidden flex items-center justify-center border border-navy-100 group-hover:border-amber-300 transition-colors">
                  <f.icon className="h-10 w-10 text-navy-500 group-hover:text-amber-500 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
