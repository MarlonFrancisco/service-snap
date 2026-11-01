export type TAuthStep =
  | 'login'
  | 'verification'
  | 'signup'
  | 'profile-selection';

export type UserType = 'client' | 'provider';

export type TAuthUserData = {
  email: string;
  phone: string;
  name: string;
  isNewUser: boolean;
};

export type TAuthStepChange = (
  step: TAuthStep,
  data?: Partial<TAuthUserData>,
) => void | Promise<void>;
