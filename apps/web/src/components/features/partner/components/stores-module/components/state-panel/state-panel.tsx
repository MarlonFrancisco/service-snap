import { PARTNER_MUTED_TEXT_CLASS } from '@/components/features/partner/partner.styles';
import { cn } from '@repo/ui';
import { STORES_COMPACT_PRIMARY_BUTTON_CLASS } from '../../stores-module.styles';
import type { TStatePanelConfig } from './state-panel.types';

export const StatePanel = ({
  icon: Icon,
  title,
  description,
  tone = 'neutral',
  actionLabel,
  isActionDisabled,
  onAction,
}: TStatePanelConfig) => {
  const isError = tone === 'error';

  return (
    <div
      role={isError ? 'alert' : undefined}
      className="flex min-h-[230px] flex-col items-center justify-center gap-2 rounded-[24px] border border-[#EBE9F0] p-6 text-center"
    >
      <span
        aria-hidden="true"
        className={cn(
          'grid size-12 place-items-center rounded-full',
          isError ? 'bg-[#FBE8E6] text-[#A4231A]' : 'bg-[#F4F3F7] text-[#0B0B0F]',
        )}
      >
        <Icon className="size-[22px] stroke-[1.8]" />
      </span>
      <p className="text-lg font-extrabold tracking-[-0.02em]">{title}</p>
      <p
        className={cn(
          'max-w-[340px] text-sm leading-normal',
          PARTNER_MUTED_TEXT_CLASS,
        )}
      >
        {description}
      </p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          disabled={isActionDisabled}
          className={cn(STORES_COMPACT_PRIMARY_BUTTON_CLASS, 'mt-1.5 px-[18px]')}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
};
