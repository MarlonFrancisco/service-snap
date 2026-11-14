/** Template do lembrete aprovado na loja; `null` quando nenhum pode sair. */
export type TStoreReminderTemplate = {
  name: string;
  /** O template novo pergunta se o cliente vem e leva os botões de resposta. */
  withConfirmation: boolean;
};
