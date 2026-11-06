'use client';

import type { TChecklistItemId } from '@/types/api/onboarding.types';
import { plusJakartaSans } from '@/utils/fonts/plus-jakarta-sans';
import { cn } from '@repo/ui';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ONBOARDING_ERROR_CLASS,
  ONBOARDING_FIELD_LABEL_CLASS,
  ONBOARDING_ICON_BUTTON_CLASS,
  ONBOARDING_INPUT_CLASS,
  ONBOARDING_OUTLINE_BUTTON_CLASS,
} from '../../partner-onboarding.styles';
import {
  CHECKLIST_ITEM_CONTENT,
  useOnboardingHomeChecklist,
} from './onboarding-home-checklist.hook';

const ROW_CLASS =
  'grid min-h-[66px] w-full cursor-pointer grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] bg-[#F7F6FA] px-4 py-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F]';

type TRowContentProps = {
  id: TChecklistItemId;
  done: boolean;
};

const RowContent = ({ id, done }: TRowContentProps) => {
  const content = CHECKLIST_ITEM_CONTENT[id];

  return (
    <>
      {done ? (
        <span
          aria-hidden="true"
          className="grid size-6 place-items-center rounded-full bg-[#0B0B0F] text-[13px] font-extrabold text-white"
        >
          ✓
        </span>
      ) : (
        <span
          aria-hidden="true"
          className="size-6 rounded-full border-2 border-[#A6A3B4]"
        />
      )}
      <span className="min-w-0">
        <b className="block text-sm font-bold text-[#0B0B0F]">
          {content.title}
        </b>
        <small className="text-[13px] text-[#5F5C6E]">
          {done ? 'Concluído' : content.description}
        </small>
      </span>
      <span className="text-[13px] font-bold whitespace-nowrap text-[#0B0B0F]">
        {done ? (content.doneAction ?? content.action) : content.action}
      </span>
    </>
  );
};

export const OnboardingHomeChecklist = () => {
  const {
    isVisible,
    storeId,
    items,
    completedCount,
    isEditingGoal,
    goal,
    goalError,
    isSavingGoal,
    setGoal,
    openGoalEditor,
    handleCopyLink,
    handleItemClick,
    handleSaveGoal,
    handleDismiss,
  } = useOnboardingHomeChecklist();

  if (!isVisible) return null;

  const renderRow = (id: TChecklistItemId, done: boolean): ReactNode => {
    const rowContent = <RowContent id={id} done={done} />;

    if (id === 'share_link' && !done) {
      return (
        <button type="button" onClick={handleCopyLink} className={ROW_CLASS}>
          {rowContent}
        </button>
      );
    }

    if (id === 'share_link') {
      return (
        <Link
          href={`/booking/${storeId}`}
          target="_blank"
          onClick={() => handleItemClick(id)}
          className={ROW_CLASS}
        >
          {rowContent}
        </Link>
      );
    }

    // Não existe tela para definir a meta: ela é preenchida aqui mesmo.
    if (id === 'monthly_goal' && !done) {
      return (
        <button type="button" onClick={openGoalEditor} className={ROW_CLASS}>
          {rowContent}
        </button>
      );
    }

    return (
      <Link
        href={CHECKLIST_ITEM_CONTENT[id].href}
        onClick={() => handleItemClick(id)}
        className={ROW_CLASS}
      >
        {rowContent}
      </Link>
    );
  };

  return (
    <section
      aria-label="Checklist do espaço"
      className={cn(
        plusJakartaSans.className,
        'relative mb-5 rounded-3xl bg-white p-6 text-[#0B0B0F] shadow-[0_12px_40px_rgba(15,12,30,0.1)]',
      )}
    >
      <button
        type="button"
        aria-label="Dispensar checklist"
        onClick={handleDismiss}
        className={cn(
          ONBOARDING_ICON_BUTTON_CLASS,
          'absolute top-3 right-3 text-lg',
        )}
      >
        ×
      </button>

      <h2 className="pr-12 text-[22px] font-extrabold tracking-[-0.025em]">
        Deixe seu espaço completo
      </h2>
      <p className="mt-[3px] mb-3 text-sm text-[#5F5C6E]">
        {completedCount} de {items.length} concluídos. Seu espaço já recebe
        agendamentos; estes passos são opcionais.
      </p>
      <div
        role="progressbar"
        aria-label="Itens concluídos"
        aria-valuenow={completedCount}
        aria-valuemin={0}
        aria-valuemax={items.length}
        className="h-1.5 overflow-hidden rounded-full bg-[#EBE9F0]"
      >
        <div
          className="h-full bg-[#0B0B0F]"
          style={{ width: `${(completedCount / items.length) * 100}%` }}
        />
      </div>

      <ul className="mt-4 grid list-none grid-cols-[repeat(auto-fit,minmax(min(400px,100%),1fr))] gap-2 p-0">
        {items.map(({ id, done }) => (
          <li key={id}>{renderRow(id, done)}</li>
        ))}
      </ul>

      {isEditingGoal && (
        <form
          className="mt-4"
          onSubmit={(event) => {
            event.preventDefault();
            handleSaveGoal();
          }}
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-end">
            <label className={`${ONBOARDING_FIELD_LABEL_CLASS} flex-1`}>
              Meta de faturamento mensal, em reais
              <input
                type="text"
                inputMode="numeric"
                placeholder="5000"
                value={goal}
                aria-invalid={Boolean(goalError)}
                onChange={(event) => setGoal(event.target.value)}
                className={ONBOARDING_INPUT_CLASS}
              />
            </label>
            <button
              type="submit"
              disabled={isSavingGoal}
              className={cn(ONBOARDING_OUTLINE_BUTTON_CLASS, 'min-h-[50px]')}
            >
              {isSavingGoal ? 'Salvando…' : 'Salvar meta'}
            </button>
          </div>
          {goalError && (
            <p role="alert" className={cn('mt-2', ONBOARDING_ERROR_CLASS)}>
              {goalError}
            </p>
          )}
        </form>
      )}
    </section>
  );
};
