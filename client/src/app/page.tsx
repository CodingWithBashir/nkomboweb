import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  BookOpen,
  Users,
  Trophy,
  Calendar,
  Newspaper,
  ArrowRight,
  Laptop,
  Wifi,
  Play,
  Car,
} from 'lucide-react';

const heroImage =
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80';

const programCards = [
  {
    title: 'Software Development',
    icon: Laptop,
    color: 'bg-amber-500/10 text-amber-500',
  },
  {
    title: 'Networking & Internet Technology',
    icon: Wifi,
    color: 'bg-primary-500/10 text-primary-500',
  },
  {
    title: 'Multimedia Production',
    icon: Play,
    color: 'bg-purple-500/10 text-purple-500',
  },
  {
    title: 'Automobile Technology',
    icon: Car,
    color: 'bg-blue-500/10 text-blue-500',
  },
];

const newsItems = [
  {
    title: 'Admission for the 2025–2026 Academic Year is Open',
    date: 'Apr 25, 2025',
    image:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Career Guidance Session for Our Students',
    date: 'Apr 15, 2025',
    image:
      'https://images.unsplash.com/photo-1544717305-2788956b906f?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Celebrating Excellence at Lycée de Nyanza',
    date: 'Apr 10, 2025',
    image:
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col text-navy-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-navy-800 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-60"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/80 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 px-md-6 py-20 md:py-32 text-white">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-6 border border-amber-500/30">
              Excellence Through Discipline
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              Building Skills.<br />
              <span className="text-amber-400">Shaping Tomorrow.</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl mb-10 leading-relaxed max-w-lg">
              Welcome to Lycée de Nyanza, a place where knowledge, discipline and innovation come
              together to build a brighter future.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/about"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
              >
                Explore Our School <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/academics"
                className="px-6 py-3 border-2 border-white/30 hover:border-amber-400 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
              >
                Explore Programs <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Our School */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 px-md-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img
                src={heroImage}
                alt="Lycée de Nyanza school building"
                className="w-full h-64 md:h-auto rounded-xl shadow-xl object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-amber-500 px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 z-10">
                <span className="text-white font-bold">LN</span>
                <span className="text-white text-sm font-semibold">Lycée de Nyanza</span>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-navy-800 mb-4">About Our School</h2>
              <p className="text-navy-600 text-lg mb-6 leading-relaxed">
                Lycée de Nyanza is a private boarding Technical Secondary School located in Nyanza
                District, Southern Province, Rwanda. We are committed to providing quality education,
                technical skills and moral values for a successful future.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-800 hover:bg-navy-700 text-white rounded-lg font-bold transition-colors"
              >
                Learn More <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Programs */}
      <section className="py-20 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 px-md-6">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 text-xs font-bold uppercase tracking-wider mb-3 border border-amber-200">
              Our Programs
            </span>
            <h2 className="text-3xl font-bold text-navy-800 mb-3">Diverse Programs for Your Future</h2>
            <p className="text-navy-600">Hands-on training in modern and in-demand fields</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programCards.map((p, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 border border-white/50 hover:border-amber-200 hover:shadow-lg transition-all group"
              >
                <div className={`w-12 h-12 rounded-lg ${p.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <p.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-navy-800 mb-2">{p.title}</h3>
                <p className="text-navy-500 text-sm">
                  Practical, career-focused training for a brighter tomorrow.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Campus Life */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 px-md-6">
          <div className="grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 order-2 md:order-1">
              <h2 className="text-3xl font-bold text-navy-800 mb-4">
                <span className="block text-amber-500 text-xs font-bold uppercase tracking-wider mb-2">
                  Campus Life
                </span>
                A Supportive and Inspiring Environment
              </h2>
              <p className="text-navy-600 leading-relaxed mb-8">
                Experience a vibrant campus life with modern facilities, extracurricular activities
                and a caring community.
              </p>
              <Link
                href="/campus-life"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-800 hover:bg-navy-700 text-white rounded-lg font-bold transition-colors"
              >
                Discover Campus Life <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="md:col-span-7 order-1 md:order-2 grid grid-cols-3 gap-4">
              <div className="aspect-[4/3] bg-navy-100 rounded-xl overflow-hidden flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-navy-500" />
              </div>
              <div className="aspect-[4/3] bg-navy-100 rounded-xl overflow-hidden flex items-center justify-center">
                <Users className="h-12 w-12 text-navy-500" />
              </div>
              <div className="aspect-[4/3] bg-navy-100 rounded-xl overflow-hidden flex items-center justify-center">
                <Trophy className="h-12 w-12 text-navy-500" />
              </div>
              <div className="md:col-span-2 aspect-[3/2] bg-navy-100 rounded-xl overflow-hidden flex items-center justify-center">
                <Calendar className="h-14 w-14 text-navy-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News & Events */}
      <section className="py-20 bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 px-md-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3 border border-amber-500/30">
                Latest News & Events
              </span>
              <h2 className="text-3xl font-bold mb-3">Stay Informed</h2>
            </div>
            <Link
              href="/news"
              className="px-5 py-2.5 border border-white/30 hover:bg-white hover:text-navy-900 text-white rounded-lg font-bold transition-colors"
            >
              View All News <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {newsItems.map((news, i) => (
              <article key={i} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-amber-500/50 transition-colors group">
                <div className="h-36 rounded-lg overflow-hidden mb-4">
                  <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 block">
                  {news.date}
                </span>
                <h3 className="text-lg font-bold mb-3 group-hover:text-amber-400 transition-colors">
                  {news.title}
                </h3>
                <Link href="/news" className="text-sm font-semibold text-amber-400 flex items-center gap-1 hover:text-amber-300">
                  Read More <ArrowRight className="h-3 w-3" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy-800">
        <div className="max-w-7xl mx-auto px-4 px-md-6">
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Join Our School?</h2>
            <p className="text-white/70 text-lg mb-8">
              Apply today and be part of the Lycée de Nyanza family.
            </p>
            <Link
              href="/admissions"
              className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition-colors inline-block"
            >
              Start Your Admission <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
