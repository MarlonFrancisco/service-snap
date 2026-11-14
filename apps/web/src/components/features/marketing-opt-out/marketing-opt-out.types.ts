/** O que a página mostra: pedir a confirmação, já saiu, link inválido ou falha. */
export type TMarketingOptOutState =
  | 'loading'
  | 'confirm'
  | 'done'
  | 'expired'
  | 'error';

export type TMarketingOptOutPageConfig = {
  token: string;
};
