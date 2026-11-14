'use client';

import { cn, Spinner } from '@repo/ui';
import {
  AGENDA_MODAL_BUTTON_CLASS,
  AGENDA_MODAL_DANGER_BUTTON_CLASS,
} from '../../../agenda-module/agenda-module.styles';
import {
  SERIES_RADIO_CLASS,
  SERIES_RADIO_INPUT_CLASS,
} from '../../schedule-series-module.styles';
import { useScheduleSeriesCancel } from './schedule-series-cancel.hook';
import type { TScheduleSeriesCancelConfig } from './schedule-series-cancel.types';

/**
 * Confirmação de cancelamento de um agendamento da série. Fica no lugar da
 * confirmação comum, dentro dos detalhes do agendamento.
 */
export const ScheduleSeriesCancel = ({
  onBack,
  ...config
}: TScheduleSeriesCancelConfig) => {
  const {
    scope,
    setScope,
    description,
    followingCount,
    canCancelFollowing,
    isLoading,
    isCancelling,
    handleConfirm,
  } = useScheduleSeriesCancel(config);

  return (
    <div
      role="alertdialog"
      aria-labelledby="series-cancel-title"
      aria-describedby="series-cancel-description"
      className="grid gap-3 rounded-[14px] bg-[#F7F6FA] px-4 py-3.5 text-sm leading-normal"
    >
      <h3 id="series-cancel-title" className="text-base font-extrabold">
        Cancelar agendamento
      </h3>
      <p id="series-cancel-description" className="text-[#5F5C6E]">
        {isLoading ? 'Carregando a série...' : description}
      </p>

      <fieldset className="m-0 grid gap-1 border-0 p-0">
        <legend className="sr-only">O que cancelar</legend>
        <label className={SERIES_RADIO_CLASS}>
          <input
            type="radio"
            name="series-cancel-scope"
            value="one"
            checked={scope === 'one'}
            onChange={() => setScope('one')}
            className={SERIES_RADIO_INPUT_CLASS}
          />
          Só este
        </label>
        <label
          className={cn(
            SERIES_RADIO_CLASS,
            !canCancelFollowing && 'cursor-not-allowed text-[#8D8A9B]',
          )}
        >
          <input
            type="radio"
            name="series-cancel-scope"
            value="following"
            checked={scope === 'following'}
            disabled={!canCancelFollowing}
            onChange={() => setScope('following')}
            className={SERIES_RADIO_INPUT_CLASS}
          />
          Este e os próximos ({followingCount})
        </label>
      </fieldset>

      <p className="text-[#5F5C6E]">
        O cliente recebe um aviso só, com a primeira data cancelada.
      </p>

      <div className="flex gap-2.5">
        <button
          type="button"
          autoFocus
          onClick={onBack}
          disabled={isCancelling}
          className={AGENDA_MODAL_BUTTON_CLASS}
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isCancelling || isLoading}
          className={cn(
            AGENDA_MODAL_BUTTON_CLASS,
            AGENDA_MODAL_DANGER_BUTTON_CLASS,
          )}
        >
          {isCancelling ? (
            <>
              <Spinner />
              Cancelando...
            </>
          ) : (
            'Cancelar agendamento'
          )}
        </button>
      </div>
    </div>
  );
};
