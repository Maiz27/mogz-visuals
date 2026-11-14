'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import InviteCover from './InviteCover';
import InviteHero from './InviteHero';
import Countdown from './Countdown';
import StorySection from './StorySection';
import SaveTheDate from './SaveTheDate';
import VenuesSection from './VenuesSection';
import TheDaySection from './TheDaySection';
import DressCodeSection from './DressCodeSection';
import GallerySection from './GallerySection';
import SeatingSection from './SeatingSection';
import ClosingSection from './ClosingSection';
import BottomNav, { type NavSection } from './BottomNav';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const OPENED_KEY = 'mogz-and-lin:opened';
const NAV_SECTIONS: NavSection[] = ['home', 'venues', 'day', 'seating'];
// The portrait at rest: lifted a touch, since the couple sits in shadow.
const HERO_REST = 'blur(0px) brightness(1.1) saturate(1.1)';

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const WeddingInvite = () => {
  const root = useRef<HTMLDivElement>(null);
  const opening = useRef(false);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const [active, setActive] = useState<NavSection>('home');

  const q = gsap.utils.selector(root);
  const part = (...names: string[]) =>
    q(names.map((name) => `[data-iv='${name}']`).join(','));

  // The seal is pressed onto the envelope as the page arrives. Every animated
  // part starts in CSS where its motion begins (invite.css), so GSAP only ever
  // animates *to* the rest state and nothing flashes before it plays.
  const { contextSafe } = useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.set(part('seal', 'cover-copy'), { opacity: 1, scale: 1 });
        return;
      }
      gsap.to(part('seal'), { scale: 1, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 0.2 });
      gsap.to(part('cover-copy'), { opacity: 1, duration: 1, delay: 1 });
    },
    { scope: root },
  );

  // Start at the top. The page is held still in CSS until `data-open` is set.
  useEffect(() => {
    try {
      setCanSkip(localStorage.getItem(OPENED_KEY) === '1');
    } catch {}
    history.scrollRestoration = 'manual';
    // Instant: the site sets smooth scrolling, which would glide here from a #hash.
    window.scrollTo({ top: 0, behavior: 'instant' });
    return () => {
      history.scrollRestoration = 'auto';
    };
  }, []);

  const finish = () => {
    try {
      localStorage.setItem(OPENED_KEY, '1');
    } catch {}
    setIsOpen(true);
  };

  // The cover's button is gone once it opens; hand focus to the card it revealed.
  useEffect(() => {
    if (isOpen) root.current?.querySelector('main')?.focus({ preventScroll: true });
  }, [isOpen]);

  /** The card, at rest, as it is once the cover is gone. */
  const settleHero = () => {
    gsap.set(part('cover'), { display: 'none' });
    gsap.set(part('hero-photo'), { scale: 1, filter: HERO_REST });
    gsap.set(part('hero-rise'), { opacity: 1, y: 0 });
    gsap.set(part('hero-name'), { '--reveal': '125%' });
  };

  const open = contextSafe(() => {
    if (opening.current) return;
    opening.current = true;

    if (prefersReducedMotion()) {
      // The card is laid out at rest beneath; the cover simply dissolves.
      settleHero();
      gsap.set(part('cover'), { display: 'flex' });
      gsap.to(part('cover'), {
        opacity: 0,
        duration: 0.8,
        onComplete: () => {
          gsap.set(part('cover'), { display: 'none' });
          finish();
        },
      });
      return;
    }

    // A tap during the seal's entrance would otherwise let that tween carry on
    // and bring the whole seal back after it cracks.
    gsap.killTweensOf(part('seal'));
    gsap.set(part('seal'), { opacity: 1, scale: 1 });

    const [firstName, secondName] = part('hero-name');
    timeline.current = gsap
      .timeline({ onComplete: finish })
      // The print stays on the flaps and folds away with them.
      // The seal throbs once under the tap, then cracks along the folds: the
      // whole seal gives way to the quarter printed on each flap, and the
      // quarters part a hair while the paper stays closed.
      .to(part('seal'), { scale: 1.15, duration: 0.18, ease: 'power2.out' }, 0)
      .to(part('seal'), { scale: 1, duration: 0.14, ease: 'power3.in' }, 0.18)
      .set(part('wedge-left', 'wedge-right', 'wedge-top', 'wedge-bottom'), { visibility: 'visible' }, 0.32)
      .set(part('seal'), { opacity: 0 }, 0.32)
      .to(part('wedge-left'), { x: -3, rotation: -2, duration: 0.25, ease: 'power2.out' }, 0.32)
      .to(part('wedge-right'), { x: 3, rotation: 2, duration: 0.25, ease: 'power2.out' }, 0.32)
      .to(part('wedge-top'), { y: -3, rotation: 1.5, duration: 0.25, ease: 'power2.out' }, 0.32)
      .to(part('wedge-bottom'), { y: 3, rotation: -1.5, duration: 0.25, ease: 'power2.out' }, 0.32)
      // The camera leans in as the envelope opens.
      .to(part('flaps'), { scale: 1.15, duration: 2.6, ease: 'power2.in' }, 0.55)
      // The sides fold out towards the guest first, each taking its piece of the seal.
      .to(part('flap-left'), { rotationY: -108, duration: 1.4, ease: 'power3.inOut' }, 0.7)
      .to(part('flap-right'), { rotationY: 108, duration: 1.4, ease: 'power3.inOut' }, 0.78)
      .to(part('dark-left', 'dark-right'), { opacity: 0.6, duration: 1.2, ease: 'power2.in' }, 0.7)
      // Then the top and bottom, the last of the seal riding on their tips.
      .to(part('flap-top'), { rotationX: 108, duration: 1.4, ease: 'power3.inOut' }, 1.55)
      .to(part('flap-bottom'), { rotationX: -108, duration: 1.4, ease: 'power3.inOut' }, 1.7)
      .to(part('dark-top', 'dark-bottom'), { opacity: 0.6, duration: 1.2, ease: 'power2.in' }, 1.55)
      // The shade behind the flaps lifts as they part, so the gaps glow with
      // the portrait and nothing is left to cut out when the cover goes.
      .to(part('cover'), { backgroundColor: 'rgba(18, 6, 10, 0)', duration: 1.4, ease: 'power1.inOut' }, 0.65)
      .set(part('cover'), { display: 'none' }, 3.1)
      // The portrait comes into focus as it is uncovered, still settling after
      // the last flap leaves, and the print rises over it.
      .to(part('hero-photo'), { scale: 1, filter: HERO_REST, duration: 3.2, ease: 'power3.out' }, 0.7)
      .to(part('hero-rise'), { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 }, 2.45)
      .to(firstName, { '--reveal': '125%', duration: 1.1, ease: 'power1.inOut' }, 2.65)
      .to(secondName, { '--reveal': '125%', duration: 1.1, ease: 'power1.inOut' }, 3.15);
  });

  const skip = contextSafe(() => {
    opening.current = true;
    timeline.current?.kill();
    settleHero();
    finish();
  });

  // Once open, every section plays as it scrolls into view.
  useGSAP(
    () => {
      if (!isOpen) return;
      const reduced = prefersReducedMotion();

      // The film strip holds the screen and slides sideways. Its pin adds
      // scroll distance, so it is created first: triggers made before it
      // would not account for that space and fire too early.
      const [strip] = part('strip');
      const [track] = part('strip-track');
      if (strip && track && !reduced) {
        const distance = () => track.scrollWidth - strip.clientWidth;
        gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: strip,
            start: 'center center',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
      }

      NAV_SECTIONS.forEach((id) => {
        ScrollTrigger.create({
          trigger: `#${id}`,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => self.isActive && setActive(id),
        });
      });

      const shapes = (svg: Element) =>
        [...svg.querySelectorAll<SVGGeometryElement>('path, circle')];

      if (reduced) {
        gsap.set(part('rise'), { opacity: 1, y: 0 });
        gsap.set(part('write'), { '--reveal': '125%' });
        gsap.set(part('develop'), { filter: 'none', scale: 1 });
        gsap.set(part('wreath'), { rotation: 0, scale: 1, opacity: 1 });
        gsap.set(part('timeline-line'), { scaleY: 1 });
        gsap.set(part('draw'), { visibility: 'visible' });
        return;
      }

      part('rise').forEach((el) =>
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        }),
      );

      part('write').forEach((el) =>
        gsap.to(el, {
          '--reveal': '125%',
          duration: 1.3,
          ease: 'power1.inOut',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        }),
      );

      // The venues draw themselves, stroke by stroke, with the scroll.
      part('draw').forEach((svg) => {
        const strokes = shapes(svg);
        // Each stroke starts a little way into its gap: at exactly one length
        // the round line caps still print a dot where every stroke begins.
        strokes.forEach((s) => {
          const length = s.getTotalLength();
          gsap.set(s, { strokeDasharray: `${length} ${length + 8}`, strokeDashoffset: length + 4 });
        });
        // Hidden in CSS until every stroke is undrawn, so it never shows whole first.
        gsap.set(svg, { visibility: 'visible' });
        gsap.to(strokes, {
          strokeDashoffset: 0,
          ease: 'none',
          stagger: 0.03,
          scrollTrigger: { trigger: svg, start: 'top 85%', end: 'bottom 50%', scrub: 0.6 },
        });
      });

      // The portrait develops out of the dark as it reaches the centre.
      part('develop').forEach((el) =>
        gsap.to(el, {
          filter: 'brightness(1) blur(0px) saturate(1)',
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 90%', end: 'center 55%', scrub: 0.8 },
        }),
      );

      part('wreath').forEach((el) =>
        gsap.to(el, {
          rotation: 0,
          scale: 1,
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 95%', end: 'center 55%', scrub: 0.8 },
        }),
      );

      part('timeline-line').forEach((el) =>
        gsap.to(el, {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 60%', scrub: 0.6 },
        }),
      );

      ScrollTrigger.refresh();
    },
    { scope: root, dependencies: [isOpen] },
  );

  return (
    <div ref={root} className='invite-root' data-open={isOpen || undefined}>
      <main inert={!isOpen} tabIndex={-1} className='iv-col iv-page overflow-x-clip outline-none'>
        <InviteHero />
        <Countdown />
        <StorySection />
        <SaveTheDate />
        <VenuesSection />
        <TheDaySection />
        <DressCodeSection />
        <GallerySection />
        <SeatingSection />
        <ClosingSection />
      </main>

      <InviteCover canSkip={canSkip} onOpen={open} onSkip={skip} />
      <BottomNav visible={isOpen} active={active} />
    </div>
  );
};

export default WeddingInvite;
