import type { IService } from '@/types/api/service.types';
import type { TProfessionalFormSchema } from './add-professional.schema';

export type TProfessionalFormFieldsConfig = {
  isEditing: boolean;
  services: IService[];
  selectedServices: TProfessionalFormSchema['services'];
  addService: (serviceId: string) => void;
  removeService: (serviceId: string) => void;
};
