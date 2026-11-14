'use client';

import { useCallback } from 'react';
import { useCustomersAccess } from '../../../customers-module/customers-module.hook';

/** Chaves e webhooks são só de dono e gerente (a API devolve 403 aos demais). */
export const useIntegrations = () => {
  const { storeId, storeState, isProfessional } = useCustomersAccess();

  // A lista de lojas falhou: recarregar refaz a leitura do painel inteiro
  const handleRetry = useCallback(() => window.location.reload(), []);

  return { storeId, storeState, hasNoAccess: isProfessional, handleRetry };
};
