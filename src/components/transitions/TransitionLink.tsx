'use client';

import Link from 'next/link';
import { ComponentProps, MouseEvent } from 'react';
import { useTransitionNavigate } from '@/lib/context/TransitionContext';

type Props = ComponentProps<typeof Link> & { href: string };

/**
 * next/link with page transitions. Inside an element marked data-vt-card, the
 * card's data-vt-shared image morphs into the next page's data-vt-hero image.
 */
const TransitionLink = ({ href, onClick, target, ...rest }: Props) => {
  const { navigate } = useTransitionNavigate();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      (target && target !== '_self')
    ) {
      return;
    }
    e.preventDefault();
    const shared = e.currentTarget
      .closest('[data-vt-card]')
      ?.querySelector<HTMLElement>('[data-vt-shared]');
    navigate(href, shared);
  };

  return <Link href={href} target={target} onClick={handleClick} {...rest} />;
};

export default TransitionLink;
