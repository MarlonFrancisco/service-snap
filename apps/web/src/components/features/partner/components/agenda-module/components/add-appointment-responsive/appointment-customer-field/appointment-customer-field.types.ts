import type { Control } from 'react-hook-form';
import type { TAddAppointmentSchema } from '../add-appointment.schema';
import type { TCustomerMode, TCustomerOption } from '../add-appointment.types';

export type TAppointmentCustomerFieldConfig = {
  control: Control<TAddAppointmentSchema>;
  mode: TCustomerMode;
  canUseStoreCustomers: boolean;
  onModeChange: (mode: TCustomerMode) => void;
  search: string;
  onSearchChange: (value: string) => void;
  options: TCustomerOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  isSearching: boolean;
  isSearchError: boolean;
  error?: string;
};
