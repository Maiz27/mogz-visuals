import Image from 'next/image';
import SectionTitle from './SectionTitle';
import { INVITE } from '@/lib/invite';

const PHOTOS = [
  { src: '/imgs/wedding/rings.jpg', alt: 'Their hands, with the ring' },
  { src: '/imgs/wedding/garden-walk.jpg', alt: 'Lin walking to the garden table' },
  { src: '/imgs/wedding/groom.jpg', alt: 'Mogz in the garden' },
  { src: '/imgs/wedding/garden-hands.jpg', alt: 'Mogz taking Lin by the hand' },
];

/** A film strip of the couple that slides sideways while it holds the screen, ending on the link to the wedding gallery. */
const GallerySection = () => (
  <section className='iv-sheet iv-paper-burgundy pb-20'>
    <div className='px-6'>
      <SectionTitle eyebrow='Moments' title='Captured' tone='dark' />
    </div>

    {/* With reduced motion the strip doesn't slide, so it scrolls by hand instead (invite.css). */}
    <div
      data-iv='strip'
      role='region'
      aria-label='Photos of the couple'
      // Safari only lets the keyboard scroll a container that can take focus.
      tabIndex={0}
      className='iv-strip relative mt-8 flex h-[min(56dvh,460px)] items-center overflow-hidden'
    >
      <div data-iv='strip-track' className='flex h-full w-max items-center gap-5 px-[13%]'>
        {/* Prints on the card's own ivory stock, laid down slightly askew. */}
        {PHOTOS.map((photo, i) => (
          <figure
            key={photo.src}
            className={`iv-card-ivory relative aspect-[2/3] h-[88%] shrink-0 p-2.5 shadow-[0_18px_36px_rgba(0,0,0,0.5)] ${i % 2 ? 'rotate-[1.2deg]' : '-rotate-[1.2deg]'}`}
          >
            <div className='relative size-full overflow-hidden'>
              <Image src={photo.src} alt={photo.alt} fill sizes='(max-width: 480px) 75vw, 360px' className='object-cover' />
            </div>
          </figure>
        ))}

        {/* The strip ends on the way to every photograph from the day. Its width is the column's, less the track's padding, so it rests centred. */}
        <div data-iv='gallery-link' className='iv-card-frame relative flex h-[78%] w-[min(74vw,355px)] shrink-0 flex-col items-center justify-center gap-5 px-6 text-center'>
          <span className='iv-caps text-[10px] text-[var(--iv-accent)]'>After the day</span>
          <span className='iv-serif text-balance text-xl italic leading-snug'>
            Every photograph from the wedding, gathered in a private collection by Mogz Visuals.
          </span>
          <a
            href={INVITE.gallery}
            className='iv-caps inline-flex border border-[#c5a15b]/70 px-7 py-3.5 text-[10px] text-[var(--iv-gold-light)] transition-colors hover:bg-[#c5a15b]/15'
          >
            View the gallery
          </a>
          <span className='iv-caps text-[8.5px] tracking-[0.2em] text-[var(--iv-ivory-dim)]'>
            Open after 12 December
          </span>
        </div>
      </div>
    </div>
  </section>
);

export default GallerySection;
