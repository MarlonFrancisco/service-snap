import type { TTimeOption } from '../add-appointment.types';

export type TAppointmentTimeFieldConfig = {
  options: TTimeOption[];
  onSelect: (time: string) => void;
  isFitIn: boolean;
  onFitInToggle: () => void;
  fitInTime: string;
  onFitInTimeChange: (value: string) => void;
  /** Serviço, profissional e data escolhidos: dá para pedir os horários. */
  canLoad: boolean;
  isLoading: boolean;
  isError: boolean;
  timeError?: string;
  fitInError?: string;
};
