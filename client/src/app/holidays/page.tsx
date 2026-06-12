'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import Sidebar from '@/components/Sidebar';
import { FileText, Download, Calendar, HardDrive, Package } from 'lucide-react';
import api from '@/lib/axios';
import { HolidayPackage } from '@/types';

// Sample data for demonstration
const sampleHolidays: HolidayPackage[] = [
  {
    id: 1,
    title: 'April Holiday Package',
    description: 'Holiday assignments and revision materials for S2 students.',
    file: '/files/april-holiday.pdf',
    file_size: '2.4 MB',
    class_level: 2,
    class_level_detail: { id: 2, name: 'S2', level: 1, level_name: 'O-Level', stream: '' },
    year: 2026,
    term: 1,
    term_display: 'Term 1',
    uploaded_by: 1,
    uploaded_by_name: 'Admin User',
    upload_date: '2026-04-15',
    is_active: true,
  },
  {
    id: 2,
    title: 'May Holiday Work',
    description: 'Questions and activities to keep you learning during the break.',
    file: '/files/may-holiday.docx',
    file_size: '1.8 MB',
    class_level: 2,
    class_level_detail: { id: 2, name: 'S2', level: 1, level_name: 'O-Level', stream: '' },
    year: 2026,
    term: 1,
    term_display: 'Term 1',
    uploaded_by: 1,
    uploaded_by_name: 'Admin User',
    upload_date: '2026-05-20',
    is_active: true,
  },
  {
    id: 3,
    title: 'June Holiday Revision',
    description: 'Comprehensive revision materials for Term 1 topics.',
    file: '/files/june-revision.pdf',
    file_size: '3.1 MB',
    class_level: 2,
    class_level_detail: { id: 2, name: 'S2', level: 1, level_name: 'O-Level', stream: '' },
    year: 2026,
    term: 1,
    term_display: 'Term 1',
    uploaded_by: 1,
    uploaded_by_name: 'Admin User',
    upload_date: '2026-06-05',
    is_active: true,
  },
];

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<HolidayPackage[]>(sampleHolidays);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);

  const handleFilter = async (newFilters: any) => {
    setFilters(newFilters);
    setLoading(true);
    
    try {
      // Try to fetch from API
      const params = new URLSearchParams();
      if (newFilters.level) params.append('level', newFilters.level === 'olevel' ? 'O-Level' : 'A-Level');
      if (newFilters.class_id) params.append('class_id', newFilters.class_id);
      if (newFilters.year) params.append('year', newFilters.year);
      if (newFilters.term) params.append('term', newFilters.term);
      
      const response = await api.get(`/holidays/packages/?${params.toString()}`);
      setHolidays(response.data.results || response.data);
    } catch (error) {
      // Use sample data if API fails
      let filtered = sampleHolidays;
      if (newFilters.class_id) {
        filtered = filtered.filter(h => h.class_level === parseInt(newFilters.class_id));
      }
      if (newFilters.year) {
        filtered = filtered.filter(h => h.year === parseInt(newFilters.year));
      }
      if (newFilters.term) {
        filtered = filtered.filter(h => h.term === parseInt(newFilters.term));
      }
      setHolidays(filtered);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.pdf')) {
      return <FileText className="h-12 w-12 text-red-500" />;
    }
    return <FileText className="h-12 w-12 text-blue-500" />;
  };

  const getFileType = (fileName: string) => {
    if (fileName.endsWith('.pdf')) return 'PDF';
    if (fileName.endsWith('.docx')) return 'DOCX';
    return 'FILE';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-navy-700 to-primary-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Holidays</h1>
          <p className="text-xl text-gray-200">
            Access all holiday materials uploaded for each class, year and term.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <Sidebar onFilter={handleFilter} />
            </div>

            {/* Results */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-navy-700">Holidays Available</h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Showing results for: {filters.level === 'alevel' ? "A' Level" : "O' Level"} • 
                      Class: {filters.class_id || 'All'} • 
                      Year: {filters.year || '2026'} • 
                      Term: {filters.term || '1'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-primary-600">
                    <Package className="h-5 w-5" />
                    <span className="font-semibold">{holidays.length} Results Found</span>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading...</p>
                  </div>
                ) : holidays.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No holidays available?</h3>
                    <p className="text-gray-500">
                      If no results are shown, it means no holiday materials have been uploaded for the selected filters.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {holidays.map((holiday) => (
                      <div
                        key={holiday.id}
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start space-x-4">
                          {/* File Icon */}
                          <div className="flex-shrink-0">
                            <div className="relative">
                              {getFileIcon(holiday.file)}
                              <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-xs px-1 rounded">
                                {getFileType(holiday.file)}
                              </span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-navy-700 mb-1">
                              {holiday.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">
                              {holiday.description}
                            </p>
                            
                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                                Class: {holiday.class_level_detail.name}
                              </span>
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                                Year: {holiday.year}
                              </span>
                              <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">
                                Term: {holiday.term}
                              </span>
                            </div>

                            {/* Meta */}
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                Uploaded On: {new Date(holiday.upload_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </div>
                              <div className="flex items-center">
                                <HardDrive className="h-4 w-4 mr-1" />
                                File Size: {holiday.file_size}
                              </div>
                            </div>
                          </div>

                          {/* Download Button */}
                          <div className="flex-shrink-0">
                            <a
                              href={holiday.file}
                              download
                              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
