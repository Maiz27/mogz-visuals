import type { ComponentType } from 'react';
import WaxSeal from './WaxSeal';
import { INVITE } from '@/lib/invite';

type Side = 'top' | 'bottom' | 'left' | 'right';

/**
 * The four flaps of the envelope, each a triangle meeting at the seal. Every
 * flap spans the whole cover, so the paper, the embossing and the seal line
 * up across them; each shows only its own triangle. The side flaps reach a
 * touch past the centre, under the top and bottom flaps, so no seam shows.
 */
const FLAPS: Record<Side, { clip: string; hinge: string; z: number }> = {
  left: { clip: 'polygon(0 0, 51% 50%, 0 100%)', hinge: 'left center', z: 1 },
  right: { clip: 'polygon(100% 0, 49% 50%, 100% 100%)', hinge: 'right center', z: 1 },
  top: { clip: 'polygon(0 0, 100% 0, 50% 50%)', hinge: 'center top', z: 2 },
  bottom: { clip: 'polygon(0 100%, 100% 100%, 50% 50%)', hinge: 'center bottom', z: 2 },
};

// The edges each flap folds along, in a 100 × 100 box.
const CREASES: Record<Side, string[]> = {
  left: [],
  right: [],
  top: ['M0 0L50 50', 'M100 0L50 50'],
  bottom: ['M0 100L50 50', 'M100 100L50 50'],
};

const LEAF = '/imgs/wedding/ornament-leaf.webp';

/**
 * Foliage pressed into the paper on each flap, as [left, top, width, rotation,
 * mirrored] in percent of the cover. Each sits inside its own flap's triangle.
 */
const FOLIAGE: Record<Side, [string, string, string, number, boolean][]> = {
  // The corners only: the names are printed across the middle of this flap.
  top: [
    ['-14%', '-9%', '36%', 125, false],
    ['78%', '-9%', '36%', -125, true],
    ['37%', '27%', '26%', 180, false],
  ],
  bottom: [
    ['-8%', '74%', '44%', 55, false],
    ['64%', '74%', '44%', -55, true],
    ['37%', '55%', '26%', 0, true],
  ],
  left: [
    ['-16%', '6%', '46%', 160, false],
    ['-14%', '30%', '52%', 175, false],
    ['-14%', '48%', '52%', 5, true],
    ['-16%', '70%', '46%', 20, true],
  ],
  right: [
    ['70%', '6%', '46%', -160, true],
    ['62%', '30%', '52%', -175, true],
    ['62%', '48%', '52%', -5, false],
    ['70%', '70%', '46%', -20, false],
  ],
};

// Siblings, not nested: the relief has to blend with the paper itself, and a
// transformed wrapper would isolate it from the paper.
const Emboss = ({ left, top, width, rotate, mirror }: { left: string; top: string; width: string; rotate: number; mirror: boolean }) => {
  const style = { left, top, width, transform: `rotate(${rotate}deg) scaleX(${mirror ? -1 : 1})` };
  return (
    <>
      <div
        className='iv-emboss-shadow pointer-events-none absolute aspect-[700/795]'
        style={{ ...style, maskImage: `url(${LEAF})`, WebkitMaskImage: `url(${LEAF})` }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- a blend layer, not content */}
      <img src={LEAF} alt='' className='iv-emboss-relief pointer-events-none absolute aspect-[700/795]' style={style} />
    </>
  );
};

/** The seal as it sits on the envelope, centred on the cover. */
const SEAL_BOX = 'absolute left-1/2 top-1/2 w-[clamp(108px,34%,150px)] -translate-x-1/2 -translate-y-1/2';

/** The names, printed on the top flap so they fold away with it. */
const CoverNames = () => {
  const [firstName, secondName] = INVITE.couple.short;
  return (
    <div
      data-iv='cover-names'
      className='pointer-events-none absolute inset-x-0 top-[7%] flex flex-col items-center gap-2 text-center'
    >
      <span className='iv-caps text-[10px] text-[var(--iv-gold)]'>The wedding of</span>
      {/* The ampersand sits on the centre line; each name takes its own side of it. */}
      {/* The padding gives the foil room for the script's swashes and descenders. */}
      <span className='iv-script iv-gold -my-[0.35em] grid w-full grid-cols-[1fr_auto_1fr] items-baseline gap-[0.22em] py-[0.35em] text-[clamp(2.4rem,min(13vw,7dvh),3.8rem)] leading-[1.2]'>
        <span className='text-right'>{firstName}</span>
        <span className='iv-serif text-[0.42em] italic'>&amp;</span>
        <span className='text-left'>{secondName}</span>
      </span>
      <span className='iv-serif text-[clamp(0.95rem,4vw,1.1rem)] italic text-[var(--iv-gold-light)]'>
        {INVITE.theme}
      </span>
    </div>
  );
};

