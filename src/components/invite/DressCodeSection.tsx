import Image from 'next/image';
import SectionTitle from './SectionTitle';
import { INVITE } from '@/lib/invite';

const leaf = '/imgs/wedding/ornament-leaf.webp';

/** The theme guests dress to. The couple set no colours, so guests are free to choose their own. */
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
      Come dressed in your royal best, in whatever colours you love.
    </span>
  </section>
);

export default DressCodeSection;
