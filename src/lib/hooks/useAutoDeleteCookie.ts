import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useToast } from '../context/ToastContext';

export const useAutoDeleteCookie = (slug: string, isPrivate: boolean) => {
  const { show } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (isPrivate) {
      // Set a timer to delete the cookie after 1 hour
      const timer = setTimeout(() => {
        Cookies.remove(slug);
        router.push('/gallery');
        show('Your access to private collection expired!', {
          status: 'info',
          autoClose: false,
        });
      }, 60 * 60 * 1000); // 1 hour in milliseconds

      // Listen to the 'beforeunload' event to delete the cookie when the tab is closed
      const handleBeforeUnload = () => {
        Cookies.remove(slug);
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [slug, isPrivate, router, show]);
};
