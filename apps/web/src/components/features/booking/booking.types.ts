export type TBookingStep =
  | 'services'
  | 'professional'
  | 'datetime'
  | 'checkout';

/** O que a tela de confirmação mostra depois que a reserva foi criada. */
export type TBookingConfirmation = {
  /** Visita criada; serve de UID no calendário. */
  bookingId: string;
  /** YYYY-MM-DD */
  dateKey: string;
  startTime: string;
  endTime: string;
  services: {
    id: string;
    name: string;
    duration: number;
    price: number;
    quantity: number;
  }[];
  professionalName: string;
  totalPrice: number;
};

export type TBookingFlowConfig = {
  /** Versão compacta para o iframe do widget, sem header, vitrine e rodapé do site. */
  embedded?: boolean;
};

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
