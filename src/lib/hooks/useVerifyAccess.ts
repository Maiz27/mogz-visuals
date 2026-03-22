'use client';

import { useAccessStore } from '../stores/accessStore';

const useVerifyAccess = () => {
  const response = useAccessStore((state) => state.response);
  const loading = useAccessStore((state) => state.loading);
  const token = useAccessStore((state) => state.token);
  const setToken = useAccessStore((state) => state.setToken);
  const handleVerifyAccess = useAccessStore((state) => state.verifyAccess);
  const reset = useAccessStore((state) => state.reset);
  const clearResponse = useAccessStore((state) => state.clearResponse);

  return {
    response,
    loading,
    token,
    setToken,
    handleVerifyAccess,
    reset,
    clearResponse,
  };
};

export default useVerifyAccess;
