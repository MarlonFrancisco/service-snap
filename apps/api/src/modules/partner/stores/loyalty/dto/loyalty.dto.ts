import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  Matches,
  Max,
  Min,
} from 'class-validator';
import type { TLoyaltyRewardType } from '../loyalty.types';

export class SaveLoyaltyProgramDto {
  @IsBoolean()
  isActive: boolean;

  @IsInt()
  @Min(1)
  @Max(100)
  visitsRequired: number;

  @IsIn(['percent', 'fixed', 'free_service'])
  rewardType: TLoyaltyRewardType;

  /** Percentual (1 a 100) ou valor; não vale para serviço grátis. */
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  rewardValue?: number;

  @IsOptional()
  @IsUUID()
  rewardServiceId?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsUUID('all', { each: true })
  eligibleServiceIds?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3650)
  rewardValidityDays?: number;

  /** Começar a contar de outra data; sem ela, mudar a regra começa hoje. */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'cycleStartsOn must be YYYY-MM-DD',
  })
  cycleStartsOn?: string;
}
