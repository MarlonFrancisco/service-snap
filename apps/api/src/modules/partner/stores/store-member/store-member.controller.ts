import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  RequireStoreRoles,
  StoreAccessGuard,
  StoreActor,
  StoreRoleGuard,
  type TStoreActor,
} from '../guards';
import { assertCanGrantRole } from '../team/team.helpers';
import { PaginationQueryDto } from '../../../../utils/dto/pagination.dto';
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

  // A entrada na equipe (POST) fica em `TeamController`, que manda o convite

  @Put(':id')
  @RequireStoreRoles('owner', 'manager')
  @UseGuards(StoreRoleGuard)
  async update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @StoreActor() actor: TStoreActor,
    @Body() storeMemberDto: UpdateStoreMemberDto,
  ) {
    assertCanGrantRole(actor, storeMemberDto.role);

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
