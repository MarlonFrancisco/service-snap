/**
 * Identificador que o Next dá a erros do servidor: casa a tela com o log. A
 * mensagem do erro nunca vai para a tela nem para o analytics.
 */
export const getErrorDigest = (error: unknown): string | undefined => {
  if (!(error instanceof Error) || !('digest' in error)) return undefined;

  return typeof error.digest === 'string' ? error.digest : undefined;
};
