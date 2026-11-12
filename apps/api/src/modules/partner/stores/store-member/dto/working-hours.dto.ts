import { Type } from 'class-transformer';
import { IsOptional, Matches, ValidateNested } from 'class-validator';

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const END_TIME = /^(([01]\d|2[0-3]):[0-5]\d|24:00)$/;

export class DayHoursDto {
  @Matches(TIME, { message: 'openTime must be HH:MM' })
  openTime: string;

  @Matches(END_TIME, { message: 'closeTime must be HH:MM' })
  closeTime: string;

  @Matches(TIME, { message: 'lunchStartTime must be HH:MM' })
  @IsOptional()
  lunchStartTime?: string | null;

  @Matches(END_TIME, { message: 'lunchEndTime must be HH:MM' })
  @IsOptional()
  lunchEndTime?: string | null;
}

/** Dia ausente segue a loja; `null` é folga fixa. */
export class WorkingHoursDto {
  @ValidateNested()
  @Type(() => DayHoursDto)
  @IsOptional()
  sunday?: DayHoursDto | null;

  @ValidateNested()
  @Type(() => DayHoursDto)
  @IsOptional()
  monday?: DayHoursDto | null;

  @ValidateNested()
  @Type(() => DayHoursDto)
  @IsOptional()
  tuesday?: DayHoursDto | null;

  @ValidateNested()
  @Type(() => DayHoursDto)
  @IsOptional()
  wednesday?: DayHoursDto | null;

  @ValidateNested()
  @Type(() => DayHoursDto)
  @IsOptional()
  thursday?: DayHoursDto | null;

  @ValidateNested()
  @Type(() => DayHoursDto)
  @IsOptional()
  friday?: DayHoursDto | null;

  @ValidateNested()
  @Type(() => DayHoursDto)
  @IsOptional()
  saturday?: DayHoursDto | null;
}
