'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BookOpen, Award, Users, FileText, ChevronRight } from 'lucide-react';

const oLevelClasses = [
  { name: 'S1', subjects: ['Mathematics', 'English', 'Science', 'Social Studies', 'Agriculture', 'Computer Studies'] },
  { name: 'S2', subjects: ['Mathematics', 'English', 'Science', 'Social Studies', 'Agriculture', 'Computer Studies'] },
  { name: 'S3', subjects: ['Mathematics', 'English', 'Science', 'Social Studies', 'Agriculture', 'Computer Studies'] },
];

const aLevelClasses = [
  { name: 'S4', streams: ['Science', 'Arts', 'Commerce'] },
  { name: 'S5', streams: ['Science', 'Arts', 'Commerce'] },
  { name: 'S6', streams: ['Science', 'Arts', 'Commerce'] },
];

const scienceSubjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];
const artsSubjects = ['Literature', 'History', 'Geography', 'Divinity', 'French'];
const commerceSubjects = ['Economics', 'Accounting', 'Business Studies', 'Mathematics'];

const features = [
  { icon: Award, title: 'Excellent Results', description: 'Consistently achieving above national average in examinations' },
  { icon: Users, title: 'Qualified Teachers', description: 'Experienced and dedicated teaching staff' },
  { icon: BookOpen, title: 'Modern Curriculum', description: 'Up-to-date curriculum aligned with national standards' },
  { icon: FileText, title: 'Comprehensive Materials', description: 'Well-equipped library and digital resources' },
];

export default function AcademicsPage() {
  const [activeTab, setActiveTab] = useState<'olevel' | 'alevel'>('olevel');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedStream, setSelectedStream] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-navy-700 to-primary-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Academics</h1>
          <p className="text-xl text-gray-200">
            Explore our comprehensive academic programs designed for excellence.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50">
        {/* Features Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="text-center p-6">
                  <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-navy-700 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Programs Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-navy-700 mb-8 text-center">Our Programs</h2>
            
            {/* Tabs */}
            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => { setActiveTab('olevel'); setSelectedClass(null); setSelectedStream(null); }}
                  className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                    activeTab === 'olevel'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  O&apos; Level (S1-S3)
                </button>
                <button
                  onClick={() => { setActiveTab('alevel'); setSelectedClass(null); setSelectedStream(null); }}
                  className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                    activeTab === 'alevel'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  A&apos; Level (S4-S6)
                </button>
              </div>
            </div>

            {/* O-Level Content */}
            {activeTab === 'olevel' && (
              <div className="grid md:grid-cols-3 gap-6">
                {oLevelClasses.map((cls) => (
                  <div
                    key={cls.name}
                    className={`bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                      selectedClass === cls.name ? 'ring-2 ring-primary-500' : ''
                    }`}
                    onClick={() => setSelectedClass(cls.name)}
                  >
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4">
                      <h3 className="text-xl font-bold">{cls.name}</h3>
                      <p className="text-primary-100 text-sm">O&apos; Level</p>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-navy-700 mb-3">Subjects Offered</h4>
                      <ul className="space-y-2">
                        {cls.subjects.map((subject) => (
                          <li key={subject} className="flex items-center text-gray-600 text-sm">
                            <ChevronRight className="h-4 w-4 text-primary-500 mr-2" />
                            {subject}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* A-Level Content */}
            {activeTab === 'alevel' && (
              <div>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {aLevelClasses.map((cls) => (
                    <div
                      key={cls.name}
                      className={`bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                        selectedClass === cls.name ? 'ring-2 ring-primary-500' : ''
                      }`}
                      onClick={() => setSelectedClass(cls.name)}
                    >
                      <div className="bg-gradient-to-r from-navy-600 to-navy-700 text-white p-4">
                        <h3 className="text-xl font-bold">{cls.name}</h3>
                        <p className="text-navy-200 text-sm">A&apos; Level</p>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-navy-700 mb-3">Streams Available</h4>
                        <div className="flex flex-wrap gap-2">
                          {cls.streams.map((stream) => (
                            <span
                              key={stream}
                              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                            >
                              {stream}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stream Subjects */}
                {selectedClass && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-xl font-bold text-navy-700 mb-4">
                      {selectedClass} - Subjects by Stream
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-semibold text-blue-600 mb-3">Science Stream</h4>
                        <ul className="space-y-2">
                          {scienceSubjects.map((subject) => (
                            <li key={subject} className="flex items-center text-gray-600 text-sm">
                              <ChevronRight className="h-4 w-4 text-blue-500 mr-2" />
                              {subject}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-purple-600 mb-3">Arts Stream</h4>
                        <ul className="space-y-2">
                          {artsSubjects.map((subject) => (
                            <li key={subject} className="flex items-center text-gray-600 text-sm">
                              <ChevronRight className="h-4 w-4 text-purple-500 mr-2" />
                              {subject}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-600 mb-3">Commerce Stream</h4>
                        <ul className="space-y-2">
                          {commerceSubjects.map((subject) => (
                            <li key={subject} className="flex items-center text-gray-600 text-sm">
                              <ChevronRight className="h-4 w-4 text-green-500 mr-2" />
                              {subject}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Academic Performance Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-navy-700 mb-8 text-center">Academic Performance</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white text-center">
                <p className="text-5xl font-bold mb-2">92%</p>
                <p className="text-green-100">Pass Rate</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white text-center">
                <p className="text-5xl font-bold mb-2">15+</p>
                <p className="text-blue-100">Subjects Offered</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white text-center">
                <p className="text-5xl font-bold mb-2">50+</p>
                <p className="text-purple-100">Qualified Teachers</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
