import { isApiHttpError } from '@/service/api';
import type { IWaitlistEntry } from '@/types/api/waitlist.types';
import type { TWaitlistEntryMatch } from '../waitlist-notice.types';

/** A fila aberta do cliente para o dia, o serviço e o profissional da tela. */
export const findWaitlistEntry = (
  entries: IWaitlistEntry[] | undefined,
  { date, serviceId, storeMemberId }: TWaitlistEntryMatch,
) =>
  entries?.find(
    (entry) =>
      entry.status === 'waiting' &&
      entry.date.slice(0, 10) === date &&
      entry.service.id === serviceId &&
      (entry.storeMember?.id ?? null) === (storeMemberId ?? null),
  );

/** Ex.: "Entre na lista de espera e avisamos por e-mail se vagar um horário com Rafael Lima." */
export const buildJoinDescription = ({
  professionalName,
  serviceName,
}: {
  professionalName?: string;
  /** Só com mais de um serviço no carrinho: a fila vale para o primeiro. */
  serviceName?: string;
}) =>
  [
    'Entre na lista de espera e avisamos por e-mail se vagar um horário',
    serviceName && ` para ${serviceName}`,
    professionalName && ` com ${professionalName}`,
    '.',
  ]
    .filter(Boolean)
    .join('');

/** Para onde vai o aviso de vaga. */
export const buildNotifyText = ({
  channel,
  email,
}: {
  channel: IWaitlistEntry['channel'];
  email?: string;
}) => {
  if (channel === 'whatsapp') return 'Avisamos pelo WhatsApp se vagar.';
  return email
    ? `Avisamos em ${email} se vagar.`
    : 'Avisamos por e-mail se vagar.';
};

/** 409: o dia tem horário livre para o serviço da fila. */
export const isFreeSlotError = (error: unknown) =>
  isApiHttpError(error) && error.status === 409;

/**
 * Com vários serviços, a fila olha só o primeiro: ele pode caber no dia sem
 * caber o conjunto, e os horários atualizados continuam cheios.
 */
export const getFreeSlotMessage = ({
  serviceName,
  hasMultipleServices,
}: {
  serviceName: string;
  hasMultipleServices: boolean;
}) =>
  hasMultipleServices
    ? `Há horário livre para ${serviceName} neste dia, mas não para todos os serviços juntos. Escolha outro dia.`
    : 'Vagou um horário neste dia. Escolha abaixo.';

const JOIN_ERROR_MESSAGES: readonly { match: string; message: string }[] = [
  {
    match: 'waitlists per store',
    message:
      'Você já está em 5 listas de espera nesta loja. Saia de uma para entrar em outra.',
  },
  {
    match: 'closed on this day',
    message: 'Não há horário que possa vagar neste dia. Escolha outro dia.',
  },
  {
    match: 'Choose a day',
    message: 'Escolha um dia entre hoje e os próximos 60 dias.',
  },
];

/** A API responde em inglês: traduz os 400 conhecidos. */
export const getWaitlistJoinErrorMessage = (error: unknown) => {
  const apiMessage = isApiHttpError(error) ? error.message : '';
  return (
    JOIN_ERROR_MESSAGES.find(({ match }) => apiMessage.includes(match))
      ?.message ??
    'Não foi possível entrar na lista de espera. Tente novamente.'
  );
};
