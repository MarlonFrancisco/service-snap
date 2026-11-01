import type { TAuthStepChange } from '../../auth.types';

export type TLoginStepConfig = {
  onNext: TAuthStepChange;
  onClose: () => void;
};

export type TUseLoginStepConfig = Pick<TLoginStepConfig, 'onNext'>;
