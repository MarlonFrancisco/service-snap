import { IsOptional, IsUUID, Matches } from 'class-validator';

export class JoinWaitlistDto {
  @IsUUID()
  serviceId: string;

  /** Sem profissional: qualquer um que faça o serviço. */
  @IsOptional()
  @IsUUID()
  storeMemberId?: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be YYYY-MM-DD' })
  date: string;
}
