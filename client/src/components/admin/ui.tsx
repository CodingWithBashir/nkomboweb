'use client';

import type { LucideIcon } from 'lucide-react';

/** Turn a DRF-style error body into one readable sentence. */
export function flatten(error: unknown) {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  if (!data) return 'Something went wrong. Please try again.';
  if (typeof data === 'string') return data;
  if (typeof data === 'object') {
    return Object.entries(data as Record<string, unknown>)
      .map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(' ') : String(value)}`)
      .join(' · ');
  }
  return 'Something went wrong. Please try again.';
}

export const input =
  'w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-[13px] text-navy-600 outline-none transition focus:border-navy-400 focus:ring-2 focus:ring-navy-100';

export function PageHead({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-gold-600">{eyebrow}</p>
        <h1 className="mt-2 font-heading text-[28px] font-extrabold leading-tight text-navy-500">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-[680px] text-[13px] leading-relaxed text-navy-400">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({
  title,
  description,
  icon: Icon,
  actions,
  children,
  className = '',
}: {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-navy-100 bg-white shadow-sm ${className}`}>
      {title ? (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-navy-50 px-5 py-3.5">
          <div className="flex items-start gap-2.5">
            {Icon ? <Icon size={16} className="mt-0.5 text-gold-600" /> : null}
            <div>
              <h2 className="text-[13.5px] font-bold text-navy-500">{title}</h2>
              {description ? (
                <p className="mt-0.5 max-w-[560px] text-[11.5px] leading-relaxed text-navy-400">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger' | 'gold';
  size?: 'sm' | 'md';
  icon?: LucideIcon;
  loading?: boolean;
};

export function Btn({
  variant = 'primary',
  size = 'sm',
  icon: Icon,
  loading,
  children,
  className = '',
  disabled,
  ...rest
}: BtnProps) {
  const styles = {
    primary: 'bg-navy-500 text-white hover:bg-navy-600 disabled:bg-navy-200',
    gold: 'bg-gold-500 text-white hover:bg-gold-600',
    ghost: 'border border-navy-100 bg-white text-navy-500 hover:border-navy-300',
    danger: 'border border-red-200 bg-white text-red-600 hover:bg-red-50',
  }[variant];
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-bold transition disabled:cursor-not-allowed ${
        size === 'sm' ? 'px-3 py-1.5 text-[11.5px]' : 'px-4 py-2.5 text-[13px]'
      } ${styles} ${className}`}
    >
      {Icon ? <Icon size={size === 'sm' ? 13 : 15} /> : null}
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  children,
  className = '',
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-navy-300">{hint}</span> : null}
    </label>
  );
}

export function Notice({
  kind = 'ok',
  children,
}: {
  kind?: 'ok' | 'error' | 'info';
  children: React.ReactNode;
}) {
  const styles = {
    ok: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    error: 'border-red-200 bg-red-50 text-red-700',
    info: 'border-navy-100 bg-navy-50 text-navy-500',
  }[kind];
  return (
    <p className={`rounded-lg border px-3 py-2 text-[12px] font-medium ${styles}`}>{children}</p>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-navy-100 bg-navy-50/40 px-4 py-8 text-center text-[12.5px] text-navy-400">
      {children}
    </div>
  );
}

export function Chip({
  tone = 'navy',
  children,
}: {
  tone?: 'navy' | 'green' | 'amber' | 'red' | 'gold';
  children: React.ReactNode;
}) {
  const styles = {
    navy: 'bg-navy-50 text-navy-500',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-600',
    gold: 'bg-gold-50 text-gold-700',
  }[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold ${styles}`}
    >
      {children}
    </span>
  );
}

export function money(value: number | null | undefined, currency = 'RWF') {
  const amount = Number(value || 0);
  return `${currency} ${amount.toLocaleString('en-US')}`;
}

export function levelTone(level?: string | null) {
  return level === 'L5' ? 'gold' : level === 'L4' ? 'green' : 'navy';
}

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const LEVELS = ['L3', 'L4', 'L5'];
export const TERMS = ['Term 1', 'Term 2', 'Term 3'];
