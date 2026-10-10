'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
import RouteCover, {
  RouteCoverHandle,
} from '@/components/transitions/RouteCover';
import { SHARED_HERO_NAME, getTransitionKind } from '@/lib/transitions';

type TransitionContextValue = {
  navigate: (href: string, sharedImage?: HTMLElement | null) => void;
  /** Changes whenever a navigation starts or Back/Forward is used, so a
   *  navigation queued earlier can tell it has been overtaken. */
  latestNavigation: () => number;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

// The focus pull holds until the next route commits; past this it reveals anyway.
const COVER_WATCHDOG_MS = 7000;
// The reticle only starts hunting when the route is genuinely slow.
const HUNT_AFTER_MS = 400;
// The browser aborts a view transition whose DOM update runs past about 4 s. A morph
// whose route isn't ready by then is cancelled; the route lands as a plain cut.
const MORPH_ROUTE_TIMEOUT_MS = 3000;
const HERO_TIMEOUT_MS = 600;
// Back/forward: a short opacity-only fade, like the Gumbo site's route entrance.
// Opacity, not movement, so locomotive scroll positions are untouched.
const TRAVERSAL_FADE_MS = 400;
// Reduced motion: no focus pull, just a brief crossfade instead of a hard cut.
const REDUCED_MOTION_FADE_MS = 200;
// A fade requested longer ago than this didn't cause the route change being rendered.
const FADE_WINDOW_MS = 3000;

class RouteTimeout extends Error {}

// Rendering is paused while a view transition updates the DOM, so animation
// frames never fire there; yield to a task instead.
const nextTask = () => new Promise<void>((resolve) => setTimeout(resolve, 0));
const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Make sure the morph lands on a photo. If the header photo isn't ready, show the
 * card's photo (already loaded) behind it until the full image arrives.
 */
const prepareHero = async (sharedImage: HTMLElement) => {
  const hero = document.querySelector<HTMLElement>('[data-vt-hero]');
  const img = hero?.querySelector('img');
  if (!hero || !img || img.complete) return;

  const cardSrc = sharedImage.querySelector('img')?.currentSrc;
  if (cardSrc) {
    hero.style.backgroundImage = `url("${cardSrc}")`;
    hero.style.backgroundSize = 'cover';
    hero.style.backgroundPosition = 'center';
  }
  await Promise.race([
    img.decode().catch(() => undefined),
    new Promise((resolve) => setTimeout(resolve, HERO_TIMEOUT_MS)),
  ]);
};

export const useTransitionNavigate = () => {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error(
      'useTransitionNavigate must be used within a TransitionProvider',
    );
  }
  return context;
};

