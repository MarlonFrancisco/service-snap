import type { IAppointment } from '@/types/api/schedule.types';

export type TCheckoutStepConfig = {
  /** Substitui a ida para o perfil depois de confirmar (usado no widget). */
  onBooked?: (appointments: IAppointment[]) => void;
};
