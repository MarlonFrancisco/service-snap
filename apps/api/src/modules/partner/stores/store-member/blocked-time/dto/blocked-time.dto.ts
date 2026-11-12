import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { StoreMember } from '../../store-member.entity';

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
// O fim pode ser "24:00", para fechar o dia inteiro
const END_TIME = /^(([01]\d|2[0-3]):[0-5]\d|24:00)$/;

export class BlockedTimeDto {
  @IsString()
  @IsOptional()
  id: string;

  @IsDate()
  @Type(() => Date)
  date: Date;

  @Matches(TIME, { message: 'time must be HH:MM' })
  time: string;

  /** Sem fim, o bloqueio ocupa um slot da grade da loja. */
  @Matches(END_TIME, { message: 'endTime must be HH:MM' })
  @IsOptional()
  endTime?: string;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(6)
  dayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;

  @IsObject()
  storeMember: Partial<StoreMember>;
}

class BlockedTimeItemDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsDate()
  @Type(() => Date)
  date: Date;

  @Matches(TIME, { message: 'time must be HH:MM' })
  time: string;

  @Matches(END_TIME, { message: 'endTime must be HH:MM' })
  @IsOptional()
  endTime?: string;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(6)
  dayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export class CreateBulkBlockedTimeDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlockedTimeItemDto)
  blockedTimes: BlockedTimeItemDto[];
}

class DeleteBlockedTimeItemDto {
  @IsString()
  id: string;
}

export class DeleteBulkBlockedTimeDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeleteBlockedTimeItemDto)
  blockedTimes: DeleteBlockedTimeItemDto[];
}
