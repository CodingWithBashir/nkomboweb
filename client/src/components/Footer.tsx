import Link from 'next/link';
import { GraduationCap, Facebook, Twitter, Youtube, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-700 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* School Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-white p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-navy-700" />
              </div>
              <div>
                <span className="font-bold text-lg">GS Nkombo</span>
                <span className="block text-sm text-gray-300">Secondary School</span>
              </div>
            </div>
            <p className="text-gray-300 text-sm">Inspiring Minds. Shaping Futures.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/academics" className="hover:text-white">Academics</Link></li>
              <li><Link href="/admissions" className="hover:text-white">Admissions</Link></li>
              <li><Link href="/holidays" className="hover:text-white">Holidays</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><Link href="/student-portal" className="hover:text-white">Student Portal</Link></li>
              <li><Link href="/teacher-portal" className="hover:text-white">Teacher Portal</Link></li>
              <li><Link href="/downloads" className="hover:text-white">Downloads</Link></li>
              <li><Link href="/campus-life" className="hover:text-white">Campus Life</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>123 Education Road, Kampala, Uganda</li>
              <li>+256 700 123 456</li>
              <li>info@gsnkombo.edu</li>
            </ul>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="hover:text-primary-400"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="hover:text-primary-400"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="hover:text-primary-400"><Youtube className="h-5 w-5" /></a>
              <a href="#" className="hover:text-primary-400"><Instagram className="h-5 w-5" /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} GS Nkombo Secondary School. All Rights Reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
