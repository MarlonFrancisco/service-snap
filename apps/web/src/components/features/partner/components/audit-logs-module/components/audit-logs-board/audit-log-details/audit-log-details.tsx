import { cn } from '@repo/ui';
import { PARTNER_FOCUS_CLASS } from '../../../../../partner.styles';
import {
  PANEL_CARD_CLASS,
  PANEL_CARD_TITLE_CLASS,
  PANEL_CODE_CLASS,
  PANEL_DETAILS_LIST_CLASS,
  PANEL_DETAILS_ROW_CLASS,
  PANEL_DETAILS_TERM_CLASS,
  PANEL_DETAILS_VALUE_CLASS,
  PANEL_TEXT_CLASS,
} from '../../../audit-logs-module.styles';
import type { TAuditLogDetailsConfig } from '../audit-logs-board.types';

export const AuditLogDetails = ({
  row,
  headingRef,
}: TAuditLogDetailsConfig) => (
  <section
    aria-labelledby="audit-log-details-title"
    className={cn(PANEL_CARD_CLASS, 'lg:sticky lg:top-0')}
  >
    <h3
      id="audit-log-details-title"
      ref={headingRef}
      tabIndex={-1}
      className={cn(PANEL_CARD_TITLE_CLASS, PARTNER_FOCUS_CLASS)}
    >
      Detalhes
    </h3>

    {row ? (
      <>
        <dl className={PANEL_DETAILS_LIST_CLASS}>
          <div className={PANEL_DETAILS_ROW_CLASS}>
            <dt className={PANEL_DETAILS_TERM_CLASS}>Quando</dt>
            <dd className={PANEL_DETAILS_VALUE_CLASS}>{row.whenFull}</dd>
          </div>
          <div className={PANEL_DETAILS_ROW_CLASS}>
            <dt className={PANEL_DETAILS_TERM_CLASS}>Quem</dt>
            <dd className={PANEL_DETAILS_VALUE_CLASS}>{row.actorName}</dd>
          </div>
          <div className={PANEL_DETAILS_ROW_CLASS}>
            <dt className={PANEL_DETAILS_TERM_CLASS}>O que fez</dt>
            <dd className={PANEL_DETAILS_VALUE_CLASS}>{row.action}</dd>
          </div>
          <div className={PANEL_DETAILS_ROW_CLASS}>
            <dt className={PANEL_DETAILS_TERM_CLASS}>Origem</dt>
            <dd className={PANEL_DETAILS_VALUE_CLASS}>{row.origin}</dd>
          </div>
        </dl>

        {row.payload ? (
          <div className="rounded-[14px] bg-[#F7F6FA] p-3.5">
            <p className="mb-2 text-[13px] text-[#5F5C6E]">Enviado</p>
            <code
              className={cn(
                PANEL_CODE_CLASS,
                'block leading-[1.6] break-words whitespace-pre-wrap',
              )}
            >
              {row.payload}
            </code>
          </div>
        ) : null}
      </>
    ) : (
      <p className={PANEL_TEXT_CLASS}>
        Escolha uma linha em Detalhes para ver quando, quem e o que foi enviado.
      </p>
    )}

    <p className={PANEL_TEXT_CLASS}>
      Senhas, chaves, segredos e respostas de saúde nunca ficam no histórico.
    </p>
  </section>
);
