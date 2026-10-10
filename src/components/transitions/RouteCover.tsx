'use client';

import { Ref, useImperativeHandle, useRef } from 'react';

export type RouteCoverHandle = {
  /** Rack the page out of focus; the reticle fades in near the end. */
  cover: () => Promise<void>;
  /** The route is slow: the reticle hunts. */
  hunt: () => void;
  /** Focus confirmed: the reticle tightens and holds a beat. */
  lock: () => Promise<void>;
  /** Rack the new page into focus and clear the reticle. */
  reveal: () => Promise<void>;
  /** Called as a route commits, before paint: if the route brought a new page
   *  container (a different layout), hold it out of focus too. */
  hold: () => void;
  /** Recovery after a failed transition: clear everything at once, with no
   *  animation (which could fail again), so the page is never left blocked. */
  reset: () => void;
};

// The lens is the page content: blurred and slightly magnified while focus racks,
// as a real lens changes magnification when it focuses ("breathing").
const LENS_SELECTOR = '[data-scroll-container]';

const RACK_OUT_MS = 300;
const RACK_OUT_EASE = 'cubic-bezier(0.2, 0, 0.1, 1)';
// Fast resolve, long settle: the same curve the collection morph uses.
export const RACK_IN_MS = 600;
export const RACK_IN_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const BREATHING_SCALE = 1.015;

const RETICLE_IN_DELAY_MS = 180;
const RETICLE_IN_MS = 120;
const RETICLE_OPACITY = 0.8;
const LOCK_MS = 180;
const LOCK_HOLD_MS = 140;
const RETICLE_OUT_MS = 240;

const GOLD = 'rgba(251, 198, 129, 0.85)';
const GOLD_LOCK = '#fde2b8';

// Blur cost grows with radius and area: phones and weak devices get a lighter
// defocus, never a fade to black.
const blurRadius = () => {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  const lite =
    Boolean(nav.connection?.saveData) ||
    (nav.deviceMemory ?? 8) <= 2 ||
    (nav.hardwareConcurrency ?? 8) <= 4;
  return lite || window.innerWidth < 768 ? 6 : 11;
};

const settled = (animation: Animation) =>
  animation.finished.then(
    () => undefined,
    () => undefined,
  );
const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * The route transition: a focus pull. The page racks out of focus while a
 * 35mm-proportioned autofocus reticle settles over it, the reticle hunts if the
 * next route is slow, confirms focus, and the new page racks in sharp.
 */
