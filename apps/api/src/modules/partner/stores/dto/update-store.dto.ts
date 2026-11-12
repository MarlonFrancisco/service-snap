import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import type { User } from '../../../users/user.entity';
import type { Gallery } from '../gallery/gallery.entity';
import { Store } from '../store.entity';
import {
  IsSupportedCountry,
  IsSupportedCurrency,
  IsTimeZone,
} from '../../../../utils/validators/region.validators';

export class UpdateStoreDto {
  @IsObject()
  @IsOptional()
  owner: Partial<User>;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities: string[];

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsSupportedCountry()
  @IsOptional()
  country: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsSupportedCurrency()
  @IsOptional()
  currency: string;

  @IsTimeZone()
  @IsOptional()
  timezone: string;

  @IsString()
  @IsOptional()
  address: string;

  @IsString()
  @IsOptional()
  city: string;

  @IsString()
  @IsOptional()
  state: string;

  @IsString()
  @IsOptional()
  zipCode: string;

  @IsString()
  @IsOptional()
  telephone: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  website: string;

  @IsString()
  @IsOptional()
  instagram: string;

  @IsString()
  @IsOptional()
  facebook: string;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;

  @IsArray()
  @IsOptional()
  storeMembers?: User[];

  @IsArray()
  @IsOptional()
  gallery?: Gallery[];

  @IsNumber()
  @IsOptional()
  weeklyGoal: number;

  @IsNumber()
  @IsOptional()
  monthlyGoal: number;

  @IsNumber()
  @IsOptional()
  quarterlyGoal: number;

  @IsString()
  @IsOptional()
  openTime: string;

  @IsString()
  @IsOptional()
  closeTime: string;

  @IsString()
  @IsOptional()
  lunchStartTime: string;

  @IsString()
  @IsOptional()
  lunchEndTime: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => Store['businessDays'])
  businessDays: Store['businessDays'];

  // regras de agenda

  @IsIn([5, 10, 15, 20, 30, 45, 60, 90, 120])
  @IsOptional()
  slotIntervalMinutes: number;

  @IsInt()
  @Min(0)
  @Max(240)
  @IsOptional()
  bufferMinutes: number;

  /** Até 30 dias, em minutos. */
  @IsInt()
  @Min(0)
  @Max(43200)
  @IsOptional()
  minAdvanceMinutes: number;

  @IsInt()
  @Min(0)
  @Max(730)
  @IsOptional()
  maxAdvanceDays: number;

  // política de cancelamento e remarcação

  @IsInt()
  @Min(0)
  @Max(720)
  @IsOptional()
  cancellationNoticeHours: number;

  @IsInt()
  @Min(0)
  @Max(720)
  @IsOptional()
  rescheduleNoticeHours: number;
}
