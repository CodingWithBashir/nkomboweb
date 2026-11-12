'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Award,
  Banknote,
  CalendarCheck,
  CalendarClock,
  ClipboardCheck,
  ExternalLink,
  FileText,
  GraduationCap,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Receipt,
  Settings2,
  UserRoundCheck,
  UserRoundCog,
  X,
} from 'lucide-react';
import { Crest } from '@/components/Logo';
import { signOut as endSession, type AppUser } from '@/lib/authClient';
import api from '@/lib/axios';

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: 'applications' | 'accounts' | 'inbox' | 'mail';
};

type NavGroup = { label: string; items: NavItem[] };

const GROUPS: NavGroup[] = [
  {
    label: 'School',
    items: [{ href: '/lyceeadmin', label: 'Overview', icon: LayoutDashboard }],
  },
  {
    label: 'Admissions',
    items: [
      { href: '/lyceeadmin/admissions', label: 'Applications', icon: ClipboardCheck, badge: 'applications' },
      { href: '/lyceeadmin/accounts', label: 'New accounts', icon: UserRoundCheck, badge: 'accounts' },
      { href: '/lyceeadmin/inbox', label: 'Website inbox', icon: Inbox, badge: 'inbox' },
    ],
  },
  {
    label: 'Teaching',
    items: [
      { href: '/lyceeadmin/attendance', label: 'Attendance', icon: CalendarCheck },
      { href: '/lyceeadmin/reports', label: 'Report cards', icon: FileText },
      { href: '/lyceeadmin/timetable', label: 'Timetable', icon: CalendarClock },
    ],
  },
  {
    label: 'Finance',
    items: [{ href: '/lyceeadmin/fees', label: 'School fees', icon: Banknote }],
  },
  {
    label: 'People',
    items: [
      { href: '/lyceeadmin/staff', label: 'Teaching staff', icon: UserRoundCog },
      { href: '/lyceeadmin/students', label: 'Students', icon: GraduationCap },
      { href: '/lyceeadmin/promotions', label: 'Promotions', icon: Images },
    ],
  },
  {
    label: 'Records',
    items: [
      { href: '/lyceeadmin/certificates', label: 'Certificates', icon: Award },
      { href: '/lyceeadmin/audit', label: 'Audit log', icon: Activity },
    ],
  },
  {
    label: 'Communication',
    items: [{ href: '/lyceeadmin/messages', label: 'SMS & WhatsApp', icon: MessageSquare }],
  },
  {
    label: 'Settings',
    items: [
      { href: '/lyceeadmin/system', label: 'Year & backups', icon: Receipt },
      { href: '/lyceeadmin/outbox', label: 'E-mail outbox', icon: Mail, badge: 'mail' },
      { href: '/lyceeadmin/settings', label: 'Image host', icon: Settings2 },
      { href: '/holidays', label: 'Holiday material', icon: FileText },
    ],
  },
];

/** Teachers may only open the staff page (their own profile). */
const TEACHER_ITEMS: NavGroup[] = [
  {
    label: 'My work',
    items: [
      { href: '/lyceeadmin/staff', label: 'My profile', icon: UserRoundCog },
      { href: '/lyceeadmin/attendance', label: 'Attendance', icon: CalendarCheck },
    ],
  },
];

const ROLE_LABEL: Record<string, string> = {
  headmaster: 'Head teacher',
  admin: 'Administrator',
  dos: 'Director of studies',
  teacher: 'Teacher',
  student: 'Student',
  parent: 'Parent',
};

export function isManager(role?: string) {
  return role === 'headmaster' || role === 'admin' || role === 'dos';
}

export default function AdminShell({
  user,
  children,
}: {
  user: AppUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [badges, setBadges] = useState<Record<string, number>>({});

  const manager = isManager(user.role);
  const groups = manager ? GROUPS : TEACHER_ITEMS;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!manager) return;
    let active = true;
    (async () => {
      const next: Record<string, number> = {};
      await Promise.all([
        api
          .get('/auth/registrations/')
          .then((response) => {
            next.accounts = response.data.pending ?? 0;
          })
          .catch(() => undefined),
        api
          .get('/admissions/applications/stats/')
          .then((response) => {
            next.applications = response.data.pending ?? 0;
          })
          .catch(() => undefined),
        api
          .get('/mail/')
          .then((response) => {
            next.mail = response.data.counts?.failed ?? 0;
          })
          .catch(() => undefined),
        api
          .get('/contact/inbox/', { params: { page_size: 200 } })
          .then((response) => {
            const results: { is_read: boolean }[] = response.data.results ?? response.data;
            next.inbox = results.filter((message) => !message.is_read).length;
          })
          .catch(() => undefined),
      ]);
      if (active) setBadges(next);
    })();
    return () => {
      active = false;
    };
  }, [manager, pathname]);

  const fullName = useMemo(
    () => [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username,
    [user]
  );
  const initials =
    (fullName
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join('') || 'U').toUpperCase();

  const signOut = async () => {
    await endSession();
    window.location.href = '/lyceeadmin';
  };

  const nav = (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-3 text-[9.5px] font-bold uppercase tracking-[0.22em] text-white/35">
            {group.label}
          </p>
          <ul className="mt-2 space-y-0.5">
            {group.items.map((item) => {
              const active =
                item.href === '/lyceeadmin'
                  ? pathname === '/lyceeadmin'
                  : pathname.startsWith(item.href);
              const count = item.badge ? badges[item.badge] ?? 0 : 0;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`group flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-[12.5px] font-semibold transition ${
                      active
                        ? 'bg-white/12 text-white'
                        : 'text-white/65 hover:bg-white/8 hover:text-white'
                    }`}
                  >
                    <item.icon size={15} className={active ? 'text-gold-400' : 'text-white/45'} />
                    <span className="flex-1">{item.label}</span>
                    {count > 0 && (
                      <span className="rounded-full bg-gold-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {count}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const sidebar = (
    <div className="flex h-full flex-col bg-navy-600">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
        <Crest variant="light" size={38} />
        <div className="min-w-0 leading-tight">
          <p className="truncate font-heading text-[13.5px] font-extrabold uppercase text-white">
            Lycée de Nyanza
          </p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-400">
            Administration
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="ml-auto rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <X size={16} />
        </button>
      </div>

      {nav}

      <div className="border-t border-white/10 p-3">
        <Link
          href="/"
          className="mb-2 flex items-center gap-2 rounded-xl px-4 py-2 text-[11.5px] font-semibold text-white/55 hover:bg-white/8 hover:text-white"
        >
          <ExternalLink size={13} /> View the website
        </Link>
        <div className="flex items-center gap-2.5 rounded-xl bg-white/8 px-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-500 font-heading text-[11px] font-extrabold text-white">
            {initials}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[12px] font-bold text-white">{fullName}</p>
            <p className="truncate text-[10px] text-white/50">
              {ROLE_LABEL[user.role] ?? user.role}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-navy-50/50">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] lg:block">{sidebar}</aside>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-navy-900/50"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 w-[262px] shadow-2xl">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-[248px]">
        {/* mobile top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-navy-100 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg border border-navy-100 p-2 text-navy-500"
            aria-label="Open menu"
          >
            <Menu size={17} />
          </button>
          <span className="font-heading text-[13.5px] font-extrabold uppercase text-navy-500">
            Administration
          </span>
        </header>

        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
