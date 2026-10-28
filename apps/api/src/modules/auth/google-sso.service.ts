import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class GoogleSSOService extends OAuth2Client {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {
    super({
      clientId: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
    });
  }

  async verifyToken(token: string) {
    try {
      const ticket = await this.verifyIdToken({
        idToken: token,
      });

      return ticket;
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async getUserInfo(token: string) {
    try {
      const ticket = await this.verifyToken(token);
      const payload = ticket.getPayload();

      if (!payload.email_verified) {
        throw new UnauthorizedException('Google account not verified');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async login(token: string, referralCode?: string) {
    const userInfo = await this.getUserInfo(token);

    let user = await this.usersService.findByOne({
      email: userInfo.email,
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;

      user = await this.usersService.create(
        plainToInstance(RegisterDto, {
          email: userInfo.email,
          firstName: userInfo.given_name,
          lastName: userInfo.family_name,
          acceptedTerms: true,
        }),
      );

      if (referralCode) {
        await this.usersService.applyReferralCode(user.id, referralCode);
      }
    }

    await this.usersService.ensureReferralCode(user.id);

    const tokens = await this.authService.generateTokens({
      sub: user.id,
      email: user.email,
      telephone: user.telephone,
      paymentCustomerId: user.paymentCustomerId,
    });

    return {
      tokens,
      isNewUser,
      user,
    };
  }
}
