'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Trophy, Users, Calendar, MapPin, ChevronRight } from 'lucide-react';

const sports = [
  { name: 'Football', description: 'Our football team competes in regional tournaments and has won multiple championships.', players: 25 },
  { name: 'Volleyball', description: 'Mixed volleyball teams for both boys and girls with regular practice sessions.', players: 20 },
  { name: 'Basketball', description: 'Indoor and outdoor basketball programs for all skill levels.', players: 18 },
  { name: 'Athletics', description: 'Track and field events including sprinting, long jump, and relay races.', players: 30 },
];

const clubs = [
  { name: 'Debate Club', description: 'Developing public speaking and critical thinking skills through competitive debates.', members: 35, meetingDay: 'Fridays' },
  { name: 'ICT Club', description: 'Exploring technology, coding, and digital literacy beyond the classroom.', members: 40, meetingDay: 'Wednesdays' },
  { name: 'Science Club', description: 'Hands-on experiments and science projects that bring learning to life.', members: 30, meetingDay: 'Thursdays' },
  { name: 'Drama Club', description: 'Expressing creativity through theater, skits, and annual school productions.', members: 25, meetingDay: 'Tuesdays' },
  { name: 'Music Club', description: 'Learning instruments, vocal training, and performing at school events.', members: 20, meetingDay: 'Mondays' },
  { name: 'Environmental Club', description: 'Promoting sustainability and environmental awareness in our community.', members: 28, meetingDay: 'Fridays' },
];

const activities = [
  { name: 'School Trip to Queen Elizabeth National Park', type: 'trip', date: 'March 2026', description: 'Educational safari and wildlife experience for senior students.' },
  { name: 'Inter-School Science Competition', type: 'competition', date: 'April 2026', description: 'Annual science quiz and project exhibition against other schools.' },
  { name: 'Community Clean-Up Drive', type: 'community', date: 'May 2026', description: 'Students participate in cleaning the local community as part of service learning.' },
  { name: 'Annual Sports Day', type: 'sports', date: 'May 2026', description: 'Full-day sports competition with all houses competing for the championship.' },
  { name: 'Cultural Day Celebration', type: 'cultural', date: 'June 2026', description: 'Celebrating Rwanda\'s diverse cultures through food, dance, and performances.' },
  { name: 'Career Guidance Workshop', type: 'workshop', date: 'June 2026', description: 'Guest speakers from various professions sharing career insights.' },
];

const testimonials = [
  { name: 'Sarah Nakamya', role: 'Student, S5', quote: 'The clubs at Lycée de Nyanza have helped me discover my passion for technology and leadership.' },
  { name: 'James Okello', role: 'Alumni, Class of 2024', quote: 'The sports programs taught me discipline and teamwork that I use in my career today.' },
  { name: 'Grace Achieng', role: 'Parent', quote: 'My children have grown both academically and personally thanks to the vibrant campus life.' },
];

export default function CampusLifePage() {
  const [activeTab, setActiveTab] = useState<'sports' | 'clubs' | 'activities'>('sports');

  const getIcon = (type: string) => {
    switch (type) {
      case 'trip': return <MapPin className="h-5 w-5" />;
      case 'competition': return <Trophy className="h-5 w-5" />;
      case 'community': return <Users className="h-5 w-5" />;
      case 'sports': return <Trophy className="h-5 w-5" />;
      default: return <Calendar className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main id="main-content">
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-navy-700 to-primary-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Campus Life</h1>
          <p className="text-xl text-gray-200">
            Discover the vibrant community and activities that make Lycée de Nyanza special.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50">
        {/* Intro Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-navy-700 mb-4">Life at Lycée de Nyanza</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Beyond academics, Lycée de Nyanza offers a rich campus life that helps students develop 
              leadership skills, pursue their passions, and build lifelong friendships. From sports 
              to clubs, there is something for everyone.
            </p>
          </div>
        </section>

        {/* Tabs */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setActiveTab('sports')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    activeTab === 'sports'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Sports
                </button>
                <button
                  onClick={() => setActiveTab('clubs')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    activeTab === 'clubs'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Clubs
                </button>
                <button
                  onClick={() => setActiveTab('activities')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    activeTab === 'activities'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Activities
                </button>
              </div>
            </div>

            {/* Sports Content */}
            {activeTab === 'sports' && (
              <div className="grid md:grid-cols-2 gap-6">
                {sports.map((sport, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary-100 p-3 rounded-lg">
                        <Trophy className="h-8 w-8 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-navy-700 mb-2">{sport.name}</h3>
                        <p className="text-gray-600 mb-3">{sport.description}</p>
                        <p className="text-sm text-gray-500">
                          <Users className="h-4 w-4 inline mr-1" />
                          {sport.players} players
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Clubs Content */}
            {activeTab === 'clubs' && (
              <div className="grid md:grid-cols-3 gap-6">
                {clubs.map((club, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4">
                      <Users className="h-10 w-10 text-white/80" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-navy-700 mb-2">{club.name}</h3>
                      <p className="text-gray-600 text-sm mb-4">{club.description}</p>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{club.members} members</span>
                        <span>Meets: {club.meetingDay}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Activities Content */}
            {activeTab === 'activities' && (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary-100 p-3 rounded-lg">
                        {getIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-navy-700">{activity.name}</h3>
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded capitalize">
                            {activity.type}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{activity.description}</p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {activity.date}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-navy-700 mb-8 text-center">What People Say</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6">
                  <div className="text-primary-600 text-4xl mb-4">&quot;</div>
                  <p className="text-gray-600 italic mb-4">{testimonial.quote}</p>
                  <div>
                    <p className="font-semibold text-navy-700">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
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
