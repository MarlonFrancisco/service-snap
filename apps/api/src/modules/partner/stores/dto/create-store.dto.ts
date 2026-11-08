import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
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

export class CreateStoreDto {
  @IsObject()
  @IsOptional()
  owner: Partial<User>;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
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
  address: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  zipCode: string;

  @IsString()
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
  openTime: string;

  @IsString()
  closeTime: string;

  @IsString()
  lunchStartTime: string;

  @IsString()
  lunchEndTime: string;

  @IsObject()
  @ValidateNested()
  @Type(() => Store['businessDays'])
  businessDays: Store['businessDays'];
}
