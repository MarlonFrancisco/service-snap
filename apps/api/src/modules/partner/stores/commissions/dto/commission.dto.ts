import {
  IsIn,
  IsNumber,
  IsOptional,
  IsUUID,
  Matches,
  Max,
  Min,
} from 'class-validator';
import type { TCommissionType } from '../commissions.types';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export class CreateCommissionRuleDto {
  @IsIn(['percent', 'fixed'])
  type: TCommissionType;

  /** Percentual (0 a 100) ou valor fixo por atendimento. Zero desliga. */
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100000)
  value: number;

  /** Sem data, vale a partir de hoje. */
  @IsOptional()
  @Matches(DATE, { message: 'effectiveFrom must be YYYY-MM-DD' })
  effectiveFrom?: string;

  @IsOptional()
  @IsUUID()
  storeMemberId?: string;

  @IsOptional()
  @IsUUID()
  serviceId?: string;
}

export class CommissionReportQueryDto {
  @Matches(DATE, { message: 'from must be YYYY-MM-DD' })
  from: string;

  @Matches(DATE, { message: 'to must be YYYY-MM-DD' })
  to: string;

  @IsOptional()
  @IsUUID()
  storeMemberId?: string;
}
