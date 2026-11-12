/** Fechado, digitando o e-mail novo ou digitando o código recebido. */
export type TEmailChangeStep = 'closed' | 'email' | 'code';

/** Mensagem para a pessoa e se ainda dá para digitar o código. */
export type TEmailChangeFeedback = {
  message: string;
  /** O pedido foi gravado mesmo sem o envio: segue para o código. */
  canEnterCode: boolean;
};

export type TEmailChangeNotice = {
  tone: 'info' | 'warning';
  message: string;
};