export const TransitionProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const routeCover = useRef<RouteCoverHandle>(null);
  const busy = useRef(false);
  // Set while a transition waits for a route; resolved by the next route commit.
  const pending = useRef<(() => void) | null>(null);
  // A plain fade for the next route: back/forward, or any click under reduced motion.
  const fadeNext = useRef<{ at: number; ms: number } | null>(null);
  // Bumped by every navigation and every Back/Forward: a transition only
  // pushes its destination if nothing newer has happened since it started.
  const generation = useRef(0);
  // Bumped by every navigate() call and every Back/Forward.
  const navigations = useRef(0);
  const latestNavigation = useCallback(() => navigations.current, []);
  const activeMorph = useRef<ViewTransition | null>(null);

  /** Something newer happened: no delayed push may follow, and any waiting
   *  transition reveals onto wherever the visitor now is. */
  const supersede = useCallback(() => {
    generation.current += 1;
    activeMorph.current?.skipTransition();
    const resolve = pending.current;
    if (resolve) {
      pending.current = null;
      resolve();
    }
  }, []);

  // Back/forward never gets the focus pull (it's a quick undo, and on iPhone
  // Safari already animates the swipe). Note it so the next route fades in instead.
  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      // Cancels an in-flight transition even when only the query changes
      // (e.g. gallery page 2 -> page 1), where no pathname change would.
      navigations.current += 1;
      supersede();
      const uaAnimated = (
        event as PopStateEvent & { hasUAVisualTransition?: boolean }
      ).hasUAVisualTransition;
      fadeNext.current = uaAnimated
        ? null
        : {
            at: performance.now(),
            ms: prefersReducedMotion()
              ? REDUCED_MOTION_FADE_MS
              : TRAVERSAL_FADE_MS,
          };
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [supersede]);

  // Runs before paint, so a fade starts from the first frame.
  useLayoutEffect(() => {
    // A transition is waiting: reveal whichever route committed. That is the
    // destination, or wherever Back took the visitor mid-transition.
    const resolve = pending.current;
    if (resolve) {
      pending.current = null;
      fadeNext.current = null;
      // If the new route brought a new layout (and so a new page container),
      // hold it out of focus before its first paint.
      routeCover.current?.hold();
      resolve();
      return;
    }

    const fade = fadeNext.current;
    fadeNext.current = null;
    if (!fade || performance.now() - fade.at > FADE_WINDOW_MS) return;

    document
      .querySelector('[data-scroll-container]')
      ?.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: fade.ms,
        easing: 'ease-out',
      });
  }, [pathname]);

  /** Resolves on the next route commit; on timeout, resolves or rejects as asked. */
  const waitForRoute = useCallback(
    (timeoutMs: number, onTimeout: 'resolve' | 'reject') =>
      new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.current = null;
          if (onTimeout === 'resolve') resolve();
          else reject(new RouteTimeout());
        }, timeoutMs);
        pending.current = () => {
          clearTimeout(timer);
          resolve();
        };
      }),
    [],
  );

  const runCover = useCallback(
    async (href: string) => {
      const lens = routeCover.current;
      if (!lens) {
        router.push(href);
        return;
      }
      busy.current = true;
      const mine = ++generation.current;
      // Listen from the first frame: if Back or another navigation lands while
      // focus is still racking out, reveal onto it and drop this one.
      let pushed = false;
      let superseded = false;
      const routed = waitForRoute(COVER_WATCHDOG_MS, 'resolve').then(() => {
        if (!pushed) superseded = true;
      });

      await lens.cover();
      if (!superseded && generation.current === mine) {
        pushed = true;
        router.push(href);
      }
      const hunt = setTimeout(() => lens.hunt(), HUNT_AFTER_MS);
      await routed;
      clearTimeout(hunt);
      // Let the new page lay out and paint behind the reticle, confirm focus,
      // then rack it in.
      await nextFrame();
      await nextFrame();
      await lens.lock();
      await lens.reveal();
      busy.current = false;
    },
    [router, waitForRoute],
  );

  const runMorph = useCallback(
    (href: string, sharedImage: HTMLElement) => {
      busy.current = true;
      const mine = ++generation.current;
      const root = document.documentElement;
      root.dataset.vt = 'morph';
      sharedImage.style.viewTransitionName = SHARED_HERO_NAME;

      const transition = document.startViewTransition(async () => {
        sharedImage.style.viewTransitionName = '';
        const routed = waitForRoute(MORPH_ROUTE_TIMEOUT_MS, 'reject');
        if (generation.current === mine) router.push(href);
        // A slow route rejects here, which cancels the morph instead of
        // animating onto the page we're leaving; the route then lands as a cut.
        await routed;
        window.scrollTo(0, 0);
        await nextTask();
        await prepareHero(sharedImage);
      });

      activeMorph.current = transition;
      const done = () => {
        delete root.dataset.vt;
        busy.current = false;
        if (activeMorph.current === transition) activeMorph.current = null;
      };
      transition.ready.catch(() => undefined);
      transition.updateCallbackDone.catch(() => undefined);
      transition.finished.then(done, done);
    },
    [router, waitForRoute],
  );

  const navigate = useCallback(
    (href: string, sharedImage?: HTMLElement | null) => {
      navigations.current += 1;
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) {
        window.location.href = url.href;
        return;
      }

      const kind = getTransitionKind(
        window.location.pathname,
        url.pathname,
        Boolean(sharedImage),
      );

      if (kind && !busy.current && prefersReducedMotion()) {
        fadeNext.current = { at: performance.now(), ms: REDUCED_MOTION_FADE_MS };
      }
      if (!kind || busy.current || prefersReducedMotion()) {
        // A newer navigation wins: an in-flight transition must not push its
        // older destination afterwards (e.g. two keyboard activations), and
        // must reveal now even if this route doesn't change the pathname.
        if (busy.current) supersede();
        router.push(href);
        return;
      }

      if (
        kind === 'morph' &&
        sharedImage &&
        typeof document.startViewTransition === 'function'
      ) {
        runMorph(href, sharedImage);
        return;
      }
      void runCover(href);
    },
    [router, runMorph, runCover, supersede],
  );

  return (
    <TransitionContext.Provider value={{ navigate, latestNavigation }}>
      {children}
      <RouteCover ref={routeCover} />
    </TransitionContext.Provider>
  );
};
