import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';
import type { Store } from '../../../store.entity';

/** Cada tela de canal envia só os próprios campos. */
export class NotificationsSettingsDto {
  @IsString()
  @IsOptional()
  id: string;

  @IsBoolean()
  @IsOptional()
  emailReminderEnabled: boolean;

  @IsString()
  @IsOptional()
  emailReminderAdvanceHours: string;

  @IsString()
  @IsOptional()
  emailReminderCustomMessage: string;

  @IsBoolean()
  @IsOptional()
  smsReminderEnabled: boolean;

  @IsString()
  @IsOptional()
  smsReminderAdvanceHours: string;

  @IsString()
  @IsOptional()
  smsReminderCustomMessage: string;

  @IsBoolean()
  @IsOptional()
  whatsappReminderEnabled: boolean;

  @IsString()
  @IsOptional()
  whatsappReminderAdvanceHours: string;

  @IsString()
  @IsOptional()
  whatsappReminderCustomMessage: string;

  @IsObject()
  @IsOptional()
  store: Partial<Store>;
}
