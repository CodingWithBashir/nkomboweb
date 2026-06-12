import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  BookOpen, Users, Trophy, Calendar, Newspaper, 
  ArrowRight, GraduationCap, Target, Heart 
} from 'lucide-react';

const features = [
  { icon: BookOpen, title: 'Academics', description: 'Quality education for all levels with experienced teachers.', color: 'bg-blue-500', href: '/academics' },
  { icon: Users, title: 'Admissions', description: 'Apply and join our school community.', color: 'bg-green-500', href: '/admissions' },
  { icon: Trophy, title: 'Campus Life', description: 'Clubs, sports, and activities.', color: 'bg-purple-500', href: '/campus-life' },
  { icon: Calendar, title: 'Holidays', description: 'Access holiday materials online.', color: 'bg-orange-500', href: '/holidays' },
  { icon: Newspaper, title: 'News & Events', description: 'Latest school news and events.', color: 'bg-red-500', href: '/news' },
];

const newsItems = [
  { title: 'New Library Opened', date: '10 Jun 2026', category: 'General' },
  { title: 'Sports Day Results', date: '08 Jun 2026', category: 'Sports' },
  { title: 'Exam Schedule Released', date: '05 Jun 2026', category: 'Academic' },
];

const upcomingEvents = [
  { title: 'Sports Day', date: '24 May 2026', location: 'School Field' },
  { title: 'Parents Meeting', date: '30 May 2026', location: 'Main Hall' },
  { title: 'Award Ceremony', date: '15 Jun 2026', location: 'Auditorium' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-navy-700 to-primary-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Inspiring Minds.<br />Shaping Futures.
              </h1>
              <p className="text-xl text-gray-200 mb-8">
                Empowering students with quality education, values and a brighter tomorrow.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/admissions" className="bg-white text-navy-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center">
                  Apply Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link href="/about" className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                  Explore More
                </Link>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <GraduationCap className="h-48 w-48 text-white/80" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { icon: Users, label: 'Students', value: '1,245', sub: 'Active Students' },
              { icon: GraduationCap, label: 'Teachers', value: '86', sub: 'Dedicated Staff' },
              { icon: BookOpen, label: 'Classes', value: '36', sub: 'Across All Levels' },
              { icon: Calendar, label: 'Upcoming Event', value: 'Sports Day', sub: '24 May 2026' },
              { icon: Newspaper, label: 'Latest News', value: 'New Library', sub: 'Read More' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <stat.icon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="font-bold text-navy-700">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-700 mb-4">Welcome to GS Nkombo</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover what makes GS Nkombo a leading secondary school committed to excellence.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {features.map((f, i) => (
              <Link key={i} href={f.href} className="bg-white p-6 rounded-xl hover:shadow-lg transition-all text-center group">
                <div className={`${f.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-navy-700 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-navy-700 mb-6">About GS Nkombo</h2>
              <p className="text-gray-600 mb-4">
                GS Nkombo Secondary School is a leading educational institution committed to providing quality education and shaping the leaders of tomorrow.
              </p>
              <p className="text-gray-600 mb-6">
                With state-of-the-art facilities, experienced teachers, and a vibrant campus life, we offer a complete educational experience.
              </p>
              <Link href="/about" className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700">
                Learn More <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            <div className="bg-gradient-to-br from-primary-500 to-navy-600 rounded-2xl p-8 text-white">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center"><p className="text-4xl font-bold">1,245</p><p className="text-gray-200">Students</p></div>
                <div className="text-center"><p className="text-4xl font-bold">86</p><p className="text-gray-200">Teachers</p></div>
                <div className="text-center"><p className="text-4xl font-bold">36</p><p className="text-gray-200">Classes</p></div>
                <div className="text-center"><p className="text-4xl font-bold">15+</p><p className="text-gray-200">Years</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-navy-700">Latest News</h2>
            <Link href="/news" className="text-primary-600 font-semibold hover:text-primary-700 flex items-center">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {newsItems.map((news, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-primary-400 to-navy-500 flex items-center justify-center">
                  <Newspaper className="h-16 w-16 text-white/50" />
                </div>
                <div className="p-6">
                  <span className="text-xs font-semibold text-primary-600 bg-primary-100 px-2 py-1 rounded">{news.category}</span>
                  <h3 className="font-semibold text-navy-700 mt-3 mb-2">{news.title}</h3>
                  <p className="text-sm text-gray-500">{news.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-navy-700">Upcoming Events</h2>
            <Link href="/news" className="text-primary-600 font-semibold hover:text-primary-700 flex items-center">
              View Calendar <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {upcomingEvents.map((event, i) => (
              <div key={i} className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-100 p-3 rounded-lg">
                    <Calendar className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-700">{event.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{event.date}</p>
                    <p className="text-sm text-gray-400">{event.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-navy-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join GS Nkombo?</h2>
          <p className="text-xl text-gray-200 mb-8">Begin your journey to academic excellence.</p>
          <div className="flex justify-center gap-4">
            <Link href="/admissions" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">Apply Now</Link>
            <Link href="/contact" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">Contact Us</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
