'use client';

import { LocaleDialog } from '@/components/layout/locale-dialog';
import useSearchStore from '@/store/search/search.store';
import { Globe, Menu, Search, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { CategoryRail } from '../category-rail';
import { HeaderLogo } from '../header-logo';
import { SearchBar } from '../search-bar/search-bar';
import { useMarketplaceHeader } from './marketplace-header.hook';

type TMarketplaceHeaderConfig = {
  showCategories?: boolean;
  showSearchBar?: boolean;
};

export const MarketplaceHeader = ({
  showCategories = true,
  showSearchBar = false,
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

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-[#EDEDED] bg-white/90 backdrop-blur-xl">
        <div className="flex h-16 w-full items-center justify-between gap-3 px-4 sm:px-6 md:h-20 md:gap-4 lg:px-12">
          <div className="shrink-0">
            <HeaderLogo width={148} height={37} />
          </div>

          {showSearchBar ? (
            <div className="mx-auto hidden min-w-0 w-full max-w-xl flex-1 px-4 md:block lg:max-w-2xl">
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
            <button
              type="button"
              aria-label="Idioma e moeda"
              onClick={() => setIsLocaleOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#2B2B2B] transition-colors hover:bg-[#e8e7f1] md:h-10 md:w-10"
            >
              <Globe className="h-5 w-5" />
            </button>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                aria-expanded={isMenuOpen}
                aria-label="Abrir menu da conta"
                onClick={toggleMenu}
                className="flex items-center gap-2 rounded-full border border-[#EDEDED] bg-white py-1 pr-1.5 pl-2.5 transition-shadow active:scale-[0.98] md:gap-3 md:py-1.5 md:pr-2 md:pl-3 md:hover:shadow-md"
              >
                <Menu className="h-5 w-5 text-[#2B2B2B]" />
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0A0A0A] text-xs font-semibold text-white md:h-8 md:w-8">
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

        {showCategories ? <CategoryRail /> : null}

        <LocaleDialog open={isLocaleOpen} onOpenChange={setIsLocaleOpen} />
      </header>
    </>
  );
};
