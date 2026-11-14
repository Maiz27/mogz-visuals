import Image from 'next/image';
import SectionTitle from './SectionTitle';

const PHOTOS = [
  { src: '/imgs/wedding/rings.jpg', alt: 'Their hands, with the ring' },
  { src: '/imgs/wedding/garden-walk.jpg', alt: 'Lin walking to the garden table' },
  { src: '/imgs/wedding/groom.jpg', alt: 'Mogz in the garden' },
  { src: '/imgs/wedding/garden-hands.jpg', alt: 'Mogz taking Lin by the hand' },
];

/** A film strip of the couple that slides sideways while it holds the screen. */
const GallerySection = () => (
  <section className='iv-sheet iv-paper-burgundy pb-20'>
    <div className='px-6'>
      <SectionTitle eyebrow='Moments' title='Captured' tone='dark' />
    </div>

    <div data-iv='strip' className='relative mt-8 flex h-[min(56dvh,460px)] items-center overflow-hidden'>
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
      </div>
    </div>
  </section>
);

export default GallerySection;
