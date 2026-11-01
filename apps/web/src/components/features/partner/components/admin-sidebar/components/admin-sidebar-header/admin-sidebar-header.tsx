'use client';

import { HeaderLogo } from '@/components/layout/header/components/header-logo';
import { cn } from '@repo/ui';
import { ArrowLeft, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  PARTNER_FOCUS_CLASS,
  PARTNER_ICON_BUTTON_CLASS,
  PARTNER_NAV_ICON_CLASS,
  PARTNER_NAV_ITEM_CLASS,
  PARTNER_NAV_ITEM_IDLE_CLASS,
} from '../../../../partner.styles';

type TAdminSidebarHeaderConfig = {
  isCollapsed: boolean;
  onClose?: () => void;
  onNavigate: () => void;
};

export const AdminSidebarHeader = ({
  isCollapsed,
  onClose,
  onNavigate,
}: TAdminSidebarHeaderConfig) => (
  <div className="grid gap-0.5">
    <div className="flex items-center gap-2">
      <Link
        href="/"
        aria-label={isCollapsed ? 'Voltar' : undefined}
        title={isCollapsed ? 'Voltar' : undefined}
        onClick={onNavigate}
        className={cn(
          PARTNER_NAV_ITEM_CLASS,
          PARTNER_NAV_ITEM_IDLE_CLASS,
          isCollapsed && 'justify-center px-0',
        )}
      >
        <ArrowLeft className={PARTNER_NAV_ICON_CLASS} aria-hidden="true" />
        {!isCollapsed && 'Voltar'}
      </Link>
      {onClose && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={onClose}
          className={PARTNER_ICON_BUTTON_CLASS}
        >
          <X className="size-[18px]" aria-hidden="true" />
        </button>
      )}
    </div>

    {isCollapsed ? (
      <Link
        href="/"
        aria-label="Página inicial"
        onClick={onNavigate}
        className={cn(
          'grid min-h-11 place-items-center rounded-[14px]',
          PARTNER_FOCUS_CLASS,
        )}
      >
        <Image
          src="/app-icon.svg"
          alt=""
          width={32}
          height={32}
          className="size-8 rounded-lg"
          unoptimized
        />
      </Link>
    ) : (
      <HeaderLogo
        width={148}
        height={37}
        aria-label="Página inicial"
        onClick={onNavigate}
        className={cn(
          'inline-flex min-h-11 items-center justify-self-start px-3 leading-none',
          PARTNER_FOCUS_CLASS,
        )}
      />
    )}
  </div>
);
