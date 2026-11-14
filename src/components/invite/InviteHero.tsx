import Image from 'next/image';
import { INVITE } from '@/lib/invite';

const divider = '/imgs/wedding/divider.webp';

/** The couple's portrait with the invitation printed over it, waiting beneath the envelope. */
const InviteHero = () => {
  const [firstName, secondName] = INVITE.couple.short;
  // Padded so the reveal mask never trims the script's swashes and descenders.
  const nameClass = 'iv-write iv-gold -mx-[0.3em] -my-[0.35em] inline-block px-[0.3em] py-[0.35em]';

  return (
    // The bottom padding keeps the copy clear of the next sheet's dome.
    <section
      id='home'
      className='relative flex h-dvh min-h-[620px] flex-col items-center overflow-hidden px-6 pb-[calc(var(--iv-dome)+1.5rem)] pt-10 text-center text-[var(--iv-ivory)]'
    >
      <div data-iv='hero-photo' className='absolute inset-0'>
        <Image
          src='/imgs/wedding/couple-hero.jpg'
          alt={`${firstName} and ${secondName}`}
          fill
          priority
          sizes='(max-width: 480px) 100vw, 480px'
          className='object-cover object-[50%_40%]'
        />
      </div>
      {/* The photo darkens into burgundy at the top and bottom so the print reads over it. */}
      <div className='iv-hero-shade pointer-events-none absolute inset-0' />

      <div className='relative flex flex-col items-center gap-3'>
        <span data-iv='hero-rise' className='iv-rise iv-caps text-[10px] text-[var(--iv-gold-light)]'>
          Together with their families
        </span>
        <div data-iv='hero-rise' className='iv-rise relative aspect-[1200/188] w-32'>
          <Image src={divider} alt='' fill sizes='128px' className='object-contain' />
        </div>
      </div>

      <div className='relative mt-auto flex flex-col items-center'>
        <h1 className='iv-script grid w-full grid-cols-[1fr_auto_1fr] items-baseline gap-[0.2em] text-[clamp(3rem,14vw,4rem)] leading-[1.2]'>
          <span className='text-right'>
            <span data-iv='hero-name' className={nameClass}>
              {firstName}
            </span>
          </span>
          <span data-iv='hero-rise' className='iv-rise iv-serif text-[0.4em] italic text-[var(--iv-gold-light)]'>
            &amp;
          </span>
          <span className='text-left'>
            <span data-iv='hero-name' className={nameClass}>
              {secondName}
            </span>
          </span>
        </h1>

        <span
          data-iv='hero-rise'
          className='iv-rise iv-serif mt-2 block max-w-[17rem] text-lg italic leading-snug opacity-90'
        >
          joyfully invite you to be part of their wedding celebration
        </span>

        <div data-iv='hero-rise' className='iv-rise mt-5 flex flex-col items-center gap-2'>
          <span className='iv-caps text-[11px] tracking-[0.2em] text-[var(--iv-gold-light)]'>{INVITE.date.long}</span>
          <span className='iv-caps text-[9px] text-[var(--iv-ivory-dim)]'>{INVITE.city}</span>
        </div>

        <div data-iv='hero-rise' className='iv-rise mt-5 flex flex-col items-center gap-2' aria-hidden='true'>
          <span className='iv-caps text-[9px] text-[var(--iv-ivory-dim)]'>Scroll</span>
          <span className='iv-cue block h-6 w-px bg-[var(--iv-gold)]' />
        </div>
      </div>
    </section>
  );
};

export default InviteHero;
