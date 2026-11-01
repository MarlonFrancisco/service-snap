import { TCurrencyCode } from '@repo/shared/constants';

export interface IPlan {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  popular: boolean;
  features: string[];
  interval: 'month' | 'year';
  discount: number;
  trialPeriodDays: number;
  currency: TCurrencyCode;
}

export interface IInvoice {
  id: string;
  date: Date;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'uncollectible' | 'open' | 'draft';
  invoiceNumber: string;
  pdfUrl: string;
}

export interface IMySubscription {
  cancelAtPeriodEnd: boolean;
  planId: string;
  planName: string;
  planDescription: string;
  price: number;
  currency: TCurrencyCode;
  billingPeriod: 'month' | 'year';
  features: {
    DISPLAY_ORDER: number;
    IS_RECOMMENDED: boolean;
    PRO_LIMIT: number;
    RANK_TIER: 'TIER_1' | 'TIER_2' | 'TIER_3';
    SCHEDULE_LIMIT: number;
    SMS_REMINDER: boolean;
    UNIT_LIMIT: number;
    WHATSAPP_INTEGRATION: boolean;
    DASHBOARD_GENERAL_ACCESS: boolean;
    DASHBOARD_SALES_ACCESS: boolean;
    DASHBOARD_OPERATIONAL_ACCESS: boolean;
    DASHBOARD_CUSTOMERS_ACCESS: boolean;
  };
  subscriptionStatus: 'active' | 'inactive';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  nextBillingDate: Date;
  invoices: IInvoice[];
  isActive: boolean;
  marketingFeatures: string[];
  schedulesLength: number;
  storesLength: number;
  storeMembersLength: number;
}

export type IPlansResponse = {
  month: IPlan[];
  year: IPlan[];
};

export type TCheckoutSessionStatus =
  | 'active'
  | 'processing'
  | 'pending'
  | 'invalid';
