import { money } from '@/components/admin/ui';

export type Bulletin = {
  student: {
    id: number;
    student_id: string;
    full_name: string;
    level: string;
    program: string;
    trade_code: string | null;
    parent_name: string;
    parent_phone: string;
  };
  academic_year: string;
  term: string;
  subjects: { subject: string; code: string; score: number; max_score: number; percent: number }[];
  average: number | null;
  rank: number | null;
  class_size: number;
  attendance: { present: number; absent: number; late: number; excused: number; total: number; rate: number };
  fees: { billed: number; paid: number; balance: number; currency: string };
  generated_at: string;
};

const gradeOf = (percent: number) =>
  percent >= 80 ? 'A' : percent >= 70 ? 'B' : percent >= 60 ? 'C' : percent >= 50 ? 'D' : 'E';

export default function BulletinCard({ card }: { card: Bulletin }) {
  const { student } = card;
  return (
    <article className="rounded-lg border border-navy-100 p-6">
      <header className="flex items-start justify-between gap-4 border-b border-navy-100 pb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gold-600">
            Lycée de Nyanza · TVET
          </p>
          <h2 className="mt-1 font-heading text-[20px] font-extrabold text-navy-500">
            {student.full_name}
          </h2>
          <p className="text-[11.5px] text-navy-400">
            {student.student_id} · {student.program} · {student.level}
            {student.trade_code ? ` · ${student.trade_code}` : ''}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-navy-400">
            {card.term}
          </p>
          <p className="text-[13px] font-bold text-navy-500">{card.academic_year}</p>
          <p className="mt-1 text-[11px] text-navy-400">
            Position <strong>{card.rank ?? '—'}</strong> of {card.class_size}
          </p>
        </div>
      </header>

      <table className="mt-4 w-full text-left text-[12px]">
        <thead>
          <tr className="text-[10px] uppercase tracking-[0.12em] text-navy-300">
            <th className="pb-2">Subject</th>
            <th className="pb-2">Code</th>
            <th className="pb-2 text-right">Mark</th>
            <th className="pb-2 text-right">%</th>
            <th className="pb-2 text-right">Grade</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-50">
          {card.subjects.map((subject) => (
            <tr key={subject.code + subject.subject}>
              <td className="py-1.5 font-semibold text-navy-500">{subject.subject}</td>
              <td className="py-1.5 text-navy-400">{subject.code}</td>
              <td className="py-1.5 text-right text-navy-500">
                {subject.score}/{subject.max_score}
              </td>
              <td className="py-1.5 text-right text-navy-500">{subject.percent}%</td>
              <td className="py-1.5 text-right font-bold text-navy-600">
                {gradeOf(subject.percent)}
              </td>
            </tr>
          ))}
          {card.subjects.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-3 text-[12px] text-navy-400">
                No marks have been entered for this term yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-navy-50/70 px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-navy-400">Average</p>
          <p className="mt-1 text-[18px] font-extrabold text-navy-500">
            {card.average === null ? '—' : `${card.average}%`}
          </p>
          <p className="text-[10.5px] text-navy-400">{card.average === null ? '' : gradeOf(card.average)}</p>
        </div>
        <div className="rounded-lg bg-navy-50/70 px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-navy-400">Attendance</p>
          <p className="mt-1 text-[18px] font-extrabold text-navy-500">{card.attendance.rate}%</p>
          <p className="text-[10.5px] text-navy-400">
            {card.attendance.present} present · {card.attendance.absent} absent ·{' '}
            {card.attendance.late} late
          </p>
        </div>
        <div className="rounded-lg bg-navy-50/70 px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-navy-400">
            Fees remaining
          </p>
          <p className="mt-1 text-[18px] font-extrabold text-navy-500">
            {money(card.fees.balance, card.fees.currency)}
          </p>
          <p className="text-[10.5px] text-navy-400">
            {money(card.fees.paid, card.fees.currency)} of {money(card.fees.billed, card.fees.currency)}{' '}
            paid
          </p>
        </div>
      </div>

      <footer className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-navy-100 pt-3 text-[10.5px] text-navy-400">
        <p>
          Class teacher: ____________________ · Head teacher: ____________________
        </p>
        <p>Issued {new Date(card.generated_at).toLocaleDateString('en-GB')}</p>
      </footer>
    </article>
  );
}
