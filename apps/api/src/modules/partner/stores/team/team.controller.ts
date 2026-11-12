import { Body, Controller, Logger, Param, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { NotificationService } from '../../../notification/notification.service';
import { UsersService } from '../../../users/users.service';
import {
  RequireStoreRoles,
  StoreActor,
  StoreRoleGuard,
  type TStoreActor,
} from '../guards';
import { CreateStoreMemberDto } from '../store-member/dto/create-store-member.dto';
import { StoreMemberService } from '../store-member/store-member.service';
import { assertCanGrantRole, buildTeamInviteData } from './team.helpers';

/**
 * Entrada na equipe. Fica fora de `StoreMemberController` porque avisa por
 * e-mail, e o módulo de notificações já depende do de membros (via WhatsApp).
 */
@Controller('partner/stores/:storeId/members')
export class TeamController {
  private readonly logger = new Logger(TeamController.name);

  constructor(
    private readonly storeMemberService: StoreMemberService,
    private readonly notificationService: NotificationService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @RequireStoreRoles('owner', 'manager')
  @UseGuards(StoreRoleGuard)
  async create(
    @Param('storeId') storeId: string,
    @CurrentUser('sub') requesterId: string,
    @StoreActor() actor: TStoreActor,
    @Body() storeMemberDto: CreateStoreMemberDto,
  ) {
    assertCanGrantRole(actor, storeMemberDto.role);

    const { member, isNewAccount } = await this.storeMemberService.create(
      plainToInstance(CreateStoreMemberDto, {
        ...storeMemberDto,
        store: { id: storeId },
      }),
    );

    await this.sendInvite(member, requesterId, isNewAccount);

    return member;
  }

  /** O aviso nunca desfaz a entrada na equipe. */
  private async sendInvite(
    member: Awaited<ReturnType<StoreMemberService['create']>>['member'],
    requesterId: string,
    isNewAccount: boolean,
  ) {
    const email = member?.user?.email;

    if (!email) return;

    try {
      const inviter = await this.usersService.findById(requesterId);

      await this.notificationService.teamInvite(
        email,
        buildTeamInviteData(
          member,
          inviter,
          isNewAccount,
          this.configService.get<string>('FRONTEND_URL') ?? '',
        ),
      );
    } catch (error) {
      this.logger.error(`Convite da equipe para ${member.id} não enviado`, error);
    }
  }
}
