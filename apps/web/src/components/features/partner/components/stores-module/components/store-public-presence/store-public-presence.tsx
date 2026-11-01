'use client';

import {
  PARTNER_FOCUS_CLASS,
  PARTNER_MUTED_TEXT_CLASS,
} from '@/components/features/partner/partner.styles';
import { cn } from '@repo/ui';
import { Instagram } from 'lucide-react';
import { STORES_COMPACT_BUTTON_CLASS } from '../../stores-module.styles';
import { useStorePublicPresence } from './store-public-presence.hook';
import type { TStorePublicPresenceConfig } from './store-public-presence.types';

export const StorePublicPresence = (config: TStorePublicPresenceConfig) => {
  const { instagramUrl, instagramHandle, publicUrl, handleCopyPublicUrl } =
    useStorePublicPresence(config);

  return (
    <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-2.5">
      {instagramUrl && instagramHandle ? (
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'inline-flex min-h-11 w-fit items-center gap-2 rounded-full text-sm font-semibold hover:underline',
            PARTNER_FOCUS_CLASS,
          )}
        >
          <Instagram aria-hidden="true" className="size-4" />
          {instagramHandle}
        </a>
      ) : (
        <p className={cn('text-[13px]', PARTNER_MUTED_TEXT_CLASS)}>
          Instagram ainda não informado no cadastro da loja.
        </p>
      )}

      <div
        className={cn(
          'flex items-center gap-2.5 rounded-[14px] bg-[#F7F6FA] py-2 pr-2 pl-4 text-[13px]',
          PARTNER_MUTED_TEXT_CLASS,
        )}
      >
        <span className="min-w-0 flex-1 truncate" title={publicUrl}>
          Link para o Google Perfil da Empresa: {publicUrl}
        </span>
        <button
          type="button"
          onClick={handleCopyPublicUrl}
          aria-label="Copiar link para o Google Perfil da Empresa"
          className={cn(STORES_COMPACT_BUTTON_CLASS, 'shrink-0')}
        >
          Copiar
        </button>
      </div>
    </div>
  );
};
