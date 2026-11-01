'use client';

import { LocaleDialog } from '@/components/layout/locale-dialog';
import useSearchStore from '@/store/search/search.store';
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
  const setIsMobileSearchOpen = useSearchStore(
    (state) => state.setIsMobileSearchOpen,
  );
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
          'fixed top-0 right-0 left-0 z-50 border-b border-[#EDEDED] bg-white/90 backdrop-blur-xl',
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
                  'justify-between gap-2 border-[#E3E1EA] text-[#5F5C6E] motion-safe:transition-all',
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
              className="hidden rounded-full px-4 py-2 text-sm font-semibold text-[#2B2B2B] transition-colors hover:bg-[#F4F4F5] hover:text-[#0A0A0A] lg:inline-flex"
            >
              {partnerLabel}
            </Link>
            {showSearchBar ? (
              <button
                type="button"
                aria-label="Abrir busca"
                onClick={() => setIsMobileSearchOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#2B2B2B] transition-colors hover:bg-[#e8e7f1] md:hidden"
              >
                <Search className="h-5 w-5" />
              </button>
            ) : null}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                aria-expanded={isMenuOpen}
                aria-label="Abrir menu da conta"
                onClick={toggleMenu}
                className="flex items-center rounded-full bg-white transition-shadow active:scale-[0.98] md:gap-3 md:border md:border-[#EDEDED] md:py-1.5 md:pr-2 md:pl-3 md:hover:shadow-md"
              >
                <Menu className="hidden h-5 w-5 text-[#2B2B2B] md:block" />
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A0A0A] text-xs font-semibold text-white md:h-8 md:w-8">
                  {isLoggedIn && initials ? (
                    initials
                  ) : (
                    <UserRound className="h-4 w-4 md:h-[18px] md:w-[18px]" />
                  )}
                </span>
              </button>
              {isMenuOpen && (
                <div className="absolute top-12 right-0 z-50 w-64 rounded-2xl border border-[#EDEDED] bg-white p-2 shadow-xl md:top-14">
                  <button
                    type="button"
                    onClick={handleAuth}
                    className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#0A0A0A] hover:bg-[#F4F4F5]"
                  >
                    {isLoggedIn ? 'Meu perfil' : 'Entrar ou registrar-se'}
                  </button>
                  <Link
                    href="/booking"
                    onClick={closeMenu}
                    className="block rounded-xl px-3 py-2.5 text-sm text-[#2B2B2B] hover:bg-[#F4F4F5]"
                  >
                    Explorar serviços
                  </Link>
                  <Link
                    href={partnerHref}
                    onClick={closeMenu}
                    className="block rounded-xl px-3 py-2.5 text-sm text-[#2B2B2B] hover:bg-[#F4F4F5] lg:hidden"
                  >
                    {partnerLabel}
                  </Link>
                  <button
                    type="button"
                    onClick={handleOpenLocale}
                    className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-[#2B2B2B] hover:bg-[#F4F4F5]"
                  >
                    Idioma e moeda
                  </button>
                  <Link
                    href="/help"
                    onClick={closeMenu}
                    className="block rounded-xl px-3 py-2.5 text-sm text-[#2B2B2B] hover:bg-[#F4F4F5]"
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
