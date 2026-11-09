'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import StudentCard from './StudentCard';
import type { Student } from '@/lib/content';

type Props = {
  students: Student[];
  trades: { slug: string; name: string; code: string }[];
};

/** Filterable student body, grouped by class level (L3 → L5). */
export default function StudentDirectory({ students, trades }: Props) {
  const [trade, setTrade] = useState('all');
  const [level, setLevel] = useState('all');
  const [query, setQuery] = useState('');

  const levels = useMemo(() => {
    const found = Array.from(new Set(students.map((student) => student.level)));
    return ['L5', 'L4', 'L3'].filter((item) => found.includes(item)).concat(
      found.filter((item) => !['L3', 'L4', 'L5'].includes(item))
    );
  }, [students]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return students.filter((student) => {
      if (trade !== 'all' && student.trade?.slug !== trade) return false;
      if (level !== 'all' && student.level !== level) return false;
      if (!needle) return true;
      return (
        student.full_name.toLowerCase().includes(needle) ||
        (student.trade?.name ?? '').toLowerCase().includes(needle)
      );
    });
  }, [students, trade, level, query]);

  const grouped = useMemo(() => {
    return levels
      .map((item) => ({
        level: item,
        rows: filtered.filter((student) => student.level === item),
      }))
      .filter((group) => group.rows.length > 0);
  }, [filtered, levels]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-navy-100 bg-white p-3 shadow-sm">
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-300" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a student…"
            className="w-full rounded-xl border border-transparent bg-navy-50/70 py-2.5 pl-10 pr-3 text-[13px] text-navy-600 outline-none transition focus:border-navy-200 focus:bg-white"
          />
        </div>
        <select
          value={trade}
          onChange={(event) => setTrade(event.target.value)}
          className="rounded-xl border border-navy-200 bg-white px-3 py-2.5 text-[12.5px] font-semibold text-navy-500 outline-none"
        >
          <option value="all">All trades</option>
          {trades.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap gap-1 rounded-full bg-navy-50 p-1">
          {['all', ...levels].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setLevel(item)}
              className={`rounded-full px-3 py-1.5 text-[11.5px] font-bold transition ${
                level === item ? 'bg-navy-500 text-white' : 'text-navy-400 hover:text-navy-600'
              }`}
            >
              {item === 'all' ? 'All levels' : item}
            </button>
          ))}
        </div>
      </div>

      {grouped.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-navy-200 bg-white px-6 py-12 text-center text-[13px] text-navy-400">
          No students match those filters yet.
        </p>
      ) : (
        <div className="mt-9 space-y-10">
          {grouped.map((group) => (
            <section key={group.level}>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-navy-500 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-white">
                  {group.level}
                </span>
                <h3 className="font-heading text-[15px] font-extrabold text-navy-500">
                  {group.level === 'L5'
                    ? 'Final year candidates'
                    : group.level === 'L4'
                      ? 'Second year'
                      : 'First year'}
                </h3>
                <span className="h-px flex-1 bg-navy-100" />
                <span className="text-[11.5px] font-semibold text-navy-300">
                  {group.rows.length} student{group.rows.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.rows.map((student) => (
                  <StudentCard key={student.id} student={student} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
