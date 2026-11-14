import Image from 'next/image';
import SectionTitle from './SectionTitle';
import { INVITE } from '@/lib/invite';

// The dress code colours, as the couple shared them.
const SWATCHES = [
  { name: 'Deep Burgundy', colour: '#70263d' },
  { name: 'Forest Green', colour: '#174d38' },
  { name: 'Dark Emerald', colour: '#0d3026' },
  { name: 'Soft Black', colour: '#171717' },
  { name: 'Warm Ivory', colour: '#f5ebdd' },
  { name: 'Champagne Gold', colour: '#c5a15b' },
];

const leaf = '/imgs/wedding/ornament-leaf.webp';

/** The theme, and the colours guests are asked to wear. */
const DressCodeSection = () => (
  <section className='iv-sheet iv-paper-ivory relative overflow-hidden px-6 pb-24 text-center'>
    <div className='pointer-events-none absolute -left-12 top-40 aspect-[700/795] w-28 -rotate-12 opacity-80'>
      <Image src={leaf} alt='' fill sizes='112px' className='object-contain' />
    </div>
    <div className='pointer-events-none absolute -right-12 top-40 aspect-[700/795] w-28 -scale-x-100 rotate-12 opacity-80'>
      <Image src={leaf} alt='' fill sizes='112px' className='object-contain' />
    </div>

    <SectionTitle eyebrow='Dress code' title='Fit for royalty' tone='light' />
    <span data-iv='rise' className='iv-rise iv-serif mt-6 block text-2xl italic text-[var(--iv-burgundy)]'>
      {INVITE.theme}
    </span>
    <span data-iv='rise' className='iv-rise iv-serif mx-auto mt-3 block max-w-[18rem] text-lg leading-snug text-[var(--iv-ink-soft)]'>
      Kindly dress in the colours of the day.
    </span>

    <ul data-iv='rise' className='iv-rise mx-auto mt-10 grid max-w-xs grid-cols-3 gap-x-4 gap-y-7'>
      {SWATCHES.map((swatch) => (
        <li key={swatch.name} className='flex flex-col items-center gap-2.5'>
          <span
            className='relative block size-14 rounded-full shadow-[0_0_0_1px_rgba(197,161,91,0.85),0_6px_12px_-4px_rgba(23,23,23,0.35)] after:absolute after:-inset-[5px] after:rounded-full after:border after:border-[#8e6e2e]/40'
            style={{ background: swatch.colour }}
          />
          <span className='iv-caps text-[8px] leading-relaxed tracking-[0.2em] text-[var(--iv-ink-soft)]'>
            {swatch.name}
          </span>
        </li>
      ))}
    </ul>
  </section>
);

export default DressCodeSection;
