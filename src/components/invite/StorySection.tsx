import Image from 'next/image';
import SectionTitle from './SectionTitle';
import { INVITE } from '@/lib/invite';

/** The couple's portrait, developing inside a gold wreath as it scrolls in. */
const StorySection = () => (
  <section className='iv-sheet iv-paper-ivory px-6 pb-24 text-center'>
    <SectionTitle eyebrow='The couple' title='Two become one' tone='light' />

    <div className='relative mx-auto mt-6 aspect-square w-[94%]'>
      <div className='absolute inset-[24%] overflow-hidden rounded-full bg-[var(--iv-ink)]'>
        <div data-iv='develop' className='absolute inset-0'>
          <Image
            src='/imgs/wedding/portrait.jpg'
            alt={`${INVITE.couple.short[0]} and ${INVITE.couple.short[1]}`}
            fill
            sizes='(max-width: 480px) 60vw, 290px'
            className='object-cover object-[50%_36%]'
          />
        </div>
      </div>
      <div data-iv='wreath' className='pointer-events-none absolute inset-0'>
        <Image src='/imgs/wedding/frame-floral.webp' alt='' fill sizes='(max-width: 480px) 94vw, 450px' className='object-contain' />
      </div>
    </div>

    <blockquote data-iv='rise' className='iv-rise iv-serif mx-auto mt-6 max-w-xs text-[1.6rem] italic leading-snug'>
      &ldquo;{INVITE.verse.text}&rdquo;
    </blockquote>
    <span data-iv='rise' className='iv-rise iv-caps mt-4 block text-[10px] text-[var(--iv-accent)]'>
      {INVITE.verse.reference}
    </span>
  </section>
);

export default StorySection;
