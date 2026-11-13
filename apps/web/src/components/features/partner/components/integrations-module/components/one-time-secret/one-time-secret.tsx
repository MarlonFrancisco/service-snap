'use client';

import { cn } from '@repo/ui';
import { Check, Copy, Info } from 'lucide-react';
import {
  PANEL_BUTTON_CLASS,
  PANEL_BUTTON_ICON_CLASS,
  PANEL_CARD_CLASS,
  PANEL_CARD_TITLE_CLASS,
  PANEL_CODE_CLASS,
  PANEL_NOTE_ICON_CLASS,
  PANEL_SMALL_BUTTON_CLASS,
  PANEL_WARNING_NOTE_CLASS,
} from '../../../audit-logs-module/audit-logs-module.styles';
import { useCopyToClipboard } from './one-time-secret.hook';
import type { TOneTimeSecretConfig } from './one-time-secret.types';

/** Valor que só aparece agora: destaque, aviso e botão de copiar. */
export const OneTimeSecret = ({
  title,
  value,
  warning,
  children,
  onDismiss,
  dismissLabel = 'Pronto, já copiei',
}: TOneTimeSecretConfig) => {
  const { copy, isCopied } = useCopyToClipboard();

  return (
    <section
      aria-label={title}
      className={cn(PANEL_CARD_CLASS, 'border-2 border-[#9810FA]')}
    >
      <h3 className={PANEL_CARD_TITLE_CLASS}>{title}</h3>

      {warning ? (
        <div className={PANEL_WARNING_NOTE_CLASS}>
          <Info aria-hidden="true" className={PANEL_NOTE_ICON_CLASS} />
          <p>{warning}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-[#F7F6FA] px-3.5 py-3">
        <code
          className={cn(
            PANEL_CODE_CLASS,
            'min-w-0 flex-1 [overflow-wrap:anywhere]',
          )}
        >
          {value}
        </code>
        <button
          type="button"
          onClick={() => void copy(value)}
          className={cn(PANEL_BUTTON_CLASS, PANEL_SMALL_BUTTON_CLASS)}
        >
          {isCopied ? (
            <Check aria-hidden="true" className={PANEL_BUTTON_ICON_CLASS} />
          ) : (
            <Copy aria-hidden="true" className={PANEL_BUTTON_ICON_CLASS} />
          )}
          {isCopied ? 'Copiado' : 'Copiar'}
        </button>
      </div>

      {children}

      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className={cn(
            PANEL_BUTTON_CLASS,
            PANEL_SMALL_BUTTON_CLASS,
            'self-start',
          )}
        >
          {dismissLabel}
        </button>
      ) : null}
    </section>
  );
};
