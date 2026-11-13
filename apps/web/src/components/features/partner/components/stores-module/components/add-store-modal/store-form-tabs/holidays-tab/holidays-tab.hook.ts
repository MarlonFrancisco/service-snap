import { useHolidaysMutations } from '@/hooks/partner/use-holidays-mutations';
import { useHolidaysQuery } from '@/hooks/partner/use-holidays-query';
import { isApiHttpError } from '@/service/api';
import {
  useCallback,
  useMemo,
  useState,
  type KeyboardEvent,
} from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { TStoreFormSchema } from '../store-form.schema';
import { groupHolidaysByYear, toLocalDateKey } from './holidays-tab.helpers';
import type { THolidayDraft } from './holidays-tab.types';

const EMPTY_DRAFT: THolidayDraft = { date: '', name: '' };

export const useHolidaysTab = () => {
  const form = useFormContext<TStoreFormSchema>();
  const storeId = useWatch({ control: form.control, name: 'id' });
  const [draft, setDraft] = useState<THolidayDraft>(EMPTY_DRAFT);
  const [dateError, setDateError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // A aba mostra só os próximos dias; o passado não muda a agenda.
  const today = useMemo(() => new Date(), []);
  const todayKey = toLocalDateKey(today);

  const { holidays, isPendingHolidays, isErrorHolidays, refetchHolidays } =
    useHolidaysQuery({ storeId, from: todayKey });
  const { createHolidayMutation, deleteHolidayMutation } =
    useHolidaysMutations();

  const groups = useMemo(
    () => groupHolidaysByYear(holidays, today.getFullYear()),
    [holidays, today],
  );

  const handleDateChange = useCallback((date: string) => {
    setDraft((current) => ({ ...current, date }));
    setDateError(null);
  }, []);

  const handleNameChange = useCallback((name: string) => {
    setDraft((current) => ({ ...current, name }));
  }, []);

  const handleAdd = useCallback(() => {
    if (!storeId) return;

    if (!draft.date) {
      setDateError('Escolha a data em que a loja fica fechada');
      return;
    }

    const name = draft.name.trim();

    createHolidayMutation.mutate(
      { storeId, holiday: { date: draft.date, ...(name ? { name } : {}) } },
      {
        onSuccess: () => {
          setDraft(EMPTY_DRAFT);
          setDateError(null);
        },
        onError: (error) => {
          // A API responde o 409 em inglês; o texto da tela é o do desenho
          if (isApiHttpError(error) && error.status === 409) {
            setDateError('Já existe um feriado nesta data');
          }
        },
      },
    );
  }, [storeId, draft, createHolidayMutation]);

  // Fora de um <form>: Enter adiciona sem salvar a loja inteira.
  const handleInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      handleAdd();
    },
    [handleAdd],
  );

  const handleRemove = useCallback(
    (holidayId: string) => {
      if (!storeId) return;

      setRemovingId(holidayId);
      deleteHolidayMutation.mutate(
        { storeId, holidayId },
        { onSettled: () => setRemovingId(null) },
      );
    },
    [storeId, deleteHolidayMutation],
  );

  return {
    draft,
    dateError,
    minDate: todayKey,
    groups,
    isEmpty: !isPendingHolidays && !isErrorHolidays && holidays.length === 0,
    isLoading: isPendingHolidays,
    isError: isErrorHolidays,
    isAdding: createHolidayMutation.isPending,
    removingId,
    refetchHolidays,
    handleDateChange,
    handleNameChange,
    handleAdd,
    handleInputKeyDown,
    handleRemove,
  };
};
