'use client';

import { HeaderLogo } from '@/components/layout/header/components/header-logo';
import { LocaleDialog } from '@/components/layout/locale-dialog';
import { Globe, Menu, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useMarketplaceHeader } from './marketplace-header.hook';

export const MarketplaceHeader = () => {
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
  } = useMarketplaceHeader();

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-[#EDEDED] bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full items-center justify-between gap-4 px-4 sm:px-6">
        <HeaderLogo />

        <div className="flex shrink-0 items-center gap-3">
          <Link
            href={partnerHref}
            className="hidden rounded-full px-4 py-2 text-sm font-semibold text-[#2B2B2B] transition-colors hover:bg-[#F4F4F5] hover:text-[#0A0A0A] lg:inline-flex"
          >
            {partnerLabel}
          </Link>
          <button
            type="button"
            aria-label="Idioma e moeda"
            onClick={() => setIsLocaleOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#2B2B2B] transition-colors hover:bg-[#e8e7f1]"
          >
            <Globe className="h-5 w-5" />
          </button>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-expanded={isMenuOpen}
              aria-label="Abrir menu da conta"
              onClick={toggleMenu}
              className="flex items-center gap-3 rounded-full border border-[#EDEDED] bg-white py-1.5 pr-2 pl-3 transition-shadow hover:shadow-md"
            >
              <Menu className="h-5 w-5 text-[#2B2B2B]" />
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A0A0A] text-xs font-semibold text-white">
                {isLoggedIn && initials ? initials : <UserRound className="h-[18px] w-[18px]" />}
              </span>
            </button>
            {isMenuOpen && (
              <div className="absolute top-14 right-0 w-64 rounded-2xl border border-[#EDEDED] bg-white p-2 shadow-xl">
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
      <LocaleDialog open={isLocaleOpen} onOpenChange={setIsLocaleOpen} />
    </header>
  );
};
