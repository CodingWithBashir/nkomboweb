import SafeImage from '@/components/SafeImage';
import Link from 'next/link';
import { ArrowUpRight, GraduationCap, Layers, Users } from 'lucide-react';
import type { Teacher } from '@/lib/content';
import { initials } from '@/lib/content';

type Props = {
  teacher: Teacher;
  /** Featured cards get the HOD treatment: larger, boxed, with a black header bar. */
  featured?: boolean;
};

/**
 * Circular portrait, name, role and the classes a teacher takes — the same
 * profile pattern used across the trade pages, the teachers index and profiles.
 */
export default function TeacherCard({ teacher, featured = false }: Props) {
  return (
    <article
      className={`group relative flex h-full flex-col rounded-xl border bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-soft ${
        featured ? 'border-navy-500 shadow-card' : 'border-navy-100'
      }`}
    >
      <Link href={`/teachers/${teacher.slug}`} className="flex h-full flex-col p-5">
        <div className="flex items-start gap-4">
          <span
            className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ${
              featured
                ? 'h-[76px] w-[76px] bg-navy-500 ring-navy-500'
                : 'h-[64px] w-[64px] bg-navy-50 ring-navy-200'
            }`}
          >
            {teacher.photo_url ? (
              <SafeImage
                src={teacher.photo_url}
                alt={`${teacher.full_name}, ${teacher.title} at Lycée de Nyanza`}
                width={featured ? 76 : 64}
                height={featured ? 76 : 64}
                sizes="80px"
                className="h-full w-full object-cover"
              />
            ) : (
              <span
                className={`font-heading text-[20px] font-extrabold tracking-[-0.02em] ${
                  featured ? 'text-white' : 'text-navy-500'
                }`}
              >
                {teacher.initials || initials(teacher.full_name)}
              </span>
            )}
          </span>

          <div className="min-w-0 flex-1">
            {featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-navy-500 px-2 py-[3px] text-[9px] font-bold uppercase tracking-wide text-white">
                <Users size={9} strokeWidth={3} />
                Head of Department
              </span>
            )}
            <h3 className="mt-1 font-heading text-[15px] font-extrabold leading-tight text-navy-500">
              {teacher.full_name}
            </h3>
            <p className="mt-0.5 text-[11.5px] font-semibold text-navy-400">{teacher.title}</p>
          </div>

          <ArrowUpRight
            size={15}
            className="mt-1 shrink-0 text-navy-300 transition group-hover:text-navy-500"
          />
        </div>

        {teacher.qualification && (
          <p className="mt-3 flex items-start gap-1.5 text-[11.5px] leading-snug text-navy-400">
            <GraduationCap size={12} className="mt-[2px] shrink-0" strokeWidth={2} />
            {teacher.qualification}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {teacher.levels && (
            <span className="inline-flex items-center gap-1 rounded-full bg-navy-50 px-2 py-[3px] text-[9.5px] font-bold uppercase tracking-wide text-navy-500">
              <Layers size={9} strokeWidth={3} />
              {teacher.levels}
            </span>
          )}
          {teacher.classes && (
            <span className="rounded-full border border-navy-100 px-2 py-[3px] text-[9.5px] font-semibold text-navy-400">
              {teacher.classes}
            </span>
          )}
        </div>

        <span className="mt-auto pt-4 text-[10.5px] font-bold uppercase tracking-[0.16em] text-navy-400">
          View profile
        </span>
      </Link>
    </article>
  );
}
