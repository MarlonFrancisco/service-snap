/** Arquivo com tudo o que o ServiceSnap guarda do usuário (LGPD). */
export type TUserDataExport = {
  exportedAt: string;
} & Record<string, unknown>;

/** Corpo do 409 de quem ainda tem assinatura ativa. */
export type TDeleteAccountConflict = {
  statusCode: 409;
  code: 'ACCOUNT_HAS_ACTIVE_SUBSCRIPTION';
  message: string;
};
