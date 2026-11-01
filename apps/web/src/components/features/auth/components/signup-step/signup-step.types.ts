import type { TAuthStepChange, TAuthUserData } from '../../auth.types';

export type TSignupStepConfig = {
  userData: TAuthUserData;
  onNext: TAuthStepChange;
  onBack: () => void;
};

export type TUseSignupStepConfig = Pick<
  TSignupStepConfig,
  'userData' | 'onNext'
>;

export type TSignupFormData = {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  acceptedTerms: boolean;
};
