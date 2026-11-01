'use client';

import { createContext, PropsWithChildren, useContext } from 'react';

const UserIdentificationContext = createContext<string | undefined>(undefined);

/**
 * Exposes the `user_identification` cookie read by the server layout, since
 * js-cookie cannot see cookies during SSR. It lives in context rather than a
 * store because a module-level store would be shared across requests.
 */
export function UserIdentificationProvider({
  value,
  children,
}: PropsWithChildren<{ value?: string }>) {
  return (
    <UserIdentificationContext.Provider value={value}>
      {children}
    </UserIdentificationContext.Provider>
  );
}

export const useServerUserIdentification = () =>
  useContext(UserIdentificationContext);
