'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  GraduationCap,
  Loader2,
  Printer,
  RefreshCw,
  Users,
} from 'lucide-react';
import api from '@/lib/axios';
import BulletinCard, { type Bulletin } from '@/components/BulletinCard';
import {
  Btn,
  Chip,
  Empty,
  LEVELS,
  Notice,
  PageHead,
  Panel,
  TERMS,
  flatten,
  input,
  money,
} from '@/components/admin/ui';

type Trade = { id: number; code: string; name: string };

type ClassRow = {
  id: number;
  student_id: string;
  full_name: string;
  level: string;
  average: number | null;
  rank: number | null;
  attendance_rate: number | null;
};

type ClassReport = {
  academic_year: string;
  term: string;
  class_size: number;
  marked: number;
  class_average: number | null;
  best: number | null;
  results: ClassRow[];
};

const gradeOf = (percent: number) =>
  percent >= 80 ? 'A' : percent >= 70 ? 'B' : percent >= 60 ? 'C' : percent >= 50 ? 'D' : 'E';

const gradeTone = (percent: number) => (percent >= 60 ? 'green' : percent >= 50 ? 'amber' : 'red');

const startYear = () => {
  const now = new Date();
  return now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
};

export default function ReportsPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [level, setLevel] = useState('L3');
  const [trade, setTrade] = useState('');
  const [term, setTerm] = useState('Term 1');
  const [year, setYear] = useState(`${startYear()}/${startYear() + 1}`);
  const [report, setReport] = useState<ClassReport | null>(null);
  const [bulletin, setBulletin] = useState<Bulletin | null>(null);
  const [loading, setLoading] = useState(true);
  const [printAll, setPrintAll] = useState<Bulletin[] | null>(null);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    api
      .get('/academics/trades/', { params: { page_size: 100 } })
      .then((response) => setTrades(response.data.results ?? []))
      .catch(() => setTrades([]));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setNotice(null);
    setBulletin(null);
    try {
      const { data } = await api.get('/reports/', {
        params: { level, term, academic_year: year, ...(trade ? { trade } : {}) },
      });
      setReport(data as ClassReport);
    } catch (error) {
      setNotice({ kind: 'error', text: flatten(error) });
    } finally {
      setLoading(false);
    }
  }, [level, term, year, trade]);

  useEffect(() => {
    void load();
  }, [load]);

  const openBulletin = async (studentId: number) => {
    setNotice(null);
    try {
      const { data } = await api.get('/reports/', {
        params: { student: studentId, term, academic_year: year },
      });
      setBulletin(data as Bulletin);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setNotice({ kind: 'error', text: flatten(error) });
    }
  };

  const downloadCsv = () => {
    if (!report) return;
    const header = ['Rank', 'Student number', 'Name', 'Level', 'Average %', 'Attendance %'];
    const lines = report.results.map((row) => [
      row.rank ?? '',
      row.student_id,
      row.full_name,
      row.level,
      row.average ?? '',
      row.attendance_rate ?? '',
    ]);
    const csv = [header, ...lines]
      .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `results-${year.replace('/', '-')}-${term.replace(/\s/g, '')}-${level}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const printWholeClass = async () => {
    if (!report) return;
    setNotice(null);
    try {
      const cards = await Promise.all(
        report.results
          .filter((row) => row.average !== null)
          .slice(0, 60)
          .map((row) =>
            api
              .get('/reports/', { params: { student: row.id, term, academic_year: year } })
              .then((response) => response.data as Bulletin)
          )
      );
      setPrintAll(cards);
      setTimeout(() => window.print(), 120);
    } catch (error) {
      setNotice({ kind: 'error', text: flatten(error) });
    }
  };

  const tradeName = useMemo(
    () => trades.find((item) => String(item.id) === trade)?.code ?? null,
    [trades, trade]
  );

  return (
    <div className="min-h-screen bg-navy-50/50">
      <style>{`
        @media print {
          body { background: #fff; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .bulletin-card { break-after: page; border: 0 !important; }
        }
        .print-only { display: none; }
      `}</style>

      <div className="mx-auto max-w-[1100px] px-5 py-10 no-print">
        <PageHead
          eyebrow="Academics"
          title="Report cards & class ranking"
          description="Marks are turned into a bulletin on the REB scale — average, position in class, attendance and the fee balance on the same sheet. Print one bulletin, or the whole class, and give the office a CSV."
          actions={
            <>
              <Btn variant="ghost" icon={Download} onClick={downloadCsv} disabled={!report?.results.length}>
                CSV
              </Btn>
              <Btn
                variant="ghost"
                icon={Printer}
                onClick={() => void printWholeClass()}
                disabled={!report?.marked}
              >
                Print class
              </Btn>
              <Btn variant="ghost" icon={RefreshCw} onClick={() => void load()} />
            </>
          }
        />

        <Panel className="mb-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                Level
              </span>
              <select className={input} value={level} onChange={(event) => setLevel(event.target.value)}>
                {LEVELS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                Trade
              </span>
              <select className={input} value={trade} onChange={(event) => setTrade(event.target.value)}>
                <option value="">All trades</option>
                {trades.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.code} — {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                Term
              </span>
              <select className={input} value={term} onChange={(event) => setTerm(event.target.value)}>
                {TERMS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                School year
              </span>
              <input className={input} value={year} onChange={(event) => setYear(event.target.value)} />
            </label>
          </div>
        </Panel>

        {notice ? (
          <div className="mb-4">
            <Notice kind={notice.kind}>{notice.text}</Notice>
          </div>
        ) : null}

        {bulletin ? (
          <Panel
            className="mb-5"
            title={`Bulletin — ${bulletin.student.full_name}`}
            description={`${bulletin.term} · ${bulletin.academic_year} · position ${bulletin.rank ?? '—'} of ${bulletin.class_size}`}
            actions={
              <>
                <Btn icon={Printer} onClick={() => window.print()}>
                  Print
                </Btn>
                <Btn variant="ghost" onClick={() => setBulletin(null)}>
                  Close
                </Btn>
              </>
            }
          >
            <BulletinCard card={bulletin} />
          </Panel>
        ) : null}

        <Panel
          title={`${level}${tradeName ? ` · ${tradeName}` : ''} — ${term} ${year}`}
          icon={Users}
          description={
            report
              ? `${report.class_size} students · ${report.marked} with marks · class average ${report.class_average ?? '—'}%`
              : undefined
          }
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-[12.5px] text-navy-400">
              <Loader2 size={15} className="animate-spin" /> Building the class list…
            </div>
          ) : !report || report.results.length === 0 ? (
            <Empty>No students in this class yet.</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-[12px]">
                <thead>
                  <tr className="border-b border-navy-50 text-[10.5px] uppercase tracking-[0.12em] text-navy-300">
                    <th className="py-2 pr-3">#</th>
                    <th className="py-2 pr-3">Student</th>
                    <th className="py-2 pr-3">Average</th>
                    <th className="py-2 pr-3">Grade</th>
                    <th className="py-2 pr-3">Attendance</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-50">
                  {report.results.map((row) => (
                    <tr key={row.id} className="hover:bg-navy-50/40">
                      <td className="py-2 pr-3 font-bold text-navy-400">{row.rank ?? '—'}</td>
                      <td className="py-2 pr-3">
                        <p className="font-bold text-navy-500">{row.full_name}</p>
                        <p className="text-[10.5px] text-navy-300">{row.student_id}</p>
                      </td>
                      <td className="py-2 pr-3 font-semibold text-navy-500">
                        {row.average === null ? '—' : `${row.average}%`}
                      </td>
                      <td className="py-2 pr-3">
                        {row.average === null ? (
                          <Chip tone="navy">No marks</Chip>
                        ) : (
                          <Chip tone={gradeTone(row.average)}>{gradeOf(row.average)}</Chip>
                        )}
                      </td>
                      <td className="py-2 pr-3 text-navy-400">
                        {row.attendance_rate === null ? '—' : `${row.attendance_rate}%`}
                      </td>
                      <td className="py-2 text-right">
                        <Btn variant="ghost" icon={GraduationCap} onClick={() => void openBulletin(row.id)}>
                          Bulletin
                        </Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {printAll?.length ? (
          <div className="print-only">
            {printAll.map((card) => (
              <div key={card.student.id} className="bulletin-card">
                <BulletinCard card={card} />
              </div>
            ))}
          </div>
        ) : null}

        <p className="mt-6 flex items-center gap-1.5 text-[11px] text-navy-300">
          <FileSpreadsheet size={12} /> The CSV export mirrors the official class list the office files
          each term.
        </p>
      </div>

      {bulletin ? (
        <div className="hidden print:block p-8">
          <BulletinCard card={bulletin} />
        </div>
      ) : null}
    </div>
  );
}
