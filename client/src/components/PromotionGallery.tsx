'use client';

import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Images, Users, X } from 'lucide-react';
import SafeImage from '@/components/SafeImage';
import type { Promotion } from '@/lib/content';

/**
 * The "Past promotions" strip on a trade page.
 *
 * Each card is one finished class — 2025/2026 · L3 · SOD — with the photos the
 * office added. Clicking a card opens the whole class: cover, the other photos
 * and the note written by the school.
 */
export default function PromotionGallery({ promotions }: { promotions: Promotion[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const [photo, setPhoto] = useState(0);

  if (!promotions.length) return null;

  const active = open === null ? null : promotions[open];
  const photos = active?.images ?? [];

  const show = (index: number) => {
    setOpen(index);
    setPhoto(0);
  };

  const step = (delta: number) => {
    if (!photos.length) return;
    setPhoto((current) => (current + delta + photos.length) % photos.length);
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promotions.map((promotion, index) => (
          <button
            key={promotion.id}
            type="button"
            onClick={() => show(index)}
            className="group overflow-hidden rounded-2xl border border-navy-100 bg-white text-left transition duration-300 hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-card"
          >
            <span className="relative block aspect-[4/3] w-full overflow-hidden bg-navy-100">
              {promotion.cover ? (
                <SafeImage
                  src={promotion.cover}
                  alt={`${promotion.label || `${promotion.level} ${promotion.trade?.code ?? ''}`} · ${promotion.year}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-navy-300">
                  <Images size={28} />
                </span>
              )}
              <span className="absolute left-3 top-3 rounded-full bg-navy-600/90 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-white">
                {promotion.year}
              </span>
              <span className="absolute right-3 top-3 rounded-full bg-gold-500 px-2 py-1 text-[10.5px] font-bold uppercase tracking-wide text-white">
                {promotion.level}
              </span>
              {promotion.image_count > 1 && (
                <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10.5px] font-bold text-navy-500">
                  <Images size={10} /> {promotion.image_count}
                </span>
              )}
            </span>
            <span className="block p-4">
              <span className="block font-heading text-[14px] font-extrabold leading-snug text-navy-500">
                {promotion.label || `${promotion.level} ${promotion.trade?.name ?? ''}`}
              </span>
              <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-navy-400">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays size={11} /> {promotion.year}
                </span>
                {promotion.graduates > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Users size={11} /> {promotion.graduates} graduates
                  </span>
                )}
                <span className="font-bold uppercase tracking-wide text-navy-500">
                  {promotion.trade?.code}
                </span>
              </span>
            </span>
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-600/70 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(null)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-[860px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-navy-100 px-5 py-4">
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-gold-600">
                  {active.year} · {active.level} · {active.trade?.code}
                </p>
                <h3 className="mt-1 font-heading text-[17px] font-extrabold text-navy-500">
                  {active.label || `${active.level} ${active.trade?.name ?? ''}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(null)}
                aria-label="Close"
                className="rounded-full p-2 text-navy-400 hover:bg-navy-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative flex-1 overflow-hidden bg-navy-500">
              {photos.length > 0 ? (
                <>
                  <div className="relative aspect-[16/10] w-full">
                    <SafeImage
                      src={photos[photo]}
                      alt={`${active.label || active.level} — photo ${photo + 1}`}
                      fill
                      sizes="(max-width: 860px) 100vw, 860px"
                      className="object-contain"
                    />
                  </div>
                  {photos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => step(-1)}
                        aria-label="Previous photo"
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 text-navy-600 hover:bg-white"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => step(1)}
                        aria-label="Next photo"
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 text-navy-600 hover:bg-white"
                      >
                        <ChevronRight size={16} />
                      </button>
                      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-navy-600/80 px-2.5 py-1 text-[10.5px] font-bold text-white">
                        {photo + 1} / {photos.length}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center text-white/50">
                  <Images size={32} />
                </div>
              )}
            </div>

            <div className="px-5 py-4">
              {active.description && (
                <p className="text-[12.5px] leading-relaxed text-navy-500">{active.description}</p>
              )}
              <p className="mt-2 text-[11.5px] text-navy-400">
                {active.graduates > 0
                  ? `${active.graduates} graduates of ${active.trade?.name ?? active.trade?.code} · `
                  : ''}
                {active.year}
              </p>
              {photos.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {photos.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setPhoto(index)}
                      className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                        index === photo ? 'ring-gold-500' : 'ring-transparent hover:ring-navy-200'
                      }`}
                    >
                      <SafeImage src={image} alt="" width={80} height={56} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
