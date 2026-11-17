import SectionTitle from './SectionTitle';
import { INVITE } from '@/lib/invite';

/** The programme as a gold timeline that draws down as it scrolls. */
const TheDaySection = () => (
  <section id='day' className='iv-sheet iv-paper-green px-6 pb-24'>
    <SectionTitle eyebrow='The order of the day' title='The Day' tone='dark' />

    <div className='relative mx-auto mt-12 max-w-xs'>
      <span
        data-iv='timeline-line'
        className='absolute bottom-16 left-[5.25rem] top-2 w-px origin-top bg-[#c5a15b]/70'
      />
      {INVITE.events.map((event) => (
        <div
          key={event.id}
          data-iv='rise'
          className='iv-rise relative grid grid-cols-[4.5rem_1fr] gap-6 pb-10'
        >
          <span className='iv-caps pt-2.5 text-right text-[10px] text-[var(--iv-gold-light)]'>{event.time}</span>
          <div className='relative'>
            <span className='absolute -left-[calc(0.75rem+4.5px)] top-3 size-2.5 rounded-full border border-[#c5a15b] bg-[var(--iv-green)]' />
            <h3 className='iv-serif text-[1.6rem] leading-tight'>{event.label}</h3>
            <span className='iv-serif block italic text-[var(--iv-ivory-dim)]'>{event.venue}</span>
          </div>
        </div>
      ))}
      <span data-iv='rise' className='iv-rise iv-serif block text-center italic text-[var(--iv-ivory-dim)]'>
        More of the day&rsquo;s programme to follow
      </span>
    </div>
  </section>
);

export default TheDaySection;
