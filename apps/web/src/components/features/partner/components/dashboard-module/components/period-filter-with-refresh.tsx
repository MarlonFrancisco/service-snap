'use client';

import {
  PARTNER_FOCUS_CLASS,
  PARTNER_ICON_BUTTON_CLASS,
} from '@/components/features/partner/partner.styles';
import { cn } from '@repo/ui';
import { RefreshCw } from 'lucide-react';
import type { TPeriodFilterConfig } from '../dashboard-module.types';
import { PERIOD_OPTIONS } from '../utils/metrics.constants';

export const PeriodFilterWithRefresh = ({
  value,
  onValueChange,
  onRefresh,
  isRefreshing = false,
}: TPeriodFilterConfig) => (
  <div className="flex w-full items-center gap-2 md:w-auto">
    <div
      role="group"
      aria-label="Período"
      className="flex min-w-0 flex-1 gap-1 rounded-full border border-[#E3E1EA] p-1 md:flex-initial"
    >
      {PERIOD_OPTIONS.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onValueChange(option.value)}
            className={cn(
              'h-10 min-w-0 flex-1 rounded-full px-2 text-[13px] font-bold transition-colors md:flex-initial md:px-4',
              isActive
                ? 'bg-[#0B0B0F] text-white'
                : 'text-[#0B0B0F] hover:bg-[#F7F6FA]',
              PARTNER_FOCUS_CLASS,
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>

    {onRefresh && (
      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing}
        aria-label="Atualizar dados"
        className={cn(
          PARTNER_ICON_BUTTON_CLASS,
          'disabled:cursor-not-allowed disabled:opacity-60',
        )}
      >
        <RefreshCw
          aria-hidden="true"
          className={cn(
            'size-4',
            isRefreshing && 'motion-safe:animate-spin',
          )}
        />
      </button>
    )}
  </div>
);
