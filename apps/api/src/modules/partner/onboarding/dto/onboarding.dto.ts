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
import {
  IsPhoneFor,
  IsPostalCodeFor,
  IsStateFor,
  IsSupportedCountry,
  IsTimeZone,
} from '../../../../utils/validators/region.validators';
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

  // Opcional até o front enviar: sem país, a loja nasce no país padrão
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsSupportedCountry()
  country?: string;

  // Sem fuso, vale o padrão do país
  @IsOptional()
  @IsTimeZone()
  timezone?: string;

  @Transform(trim)
  @IsPostalCodeFor()
  zipCode: string;

  @Transform(trim)
  @IsString()
  @Length(3, 150)
  address: string;

  @Transform(trim)
  @IsString()
  @Length(2, 100)
  city: string;

  @Transform(trim)
  @IsStateFor()
  state?: string;

  @IsString()
  @IsPhoneFor()
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
