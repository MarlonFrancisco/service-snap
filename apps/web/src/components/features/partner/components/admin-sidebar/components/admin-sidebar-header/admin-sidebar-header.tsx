'use client';

import { HeaderLogo } from '@/components/layout/header/components/header-logo';
import { cn } from '@repo/ui';
import { X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  PARTNER_FOCUS_CLASS,
  PARTNER_ICON_BUTTON_CLASS,
} from '../../../../partner.styles';

type TAdminSidebarHeaderConfig = {
  isCollapsed: boolean;
  onClose?: () => void;
  onNavigate: () => void;
};

/** Só a logo, que leva para a página inicial; no menu do celular, o × fecha. */
export const AdminSidebarHeader = ({
  isCollapsed,
  onClose,
  onNavigate,
}: TAdminSidebarHeaderConfig) => (
  <div className="flex items-center justify-between gap-2">
    {isCollapsed ? (
      <Link
        href="/"
        aria-label="Página inicial"
        onClick={onNavigate}
        className={cn(
          'grid min-h-11 flex-1 place-items-center rounded-[14px]',
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
          'inline-flex min-h-11 items-center px-3 leading-none',
          PARTNER_FOCUS_CLASS,
        )}
      />
    )}

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
);
