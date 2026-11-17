// Line drawings of the two venues, traced from photographs of the real
// buildings. Every stroke is a separate shape so GSAP can draw them on.

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.1,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const accent = 'text-[var(--iv-accent)]';

/** A square stone bell tower with a louvred belfry, as at All Saints. */
const tower = (x: number) => {
  const w = 46;
  const openings = [x + 6, x + 19, x + 32];
  return (
    <g key={x}>
      <path d={`M${x} 196V58H${x + w}V196`} />
      <path d={`M${x - 4} 58H${x + w + 4}`} />
      <path d={`M${x - 2} 58V26H${x + w + 2}V58`} />
      <path d={`M${x - 6} 26H${x + w + 6}`} />
      <path d={`M${x - 4} 21H${x + w + 4}`} />
      {openings.map((ox) => (
        <path key={ox} d={`M${ox} 52V38a4 4 0 0 1 8 0V52`} />
      ))}
      {openings.map((ox) => (
        <path key={`s${ox}`} d={`M${ox + 1} 43h6M${ox + 1} 47h6`} strokeOpacity={0.6} />
      ))}
      <path d={`M${x + 19} 92H${x + 27}V118H${x + 19}Z`} />
      <path d={`M${x + 19} 140H${x + 27}V160H${x + 19}Z`} />
      {/* A few stone courses, not a full hatch. */}
      <path
        d={`M${x + 4} 74h8M${x + 30} 80h10M${x + 6} 132h6M${x + 32} 150h8M${x + 4} 176h10M${x + 32} 184h6`}
        strokeOpacity={0.55}
      />
    </g>
  );
};

const cypress = (x: number) => (
  <path key={x} d={`M${x} 196C${x - 9} 166 ${x - 7} 128 ${x + 1} 104C${x + 9} 128 ${x + 12} 166 ${x + 3} 196`} />
);

export const CathedralArt = ({ className = '' }: { className?: string }) => (
  <svg data-iv='draw' viewBox='0 0 300 210' className={className} aria-hidden='true'>
    <g {...stroke}>
      <path d='M8 196H292' />
      {cypress(30)}
      {cypress(268)}

      {/* Side wings */}
      <path d='M46 196V142H82' />
      <path d='M42 142L62 128H82' />
      <path d='M52 170V158a3 3 0 0 1 6 0V170M66 170V158a3 3 0 0 1 6 0V170' />
      <path d='M218 196V142H254V196' />
      <path d='M218 128H238L258 142' />
      <path d='M228 170V158a3 3 0 0 1 6 0V170M242 170V158a3 3 0 0 1 6 0V170' />

      {tower(82)}
      {tower(172)}

      {/* The front between the towers: gable, cross and arched door. */}
      <path d='M128 112L150 92L172 112' />
      <path d='M128 112H172' strokeOpacity={0.5} />
      <path d='M130 168H170' />
      <path d='M136 196V176a14 14 0 0 1 28 0V196' />
      <path d='M150 162V196' />
      <path d='M126 196v-4h48v4' />
    </g>
    <path d='M150 118V152M140 128H160' {...stroke} strokeWidth={2.2} className={accent} />
  </svg>
);

// Where the string lights hang: points on the first catenary.
const bulbs = Array.from({ length: 9 }, (_, i) => {
  const t = (i + 1) / 10;
  const x = (1 - t) ** 2 * 24 + 2 * (1 - t) * t * 150 + t ** 2 * 276;
  const y = (1 - t) ** 2 * 46 + 2 * (1 - t) * t * 96 + t ** 2 * 46;
  return [x, y] as const;
});

export const CourtArt = ({ className = '' }: { className?: string }) => (
  <svg data-iv='draw' viewBox='0 0 300 210' className={className} aria-hidden='true'>
    <g {...stroke}>
      <path d='M8 196H292' />

      {/* Light poles and the strings between them. */}
      <path d='M24 196V40M20 40H28M276 196V40M272 40H280' />
      <path d='M24 46Q150 96 276 46' />
      <path d='M24 58Q150 112 276 58' strokeOpacity={0.6} />

      {/* Tiered stands behind the court. */}
      <path d='M60 124H240M66 114H234M72 104H228M78 94H222' />
      <path d='M60 124L78 94M240 124L222 94' />
      <path d='M120 94V36M150 94V30M180 94V36' />

      {/* The court, in perspective, with its lines and the net. */}
      <path d='M44 196L84 136H216L256 196Z' />
      <path d='M74 151H226M54 181H246' strokeOpacity={0.6} />
      <path d='M66 166V128M234 166V128' />
      <path d='M66 130H234M66 146H234' />
      <path
        d={Array.from({ length: 11 }, (_, i) => `M${80 + i * 14} 130V146`).join('')}
        strokeOpacity={0.5}
      />
    </g>
    <g {...stroke} className={accent}>
      <path d='M120 36h16l-4 5 4 5h-16M150 30h16l-4 5 4 5h-16M180 36h16l-4 5 4 5h-16' />
      {bulbs.map(([x, y]) => (
        <circle key={x} cx={x} cy={y + 3.5} r={2.2} />
      ))}
    </g>
  </svg>
);
