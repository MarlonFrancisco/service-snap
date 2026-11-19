import { useAnalytics } from '@/providers/analytics.provider';
import { SUPPORTED_CURRENCIES, useLocaleStore } from '@/store/locale';
import {
  getCountriesByRegion,
  type TCountryCode,
  type TCurrencyCode,
} from '@repo/shared/constants';
import { useCallback, useMemo } from 'react';
import type { TUseLocaleDialogConfig } from './locale-dialog.types';

export const useLocaleDialog = ({ onOpenChange }: TUseLocaleDialogConfig) => {
  const analytics = useAnalytics();
  const {
    country,
    currency,
    autoTranslate,
    setCountry,
    setCurrency,
    setAutoTranslate,
  } = useLocaleStore();

  const regions = useMemo(() => getCountriesByRegion(), []);

  const recommendedCountries = useMemo(
    () => ['BR', 'US', 'PT'] as TCountryCode[],
    [],
  );

  // Só as moedas em que há planos: as outras mostrariam um preço que não existe.
  const currencyCodes = SUPPORTED_CURRENCIES;

  const handleCountrySelect = useCallback(
    (code: TCountryCode) => {
      setCountry(code);
      analytics.track('locale_changed', { setting: 'country', value: code });
    },
    [setCountry, analytics],
  );

  const handleCurrencySelect = useCallback(
    (code: TCurrencyCode) => {
      setCurrency(code);
      analytics.track('locale_changed', { setting: 'currency', value: code });
    },
    [setCurrency, analytics],
  );

  const handleAutoTranslateToggle = useCallback(
    (checked: boolean) => {
      setAutoTranslate(checked);
      analytics.track('locale_changed', {
        setting: 'auto_translate',
        value: String(checked),
      });
    },
    [setAutoTranslate, analytics],
  );

  const handleSave = useCallback(() => {
    analytics.track('locale_changed', { setting: 'save' });
    onOpenChange(false);
  }, [onOpenChange, analytics]);

  return {
    country,
    currency,
    autoTranslate,
    regions,
    recommendedCountries,
    currencyCodes,
    handleCountrySelect,
    handleCurrencySelect,
    handleAutoTranslateToggle,
    handleSave,
  };
};
