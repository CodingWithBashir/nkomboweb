'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BadgeCheck, Loader2, Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import api from '@/lib/axios';
import { Crest } from '@/components/Logo';
import { LanguageSwitch, useLocale } from '@/lib/i18n';

type Certificate = {
  code: string;
  title: string;
  level: string;
  year: string;
  serial: string;
  issued_at: string;
  issued_by: string;
  revoked: boolean;
  student: { student_id: string; full_name: string } | null;
  trade: { code: string } | null;
};

type Result = {
  valid: boolean;
  revoked?: boolean;
  detail?: string;
  certificate?: Certificate;
  checked_at?: string;
};

function Verifier() {
  const { t } = useLocale();
  const params = useSearchParams();
  const initial = (params.get('code') ?? '').trim();
  const [code, setCode] = useState(initial);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const check = useCallback(async (value: string) => {
    const cleaned = value.trim().toUpperCase();
    if (!cleaned) {
      setResult(null);
      setError(t('verify.emptycode'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/certificates/verify/', { params: { code: cleaned } });
      setResult(data as Result);
    } catch (requestError) {
      setResult(null);
      setError(
        (requestError as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
          'We could not reach the verification service. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (initial) void check(initial);
  }, [initial, check]);

  const certificate = result?.certificate;
  const valid = Boolean(result?.valid);

  return (
    <main className="min-h-screen bg-navy-50/50">
      <header className="bg-navy-500 px-4 py-6">
        <div className="mx-auto flex max-w-[860px] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Crest variant="light" size={42} />
            <span className="flex flex-col leading-none">
              <span className="font-heading text-[15px] font-extrabold uppercase text-white">
                Lycée de Nyanza
              </span>
              <span className="mt-1 text-[10px] font-medium italic text-gold-400">
                {t('brand.verify')}
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitch compact />
            <Link
              href="/"
              className="rounded-full border border-white/25 px-3 py-1.5 text-[11.5px] font-semibold text-white/90 transition hover:bg-white/10"
            >
              {t('common.website')}
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[860px] px-4 py-10">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-gold-600">
          {t('verify.eyebrow')}
        </p>
        <h1 className="mt-2 font-heading text-[30px] font-extrabold leading-tight text-navy-500">
          {t('verify.title')}
        </h1>
        <p className="mt-2 max-w-[600px] text-[13px] leading-relaxed text-navy-400">
          {t('verify.lede')}
        </p>

        <form
          className="mt-5 flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void check(code);
          }}
        >
          <div className="relative min-w-[240px] flex-1">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-3.5 text-navy-300" />
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder={t('verify.placeholder')}
              className="w-full rounded-xl border border-navy-100 bg-white py-3 pl-10 pr-3 text-[13.5px] font-semibold tracking-wide text-navy-600 outline-none transition focus:border-navy-400 focus:ring-2 focus:ring-navy-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-navy-500 px-5 py-3 text-[13px] font-bold text-white transition hover:bg-navy-600 disabled:opacity-60"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <BadgeCheck size={15} />}
            {t('verify.button')}
          </button>
        </form>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] font-medium text-red-700">
            {error}
          </p>
        ) : null}

        {result ? (
          <section
            className={`mt-6 rounded-xl border p-6 ${
              valid ? 'border-emerald-200 bg-white' : 'border-red-200 bg-white'
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`flex h-10 w-10 flex-none items-center justify-center rounded-full ${
                  valid ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                }`}
              >
                {valid ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
              </span>
              <div className="flex-1">
                <h2 className="font-heading text-[19px] font-extrabold text-navy-500">
                  {valid ? t('verify.valid') : result.revoked ? t('verify.revoked') : t('verify.notfound')}
                </h2>
                <p className="mt-1 text-[12.5px] leading-relaxed text-navy-400">
                  {valid
                    ? t('verify.validbody')
                    : result.detail ?? t('verify.notfoundbody')}
                </p>

                {certificate ? (
                  <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      [t('verify.holder'), certificate.student?.full_name ?? '—'],
                      [t('verify.studentno'), certificate.student?.student_id ?? '—'],
                      [t('verify.certificate'), certificate.title],
                      [
                        t('verify.leveltrade'),
                        `${certificate.level}${certificate.trade ? ` · ${certificate.trade.code}` : ''}`,
                      ],
                      [t('verify.serial'), certificate.serial || '—'],
                      [t('verify.issued'), new Date(certificate.issued_at).toLocaleDateString('en-GB')],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-navy-300">
                          {label}
                        </dt>
                        <dd className="mt-0.5 text-[12.5px] font-semibold text-navy-500">{value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}

                <p className="mt-4 font-mono text-[11px] text-navy-300">
                  {certificate?.code ?? ''} · {t('verify.checked')}{' '}
                  {result.checked_at ? new Date(result.checked_at).toLocaleString('en-GB') : ''}
                </p>
              </div>
            </div>
          </section>
        ) : null}

        <p className="mt-8 text-[11.5px] leading-relaxed text-navy-300">{t('verify.doubt')}</p>
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center gap-2 text-[13px] text-navy-400">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </div>
      }
    >
      <Verifier />
    </Suspense>
  );
}
