'use client';

import { LocaleDialog } from '@/components/layout/locale-dialog';
import { plusJakartaSans } from '@/utils/fonts/plus-jakarta-sans';
import { cn } from '@repo/ui';
import { Menu, Search, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import {
  HEADER_SEARCH_FIELD_CLASS,
  HEADER_SEARCH_ICON_CLASS,
  HEADER_SEARCH_SLOT_CLASS,
} from '../../header.constants';
import { HeaderLogo } from '../header-logo';
import { SearchBar } from '../search-bar/search-bar';
import {
  useCompactSearch,
  useMarketplaceHeader,
} from './marketplace-header.hook';

type TMarketplaceHeaderConfig = {
  showSearchBar?: boolean;
  /** Atalho para a busca da própria página, visível quando ela sai da tela. */
  compactSearch?: boolean;
};

export const MarketplaceHeader = ({
  showSearchBar = false,
  compactSearch = false,
}: TMarketplaceHeaderConfig = {}) => {
  const [isLocaleOpen, setIsLocaleOpen] = useState(false);
  const {
    menuRef,
    isMenuOpen,
    initials,
    isLoggedIn,
    partnerHref,
    partnerLabel,
    toggleMenu,
    closeMenu,
    handleAuth,
    handleHeaderPartnerClick,
    handleMenuPartnerClick,
  } = useMarketplaceHeader();
  const { isCompactSearchVisible, focusDiscoverySearch } =
    useCompactSearch(compactSearch);

  const handleOpenLocale = () => {
    closeMenu();
    setIsLocaleOpen(true);
  };

  return (
    <>
      <header
        className={cn(
          plusJakartaSans.className,
          'fixed top-0 right-0 left-0 z-50 border-b border-line bg-white/90 backdrop-blur-xl',
        )}
      >
        <div className="relative mx-auto flex h-16 w-full max-w-[82.5rem] items-center justify-between gap-3 px-5 md:h-20 md:gap-4 md:px-10">
          <div className="shrink-0">
            <HeaderLogo width={148} height={37} />
          </div>

          {compactSearch ? (
            <div className={HEADER_SEARCH_SLOT_CLASS}>
              <button
                type="button"
                aria-label="Abrir busca"
                tabIndex={isCompactSearchVisible ? undefined : -1}
                onClick={focusDiscoverySearch}
                className={cn(
                  HEADER_SEARCH_FIELD_CLASS,
                  'justify-between gap-2 border-line-strong text-ink-muted motion-safe:transition-all',
                  isCompactSearchVisible
                    ? 'visible scale-100 opacity-100'
                    : 'invisible scale-[0.92] opacity-0',
                )}
              >
                <span className="truncate">
                  Ex: ‘cabeleireiro com disponibilidade’
                </span>
                <span className={HEADER_SEARCH_ICON_CLASS}>
                  <Search className="h-4 w-4" strokeWidth={2.6} aria-hidden />
                </span>
              </button>
            </div>
          ) : null}

          {showSearchBar ? (
            <div className={HEADER_SEARCH_SLOT_CLASS}>
              <SearchBar />
            </div>
          ) : null}

          <div className="flex shrink-0 items-center gap-2 md:gap-3">
            <Link
              href={partnerHref}
              onClick={handleHeaderPartnerClick}
              className="hidden rounded-full px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-2 hover:text-ink lg:inline-flex"
            >
              {partnerLabel}
            </Link>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                aria-expanded={isMenuOpen}
                aria-label="Abrir menu da conta"
                onClick={toggleMenu}
                className="flex items-center rounded-full bg-white transition-shadow active:scale-[0.98] md:gap-3 md:border md:border-line md:py-1.5 md:pr-2 md:pl-3 md:hover:shadow-md"
              >
                <Menu className="hidden h-5 w-5 text-ink md:block" />
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white md:h-8 md:w-8">
                  {isLoggedIn && initials ? (
                    initials
                  ) : (
                    <UserRound className="h-4 w-4 md:h-[18px] md:w-[18px]" />
                  )}
                </span>
              </button>
              {isMenuOpen && (
                <div className="absolute top-12 right-0 z-50 w-64 rounded-2xl border border-line bg-white p-2 shadow-xl md:top-14">
                  <button
                    type="button"
                    onClick={handleAuth}
                    className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-ink hover:bg-surface-2"
                  >
                    {isLoggedIn ? 'Meu perfil' : 'Entrar ou registrar-se'}
                  </button>
                  <Link
                    href="/booking"
                    onClick={closeMenu}
                    className="block rounded-xl px-3 py-2.5 text-sm text-ink hover:bg-surface-2"
                  >
                    Explorar serviços
                  </Link>
                  <Link
                    href={partnerHref}
                    onClick={handleMenuPartnerClick}
                    className="block rounded-xl px-3 py-2.5 text-sm text-ink hover:bg-surface-2 lg:hidden"
                  >
                    {partnerLabel}
                  </Link>
                  <button
                    type="button"
                    onClick={handleOpenLocale}
                    className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-ink hover:bg-surface-2"
                  >
                    Idioma e moeda
                  </button>
                  <Link
                    href="/help"
                    onClick={closeMenu}
                    className="block rounded-xl px-3 py-2.5 text-sm text-ink hover:bg-surface-2"
                  >
                    Central de ajuda
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <LocaleDialog open={isLocaleOpen} onOpenChange={setIsLocaleOpen} />
      </header>
    </>
  );
};
