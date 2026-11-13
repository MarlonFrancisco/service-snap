import type { TWeekDay } from '@/types/api/users.types';
import type { TProfessionalModalTab } from './add-professional-modal.types';

/** Segunda a domingo, a ordem da semana de trabalho. */
export const WEEK_DAY_KEYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const satisfies readonly TWeekDay[];

export const WEEK_DAY_LABELS: Record<
  TWeekDay,
  { label: string; offLabel: string; ariaLabel: string }
> = {
  monday: { label: 'Segunda', offLabel: 'às segundas', ariaLabel: 'na segunda' },
  tuesday: { label: 'Terça', offLabel: 'às terças', ariaLabel: 'na terça' },
  wednesday: { label: 'Quarta', offLabel: 'às quartas', ariaLabel: 'na quarta' },
  thursday: { label: 'Quinta', offLabel: 'às quintas', ariaLabel: 'na quinta' },
  friday: { label: 'Sexta', offLabel: 'às sextas', ariaLabel: 'na sexta' },
  saturday: { label: 'Sábado', offLabel: 'aos sábados', ariaLabel: 'no sábado' },
  sunday: { label: 'Domingo', offLabel: 'aos domingos', ariaLabel: 'no domingo' },
};

export const PROFESSIONAL_MODAL_TABS: readonly {
  value: TProfessionalModalTab;
  label: string;
}[] = [
  { value: 'data', label: 'Dados' },
  { value: 'services', label: 'Serviços' },
  { value: 'hours', label: 'Horário' },
];

export const HOURS_MODE_OPTIONS = [
  {
    value: 'store',
    label: 'Seguir o horário da loja',
    description: 'Atende em todos os dias e horários em que a loja abre.',
  },
  {
    value: 'custom',
    label: 'Horário próprio',
    description:
      'Defina dias e horários. Dias em que a loja fecha continuam fechados.',
  },
] as const;
