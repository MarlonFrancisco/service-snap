import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { MAX_SERIES_OCCURRENCES } from '../schedule-series.helpers';

export class SeriesCustomerDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telephone?: string;
}

export class CreateScheduleSeriesDto {
  /** Primeira data, `YYYY-MM-DD`. */
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be YYYY-MM-DD' })
  date: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'startTime must be HH:MM' })
  startTime: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsUUID('all', { each: true })
  serviceIds: string[];

  @IsUUID()
  storeMemberId: string;

  @ValidateNested()
  @Type(() => SeriesCustomerDto)
  customer: SeriesCustomerDto;

  /** Toda semana (1) ou a cada 2, 3 ou 4 semanas. */
  @IsInt()
  @Min(1)
  @Max(4)
  intervalWeeks: number;

  @IsInt()
  @Min(2)
  @Max(MAX_SERIES_OCCURRENCES)
  occurrences: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class CancelScheduleSeriesDto {
  /** Cancela desta data em diante ("esta e as próximas"); sem ela, de hoje. */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'from must be YYYY-MM-DD' })
  from?: string;
}
