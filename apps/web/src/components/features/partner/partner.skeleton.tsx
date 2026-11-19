'use client';

import { HeaderLogo } from '@/components/layout/header/components/header-logo';
import { getPartnerModuleConfig } from '@/utils/constants/partner.constants';
import { cn, Skeleton } from '@repo/ui';
import { usePathname } from 'next/navigation';
import {
  PARTNER_PAGE_TITLE_CLASS,
  PARTNER_SHELL_CLASS,
  PARTNER_SOFT_SURFACE_CLASS,
} from './partner.styles';

/** Larguras dos rótulos do menu, na ordem dos itens do painel. */
const NAV_LABEL_WIDTHS = [
  'w-12',
  'w-16',
  'w-16',
  'w-16',
  'w-[72px]',
  'w-12',
  'w-16',
  'w-[84px]',
  'w-24',
  'w-12',
  'w-[88px]',
];

type TPartnerContentVariant = 'agenda' | 'dashboard' | 'list';

const getContentVariant = (pathname: string): TPartnerContentVariant => {
  if (pathname.startsWith('/partner/agenda')) return 'agenda';
  if (pathname === '/partner' || pathname.startsWith('/partner/dashboard')) {
    return 'dashboard';
  }
  return 'list';
};

/**
 * Casco do painel enquanto o servidor confere plano e lojas: mesmo menu,
 * mesmo cabeçalho com o título da página e o conteúdo no formato do módulo.
 */
export const PartnerSkeleton = () => {
  const pathname = usePathname();
  const currentModule = getPartnerModuleConfig(pathname);
  const variant = getContentVariant(pathname);

  return (
    <div
      role="status"
      aria-busy="true"
      className={cn(
        PARTNER_SHELL_CLASS,
        'flex min-h-dvh w-full lg:h-dvh lg:overflow-hidden',
      )}
    >
      <span className="sr-only">Carregando o painel</span>

      <aside
        inert
        className="hidden h-full w-[264px] flex-none flex-col gap-3 overflow-hidden border-r border-line bg-white px-3.5 py-5 lg:flex"
      >
        <HeaderLogo
          width={148}
          height={37}
          className="inline-flex min-h-11 items-center px-3 leading-none"
        />
        <ul className="grid gap-0.5">
          {NAV_LABEL_WIDTHS.map((width, index) => (
            <li key={index} className="flex min-h-11 items-center gap-2.5 px-3">
              <Skeleton className="size-[18px] shrink-0 rounded-md" />
              <Skeleton className={cn('h-3.5', width)} />
            </li>
          ))}
        </ul>
        <div className={cn(PARTNER_SOFT_SURFACE_CLASS, 'mt-auto shrink-0 p-4')}>
          <Skeleton className="h-4 w-24 bg-line-strong" />
          <Skeleton className="mt-1.5 h-3.5 w-20 bg-line-strong" />
          <Skeleton className="mt-3 h-11 w-full rounded-full bg-line-strong" />
        </div>
      </aside>

      <div aria-hidden="true" className="relative flex min-w-0 flex-1 flex-col">
        <header
          inert
          className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-white px-5 md:hidden"
        >
          <HeaderLogo
            width={148}
            height={37}
            className="inline-flex min-h-11 items-center leading-none"
          />
          <Skeleton className="size-11 rounded-full" />
        </header>

        <header className="hidden min-h-[72px] shrink-0 items-center justify-between gap-4 border-b border-line bg-white px-8 md:flex">
          <div className="flex min-w-0 items-center gap-2">
            <Skeleton className="size-11 shrink-0 rounded-full" />
            <p className={PARTNER_PAGE_TITLE_CLASS}>{currentModule.title}</p>
          </div>
          {currentModule.showStoreSelector && (
            <Skeleton className="h-11 w-52 rounded-full" />
          )}
        </header>

        <main className="flex-1 lg:min-h-0 lg:overflow-hidden">
          <div className="grid gap-3.5 px-5 pt-5 md:hidden">
            <p className={PARTNER_PAGE_TITLE_CLASS}>{currentModule.title}</p>
            {currentModule.showStoreSelector && (
              <Skeleton className="h-11 w-full rounded-full" />
            )}
          </div>

          <div className="px-5 pt-3.5 pb-5 md:px-8 md:pt-7 md:pb-12">
            {variant === 'agenda' && <AgendaContentSkeleton />}
            {variant === 'dashboard' && <DashboardContentSkeleton />}
            {variant === 'list' && <ListContentSkeleton />}
          </div>
        </main>
      </div>
    </div>
  );
};

function DashboardContentSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className={cn(PARTNER_SOFT_SURFACE_CLASS, 'p-5')}>
            <Skeleton className="h-3.5 w-20 bg-line-strong" />
            <Skeleton className="mt-3 h-7 w-24 bg-line-strong" />
            <Skeleton className="mt-2 h-3 w-16 bg-line-strong" />
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[22px] border border-line p-5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-5 h-56 w-full rounded-2xl" />
        </div>
        <div className="rounded-[22px] border border-line p-5">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="mt-4 flex items-center gap-3">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function AgendaContentSkeleton() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="size-11 rounded-full" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="size-11 rounded-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-11 w-24 rounded-full" />
          <Skeleton className="h-11 w-32 rounded-full" />
        </div>
      </div>
      <div className="mt-5 overflow-hidden rounded-[22px] border border-line">
        <div className="grid grid-cols-[56px_repeat(3,minmax(0,1fr))] border-b border-line md:grid-cols-[64px_repeat(7,minmax(0,1fr))]">
          <span />
          {Array.from({ length: 7 }, (_, index) => (
            <div
              key={index}
              className={cn(
                'flex flex-col items-center gap-1.5 py-3',
                index > 2 && 'hidden md:flex',
              )}
            >
              <Skeleton className="h-3 w-8" />
              <Skeleton className="size-8 rounded-full" />
            </div>
          ))}
        </div>
        {Array.from({ length: 6 }, (_, row) => (
          <div
            key={row}
            className="grid h-16 grid-cols-[56px_repeat(3,minmax(0,1fr))] border-b border-line last:border-b-0 md:grid-cols-[64px_repeat(7,minmax(0,1fr))]"
          >
            <div className="flex justify-center pt-2">
              <Skeleton className="h-3 w-9" />
            </div>
            {Array.from({ length: 7 }, (_, column) => (
              <div
                key={column}
                className={cn(
                  'border-l border-line p-1',
                  column > 2 && 'hidden md:block',
                )}
              >
                {(row + column) % 3 === 0 && (
                  <Skeleton className="h-full w-full rounded-xl" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

function ListContentSkeleton() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-11 w-full rounded-full sm:w-72" />
        <Skeleton className="h-11 w-36 rounded-full" />
      </div>
      <div className="mt-5 rounded-[22px] border border-line">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-3.5 border-b border-line px-5 py-4 last:border-b-0"
          >
            <Skeleton className="size-11 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-48 max-w-full" />
              <Skeleton className="h-3.5 w-32" />
            </div>
            <Skeleton className="hidden h-4 w-20 sm:block" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </>
  );
}
