export type TBookingStep =
  | 'services'
  | 'professional'
  | 'datetime'
  | 'checkout';

export type TBookingSummaryConfig = {
  totalPrice: number;
  totalDuration: number;
  currentStep: TBookingStep;
};

export type TBookingAdvanceConfig = {
  nextButtonText: string;
  isNextDisabled: boolean;
  onNext: () => void;
};

export interface IProfessional {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  specialties: string[];
  availableServices: string[];
}

export interface IBookingFlowConfig {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessImages: string[];
  businessRating?: number;
  businessReviewCount?: number;
  businessCategory?: string;
  businessDescription?: string;
}

export interface ITimeSlot {
  time: string;
  available: boolean;
  price?: number;
}

export interface ICheckoutStep {
  id: TBookingStep;
  title: string;
  description: string;
  number: number;
}
