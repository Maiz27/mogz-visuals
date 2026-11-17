'use client';

import { useEffect, useState } from 'react';
import SectionTitle from './SectionTitle';
import { INVITE } from '@/lib/invite';

const TARGET = new Date(INVITE.date.iso).getTime();
const LABELS = ['Days', 'Hours', 'Minutes', 'Seconds'];

const split = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
};

/** "Forever begins in": live, to the blessing at 10:00 in Juba. */
const Countdown = () => {
  // Only the client knows the time; render placeholders until it does.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const values = now === null ? null : split(TARGET - now);

  return (
    <section id='countdown' className='iv-sheet iv-paper-emerald px-6 pb-24'>
      <SectionTitle eyebrow='The countdown' title='Forever begins in' tone='dark' />
      <div data-iv='rise' className='iv-rise mt-10 grid grid-cols-4 gap-3' role='timer' aria-live='off'>
        {LABELS.map((label, i) => {
          const value = values ? String(values[i]).padStart(2, '0') : '--';
          return (
            <div key={label} className='flex flex-col items-center gap-3'>
              <div className='iv-medal grid aspect-square w-full place-items-center overflow-hidden rounded-full'>
                <span key={value} className='iv-serif iv-tick text-[1.85rem] font-light leading-none lining-nums tabular-nums'>
                  {value}
                </span>
              </div>
              <span className='iv-caps text-[8.5px] tracking-[0.22em] text-[var(--iv-ivory-dim)]'>{label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Countdown;
