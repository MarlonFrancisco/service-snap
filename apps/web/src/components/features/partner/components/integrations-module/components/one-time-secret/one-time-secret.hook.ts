'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { TUseCopyToClipboardConfig } from './one-time-secret.types';

const COPIED_FEEDBACK_MS = 2000;

export const useCopyToClipboard = ({
  successMessage = 'Copiado',
}: TUseCopyToClipboardConfig = {}) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;

    const timeout = setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_MS);

    return () => clearTimeout(timeout);
  }, [isCopied]);

  const copy = useCallback(
    async (value: string) => {
      try {
        await navigator.clipboard.writeText(value);
        setIsCopied(true);
        toast.success(successMessage);
      } catch {
        toast.error('Não foi possível copiar. Selecione o texto e copie.');
      }
    },
    [successMessage],
  );

  return { copy, isCopied };
};
