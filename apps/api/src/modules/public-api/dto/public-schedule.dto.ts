import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export class PublicCustomerDto {
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

  /** E.164 ou número local do país da loja. Com e-mail, um dos dois basta. */
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telephone?: string;
}

export class PublicCreateScheduleDto {
  @Matches(DATE, { message: 'date must be YYYY-MM-DD' })
  date: string;

  @Matches(TIME, { message: 'startTime must be HH:MM' })
  startTime: string;

  /** Na ordem do atendimento; o horário de cada um segue o anterior. */
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsUUID('all', { each: true })
  serviceIds: string[];

  @IsUUID()
  professionalId: string;

  @ValidateNested()
  @Type(() => PublicCustomerDto)
  customer: PublicCustomerDto;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class PublicScheduleQueryDto {
  @IsOptional()
  @Matches(DATE, { message: 'from must be YYYY-MM-DD' })
  from?: string;

  @IsOptional()
  @Matches(DATE, { message: 'to must be YYYY-MM-DD' })
  to?: string;

  @IsOptional()
  @IsIn(['scheduled', 'completed', 'cancelled', 'no-show'])
  status?: string;

  @IsOptional()
  @Matches(/^\d+$/)
  page?: string;

  @IsOptional()
  @Matches(/^\d+$/)
  limit?: string;
}
