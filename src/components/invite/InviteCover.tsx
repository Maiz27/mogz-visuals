import Image from 'next/image';
import { INVITE } from '@/lib/invite';

// The champagne satin bow; its knot sits 31% down the image, so it lands on the band.
const BOW = { src: '/imgs/wedding/bow-gold.webp', ratio: '1100/1068', knot: '31%' };

const BAND_TOP = '55%';

const Flap = ({ side }: { side: 'left' | 'right' }) => {
  const isLeft = side === 'left';
  const [firstName, secondName] = INVITE.couple.short;

  return (
    <div
      data-iv={`flap-${side}`}
      className={`iv-flap iv-flap-${side} absolute inset-y-0 w-1/2 ${isLeft ? 'left-0 origin-left' : 'right-0 origin-right'}`}
    >
      <div className='iv-face iv-flap-front absolute inset-0 overflow-hidden'>
        {/* Embossed folds, meeting at the seam like a pocket envelope. */}
        <svg
          viewBox='0 0 100 100'
          preserveAspectRatio='none'
          className='absolute inset-0 size-full'
          aria-hidden='true'
        >
          {(isLeft
            ? ['M0 0L100 44', 'M0 100L100 72']
            : ['M100 0L0 44', 'M100 100L0 72']
          ).map((d) => (
            <g key={d} fill='none' vectorEffect='non-scaling-stroke'>
              <path d={d} className='iv-crease-lo' strokeWidth='1.2' vectorEffect='non-scaling-stroke' />
              <path
                d={d}
                className='iv-crease-hi'
                strokeWidth='1'
                transform='translate(0 0.18)'
                vectorEffect='non-scaling-stroke'
              />
            </g>
          ))}
        </svg>

        <div
          className={`absolute inset-y-3 border border-[#c5a15b]/45 ${isLeft ? 'left-3 right-0 border-r-0' : 'right-3 left-0 border-l-0'}`}
        />

        {/* Foil names printed across both flaps; each shows its half. */}
        <div
          className='absolute top-[17%] flex w-[200%] flex-col items-center gap-2 text-center'
          style={{ left: isLeft ? 0 : '-100%' }}
        >
          <span className='iv-caps text-[10px] text-[var(--iv-gold)]'>The wedding of</span>
          {/* Sized by the shorter of width and height, so it clears the bow in a short window. */}
          {/* The ampersand sits on the seam; each name takes its own side of it. */}
          <span className='iv-script iv-gold grid w-full grid-cols-[1fr_auto_1fr] items-baseline gap-[0.22em] text-[clamp(2.6rem,min(17vw,9dvh),4.6rem)] leading-[1.2]'>
            <span className='text-right'>{firstName}</span>
            <span className='iv-serif text-[0.42em] italic'>&amp;</span>
            <span className='text-left'>{secondName}</span>
          </span>
        </div>

        <div
          className='absolute inset-x-0 h-[clamp(34px,9vw,44px)] -translate-y-1/2 overflow-hidden'
          style={{ top: BAND_TOP }}
        >
          <div data-iv={`band-${side}`} className='iv-band size-full' />
        </div>
      </div>
      <div className='iv-face iv-flap-back absolute inset-0' />
    </div>
  );
};

/** The tied gatefold card guests land on. Presentational: the page runs the opening. */
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
      className='iv-cover fixed inset-0 z-50 flex justify-center bg-[#2a0d17]/70'
    >
      <div className='iv-col h-dvh'>
        <div data-iv='flaps' className='iv-flap absolute inset-0'>
          <Flap side='left' />
          <Flap side='right' />
        </div>

        <div
          className='pointer-events-none absolute left-1/2 w-[min(78%,44dvh)]'
          style={{ top: BAND_TOP, translate: `-50% -${BOW.knot}` }}
        >
          <div data-iv='bow' className='iv-drop relative w-full' style={{ aspectRatio: BOW.ratio }}>
            <Image src={BOW.src} alt='' fill priority sizes='(max-width: 480px) 78vw, 375px' className='object-contain' />
          </div>
        </div>

        <div
          data-iv='cover-copy'
          className='pointer-events-none absolute inset-x-0 bottom-[6%] flex flex-col items-center gap-2'
        >
          <span className='iv-caps iv-hint text-[10px] text-[var(--iv-gold-light)]'>
            Tap to open
          </span>
        </div>

        <button
          type='button'
          aria-label='Open the invitation'
          onClick={onOpen}
          className='absolute inset-0 z-10 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#c5a15b]'
        />

        {canSkip && (
          <button
            type='button'
            onClick={onSkip}
            className='iv-caps absolute bottom-[max(env(safe-area-inset-bottom),0.25rem)] right-2 z-20 p-3 text-[9px] text-[var(--iv-ivory-dim)]'
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
};

export default InviteCover;
