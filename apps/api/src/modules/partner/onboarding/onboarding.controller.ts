import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import {
  AddMemberDto,
  AddServiceDto,
  SaveHoursDto,
  SaveOwnerDto,
  SaveSpaceDto,
  SetMonthlyGoalDto,
  SetStepDto,
} from './dto/onboarding.dto';
import { OnboardingService } from './onboarding.service';

/**
 * Nenhuma rota recebe o id da loja em rascunho: o serviço sempre o deduz do
 * usuário logado, então não há como um parceiro mexer na loja de outro.
 */
@Controller('partner/onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get()
  getState(@CurrentUser('sub') userId: string) {
    return this.onboardingService.getState(userId);
  }

  @Put('space')
  saveSpace(@CurrentUser('sub') userId: string, @Body() dto: SaveSpaceDto) {
    return this.onboardingService.saveSpace(userId, dto);
  }

  @Put('hours')
  saveHours(@CurrentUser('sub') userId: string, @Body() dto: SaveHoursDto) {
    return this.onboardingService.saveHours(userId, dto);
  }

  @Post('services')
  addService(@CurrentUser('sub') userId: string, @Body() dto: AddServiceDto) {
    return this.onboardingService.addService(userId, dto);
  }

  @Delete('services/:id')
  removeService(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.onboardingService.removeService(userId, id);
  }

  @Put('step')
  setStep(@CurrentUser('sub') userId: string, @Body() dto: SetStepDto) {
    return this.onboardingService.setStep(userId, dto);
  }

  @Put('team/owner')
  saveOwner(@CurrentUser('sub') userId: string, @Body() dto: SaveOwnerDto) {
    return this.onboardingService.saveOwner(userId, dto);
  }

  @Post('team/members')
  addMember(@CurrentUser('sub') userId: string, @Body() dto: AddMemberDto) {
    return this.onboardingService.addMember(userId, dto);
  }

  @Delete('team/members/:id')
  removeMember(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.onboardingService.removeMember(userId, id);
  }

  @Post('complete')
  complete(@CurrentUser('sub') userId: string) {
    return this.onboardingService.complete(userId);
  }

  @Get('stores/:storeId/checklist')
  getChecklist(
    @CurrentUser('sub') userId: string,
    @Param('storeId', ParseUUIDPipe) storeId: string,
  ) {
    return this.onboardingService.getChecklist(userId, storeId);
  }

  @Post('stores/:storeId/link-shared')
  markLinkShared(
    @CurrentUser('sub') userId: string,
    @Param('storeId', ParseUUIDPipe) storeId: string,
  ) {
    return this.onboardingService.markLinkShared(userId, storeId);
  }

  @Post('stores/:storeId/checklist/dismiss')
  dismissChecklist(
    @CurrentUser('sub') userId: string,
    @Param('storeId', ParseUUIDPipe) storeId: string,
  ) {
    return this.onboardingService.dismissChecklist(userId, storeId);
  }

  @Put('stores/:storeId/monthly-goal')
  setMonthlyGoal(
    @CurrentUser('sub') userId: string,
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @Body() dto: SetMonthlyGoalDto,
  ) {
    return this.onboardingService.setMonthlyGoal(userId, storeId, dto);
  }
}
