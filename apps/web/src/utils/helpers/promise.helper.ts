/**
 * Race a promise against a time budget. Resolves with the promise result if
 * it finishes in time; otherwise `undefined`. Errors are swallowed so SSR
 * shells are never blocked by a failing/slow dependency.
 */
export async function withBudget<T>(
  promise: Promise<T>,
  ms: number,
): Promise<T | undefined> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<undefined>((resolve) => {
        timer = setTimeout(() => resolve(undefined), ms);
      }),
    ]);
  } catch {
    return undefined;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
