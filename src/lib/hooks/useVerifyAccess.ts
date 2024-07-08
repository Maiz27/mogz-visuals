import { useState } from 'react';
import { VERIFY_ACCESS_RESPONSE_BODY } from '../types';

const useVerifyAccess = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<VERIFY_ACCESS_RESPONSE_BODY | null>(
    null
  );

  const handleVerifyAccess = async (state: {
    id: string;
    password: string;
  }) => {
    setLoading(true);
    const lowercaseId = state.id.toLowerCase();
    state.id = lowercaseId;

    const response = await fetch('/api/verifyAccess', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(state),
    });

    const body: VERIFY_ACCESS_RESPONSE_BODY = await response.json();

    setResponse(body);
    setLoading(false);
    return body;
  };

  return {
    response,
    loading,
    handleVerifyAccess,
  };
};

export default useVerifyAccess;
