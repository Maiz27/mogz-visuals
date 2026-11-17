import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const SOUND_KEY = 'mogz-and-lin:sound';
const VOLUME = 0.7;

/** The track, trimmed of its trailing silence and faded at the loop point. */
export const MUSIC_SOURCES = [
  { src: '/audio/perfect-instrumental.webm', type: 'audio/webm; codecs=opus' },
  // For Safari releases that can't play Opus.
  { src: '/audio/perfect-instrumental.m4a', type: 'audio/mp4' },
];

/**
 * The background music. Browsers only allow sound after the guest has
 * tapped, so `start` is called from the seal's tap. It fades in, loops, pauses
 * while the page is hidden, and remembers a guest who turned it off.
 */
export const useMusic = () => {
  const audio = useRef<HTMLAudioElement>(null);
  const started = useRef(false);
  const [on, setOn] = useState(true);

  useEffect(() => {
    try {
      if (localStorage.getItem(SOUND_KEY) === 'off') setOn(false);
    } catch {}
  }, []);

  const fadeIn = useCallback(() => {
    const el = audio.current;
    if (!el) return;
    gsap.killTweensOf(el);
    el.volume = 0;
    el.play().catch(() => {});
    gsap.to(el, { volume: VOLUME, duration: 2.5, ease: 'power1.in' });
  }, []);

  const fadeOut = useCallback(() => {
    const el = audio.current;
    if (!el) return;
    gsap.killTweensOf(el);
    gsap.to(el, { volume: 0, duration: 0.6, onComplete: () => el.pause() });
  }, []);

  /** Called from a tap, so the browser lets it play. */
  const start = useCallback(() => {
    started.current = true;
    if (on) fadeIn();
  }, [on, fadeIn]);

  const toggle = useCallback(() => {
    const next = !on;
    setOn(next);
    try {
      localStorage.setItem(SOUND_KEY, next ? 'on' : 'off');
    } catch {}
    started.current = true;
    if (next) fadeIn();
    else fadeOut();
  }, [on, fadeIn, fadeOut]);

  // Silent while the phone is locked or the guest is in another tab.
  useEffect(() => {
    const onVisibility = () => {
      const el = audio.current;
      if (!el || !started.current || !on) return;
      if (document.hidden) el.pause();
      else el.play().catch(() => {});
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [on]);

  return { audio, on, start, toggle };
};
