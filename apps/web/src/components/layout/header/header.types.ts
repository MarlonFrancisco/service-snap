import type { HTMLAttributes, PropsWithChildren } from 'react';

export type THeaderConfig = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    showSearchBar?: boolean;
  }
>;
