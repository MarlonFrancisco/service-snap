import type { TAuthStepChange } from '../../auth.types';

export type TVerificationStepConfig = {
  contact: string;
  onNext: TAuthStepChange;
  onBack: () => void;
};

export type TUseVerificationStepConfig = Pick<
  TVerificationStepConfig,
  'contact' | 'onNext'
>;
