import { IsEmail, IsOptional, IsString } from 'class-validator';

/** O código de acesso só é enviado por e-mail: o envio por SMS está desativado. */
export class LoginFirstStepDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  telephone?: string;
}
