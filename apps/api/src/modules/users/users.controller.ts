import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import type { JwtPayload } from '../auth/auth.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/me')
  async getUser(@CurrentUser() user: JwtPayload) {
    return await this.usersService.getUserDetails(user.sub);
  }

  @Get('/me/referral')
  async getReferral(@CurrentUser() user: JwtPayload) {
    return this.usersService.getReferralSummary(user.sub);
  }

  @Patch('/me/avatar')
  async updateAvatar(
    @CurrentUser() user: JwtPayload,
    @Body() body: { avatar: string },
  ) {
    return await this.usersService.updateAvatar(user.sub, body.avatar);
  }

  // DELETE /users/me (exclusão de verdade) fica no PrivacyController
}
