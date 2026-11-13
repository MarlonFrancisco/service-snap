import type { TSeriesIntervalWeeks } from '@/types/api/schedule-series.types';
import type {
  TSeriesIntervalOption,
  TSeriesPreviewItem,
} from '../../schedule-series-module.types';

/** Seção "Repetir" do agendamento manual. */
export type TAppointmentRepeatConfig = {
  isEnabled: boolean;
  onToggle: (isEnabled: boolean) => void;
  intervalWeeks: TSeriesIntervalWeeks;
  intervalOptions: TSeriesIntervalOption[];
  onIntervalChange: (value: string) => void;
  /** Texto do campo, para deixar apagar enquanto digita. */
  occurrences: string;
  onOccurrencesChange: (value: string) => void;
  maxOccurrences: number;
  occurrencesError?: string;
  preview: TSeriesPreviewItem[];
};

export type TUseAppointmentRepeatConfig = {
  storeId: string;
  isOpen: boolean;
  serviceIds: string[];
  storeMemberId: string;
  /** Primeira data, `YYYY-MM-DD`. */
  date: string;
  /** Horário escolhido (da lista ou do encaixe), `HH:MM`. */
  time: string;
  isFitIn: boolean;
  durationMinutes: number;
  professionalName: string;
  /** Volta ao formulário com esta data, sem repetir, para outro horário. */
  onPickAnotherTime: (date: string) => void;
  onClose: () => void;
};
