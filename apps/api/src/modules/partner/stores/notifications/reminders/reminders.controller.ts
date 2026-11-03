import { Controller, Get, UseGuards } from '@nestjs/common';
import { CronSecretGuard } from './cron-secret.guard';
import { RemindersService } from './reminders.service';

// Fora de /partner: quem chama é o agendador, com CRON_SECRET em vez de JWT
@Controller('cron/schedule-reminders')
@UseGuards(CronSecretGuard)
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get()
  run() {
    return this.remindersService.sendDueReminders();
  }
}
