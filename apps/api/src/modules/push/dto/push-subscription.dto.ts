import { Type } from 'class-transformer';
import {
  IsObject,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class PushKeysDto {
  @IsString()
  @MaxLength(255)
  p256dh: string;

  @IsString()
  @MaxLength(255)
  auth: string;
}

/** Formato que o navegador entrega em `PushSubscription.toJSON()`. */
export class PushSubscriptionDto {
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(1000)
  endpoint: string;

  @IsObject()
  @ValidateNested()
  @Type(() => PushKeysDto)
  keys: PushKeysDto;
}

export class PushUnsubscribeDto {
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(1000)
  endpoint: string;
}
