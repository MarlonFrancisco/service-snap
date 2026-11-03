import type { IMySubscription } from '@/types/api';
import type { ReactNode } from 'react';

export type TPlanFeatures = IMySubscription['features'];

export type TPlanFeatureFlag = keyof Pick<
  TPlanFeatures,
  | 'DASHBOARD_GENERAL_ACCESS'
  | 'DASHBOARD_SALES_ACCESS'
  | 'DASHBOARD_OPERATIONAL_ACCESS'
  | 'DASHBOARD_CUSTOMERS_ACCESS'
  | 'WHATSAPP_INTEGRATION'
>;

export type TLockedModuleId =
  | 'home'
  | 'sales'
  | 'operational'
  | 'customers'
  | 'whatsappReminders'
  | 'whatsappIntegration';

export type TLockedModulePreview = 'metrics' | 'chart' | 'heatmap' | 'form';

export type TLockedModule = {
  /** Todas precisam estar no plano para o módulo abrir. */
  requires: readonly TPlanFeatureFlag[];
  title: string;
  /** Depois de "Você está no plano X." */
  lead: string;
  benefits: readonly string[];
  preview: TLockedModulePreview;
  /** Linha extra depois do preço, ex.: quem paga as mensagens da Meta. */
  priceNote?: string;
};

export type TPlanFeatureGateConfig = {
  module: TLockedModuleId;
  children: ReactNode;
};

export type TUsePlanFeatureGateConfig = Pick<TPlanFeatureGateConfig, 'module'>;

export type TLockedModulePreviewConfig = {
  variant: TLockedModulePreview;
};
