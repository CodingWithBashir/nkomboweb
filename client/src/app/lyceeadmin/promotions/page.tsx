'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  Images,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import ImageField from '@/components/ImageField';
import SafeImage from '@/components/SafeImage';
import api from '@/lib/axios';

type Trade = { id: number; slug: string; code: string; name: string };

type Promotion = {
  id: number;
  trade_id: number;
  trade: { id: number; slug: string; code: string; name: string } | null;
  year: string;
  level: string;
  label: string;
  description: string;
  cover: string | null;
  images: string[];
  image_count: number;
  graduates: number;
  is_published: boolean;
  order: number;
};

type Form = {
  id: number | null;
  trade_id: string;
  year: string;
  level: string;
  label: string;
  description: string;
  cover: string;
  images: string[];
  graduates: string;
  is_published: boolean;
};

const LEVELS = ['L3', 'L4', 'L5'];

const emptyForm = (): Form => ({
  id: null,
  trade_id: '',
  year: '',
  level: 'L3',
  label: '',
  description: '',
  cover: '',
  images: [],
  graduates: '',
  is_published: true,
});

function flatten(error: unknown): string {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  if (!data) return 'Something went wrong. Please try again.';
  if (typeof data === 'string') return data;
  if (typeof data === 'object') {
    return Object.entries(data as Record<string, unknown>)
      .map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(' ') : String(value)}`)
      .join(' · ');
  }
  return 'Something went wrong. Please try again.';
}

/** The two academic years the school is most likely to be typing today. */
function yearSuggestions() {
  const now = new Date();
  const start = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  return [`${start}/${start + 1}`, `${start - 1}/${start}`, `${start - 2}/${start - 1}`];
}

export default function PromotionsPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState<Form | null>(null);
  const [extraImage, setExtraImage] = useState('');
  const [filterTrade, setFilterTrade] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [tradeResponse, promotionResponse] = await Promise.all([
        api.get('/academics/trades/?page_size=100'),
        api.get('/academics/promotions/', {
          params: { all: 'true', ...(filterTrade ? { trade: filterTrade } : {}) },
        }),
      ]);
      setTrades(tradeResponse.data.results ?? tradeResponse.data ?? []);
      setPromotions(promotionResponse.data.results ?? []);
    } catch (err) {
      setError(flatten(err));
    } finally {
      setLoading(false);
    }
  }, [filterTrade]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const startNew = () => {
    setForm({ ...emptyForm(), trade_id: filterTrade ? String(trades.find((t) => t.slug === filterTrade)?.id ?? '') : '', year: yearSuggestions()[0] });
    setExtraImage('');
  };

  const startEdit = (promotion: Promotion) => {
    setForm({
      id: promotion.id,
      trade_id: String(promotion.trade_id),
      year: promotion.year,
      level: promotion.level,
      label: promotion.label,
      description: promotion.description,
      cover: promotion.cover ?? '',
      images: promotion.images.filter((image) => image !== promotion.cover),
      graduates: promotion.graduates ? String(promotion.graduates) : '',
      is_published: promotion.is_published,
    });
    setExtraImage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        trade_id: Number(form.trade_id),
        year: form.year.trim(),
        level: form.level,
        label: form.label.trim(),
        description: form.description.trim(),
        cover: form.cover.trim(),
        images: form.images.filter(Boolean),
        graduates: Number(form.graduates) || 0,
        is_published: form.is_published,
      };
      if (form.id) {
        await api.patch(`/academics/promotions/${form.id}/`, payload);
        setNotice('Promotion updated.');
      } else {
        await api.post('/academics/promotions/', payload);
        setNotice('Promotion added — it is on the trade page now.');
      }
      setForm(null);
      await load();
    } catch (err) {
      setError(flatten(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (promotion: Promotion) => {
    if (
      !window.confirm(
        `Delete the ${promotion.year} ${promotion.level} promotion of ${promotion.trade?.code}?\n\nThe photos stay on the image host, but the class disappears from the website.`
      )
    ) {
      return;
    }
    try {
      await api.delete(`/academics/promotions/${promotion.id}/`);
      setNotice('Promotion deleted.');
      await load();
    } catch (err) {
      setError(flatten(err));
    }
  };

  const togglePublished = async (promotion: Promotion) => {
    try {
      await api.patch(`/academics/promotions/${promotion.id}/`, {
        is_published: !promotion.is_published,
      });
      await load();
    } catch (err) {
      setError(flatten(err));
    }
  };

  const grouped = useMemo(() => {
    const map = new Map<string, Promotion[]>();
    for (const promotion of promotions) {
      const key = promotion.trade?.code ?? '—';
      map.set(key, [...(map.get(key) ?? []), promotion]);
    }
    return Array.from(map.entries());
  }, [promotions]);

  return (
    <>
      <div className="min-h-screen bg-navy-50/50">
        <div className="mx-auto max-w-[1100px] px-5 py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-gold-600">
                Alumni
              </p>
              <h1 className="mt-2 font-heading text-[28px] font-extrabold text-navy-500">
                Past promotions
              </h1>
              <p className="mt-1.5 max-w-[640px] text-[13px] leading-relaxed text-navy-400">
                Every class that finished a trade — for example <strong>2025/2026 · Level 3 ·
                SOD</strong>. Add the year, the level and the photos, and they appear on that
                trade&apos;s page under &ldquo;Past promotions&rdquo;.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={startNew}
                className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-4 py-2.5 text-[12.5px] font-bold text-white hover:bg-gold-600"
              >
                <Plus size={14} /> Add a promotion
              </button>
              <button
                type="button"
                onClick={() => void load()}
                className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white px-4 py-2.5 text-[12.5px] font-bold text-navy-500 hover:border-navy-300"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
          </div>

          {(notice || error) && (
            <p
              className={`mt-5 rounded-xl px-4 py-3 text-[12.5px] font-medium ${
                error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {error || notice}
            </p>
          )}

          {/* editor */}
          {form && (
            <form
              onSubmit={save}
              className="mt-6 rounded-2xl border border-navy-100 bg-white p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-[16px] font-extrabold text-navy-500">
                    {form.id ? 'Edit promotion' : 'New promotion'}
                  </h2>
                  <p className="mt-1 text-[12px] text-navy-400">
                    The year is written the way the school says it, e.g. 2025/2026.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm(null)}
                  className="rounded-full p-2 text-navy-400 hover:bg-navy-50"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.12em] text-navy-400">
                    Trade
                  </span>
                  <select
                    required
                    value={form.trade_id}
                    onChange={(event) => setForm({ ...form, trade_id: event.target.value })}
                    className="w-full rounded-xl border border-navy-200 px-3.5 py-2.5 text-[13px] text-navy-600 outline-none focus:border-navy-400"
                  >
                    <option value="">Choose a trade…</option>
                    {trades.map((trade) => (
                      <option key={trade.id} value={trade.id}>
                        {trade.code} — {trade.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.12em] text-navy-400">
                    Promotion year
                  </span>
                  <input
                    required
                    value={form.year}
                    onChange={(event) => setForm({ ...form, year: event.target.value })}
                    placeholder="2025/2026"
                    className="w-full rounded-xl border border-navy-200 px-3.5 py-2.5 text-[13px] text-navy-600 outline-none focus:border-navy-400"
                  />
                  <span className="mt-1.5 flex flex-wrap gap-1.5">
                    {yearSuggestions().map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => setForm({ ...form, year })}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          form.year === year
                            ? 'bg-navy-500 text-white'
                            : 'bg-navy-50 text-navy-500 hover:bg-navy-100'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </span>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.12em] text-navy-400">
                    Level
                  </span>
                  <div className="flex gap-2">
                    {LEVELS.map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setForm({ ...form, level })}
                        className={`flex-1 rounded-xl border px-3 py-2.5 text-[12.5px] font-bold transition ${
                          form.level === level
                            ? 'border-navy-500 bg-navy-500 text-white'
                            : 'border-navy-200 bg-white text-navy-500 hover:border-navy-300'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.12em] text-navy-400">
                    Graduates
                  </span>
                  <div className="relative">
                    <Users size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-300" />
                    <input
                      type="number"
                      min={0}
                      value={form.graduates}
                      onChange={(event) => setForm({ ...form, graduates: event.target.value })}
                      placeholder="28"
                      className="w-full rounded-xl border border-navy-200 py-2.5 pl-10 pr-3 text-[13px] text-navy-600 outline-none focus:border-navy-400"
                    />
                  </div>
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.12em] text-navy-400">
                    Title on the website
                  </span>
                  <input
                    value={form.label}
                    onChange={(event) => setForm({ ...form, label: event.target.value })}
                    placeholder="Level 5 Software Development"
                    className="w-full rounded-xl border border-navy-200 px-3.5 py-2.5 text-[13px] text-navy-600 outline-none focus:border-navy-400"
                  />
                  <span className="mt-1 block text-[11px] text-navy-300">
                    Leave empty and we write &ldquo;{form.level} · {form.year || 'year'}&rdquo; for you.
                  </span>
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.12em] text-navy-400">
                    Note (optional)
                  </span>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    placeholder="What this class is remembered for…"
                    className="w-full rounded-xl border border-navy-200 px-3.5 py-2.5 text-[13px] leading-relaxed text-navy-600 outline-none focus:border-navy-400"
                  />
                </label>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-1.5 text-[11.5px] font-bold uppercase tracking-[0.12em] text-navy-400">
                    Cover photo
                  </p>
                  <ImageField
                    label="Cover"
                    value={form.cover}
                    onChange={(cover) => setForm({ ...form, cover })}
                    hint="Shown on the trade page"
                  />
                </div>

                <div>
                  <p className="mb-1.5 text-[11.5px] font-bold uppercase tracking-[0.12em] text-navy-400">
                    Album ({form.images.length} more)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {form.images.map((image, index) => (
                      <div
                        key={`${image}-${index}`}
                        className="relative h-16 w-20 overflow-hidden rounded-lg ring-1 ring-navy-100"
                      >
                        <SafeImage src={image} alt="" width={80} height={64} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setForm({ ...form, images: form.images.filter((_, i) => i !== index) })
                          }
                          className="absolute right-1 top-1 rounded-full bg-white/90 p-0.5 text-red-600"
                          aria-label="Remove photo"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                    {form.images.length === 0 && (
                      <p className="flex h-16 items-center rounded-lg bg-navy-50 px-3 text-[11.5px] text-navy-400">
                        No extra photos yet
                      </p>
                    )}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input
                      value={extraImage}
                      onChange={(event) => setExtraImage(event.target.value)}
                      placeholder="https://i.ibb.co/…"
                      className="min-w-0 flex-1 rounded-xl border border-navy-200 px-3 py-2 text-[12px] text-navy-600 outline-none focus:border-navy-400"
                    />
                    <button
                      type="button"
                      disabled={!extraImage.trim()}
                      onClick={() => {
                        setForm({ ...form, images: [...form.images, extraImage.trim()] });
                        setExtraImage('');
                      }}
                      className="rounded-xl bg-navy-500 px-3 py-2 text-[12px] font-bold text-white disabled:opacity-40"
                    >
                      Add
                    </button>
                  </div>
                  <p className="mt-1.5 text-[11px] text-navy-300">
                    Paste a photo link, or upload with the cover field then copy it here.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 text-[12.5px] font-semibold text-navy-500">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(event) => setForm({ ...form, is_published: event.target.checked })}
                    className="h-4 w-4 rounded border-navy-300"
                  />
                  Show this promotion on the website
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForm(null)}
                    className="rounded-full border border-navy-200 px-4 py-2 text-[12.5px] font-bold text-navy-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-4 py-2 text-[12.5px] font-bold text-white hover:bg-gold-600 disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                    {form.id ? 'Save changes' : 'Add promotion'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* filters */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterTrade('')}
              className={`rounded-full px-3.5 py-1.5 text-[11.5px] font-bold ${
                filterTrade === '' ? 'bg-navy-500 text-white' : 'bg-white text-navy-500 hover:bg-navy-100'
              }`}
            >
              All trades
            </button>
            {trades.map((trade) => (
              <button
                key={trade.slug}
                type="button"
                onClick={() => setFilterTrade(trade.slug)}
                className={`rounded-full px-3.5 py-1.5 text-[11.5px] font-bold ${
                  filterTrade === trade.slug
                    ? 'bg-navy-500 text-white'
                    : 'bg-white text-navy-500 hover:bg-navy-100'
                }`}
              >
                {trade.code}
              </button>
            ))}
          </div>

          {/* list */}
          {loading ? (
            <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-navy-100 bg-white py-16 text-[13px] text-navy-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading promotions…
            </div>
          ) : promotions.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-navy-100 bg-white py-16 text-center">
              <Images className="mx-auto h-8 w-8 text-navy-200" />
              <p className="mt-3 font-heading text-[15px] font-extrabold text-navy-500">
                No promotions yet
              </p>
              <p className="mt-1 text-[12.5px] text-navy-400">
                Add the first finished class and its photos — the trade page will show it straight
                away.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {grouped.map(([code, items]) => (
                <div key={code}>
                  <p className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.18em] text-navy-300">
                    {code} · {items.length} promotion{items.length === 1 ? '' : 's'}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((promotion) => (
                      <div
                        key={promotion.id}
                        className={`overflow-hidden rounded-2xl border bg-white ${
                          promotion.is_published ? 'border-navy-100' : 'border-dashed border-amber-300'
                        }`}
                      >
                        <div className="relative aspect-[4/3] bg-navy-100">
                          {promotion.cover ? (
                            <SafeImage
                              src={promotion.cover}
                              alt=""
                              fill
                              sizes="320px"
                              className="object-cover"
                            />
                          ) : (
                            <span className="flex h-full items-center justify-center text-navy-300">
                              <Images size={24} />
                            </span>
                          )}
                          <span className="absolute left-2.5 top-2.5 rounded-full bg-navy-600/90 px-2 py-0.5 text-[10px] font-bold text-white">
                            {promotion.year}
                          </span>
                          <span className="absolute right-2.5 top-2.5 rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-bold text-white">
                            {promotion.level}
                          </span>
                          {!promotion.is_published && (
                            <span className="absolute bottom-2.5 left-2.5 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                              Hidden
                            </span>
                          )}
                        </div>
                        <div className="p-3.5">
                          <p className="font-heading text-[13px] font-extrabold leading-snug text-navy-500">
                            {promotion.label || `${promotion.level} · ${promotion.year}`}
                          </p>
                          <p className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-navy-400">
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays size={10} /> {promotion.year}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Images size={10} /> {promotion.image_count}
                            </span>
                            {promotion.graduates > 0 && (
                              <span className="inline-flex items-center gap-1">
                                <Users size={10} /> {promotion.graduates}
                              </span>
                            )}
                          </p>
                          <div className="mt-2.5 flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => startEdit(promotion)}
                              className="inline-flex items-center gap-1 rounded-full border border-navy-200 px-2.5 py-1.5 text-[11px] font-bold text-navy-500 hover:border-navy-300"
                            >
                              <Pencil size={11} /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void togglePublished(promotion)}
                              className="inline-flex items-center gap-1 rounded-full border border-navy-200 px-2.5 py-1.5 text-[11px] font-bold text-navy-500 hover:border-navy-300"
                            >
                              {promotion.is_published ? <EyeOff size={11} /> : <Eye size={11} />}
                              {promotion.is_published ? 'Hide' : 'Show'}
                            </button>
                            <button
                              type="button"
                              onClick={() => void remove(promotion)}
                              className="ml-auto rounded-full p-1.5 text-navy-300 hover:bg-red-50 hover:text-red-600"
                              aria-label="Delete promotion"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="mt-5 flex items-start gap-2 rounded-2xl border border-navy-100 bg-white px-4 py-3 text-[12px] leading-relaxed text-navy-400">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
            These photos also appear in the trade&apos;s public page under &ldquo;Past
            promotions&rdquo;, together with the year, level and number of graduates. The website
            refreshes within ten minutes after a change.
          </p>
        </div>
      </div>
    </>
  );
}
