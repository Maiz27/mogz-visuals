import { useEffect, useRef, useState, type RefObject } from 'react';

const LINKS = [
  ['home', 'Home'],
  ['venues', 'Venues'],
  ['day', 'The Day'],
  ['seating', 'Seating'],
] as const;

export type NavSection = (typeof LINKS)[number][0];

// How long the page must rest before the bar returns on its own.
const IDLE_MS = 650;

/**
 * Tucks the bar away while the reader scrolls down, and brings it back when
 * they scroll up, pause, or reach either end of the page. It never tucks
 * while one of its links has keyboard focus.
 */
const useTucked = (enabled: boolean, nav: RefObject<HTMLElement | null>) => {
  const [tucked, setTucked] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let last = window.scrollY;
    let idle: ReturnType<typeof setTimeout> | undefined;

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - last;
      last = y;
      const atEnd = y + window.innerHeight >= document.documentElement.scrollHeight - 4;

      clearTimeout(idle);
      const focused = nav.current?.contains(document.activeElement);
      if (focused || y < 80 || atEnd || delta < -4) setTucked(false);
      else if (delta > 4) setTucked(true);
      idle = setTimeout(() => setTucked(false), IDLE_MS);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(idle);
    };
  }, [enabled, nav]);

  return { tucked: enabled && tucked, reveal: () => setTucked(false) };
};

/** The invitation's own tab bar, shown once the card is open. */
const BottomNav = ({ visible, active }: { visible: boolean; active: NavSection }) => {
  const ref = useRef<HTMLElement>(null);
  const { tucked, reveal } = useTucked(visible, ref);
  const shown = visible && !tucked;

  return (
    <nav
      ref={ref}
      onFocus={reveal}
      aria-label='Invitation sections'
      inert={!visible}
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center transition-transform ease-out ${
        shown ? 'translate-y-0 duration-500' : 'translate-y-full duration-300'
      }`}
    >
      <div className='iv-col iv-paper-ivory pointer-events-auto flex items-center justify-around border-t border-[#c5a15b]/50 px-2 pb-[max(env(safe-area-inset-bottom),0.25rem)] pt-1 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]'>
        {LINKS.map(([id, text]) => (
          // The padding is the tap target; the rule sits under the word alone.
          <a
            key={id}
            href={`#${id}`}
            aria-current={active === id ? 'true' : undefined}
            className={`iv-caps px-3 py-2.5 text-[9px] tracking-[0.22em] transition-colors ${
              active === id ? 'text-[var(--iv-burgundy)]' : 'text-[var(--iv-ink-soft)]'
            }`}
          >
            <span
              className={`border-b pb-1 transition-colors ${
                active === id ? 'border-[var(--iv-burgundy)]' : 'border-transparent'
              }`}
            >
              {text}
            </span>
          </a>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
