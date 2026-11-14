'use client';

import { cn, Skeleton, Spinner } from '@repo/ui';
import { Lock, Plus } from 'lucide-react';
import { ModuleErrorState } from '../../../notifications-module/components/module-state';
import {
  MANAGEMENT_BUTTON_CLASS,
  MANAGEMENT_BUTTON_ICON_CLASS,
  MANAGEMENT_CARD_CLASS,
  MANAGEMENT_CARD_TITLE_CLASS,
  MANAGEMENT_CHIP_CLASS,
  MANAGEMENT_CHIP_TONE,
  MANAGEMENT_DANGER_BUTTON_CLASS,
  MANAGEMENT_ITEM_CLASS,
  MANAGEMENT_LINE_CLASS,
  MANAGEMENT_LINE_TEXT_CLASS,
  MANAGEMENT_LINE_TITLE_CLASS,
  MANAGEMENT_NOTE_CLASS,
  MANAGEMENT_NOTE_ICON_CLASS,
  MANAGEMENT_NOTE_TONE,
  MANAGEMENT_ROW_CLASS,
  MANAGEMENT_SMALL_BUTTON_CLASS,
  MANAGEMENT_TEXT_CLASS,
} from '../../../cash-module/cash-module.styles';
import { CommissionRuleForm } from './commission-rule-form';
import { useCommissionRules } from './commission-rules.hook';

const FORM_ID = 'commission-rule-form';

export const CommissionRules = () => {
  const {
    storeId,
    groups,
    isLoading,
    isError,
    handleRetry,
    handleDelete,
    deletingId,
  } = useCommissionRules();

  const renderRules = () => {
    if (isLoading) {
      return (
        <div
          role="status"
          aria-label="Carregando regras"
          className="grid gap-2.5"
        >
          <Skeleton className="h-[68px] rounded-2xl bg-[#F0EEF4]" />
          <Skeleton className="h-[68px] rounded-2xl bg-[#F0EEF4]" />
        </div>
      );
    }
    if (isError) {
      return <ModuleErrorState headingLevel="h3" onRetry={handleRetry} />;
    }
    if (groups.active.length === 0) {
      return (
        <p className={MANAGEMENT_TEXT_CLASS}>
          Nenhuma regra ainda: sem regra, a comissão fica zerada. Comece pelo
          padrão da loja.
        </p>
      );
    }

    return (
      <ul className="grid gap-2.5">
        {groups.active.map((rule) => (
          <li key={rule.id} className={MANAGEMENT_ITEM_CLASS}>
            <div className={MANAGEMENT_LINE_CLASS}>
              <b className={MANAGEMENT_LINE_TITLE_CLASS}>{rule.title}</b>
              <span className={MANAGEMENT_LINE_TEXT_CLASS}>
                {rule.description}
              </span>
            </div>
            {rule.status === 'current' ? (
              <span
                className={cn(MANAGEMENT_CHIP_CLASS, MANAGEMENT_CHIP_TONE.ok)}
              >
                Vigente
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleDelete(rule.id)}
                disabled={!!deletingId}
                aria-label={`Apagar a regra ${rule.title}, ${rule.description}`}
                className={cn(
                  MANAGEMENT_BUTTON_CLASS,
                  MANAGEMENT_SMALL_BUTTON_CLASS,
                  MANAGEMENT_DANGER_BUTTON_CLASS,
                )}
              >
                {deletingId === rule.id ? <Spinner className="size-4" /> : null}
                Apagar
              </button>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <aside
      aria-labelledby="commission-rules-title"
      className="grid content-start gap-[18px]"
    >
      <section className={MANAGEMENT_CARD_CLASS}>
        <div className={MANAGEMENT_ROW_CLASS}>
          <h2
            id="commission-rules-title"
            className={MANAGEMENT_CARD_TITLE_CLASS}
          >
            Regras
          </h2>
          <a
            href={`#${FORM_ID}`}
            className={cn(
              MANAGEMENT_BUTTON_CLASS,
              MANAGEMENT_SMALL_BUTTON_CLASS,
            )}
          >
            <Plus aria-hidden="true" className={MANAGEMENT_BUTTON_ICON_CLASS} />
            Nova regra
          </a>
        </div>
        <p className={MANAGEMENT_TEXT_CLASS}>
          Vale a mais específica: profissional e serviço, depois profissional,
          depois serviço, depois o padrão da loja.
        </p>

        {renderRules()}

        {groups.previous.length > 0 ? (
          <details>
            <summary className="flex min-h-11 cursor-pointer items-center text-[13px] text-[#5F5C6E]">
              Versões anteriores ({groups.previous.length})
            </summary>
            <ul className="grid gap-2.5 pt-1">
              {groups.previous.map((rule) => (
                <li key={rule.id} className={MANAGEMENT_ITEM_CLASS}>
                  <div className={MANAGEMENT_LINE_CLASS}>
                    <b className={MANAGEMENT_LINE_TITLE_CLASS}>{rule.title}</b>
                    <span className={MANAGEMENT_LINE_TEXT_CLASS}>
                      {rule.description}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </section>

      <div id={FORM_ID} className="scroll-mt-6">
        <CommissionRuleForm storeId={storeId} />
      </div>

      <div className={cn(MANAGEMENT_NOTE_CLASS, MANAGEMENT_NOTE_TONE.lock)}>
        <Lock aria-hidden="true" className={MANAGEMENT_NOTE_ICON_CLASS} />
        <p>
          <b className="block text-[#3B2A6B]">
            Profissional vê só a própria comissão
          </b>
          Em Minhas comissões, com o mesmo detalhamento. Regras e relatório da
          equipe ficam com dono e gerente.
        </p>
      </div>
    </aside>
  );
};
