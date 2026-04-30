'use client';

import { useEffect, useState } from 'react';
import CTAButton from '@/components/ui/CTA/CTAButton';
import Drawer from '@/components/ui/Drawer';
import Checkbox from '@/components/ui/form/Checkbox';
import {
  ANNOUNCEMENT_PERSISTENT_PREFIX,
  ANNOUNCEMENT_SESSION_PREFIX,
} from '@/lib/announcement';
import type { AnnouncementItem } from '@/lib/types';
import { HiOutlineQuestionMarkCircle, HiOutlineXMark } from 'react-icons/hi2';

const HELP_TEXT =
  'This hides the current announcement set on this device. New or changed announcements will still appear.';

type Props = {
  items: AnnouncementItem[];
  setKey: string;
};

const AnnouncementBarClient = ({ items, setKey }: Props) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const updateIsMobile = () => setIsMobile(media.matches);

    updateIsMobile();
    media.addEventListener('change', updateIsMobile);

    return () => media.removeEventListener('change', updateIsMobile);
  }, []);

  useEffect(() => {
    const isSessionDismissed = sessionStorage.getItem(
      `${ANNOUNCEMENT_SESSION_PREFIX}:${setKey}`,
    );
    const isPersistentlyDismissed = localStorage.getItem(
      `${ANNOUNCEMENT_PERSISTENT_PREFIX}:${setKey}`,
    );

    if (isSessionDismissed || isPersistentlyDismissed) {
      setIsVisible(false);
    }
  }, [setKey]);

  if (!isVisible) {
    return null;
  }

  const handleConfirmDismiss = () => {
    const prefix = dontShowAgain
      ? ANNOUNCEMENT_PERSISTENT_PREFIX
      : ANNOUNCEMENT_SESSION_PREFIX;
    const storage = dontShowAgain ? localStorage : sessionStorage;

    storage.setItem(`${prefix}:${setKey}`, 'true');
    setIsConfirmOpen(false);
    setIsVisible(false);
  };

  const handleSingleLinkClick = () => {
    if (items.length !== 1) return;

    sessionStorage.setItem(`${ANNOUNCEMENT_SESSION_PREFIX}:${setKey}`, 'true');
    setIsVisible(false);
  };

  const checkboxLabel = (
    <span className='flex min-w-0 items-start gap-1.5'>
      <span>Don&apos;t show this set again</span>
      <span className='group relative inline-flex'>
        <span
          role='img'
          tabIndex={0}
          aria-label={HELP_TEXT}
          className='mt-0.5 text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary'
        >
          <HiOutlineQuestionMarkCircle />
        </span>
        <span className='pointer-events-none absolute right-0 top-6 z-10 hidden w-64 bg-copy px-3 py-2 text-xs leading-relaxed text-background shadow-xl group-hover:block group-focus-within:block'>
          {HELP_TEXT}
        </span>
      </span>
    </span>
  );

  const getConfirmContent = (showHeading = true) => (
    <div className='flex flex-col gap-5'>
      <div className='space-y-2'>
        {showHeading && (
          <h2 className='text-xl font-bold tracking-wide text-primary'>
            Hide announcements?
          </h2>
        )}
        <span className='text-sm leading-relaxed tracking-wide text-secondary'>
          Hide this announcement bar for the current session, or keep it hidden
          for this announcement set on this device.
        </span>
      </div>

      <Checkbox
        id='announcement-dont-show-again'
        name='dontShowAgain'
        label={checkboxLabel}
        state={{ dontShowAgain }}
        onChange={(event) => setDontShowAgain(event.target.checked)}
      />

      <div className='flex items-center justify-end gap-2'>
        <CTAButton
          style='ghost'
          onClick={() => setIsConfirmOpen(false)}
          className='h-11 text-sm'
        >
          Cancel
        </CTAButton>
        <CTAButton
          style='primary'
          onClick={handleConfirmDismiss}
          className='h-11 text-sm'
        >
          Confirm
        </CTAButton>
      </div>
    </div>
  );

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: getPrePaintDismissalScript(setKey),
        }}
      />
      <style>{`
        :root {
          --announcement-height: 40px;
        }

        @media (min-width: 768px) {
          :root {
            --announcement-height: 36px;
          }
        }
      `}</style>

      <aside
        id={`announcement-bar-${setKey}`}
        className='fixed left-0 right-0 top-0 z-9999 h-10 overflow-hidden border-b border-primary/20 bg-background text-copy md:h-9'
        aria-label='Site announcements'
      >
        <div className='group flex h-full items-center overflow-hidden pr-12'>
          <div className='announcement-marquee flex min-w-max items-center'>
            <AnnouncementGroup
              items={items}
              onSingleLinkClick={handleSingleLinkClick}
            />
            <AnnouncementGroup
              items={items}
              onSingleLinkClick={handleSingleLinkClick}
              ariaHidden
            />
          </div>
        </div>

        <button
          type='button'
          onClick={() => setIsConfirmOpen(true)}
          className='absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center bg-background/95 text-xl text-primary transition-colors hover:cursor-pointer hover:bg-primary hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
          aria-label='Dismiss announcements'
          title='Dismiss announcements'
        >
          <HiOutlineXMark />
        </button>
      </aside>

      {isConfirmOpen && isMobile && (
        <Drawer
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          title='Hide announcements?'
          className='h-auto max-h-[70dvh]'
        >
          {getConfirmContent(false)}
        </Drawer>
      )}

      {isConfirmOpen && !isMobile && (
        <>
          <button
            type='button'
            aria-label='Close announcement dismissal options'
            className='fixed inset-0 z-9998 cursor-default'
            onClick={() => setIsConfirmOpen(false)}
          />
          <div
            role='dialog'
            aria-modal='false'
            aria-label='Announcement dismissal options'
            className='fixed right-3 top-[calc(var(--announcement-height)+0.5rem)] z-99999 w-96 max-w-[calc(100vw-1.5rem)] border border-white/10 bg-background p-5 shadow-2xl'
          >
            {getConfirmContent()}
          </div>
        </>
      )}
    </>
  );
};

