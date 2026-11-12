import type { TBookingConfirmation } from '../../booking.types';

export type TCheckoutStepConfig = {
  /** Chamado com o resumo da reserva quando a API confirma. */
  onConfirmed: (confirmation: TBookingConfirmation) => void;
};
