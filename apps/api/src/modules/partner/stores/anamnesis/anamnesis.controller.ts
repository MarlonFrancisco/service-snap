import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { RequireStoreRoles, StoreAccessGuard, StoreRoleGuard } from '../guards';
import type { StoreMember } from '../store-member/store-member.entity';
import { AnamnesisService } from './anamnesis.service';
import {
  CreateAnamnesisFormDto,
  UpdateAnamnesisFormDto,
} from './dto/anamnesis.dto';

type TStoreRequest = { storeMember?: StoreMember; storeMemberRole?: string };

/**
 * Formulários ficam com dono e gerente. A equipe gera o link e vê a lista;
 * abrir as respostas é só para gestão e o profissional do atendimento.
 */
@Controller('partner/stores/:storeId')
export class AnamnesisController {
  constructor(private readonly anamnesisService: AnamnesisService) {}

  @Get('anamnesis-forms')
  @UseGuards(StoreAccessGuard)
  listForms(@Param('storeId') storeId: string) {
    return this.anamnesisService.listForms(storeId);
  }

  @Post('anamnesis-forms')
  @RequireStoreRoles('owner', 'manager')
  @UseGuards(StoreRoleGuard)
  createForm(
    @Param('storeId') storeId: string,
    @Body() dto: CreateAnamnesisFormDto,
  ) {
    return this.anamnesisService.createForm(storeId, dto);
  }

  @Patch('anamnesis-forms/:id')
  @RequireStoreRoles('owner', 'manager')
  @UseGuards(StoreRoleGuard)
  updateForm(
    @Param('storeId') storeId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAnamnesisFormDto,
  ) {
    return this.anamnesisService.updateForm(storeId, id, dto);
  }

  @Post('schedules/:scheduleId/anamnesis-link')
  @UseGuards(StoreAccessGuard)
  createLink(
    @Param('storeId') storeId: string,
    @Param('scheduleId', ParseUUIDPipe) scheduleId: string,
  ) {
    return this.anamnesisService.createLink(storeId, scheduleId);
  }

  @Get('customers/:customerId/anamnesis')
  @UseGuards(StoreAccessGuard)
  listForCustomer(
    @Param('storeId') storeId: string,
    @Param('customerId', ParseUUIDPipe) customerId: string,
  ) {
    return this.anamnesisService.listForCustomer(storeId, customerId);
  }

  @Get('anamnesis-responses/:id')
  @UseGuards(StoreAccessGuard)
  readResponse(
    @Param('storeId') storeId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Req() request: TStoreRequest,
  ) {
    return this.anamnesisService.readResponse(storeId, id, {
      userId,
      role: request.storeMemberRole,
      storeMemberId: request.storeMember?.id,
    });
  }

  @Delete('anamnesis-responses/:id')
  @RequireStoreRoles('owner', 'manager')
  @UseGuards(StoreRoleGuard)
  deleteResponse(
    @Param('storeId') storeId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.anamnesisService.deleteResponse(storeId, id);
  }
}
