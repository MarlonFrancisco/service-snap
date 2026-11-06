import { useAnalytics } from '@/providers/analytics.provider';
import { useAuthStore } from '@/store/auth/auth.store';
import { useLocaleStore } from '@/store/locale';
import type { TCountryCode } from '@repo/shared/constants';
import {
  formatPhone,
  getPhoneCodeOptions,
  getPhoneFormat,
  getPhonePlaceholder,
  isValidPhoneLength,
  normalizePhone,
} from '@repo/shared/validators';
import { getStoredReferralCode } from '@/utils/helpers/referral.helper';
import { useMemo, useState } from 'react';
import type {
  TSignupFormData,
  TUseSignupStepConfig,
} from './signup-step.types';

const phoneCodeOptions = getPhoneCodeOptions();

export const useSignupStep = ({ userData, onNext }: TUseSignupStepConfig) => {
  const localeCountry = useLocaleStore((state) => state.country);
  const [phoneCountry, setPhoneCountry] = useState<TCountryCode>(
    localeCountry || 'BR',
  );
  const [formData, setFormData] = useState<TSignupFormData>({
    firstName: '',
    lastName: '',
    email: userData.email,
    telephone: userData.phone ? formatPhone(userData.phone, phoneCountry) : '',
    acceptedTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const registerAction = useAuthStore((state) => state.registerAction);
  const onAuth = useAuthStore((state) => state.onAuth);
  const analytics = useAnalytics();

  const contact = userData.email || userData.phone;
  const isEmail = Boolean(userData.email?.includes('@'));

  const phoneMask = useMemo(() => getPhoneFormat(phoneCountry), [phoneCountry]);
  const phonePlaceholder = useMemo(
    () => getPhonePlaceholder(phoneCountry),
    [phoneCountry],
  );

  const handleInputChange = <TField extends keyof TSignupFormData>(
    field: TField,
    value: TSignupFormData[TField],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCountryChange = (code: string) => {
    const next = code as TCountryCode;
    setPhoneCountry(next);
    setFormData((prev) => ({
      ...prev,
      telephone: formatPhone(prev.telephone, next),
    }));
  };

  const isTelephoneValid = isEmail
    ? isValidPhoneLength(formData.telephone, phoneCountry)
    : Boolean(userData.phone || formData.telephone.trim());

  const isFormValid =
    formData.firstName.trim().length >= 2 &&
    formData.lastName.trim().length >= 2 &&
    (isEmail
      ? Boolean(userData.email)
      : formData.email.trim().includes('@')) &&
    isTelephoneValid &&
    formData.acceptedTerms;

  const handleContinue = async () => {
    if (!isFormValid) return;

    setIsLoading(true);

    const telephone = isEmail
      ? normalizePhone(formData.telephone, phoneCountry)
      : userData.phone || normalizePhone(formData.telephone, phoneCountry);

    // Lido antes do cadastro: o registerAction limpa o código salvo
    const hasReferral = Boolean(getStoredReferralCode());

    try {
      await registerAction({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        acceptedTerms: formData.acceptedTerms,
        email: isEmail ? userData.email : formData.email.trim(),
        telephone,
      });
    } catch (error) {
      analytics.track('sign_up_failed', { method: 'email' });
      throw error;
    }

    analytics.track('sign_up', { method: 'email', has_referral: hasReferral });

    setIsLoading(false);

    if (userData.isNewUser) {
      onNext('profile-selection', {
        ...userData,
        phone: telephone,
        name: `${formData.firstName} ${formData.lastName}`,
        isNewUser: true,
      });
    } else {
      onAuth?.();
    }
  };

  return {
    contact,
    isEmail,
    formData,
    isLoading,
    isFormValid,
    phoneCountry,
    phoneCodeOptions,
    phoneMask,
    phonePlaceholder,
    handleInputChange,
    handleCountryChange,
    handleContinue,
  };
};
