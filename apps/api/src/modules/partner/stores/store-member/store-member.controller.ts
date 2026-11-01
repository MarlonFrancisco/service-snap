import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { RequireStoreRoles, StoreAccessGuard, StoreRoleGuard } from '../guards';
import { CreateStoreMemberDto } from './dto/create-store-member.dto';
import { UpdateStoreMemberDto } from './dto/update-store-member.dto';
import { StoreMemberService } from './store-member.service';

@Controller('partner/stores/:storeId/members')
export class StoreMemberController {
  constructor(private readonly storeMemberService: StoreMemberService) {}

  @Get()
  @UseGuards(StoreAccessGuard)
  async findAll(@Param('storeId') storeId: string) {
    return this.storeMemberService.findStoreMembers(storeId);
  }

  @Post()
  @RequireStoreRoles('owner', 'manager')
  @UseGuards(StoreRoleGuard)
  async create(
    @Param('storeId') storeId: string,
    @CurrentUser('sub') ownerUserId: string,
    @Body() storeMemberDto: CreateStoreMemberDto,
  ) {
    return this.storeMemberService.create(
      plainToInstance(CreateStoreMemberDto, {
        ...storeMemberDto,
        store: { id: storeId },
      }),
      ownerUserId,
    );
  }

  @Put(':id')
  @RequireStoreRoles('owner', 'manager')
  @UseGuards(StoreRoleGuard)
  async update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() storeMemberDto: UpdateStoreMemberDto,
  ) {
    return this.storeMemberService.update(
      plainToInstance(UpdateStoreMemberDto, {
        ...storeMemberDto,
        id,
        store: { id: storeId },
      }),
    );
  }

  @Delete(':id')
  @RequireStoreRoles('owner', 'manager')
  @UseGuards(StoreRoleGuard)
  async delete(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.storeMemberService.delete(storeId, id);
  }
}
