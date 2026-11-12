import { useAnalytics } from '@/providers/analytics.provider';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { getErrorDigest } from './error-page.helpers';
import type { TErrorPageConfig } from './error-page.types';

export const useErrorPage = ({ error, retry }: TErrorPageConfig) => {
  const analytics = useAnalytics();
  const pathname = usePathname();
  const digest = getErrorDigest(error);

  useEffect(() => {
    // Sem monitoramento de erros, o console do navegador é onde o erro aparece
    console.error(error);
    analytics.track('error_page_viewed', { path: pathname, digest });
  }, [analytics, digest, error, pathname]);

  const handleRetry = useCallback(() => {
    analytics.track('error_page_retry_clicked', { path: pathname, digest });
    retry();
  }, [analytics, digest, pathname, retry]);

  return { digest, handleRetry };
};
