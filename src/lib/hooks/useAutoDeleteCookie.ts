import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../context/ToastContext';

export const useAutoDeleteCookie = (slug: string, isPrivate: boolean) => {
  const [decryptedSlug, setDecryptedSlug] = useState<string | null>(null);
  const { show } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (isPrivate) {
      const func = async () => {
        const encryptedCookie = Cookies.get('collectionAccess');
        if (encryptedCookie) {
          const parsedCookie = JSON.parse(encryptedCookie);
          console.log('encrypted slug', parsedCookie.slug);
          const decryptedSlug = await getDecryptedSlug(parsedCookie.slug);

          setDecryptedSlug(decryptedSlug);
        }
      };
      // Decrypt the cookie and set the state
      func();
    }
  }, [isPrivate]);

  useEffect(() => {
    if (isPrivate && decryptedSlug) {
      const timer = setTimeout(() => {
        if (slug === decryptedSlug) {
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
        if (slug === decryptedSlug) {
          Cookies.remove('collectionAccess');
        }
      };
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [decryptedSlug, isPrivate, router, show, slug]);
};

const getDecryptedSlug = async (encryptedCookie: string) => {
  const response = await fetch('/api/decrypt-cookie', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ encryptedCookie }),
  });
  const { decryptedSlug } = await response.json();

  return decryptedSlug;
};
