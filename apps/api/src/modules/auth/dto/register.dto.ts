import {
  IsBoolean,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import type { TSignupAttributionInput } from '../../users/signup-attribution';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  telephone: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsBoolean()
  acceptedTerms: boolean;

  @IsString()
  @IsOptional()
  paymentCustomerId: string;

  @IsString()
  @IsOptional()
  referralCode?: string;

  /** Origem do cadastro; saneada no serviço, nunca bloqueia o registro. */
  @IsObject()
  @IsOptional()
  attribution?: TSignupAttributionInput;
}
