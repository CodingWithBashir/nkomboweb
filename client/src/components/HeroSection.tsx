import Link from 'next/link';
import { ArrowRight, GraduationCap } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-navy-700 to-primary-600 text-white overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Excellence in Education.<br />Building Future Leaders.
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Empowering students with quality education, values and a brighter tomorrow.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/admissions"
                className="bg-white text-navy-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center"
              >
                Apply Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/about"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Explore More
              </Link>
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <GraduationCap className="h-48 w-48 text-white/80" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
