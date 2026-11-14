import Image from 'next/image';
import { INVITE } from '@/lib/invite';

const leaf = '/imgs/wedding/ornament-leaf.webp';
const divider = '/imgs/wedding/divider.webp';

/** The invitation card itself, waiting behind the cover's flaps. */
const InviteHero = () => {
  const [firstName, secondName] = INVITE.couple.short;
  const nameClass = 'iv-write -my-[0.2em] inline-block px-[0.3em] py-[0.2em] text-[var(--iv-burgundy)]';

  return (
    // The bottom padding keeps the whole card clear of the next sheet's dome.
    <section id='home' className='relative flex h-dvh min-h-[620px] p-3.5 pb-[calc(var(--iv-dome)+0.875rem)]'>
      <div
        data-iv='hero-card'
        className='iv-card-ivory relative flex w-full flex-col items-center justify-center overflow-hidden px-7 text-center shadow-[0_24px_60px_rgba(0,0,0,0.6)]'
      >
        <div className='iv-card-frame pointer-events-none absolute inset-3' />
        <div className='pointer-events-none absolute -left-10 -top-9 aspect-[700/795] w-36 -rotate-[32deg]'>
          <Image src={leaf} alt='' fill sizes='144px' className='object-contain' />
        </div>
        <div className='pointer-events-none absolute -bottom-9 -right-10 aspect-[700/795] w-36 rotate-[148deg]'>
          <Image src={leaf} alt='' fill sizes='144px' className='object-contain' />
        </div>

        <span data-iv='hero-rise' className='iv-rise iv-caps text-[10px] text-[var(--iv-accent)]'>
          Together with their families
        </span>
        <div data-iv='hero-rise' className='iv-rise relative mt-4 aspect-[1200/188] w-36'>
          <Image src={divider} alt='' fill sizes='144px' className='object-contain' />
        </div>

        <h1 className='iv-script mt-5 text-[clamp(3.5rem,16vw,4.5rem)] leading-[0.95]'>
          <span className='block'>
            <span data-iv='hero-name' className={nameClass}>
              {firstName}
            </span>
          </span>
          <span
            data-iv='hero-rise'
            className='iv-rise iv-serif my-[0.45em] block text-[0.4em] italic text-[var(--iv-accent)]'
          >
            &amp;
          </span>
          <span className='block'>
            <span data-iv='hero-name' className={nameClass}>
              {secondName}
            </span>
          </span>
        </h1>

        <span
          data-iv='hero-rise'
          className='iv-rise iv-serif mt-6 block max-w-[17rem] text-lg italic leading-snug text-[var(--iv-ink-soft)]'
        >
          joyfully invite you to be part of their wedding celebration
        </span>

        <div data-iv='hero-rise' className='iv-rise mt-7 flex flex-col items-center gap-2'>
          <span className='iv-serif text-xl'>{INVITE.date.long}</span>
          <span className='iv-caps text-[10px] opacity-70'>{INVITE.city}</span>
        </div>

        <div data-iv='hero-rise' className='iv-rise relative mt-7 aspect-[1200/188] w-36 rotate-180'>
          <Image src={divider} alt='' fill sizes='144px' className='object-contain' />
        </div>

        <div
          data-iv='hero-rise'
          className='iv-rise absolute bottom-7 flex flex-col items-center gap-2'
          aria-hidden='true'
        >
          <span className='iv-caps text-[9px] opacity-60'>Scroll</span>
          <span className='iv-cue block h-7 w-px bg-[var(--iv-accent)]' />
        </div>
      </div>
    </section>
  );
};

export default InviteHero;
