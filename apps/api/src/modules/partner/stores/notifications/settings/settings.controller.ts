import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { RequireStoreRoles, StoreRoleGuard } from '../../guards';
import { NotificationsSettingsDto } from './dto/settings.dto';
import { NotificationsSettings } from './settings.entity';
import { NotificationsSettingsService } from './settings.service';

@Controller('partner/stores/:storeId/notifications/settings')
// Gestão da loja: só dono e gerente
@RequireStoreRoles('owner', 'manager')
@UseGuards(StoreRoleGuard)
export class NotificationsSettingsController {
  constructor(
    private readonly notificationsSettingsService: NotificationsSettingsService,
  ) {}

  @Get()
  async findOne(
    @Param('storeId') storeId: string,
  ): Promise<NotificationsSettings> {
    return this.notificationsSettingsService.findOne(storeId);
  }

  @Put()
  async update(
    @Param('storeId') storeId: string,
    @Body() notificationsSettings: NotificationsSettingsDto,
  ): Promise<NotificationsSettings> {
    return this.notificationsSettingsService.update(
      plainToInstance(NotificationsSettingsDto, {
        ...notificationsSettings,
        store: { id: storeId },
      }),
    );
  }
}
