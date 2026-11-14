/** Soma de valores em reais sem o erro de ponto flutuante (0,1 + 0,2). */
export const sumMoney = (values: Array<number | null | undefined>) =>
  Math.round(values.reduce((total, value) => total + (value ?? 0) * 100, 0)) /
  100;

export const roundMoney = (value: number) => Math.round(value * 100) / 100;

/**
 * Reparte `total` na proporção de `weights`, em centavos: a soma das partes dá
 * exatamente o total (a sobra do arredondamento vai para a última).
 */
export const splitMoney = (total: number, weights: number[]): number[] => {
  if (!weights.length) return [];

  const cents = Math.round(total * 100);
  const sum = weights.reduce((acc, weight) => acc + weight, 0);
  const shares = weights.map((weight) =>
    Math.floor(sum > 0 ? (cents * weight) / sum : cents / weights.length),
  );
  shares[shares.length - 1] += cents - shares.reduce((a, b) => a + b, 0);

  return shares.map((share) => share / 100);
};
