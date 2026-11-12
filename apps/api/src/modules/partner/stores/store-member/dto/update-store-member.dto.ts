import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import type { Service } from '../../category/service/service.entity';
import type { Store } from '../../store.entity';
import { WorkingHoursDto } from './working-hours.dto';

export class UpdateStoreMemberDto {
  @IsString()
  id: string;

  @IsEnum(['owner', 'manager', 'professional'])
  @IsOptional()
  role: 'owner' | 'manager' | 'professional';

  @IsBoolean()
  @IsOptional()
  isActive: boolean;

  @IsArray()
  @IsOptional()
  services: Partial<Service>[];

  @IsObject()
  @IsOptional()
  store: Partial<Store>;

  /** `null` volta a seguir o horário da loja. */
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  @IsOptional()
  workingHours?: WorkingHoursDto | null;
}
