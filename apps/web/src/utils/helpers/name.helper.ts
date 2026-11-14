/** "Nome Sobrenome", sem o sobrenome quando ele vem vazio ou nulo do banco. */
export const getFullName = (
  firstName?: string | null,
  lastName?: string | null,
): string => [firstName, lastName].filter(Boolean).join(' ');
