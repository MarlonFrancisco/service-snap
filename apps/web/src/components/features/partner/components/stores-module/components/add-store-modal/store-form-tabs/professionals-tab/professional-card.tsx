import { PARTNER_MUTED_TEXT_CLASS } from '@/components/features/partner/partner.styles';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { cn } from '@repo/ui';
import {
  STORES_COMPACT_BUTTON_CLASS,
  STORES_DANGER_TEXT_CLASS,
} from '../../../../stores-module.styles';
import {
  getProfessionalDisplay,
  getRoleLabel,
} from '../../../../utils/stores-module.helpers';
import type { TProfessionalCardConfig } from './professional-tab.types';

const BADGE_CLASS =
  'rounded-full bg-[#F4F3F7] px-[9px] py-[3px] text-xs font-bold';

export const ProfessionalCard = ({
  professional,
  onEdit,
  onToggleStatus,
  onRemove,
}: TProfessionalCardConfig) => {
  const { name, initials, contact, since, hasPendingData } =
    getProfessionalDisplay(professional);
  const statusAction = professional.isActive ? 'Pausar' : 'Ativar';

  return (
    <article className="grid grid-cols-[48px_minmax(0,1fr)] gap-3 rounded-[20px] border border-[#EBE9F0] p-4">
      {professional.user.avatar ? (
        <span className="relative size-12 overflow-hidden rounded-full">
          <ImageWithFallback
            src={professional.user.avatar}
            alt=""
            fill
            sizes="48px"
            className="object-cover"
          />
        </span>
      ) : (
        <span
          aria-hidden="true"
          className="grid size-12 place-items-center rounded-full bg-[#F4F3F7] text-sm font-bold"
        >
          {initials}
        </span>
      )}

      <div className="min-w-0">
        <h4 className="flex flex-wrap items-center gap-2 text-[15px] font-bold break-words">
          {name}
          <span className={BADGE_CLASS}>{getRoleLabel(professional.role)}</span>
          {professional.isActive ? null : (
            <span className={BADGE_CLASS}>Pausado</span>
          )}
        </h4>
        <p
          className={cn(
            'mt-0.5 text-[13px] break-words',
            PARTNER_MUTED_TEXT_CLASS,
          )}
        >
          {contact}
        </p>
        {since ? (
          <p className={cn('mt-0.5 text-[13px]', PARTNER_MUTED_TEXT_CLASS)}>
            Desde {since}
          </p>
        ) : null}
        {hasPendingData ? (
          <p className="mt-0.5 text-[13px] font-semibold text-[#6E3B00]">
            Dados pendentes no cadastro do usuário
          </p>
        ) : null}

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(professional)}
            aria-label={`Editar ${name}`}
            className={STORES_COMPACT_BUTTON_CLASS}
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => onToggleStatus(professional)}
            aria-label={`${statusAction} ${name}`}
            className={STORES_COMPACT_BUTTON_CLASS}
          >
            {statusAction}
          </button>
          <button
            type="button"
            onClick={() => onRemove(professional)}
            aria-label={`Remover ${name}`}
            className={cn(STORES_COMPACT_BUTTON_CLASS, STORES_DANGER_TEXT_CLASS)}
          >
            Remover
          </button>
        </div>
      </div>
    </article>
  );
};
