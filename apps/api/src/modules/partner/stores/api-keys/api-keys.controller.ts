import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { RequireStoreRoles, StoreRoleGuard } from '../guards';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

/** Chave de API dá acesso à agenda inteira: só dono e gerente mexem. */
@Controller('partner/stores/:storeId/api-keys')
@RequireStoreRoles('owner', 'manager')
@UseGuards(StoreRoleGuard)
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Get()
  list(@Param('storeId') storeId: string) {
    return this.apiKeysService.list(storeId);
  }

  @Post()
  create(
    @Param('storeId') storeId: string,
    @CurrentUser('sub') userId: string,
    @Body() { name }: CreateApiKeyDto,
  ) {
    return this.apiKeysService.create(storeId, name, userId);
  }

  @Delete(':id')
  revoke(
    @Param('storeId') storeId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.apiKeysService.revoke(storeId, id);
  }
}
