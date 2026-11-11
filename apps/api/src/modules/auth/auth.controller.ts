import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { getAccessTokenFromCookie } from '../../utils';
import { buildSessionCookieOptions } from './auth.helpers';
import { AuthService, type TokenResponse } from './auth.service';
import { LoginFirstStepDto } from './dto/login-first-step.dto';
import { RegisterDto } from './dto/register.dto';
import { ValidationCodeDto } from './dto/validation-code.dto';
import { GoogleSSOService } from './google-sso.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleSSOService: GoogleSSOService,
  ) {}

  @Post('code')
  async createOtpCode(@Body() body: LoginFirstStepDto) {
    return this.authService.createOtpCode(body);
  }

  @HttpCode(201)
  @Post('validate-code')
  async login(
    @Body() body: ValidationCodeDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const { tokens, user } = await this.authService.validateCode(body);

      this.setSessionCookies(res, tokens, user?.id);

      return { user };
    } catch (error) {
      // O limite de tentativas precisa chegar como 429, não como código errado
      if (
        error instanceof HttpException &&
        error.getStatus() === (HttpStatus.TOO_MANY_REQUESTS as number)
      ) {
        throw error;
      }

      throw new UnauthorizedException(error);
    }
  }

  /** `user_identification` é lido pelo front; só vai quando o cadastro está completo. */
  private setSessionCookies(
    res: Response,
    tokens: TokenResponse,
    userId?: string,
  ) {
    const maxAgeMs = tokens.expires_in * 1000;

    res.cookie(
      'access_token',
      tokens.access_token,
      buildSessionCookieOptions(maxAgeMs, true),
    );

    if (userId) {
      res.cookie(
        'user_identification',
        userId,
        buildSessionCookieOptions(maxAgeMs, false),
      );
    }
  }

  @HttpCode(201)
  @Post('register')
  @UseGuards(JwtAuthGuard)
  async register(
    @Body() body: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.authService.register(
      body,
      getAccessTokenFromCookie(req.headers.cookie),
    );

    this.setSessionCookies(res, tokens, user.id);
  }

  @Post('social/google')
  async googleLogin(
    @Body() body: { token: string; referralCode?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { tokens, isNewUser, user } = await this.googleSSOService.login(
      body.token,
      body.referralCode,
    );

    this.setSessionCookies(res, tokens, user.id);

    return { isNewUser, user };
  }
}