export default AnnouncementBarClient;

const AnnouncementGroup = ({
  items,
  onSingleLinkClick,
  ariaHidden = false,
}: {
  items: AnnouncementItem[];
  onSingleLinkClick: () => void;
  ariaHidden?: boolean;
}) => {
  const repeatedItems = repeatItems(items);

  return (
    <div
      className='flex shrink-0 items-center'
      aria-hidden={ariaHidden || undefined}
    >
      {repeatedItems.map((item, index) => (
        <AnnouncementEntry
          key={`${item._key}-${index}`}
          item={item}
          onSingleLinkClick={onSingleLinkClick}
          isHiddenDuplicate={ariaHidden}
        />
      ))}
    </div>
  );
};

const AnnouncementEntry = ({
  item,
  onSingleLinkClick,
  isHiddenDuplicate,
}: {
  item: AnnouncementItem;
  onSingleLinkClick: () => void;
  isHiddenDuplicate: boolean;
}) => {
  const content = (
    <>
      <span className='font-bold'>{item.message}</span>
      {item.linkLabel && (
        <span className='ml-2 text-primary'>{item.linkLabel}</span>
      )}
    </>
  );

  return (
    <div className='flex h-full shrink-0 items-center text-xs font-bold uppercase tracking-widest md:text-sm'>
      {item.linkUrl ? (
        <a
          href={item.linkUrl}
          target={getLinkTarget(item.linkUrl)}
          rel={getLinkRel(item.linkUrl)}
          onClick={onSingleLinkClick}
          tabIndex={isHiddenDuplicate ? -1 : undefined}
          className='transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
        >
          {content}
        </a>
      ) : (
        <span>{content}</span>
      )}
      <span
        className='mx-5 h-1.5 w-1.5 rounded-full bg-primary'
        aria-hidden='true'
      />
    </div>
  );
};

const repeatItems = (items: AnnouncementItem[]) => {
  const minimumItems = items.length === 1 ? 6 : 4;
  const repetitions = Math.ceil(minimumItems / items.length);

  return Array.from({ length: repetitions }, () => items).flat();
};

const getLinkTarget = (url: string) =>
  isInternalLink(url) ? undefined : '_blank';

const getLinkRel = (url: string) =>
  isInternalLink(url) ? undefined : 'noopener noreferrer';

const isInternalLink = (url: string) => {
  if (url.startsWith('/')) return true;
  if (typeof window === 'undefined') return false;

  try {
    return new URL(url).origin === window.location.origin;
  } catch {
    return false;
  }
};

const getPrePaintDismissalScript = (setKey: string) => {
  return `
    try {
      var key = ${JSON.stringify(setKey)};
      var isDismissed =
        window.sessionStorage.getItem('${ANNOUNCEMENT_SESSION_PREFIX}:' + key) ||
        window.localStorage.getItem('${ANNOUNCEMENT_PERSISTENT_PREFIX}:' + key);

      if (isDismissed) {
        var style = document.createElement('style');
        style.setAttribute('data-announcement-dismissal', key);
        style.textContent = '#announcement-bar-' + key + '{display:none!important}:root{--announcement-height:0px!important}';
        document.head.appendChild(style);
      }
    } catch {}
  `;
};
