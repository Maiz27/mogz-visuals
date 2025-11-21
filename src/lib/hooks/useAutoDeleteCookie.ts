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
      const func = async () => {
        const cookie = Cookies.get('collectionAccess');

        if (cookie) {
          const _decrypted = await decryptCookie(cookie);

          setDecrypted(_decrypted);
        }
      };
      // Decrypt the cookie and set the state
      func();
    }
  }, [isPrivate]);

  useEffect(() => {
    if (isPrivate && decrypted) {
      const timer = setTimeout(() => {
        if (id === decrypted.uniqueId) {
          Cookies.remove('collectionAccess');
          router.push('/gallery');
          show('Your access to private collection expired!', {
            status: 'info',
            autoClose: false,
          });
        }
      }, 1 * 60 * 60 * 1000); // 1 hour in milliseconds

      // Listen to the 'beforeunload' event to delete the cookie when the tab is closed
      const handleBeforeUnload = async () => {
        if (id === decrypted.uniqueId) {
          Cookies.remove('collectionAccess');
        }
      };
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [decrypted, isPrivate, router, show, id]);
};

export const decryptCookie = async (encryptedCookie: string) => {
  const response = await fetch('/api/decryptCookie', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ encryptedCookie }),
  });
  const { decryptedCookie } = await response.json();

  return JSON.parse(decryptedCookie);
};
