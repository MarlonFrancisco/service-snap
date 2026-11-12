import { IsEmail, Matches } from 'class-validator';

export class EmailChangeDto {
  @IsEmail()
  email: string;
}

export class EmailChangeConfirmDto {
  @Matches(/^\d{6}$/, { message: 'code must have 6 digits' })
  code: string;
}
