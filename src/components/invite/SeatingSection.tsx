'use client';

import { Fragment, useState } from 'react';
import SectionTitle from './SectionTitle';
import { INVITE, VIP_TABLES, type VipTable } from '@/lib/invite';

const CHAIRS = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
  return { cx: 50 + Math.cos(angle) * 43, cy: 50 + Math.sin(angle) * 43 };
});

const SIDES = [
  { side: 'groom', label: "Groom's side" },
  { side: 'bride', label: "Bride's side" },
] as const;

/** One round VIP table with its ring of chairs, as seen from above. */
const TableMark = ({
  table,
  selected,
  onSelect,
}: {
  table: VipTable;
  selected: boolean;
  onSelect: () => void;
}) => (
  <button
    type='button'
    aria-pressed={selected}
    aria-label={`Table ${table.number}`}
    onClick={onSelect}
    className='group relative aspect-square w-full outline-none'
  >
    <svg viewBox='0 0 100 100' className='absolute inset-0 size-full' aria-hidden='true'>
      {CHAIRS.map((c) => (
        <circle
          key={`${c.cx}-${c.cy}`}
          cx={c.cx}
          cy={c.cy}
          r='5.5'
          className={`transition-colors duration-300 ${selected ? 'fill-[#c5a15b]' : 'fill-[#c5a15b]/45'}`}
        />
      ))}
      <circle
        cx='50'
        cy='50'
        r='32'
        className={`stroke-[#c5a15b] transition-colors duration-300 ${
          selected ? 'fill-[#70263d]' : 'fill-[#fffaf1] group-hover:fill-[#f3e6cf]'
        }`}
        strokeWidth='1.5'
      />
      <circle cx='50' cy='50' r='27' fill='none' className='stroke-[#c5a15b]/50' strokeWidth='0.75' />
    </svg>
    <span
      className={`iv-serif absolute inset-0 flex items-center justify-center text-[clamp(1rem,4.6vw,1.25rem)] leading-none transition-colors duration-300 ${
        selected ? 'text-[var(--iv-ivory)]' : 'text-[var(--iv-burgundy)]'
      }`}
    >
      {table.number}
    </span>
    <span className='absolute inset-[14%] rounded-full ring-[#70263d] group-focus-visible:ring-2' />
  </button>
);

/**
 * The reception floor plan, so honoured guests can see where their table
 * sits before they arrive. The tables come from VIP_TABLES; who each is for
 * is shown on tap, and listed once the couple has assigned them.
 */
