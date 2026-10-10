import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../context/ToastContext';

/**
 * The server already refuses expired tokens; this only keeps the UI honest by
 * clearing the cookie and refreshing when the session the server issued runs
 * out.
 */
export const useAutoDeleteCookie = (id: string, isPrivate: boolean) => {
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const { show } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!isPrivate || !id) {
      return;
    }

    let cancelled = false;

    const checkAuth = async () => {
      try {
        const res = await fetch(`/api/auth/check?id=${encodeURIComponent(id)}`);
        if (!res.ok) {
          return;
        }

        const data = await res.json();
        if (!cancelled && data.authenticated && data.expiresAt) {
          setExpiresAt(data.expiresAt);
        }
      } catch (error) {
        console.error('Auth check failed', error);
      }
    };

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [id, isPrivate]);

  useEffect(() => {
    if (!isPrivate || !expiresAt) {
      return;
    }

    const timer = setTimeout(
      () => {
        // httpOnly cookies cannot be deleted from the client, so ask the
        // server to expire it.
        fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
          router.refresh(); // Refresh to update server components
          show('Your access to private collection expired!', {
            status: 'info',
            autoClose: false,
          });
        });
      },
      Math.max(0, expiresAt - Date.now()),
    );

    return () => {
      clearTimeout(timer);
    };
  }, [expiresAt, isPrivate, router, show]);
};
