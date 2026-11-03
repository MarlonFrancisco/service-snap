'use client';

import { HeaderLogo } from '@/components/layout/header/components/header-logo';
import { cn, Sheet, SheetContent, SheetTitle } from '@repo/ui';
import { Menu, PanelLeft } from 'lucide-react';
import { AdminSidebar } from './components/admin-sidebar';
import { OnboardingChecklist } from './components/onboarding-checklist';
import { StoreSelector } from './components/store-selector';
import { usePartner } from './partner.hook';
import {
  PARTNER_FOCUS_CLASS,
  PARTNER_ICON_BUTTON_CLASS,
  PARTNER_PAGE_TITLE_CLASS,
  PARTNER_PORTAL_CLASS,
  PARTNER_SHELL_CLASS,
} from './partner.styles';
import type { TPartnerConfig } from './partner.types';

export const Partner = ({ children }: TPartnerConfig) => {
  const {
    currentModule,
    showStoreSelector,
    isDrawerOpen,
    isSidebarCollapsed,
    setIsDrawerOpen,
    handleOpenDrawer,
    handleCloseDrawer,
    handleToggleSidebar,
  } = usePartner();

  const toggleSidebarLabel = isSidebarCollapsed
    ? 'Expandir menu'
    : 'Recolher menu';

  return (
    // Abaixo de lg o documento rola: no iOS o dvh não acompanha a barra do navegador
    <div
      className={cn(
        PARTNER_SHELL_CLASS,
        'flex min-h-dvh w-full lg:h-dvh lg:overflow-hidden',
      )}
    >
      <AdminSidebar isCollapsed={isSidebarCollapsed} className="hidden lg:flex" />

      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          aria-describedby={undefined}
          className={cn(
            PARTNER_PORTAL_CLASS,
            'w-[264px] max-w-[85vw] gap-0 p-0 sm:max-w-[85vw] lg:hidden',
          )}
        >
          <SheetTitle className="sr-only">Navegação do painel</SheetTitle>
          <AdminSidebar
            className="w-full border-r-0"
            onNavigate={handleCloseDrawer}
            onClose={handleCloseDrawer}
          />
        </SheetContent>
      </Sheet>

      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#EBE9F0] bg-white px-5 md:hidden">
          <HeaderLogo
            width={148}
            height={37}
            aria-label="Página inicial"
            className={cn(
              'inline-flex min-h-11 items-center leading-none',
              PARTNER_FOCUS_CLASS,
            )}
          />
          <button
            type="button"
            aria-label="Abrir menu"
            aria-haspopup="dialog"
            aria-expanded={isDrawerOpen}
            onClick={handleOpenDrawer}
            className={PARTNER_ICON_BUTTON_CLASS}
          >
            <Menu className="size-[18px]" aria-hidden="true" />
          </button>
        </header>

        <header className="hidden min-h-[72px] shrink-0 items-center justify-between gap-4 border-b border-[#EBE9F0] bg-white px-8 md:flex">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              aria-label="Abrir menu"
              aria-haspopup="dialog"
              aria-expanded={isDrawerOpen}
              onClick={handleOpenDrawer}
              className={cn(PARTNER_ICON_BUTTON_CLASS, 'lg:hidden')}
            >
              <Menu className="size-[18px]" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={toggleSidebarLabel}
              aria-expanded={!isSidebarCollapsed}
              title={`${toggleSidebarLabel} (Ctrl/Cmd+B)`}
              onClick={handleToggleSidebar}
              className={cn(PARTNER_ICON_BUTTON_CLASS, 'hidden lg:grid')}
            >
              <PanelLeft className="size-[18px]" aria-hidden="true" />
            </button>
            <h1 className={PARTNER_PAGE_TITLE_CLASS}>{currentModule.title}</h1>
          </div>

          {showStoreSelector && <StoreSelector />}
        </header>

        <main className="flex-1 pb-[env(safe-area-inset-bottom,0px)] lg:min-h-0 lg:overflow-y-auto lg:pb-0">
          <div className="grid gap-3.5 px-5 pt-5 md:hidden">
            <h1 className={PARTNER_PAGE_TITLE_CLASS}>{currentModule.title}</h1>
            {showStoreSelector && <StoreSelector layout="block" />}
          </div>

          <div className="px-5 pt-3.5 pb-5 md:px-8 md:pt-7 md:pb-12">
            <OnboardingChecklist />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
