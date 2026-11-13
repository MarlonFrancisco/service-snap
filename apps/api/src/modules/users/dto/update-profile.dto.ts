import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/** Nome do perfil. E-mail muda por `auth/email-change`, com código. */
export class UpdateProfileDto {
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  @IsOptional()
  firstName?: string;

  @IsString()
  @MaxLength(60)
  @IsOptional()
  lastName?: string;
}
