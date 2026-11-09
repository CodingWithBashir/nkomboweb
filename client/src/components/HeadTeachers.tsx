import { Users } from 'lucide-react';
import { headTeachers } from '@/data/leadership';

/**
 * Leadership strip: circular profiles laid out in a single scrollable row,
 * mirroring the "Abasobanuzi" row on the reference site — photo, name, pill.
 */
export default function HeadTeachers() {
  return (
    <section id="head-teachers" className="overflow-hidden bg-navy-500 py-14">
      <div className="mx-auto max-w-[1240px] px-5">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-gold-300">
          Our Leadership
        </p>
        <h2 className="mt-2 font-heading text-[30px] font-extrabold leading-tight text-white sm:text-[36px]">
          Head Teachers
        </h2>
        <span className="mt-3 block h-[3px] w-[86px] bg-gold-400" />
        <p className="mt-4 max-w-[560px] text-[13px] leading-relaxed text-white/70">
          The people who keep the school running — from the head teacher&apos;s office to the
          bursary, the trades and the boarding house.
        </p>
      </div>

      <div className="mx-auto mt-9 max-w-[1240px] px-5">
        <div className="-mx-5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex w-max snap-x snap-mandatory gap-7">
            {headTeachers.map((person) => (
              <li key={person.name} className="w-[132px] shrink-0 snap-start text-center">
                <div className="mx-auto flex h-[124px] w-[124px] items-center justify-center rounded-full bg-white/[0.08] ring-1 ring-white/30 transition duration-300 hover:bg-white/[0.14] hover:ring-gold-400">
                  <span className="font-heading text-[34px] font-extrabold tracking-[-0.03em] text-white">
                    {person.initials}
                  </span>
                </div>
                <p className="mt-4 font-heading text-[13.5px] font-bold leading-snug text-white">
                  {person.name}
                </p>
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-3 py-1 text-[10.5px] font-bold leading-none text-white">
                  <Users size={11} strokeWidth={2.6} />
                  {person.role}
                </span>
                {person.since && (
                  <span className="mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
                    {person.since}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
