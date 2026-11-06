'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, Download, FileText, Bell, BookOpen, 
  GraduationCap, LogOut, Calendar, Clock, CheckCircle,
  User, Search, Filter
} from 'lucide-react';

const myDownloads = [
  { id: 1, title: 'April Holiday Package', class: 'S2', term: 'Term 1', year: 2026, date: '15 Apr 2026', type: 'PDF', size: '2.4 MB' },
  { id: 2, title: 'May Holiday Work', class: 'S2', term: 'Term 1', year: 2026, date: '20 May 2026', type: 'DOCX', size: '1.8 MB' },
  { id: 3, title: 'June Holiday Revision', class: 'S2', term: 'Term 1', year: 2026, date: '05 Jun 2026', type: 'PDF', size: '3.1 MB' },
];

const notifications = [
  { id: 1, message: 'New Holiday Revision Uploaded for S3 Term 2', time: '2 hours ago', read: false },
  { id: 2, message: 'Sports Day scheduled for 24 May 2026', time: '1 day ago', read: true },
  { id: 3, message: 'Exam schedule for Term 2 is now available', time: '3 days ago', read: true },
];

const upcomingDeadlines = [
  { title: 'Mathematics Assignment', dueDate: '15 Jun 2026', subject: 'Mathematics' },
  { title: 'Science Project', dueDate: '20 Jun 2026', subject: 'Science' },
  { title: 'English Essay', dueDate: '25 Jun 2026', subject: 'English' },
];

const sidebarLinks = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/student' },
  { icon: Download, label: 'My Downloads', href: '/dashboard/student/downloads' },
  { icon: BookOpen, label: 'Holidays', href: '/holidays' },
  { icon: Bell, label: 'Notifications', href: '/dashboard/student/notifications' },
  { icon: Calendar, label: 'Calendar', href: '/dashboard/student/calendar' },
];

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-navy-700 text-white flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-navy-600">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-navy-700" />
            </div>
            <div>
              <span className="font-bold">Lycée de Nyanza</span>
              <span className="block text-xs text-gray-300">Student Portal</span>
            </div>
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
                  <span>{link.label}</span>
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
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-navy-700">Student Dashboard</h1>
            <p className="text-gray-500 text-sm">Welcome back, Student</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-500 hover:text-primary-600">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                1
              </span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="bg-primary-100 p-2 rounded-full">
                <User className="h-6 w-6 text-primary-600" />
              </div>
              <span className="font-medium text-navy-700">Student</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-primary-600 to-navy-700 rounded-xl p-6 text-white mb-6">
            <h2 className="text-2xl font-bold mb-2">Welcome to Your Dashboard!</h2>
            <p className="text-gray-200">
              Access your holiday materials, track your downloads, and stay updated with school notifications.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">My Downloads</p>
                  <p className="text-3xl font-bold text-navy-700">{myDownloads.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Download className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Unread Notifications</p>
                  <p className="text-3xl font-bold text-navy-700">
                    {notifications.filter(n => !n.read).length}
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Bell className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Upcoming Deadlines</p>
                  <p className="text-3xl font-bold text-navy-700">{upcomingDeadlines.length}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Downloads */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-navy-700">Recent Downloads</h3>
                <Link href="/dashboard/student/downloads" className="text-primary-600 text-sm font-medium">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {myDownloads.map((download) => (
                  <div key={download.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded ${download.type === 'PDF' ? 'bg-red-100' : 'bg-blue-100'}`}>
                        <FileText className={`h-5 w-5 ${download.type === 'PDF' ? 'text-red-600' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <p className="font-medium text-navy-700 text-sm">{download.title}</p>
                        <p className="text-xs text-gray-500">{download.class} • {download.size}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{download.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-navy-700">Notifications</h3>
                <Link href="/dashboard/student/notifications" className="text-primary-600 text-sm font-medium">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg ${notif.read ? 'bg-gray-50' : 'bg-blue-50 border-l-4 border-primary-500'}`}
                  >
                    <p className={`text-sm ${notif.read ? 'text-gray-600' : 'text-navy-700 font-medium'}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {notif.time}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-xl shadow-sm p-6 md:col-span-2">
              <h3 className="text-lg font-semibold text-navy-700 mb-4">Upcoming Deadlines</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {upcomingDeadlines.map((deadline, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-primary-600 bg-primary-100 px-2 py-1 rounded">
                        {deadline.subject}
                      </span>
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                    <h4 className="font-medium text-navy-700 mb-1">{deadline.title}</h4>
                    <p className="text-sm text-gray-500">Due: {deadline.dueDate}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Access */}
          <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-navy-700 mb-4">Quick Access</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/holidays"
                className="flex items-center space-x-3 p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <Download className="h-6 w-6 text-primary-600" />
                <div>
                  <p className="font-medium text-navy-700">Holiday Materials</p>
                  <p className="text-xs text-gray-500">Download packages</p>
                </div>
              </Link>

              <Link
                href="/academics"
                className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <BookOpen className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-navy-700">Academics</p>
                  <p className="text-xs text-gray-500">View programs</p>
                </div>
              </Link>

              <Link
                href="/news"
                className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Bell className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="font-medium text-navy-700">News</p>
                  <p className="text-xs text-gray-500">Latest updates</p>
                </div>
              </Link>

              <Link
                href="/contact"
                className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <FileText className="h-6 w-6 text-orange-600" />
                <div>
                  <p className="font-medium text-navy-700">Contact</p>
                  <p className="text-xs text-gray-500">Get in touch</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
