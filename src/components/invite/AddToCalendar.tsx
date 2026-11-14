'use client';

import { useId, useState } from 'react';
import { CALENDAR_LINKS } from '@/lib/invite';

const OPTIONS = [
  { label: 'Apple Calendar', href: CALENDAR_LINKS.apple, external: false },
  { label: 'Google Calendar', href: CALENDAR_LINKS.google, external: true },
  { label: 'Outlook', href: CALENDAR_LINKS.outlook, external: true },
] as const;

/** "Add to calendar", opening onto a choice of calendar apps. */
const AddToCalendar = () => {
  const [open, setOpen] = useState(false);
  const listId = useId();

  return (
    <div data-iv='rise' className='iv-rise mt-10 flex flex-col items-center'>
      <button
        type='button'
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className='iv-caps inline-flex border border-[#c5a15b]/70 px-7 py-3.5 text-[10px] text-[var(--iv-gold-light)] transition-colors hover:bg-[#c5a15b]/15'
      >
        Add to calendar
      </button>

      <div
        id={listId}
        className={`grid w-full max-w-[16rem] transition-[grid-template-rows,opacity] duration-500 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <ul className='overflow-hidden' inert={!open}>
          {OPTIONS.map(({ label, href, external }) => (
            <li key={label} className='border-b border-[#c5a15b]/30 first:mt-4'>
              <a
                href={href}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className='iv-serif block py-3 text-lg italic text-[var(--iv-ivory)] transition-colors hover:text-[var(--iv-gold-light)]'
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AddToCalendar;
