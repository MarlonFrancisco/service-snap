const BRAZIL_PREFIX = '+55';

/** `+5511900000004` → `(11) 90000-0004`; outros países ficam como vieram. */
export const formatProfilePhone = (telephone?: string | null) => {
  if (!telephone) return '';

  const isBrazilian =
    telephone.startsWith(BRAZIL_PREFIX) || !telephone.startsWith('+');
  if (!isBrazilian) return telephone;

  const digits = telephone.replace(/\D/g, '');
  const national = telephone.startsWith(BRAZIL_PREFIX)
    ? digits.slice(2)
    : digits;

  if (national.length === 11) {
    return `(${national.slice(0, 2)}) ${national.slice(2, 7)}-${national.slice(7)}`;
  }
  if (national.length === 10) {
    return `(${national.slice(0, 2)}) ${national.slice(2, 6)}-${national.slice(6)}`;
  }
  return telephone;
};
