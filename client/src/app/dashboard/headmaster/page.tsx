'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, BarChart3, CheckCircle, Users, BookOpen, 
  GraduationCap, Calendar, Settings, LogOut, Bell, FileText,
  AlertCircle, Clock, ChevronRight, User
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const enrollmentData = [
  { name: 'S1', value: 210, color: '#111111' },
  { name: 'S2', value: 220, color: '#3f3f46' },
  { name: 'S3', value: 215, color: '#000000' },
  { name: 'S4', value: 195, color: '#52525b' },
  { name: 'S5', value: 205, color: '#71717a' },
  { name: 'S6', value: 200, color: '#a1a1aa' },
];

const monthlyData = [
  { name: 'Jan', students: 1200 },
  { name: 'Feb', students: 1210 },
  { name: 'Mar', students: 1225 },
  { name: 'Apr', students: 1230 },
  { name: 'May', students: 1240 },
  { name: 'Jun', students: 1245 },
];

const recentApprovals = [
  { id: 1, type: 'Holiday Upload', title: 'June Holiday Revision', submittedBy: 'DOS Office', date: '05 Jun 2026', status: 'pending' },
  { id: 2, type: 'Teacher Leave', title: 'Mr. David - 3 Days', submittedBy: 'HR Department', date: '04 Jun 2026', status: 'pending' },
  { id: 3, type: 'Event Request', title: 'Sports Day Event', submittedBy: 'Sports Dept', date: '03 Jun 2026', status: 'approved' },
];

const upcomingEvents = [
  { title: 'Sports Day', date: '24 May 2026', type: 'Sports' },
  { title: 'Parents Meeting', date: '30 May 2026', type: 'Meeting' },
  { title: 'Award Ceremony', date: '15 Jun 2026', type: 'Ceremony' },
];

const noticeBoard = [
  { title: 'New Library Opened', date: '10 Jun 2026', type: 'General' },
  { title: 'Sports Day - 24 May 2026', date: '08 May 2026', type: 'Event' },
  { title: 'Term 2 Begins', date: '01 May 2026', type: 'Academic' },
];

const sidebarLinks = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/headmaster' },
  { icon: BarChart3, label: 'Reports', href: '/dashboard/headmaster/reports' },
  { icon: CheckCircle, label: 'Approvals', href: '/dashboard/headmaster/approvals', badge: 5 },
  { icon: Users, label: 'School Management', href: '/dashboard/headmaster/management' },
  { icon: GraduationCap, label: 'Teachers', href: '/dashboard/headmaster/teachers' },
  { icon: BookOpen, label: 'Students', href: '/dashboard/headmaster/students' },
  { icon: Calendar, label: 'Events', href: '/dashboard/headmaster/events' },
  { icon: Settings, label: 'Settings', href: '/dashboard/headmaster/settings' },
];

export default function HeadmasterDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'reports'>('overview');

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
              <span className="block text-xs text-gray-300">Headmaster Portal</span>
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
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-navy-600 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <link.icon className="h-5 w-5" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full">
                      {link.badge}
                    </span>
                  )}
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
            <h1 className="text-2xl font-bold text-navy-700">Headmaster Dashboard</h1>
            <p className="text-gray-500 text-sm">Welcome back, Headmaster</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-500 hover:text-primary-600">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1 right-1 bg-black text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                5
              </span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="bg-primary-100 p-2 rounded-full">
                <User className="h-6 w-6 text-primary-600" />
              </div>
              <span className="font-medium text-navy-700">Headmaster</span>
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
                  <p className="text-sm text-gray-500">Total Students</p>
                  <p className="text-3xl font-bold text-navy-700">1,245</p>
                  <p className="text-xs text-gray-500">All Levels</p>
                </div>
                <div className="bg-navy-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-navy-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Teachers</p>
                  <p className="text-3xl font-bold text-navy-700">86</p>
                  <p className="text-xs text-black">Active Teachers</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-black" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Classes</p>
                  <p className="text-3xl font-bold text-navy-700">36</p>
                  <p className="text-xs text-gray-500">All Levels</p>
                </div>
                <div className="bg-navy-100 p-3 rounded-lg">
                  <BookOpen className="h-6 w-6 text-navy-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Upcoming Events</p>
                  <p className="text-3xl font-bold text-navy-700">3</p>
                  <p className="text-xs text-gray-500">This Month</p>
                </div>
                <div className="bg-navy-100 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-navy-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* School Overview Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-navy-700 mb-4">School Overview</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="students" fill="#111111" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Student Enrollment Pie */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-navy-700 mb-4">Student Enrollment</h3>
              <div className="h-64 flex items-center">
                <ResponsiveContainer width="50%" height="100%">
                  <PieChart>
                    <Pie
                      data={enrollmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {enrollmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-1/2">
                  <p className="text-3xl font-bold text-navy-700 mb-2">1,245</p>
                  <p className="text-sm text-gray-500 mb-4">Total Students</p>
                  <div className="space-y-2 text-sm">
                    {enrollmentData.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                        <span className="text-gray-600">{item.name}</span>
                        <span className="ml-auto font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Approvals and Events */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Recent Approvals */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-navy-700">Recent Approvals</h3>
                <Link href="/dashboard/headmaster/approvals" className="text-primary-600 text-sm font-medium flex items-center">
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {recentApprovals.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded ${
                        item.status === 'pending' ? 'bg-navy-100' : 'bg-gray-100'
                      }`}>
                        {item.status === 'pending' ? (
                          <Clock className="h-5 w-5 text-navy-600" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-black" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-navy-700 text-sm">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.type} • {item.submittedBy}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notice Board */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-navy-700">Notice Board</h3>
                <Link href="/news" className="text-primary-600 text-sm font-medium flex items-center">
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {noticeBoard.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary-100 p-2 rounded">
                        <AlertCircle className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-navy-700 text-sm">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.type}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{item.date}</span>
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
                href="/dashboard/headmaster/reports"
                className="flex items-center space-x-3 p-4 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors"
              >
                <BarChart3 className="h-6 w-6 text-navy-600" />
                <div>
                  <p className="font-medium text-navy-700">View Reports</p>
                  <p className="text-xs text-gray-500">School performance</p>
                </div>
              </Link>

              <Link
                href="/dashboard/headmaster/approvals"
                className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:bg-gray-100 transition-colors"
              >
                <CheckCircle className="h-6 w-6 text-black" />
                <div>
                  <p className="font-medium text-navy-700">Approve Requests</p>
                  <p className="text-xs text-gray-500">Pending approvals</p>
                </div>
              </Link>

              <Link
                href="/dashboard/headmaster/management"
                className="flex items-center space-x-3 p-4 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors"
              >
                <Users className="h-6 w-6 text-navy-600" />
                <div>
                  <p className="font-medium text-navy-700">Manage Staff</p>
                  <p className="text-xs text-gray-500">Add or manage staff</p>
                </div>
              </Link>

              <Link
                href="/dashboard/headmaster/settings"
                className="flex items-center space-x-3 p-4 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors"
              >
                <Settings className="h-6 w-6 text-navy-600" />
                <div>
                  <p className="font-medium text-navy-700">School Settings</p>
                  <p className="text-xs text-gray-500">General settings</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}