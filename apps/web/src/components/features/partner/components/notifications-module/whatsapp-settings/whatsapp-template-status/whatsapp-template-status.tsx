'use client';

import { cn, Spinner } from '@repo/ui';
import { CircleAlert, CircleCheck, Clock, RefreshCw } from 'lucide-react';
import {
  MODULE_ACTION_CLASS,
  MODULE_PRIMARY_ACTION_CLASS,
} from '../../notifications-module.styles';
import { useWhatsappTemplateStatus } from './whatsapp-template-status.hook';
import type {
  TWhatsappTemplateStatusConfig,
  TWhatsappTemplateTone,
} from './whatsapp-template-status.types';

const TONE_CLASS: Record<TWhatsappTemplateTone, string> = {
  success: 'bg-[#E6F4EA] text-[#1E4620]',
  waiting: 'bg-[#FFF1E0] text-[#6E3B00]',
  danger: 'bg-[#FDECEC] text-[#7A1F1F]',
};

const TONE_ICON = {
  success: CircleCheck,
  waiting: Clock,
  danger: CircleAlert,
} as const;

export const WhatsappTemplateStatus = (
  config: TWhatsappTemplateStatusConfig,
) => {
  const {
    isVisible,
    view,
    rejectedReason,
    isLoading,
    isError,
    isRefreshing,
    handleRefresh,
    handleCreate,
    isCreating,
  } = useWhatsappTemplateStatus(config);

  if (!isVisible) return null;

  if (isLoading) {
    return (
      <p
        role="status"
        className="flex items-center gap-2 rounded-[18px] bg-[#F7F6FA] px-5 py-4 text-sm font-semibold text-[#5F5C6E]"
      >
        <Spinner />
        Consultando o template do lembrete na Meta...
      </p>
    );
  }

  const tone = isError || !view ? 'danger' : view.tone;
  const Icon = TONE_ICON[tone];

  return (
    <section
      role="status"
      aria-labelledby="whatsapp-template-title"
      className={cn(
        'flex flex-wrap items-center gap-4 rounded-[18px] px-5 py-4',
        TONE_CLASS[tone],
      )}
    >
      <Icon aria-hidden="true" className="size-6 flex-none stroke-[1.8]" />
      <div className="flex min-w-0 flex-[1_1_280px] flex-col gap-1">
        <h2 id="whatsapp-template-title" className="text-[15px] font-extrabold">
          {isError || !view
            ? 'Não foi possível consultar o template na Meta'
            : view.title}
        </h2>
        <p className="text-sm leading-[1.55]">
          {isError || !view
            ? 'Confira a integração do WhatsApp e tente de novo.'
            : view.description}
        </p>
        {rejectedReason ? (
          <p className="text-[13px] font-semibold">
            Motivo informado: {rejectedReason}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {view?.canCreate && !isError ? (
          <button
            type="button"
            onClick={handleCreate}
            disabled={isCreating}
            className={cn(
              MODULE_PRIMARY_ACTION_CLASS,
              'min-h-11 px-4 text-sm disabled:cursor-not-allowed',
            )}
          >
            {isCreating ? (
              <>
                <Spinner />
                Criando...
              </>
            ) : (
              'Criar template'
            )}
          </button>
        ) : null}
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={cn(
            MODULE_ACTION_CLASS,
            'min-h-11 gap-2 px-4 text-sm disabled:cursor-not-allowed',
          )}
        >
          <RefreshCw
            aria-hidden="true"
            className={cn('size-4', isRefreshing && 'animate-spin')}
          />
          Atualizar status
        </button>
      </div>
    </section>
  );
};
