'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, Upload, FileText, BookOpen, Users, 
  GraduationCap, BarChart3, Settings, LogOut, Bell,
  Eye, Edit, Trash2, Plus, ChevronRight, User
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'Jan', uploads: 4 },
  { name: 'Feb', uploads: 8 },
  { name: 'Mar', uploads: 12 },
  { name: 'Apr', uploads: 18 },
  { name: 'May', uploads: 15 },
  { name: 'Jun', uploads: 24 },
  { name: 'Jul', uploads: 20 },
  { name: 'Aug', uploads: 16 },
  { name: 'Sep', uploads: 22 },
  { name: 'Oct', uploads: 19 },
  { name: 'Nov', uploads: 28 },
  { name: 'Dec', uploads: 24 },
];

const recentUploads = [
  { id: 1, title: 'June Holiday Revision', class: 'S2', term: 'Term 1', year: 2026, date: '05 Jun 2026', type: 'PDF' },
  { id: 2, title: 'May Holiday Work', class: 'S2', term: 'Term 1', year: 2026, date: '20 May 2026', type: 'DOCX' },
  { id: 3, title: 'April Holiday Package', class: 'S2', term: 'Term 1', year: 2026, date: '15 Apr 2026', type: 'PDF' },
  { id: 4, title: 'March Study Guide', class: 'S3', term: 'Term 1', year: 2026, date: '10 Mar 2026', type: 'PDF' },
];

const sidebarLinks = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/dos' },
  { icon: Upload, label: 'Holiday Uploads', href: '/dashboard/dos/uploads' },
  { icon: FileText, label: 'All Holidays', href: '/dashboard/dos/holidays' },
  { icon: BookOpen, label: 'Classes & Levels', href: '/dashboard/dos/classes' },
  { icon: Users, label: 'Teachers', href: '/dashboard/dos/teachers' },
  { icon: GraduationCap, label: 'Students', href: '/dashboard/dos/students' },
  { icon: BarChart3, label: 'Reports', href: '/dashboard/dos/reports' },
  { icon: Settings, label: 'Settings', href: '/dashboard/dos/settings' },
];

export default function DOSDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-navy-700 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-navy-600">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-navy-700" />
            </div>
            {sidebarOpen && (
              <div>
                <span className="font-bold">GS Nkombo</span>
                <span className="block text-xs text-gray-300">DOS Portal</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarLinks.map((link, index) => (
              <li key={index}>
                <Link
                  href={link.href}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-navy-600 transition-colors"
                >
                  <link.icon className="h-5 w-5" />
                  {sidebarOpen && <span>{link.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-navy-600">
          <Link
            href="/login"
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-navy-600 transition-colors text-gray-300"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span>Logout</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-navy-700">DOS Dashboard</h1>
            <p className="text-gray-500 text-sm">Welcome back, Director of Studies</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-500 hover:text-primary-600">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                3
              </span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="bg-primary-100 p-2 rounded-full">
                <User className="h-6 w-6 text-primary-600" />
              </div>
              <span className="font-medium text-navy-700">Director</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Holidays</p>
                  <p className="text-3xl font-bold text-navy-700">24</p>
                  <p className="text-xs text-green-500">This Year</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Uploads</p>
                  <p className="text-3xl font-bold text-navy-700">24</p>
                  <p className="text-xs text-green-500">This Year</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <Upload className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Classes</p>
                  <p className="text-3xl font-bold text-navy-700">12</p>
                  <p className="text-xs text-gray-500">All Levels</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Students</p>
                  <p className="text-3xl font-bold text-navy-700">1,245</p>
                  <p className="text-xs text-gray-500">All Levels</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Recent */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-navy-700 mb-4">Holiday Uploads Overview</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="uploads" stroke="#0066cc" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Uploads */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-navy-700">Recent Uploads</h3>
                <Link href="/dashboard/dos/holidays" className="text-primary-600 text-sm font-medium flex items-center">
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {recentUploads.map((upload) => (
                  <div key={upload.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded ${upload.type === 'PDF' ? 'bg-red-100' : 'bg-blue-100'}`}>
                        <FileText className={`h-5 w-5 ${upload.type === 'PDF' ? 'text-red-600' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <p className="font-medium text-navy-700 text-sm">{upload.title}</p>
                        <p className="text-xs text-gray-500">
                          {upload.class} • {upload.term} • {upload.year}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{upload.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-navy-700 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/dashboard/dos/uploads"
                className="flex items-center space-x-3 p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <Upload className="h-6 w-6 text-primary-600" />
                <div>
                  <p className="font-medium text-navy-700">Upload Holiday</p>
                  <p className="text-xs text-gray-500">Add new materials</p>
                </div>
              </Link>

              <Link
                href="/dashboard/dos/holidays"
                className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <FileText className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-navy-700">Manage Holidays</p>
                  <p className="text-xs text-gray-500">View and edit</p>
                </div>
              </Link>

              <Link
                href="/dashboard/dos/reports"
                className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <BarChart3 className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="font-medium text-navy-700">Generate Report</p>
                  <p className="text-xs text-gray-500">Download reports</p>
                </div>
              </Link>

              <Link
                href="/dashboard/dos/classes"
                className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <BookOpen className="h-6 w-6 text-orange-600" />
                <div>
                  <p className="font-medium text-navy-700">Manage Classes</p>
                  <p className="text-xs text-gray-500">Add or edit classes</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
