'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FileText, Download, Calendar, Package, Clock, ArrowRight, School } from 'lucide-react';
import api from '@/lib/axios';

type Holiday = {
  id: number;
  class_level: number;
  title: string;
  description: string;
  file: string;
  file_size: string;
  class_level_detail: { id: number; name: string; level: number; level_name: string; stream: string };
  year: number;
  term: number;
  term_display: string;
  uploaded_by: number;
  uploaded_by_name: string;
  upload_date: string;
  is_active: boolean;
};

const sampleHolidays: Holiday[] = [
  {
    id: 1,
    title: 'Mathematics Holiday Assignment',
    description: 'Holiday assignments and revision materials for L3 students.',
    file: '/files/math-holiday.pdf',
    file_size: '245 KB',
    class_level: 1,
    class_level_detail: { id: 1, name: 'L3', level: 1, level_name: 'O-Level', stream: '' },
    year: 2024,
    term: 1,
    term_display: 'Term 1',
    uploaded_by: 1,
    uploaded_by_name: 'Admin User',
    upload_date: '2024-12-20',
    is_active: true,
  },
  {
    id: 2,
    title: 'Physics Revision Notes',
    description: 'Comprehensive physics revision notes for L4 students.',
    file: '/files/physics-revision.pdf',
    file_size: '1.2 MB',
    class_level: 2,
    class_level_detail: { id: 2, name: 'L4', level: 1, level_name: 'O-Level', stream: '' },
    year: 2024,
    term: 1,
    term_display: 'Term 1',
    uploaded_by: 1,
    uploaded_by_name: 'Admin User',
    upload_date: '2024-12-18',
    is_active: true,
  },
  {
    id: 3,
    title: 'Chemistry Study Guide',
    description: 'Chemistry study guide for L5 students preparing for end of term.',
    file: '/files/chemistry-guide.pdf',
    file_size: '980 KB',
    class_level: 3,
    class_level_detail: { id: 3, name: 'L5', level: 1, level_name: 'O-Level', stream: '' },
    year: 2024,
    term: 1,
    term_display: 'Term 1',
    uploaded_by: 1,
    uploaded_by_name: 'Admin User',
    upload_date: '2024-12-18',
    is_active: true,
  },
];

