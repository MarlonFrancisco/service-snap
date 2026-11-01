import { ICheckoutStep } from './booking.types';

export const STEPS = [
  {
    id: 'services',
    title: 'Serviços',
    description: 'Escolha os serviços',
    number: 1,
  },
  {
    id: 'professional',
    title: 'Profissional',
    description: 'Selecione quem atende',
    number: 2,
  },
  {
    id: 'datetime',
    title: 'Data e hora',
    description: 'Defina quando',
    number: 3,
  },
  {
    id: 'checkout',
    title: 'Confirmação',
    description: 'Finalize seu agendamento',
    number: 4,
  },
] as ICheckoutStep[];
