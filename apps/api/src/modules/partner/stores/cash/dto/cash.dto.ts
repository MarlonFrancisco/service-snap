import { Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { PAYMENT_METHODS, type TPaymentMethod } from '../cash.types';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export class PaymentInputDto {
  @IsIn(PAYMENT_METHODS)
  method: TPaymentMethod;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  notes?: string;
}

/** Pagamento avulso (ex.: acerto de um atendimento antigo). */
export class RegisterPaymentDto extends PaymentInputDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;
}

export class VoidPaymentDto {
  @IsString()
  @MaxLength(300)
  reason: string;
}

export class OpenCashSessionDto {
  /** Troco que já estava na gaveta. */
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  openingAmount: number;
}

export class CloseCashSessionDto {
  /** Dinheiro contado na gaveta; a diferença para o esperado fica gravada. */
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  countedCash: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class PaymentQueryDto {
  @Matches(DATE, { message: 'from must be YYYY-MM-DD' })
  from: string;

  @Matches(DATE, { message: 'to must be YYYY-MM-DD' })
  to: string;

  @IsOptional()
  @IsIn(PAYMENT_METHODS)
  method?: TPaymentMethod;
}
