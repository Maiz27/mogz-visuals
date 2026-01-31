'use client';

import Turnstile from 'react-turnstile';

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

  if (!siteKey) {
    console.warn(
      'NEXT_PUBLIC_TURNSTILE_SITE_KEY is missing in environment variables.',
    );
    return null;
  }

  return (
    <div className={`w-fit ${className}`}>
      <Turnstile
        sitekey={siteKey}
        onVerify={onVerify}
        theme={theme}
        onError={() => console.error('Turnstile Error')}
        onExpire={() => onVerify('')}
      />
    </div>
  );
};

export default TurnstileWidget;
