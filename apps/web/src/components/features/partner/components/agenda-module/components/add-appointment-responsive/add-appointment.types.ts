import type { TAddAppointmentSchema } from './add-appointment.schema';

export type TCustomerMode = TAddAppointmentSchema['customerMode'];

/** Cliente da loja como aparece na busca do formulário. */
export type TCustomerOption = {
  id: string;
  name: string;
  contact: string;
};

export type TServiceOption = {
  id: string;
  name: string;
  durationLabel: string;
  priceLabel: string;
  isSelected: boolean;
};

export type TProfessionalOption = {
  id: string;
  name: string;
};

export type TTimeOption = {
  time: string;
  isSelected: boolean;
};

export type TAppointmentSummaryService = {
  id: string;
  name: string;
  priceLabel: string;
};

export type TAppointmentSummaryData = {
  customerName: string;
  customerContact: string;
  services: TAppointmentSummaryService[];
  professionalName: string;
  dateTimeLabel: string;
  durationLabel: string;
  totalLabel: string;
};
