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
import type { CoverVariant } from '@/lib/invite';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const OPENED_KEY = 'mogz-and-lin:opened';
const NAV_SECTIONS: NavSection[] = ['home', 'venues', 'day', 'seating'];

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const WeddingInvite = ({ variant }: { variant: CoverVariant }) => {
  const root = useRef<HTMLDivElement>(null);
  const opening = useRef(false);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const [active, setActive] = useState<NavSection>('home');

  const q = gsap.utils.selector(root);
  const part = (...names: string[]) =>
    q(names.map((name) => `[data-iv='${name}']`).join(','));

  // The bow settles onto the card as the page arrives. Every animated part
  // starts in CSS where its motion begins (invite.css), so GSAP only ever
  // animates *to* the rest state and nothing flashes before it plays.
  const { contextSafe } = useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.set(part('bow', 'cover-copy'), { opacity: 1, y: 0 });
        return;
      }
      gsap.to(part('bow'), { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out', delay: 0.2 });
      gsap.to(part('cover-copy'), { opacity: 1, duration: 1, delay: 1 });
    },
    { scope: root },
  );

  // Hold the page still at the top until the invitation is open.
  useEffect(() => {
    try {
      setCanSkip(localStorage.getItem(OPENED_KEY) === '1');
    } catch {}
    history.scrollRestoration = 'manual';
    // Instant: the site sets smooth scrolling, which would glide here from a #hash.
    window.scrollTo({ top: 0, behavior: 'instant' });
    const html = document.documentElement;
    html.style.overflow = 'hidden';
    return () => {
      html.style.overflow = '';
      history.scrollRestoration = 'auto';
    };
  }, []);

  const finish = () => {
    document.documentElement.style.overflow = '';
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
    gsap.set(part('hero-card'), { scale: 1, y: 0 });
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

    const [firstName, secondName] = part('hero-name');
    timeline.current = gsap
      .timeline({ onComplete: finish })
      .to(part('cover-copy'), { opacity: 0, duration: 0.3 }, 0)
      // The bow is lifted, then falls away as the ribbon is drawn out.
      .to(part('bow'), { y: -14, scale: 1.03, duration: 0.2, ease: 'power2.out' }, 0)
      .to(part('bow'), { y: '115vh', rotation: 10, duration: 1, ease: 'power2.in' }, 0.2)
      .to(part('band-left'), { xPercent: -101, duration: 0.75, ease: 'power3.in' }, 0.3)
      .to(part('band-right'), { xPercent: 101, duration: 0.75, ease: 'power3.in' }, 0.3)
      // The gatefold swings open and the card rises out of it.
      .to(part('flap-left'), { rotationY: -165, duration: 1.7, ease: 'power3.inOut' }, 0.85)
      .to(part('flap-right'), { rotationY: 165, duration: 1.7, ease: 'power3.inOut' }, 0.85)
      .to(part('flaps'), { opacity: 0, duration: 0.5 }, 2.15)
      // The shade behind the flaps lifts as they part, so nothing is left to
      // cut out when the cover is removed.
      .to(part('cover'), { backgroundColor: 'rgba(42, 13, 23, 0)', duration: 1.2, ease: 'power2.out' }, 1.1)
      .set(part('cover'), { display: 'none' }, 2.7)
      .to(part('hero-card'), { scale: 1, y: 0, duration: 1.6, ease: 'power3.out' }, 1)
      .to(part('hero-rise'), { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 1.55)
      .to(firstName, { '--reveal': '125%', duration: 1.1, ease: 'power1.inOut' }, 1.85)
      .to(secondName, { '--reveal': '125%', duration: 1.1, ease: 'power1.inOut' }, 2.5);
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
    <div ref={root} className='invite-root' data-cover={variant}>
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

      <InviteCover variant={variant} canSkip={canSkip} onOpen={open} onSkip={skip} />
      <BottomNav visible={isOpen} active={active} />
    </div>
  );
};

export default WeddingInvite;
