import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { ONBOARDING_STEPS, type TOnboardingStep } from '../onboarding.types';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class SaveSpaceDto {
  @IsString()
  @Length(1, 60)
  businessType: string;

  @Transform(trim)
  @IsString()
  @Length(3, 100)
  name: string;

  @Transform(trim)
  @IsString()
  @Length(10, 500)
  description: string;

  @IsString()
  @Matches(/^\d{5}-?\d{3}$/, { message: 'CEP inválido' })
  zipCode: string;

  @Transform(trim)
  @IsString()
  @Length(3, 150)
  address: string;

  @Transform(trim)
  @IsString()
  @Length(2, 100)
  city: string;

  @IsString()
  @Matches(/^[A-Za-z]{2}$/, { message: 'Estado inválido' })
  state: string;

  @IsString()
  @Matches(/^[\d\s()+-]{10,20}$/, { message: 'Telefone inválido' })
  telephone: string;
}

export class SaveHoursDto {
  @IsObject()
  businessDays: Record<string, boolean>;

  @Matches(TIME_PATTERN, { message: 'Abertura inválida' })
  openTime: string;

  @Matches(TIME_PATTERN, { message: 'Fechamento inválido' })
  closeTime: string;

  @IsOptional()
  @Matches(TIME_PATTERN, { message: 'Início da pausa inválido' })
  lunchStartTime?: string | null;

  @IsOptional()
  @Matches(TIME_PATTERN, { message: 'Fim da pausa inválido' })
  lunchEndTime?: string | null;
}

export class AddServiceDto {
  @Transform(trim)
  @IsString()
  @Length(2, 60)
  categoryName: string;

  @Transform(trim)
  @IsString()
  @Length(2, 80)
  name: string;

  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(600)
  duration: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  price: number;
}

export class SetStepDto {
  @IsIn(ONBOARDING_STEPS)
  step: TOnboardingStep;
}

export class SaveOwnerDto {
  @IsBoolean()
  enabled: boolean;

  @IsArray()
  @IsUUID('4', { each: true })
  serviceIds: string[];
}

export class AddMemberDto {
  @Transform(trim)
  @IsEmail()
  email: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  serviceIds: string[];
}

export class SetMonthlyGoalDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  monthlyGoal: number;
}
