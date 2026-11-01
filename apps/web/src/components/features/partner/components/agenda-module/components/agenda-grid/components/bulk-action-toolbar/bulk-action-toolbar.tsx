import { PARTNER_FOCUS_CLASS } from '@/components/features/partner/partner.styles';
import { cn } from '@repo/ui';
import { X } from 'lucide-react';
import type { TBulkActionToolbarConfig } from './bulk-action-toolbar.types';

const ACTION_BUTTON_CLASS = cn(
  'inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white px-4 text-[13px] font-bold text-[#0B0B0F] transition-colors hover:bg-[#F4F3F7]',
  PARTNER_FOCUS_CLASS,
  'focus-visible:outline-white',
);

export const BulkActionToolbar = ({
  selectedCount,
  actionLabel,
  onBlock,
  onClear,
}: TBulkActionToolbarConfig) => {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky bottom-4 z-40 mx-auto mt-4 flex w-fit max-w-full flex-wrap items-center justify-between gap-3 rounded-[28px] bg-[#0B0B0F] py-2 pr-2 pl-5 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(15,12,30,0.2)]">
      <span role="status">
        {selectedCount}{' '}
        {selectedCount === 1 ? 'horário selecionado' : 'horários selecionados'}
      </span>

      <div className="flex gap-1.5">
        <button type="button" onClick={onBlock} className={ACTION_BUTTON_CLASS}>
          {actionLabel}
        </button>
        <button
          type="button"
          onClick={onClear}
          aria-label="Limpar seleção"
          className={cn(ACTION_BUTTON_CLASS, 'px-0')}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