/** The prompt, printed on the bottom flap. */
const CoverHint = () => (
  <div
    data-iv='cover-copy'
    className='pointer-events-none absolute inset-x-0 bottom-[6%] flex flex-col items-center gap-2'
  >
    <span className='iv-caps iv-hint text-[10px] text-[var(--iv-gold-light)]'>Tap the seal to open</span>
  </div>
);

const PRINT: Partial<Record<Side, ComponentType>> = { top: CoverNames, bottom: CoverHint };

const Flap = ({ side }: { side: Side }) => {
  const Print = PRINT[side];
  const flap = FLAPS[side];

  return (
    <div
      data-iv={`flap-${side}`}
      className='iv-flap absolute inset-0'
      style={{ transformOrigin: flap.hinge, zIndex: flap.z }}
    >
      <div className={`iv-face iv-flap-shade-${side} absolute inset-0`}>
        <div className={`iv-flap-front iv-light-${side} absolute inset-0`} style={{ clipPath: flap.clip }}>
          {FOLIAGE[side].map(([left, top, width, rotate, mirror]) => (
            <Emboss key={`${left}${top}`} left={left} top={top} width={width} rotate={rotate} mirror={mirror} />
          ))}
          <div className='absolute inset-3 border border-[#c5a15b]/40' />
          {CREASES[side].length > 0 && (
            <svg viewBox='0 0 100 100' preserveAspectRatio='none' className='absolute inset-0 size-full' aria-hidden='true'>
              {CREASES[side].map((d) => (
                <g key={d} fill='none'>
                  <path d={d} className='iv-crease-lo' strokeWidth='2' vectorEffect='non-scaling-stroke' />
                  <path d={d} className='iv-crease-hi' strokeWidth='1' vectorEffect='non-scaling-stroke' />
                </g>
              ))}
            </svg>
          )}
          {Print && <Print />}
          {/* This flap's quarter of the seal: it stays stuck to the flap as it folds. */}
          <div className={SEAL_BOX}>
            <div data-iv={`wedge-${side}`} className='iv-drop'>
              <WaxSeal sizes='150px' />
            </div>
          </div>
          {/* Darkens as the flap turns away from the light. */}
          <div data-iv={`dark-${side}`} className='absolute inset-0 bg-black opacity-0' />
        </div>
      </div>
    </div>
  );
};

/** The sealed envelope guests land on. Presentational: the page runs the opening. */
const InviteCover = ({
  canSkip,
  onOpen,
  onSkip,
}: {
  canSkip: boolean;
  onOpen: () => void;
  onSkip: () => void;
}) => {
  return (
    <div
      data-iv='cover'
      className='iv-cover fixed inset-0 z-50 flex justify-center bg-[#12060a]/80'
    >
      <div className='iv-col h-dvh'>
        <div data-iv='flaps' className='iv-flaps absolute inset-0'>
          <Flap side='left' />
          <Flap side='right' />
          <Flap side='top' />
          <Flap side='bottom' />
        </div>

        {/* The whole seal over the flaps until it cracks; then each flap's quarter shows. */}
        <div className={`pointer-events-none z-10 ${SEAL_BOX}`}>
          <div data-iv='seal' className='iv-drop'>
            <WaxSeal sizes='150px' priority />
          </div>
        </div>

        <button
          type='button'
          aria-label='Open the invitation'
          onClick={onOpen}
          className='absolute inset-0 z-20 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#c5a15b]'
        />

        {canSkip && (
          <button
            type='button'
            onClick={onSkip}
            className='iv-caps absolute bottom-[max(env(safe-area-inset-bottom),0.25rem)] right-2 z-30 p-3 text-[9px] text-[var(--iv-ivory-dim)]'
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
};

export default InviteCover;
