import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { WEBHOOK_EVENTS, type TWebhookEvent } from '../webhooks.types';

export class CreateWebhookEndpointDto {
  @IsUrl({ require_tld: false, require_protocol: true })
  @MaxLength(500)
  url: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  description?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsIn(WEBHOOK_EVENTS, { each: true })
  events: TWebhookEvent[];
}

export class UpdateWebhookEndpointDto {
  @IsOptional()
  @IsUrl({ require_tld: false, require_protocol: true })
  @MaxLength(500)
  url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsIn(WEBHOOK_EVENTS, { each: true })
  events?: TWebhookEvent[];

  /** Religar zera a contagem de falhas. */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
