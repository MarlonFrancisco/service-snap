import { IsString, MinLength } from 'class-validator';

export class TestWhatsappDto {
  @IsString()
  @MinLength(8)
  to: string;
}
