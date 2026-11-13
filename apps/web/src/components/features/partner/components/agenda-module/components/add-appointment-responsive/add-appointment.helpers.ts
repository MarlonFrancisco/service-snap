import { isApiHttpError } from '@/service/api';

export function addMinutesToTime(time: string, minutesToAdd: number): string {
  const [hourStr, minuteStr] = time.split(':');
  const baseMinutes =
    Number.parseInt(hourStr ?? '0', 10) * 60 +
    Number.parseInt(minuteStr ?? '0', 10);
  const totalMinutes = baseMinutes + minutesToAdd;

  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/** 90 → "1h30", como no resumo. */
export const formatTotalDuration = (minutes: number) =>
  `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, '0')}`;

/** 30 → "30min", 90 → "1h30". */
export const formatServiceDuration = (minutes: number) =>
  minutes < 60 ? `${minutes}min` : formatTotalDuration(minutes);

/** Dia local de hoje em `YYYY-MM-DD` (o `toISOString` vira o dia no fuso UTC). */
export const getTodayKey = (now: Date = new Date()) =>
  [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');

const API_ERROR_MESSAGES: Record<string, string> = {
  'Professional does not perform the requested service':
    'Este profissional não faz um dos serviços escolhidos. Escolha outro profissional.',
  'Customer not found in this store':
    'Este cliente não é da loja. Busque de novo ou cadastre como cliente novo.',
  'Customer contact is required': 'Informe o telefone do cliente.',
  'Service not found in this store':
    'Um dos serviços não existe mais nesta loja. Feche e abra de novo.',
  'Professional not found in this store':
    'Este profissional não está mais na equipe. Escolha outro.',
};

/** Erro da API em uma frase para a equipe. */
export const getCreateAppointmentErrorMessage = (error: unknown) => {
  if (!isApiHttpError(error)) {
    return 'Não foi possível criar o agendamento. Verifique a conexão e tente de novo.';
  }

  if (error.status === 409) {
    return 'Este profissional já tem um agendamento neste horário. Escolha outro horário.';
  }

  if (error.status === 403) {
    return 'Você só pode agendar na sua própria agenda.';
  }

  return (
    API_ERROR_MESSAGES[error.message] ??
    'Não foi possível criar o agendamento. Confira os dados e tente de novo.'
  );
};
