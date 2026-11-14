import Image from 'next/image';
import { useId } from 'react';

type Props = {
  className?: string;
  sizes: string;
  priority?: boolean;
};

// The pressed well in seal.webp, in the image's own pixels (1082 × 1051).
const WELL = { cx: 522, cy: 492, r: 200 };

/** The gold wax seal with the couple's monogram pressed into its well. */
const WaxSeal = ({ className = '', sizes, priority }: Props) => {
  const clip = `${useId().replace(/:/g, '')}-well`;

  // Drawn in the image's coordinates and clipped to the well, so the
  // monogram scales with the seal and can never spill over its rim.
  // Two initials only: at 84px an ampersand between them is a smudge. The
  // stroke fattens the script's hairlines so they survive that size.
  const monogram = (fill: string, opacity: number, offset = 0) => (
    <g
      fill={fill}
      stroke={fill}
      strokeWidth='7'
      strokeLinejoin='round'
      opacity={opacity}
      transform={`translate(${offset} ${offset})`}
      fontSize='250'
      textAnchor='middle'
      className='iv-script'
    >
      <text x='452' y='578'>
        M
      </text>
      <text x='612' y='578'>
        L
      </text>
    </g>
  );

  return (
    <div className={`relative aspect-[1082/1051] ${className}`}>
      <Image src='/imgs/wedding/seal.webp' alt='' fill sizes={sizes} priority={priority} className='object-contain' />
      <svg viewBox='0 0 1082 1051' className='absolute inset-0 size-full' aria-hidden='true'>
        <defs>
          <clipPath id={clip}>
            <circle cx={WELL.cx} cy={WELL.cy} r={WELL.r} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clip})`}>
          {monogram('#fff0c8', 0.6, 4)}
          {monogram('#5a3c0e', 0.9)}
        </g>
      </svg>
    </div>
  );
};

export default WaxSeal;
