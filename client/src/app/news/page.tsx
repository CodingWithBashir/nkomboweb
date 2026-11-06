'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Calendar, MapPin, Clock, Filter, ChevronRight, Newspaper } from 'lucide-react';
import api from '@/lib/axios';

const newsData = [
  {
    id: 1,
    title: 'New Library Opened',
    content: 'Lycée de Nyanza proudly announces the opening of a new state-of-the-art library facility. The library features over 10,000 books, digital resources, and modern study spaces.',
    category: 'general',
    publish_date: '2026-06-10',
    image: null,
  },
  {
    id: 2,
    title: 'Sports Day Results',
    content: 'Congratulations to all participants in the annual Sports Day event. House Lions emerged as overall champions with 450 points.',
    category: 'sports',
    publish_date: '2026-06-08',
    image: null,
  },
  {
    id: 3,
    title: 'Exam Schedule Released',
    content: 'The examination schedule for Term 2 has been released. Students are advised to check the notice board for their specific timetables.',
    category: 'academic',
    publish_date: '2026-06-05',
    image: null,
  },
  {
    id: 4,
    title: 'Science Exhibition Winners',
    content: 'Our students excelled at the Regional Science Exhibition, bringing home 3 gold medals and 2 silver medals.',
    category: 'academic',
    publish_date: '2026-06-01',
    image: null,
  },
  {
    id: 5,
    title: 'New Computer Lab',
    content: 'A new computer lab with 50 modern computers has been inaugurated to enhance ICT learning.',
    category: 'general',
    publish_date: '2026-05-28',
    image: null,
  },
  {
    id: 6,
    title: 'Debate Competition Victory',
    content: 'Lycée de Nyanza debate team won the National Schools Debate Championship for the third consecutive year.',
    category: 'general',
    publish_date: '2026-05-25',
    image: null,
  },
];

const eventsData = [
  {
    id: 1,
    title: 'Sports Day',
    description: 'Annual school sports competition featuring athletics, football, volleyball, and basketball.',
    date: '2026-05-24',
    time: '08:00 AM',
    location: 'School Field',
  },
  {
    id: 2,
    title: 'Parents Meeting',
    description: 'Term 2 parents-teacher conference to discuss student progress.',
    date: '2026-06-15',
    time: '10:00 AM',
    location: 'Main Hall',
  },
  {
    id: 3,
    title: 'Award Ceremony',
    description: 'Annual academic awards ceremony to recognize top performers.',
    date: '2026-07-01',
    time: '02:00 PM',
    location: 'Auditorium',
  },
  {
    id: 4,
    title: 'Career Day',
    description: 'Guest speakers from various professions sharing career insights.',
    date: '2026-07-10',
    time: '09:00 AM',
    location: 'Conference Room',
  },
  {
    id: 5,
    title: 'Cultural Day',
    description: 'Celebrating Rwanda diverse cultures through food, dance, and performances.',
    date: '2026-07-20',
    time: '10:00 AM',
    location: 'School Grounds',
  },
];

const categories = [
  { value: 'all', label: 'All News' },
  { value: 'academic', label: 'Academic' },
  { value: 'general', label: 'General' },
  { value: 'sports', label: 'Sports' },
];

export default function NewsPage() {
  const [activeTab, setActiveTab] = useState<'news' | 'events'>('news');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredNews = selectedCategory === 'all' 
    ? newsData 
    : newsData.filter(n => n.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return 'bg-blue-100 text-blue-700';
      case 'sports': return 'bg-green-100 text-green-700';
      case 'general': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main id="main-content">
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-navy-700 to-primary-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">News & Events</h1>
          <p className="text-xl text-gray-200">
            Stay updated with the latest happenings at Lycée de Nyanza.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50">
        {/* Tabs */}
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-center">
              <div className="bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('news')}
                  className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                    activeTab === 'news'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Newspaper className="h-5 w-5 inline mr-2" />
                  News
                </button>
                <button
                  onClick={() => setActiveTab('events')}
                  className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                    activeTab === 'events'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Calendar className="h-5 w-5 inline mr-2" />
                  Events
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* News Section */}
        {activeTab === 'news' && (
          <section className="py-8">
            <div className="max-w-7xl mx-auto px-4">
              {/* Category Filter */}
              <div className="flex items-center space-x-4 mb-8">
                <Filter className="h-5 w-5 text-gray-500" />
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === cat.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* News Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNews.map((news) => (
                  <article
                    key={news.id}
                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="h-48 bg-gradient-to-br from-primary-400 to-navy-500 flex items-center justify-center">
                      <Newspaper className="h-16 w-16 text-white/50" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${getCategoryColor(news.category)}`}>
                          {news.category.charAt(0).toUpperCase() + news.category.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(news.publish_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-navy-700 mb-2">{news.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-3">{news.content}</p>
                      <button className="mt-4 text-primary-600 font-semibold text-sm flex items-center hover:text-primary-700">
                        Read More <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Events Section */}
        {activeTab === 'events' && (
          <section className="py-8">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-navy-700 mb-6">Upcoming Events</h2>
              <div className="space-y-4">
                {eventsData.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-6">
                      <div className="bg-primary-100 text-primary-700 text-center p-4 rounded-xl min-w-[80px]">
                        <p className="text-2xl font-bold">
                          {new Date(event.date).getDate()}
                        </p>
                        <p className="text-sm">
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                        </p>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-navy-700 mb-2">{event.title}</h3>
                        <p className="text-gray-600 mb-3">{event.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {event.time}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      </main>

      <Footer />
    </div>
  );
}
