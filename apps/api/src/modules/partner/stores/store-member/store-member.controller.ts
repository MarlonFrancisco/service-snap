import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { RequireStoreRoles, StoreAccessGuard, StoreRoleGuard } from '../guards';
import { PaginationQueryDto } from '../../../../utils/dto/pagination.dto';
import { CreateStoreMemberDto } from './dto/create-store-member.dto';
import { UpdateStoreMemberDto } from './dto/update-store-member.dto';
import { StoreMemberService } from './store-member.service';

@Controller('partner/stores/:storeId/members')
export class StoreMemberController {
  constructor(private readonly storeMemberService: StoreMemberService) {}

  @Get()
  @UseGuards(StoreAccessGuard)
  async findAll(
    @Param('storeId') storeId: string,
    @Query() query: PaginationQueryDto,
  ) {
    // Sem `page`, a lista inteira, como a web atual espera
    return query.page
      ? this.storeMemberService.findStoreMembersPage(storeId, query)
      : this.storeMemberService.findStoreMembers(storeId);
  }

  @Post()
  @RequireStoreRoles('owner', 'manager')
  @UseGuards(StoreRoleGuard)
  async create(
    @Param('storeId') storeId: string,
    @Body() storeMemberDto: CreateStoreMemberDto,
  ) {
    return this.storeMemberService.create(
      plainToInstance(CreateStoreMemberDto, {
        ...storeMemberDto,
        store: { id: storeId },
      }),
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
