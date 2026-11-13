import type {
  TReviewsEmptyState,
  TReviewsFilter,
  TReviewsFilterOption,
} from './reviews-module.types';

export const REVIEWS_PAGE_SIZE = 10;

export const REVIEW_REPLY_MAX_LENGTH = 1000;

export const REVIEWS_DEFAULT_FILTER: TReviewsFilter = 'unanswered';

export const REVIEWS_FILTER_OPTIONS: TReviewsFilterOption[] = [
  { value: 'unanswered', label: 'Sem resposta' },
  { value: 'answered', label: 'Respondidas' },
  { value: 'all', label: 'Todas' },
];

export const REVIEWS_NO_REVIEWS_STATE: TReviewsEmptyState = {
  title: 'Nenhuma avaliação ainda',
  description:
    'Quando um cliente atendido avaliar a loja, a avaliação aparece aqui.',
};

export const REVIEWS_EMPTY_FILTER_STATE: Record<
  TReviewsFilter,
  TReviewsEmptyState
> = {
  unanswered: {
    title: 'Tudo respondido',
    description: 'Nenhuma avaliação está esperando a sua resposta.',
  },
  answered: {
    title: 'Nenhuma resposta publicada',
    description: 'As avaliações que você responder aparecem aqui.',
  },
  all: REVIEWS_NO_REVIEWS_STATE,
};

export const REVIEW_LEGACY_LABEL =
  'Avaliação anterior à verificação de atendimento';

export const REVIEW_REPLY_FORBIDDEN_MESSAGE =
  'Só o dono ou o gerente da loja respondem avaliações';
