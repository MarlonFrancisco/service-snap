import { IsOptional, IsUUID, Matches } from 'class-validator';
import { PaginationQueryDto } from '../../../../../utils/dto/pagination.dto';

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Período da agenda (inclusivo) e, se vier, página. */
export class ScheduleListQueryDto extends PaginationQueryDto {
  @Matches(DATE_KEY, { message: 'from must be YYYY-MM-DD' })
  @IsOptional()
  from?: string;

  @Matches(DATE_KEY, { message: 'to must be YYYY-MM-DD' })
  @IsOptional()
  to?: string;

  @IsUUID()
  @IsOptional()
  memberId?: string;
}

export class RescheduleDto {
  @Matches(DATE_KEY, { message: 'date must be YYYY-MM-DD' })
  date: string;

  @Matches(TIME, { message: 'startTime must be HH:MM' })
  startTime: string;

  /** Sem profissional, fica com o atual. */
  @IsUUID()
  @IsOptional()
  storeMemberId?: string;
}
