import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, pageMetadata, webPageJsonLd } from '@/lib/seo';
import { Users, Award, BookOpen, Target, Heart } from 'lucide-react';
import { headTeachers } from '@/data/leadership';

const pageTitle = 'About Our School';
const pageDescription =
  'Learn about Lycée de Nyanza — our history, mission, vision, core values and leadership team at a private boarding technical secondary school in Nyanza District, Rwanda.';

export const metadata: Metadata = pageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/about',
  keywords: [
    'about Lycée de Nyanza',
    'school history Rwanda',
    'school mission and vision',
    'Nyanza District secondary school',
  ],
});

const values = [
  { icon: Target, title: 'Excellence', description: 'Striving for the highest standards in everything we do.' },
  { icon: Heart, title: 'Integrity', description: 'Building trust through honesty and transparency.' },
  { icon: Users, title: 'Community', description: 'Fostering a supportive and inclusive environment.' },
  { icon: Award, title: 'Achievement', description: 'Celebrating success and encouraging growth.' },
];


export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <JsonLd
        data={[
          webPageJsonLd({ title: pageTitle, description: pageDescription, path: '/about' }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' },
          ]),
        ]}
      />
      <Navbar />

      <main id="main-content">

      {/* Page Header */}
      <div className="bg-gradient-to-r from-navy-700 to-primary-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">About Lycée de Nyanza</h1>
          <p className="text-xl text-gray-200">
            Learn about our history, mission, and commitment to excellence.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* History Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-navy-700 mb-6">Our History</h2>
                <p className="text-gray-600 mb-4">
                  Lycée de Nyanza was established with a vision to provide quality education
                  to students in the community. Over the years, we have grown to become one of the
                  leading secondary schools in the region.
                </p>
                <p className="text-gray-600 mb-4">
                  Our commitment to academic excellence, combined with a focus on holistic development,
                  has produced countless graduates who have gone on to excel in various fields.
                </p>
                <p className="text-gray-600">
                  Today, Lycée de Nyanza stands as a beacon of hope for families seeking quality education
                  that prepares students for the challenges of tomorrow.
                </p>
              </div>
              <div className="bg-gradient-to-br from-primary-500 to-navy-600 rounded-2xl p-8 text-white">
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <p className="text-4xl font-bold">15+</p>
                    <p className="text-gray-200">Years of Excellence</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold">5,000+</p>
                    <p className="text-gray-200">Alumni Worldwide</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold">92%</p>
                    <p className="text-gray-200">Pass Rate</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold">50+</p>
                    <p className="text-gray-200">Qualified Teachers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-navy-700 mb-4">Our Mission</h3>
                <p className="text-gray-600">
                  To provide quality education that empowers students with knowledge, skills, and values
                  necessary for personal growth and societal development. We strive to create a
                  conducive learning environment that fosters critical thinking, creativity, and leadership.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-navy-700 mb-4">Our Vision</h3>
                <p className="text-gray-600">
                  To be a leading secondary school that produces well-rounded individuals equipped
                  with academic excellence, moral values, and practical skills to contribute positively
                  to the nation and the world at large.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-navy-700 mb-8 text-center">Our Core Values</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div key={index} className="text-center p-6">
                  <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-navy-700 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Leadership Team */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-navy-700 mb-8 text-center">Head Teachers</h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {headTeachers.map((member) => (
                <div key={member.name} className="flex flex-col items-center text-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white ring-1 ring-navy-200">
                    <span className="font-heading text-[24px] font-extrabold tracking-[-0.03em] text-navy-500">
                      {member.initials}
                    </span>
                  </div>
                  <h3 className="mt-3 font-semibold text-navy-700">{member.name}</h3>
                  <p className="text-sm text-navy-400">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      </main>

      <Footer />
    </div>
  );
}
