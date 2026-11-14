import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  Equals,
  IsArray,
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  ANAMNESIS_FIELD_TYPES,
  type TAnamnesisFieldType,
} from '../anamnesis.types';

export class AnamnesisFieldDto {
  /** Identificador estável da pergunta (ex.: "alergias"). */
  @Matches(/^[a-z0-9_-]{1,40}$/, {
    message: 'field id must use a-z, 0-9, _ or - (up to 40)',
  })
  id: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  label: string;

  @IsIn(ANAMNESIS_FIELD_TYPES)
  type: TAnamnesisFieldType;

  @IsBoolean()
  required: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  options?: string[];
}

export class CreateAnamnesisFormDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(60)
  @ValidateNested({ each: true })
  @Type(() => AnamnesisFieldDto)
  fields: AnamnesisFieldDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsUUID('all', { each: true })
  serviceIds?: string[];
}

export class UpdateAnamnesisFormDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  /** Trocar as perguntas sobe a versão do formulário. */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(60)
  @ValidateNested({ each: true })
  @Type(() => AnamnesisFieldDto)
  fields?: AnamnesisFieldDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsUUID('all', { each: true })
  serviceIds?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SubmitAnamnesisDto {
  @IsUUID()
  formId: string;

  /** `{ [id da pergunta]: resposta }`; o tipo é conferido contra o formulário. */
  @IsObject()
  answers: Record<string, unknown>;

  /** Consentimento explícito para dado de saúde (LGPD art. 11). */
  @Equals(true, { message: 'consent must be accepted' })
  consent: boolean;
}
