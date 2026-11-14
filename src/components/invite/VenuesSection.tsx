import SectionTitle from './SectionTitle';
import { CathedralArt, CourtArt } from './VenueArt';
import { INVITE } from '@/lib/invite';

const ART = { blessing: CathedralArt, reception: CourtArt } as const;

/** Each venue drawn in line, with its time and a way to get there. */
const VenuesSection = () => (
  <section id='venues' className='iv-sheet iv-paper-ivory px-6 pb-24 text-center'>
    <SectionTitle eyebrow='Where' title='The Venues' tone='light' />

    {INVITE.events.map((event) => {
      const Art = ART[event.id];
      return (
        <div key={event.id} className='mt-12 flex flex-col items-center'>
          <Art className='w-full max-w-[320px] text-[var(--iv-green)] [--iv-accent:var(--iv-gold-deep)]' />
          <span data-iv='rise' className='iv-rise iv-caps mt-6 text-[10px] text-[var(--iv-accent)]'>
            {event.label}
          </span>
          <h3 data-iv='rise' className='iv-rise iv-serif mt-2 text-[1.9rem] leading-tight'>
            {event.venue}
          </h3>
          <span data-iv='rise' className='iv-rise iv-serif mt-1 block text-lg italic text-[var(--iv-ink-soft)]'>
            {event.time} · {event.area}
          </span>
          <a
            data-iv='rise'
            href={event.maps}
            target='_blank'
            rel='noopener noreferrer'
            className='iv-rise iv-caps mt-4 border-b border-[#8e6e2e]/50 pb-1 text-[10px] text-[var(--iv-burgundy)]'
          >
            Open in Maps &rarr;
          </a>
        </div>
      );
    })}
  </section>
);

export default VenuesSection;
