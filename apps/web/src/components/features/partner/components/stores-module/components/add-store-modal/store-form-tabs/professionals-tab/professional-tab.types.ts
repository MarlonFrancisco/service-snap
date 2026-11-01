import type { IProfessional } from '@/types/api';

export type TProfessionalCardConfig = {
  professional: IProfessional;
  onEdit: (professional: IProfessional) => void;
  onToggleStatus: (professional: IProfessional) => void;
  onRemove: (professional: IProfessional) => void;
};
