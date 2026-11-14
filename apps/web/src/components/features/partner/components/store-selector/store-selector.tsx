'use client';

import { cn, Popover, PopoverContent, PopoverTrigger } from '@repo/ui';
import { Check, ChevronDown } from 'lucide-react';
import {
  PARTNER_FOCUS_CLASS,
  PARTNER_MUTED_TEXT_CLASS,
  PARTNER_PORTAL_CLASS,
} from '../../partner.styles';
import { useStoreSelector } from './store-selector.hook';

const ROLE_BADGE_CLASS =
  'mt-0.5 inline-block shrink-0 rounded-full border border-[#E3E1EA] bg-white px-[9px] py-px text-xs font-bold text-[#0B0B0F]';

type TStoreSelectorConfig = {
  layout?: 'inline' | 'block';
};

export const StoreSelector = ({ layout = 'inline' }: TStoreSelectorConfig) => {
  const {
    stores,
    activeStore,
    activeRoleLabel,
    getRoleLabel,
    isOpen,
    setIsOpen,
    handleSelectStore,
  } = useStoreSelector();
  const isBlock = layout === 'block';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Trocar de loja. Loja atual: ${activeStore.name}${activeRoleLabel ? `, papel ${activeRoleLabel}` : ''}`}
          className={cn(
            'flex items-center justify-between gap-3 rounded-full border border-[#E3E1EA] bg-white px-[18px] py-1.5 text-left font-semibold text-[#0B0B0F] transition-colors hover:bg-[#F7F6FA]',
            isBlock
              ? 'min-h-[52px] w-full text-sm'
              : 'min-h-12 max-w-[280px] min-w-0 text-[13px]',
            PARTNER_FOCUS_CLASS,
          )}
        >
          <span className="min-w-0">
            <span className="block truncate">{activeStore.name}</span>
            {activeRoleLabel && (
              <span className={ROLE_BADGE_CLASS}>{activeRoleLabel}</span>
            )}
            {!isBlock && !activeRoleLabel && (
              <span
                className={cn(
                  'block truncate text-xs font-medium',
                  PARTNER_MUTED_TEXT_CLASS,
                )}
              >
                {activeStore.address}
              </span>
            )}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'size-4 shrink-0 transition-transform',
              PARTNER_MUTED_TEXT_CLASS,
              isOpen && 'rotate-180',
            )}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align={isBlock ? 'start' : 'end'}
        sideOffset={8}
        className={cn(
          PARTNER_PORTAL_CLASS,
          'max-h-[60vh] w-[min(20rem,calc(100vw-2.5rem))] overflow-y-auto rounded-[22px] border-[#E3E1EA] bg-white p-2',
        )}
      >
        <p
          className={cn(
            'px-3 py-2 text-xs font-semibold',
            PARTNER_MUTED_TEXT_CLASS,
          )}
        >
          Selecionar loja
        </p>
        <ul className="grid gap-0.5">
          {stores.map((store) => {
            const isActive = activeStore.id === store.id;

            return (
              <li key={store.id}>
                <button
                  type="button"
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => handleSelectStore(store)}
                  className={cn(
                    'flex min-h-11 w-full items-center gap-3 rounded-[14px] px-3 py-2 text-left transition-colors',
                    isActive ? 'bg-[#F4F3F7]' : 'hover:bg-[#F7F6FA]',
                    PARTNER_FOCUS_CLASS,
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="block truncate text-[13px] font-semibold">
                        {store.name}
                      </span>
                      {getRoleLabel(store) && (
                        <span className={ROLE_BADGE_CLASS}>
                          {getRoleLabel(store)}
                        </span>
                      )}
                    </span>
                    <span
                      className={cn(
                        'block truncate text-xs font-medium',
                        PARTNER_MUTED_TEXT_CLASS,
                      )}
                    >
                      {store.address}
                    </span>
                  </span>
                  {isActive && (
                    <Check className="size-4 shrink-0" aria-hidden="true" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
};
