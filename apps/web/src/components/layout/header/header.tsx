'use client';

import { cn } from '@repo/ui/index';
import { MarketplaceHeader } from './components/marketplace-header';
import { HEADER_OFFSET_CLASS } from './header.constants';
import type { THeaderConfig } from './header.types';

export const Header = ({
  showSearchBar = false,
  hideMobileSearchIcon = false,
  children,
  className,
  ...props
}: THeaderConfig) => {
  return (
    <div
      className={cn(
        'min-h-screen bg-[#FAFAFA] font-[family-name:var(--font-mona-sans)] text-[#0A0A0A] antialiased',
        className,
      )}
      {...props}
    >
      <MarketplaceHeader
        showSearchBar={showSearchBar}
        hideMobileSearchIcon={hideMobileSearchIcon}
      />

      <div className={cn('min-h-screen', HEADER_OFFSET_CLASS)}>{children}</div>
    </div>
  );
};
