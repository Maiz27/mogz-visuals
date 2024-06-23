import { useEffect, useState } from 'react';
import { useIsClient } from '../context/IsClientContext';
import { useToast } from '../context/ToastContext';

const useShareURL = () => {
  const isClient = useIsClient();
  const { show } = useToast();
  const [currentURL, setCurrentURL] = useState(
    isClient ? window.location.href : ''
  );

  useEffect(() => {
    if (isClient) {
      setCurrentURL(window.location.href);
    }
  }, [isClient]);

  const copyToClipboard = () => {
    const notifySuccess = () =>
      show('Collection link Copied Successfully to Clipboard!', {
        status: 'success',
      });
    const notifyFailure = () =>
      show('Failed to copy collection link to clipboard!', {
        status: 'error',
        autoClose: false,
      });

    navigator.clipboard
      .writeText(currentURL)
      .then(() => {
        console.log('URL copied to clipboard:', currentURL);
        notifySuccess();
      })
      .catch((error) => {
        console.error('Error copying to clipboard:', error);
        notifyFailure();
      });
  };

  return {
    currentURL,
    copyToClipboard,
  };
};

export default useShareURL;
