import { Controller, Delete, Get, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrivacyService } from './privacy.service';

/** Direitos do titular sobre a própria conta. */
@Controller('users/me')
@UseGuards(JwtAuthGuard)
export class PrivacyController {
  constructor(private readonly privacyService: PrivacyService) {}

  /** Arquivo JSON com tudo o que o ServiceSnap guarda do usuário. */
  @Get('export')
  async exportData(
    @CurrentUser('sub') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="servicesnap-dados-${new Date().toISOString().slice(0, 10)}.json"`,
    );

    return this.privacyService.exportData(userId);
  }

  /** Exclusão definitiva (anonimização); entrar de novo cria outra conta. */
  @Delete()
  async deleteAccount(
    @CurrentUser('sub') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.privacyService.deleteAccount(userId);
    res.clearCookie('user_identification');
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { id: userId };
  }
}
