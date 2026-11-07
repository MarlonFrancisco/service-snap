import type { TWhatsappCheckState } from '@/types/api/whatsapp.types';
import { cn } from '@repo/ui';
import { CircleCheck, CircleX, Clock, TriangleAlert } from 'lucide-react';
import {
  MODULE_ACTION_CLASS,
  MODULE_BADGE_CLASS,
  MODULE_BADGE_TONE_CLASS,
} from '../../notifications-module/notifications-module.styles';
import {
  WHATSAPP_CHECK_BADGE,
  WHATSAPP_CHECK_LABEL,
  WHATSAPP_CHECK_STEP,
} from './whatsapp-connection-checks.constants';
import type { IWhatsappConnectionChecksProps } from './whatsapp-connection-checks.types';

const STATE_ICON = {
  ok: { Icon: CircleCheck, className: 'text-[#0A5536]' },
  warning: { Icon: TriangleAlert, className: 'text-[#8A4B00]' },
  error: { Icon: CircleX, className: 'text-[#B42318]' },
  pending: { Icon: Clock, className: 'text-[#5F5C6E]' },
} satisfies Record<TWhatsappCheckState, unknown>;

export const WhatsappConnectionChecks = ({
  checks,
  renderReview,
  onUseSuggestion,
  isApplyingSuggestion,
}: IWhatsappConnectionChecksProps) => (
  <ul className="grid gap-2">
    {checks.map((check) => {
      const { Icon, className } = STATE_ICON[check.state];
      const badge = WHATSAPP_CHECK_BADGE[check.state];
      const needsReview = check.state === 'error' || check.state === 'warning';

      return (
        <li
          key={check.key}
          className={cn(
            'grid gap-2 rounded-[16px] border p-4',
            check.state === 'error' ? 'border-[#F2C4C4]' : 'border-[#EBE9F0]',
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <h4 className="flex items-center gap-2.5 text-[15px] font-extrabold">
              <Icon
                aria-hidden="true"
                className={cn('size-5 shrink-0 stroke-[1.8]', className)}
              />
              {WHATSAPP_CHECK_LABEL[check.key]}
            </h4>
            <span
              className={cn(
                MODULE_BADGE_CLASS,
                MODULE_BADGE_TONE_CLASS[badge.tone],
              )}
            >
              {badge.label}
            </span>
          </div>
          <p className="text-sm leading-normal text-[#5F5C6E]">
            {check.message}
          </p>
          {check.suggestions?.length && onUseSuggestion ? (
            <div className="grid gap-2 rounded-[14px] bg-[#FAFAFC] p-3.5">
              <p className="text-[13px] font-bold">
                {check.suggestions.length === 1
                  ? 'Encontramos este número nas contas do seu token:'
                  : 'Encontramos estes números nas contas do seu token:'}
              </p>
              <ul className="grid gap-2">
                {check.suggestions.map((suggestion) => (
                  <li
                    key={`${suggestion.businessAccountId}-${suggestion.phoneNumberId}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[#EBE9F0] bg-white px-3.5 py-3"
                  >
                    <div className="min-w-0 text-[13px] leading-normal">
                      <b className="block text-sm">
                        {suggestion.displayPhoneNumber || 'Número sem nome'}
                        {suggestion.verifiedName
                          ? ` · ${suggestion.verifiedName}`
                          : ''}
                      </b>
                      <span className="block break-all text-[#5F5C6E] tabular-nums">
                        Phone Number ID {suggestion.phoneNumberId} · Business
                        Account ID {suggestion.businessAccountId}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onUseSuggestion(suggestion)}
                      disabled={isApplyingSuggestion}
                      className={MODULE_ACTION_CLASS}
                    >
                      Usar estes IDs
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {needsReview && renderReview ? (
            <div>{renderReview(WHATSAPP_CHECK_STEP[check.key])}</div>
          ) : null}
        </li>
      );
    })}
  </ul>
);
