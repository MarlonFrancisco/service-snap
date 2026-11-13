import type { TWeekDay } from '@/types/api/users.types';
import type { IService } from '@/types/api/service.types';
import type { TProfessionalFormSchema } from './add-professional.schema';

export type TProfessionalFormFieldsConfig = {
  isEditing: boolean;
  services: IService[];
  selectedServices: TProfessionalFormSchema['services'];
  addService: (serviceId: string) => void;
  removeService: (serviceId: string) => void;
};

export type TProfessionalIdentityFieldsConfig = Pick<
  TProfessionalFormFieldsConfig,
  'isEditing'
>;

export type TProfessionalRoleFieldConfig = {
  /** Só o dono da loja dá (ou tira) o papel de sócio. */
  canGrantOwner: boolean;
};

export type TProfessionalServicesFieldConfig = Omit<
  TProfessionalFormFieldsConfig,
  'isEditing'
>;

export type TProfessionalModalTab = 'data' | 'services' | 'hours';

/** Horário da loja que o profissional herda e não pode abrir além. */
export type TStoreHoursReference = {
  openTime: string;
  closeTime: string;
  lunchStartTime?: string | null;
  lunchEndTime?: string | null;
  businessDays?: Partial<Record<TWeekDay, boolean>>;
};

export type TProfessionalHoursRow = {
  index: number;
  day: TWeekDay;
  label: string;
  switchLabel: string;
  offLabel: string;
  isStoreClosed: boolean;
  isWorking: boolean;
  error?: string;
};
