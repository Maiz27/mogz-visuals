'use client';

import Turnstile from 'react-turnstile';
import { useState } from 'react';

type Props = {
  onVerify: (token: string) => void;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
};

const TurnstileWidget = ({
  onVerify,
  className = '',
  theme = 'auto',
}: Props) => {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isWidgetReady, setIsWidgetReady] = useState(false);

  if (!siteKey) {
    console.warn(
      'NEXT_PUBLIC_TURNSTILE_SITE_KEY is missing in environment variables.',
    );
    return (
      <div className={`w-full ${className}`}>
        <p className='border border-red-500/30 bg-red-950/20 px-4 py-3 text-red-200 text-sm font-body leading-relaxed'>
          Human verification is unavailable right now. Please refresh and try
          again.
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-full ${className}`}>
      <div className='relative inline-flex min-h-[86px] min-w-[300px] max-w-full items-center'>
        {!isWidgetReady && (
          <div className='absolute inset-0 z-10 flex items-center gap-4 border border-white/10 bg-surface px-4 py-3'>
            <div className='h-10 w-10 shrink-0 animate-pulse rounded-full border border-primary/20 bg-primary/10' />
            <div className='min-w-0'>
              <p className='text-primary text-[10px] tracking-[0.2em] uppercase font-body font-semibold mb-1'>
                Human Check
              </p>
              <p className='text-secondary text-xs font-body leading-relaxed'>
                Loading verification...
              </p>
            </div>
          </div>
        )}
        <div
          className={`transition-opacity duration-300 ${
            isWidgetReady ? 'opacity-100' : 'opacity-0'
          }`}
        >
      <Turnstile
        sitekey={siteKey}
        onLoad={() => {
          setIsWidgetReady(true);
        }}
        onVerify={(token) => {
          setStatusMessage(null);
          onVerify(token);
        }}
        theme={theme}
        onError={() => {
          setIsWidgetReady(true);
          setStatusMessage(
            "We couldn't confirm you're human. Please try again.",
          );
          onVerify('');
          console.error('Human verification error');
        }}
        onExpire={() => {
          setStatusMessage('Human check expired. Please complete it again.');
          onVerify('');
        }}
      />
        </div>
      </div>
      {statusMessage && (
        <p className='mt-3 text-red-500/80 text-xs font-body tracking-wide leading-relaxed'>
          {statusMessage}
        </p>
      )}
    </div>
  );
};

export default TurnstileWidget;
