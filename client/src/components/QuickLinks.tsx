import Link from 'next/link';
import { BookOpen, Users, Trophy, Calendar, Newspaper } from 'lucide-react';

const links = [
  { icon: BookOpen, title: 'Academics', description: 'Quality education for all levels', href: '/academics', color: 'bg-black' },
  { icon: Users, title: 'Admissions', description: 'Apply & join our school', href: '/admissions', color: 'bg-black' },
  { icon: Trophy, title: 'Campus Life', description: 'Clubs, sports & activities', href: '/campus-life', color: 'bg-black' },
  { icon: Calendar, title: 'Holidays', description: 'View holiday materials', href: '/holidays', color: 'bg-black' },
  { icon: Newspaper, title: 'News & Events', description: 'Latest updates & announcements', href: '/news', color: 'bg-black' },
];

export default function QuickLinks() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {links.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center group"
            >
              <div className={`${link.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <link.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-navy-700 mb-2">{link.title}</h3>
              <p className="text-sm text-gray-500">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
