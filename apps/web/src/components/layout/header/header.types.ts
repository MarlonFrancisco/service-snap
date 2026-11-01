import type { HTMLAttributes, PropsWithChildren } from 'react';

export type THeaderConfig = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    showSearchBar?: boolean;
    /** Para páginas com busca própria no mobile. */
    hideMobileSearchIcon?: boolean;
  }
>;
