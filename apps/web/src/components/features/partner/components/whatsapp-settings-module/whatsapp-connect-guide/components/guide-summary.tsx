'use client';

import { cn } from '@repo/ui';
import { Check } from 'lucide-react';
import { PARTNER_FOCUS_CLASS } from '../../../../partner.styles';
import { MODULE_CARD_CLASS } from '../../../notifications-module/notifications-module.styles';
import type { IGuideSummaryProps } from '../whatsapp-connect-guide.types';

/** Coluna lateral do desktop largo: mostra o que já foi colado e leva à etapa que falta. */
export const GuideSummary = ({
  items,
  webhookTokenLabel,
  onGoToStep,
}: IGuideSummaryProps) => {
  const filled = items.filter(({ value }) => value).length;

  return (
    <aside
      aria-label="Seus dados"
      className={cn(MODULE_CARD_CLASS, 'content-start gap-3.5 p-5')}
    >
      <div>
        <h3 className="text-base font-extrabold">Seus dados</h3>
        <p className="mt-0.5 text-[13px] text-[#5F5C6E]">
          {filled} de {items.length} preenchidos. Nada é salvo até o passo 6.
        </p>
      </div>

      <ul className="grid gap-2">
        {items.map(({ label, value, step }) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => onGoToStep(step)}
              className={cn(
                'flex w-full cursor-pointer items-center gap-3 rounded-[14px] bg-[#FAFAFC] px-3 py-2.5 text-left transition-colors hover:bg-[#F4F3F7]',
                PARTNER_FOCUS_CLASS,
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'grid size-6 shrink-0 place-items-center rounded-full border-[1.5px] text-[11px] font-bold',
                  value
                    ? 'border-[#0A5536] bg-[#DFF2E7] text-[#0A5536]'
                    : 'border-[#D8D5E0] text-[#5F5C6E]',
                )}
              >
                {value ? <Check className="size-3.5 stroke-[2.4]" /> : step}
              </span>
              <span className="min-w-0 flex-1 text-[13px]">
                <b className="block font-semibold">{label}</b>
                <span className="block truncate text-[#5F5C6E] tabular-nums">
                  {value || `Falta · passo ${step}`}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="border-t border-[#F0EEF4] pt-3 text-[13px]">
        <b className="block font-semibold">Webhook Verify Token</b>
        <span className="block truncate text-[#5F5C6E]">
          {webhookTokenLabel} · usado no passo 5
        </span>
      </div>
    </aside>
  );
};
