type TQueryValue = string | number | undefined;

/** `?page=1&from=...` sem os filtros vazios. */
export const toQueryString = (params: Record<string, TQueryValue>) => {
  const search = new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([key, value]) => [key, String(value)]),
  );

  return search.size ? `?${search}` : '';
};
