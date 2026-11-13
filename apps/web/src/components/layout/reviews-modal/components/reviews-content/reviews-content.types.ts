export type TReviewsContentConfig = Record<string, never>;

/** O que o bloco "Compartilhe sua opinião" mostra no lugar do botão. */
export type TReviewsShareState =
  | 'logged-out'
  | 'loading'
  | 'reviewable'
  | 'not-served';
