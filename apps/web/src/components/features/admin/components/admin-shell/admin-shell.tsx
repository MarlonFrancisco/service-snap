'use client';

import { cn } from '@repo/ui';
import Link from 'next/link';
import { PARTNER_SHELL_CLASS } from '../../../partner/partner.styles';
import { useAdminShell } from './admin-shell.hook';
import type { TAdminShellConfig } from './admin-shell.types';

const NAV_LINK_CLASS =
  'flex min-h-11 shrink-0 items-center rounded-[12px] px-3 text-sm font-semibold whitespace-nowrap text-[#C9C6D3] transition-colors hover:bg-[#24222C] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

/** Casco do painel da plataforma: menu escuro à esquerda (no alto no celular). */
export const AdminShell = ({ children }: TAdminShellConfig) => {
  const { navItems } = useAdminShell();

  return (
    <div
      className={cn(
        PARTNER_SHELL_CLASS,
        'flex min-h-dvh flex-col bg-[#F4F3F7] md:flex-row',
      )}
    >
      <nav
        aria-label="Painel da plataforma"
        className="flex shrink-0 flex-col gap-1 bg-[#0B0B0F] px-3.5 py-4 text-white md:w-60 md:py-5"
      >
        <Link
          href="/admin"
          className="mb-2 flex min-h-11 items-center px-3 text-lg font-bold tracking-[-0.02em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:mb-3"
        >
          ServiceSnap Admin
        </Link>
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 md:mx-0 md:flex-col md:overflow-visible md:px-0">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.isActive ? 'page' : undefined}
              className={cn(
                NAV_LINK_CLASS,
                item.isActive && 'bg-[#24222C] text-white',
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <Link href="/" className={cn(NAV_LINK_CLASS, 'mt-auto hidden md:flex')}>
          Voltar ao site
        </Link>
      </nav>

      <main className="min-w-0 flex-1 px-4 py-6 md:p-8">{children}</main>
    </div>
  );
};
