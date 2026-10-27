import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { getAccessTokenFromCookie } from '../../utils';
import { AuthService } from './auth.service';
import { LoginFirstStepDto } from './dto/login-first-step.dto';
import { RegisterDto } from './dto/register.dto';
import { ValidationCodeDto } from './dto/validation-code.dto';
import { GoogleSSOService } from './google-sso.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  private readonly isProduction = process.env.NODE_ENV === 'production';

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

      res.cookie('access_token', tokens.access_token, {
        httpOnly: true,
        secure: this.isProduction,
        maxAge: tokens.expires_in * 1000,
      });

      if (user) {
        res.cookie('user_identification', user.id, {
          httpOnly: false,
          secure: this.isProduction,
          maxAge: tokens.expires_in * 1000,
        });
      }

      return { user };
    } catch (error) {
      throw new UnauthorizedException(error);
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

    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: this.isProduction,
      maxAge: tokens.expires_in * 1000,
    });

    res.cookie('user_identification', user.id, {
      httpOnly: false,
      secure: this.isProduction,
      maxAge: tokens.expires_in * 1000,
    });
  }

  @Post('social/google')
  async googleLogin(
    @Body() body: { token: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { tokens, isNewUser, user } = await this.googleSSOService.login(
      body.token,
    );

    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: this.isProduction,
      maxAge: tokens.expires_in * 1000,
    });

    res.cookie('user_identification', user.id, {
      httpOnly: false,
      secure: this.isProduction,
      maxAge: tokens.expires_in * 1000,
    });

    return { isNewUser, user };
  }
}
