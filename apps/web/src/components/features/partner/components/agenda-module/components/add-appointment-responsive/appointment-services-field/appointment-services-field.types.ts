import type { TServiceOption } from '../add-appointment.types';

export type TAppointmentServicesFieldConfig = {
  options: TServiceOption[];
  onToggle: (serviceId: string) => void;
  error?: string;
};
