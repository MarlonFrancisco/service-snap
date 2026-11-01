import { Type } from 'class-transformer';
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

  @IsString()
  @IsOptional()
  country: string;

  @IsString()
  @IsOptional()
  currency: string;

  @IsString()
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
}
