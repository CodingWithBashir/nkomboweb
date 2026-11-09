'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Image as ImageIcon, KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import RequireAuth from '@/components/RequireAuth';
import { loadImageSettings, saveImageSettings } from '@/lib/images';

export default function SettingsPage() {
  const [endpoint, setEndpoint] = useState('https://api.imgbb.com/1/upload');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const settings = await loadImageSettings();
        if (settings.endpoint) setEndpoint(settings.endpoint);
        setApiKey(settings.apiKey);
      } catch {
        setError('Could not read the current settings.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await saveImageSettings({ endpoint: endpoint.trim(), apiKey: apiKey.trim() });
      setMessage('Saved. New photo uploads will use this image host.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <RequireAuth roles={['headmaster', 'admin', 'dos']}>
      <div className="min-h-screen bg-navy-50/50">
        <div className="mx-auto max-w-[860px] px-5 py-10">
          <Link
            href="/dashboard/headmaster"
            className="inline-flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-[0.12em] text-navy-400 hover:text-navy-600"
          >
            <ArrowLeft size={13} /> Overview
          </Link>

          <h1 className="mt-4 font-heading text-[28px] font-extrabold text-navy-500">
            Site settings
          </h1>
          <p className="mt-1.5 max-w-[560px] text-[13px] leading-relaxed text-navy-400">
            Photos of teachers and students are hosted on an external image service (imgdb /
            imgbb). Paste the API key once — every upload from the dashboard will use it, and only
            the resulting image URL is stored in the school database.
          </p>

          <form onSubmit={save} className="mt-7 rounded-2xl border border-navy-100 bg-white p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-50 text-navy-500">
                <ImageIcon size={16} />
              </span>
              <div>
                <h2 className="font-heading text-[15px] font-extrabold text-navy-500">Image host</h2>
                <p className="text-[11.5px] text-navy-400">
                  Compatible with the imgbb upload API.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="mt-6 flex items-center gap-2 text-navy-400">
                <Loader2 size={15} className="animate-spin" /> Loading…
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                <label className="block">
                  <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.12em] text-navy-400">
                    Upload endpoint
                  </span>
                  <input
                    value={endpoint}
                    onChange={(event) => setEndpoint(event.target.value)}
                    placeholder="https://api.imgbb.com/1/upload"
                    className="w-full rounded-xl border border-navy-200 px-3.5 py-2.5 text-[13px] text-navy-600 outline-none focus:border-navy-400"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-[0.12em] text-navy-400">
                    <KeyRound size={12} /> API key
                  </span>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(event) => setApiKey(event.target.value)}
                    placeholder="e.g. 6d2f0b3a1c8e4f5a9b7c2d1e0f3a4b5c"
                    className="w-full rounded-xl border border-navy-200 px-3.5 py-2.5 text-[13px] text-navy-600 outline-none focus:border-navy-400"
                  />
                </label>

                <p className="rounded-xl bg-navy-50/70 px-3.5 py-3 text-[11.5px] leading-relaxed text-navy-400">
                  Get a free key at <span className="font-semibold text-navy-500">imgbb.com</span> →
                  About → API. Without a key you can still paste an image URL into any photo field.
                </p>

                {error && <p className="text-[12px] font-medium text-red-600">{error}</p>}
                {message && (
                  <p className="flex items-center gap-1.5 text-[12px] font-semibold text-gold-700">
                    <CheckCircle2 size={14} /> {message}
                  </p>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-[12.5px] font-bold text-white transition hover:bg-gold-600 disabled:opacity-60"
                  >
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    Save settings
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-navy-100 bg-white p-5">
            <ShieldCheck size={18} className="mt-0.5 text-gold-600" />
            <div>
              <h2 className="font-heading text-[13.5px] font-extrabold text-navy-500">
                Accounts are managed by Supabase
              </h2>
              <p className="mt-1 text-[12px] leading-relaxed text-navy-400">
                Staff and student sign-ins are stored in the school&apos;s Supabase project. New
                accounts start as students; the head teacher or director of studies can change a
                role from the staff page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
