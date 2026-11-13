'use client';

import { cn, Input } from '@repo/ui';
import { Copy, MessageCircle } from 'lucide-react';
import {
  CUSTOMERS_BUTTON_CLASS,
  CUSTOMERS_BUTTON_ICON_CLASS,
  CUSTOMERS_PRIMARY_BUTTON_CLASS,
  CUSTOMERS_SMALL_BUTTON_CLASS,
} from '../../../customers-module/customers-module.styles';
import {
  ANAMNESIS_CHIP_CLASS,
  ANAMNESIS_CHIP_TONE,
  ANAMNESIS_FIELD_CLASS,
  ANAMNESIS_INLINE_CARD_CLASS,
  ANAMNESIS_ITEM_CLASS,
  ANAMNESIS_TEXT_CLASS,
} from '../../anamnesis-module.styles';
import { useAnamnesisLinkCard } from './anamnesis-link-card.hook';
import type { TAnamnesisLinkCardConfig } from './anamnesis-link-card.types';

/** "No agendamento": ficha pendente ou preenchida e o link para o cliente. */
export const AnamnesisLinkCard = (config: TAnamnesisLinkCardConfig) => {
  const {
    isVisible,
    title,
    subtitle,
    status,
    statusLabel,
    hasPhone,
    linkUrl,
    isGenerating,
    handleCopy,
    handleWhatsapp,
  } = useAnamnesisLinkCard(config);

  if (!isVisible) return null;

  const isSubmitted = status === 'submitted';

  return (
    <section
      aria-labelledby="anamnesis-link-title"
      className={ANAMNESIS_INLINE_CARD_CLASS}
    >
      <div>
        <h3
          id="anamnesis-link-title"
          className="text-[17px] font-extrabold tracking-[-0.015em]"
        >
          {title}
        </h3>
        <p className={cn(ANAMNESIS_TEXT_CLASS, 'mt-0.5')}>{subtitle}</p>
      </div>

      <div className={ANAMNESIS_ITEM_CLASS}>
        <div className="grid min-w-0 gap-0.5">
          <b className="text-sm">{statusLabel}</b>
          {isSubmitted ? null : (
            <span className="text-[13px] text-[#5F5C6E]">
              O link vale até o dia seguinte ao atendimento
            </span>
          )}
        </div>
        <span
          className={cn(
            ANAMNESIS_CHIP_CLASS,
            isSubmitted ? ANAMNESIS_CHIP_TONE.ok : ANAMNESIS_CHIP_TONE.warning,
          )}
        >
          {isSubmitted ? 'Preenchida' : 'Pendente'}
        </span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={handleCopy}
          disabled={isGenerating}
          className={cn(CUSTOMERS_BUTTON_CLASS, CUSTOMERS_SMALL_BUTTON_CLASS)}
        >
          <Copy aria-hidden="true" className={CUSTOMERS_BUTTON_ICON_CLASS} />
          Copiar link
        </button>
        {hasPhone ? (
          <button
            type="button"
            onClick={handleWhatsapp}
            disabled={isGenerating}
            className={cn(
              CUSTOMERS_PRIMARY_BUTTON_CLASS,
              CUSTOMERS_SMALL_BUTTON_CLASS,
            )}
          >
            <MessageCircle
              aria-hidden="true"
              className={CUSTOMERS_BUTTON_ICON_CLASS}
            />
            Enviar pelo WhatsApp
            <span className="sr-only">(abre em outra aba)</span>
          </button>
        ) : null}
      </div>

      {linkUrl ? (
        <label className="grid gap-1.5 text-sm font-semibold">
          Copie o link
          <Input
            readOnly
            value={linkUrl}
            onFocus={(event) => event.target.select()}
            className={ANAMNESIS_FIELD_CLASS}
          />
        </label>
      ) : null}

      <p className={ANAMNESIS_TEXT_CLASS}>
        {hasPhone
          ? 'Enviar pelo WhatsApp abre a conversa com o cliente e o link já escrito; você confere e envia.'
          : 'O cliente não tem telefone cadastrado: copie o link e envie por onde preferir.'}
      </p>
    </section>
  );
};
