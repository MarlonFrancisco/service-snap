import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { CAMPAIGN_CHANNELS } from '../campaigns.helpers';
import type { TCampaignChannel } from '../campaigns.types';

export class InactiveCustomersQueryDto {
  /** Dias desde a última visita; padrão 60. */
  @IsOptional()
  @Matches(/^\d+$/)
  days?: string;
}

export class CampaignTemplateDto {
  @IsString()
  @Matches(/^[a-z0-9_]{1,512}$/, { message: 'template name is invalid' })
  name: string;

  @IsString()
  @MaxLength(15)
  language: string;

  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  bodyParams: string[];
}

export class CreateCampaignDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsIn(CAMPAIGN_CHANNELS)
  channel: TCampaignChannel;

  @IsInt()
  @Min(7)
  @Max(730)
  inactiveDays: number;

  @ValidateIf((dto: CreateCampaignDto) => dto.channel === 'whatsapp')
  @ValidateNested()
  @Type(() => CampaignTemplateDto)
  template?: CampaignTemplateDto;

  @ValidateIf((dto: CreateCampaignDto) => dto.channel === 'email')
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  message?: string;

  /** Só parte da lista de sumidos; sem ela, vão todos os que podem receber. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1000)
  @IsUUID('all', { each: true })
  customerIds?: string[];
}
