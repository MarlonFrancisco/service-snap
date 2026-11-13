import { isUUID } from 'class-validator';
import { slugify } from '../../../utils/helpers/format.helpers';

/** Link curto da loja: minúsculas, números e hífen, sem hífen nas pontas. */
export const STORE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** O endereço antigo usa o id; o novo, o slug. */
export const isStoreId = (value: string) => isUUID(value);

/**
 * Opções de slug em ordem: o nome, o nome com a cidade e depois com número.
 * Quem chama fica com a primeira livre.
 */
export function buildSlugCandidates(
  name: string | null | undefined,
  city?: string | null,
): string[] {
  const base = slugify(name ?? '');

  if (base.length < 3) return [];

  const withCity = city ? slugify(`${name} ${city}`) : null;
  const numbered = Array.from({ length: 20 }, (_, index) =>
    `${base.slice(0, 56)}-${index + 2}`,
  );

  return [...new Set([base, withCity, ...numbered].filter(Boolean))];
}
