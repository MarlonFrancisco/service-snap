export type TAgendaDayStripItem = {
  index: number;
  label: string;
  day: number;
  isToday: boolean;
  isWorkingDay: boolean;
  isSelected: boolean;
};

export type TAgendaDayStripConfig = {
  days: TAgendaDayStripItem[];
  variant: 'pill' | 'card';
  onSelect: (dayIndex: number) => void;
};
