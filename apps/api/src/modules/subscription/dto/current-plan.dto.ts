import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import type Stripe from 'stripe';
import {
  normalizeSubscriptionMetadata,
  resolvePlanSlug,
  type TPlanSlug,
} from '../../../utils';

export class InvoiceDto {
  @IsString()
  id: string;

  @IsDate()
  date: Date;

  @IsNumber()
  amount: number;

  @IsEnum(['paid', 'pending', 'failed', 'uncollectible', 'open', 'draft'])
  status: 'paid' | 'pending' | 'failed' | 'uncollectible' | 'open' | 'draft';

  @IsString()
  invoiceNumber: string;

  @IsString()
  pdfUrl: string | null;

  static fromStripe(invoice: Stripe.Invoice): InvoiceDto {
    const dto = new InvoiceDto();
    dto.id = invoice.id;
    dto.date = new Date(invoice.created * 1000);
    // Use amount_paid se pago, caso contrário use total
    dto.amount =
      (invoice.status === 'paid' ? invoice.amount_paid : invoice.total) / 100;
    dto.status = invoice.status as any;
    dto.invoiceNumber = invoice.number || '';
    dto.pdfUrl = invoice.invoice_pdf;
    return dto;
  }
}

export class CurrentPlanDto {
  @IsString()
  planId: string;

  @IsString()
  planName: string;

  @IsOptional()
  @IsString()
  planSlug: TPlanSlug | null;

  @IsString()
  planDescription: string;

  @IsNumber()
  price: number;

  @IsString()
  currency: string;

  @IsEnum(['month', 'year'])
  billingPeriod: 'month' | 'year';

  @IsArray()
  @IsString({ each: true })
  marketingFeatures: string[];

  @IsObject()
  features: {
    PRO_LIMIT: number;
    RANK_TIER: 'TIER_1' | 'TIER_2' | 'TIER_3';
    SMS_REMINDER: boolean;
    UNIT_LIMIT: number;
    WHATSAPP_INTEGRATION: boolean;
    DASHBOARD_GENERAL_ACCESS: boolean;
    DASHBOARD_SALES_ACCESS: boolean;
    DASHBOARD_OPERATIONAL_ACCESS: boolean;
    DASHBOARD_CUSTOMERS_ACCESS: boolean;
  };

  @IsString()
  subscriptionStatus: string;

  @IsDate()
  currentPeriodStart: Date;

  @IsDate()
  currentPeriodEnd: Date;

  @IsBoolean()
  cancelAtPeriodEnd: boolean;

  @IsDate()
  nextBillingDate: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceDto)
  invoices: InvoiceDto[];

  @IsBoolean()
  isActive: boolean;

  @IsNumber()
  schedulesLength: number;

  @IsNumber()
  storesLength: number;

  @IsNumber()
  storeMembersLength: number;

  static fromStripe(data: {
    product: Stripe.Product;
    price: Stripe.Price;
    subscription: Stripe.Subscription & {
      current_period_start?: number;
      current_period_end?: number;
    };
    invoices: Stripe.Invoice[];
    schedulesLength: number;
    storesLength: number;
    storeMembersLength: number;
    nextBillingDate: Date;
  }): CurrentPlanDto {
    const {
      product,
      price,
      subscription,
      invoices,
      schedulesLength,
      storesLength,
      storeMembersLength,
      nextBillingDate,
    } = data;

    const dto = new CurrentPlanDto();
    dto.planId = product.id;
    dto.planName = product.name;
    dto.planSlug = resolvePlanSlug(product);
    dto.planDescription = product.description || '';
    dto.price = (price.unit_amount || 0) / 100; // Converter de centavos para reais
    dto.currency = price.currency || 'BRL';
    // Validar que interval é month ou year (pode ser week ou day)
    const interval = price.recurring?.interval || 'month';
    dto.billingPeriod = (interval === 'year' ? 'year' : 'month') as
      | 'month'
      | 'year';
    // Extrair features registrados no Stripe (marketing_features)
    dto.marketingFeatures = Array.isArray(product.marketing_features)
      ? product.marketing_features.map((f) => f.name || '')
      : [];

    dto.features = normalizeSubscriptionMetadata(product.metadata);
    dto.subscriptionStatus = subscription.status;
    dto.currentPeriodStart = new Date(subscription.current_period_start * 1000);
    dto.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    dto.cancelAtPeriodEnd = subscription.cancel_at_period_end;
    dto.nextBillingDate = nextBillingDate;

    dto.isActive = ['active', 'trialing', 'paid'].includes(subscription.status);
    dto.invoices = invoices.map((invoice) => InvoiceDto.fromStripe(invoice));

    dto.schedulesLength = schedulesLength;
    dto.storesLength = storesLength;
    dto.storeMembersLength = storeMembersLength;

    return dto;
  }
}
