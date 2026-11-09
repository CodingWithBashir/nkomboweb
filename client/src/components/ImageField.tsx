'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Link2, Loader2, X } from 'lucide-react';
import { uploadImage } from '@/lib/images';

type Props = {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  /** Shown inside the drop area while there is no image. */
  hint?: string;
};

/**
 * Photo field: upload to the configured image host, or paste a URL.
 * The uploaded URL is all that is stored in the school database.
 */
export default function ImageField({ label = 'Photo', value, onChange, hint }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [manual, setManual] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = async (file?: File | null) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      onChange(await uploadImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The upload failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-navy-400">
          {label}
        </span>
        <button
          type="button"
          onClick={() => setManual((v) => !v)}
          className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-navy-500 hover:underline"
        >
          <Link2 size={12} /> {manual ? 'Upload instead' : 'Paste a URL'}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-navy-200 bg-navy-50">
          {value ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus size={20} className="text-navy-300" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          {manual ? (
            <input
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="https://…"
              className="w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-[13px] text-navy-600 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100"
            />
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-full bg-navy-500 px-3.5 py-2 text-[12px] font-bold text-white transition hover:bg-navy-600 disabled:opacity-60"
              >
                {busy ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
                {busy ? 'Uploading…' : value ? 'Replace photo' : 'Upload photo'}
              </button>
              {value && (
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="inline-flex items-center gap-1 rounded-full border border-navy-200 px-3 py-2 text-[12px] font-semibold text-navy-400 hover:text-navy-600"
                >
                  <X size={12} /> Remove
                </button>
              )}
              <span className="text-[11px] text-navy-300">{hint ?? 'JPG or PNG, up to 8 MB'}</span>
            </div>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => pick(event.target.files?.[0])}
      />
      {error && <p className="text-[11.5px] font-medium text-red-600">{error}</p>}
    </div>
  );
}
