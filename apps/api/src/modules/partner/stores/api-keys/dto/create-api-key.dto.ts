import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateApiKeyDto {
  /** Para a loja saber onde a chave está em uso (ex.: "Site", "ERP"). */
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;
}