const SeatingSection = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const table = VIP_TABLES.find((t) => t.number === selected);
  // Listed by number, whichever half the table is on.
  const assigned = VIP_TABLES.filter((t) => t.reservedFor).sort((a, b) => a.number - b.number);
  const reception = INVITE.events.find((e) => e.id === 'reception');

  return (
    <section id='seating' className='iv-sheet iv-paper-ivory px-6 pb-24 text-center'>
      <SectionTitle eyebrow='The reception' title='VIP Seating' tone='light' />
      <span
        data-iv='rise'
        className='iv-rise iv-serif mx-auto mt-5 block max-w-xs text-lg italic leading-snug text-[var(--iv-ink-soft)]'
      >
        A few tables are set aside for family and honoured guests. Find yours on the plan.
      </span>

      {/* The plan: the couple's table at the head, the VIP tables before it. */}
      <div
        data-iv='rise'
        className='iv-rise relative mx-auto mt-9 max-w-sm bg-[#fffaf1]/70 px-5 pb-6 pt-7 shadow-[0_18px_40px_rgba(23,23,23,0.12)]'
      >
        <div className='iv-card-frame pointer-events-none absolute inset-2' />

        {reception && (
          <span className='iv-caps block text-[9px] text-[var(--iv-ink-soft)]'>{reception.venue}</span>
        )}

        <div className='relative mx-auto mt-4 w-[78%]'>
          <div className='relative border border-[#c5a15b] bg-[var(--iv-burgundy)] px-4 py-2.5 shadow-[0_8px_18px_rgba(112,38,61,0.25)]'>
            <span className='iv-caps block text-[8px] text-[var(--iv-gold-light)]'>Head table</span>
            <span className='iv-script iv-gold -my-[0.35em] block py-[0.35em] text-[1.7rem] leading-[1.3]'>
              {INVITE.couple.short[0]} <span className='iv-serif text-[0.5em] italic'>&amp;</span>{' '}
              {INVITE.couple.short[1]}
            </span>
          </div>
          <div className='mt-1.5 flex justify-around px-3' aria-hidden='true'>
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i} className='size-2 rounded-full bg-[#c5a15b]/60' />
            ))}
          </div>
        </div>

        <div className='relative mt-7 border border-dashed border-[#c5a15b]/70 px-3 pb-4 pt-6'>
          <span className='iv-caps absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-[#fdf6ea] px-3 text-[9px] text-[var(--iv-accent)]'>
            VIP
          </span>
          {/* The groom's half under his name, the bride's under hers, an aisle between. */}
          <div className='grid grid-cols-[1fr_auto_1fr] gap-x-2'>
            {SIDES.map(({ side, label }, i) => (
              <Fragment key={side}>
                {i > 0 && (
                  <span className='w-px border-l border-dashed border-[#c5a15b]/50' aria-hidden='true' />
                )}
                <div role='group' aria-label={label} className='flex flex-col gap-2'>
                  <span className='iv-caps text-[7.5px] tracking-[0.2em] text-[var(--iv-ink-soft)]'>{label}</span>
                  <div className='grid grid-cols-2 gap-1.5'>
                    {VIP_TABLES.filter((t) => t.side === side).map((t) => (
                      <TableMark
                        key={t.number}
                        table={t}
                        selected={selected === t.number}
                        onSelect={() => setSelected(selected === t.number ? null : t.number)}
                      />
                    ))}
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        </div>

        {/* The dots and line are drawing; the labels are read out. */}
        <div className='mt-5 flex flex-col items-center gap-2'>
          <div className='grid grid-cols-9 gap-2 opacity-40' aria-hidden='true'>
            {Array.from({ length: 18 }, (_, i) => (
              <span key={i} className='size-1.5 rounded-full bg-[var(--iv-ink-soft)]' />
            ))}
          </div>
          <span className='iv-caps text-[8px] text-[var(--iv-ink-soft)]'>General seating</span>
        </div>

        <div className='mt-5 flex flex-col items-center gap-1 text-[var(--iv-ink-soft)]'>
          <span className='block h-5 w-px bg-current opacity-50' aria-hidden='true' />
          <span className='iv-caps text-[8px]'>Entrance</span>
        </div>
      </div>

      {/* What the chosen table is set aside for. */}
      <div
        data-iv='rise'
        aria-live='polite'
        className='iv-rise mx-auto mt-6 flex min-h-[5.5rem] max-w-sm flex-col items-center justify-center gap-1.5 border-y border-[#c5a15b]/50 px-4 py-4'
      >
        {table ? (
          <>
            <span className='iv-caps text-[9px] text-[var(--iv-accent)]'>Table {table.number} · Reserved for</span>
            <span
              className={`iv-serif text-xl ${table.reservedFor ? '' : 'italic text-[var(--iv-ink-soft)]'}`}
            >
              {table.reservedFor ?? 'To be confirmed'}
            </span>
          </>
        ) : (
          <span className='iv-serif text-lg italic text-[var(--iv-ink-soft)]'>
            Tap a table to see who it is reserved for.
          </span>
        )}
      </div>

      {assigned.length > 0 ? (
        <ul data-iv='rise' className='iv-rise mx-auto mt-6 max-w-sm text-left'>
          {assigned.map((t) => (
            <li key={t.number} className='border-b border-[#171717]/10'>
              <button
                type='button'
                aria-pressed={selected === t.number}
                onClick={() => setSelected(t.number)}
                className='flex w-full items-center gap-4 py-2.5 text-left'
              >
                <span
                  className={`iv-serif flex size-9 shrink-0 items-center justify-center rounded-full border border-[#c5a15b] text-lg transition-colors duration-300 ${
                    selected === t.number
                      ? 'bg-[var(--iv-burgundy)] text-[var(--iv-ivory)]'
                      : 'bg-[#fffaf1] text-[var(--iv-burgundy)]'
                  }`}
                >
                  {t.number}
                </span>
                <span
                  className={`iv-serif text-lg transition-colors duration-300 ${
                    selected === t.number ? 'text-[var(--iv-burgundy)]' : ''
                  }`}
                >
                  {t.reservedFor}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <span
          data-iv='rise'
          className='iv-rise iv-caps mx-auto mt-6 block max-w-xs text-[9px] leading-loose text-[var(--iv-ink-soft)]'
        >
          Table assignments will be shared closer to the day
        </span>
      )}
    </section>
  );
};

export default SeatingSection;
