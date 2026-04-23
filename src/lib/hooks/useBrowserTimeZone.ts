'use client';

import { useEffect, useState } from 'react';

export function useBrowserTimeZone() {
  const [browserTimeZone, setBrowserTimeZone] = useState('');
  const [timeZoneReady, setTimeZoneReady] = useState(false);

  useEffect(() => {
    try {
      setBrowserTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone ?? '');
    } catch {
      setBrowserTimeZone('');
    } finally {
      setTimeZoneReady(true);
    }
  }, []);

  return {
    browserTimeZone,
    timeZoneReady,
  };
}
