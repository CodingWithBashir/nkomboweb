import Link from 'next/link';

type LogoProps = {
  /** `dark` = for light backgrounds, `light` = reversed logo for dark backgrounds */
  variant?: 'dark' | 'light';
  /** Show the tagline under the school name */
  showTagline?: boolean;
  className?: string;
  href?: string;
};

type CrestProps = {
  variant?: 'dark' | 'light';
  /** Height of the crest in pixels — the mark keeps its 241:148 proportions */
  size?: number;
  className?: string;
};

const RATIO = 241 / 148;

/**
 * The Lycée de Nyanza crest: the "L" and "N" letterforms built from overlapping
 * blocks, framed by a solid border — the school's own logo, in its official
 * colours (red #ED1C24 and blue #2E3192 on white).
 */
export function Crest({ size = 56, className = '' }: CrestProps) {
  const height = size;
  const width = Math.round(size * RATIO);

  // the logo keeps its brand colours on light and navy surfaces alike
  const frame = '#2E3192';
  const plate = '#FFFFFF';
  const ink = '#ED1C24';
  const accent = '#2E3192';

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 241 148"
      role="img"
      aria-label="Lycée de Nyanza crest"
      className={`shrink-0 ${className}`}
    >
      {/* frame + plate */}
      <rect width="241" height="148" fill={frame} />
      <rect x="11" y="11" width="218" height="128" fill={plate} />

      {/* L — stem and foot, with the square block overlapping its shoulder */}
      <path d="M24 30h27v48h57v18H24z" fill={ink} />
      <rect x="51" y="22" width="67" height="56" fill={accent} />

      {/* N — two stems joined by the diagonal */}
      <rect x="133" y="30" width="23" height="66" fill={ink} />
      <rect x="196" y="30" width="22" height="66" fill={ink} />
      <path d="M133 30h23l62 66h-22z" fill={ink} />

      {/* the two blocks that cut across the N */}
      <path d="M156 22h40v40z" fill={accent} />
      <path d="M156 66v36h40z" fill={accent} />
    </svg>
  );
}

export default function Logo({
  variant = 'dark',
  showTagline = true,
  className = '',
  href = '/',
}: LogoProps) {
  const name = variant === 'light' ? 'text-white' : 'text-navy-500';
  // dark navbar (inner pages) uses the italic tagline, light navbar the tracked one
  const taglineClass =
    variant === 'light'
      ? 'mt-1 text-[11.5px] font-medium italic text-white/70'
      : 'mt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-navy-400';

  return (
    <Link href={href} className={`flex items-center gap-3 ${className}`}>
      <Crest variant={variant} size={54} />
      <span className="flex flex-col leading-none">
        <span
          className={`font-heading text-[21px] font-extrabold uppercase tracking-[0.01em] ${name}`}
        >
          Lyc&eacute;e <span className="text-[15px] font-bold normal-case">de</span> Nyanza
        </span>
        {showTagline && (
          <span className={taglineClass}>Excellence Through Discipline</span>
        )}
      </span>
    </Link>
  );
}
