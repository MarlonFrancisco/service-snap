import type { RefObject } from 'react';

export type TAdminStoreDetailsConfig = {
  storeId: string | null;
  headingRef: RefObject<HTMLHeadingElement | null>;
};
