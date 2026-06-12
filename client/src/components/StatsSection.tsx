import { Users, GraduationCap, BookOpen, Calendar, Newspaper } from 'lucide-react';

const stats = [
  { icon: Users, label: 'Students', value: '1,245', sublabel: 'Active Students' },
  { icon: GraduationCap, label: 'Teachers', value: '86', sublabel: 'Dedicated Staff' },
  { icon: BookOpen, label: 'Classes', value: '36', sublabel: 'Across All Levels' },
  { icon: Calendar, label: 'Upcoming Event', value: 'Sports Day', sublabel: '24 May 2026' },
  { icon: Newspaper, label: 'Latest News', value: 'New Library Opened', sublabel: 'Read More' },
];

export default function StatsSection() {
  return (
    <section className="bg-white py-12 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
              <div className="bg-primary-100 p-3 rounded-lg">
                <stat.icon className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="font-bold text-navy-700">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.sublabel}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
