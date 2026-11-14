import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

export class CreateHolidayDto {
  @Matches(DATE_KEY, { message: 'date must be YYYY-MM-DD' })
  date: string;

  @IsString()
  @MaxLength(80)
  @IsOptional()
  name?: string;
}

export class HolidayQueryDto {
  @Matches(DATE_KEY, { message: 'from must be YYYY-MM-DD' })
  @IsOptional()
  from?: string;

  @Matches(DATE_KEY, { message: 'to must be YYYY-MM-DD' })
  @IsOptional()
  to?: string;
}
