/** O que a página mostra: pedir a confirmação, já saiu, link inválido ou falha. */
export type TWhatsappOptOutState =
  | 'loading'
  | 'confirm'
  | 'done'
  | 'expired'
  | 'error';

export type TWhatsappOptOutPageConfig = {
  token: string;
};
