import { useAnalytics } from '@/providers/analytics.provider';
import { useLocaleStore } from '@/store/locale';
import {
  getCountriesByRegion,
  type TCountryCode,
} from '@repo/shared/constants';
import { useCallback, useMemo } from 'react';
import type { TUseLocaleDialogConfig } from './locale-dialog.types';

export const useLocaleDialog = ({ onOpenChange }: TUseLocaleDialogConfig) => {
  const analytics = useAnalytics();
  const { country, autoTranslate, setCountry, setAutoTranslate } =
    useLocaleStore();

  const regions = useMemo(() => getCountriesByRegion(), []);

  const recommendedCountries = useMemo(
    () => ['BR', 'US', 'PT'] as TCountryCode[],
    [],
  );

  const handleCountrySelect = useCallback(
    (code: TCountryCode) => {
      setCountry(code);
      analytics.track('locale_changed', { setting: 'country', value: code });
    },
    [setCountry, analytics],
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
    autoTranslate,
    regions,
    recommendedCountries,
    handleCountrySelect,
    handleAutoTranslateToggle,
    handleSave,
  };
};
