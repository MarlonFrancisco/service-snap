export type TCheckoutStatus = 'invalid' | 'validating' | 'success';

export type TCheckoutLoadingStep = {
  message: string;
  duration: number;
};

export type TCheckoutNextStep = {
  title: string;
  description: string;
};
