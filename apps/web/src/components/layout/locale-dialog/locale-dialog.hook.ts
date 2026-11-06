import { useAnalytics } from '@/providers/analytics.provider';
import { useLocaleStore } from '@/store/locale';
import {
  CURRENCIES,
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

  const currencyCodes = useMemo(
    () => Object.keys(CURRENCIES) as TCurrencyCode[],
    [],
  );

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
