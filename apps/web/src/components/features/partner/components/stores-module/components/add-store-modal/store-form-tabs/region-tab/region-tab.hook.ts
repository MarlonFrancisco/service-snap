import {
  COUNTRIES,
  getCountriesByRegion,
  type TCountryCode,
} from '@repo/shared/constants';
import { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import type { TStoreFormSchema } from '../store-form.schema';
import { TIMEZONE_GROUPS } from './region-tab.constants';

const UPDATE_OPTIONS = { shouldValidate: true, shouldDirty: true } as const;

export const useRegionTab = () => {
  const form = useFormContext<TStoreFormSchema>();

  const countryGroups = useMemo(() => {
    const regions = getCountriesByRegion();

    return [
      { label: 'América do Sul', codes: regions.southAmerica },
      { label: 'América do Norte', codes: regions.northAmerica },
      { label: 'Europa', codes: regions.europe },
    ];
  }, []);

  const handleCountryChange = useCallback(
    (value: string) => {
      const countryCode = value as TCountryCode;
      const countryData = COUNTRIES[countryCode];

      // Trocar o país preenche moeda e fuso; os dois seguem editáveis.
      form.setValue('country', countryCode, UPDATE_OPTIONS);
      form.setValue('currency', countryData.currency, UPDATE_OPTIONS);
      form.setValue('timezone', countryData.timezone, UPDATE_OPTIONS);
    },
    [form],
  );

  const getTimezoneLabel = useCallback((timezone: string) => {
    const options = TIMEZONE_GROUPS.flatMap((group) => [...group.options]);
    return options.find((option) => option.value === timezone)?.label ?? timezone;
  }, []);

  return {
    form,
    countryGroups,
    timezoneGroups: TIMEZONE_GROUPS,
    handleCountryChange,
    getTimezoneLabel,
  };
};