const RouteCover = ({ ref }: { ref?: Ref<RouteCoverHandle> }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const lens = useRef<HTMLElement | null>(null);
  const lensAnimation = useRef<Animation | null>(null);
  const huntAnimation = useRef<Animation | null>(null);
  const focused = useRef('');

  const reticleParts = () =>
    rootRef.current
      ? [...rootRef.current.querySelectorAll<HTMLElement>('[data-tick]')]
      : [];

  const setReticleColor = (color: string) => {
    reticleParts().forEach((tick) => (tick.style.borderColor = color));
  };

  useImperativeHandle(ref, () => ({
    cover: async () => {
      const root = rootRef.current;
      const reticle = reticleRef.current;
      if (!root || !reticle) return;
      root.style.visibility = 'visible';
      root.style.pointerEvents = 'auto';
      setReticleColor(GOLD);
      if (dotRef.current) dotRef.current.style.opacity = '0.5';

      lens.current = document.querySelector<HTMLElement>(LENS_SELECTOR);
      focused.current = `blur(${blurRadius()}px) brightness(1.04)`;
      if (lens.current) {
        lens.current.style.transformOrigin = `50% ${window.innerHeight / 2}px`;
        lens.current.style.willChange = 'filter, transform';
        lensAnimation.current = lens.current.animate(
          [
            { filter: 'blur(0px) brightness(1)', transform: 'scale(1)' },
            { filter: focused.current, transform: `scale(${BREATHING_SCALE})` },
          ],
          { duration: RACK_OUT_MS, easing: RACK_OUT_EASE, fill: 'forwards' },
        );
      }
      reticle.animate([{ opacity: 0 }, { opacity: RETICLE_OPACITY }], {
        duration: RETICLE_IN_MS,
        delay: RETICLE_IN_DELAY_MS,
        easing: 'ease-out',
        fill: 'forwards',
      });
      if (lensAnimation.current) await settled(lensAnimation.current);
      else await wait(RACK_OUT_MS);
    },
    hunt: () => {
      huntAnimation.current?.cancel();
      huntAnimation.current = reticleRef.current?.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(1.03)' },
          { transform: 'scale(0.985)' },
          { transform: 'scale(1)' },
        ],
        { duration: 900, iterations: Infinity, easing: 'ease-in-out' },
      ) ?? null;
    },
    lock: async () => {
      const reticle = reticleRef.current;
      if (!reticle) return;
      huntAnimation.current?.cancel();
      huntAnimation.current = null;
      setReticleColor(GOLD_LOCK);
      if (dotRef.current) dotRef.current.style.opacity = '1';
      reticle.animate(
        [
          { opacity: RETICLE_OPACITY, transform: 'scale(1)' },
          { opacity: 1, transform: 'scale(0.96)' },
        ],
        { duration: LOCK_MS, easing: 'cubic-bezier(0.3, 0, 0, 1)', fill: 'forwards' },
      );
      await wait(LOCK_MS + LOCK_HOLD_MS);
    },
    reveal: async () => {
      const root = rootRef.current;
      const reticle = reticleRef.current;
      if (!root || !reticle) return;
      reticle.animate(
        [
          { opacity: 1, transform: 'scale(0.96)' },
          { opacity: 0, transform: 'scale(0.96)' },
        ],
        { duration: RETICLE_OUT_MS, easing: 'ease-out', fill: 'forwards' },
      );
      // The route may have swapped the layout (and its scroll container): rack
      // in whichever page is now on screen.
      const current = document.querySelector<HTMLElement>(LENS_SELECTOR);
      if (current && current !== lens.current) {
        lensAnimation.current?.cancel();
        current.style.transformOrigin = `50% ${window.innerHeight / 2}px`;
        current.style.willChange = 'filter, transform';
        lens.current = current;
      } else {
        lensAnimation.current?.cancel();
      }
      const target = lens.current;
      if (target) {
        const rackIn = target.animate(
          [
            { filter: focused.current, transform: `scale(${BREATHING_SCALE})` },
            { filter: 'blur(0px) brightness(1)', transform: 'scale(1)' },
          ],
          { duration: RACK_IN_MS, easing: RACK_IN_EASE },
        );
        await settled(rackIn);
        target.style.willChange = '';
        target.style.transformOrigin = '';
      } else {
        await wait(RACK_IN_MS);
      }
      lensAnimation.current = null;
      lens.current = null;
      root.style.visibility = 'hidden';
      root.style.pointerEvents = 'none';
      // Smooth scrolling measured the page while it was scaled; have it
      // re-measure now that the page is back to its real size.
      window.dispatchEvent(new Event('resize'));
    },
    hold: () => {
      if (!lens.current || !focused.current) return;
      const current = document.querySelector<HTMLElement>(LENS_SELECTOR);
      if (!current || current === lens.current) return;
      lensAnimation.current?.cancel();
      current.style.transformOrigin = `50% ${window.innerHeight / 2}px`;
      current.style.willChange = 'filter, transform';
      const held = { filter: focused.current, transform: `scale(${BREATHING_SCALE})` };
      lensAnimation.current = current.animate([held, held], {
        duration: 1,
        fill: 'forwards',
      });
      lens.current = current;
    },
    reset: () => {
      for (const animation of [lensAnimation.current, huntAnimation.current]) {
        try {
          animation?.cancel();
        } catch {}
      }
      lensAnimation.current = null;
      huntAnimation.current = null;
      for (const target of [
        lens.current,
        document.querySelector<HTMLElement>(LENS_SELECTOR),
      ]) {
        if (!target) continue;
        try {
          target.getAnimations().forEach((animation) => animation.cancel());
        } catch {}
        target.style.willChange = '';
        target.style.transformOrigin = '';
      }
      lens.current = null;
      if (reticleRef.current) {
        try {
          reticleRef.current
            .getAnimations()
            .forEach((animation) => animation.cancel());
        } catch {}
        reticleRef.current.style.opacity = '0';
      }
      if (rootRef.current) {
        rootRef.current.style.visibility = 'hidden';
        rootRef.current.style.pointerEvents = 'none';
      }
    },
  }));

  const tick = 'absolute size-3';

  return (
    <div
      ref={rootRef}
      aria-hidden='true'
      className='fixed inset-0 z-99998 overflow-hidden'
      style={{ visibility: 'hidden', pointerEvents: 'none' }}
    >
      {/* A 3:2 frame, like a 35mm negative, where this site's headlines sit. */}
      <div
        ref={reticleRef}
        className='absolute left-1/2 top-[46%] -ml-15 -mt-10 w-30 h-20'
        style={{ opacity: 0 }}
      >
        <span data-tick className={`${tick} left-0 top-0 border-l border-t`} style={{ borderColor: GOLD }} />
        <span data-tick className={`${tick} right-0 top-0 border-r border-t`} style={{ borderColor: GOLD }} />
        <span data-tick className={`${tick} left-0 bottom-0 border-l border-b`} style={{ borderColor: GOLD }} />
        <span data-tick className={`${tick} right-0 bottom-0 border-r border-b`} style={{ borderColor: GOLD }} />
        <span
          ref={dotRef}
          className='absolute left-1/2 top-1/2 -ml-px -mt-px size-0.5 rounded-full bg-primary'
          style={{ opacity: 0.5 }}
        />
      </div>
    </div>
  );
};

export default RouteCover;
