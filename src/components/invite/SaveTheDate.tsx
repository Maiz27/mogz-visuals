import SectionTitle from './SectionTitle';
import WaxSeal from './WaxSeal';
import { CALENDAR_ICS, INVITE } from '@/lib/invite';

/** An ivory date tag, sealed, with the day ready to drop into a calendar. */
const SaveTheDate = () => (
  <section className='iv-sheet iv-paper-burgundy px-6 pb-24 text-center'>
    <SectionTitle eyebrow='Mark your calendar' title='Save the date' tone='dark' />

    <div data-iv='rise' className='iv-rise relative mx-auto mt-10 w-[82%]'>
      <div className='iv-tag iv-card-ivory relative px-6 py-10 shadow-xl'>
        <div className='iv-card-frame pointer-events-none absolute inset-3' />
        <span className='iv-caps text-[10px] text-[var(--iv-accent)]'>{INVITE.date.weekday}</span>
        {/* Equal side columns keep the day on the card's centre line. */}
        <div className='mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3'>
          <span className='iv-caps border-y border-[#8e6e2e]/50 py-1.5 text-[10px] tracking-[0.2em]'>December</span>
          <span className='iv-serif text-[4.5rem] font-light leading-none text-[var(--iv-burgundy)]'>12</span>
          <span className='iv-caps border-y border-[#8e6e2e]/50 py-1.5 text-[10px] tracking-[0.2em]'>2026</span>
        </div>
        <span className='iv-serif mt-3 block text-lg italic text-[var(--iv-ink-soft)]'>{INVITE.city}</span>
      </div>
      <div className='absolute -right-6 -top-8 w-[84px] rotate-12'>
        <div className='iv-drop'>
          <WaxSeal sizes='84px' />
        </div>
      </div>
    </div>

    <a
      data-iv='rise'
      href={`data:text/calendar;charset=utf-8,${encodeURIComponent(CALENDAR_ICS)}`}
      download='mogz-and-lin.ics'
      className='iv-rise iv-caps mt-10 inline-flex border border-[#c5a15b]/70 px-7 py-3.5 text-[10px] text-[var(--iv-gold-light)] transition-colors hover:bg-[#c5a15b]/15'
    >
      Add to calendar
    </a>
  </section>
);

export default SaveTheDate;
