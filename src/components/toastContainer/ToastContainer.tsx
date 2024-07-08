'use client';
import { useToast } from '@/lib/context/ToastContext';
import Toast from '../ui/Toast';

const ToastContainer = () => {
  const { showToast, message, options, close } = useToast();
  const { status, autoClose, onClose } = options;

  const handleClose = () => {
    close();
    onClose && onClose();
  };

  return (
    <>
      {showToast && (
        <Toast
          show={showToast}
          message={message}
          onClose={handleClose}
          status={status!}
          autoClose={autoClose!}
        />
      )}
    </>
  );
};

export default ToastContainer;
