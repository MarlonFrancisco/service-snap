/** `a@x.com, b@y.com` → conjunto em minúsculas; vazio não libera ninguém. */
export const parseAdminEmails = (value?: string | null): Set<string> =>
  new Set(
    (value ?? '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );

/** `%` e `_` digitados viram texto, não curinga do ILIKE. */
export const toLikePattern = (search?: string) =>
  search?.trim()
    ? `%${search.trim().replace(/[\\%_]/g, (char) => `\\${char}`)}%`
    : null;

export const toPage = (page?: string | number, limit?: string | number) => {
  const take = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const current = Math.max(Number(page) || 1, 1);

  return { skip: (current - 1) * take, take, page: current };
};
