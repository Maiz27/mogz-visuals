import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../context/ToastContext';

export const useAutoDeleteCookie = (id: string, isPrivate: boolean) => {
  const [decrypted, setDecrypted] = useState<any | null>(null);
  const { show } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (isPrivate) {
      const checkAuth = async () => {
        try {
          const res = await fetch('/api/auth/check');
          if (res.ok) {
            const data = await res.json();
            if (data.authenticated) {
              setDecrypted({ uniqueId: data.uniqueId });
            }
          }
        } catch (error) {
          console.error('Auth check failed', error);
        }
      };

      checkAuth();
    }
  }, [isPrivate]);

  useEffect(() => {
    if (isPrivate && decrypted) {
      const CheckInterval = setInterval(async () => {
        // Periodically check if session is arguably expired based on client time (rough check)
        // or rely on the API check which we could poll.
        // For now, we'll stick to a simple timeout if we can trust the initial time,
        // but with httpOnly cookies we can't read the timestamp.
        // Better approach: Rely on the cookie's own Max-Age to expire it.
        // Client-side "auto-delete" is mostly UI feedback now.
      }, 60000);

      const timer = setTimeout(
        () => {
          if (id === decrypted.uniqueId) {
            // We can't delete httpOnly cookies from client.
            // We must call an endpoint to expire it.
            fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
              router.refresh(); // Refresh to update server components
              show('Your access to private collection expired!', {
                status: 'info',
                autoClose: false,
              });
            });
          }
        },
        1 * 60 * 60 * 1000,
      ); // 1 hour

      return () => {
        clearInterval(CheckInterval);
        clearTimeout(timer);
      };
    }
  }, [decrypted, isPrivate, router, show, id]);
};
