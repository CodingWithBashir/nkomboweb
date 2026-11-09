'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Globe, LucideIcon } from 'lucide-react';
import { Crest } from '@/components/Logo';
import { signOut as endSession } from '@/lib/authClient';

export type PortalTab = {
  id: string;
  label: string;
  icon: LucideIcon;
};

type Props = {
  user: { first_name?: string; last_name?: string; username?: string; role?: string } | null;
  subtitle?: string;
  tabs: PortalTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  children: React.ReactNode;
};

export function initials(user: Props['user']) {
  const first = user?.first_name?.[0] ?? '';
  const last = user?.last_name?.[0] ?? '';
  return (first + last).toUpperCase() || (user?.username?.[0] ?? 'U').toUpperCase();
}

export default function PortalShell({
  user,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  children,
}: Props) {
  const router = useRouter();
  const fullName =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.username || 'Account';

  const signOut = async () => {
    await endSession();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-navy-50/50">
      {/* top bar */}
      <header className="sticky top-0 z-30 bg-navy-500">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <Crest variant="light" size={40} />
            <span className="flex flex-col leading-none">
              <span className="font-heading text-[15px] font-extrabold uppercase text-white">
                Lycée de Nyanza
              </span>
              <span className="mt-1 text-[10px] font-medium italic text-gold-400">
                {subtitle ?? 'School Portal'}
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden items-center gap-1.5 rounded-full border border-white/25 px-3 py-1.5 text-[11.5px] font-semibold text-white/90 transition hover:bg-white/10 sm:flex"
            >
              <Globe size={12} />
              Website
            </Link>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-400 text-[11px] font-extrabold text-white">
                {initials(user)}
              </span>
              <div className="hidden leading-tight sm:block">
                <p className="text-[12px] font-bold text-white">{fullName}</p>
                <p className="text-[10px] capitalize text-white/60">{user?.role ?? ''}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11.5px] font-semibold text-white transition hover:bg-white/20"
            >
              <LogOut size={12} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-4 py-6">
        {/* tabs */}
        <nav className="mb-6 flex flex-wrap gap-2" aria-label="Portal sections">
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = id === activeTab;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onTabChange(id)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-bold transition ${
                  active
                    ? 'bg-navy-500 text-white shadow-sm'
                    : 'border border-navy-100 bg-white text-navy-400 hover:text-navy-500'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            );
          })}
        </nav>

        {children}
      </div>
    </div>
  );
}

export function Card({
  title,
  action,
  children,
  className = '',
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-navy-100 bg-white shadow-card ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-navy-100 px-5 py-3">
          {title && (
            <h2 className="font-heading text-[13.5px] font-extrabold text-navy-500">{title}</h2>
          )}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Stat({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        accent ? 'border-gold-200 bg-gold-50' : 'border-navy-100 bg-white'
      }`}
    >
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-navy-400">{label}</p>
      <p className="mt-1.5 font-heading text-[22px] font-extrabold leading-none text-navy-500">
        {value}
      </p>
      {hint && <p className="mt-1 text-[10.5px] text-navy-300">{hint}</p>}
    </div>
  );
}
