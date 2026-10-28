import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { generateAuthCode } from '../../utils';
import { NotificationService } from '../notification';
import { UsersService } from '../users';
import { LoginFirstStepDto } from './dto/login-first-step.dto';
import { RegisterDto } from './dto/register.dto';
import { ValidationCodeDto } from './dto/validation-code.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  paymentCustomerId: string;
  [key: string]: any;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly notificationService: NotificationService,
  ) {}

  async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: '1d',
    });
  }

  async generateRefreshToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });
  }

  async generateTokens(payload: JwtPayload): Promise<TokenResponse> {
    const [access_token, refresh_token] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);

    return {
      access_token,
      refresh_token,
      expires_in: 24 * 60 * 60, // 1 dia em segundos (igual ao token)
    };
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token);
  }

  async createOtpCode(body: LoginFirstStepDto) {
    const user = await this.userService.findByOne({
      email: body.email,
      telephone: body.telephone,
    });
    const authCode = generateAuthCode();
    let isNewUser = user?.email && user?.telephone ? false : true;

    if (!user?.id) {
      await this.userService.create({
        ...body,
        authCode: authCode.code,
        authCodeExpiresAt: authCode.expiresIn,
      });
      isNewUser = true;
    } else {
      await this.userService.update(user.id, {
        authCode: authCode.code,
        authCodeExpiresAt: authCode.expiresIn,
      });
    }

    if (body.telephone) {
      await this.notificationService.sendSMSOTP(body.telephone, authCode.code);
    }

    if (body.email) {
      await this.notificationService.sendEmailOTP(body.email, authCode.code);
    }

    return { isNewUser };
  }

  async validateCode(body: ValidationCodeDto) {
    const user = await this.userService.findByOne({
      email: body.email,
      telephone: body.telephone,
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.authCode !== body.code) {
      throw new UnauthorizedException('Invalid code');
    }

    if (user.authCodeExpiresAt < new Date()) {
      throw new UnauthorizedException('Code expired');
    }

    if (user.isDeleted) {
      await this.userService.update(user.id, { isDeleted: false });
    }

    const isNewUser = !user.email || !user.telephone;
    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      telephone: user.telephone,
      paymentCustomerId: user.paymentCustomerId,
    });

    return {
      tokens,
      user: !isNewUser ? user : undefined,
    };
  }

  async register(body: RegisterDto, token: string) {
    const tokenPayload = await this.verifyToken(token);
    const { referralCode, ...profile } = body;
    const user = await this.userService.update(tokenPayload.sub, profile);

    if (referralCode) {
      await this.userService.applyReferralCode(user.id, referralCode);
    }

    await this.userService.ensureReferralCode(user.id);

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      telephone: user.telephone,
      paymentCustomerId: user.paymentCustomerId,
    });

    return {
      user,
      tokens,
    };
  }
}