const announcements = [
  {
    title: 'Holiday Assignments for Term 1 are Now Available',
    date: 'Dec 20, 2024',
    body: 'Download your assignments and prepare for the next term.',
  },
  {
    title: 'School Reopens on January 6, 2025',
    date: 'Dec 18, 2024',
    body: 'All students are expected back on time.',
  },
  {
    title: 'End of Term 1 Successfully Completed',
    date: 'Dec 15, 2024',
    body: 'Congratulations to all our students!',
  },
];

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>(sampleHolidays);
  const [filters, setFilters] = useState({
    class_id: '',
    year: '2024',
    term: '1',
    resource_type: 'Holiday Assignment',
  });
  const [loading, setLoading] = useState(false);

  const classes = [
    { value: '', label: 'L3' },
    { value: '2', label: 'L4' },
    { value: '3', label: 'L5' },
  ];
  const years = ['2024', '2025', '2026'];
  const terms = ['1', '2', '3'];
  const resourceTypes = ['Holiday Assignment', 'Revision Notes', 'Study Guide', 'All'];

  const handleFilter = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.class_id) params.append('class_id', filters.class_id);
      if (filters.year) params.append('year', filters.year);
      if (filters.term) params.append('term', filters.term);
      const response = await api.get(`/holidays/packages/?${params.toString()}`);
      setHolidays(response.data.results || response.data || sampleHolidays);
    } catch {
      setHolidays(sampleHolidays);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-navy-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-navy-800 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/80 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 px-md-6 py-16 md:py-24 text-white">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              Student Learning &<br />
              Holiday Resources
            </h1>
            <p className="text-white/80 text-lg max-w-lg">
              Access holiday assignments, revision materials and study guides to keep learning even
              during holidays.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-10 bg-white border-b border-navy-100">
        <div className="max-w-7xl mx-auto px-4 px-md-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-navy-100">
            <div className="flex flex-col lg:flex-row gap-4 items-end">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs font-bold text-navy-600 uppercase tracking-wider mb-2">
                  Program / Class
                </label>
                <select
                  value={filters.class_id}
                  onChange={(e) => setFilters({ ...filters, class_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-navy-200 bg-white text-navy-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
                >
                  {classes.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs font-bold text-navy-600 uppercase tracking-wider mb-2">
                  Academic Year
                </label>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-navy-200 bg-white text-navy-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs font-bold text-navy-600 uppercase tracking-wider mb-2">
                  Term
                </label>
                <select
                  value={filters.term}
                  onChange={(e) => setFilters({ ...filters, term: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-navy-200 bg-white text-navy-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
                >
                  {terms.map((t) => (
                    <option key={t} value={t}>Term {t}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs font-bold text-navy-600 uppercase tracking-wider mb-2">
                  Resource Type
                </label>
                <select
                  value={filters.resource_type}
                  onChange={(e) => setFilters({ ...filters, resource_type: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-navy-200 bg-white text-navy-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
                >
                  {resourceTypes.map((rt) => (
                    <option key={rt} value={rt}>{rt}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleFilter}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition-colors text-sm"
                >
                  {loading ? 'Searching...' : 'Search Resources'}
                </button>
                <button
                  onClick={() => {
                    setFilters({ class_id: '', year: '2024', term: '1', resource_type: 'Holiday Assignment' });
                    handleFilter();
                  }}
                  className="px-6 py-3 border border-navy-200 hover:border-amber-400 text-navy-700 rounded-lg font-bold transition-colors text-sm"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Available Holiday Resources */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 px-md-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-navy-800 mb-1">Available Holiday Resources</h2>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Only resources published by the school are shown.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-navy-600 bg-navy-50 px-3 py-1.5 rounded-full border border-navy-100">
              <Package className="h-3 w-3 mr-1" />
              {holidays.length} Resources Found
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
              <p className="text-navy-500">Loading resources...</p>
            </div>
          ) : holidays.length === 0 ? (
            <div className="text-center py-20">
              <Package className="h-12 w-12 text-navy-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-navy-800 mb-2">No resources available</h3>
              <p className="text-navy-500 text-sm">
                No holiday materials match the selected filters. Try adjusting your selection.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {holidays.map((holiday) => (
                <div key={holiday.id} className="bg-white rounded-xl p-6 border border-navy-100 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-red-500" />
                    </div>
                    <span className="text-[10px] font-bold text-red-600 bg-red-50/50 px-2 py-1 rounded border border-red-100">
                      PDF
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-navy-800 mb-2">{holiday.title}</h3>
                  <div className="flex gap-4 text-xs text-navy-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Class: {holiday.class_level_detail.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Year: {holiday.year}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Term: {holiday.term_display}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-navy-50 pt-4">
                    <div className="flex items-center gap-1 text-xs text-navy-600">
                      <Clock className="h-3 w-3" />
                      <span>
                        Uploaded {new Date(holiday.upload_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="ml-2">• {holiday.file_size}</span>
                    </div>
                    <a
                      href={holiday.file}
                      download
                      className="flex items-center gap-1.5 px-4 py-2 bg-navy-800 hover:bg-navy-700 text-white text-xs font-bold rounded transition-colors"
                    >
                      <Download className="h-3 w-3" /> Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest Announcements */}
      <section className="py-14 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 px-md-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-navy-800">Latest Announcements</h2>
            <Link href="/news" className="text-xs font-bold text-amber-600 flex items-center gap-1 hover:text-amber-700">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {announcements.map((a, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-navy-100">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <School className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-navy-800 mb-2">{a.title}</h3>
                <p className="text-navy-500 text-sm mb-4">{a.body}</p>
                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded border border-amber-200 inline-block">
                  {a.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
