'use client';

import { ErrorPage } from '@/components/layout/error-page';

/** Erro em qualquer página: o layout raiz continua de pé, só o conteúdo troca. */
export default function RootError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return <ErrorPage error={error} retry={retry} />;
}
