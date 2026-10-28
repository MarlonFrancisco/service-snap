import { IsString, IsEmail, IsBoolean, IsOptional } from 'class-validator';

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
}
