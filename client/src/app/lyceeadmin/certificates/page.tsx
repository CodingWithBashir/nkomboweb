'use client';

import { useCallback, useEffect, useState } from 'react';
import { Award, Copy, Loader2, Plus, QrCode, RefreshCw, ShieldCheck, ShieldX } from 'lucide-react';
import api from '@/lib/axios';
import {
  Btn,
  Chip,
  Empty,
  LEVELS,
  Notice,
  PageHead,
  Panel,
  flatten,
  input,
} from '@/components/admin/ui';

type Trade = { id: number; code: string; name: string };

type Student = { id: number; student_id: string; full_name: string; level: string };

type Certificate = {
  id: number;
  code: string;
  title: string;
  level: string;
  year: string;
  serial: string;
  issued_at: string;
  issued_by: string;
  revoked: boolean;
  note: string;
  student: { id: number; student_id: string; full_name: string } | null;
  trade: { id: number; code: string } | null;
};

const startYear = () => {
  const now = new Date();
  return now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
};

export default function CertificatesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [level, setLevel] = useState('L5');
  const [trade, setTrade] = useState('');
  const [form, setForm] = useState({
    student_id: '',
    title: '',
    year: `${startYear()}/${startYear() + 1}`,
    serial: '',
    note: '',
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    api
      .get('/academics/trades/', { params: { page_size: 100 } })
      .then((response) => setTrades(response.data.results ?? []))
      .catch(() => setTrades([]));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [certificatesResponse, studentsResponse] = await Promise.all([
        api.get('/certificates/'),
        api.get('/reports/', {
          params: { level, ...(trade ? { trade } : {}) },
        }),
      ]);
      setCertificates(certificatesResponse.data.results ?? []);
      setStudents(studentsResponse.data.results ?? []);
    } catch (error) {
      setNotice({ kind: 'error', text: flatten(error) });
    } finally {
      setLoading(false);
    }
  }, [level, trade]);

  useEffect(() => {
    void load();
  }, [load]);

  const issue = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.student_id) {
      setNotice({ kind: 'error', text: 'Choose the student who receives the certificate.' });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const { data } = await api.post('/certificates/', {
        student_id: Number(form.student_id),
        title: form.title,
        year: form.year,
        serial: form.serial,
        note: form.note,
      });
      setNotice({
        kind: 'ok',
        text: `Certificate ${data.code} issued. The QR code points to /verify?code=${data.code}.`,
      });
      setForm({ ...form, student_id: '', serial: '', note: '' });
      await load();
    } catch (error) {
      setNotice({ kind: 'error', text: flatten(error) });
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (certificate: Certificate) => {
    setBusy(true);
    setNotice(null);
    try {
      await api.patch(`/certificates/${certificate.id}/`, { revoked: !certificate.revoked });
      await load();
      setNotice({
        kind: 'ok',
        text: certificate.revoked ? 'Certificate restored.' : 'Certificate revoked — verification now fails.',
      });
    } catch (error) {
      setNotice({ kind: 'error', text: flatten(error) });
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async (code: string) => {
    const url = `${window.location.origin}/verify?code=${encodeURIComponent(code)}`;
    try {
      await navigator.clipboard.writeText(url);
      setNotice({ kind: 'ok', text: 'Verification link copied.' });
    } catch {
      setNotice({ kind: 'info', text: url });
    }
  };

  return (
    <div className="min-h-screen bg-navy-50/50">
      <div className="mx-auto max-w-[1100px] px-5 py-10">
        <PageHead
          eyebrow="Records"
          title="Certificates & verification"
          description="Every certificate gets a serial number and a public verification page. Anyone — an employer, a university — can check it at /verify without an account."
          actions={
            <Btn variant="ghost" icon={RefreshCw} onClick={() => void load()}>
              Reload
            </Btn>
          }
        />

        {notice ? (
          <div className="mb-4">
            <Notice kind={notice.kind}>
              <span className="break-all">{notice.text}</span>
            </Notice>
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <Panel title="Issued certificates" icon={Award}>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-[12.5px] text-navy-400">
                <Loader2 size={15} className="animate-spin" /> Loading certificates…
              </div>
            ) : certificates.length === 0 ? (
              <Empty>No certificate yet — issue the first one on the right.</Empty>
            ) : (
              <ul className="divide-y divide-navy-50">
                {certificates.map((certificate) => (
                  <li key={certificate.id} className="flex flex-wrap items-start gap-3 py-3">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=76x76&margin=0&data=${encodeURIComponent(
                        `/verify?code=${certificate.code}`
                      )}`}
                      alt={`QR code for ${certificate.code}`}
                      width={76}
                      height={76}
                      className="rounded border border-navy-100 bg-white p-1"
                    />
                    <div className="min-w-[220px] flex-1">
                      <p className="text-[12.5px] font-bold text-navy-500">
                        {certificate.student?.full_name ?? '—'}
                      </p>
                      <p className="text-[10.5px] text-navy-300">
                        {certificate.student?.student_id} · {certificate.title} · {certificate.level} ·{' '}
                        {certificate.year}
                      </p>
                      <p className="mt-1 font-mono text-[11px] font-bold text-gold-700">
                        {certificate.code}
                        {certificate.serial ? ` · ${certificate.serial}` : ''}
                      </p>
                      <p className="text-[10px] text-navy-300">
                        issued {new Date(certificate.issued_at).toLocaleDateString('en-GB')} by{' '}
                        {certificate.issued_by || 'office'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Chip tone={certificate.revoked ? 'red' : 'green'}>
                        {certificate.revoked ? <ShieldX size={10} /> : <ShieldCheck size={10} />}
                        {certificate.revoked ? 'revoked' : 'valid'}
                      </Chip>
                      <div className="flex gap-1.5">
                        <Btn variant="ghost" icon={Copy} onClick={() => void copyLink(certificate.code)}>
                          Link
                        </Btn>
                        <Btn
                          variant={certificate.revoked ? 'ghost' : 'danger'}
                          loading={busy}
                          onClick={() => void revoke(certificate)}
                        >
                          {certificate.revoked ? 'Restore' : 'Revoke'}
                        </Btn>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Issue a certificate" icon={Plus}>
            <form className="space-y-3" onSubmit={issue}>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                    Level
                  </span>
                  <select className={input} value={level} onChange={(event) => setLevel(event.target.value)}>
                    {LEVELS.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                    Trade
                  </span>
                  <select className={input} value={trade} onChange={(event) => setTrade(event.target.value)}>
                    <option value="">All</option>
                    {trades.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.code}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                  Student
                </span>
                <select
                  className={input}
                  value={form.student_id}
                  onChange={(event) => setForm({ ...form, student_id: event.target.value })}
                >
                  <option value="">Choose…</option>
                  {students.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.full_name} — {item.student_id}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                  Title
                </span>
                <input
                  className={input}
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="Level 5 Certificate in Software Development"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                    Year
                  </span>
                  <input
                    className={input}
                    value={form.year}
                    onChange={(event) => setForm({ ...form, year: event.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                    Serial
                  </span>
                  <input
                    className={input}
                    value={form.serial}
                    onChange={(event) => setForm({ ...form, serial: event.target.value })}
                    placeholder="SER-2026-014"
                  />
                </label>
              </div>
              <Btn type="submit" icon={QrCode} loading={busy} size="md" className="w-full">
                Issue certificate
              </Btn>
              <p className="text-[10.5px] leading-relaxed text-navy-300">
                The certificate number is generated automatically. Print it on the document next to the QR
                code so the holder can be checked from any phone.
              </p>
            </form>
          </Panel>
        </div>
      </div>
    </div>
  );
}
