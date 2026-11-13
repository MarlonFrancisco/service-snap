import type { TAppointmentSummaryData } from '../add-appointment.types';

export type TAppointmentSummaryConfig = {
  summary: TAppointmentSummaryData;
  submitError: string | null;
  isSubmitting: boolean;
  onCancel: () => void;
};
