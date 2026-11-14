export const CUSTOMER_FOOTER =
  'Você recebeu este e-mail porque fez um agendamento pelo ServiceSnap.';

export const CODE_FOOTER =
  'Nunca pedimos este código por telefone ou mensagem.';

/** Mesma validade de `generateAuthCode`. */
export const LOGIN_CODE_MINUTES = 20;

export const storeFooter = (storeName: string) =>
  `Você recebeu este aviso porque atende em ${storeName}.`;

export const campaignFooter = (storeName: string) =>
  `Você recebeu este e-mail porque já foi atendido em ${storeName}, que usa o ServiceSnap para agendamentos.`;

/** Nome no "De:" sem os caracteres que quebram o cabeçalho do e-mail. */
export const toSenderName = (name: string) =>
  name
    .replace(/[<>"\\,;:@\r\n]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60) || 'Loja';
