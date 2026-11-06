import Link from 'next/link';

type LogoProps = {
  /** `dark` = for light backgrounds (navy monogram), `light` = for navy backgrounds (gold monogram) */
  variant?: 'dark' | 'light';
  /** Show the tagline under the school name */
  showTagline?: boolean;
  className?: string;
  href?: string;
};

const LEFT_ANGLES = [128, 146, 164, 182, 200, 218, 236];

/**
 * Laurel crest: gold wreath + "LN" monogram, as used in the school identity.
 */
export function Crest({ variant = 'dark', size = 56 }: { variant?: 'dark' | 'light'; size?: number }) {
  const monogram = variant === 'light' ? '#F2B134' : '#0A2540';
  const leaf = '#F2B134';
  const leafDeep = variant === 'light' ? '#E8A21E' : '#D8A02A';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      {/* inner ring */}
      <circle cx="32" cy="32" r="21.5" stroke={leaf} strokeWidth="1.4" strokeOpacity="0.85" />
      <circle cx="32" cy="32" r="18.5" stroke={leaf} strokeWidth="0.7" strokeOpacity="0.55" />

      {/* laurel branches */}
      {[1, -1].map((dir) => (
        <g key={dir} transform={dir === -1 ? 'translate(64,0) scale(-1,1)' : undefined}>
          {LEFT_ANGLES.map((angle, i) => (
            <g key={angle} transform={`rotate(${angle} 32 32)`}>
              <ellipse
                cx="32"
                cy={i % 2 === 0 ? 6.2 : 8.4}
                rx="2.5"
                ry={i % 2 === 0 ? 5.6 : 4.6}
                fill={i % 2 === 0 ? leaf : leafDeep}
                fillOpacity={0.95}
                transform={`rotate(${i % 2 === 0 ? 24 : 30} 32 ${i % 2 === 0 ? 6.2 : 8.4})`}
              />
            </g>
          ))}
        </g>
      ))}

      {/* monogram */}
      <text
        x="32"
        y="32"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Poppins, Inter, system-ui, sans-serif"
        fontSize="19"
        fontWeight="800"
        letterSpacing="-0.5"
        fill={monogram}
      >
        LN
      </text>
      <path d="M22 42.5h20" stroke={leaf} strokeWidth="1.5" strokeLinecap="round" />
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
      ? 'mt-1 text-[11.5px] font-medium italic text-gold-400'
      : 'mt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-gold-500';

  return (
    <Link href={href} className={`flex items-center gap-3 ${className}`}>
      <Crest variant={variant} size={58} />
      <span className="flex flex-col leading-none">
        <span
          className={`font-heading text-[22px] font-extrabold uppercase tracking-[0.01em] ${name}`}
        >
          Lyc&eacute;e de Nyanza
        </span>
        {showTagline && (
          <span className={taglineClass}>Excellence Through Discipline</span>
        )}
      </span>
    </Link>
  );
}
