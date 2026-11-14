import { isApiHttpError } from '@/service/api/http-error';
import type { IReview } from '@/types/reviews.types';

const MAX_STARS = 5;

/** Datas sem horário (`YYYY-MM-DD`) não passam por `Date`: o dia não muda com o fuso. */
const splitDateOnly = (value: string) => {
  const [year, month, day] = value.slice(0, 10).split('-');
  return { year, month, day };
};

/** `2026-11-04` → `04/11`. */
export const formatDayMonth = (value: string) => {
  const { month, day } = splitDateOnly(value);
  return day && month ? `${day}/${month}` : value;
};

/** Timestamp ISO → `dd/mm/aaaa` no fuso de quem lê. */
export const formatReviewDate = (value: string) =>
  new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

export const formatStars = (rating: number) => {
  const filled = Math.max(0, Math.min(MAX_STARS, Math.round(rating)));
  return '★'.repeat(filled) + '☆'.repeat(MAX_STARS - filled);
};

export const getStarsLabel = (rating: number) =>
  `${rating} de ${MAX_STARS} estrelas`;

export const getReviewAuthorName = ({ user }: IReview) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Cliente';

/** "Atendido em dd/mm · Serviço", com o profissional quando pedido. */
export const getReviewScheduleLabel = (
  { schedule }: IReview,
  { withProfessional = false } = {},
) => {
  if (!schedule) return null;

  const professional = schedule.storeMember?.user?.firstName;
  return [
    `Atendido em ${formatDayMonth(schedule.date)}`,
    schedule.service?.name,
    withProfessional && professional ? `com ${professional}` : undefined,
  ]
    .filter(Boolean)
    .join(' · ');
};

export const getHttpStatus = (error: unknown) =>
  isApiHttpError(error) ? error.status : undefined;

export const getCreateReviewErrorMessage = (error: unknown) => {
  switch (getHttpStatus(error)) {
    case 403:
      return 'Só quem foi atendido nesta loja pode avaliar, uma vez por atendimento.';
    case 409:
      return 'Este atendimento já foi avaliado.';
    default:
      return 'Não foi possível enviar sua avaliação. Tente de novo.';
  }
};
