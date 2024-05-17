'use client';
import { createContext, useState, useEffect, useContext } from 'react';

const IsClientCtx = createContext(false);

type props = {
  children: any;
};
export const IsClientCtxProvider = ({ children }: props) => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  return (
    <IsClientCtx.Provider value={isClient}>{children}</IsClientCtx.Provider>
  );
};

export function useIsClient() {
  return useContext(IsClientCtx);
}
