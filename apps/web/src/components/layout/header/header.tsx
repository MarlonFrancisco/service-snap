'use client';

import { plusJakartaSans } from '@/utils/fonts/plus-jakarta-sans';
import { cn } from '@repo/ui/index';
import { MarketplaceHeader } from './components/marketplace-header';
import { HEADER_OFFSET_CLASS } from './header.constants';
import type { THeaderConfig } from './header.types';

export const Header = ({
  showSearchBar = false,
  children,
  className,
  ...props
}: THeaderConfig) => {
  return (
    <div
      className={cn(
        plusJakartaSans.className,
        'min-h-screen bg-white text-[#0B0B0F] antialiased',
        className,
      )}
      {...props}
    >
      <MarketplaceHeader showSearchBar={showSearchBar} />

      <div className={cn('min-h-screen', HEADER_OFFSET_CLASS)}>{children}</div>
    </div>
  );
};
