import Image from 'next/image';
import SectionTitle from './SectionTitle';
import { INVITE } from '@/lib/invite';

// Three prints fanned like a stack of proofs, the middle one on top.
const PRINTS = [
  { src: '/imgs/wedding/rings.jpg', place: '-translate-x-[46%] -rotate-[8deg] z-0' },
  { src: '/imgs/wedding/garden-hands.jpg', place: 'translate-x-[46%] rotate-[7deg] z-0' },
  { src: '/imgs/wedding/garden-walk.jpg', place: '-translate-y-2 rotate-[-1deg] z-10' },
];

/** Where guests find every photograph from the day, in the couple's private collection. */
const WeddingGallerySection = () => (
  <section className='iv-sheet iv-paper-burgundy px-6 pb-24 text-center'>
    <SectionTitle eyebrow='After the day' title='The Gallery' tone='dark' />

    <div data-iv='rise' className='iv-rise relative mx-auto mt-10 flex h-48 items-center justify-center' aria-hidden='true'>
      {PRINTS.map((print) => (
        <div
          key={print.src}
          className={`iv-card-ivory absolute aspect-[4/5] h-full p-2 pb-6 shadow-[0_16px_32px_rgba(0,0,0,0.45)] ${print.place}`}
        >
          <div className='relative size-full overflow-hidden'>
            <Image src={print.src} alt='' fill sizes='180px' className='object-cover' />
          </div>
        </div>
      ))}
    </div>

    <span data-iv='rise' className='iv-rise iv-serif mx-auto mt-10 block max-w-[18rem] text-balance text-lg italic leading-snug opacity-90'>
      Every photograph from the wedding will be gathered here, in a private collection by Mogz Visuals.
    </span>

    <div data-iv='rise' className='iv-rise mt-8 flex flex-col items-center gap-3'>
      <a
        href={INVITE.gallery}
        className='iv-caps inline-flex border border-[#c5a15b]/70 px-7 py-3.5 text-[10px] text-[var(--iv-gold-light)] transition-colors hover:bg-[#c5a15b]/15'
      >
        View the gallery
      </a>
      <span className='iv-caps text-[8.5px] tracking-[0.2em] text-[var(--iv-ivory-dim)]'>Open after the 12th of December</span>
    </div>
  </section>
);

export default WeddingGallerySection;
