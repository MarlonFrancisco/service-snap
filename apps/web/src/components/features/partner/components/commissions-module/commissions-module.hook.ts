'use client';

import { useCallback, useMemo, useState } from 'react';
import { useManagementAccess } from '../cash-module/cash-module.hook';
import { getMonthPeriod, getPeriodError } from './commissions-module.helpers';
import type {
  TCommissionsPeriod,
  TCommissionsPeriodShortcut,
  TCommissionsPeriodState,
} from './commissions-module.types';

/** A mesma página vira "Minhas comissões" quando quem entra é profissional. */
export const useCommissionsModule = () => {
  const { storeState, isProfessional } = useManagementAccess();

  return { storeState, isProfessional };
};

/** Período do relatório; abre no mês atual. */
export const useCommissionsPeriod = (): TCommissionsPeriodState => {
  const [period, setPeriod] = useState<TCommissionsPeriod>(() =>
    getMonthPeriod(0),
  );
  const [shortcut, setShortcut] =
    useState<TCommissionsPeriodShortcut>('this-month');

  const handleFromChange = useCallback((from: string) => {
    setPeriod((current) => ({ ...current, from }));
    setShortcut('custom');
  }, []);

  const handleToChange = useCallback((to: string) => {
    setPeriod((current) => ({ ...current, to }));
    setShortcut('custom');
  }, []);

  const handleShortcut = useCallback(
    (next: Exclude<TCommissionsPeriodShortcut, 'custom'>) => {
      setPeriod(getMonthPeriod(next === 'this-month' ? 0 : -1));
      setShortcut(next);
    },
    [],
  );

  const periodError = useMemo(() => getPeriodError(period), [period]);

  return {
    period,
    shortcut,
    periodError,
    handleFromChange,
    handleToChange,
    handleShortcut,
  };
};
