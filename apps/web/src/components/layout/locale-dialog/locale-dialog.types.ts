import type { TCountryCode } from '@repo/shared/constants';

/**
 * Locale Dialog Configuration
 */
export type TLocaleDialogConfig = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Hook Configuration
 */
export type TUseLocaleDialogConfig = Pick<TLocaleDialogConfig, 'onOpenChange'>;

/**
 * Country Option Configuration
 */
export type TCountryOptionConfig = {
  code: TCountryCode;
  name: string;
  locale: string;
  isSelected: boolean;
  onClick: () => void;
};

/**
 * Region Section Configuration
 */
export type TRegionSectionConfig = {
  title: string;
  countries: TCountryCode[];
  selectedCountry: TCountryCode;
  onSelect: (code: TCountryCode) => void;
};
