import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import type { Service } from '../../category/service/service.entity';
import type { Store } from '../../store.entity';

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
}
