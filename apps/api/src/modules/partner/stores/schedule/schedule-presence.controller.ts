import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { StoreAccessGuard } from '../guards';
import { SchedulePresenceService } from './schedule-presence.service';

/** Confirmação de presença vista pela loja. O que já foi confirmado vem no próprio agendamento. */
@Controller('partner/stores/:storeId/schedules/presence')
@UseGuards(StoreAccessGuard)
export class SchedulePresenceController {
  constructor(
    private readonly schedulePresenceService: SchedulePresenceService,
  ) {}

  @Get('awaiting')
  findAwaiting(@Param('storeId') storeId: string) {
    return this.schedulePresenceService.findAwaitingForStore(storeId);
  }
}
