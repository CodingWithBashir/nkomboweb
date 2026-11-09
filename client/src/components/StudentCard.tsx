import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Student } from '@/lib/content';

/** Student card used by the public directory and the trade pages. */
export default function StudentCard({ student }: { student: Student }) {
  const initials =
    student.initials ||
    student.full_name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');

  return (
    <article className="group flex items-center gap-3.5 rounded-2xl border border-navy-100 bg-white p-3.5 transition duration-300 hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-card">
      <span className="relative flex h-[58px] w-[58px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-navy-50 ring-1 ring-navy-100">
        {student.photo_url ? (
          <Image
            src={student.photo_url}
            alt={`${student.full_name}, ${student.level} student at Lycée de Nyanza`}
            width={58}
            height={58}
            sizes="64px"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-heading text-[16px] font-extrabold text-navy-500">{initials}</span>
        )}
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-heading text-[13.5px] font-extrabold leading-tight text-navy-500">
          {student.full_name}
        </h3>
        <p className="mt-0.5 truncate text-[11.5px] text-navy-400">
          {student.trade?.name ?? 'Lycée de Nyanza'}
        </p>
        <p className="mt-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-navy-300">
          <span className="rounded-full bg-gold-50 px-1.5 py-[2px] text-gold-700">
            {student.level}
          </span>
          <span>Class of {student.promotion_year || '—'}</span>
        </p>
      </div>

      {student.trade && (
        <Link
          href={`/academics/${student.trade.slug}`}
          aria-label={`${student.trade.name} trade`}
          className="text-navy-200 transition group-hover:text-navy-500"
        >
          <ArrowUpRight size={16} />
        </Link>
      )}
    </article>
  );
}
