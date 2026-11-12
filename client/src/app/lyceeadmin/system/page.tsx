'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CalendarRange,
  DatabaseBackup,
  Download,
  HardDriveDownload,
  Loader2,
  RefreshCw,
  RotateCw,
  ShieldCheck,
} from 'lucide-react';
import api from '@/lib/axios';
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
} from '@/components/admin/ui';

type SystemInfo = {
  academic_year: string;
  current_term: string;
  terms: string[];
  counts: {
    students: number;
    staff: number;
    parents: number;
    certificates: number;
    invoices: number;
    backups: number;
  };
  momo: { configured: boolean; note: string };
  messaging: { sms: { configured: boolean; note: string }; whatsapp: { configured: boolean; note: string } };
};

type Backup = { name: string; size: number; created: string };

type Rollover = {
  from_year: string;
  to_year: string;
  promote_to_l4: number;
  promote_to_l5: number;
  graduating: number;
  detail: string;
};

export default function SystemPage() {
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [year, setYear] = useState('');
  const [term, setTerm] = useState('Term 1');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [rollover, setRollover] = useState<Rollover | null>(null);
  const [confirm, setConfirm] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [systemResponse, backupsResponse] = await Promise.all([
        api.get('/system/'),
        api.get('/backup/'),
      ]);
      setInfo(systemResponse.data as SystemInfo);
      setYear(systemResponse.data.academic_year);
      setTerm(systemResponse.data.current_term);
      setBackups(backupsResponse.data.results ?? []);
    } catch (error) {
      setNotice({ kind: 'error', text: flatten(error) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const saveYear = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      const { data } = await api.patch('/system/', { academic_year: year, current_term: term });
      setNotice({ kind: 'ok', text: `School year set to ${data.academic_year} · ${data.current_term}.` });
      await load();
    } catch (error) {
      setNotice({ kind: 'error', text: flatten(error) });
    } finally {
      setBusy(false);
    }
  };

  const runRollover = async (dryRun: boolean) => {
    setBusy(true);
    setNotice(null);
    try {
      const { data } = await api.post('/system/rollover/', {
        to_year: confirm || undefined,
        confirm: !dryRun,
      });
      if (dryRun) {
        setRollover(data as Rollover);
        setConfirm(data.to_year);
        setNotice({ kind: 'ok', text: 'Preview ready — nothing has been changed yet.' });
      } else {
        setNotice({
          kind: 'ok',
          text: `${data.detail} ${data.promoted_to_l4 ?? 0} to L4, ${data.promoted_to_l5 ?? 0} to L5, ${
            data.graduated ?? 0
          } graduated.`,
        });
        setRollover(null);
        setConfirm('');
        await load();
      }
    } catch (error) {
      setNotice({ kind: 'error', text: flatten(error) });
    } finally {
      setBusy(false);
    }
  };

  const createBackup = async () => {
    setBusy(true);
    setNotice(null);
    try {
      const { data } = await api.post('/backup/');
      setNotice({ kind: 'ok', text: `Backup ${data.name} written (${Math.round(data.size / 1024)} KB).` });
      await load();
    } catch (error) {
      setNotice({ kind: 'error', text: flatten(error) });
    } finally {
      setBusy(false);
    }
  };

  const download = async (name: string) => {
    setBusy(true);
    try {
      const response = await api.get(`/backup/${encodeURIComponent(name)}/`, { responseType: 'blob' });
      const url = URL.createObjectURL(response.data as Blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setNotice({ kind: 'error', text: flatten(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-50/50">
      <div className="mx-auto max-w-[1100px] px-5 py-10">
        <PageHead
          eyebrow="System"
          title="School year, rollover & backups"
          description="The two things that go wrong at the end of a school year: nobody remembers to move the classes up, and there is no copy of the database. Both are one button here."
          actions={
            <Btn variant="ghost" icon={RefreshCw} onClick={() => void load()}>
              Reload
            </Btn>
          }
        />

        {notice ? (
          <div className="mb-4">
            <Notice kind={notice.kind}>{notice.text}</Notice>
          </div>
        ) : null}

        {loading ? (
          <Panel>
            <div className="flex items-center justify-center gap-2 py-12 text-[12.5px] text-navy-400">
              <Loader2 size={15} className="animate-spin" /> Reading the system…
            </div>
          </Panel>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Current school year" icon={CalendarRange}>
              <form className="grid gap-3 sm:grid-cols-3" onSubmit={saveYear}>
                <label className="block">
                  <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                    Year
                  </span>
                  <input className={input} value={year} onChange={(event) => setYear(event.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                    Term
                  </span>
                  <select className={input} value={term} onChange={(event) => setTerm(event.target.value)}>
                    {TERMS.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <div className="flex items-end">
                  <Btn type="submit" loading={busy} className="w-full">
                    Save
                  </Btn>
                </div>
              </form>
              <ul className="mt-4 grid grid-cols-2 gap-2 text-[11.5px] text-navy-400">
                <li>Students: <strong className="text-navy-500">{info?.counts.students ?? 0}</strong></li>
                <li>Staff: <strong className="text-navy-500">{info?.counts.staff ?? 0}</strong></li>
                <li>Parents: <strong className="text-navy-500">{info?.counts.parents ?? 0}</strong></li>
                <li>Invoices: <strong className="text-navy-500">{info?.counts.invoices ?? 0}</strong></li>
                <li>Certificates: <strong className="text-navy-500">{info?.counts.certificates ?? 0}</strong></li>
                <li>Backups: <strong className="text-navy-500">{info?.counts.backups ?? 0}</strong></li>
              </ul>
            </Panel>

            <Panel title="End-of-year rollover" icon={RotateCw} description="L3 → L4, L4 → L5, L5 graduates. Fee structures are copied into the new year.">
              {rollover ? (
                <div className="space-y-3 text-[12px] text-navy-500">
                  <p>
                    {rollover.from_year} → <strong>{rollover.to_year}</strong>
                  </p>
                  <ul className="space-y-1">
                    <li>{rollover.promote_to_l4} students move from L3 to L4</li>
                    <li>{rollover.promote_to_l5} students move from L4 to L5</li>
                    <li>{rollover.graduating} students graduate and leave the active roll</li>
                  </ul>
                  <p className="text-[11px] text-red-500">
                    This cannot be undone. Take a backup first, then confirm.
                  </p>
                  <div className="flex flex-wrap items-end gap-2">
                    <input
                      className={`${input} max-w-[150px]`}
                      value={confirm}
                      onChange={(event) => setConfirm(event.target.value)}
                      placeholder="New year"
                    />
                    <Btn variant="danger" loading={busy} onClick={() => void runRollover(false)}>
                      Confirm rollover
                    </Btn>
                    <Btn variant="ghost" onClick={() => setRollover(null)}>
                      Cancel
                    </Btn>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[12px] leading-relaxed text-navy-400">
                    Preview first: the school shows how many students would move before anything is
                    written.
                  </p>
                  <Btn icon={ShieldCheck} loading={busy} onClick={() => void runRollover(true)}>
                    Preview the rollover
                  </Btn>
                </div>
              )}
            </Panel>

            <Panel
              title="Backups"
              icon={DatabaseBackup}
              description="A copy of the SQLite file, kept in server/data/backups. The last ten are kept."
              actions={
                <Btn icon={HardDriveDownload} loading={busy} onClick={() => void createBackup()}>
                  Back up now
                </Btn>
              }
            >
              {backups.length === 0 ? (
                <Empty>No backup yet. Press “Back up now” before you do anything important.</Empty>
              ) : (
                <ul className="divide-y divide-navy-50">
                  {backups.map((backup) => (
                    <li key={backup.name} className="flex items-center justify-between gap-3 py-2">
                      <div>
                        <p className="font-mono text-[11.5px] font-bold text-navy-500">{backup.name}</p>
                        <p className="text-[10.5px] text-navy-300">
                          {Math.round(backup.size / 1024)} KB ·{' '}
                          {new Date(backup.created).toLocaleString('en-GB')}
                        </p>
                      </div>
                      <Btn variant="ghost" icon={Download} onClick={() => void download(backup.name)}>
                        Download
                      </Btn>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Integrations" icon={ShieldCheck}>
              <ul className="space-y-2.5 text-[11.5px] leading-relaxed text-navy-400">
                <li className="flex items-start gap-2">
                  <Chip tone={info?.momo.configured ? 'green' : 'amber'}>MoMo</Chip>
                  <span className="flex-1">{info?.momo.note}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Chip tone={info?.messaging.sms.configured ? 'green' : 'amber'}>SMS</Chip>
                  <span className="flex-1">{info?.messaging.sms.note}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Chip tone={info?.messaging.whatsapp.configured ? 'green' : 'amber'}>WhatsApp</Chip>
                  <span className="flex-1">{info?.messaging.whatsapp.note}</span>
                </li>
              </ul>
              <p className="mt-3 border-t border-navy-50 pt-2.5 text-[10.5px] text-navy-300">
                Levels: {LEVELS.join(' · ')} — the TVET ladder of the school.
              </p>
            </Panel>
          </div>
        )}
      </div>
    </div>
  );
}
