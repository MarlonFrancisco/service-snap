import type { TAppointmentSummaryData } from '../add-appointment.types';

export type TAppointmentSummaryConfig = {
  summary: TAppointmentSummaryData;
  submitError: string | null;
  isSubmitting: boolean;
  /** Texto do botão quando repete ("Agendar 3 datas"); sem ele, o padrão. */
  submitLabel?: string | null;
  onCancel: () => void;
};
