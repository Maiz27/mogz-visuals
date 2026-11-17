import Image from 'next/image';
import { useId } from 'react';

type Props = {
  className?: string;
  sizes: string;
  priority?: boolean;
};

// The centre of the pressed well in seal.webp, in the viewBox's units
// (1082 × 1051, the image's aspect), measured against the well's rim.
const WELL = { cx: 545, cy: 508 };

// The die's artwork is drawn around the well's centre, in image pixels.
const WREATH = { r: 246, from: 12, to: 164, pairs: 11, leaf: 66, width: 16, tilt: 30 };

const round = (n: number) => Math.round(n * 10) / 10;

/** One pointed leaf from `(x, y)`, `length` long, heading along `angle` (radians). */
const leaf = (x: number, y: number, angle: number, length: number, width: number) => {
  const [cos, sin] = [Math.cos(angle), Math.sin(angle)];
  const at = (along: number, across: number) =>
    `${round(x + along * cos - across * sin)} ${round(y + along * sin + across * cos)}`;
  return `M${at(0, 0)}Q${at(length * 0.4, -width * 2)} ${at(length, 0)}Q${at(length * 0.4, width * 2)} ${at(0, 0)}Z`;
};

/**
 * Two laurel branches rising from the bottom centre and stopping short of the
 * top. Angles run from the bottom of the circle (0°) up either side.
 */
const buildWreath = () => {
  const { r, from, to, pairs, tilt } = WREATH;
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const leaves: string[] = [];
  const stems: string[] = [];

  for (const side of [-1, 1]) {
    const point = (deg: number) => [side * r * Math.sin(rad(deg)), r * Math.cos(rad(deg))];
    const [x0, y0] = point(from - 5);
    const [x1, y1] = point(to - 6);
    stems.push(`M${round(x0)} ${round(y0)}A${r} ${r} 0 0 ${side === 1 ? 0 : 1} ${round(x1)} ${round(y1)}`);

    for (let i = 0; i < pairs; i++) {
      const deg = from + ((to - from) * i) / pairs;
      const [x, y] = point(deg);
      // The stem's heading here, climbing towards the top of the circle.
      const heading = Math.atan2(-Math.sin(rad(deg)), side * Math.cos(rad(deg)));
      // Leaves taper towards the tip of the branch.
      const scale = 1 - 0.3 * (i / (pairs - 1));
      const length = WREATH.leaf * scale;
      const width = WREATH.width * scale;
      leaves.push(leaf(x, y, heading - side * rad(tilt), length, width));
      leaves.push(leaf(x, y, heading + side * rad(tilt + 4), length * 0.86, width));
    }
    // A single leaf closes the tip of each branch.
    const [tx, ty] = point(to - 6);
    const tip = Math.atan2(-Math.sin(rad(to - 6)), side * Math.cos(rad(to - 6)));
    leaves.push(leaf(tx, ty, tip, WREATH.leaf * 0.62, WREATH.width * 0.7));
  }

  return { leaves: leaves.join(''), stems: stems.join('') };
};

const LAUREL = buildWreath();

// Each pass of the die: the lit far wall, the shadowed near wall, then the floor.
const PASSES = [
  { color: '#fff3cf', opacity: 0.75, offset: 5 },
  { color: '#4a2f08', opacity: 0.85, offset: -2.5 },
  { color: '#9a7220', opacity: 1, offset: 1 },
];

/** The gold wax seal with the couple's monogram pressed into its well. */
const WaxSeal = ({ className = '', sizes, priority }: Props) => {
  const id = useId().replace(/:/g, '');
  const die = `${id}-die`;

  return (
    <div className={`relative aspect-[1082/1051] ${className}`}>
      <Image src='/imgs/wedding/seal.webp' alt='' fill sizes={sizes} priority={priority} className='object-contain' />
      <svg viewBox='0 0 1082 1051' className='absolute inset-0 size-full' aria-hidden='true'>
        <defs>
          {/* Drawn once without colour; each pass below paints it through <use>. */}
          <g id={die}>
            <path d={LAUREL.stems} fill='none' strokeWidth='8' strokeLinecap='round' />
            <path d={LAUREL.leaves} stroke='none' />
            {/* The knot where the two branches meet. */}
            <path d={`M0 ${WREATH.r - 17}l13 17l-13 17l-13-17Z`} stroke='none' />
            <g className='iv-serif' stroke='none' textAnchor='middle'>
              <text x='-70' y='30' fontSize='232' fontWeight='600'>
                M
              </text>
              <text x='100' y='118' fontSize='232' fontWeight='600'>
                L
              </text>
              <text x='102' y='-56' fontSize='124' fontWeight='600' fontStyle='italic'>
                &amp;
              </text>
            </g>
          </g>
        </defs>
        <g transform={`translate(${WELL.cx} ${WELL.cy})`}>
          {PASSES.map(({ color, opacity, offset }) => (
            <use
              key={color}
              href={`#${die}`}
              fill={color}
              stroke={color}
              opacity={opacity}
              transform={`translate(${offset} ${offset})`}
            />
          ))}
        </g>
      </svg>
    </div>
  );
};

export default WaxSeal;
