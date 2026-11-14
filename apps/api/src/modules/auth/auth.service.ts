import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Cache } from 'cache-manager';
import { generateAuthCode } from '../../utils';
import { NotificationService } from '../notification';
import { UsersService } from '../users';
import {
  AUTH_CODE_MAX_ATTEMPTS,
  AUTH_CODE_MAX_SENDS,
  bumpUsageWindow,
} from './auth.helpers';
import type { TUsageWindow } from './auth.types';
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
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly notificationService: NotificationService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private attemptsKey(userId: string) {
    return `auth:code-attempts:${userId}`;
  }

  private async resetAttempts(userId: string) {
    try {
      await this.cacheManager.del(this.attemptsKey(userId));
    } catch (error) {
      this.logger.error(`Contagem de tentativas não zerada (${userId})`, error);
    }
  }

  /**
   * Conta um uso e devolve o total na janela. Cache fora do ar não pode travar
   * o login: nesse caso devolve 0 e o limite fica sem efeito até ele voltar.
   */
  private async countUsage(key: string): Promise<number> {
    try {
      const next = bumpUsageWindow(
        await this.cacheManager.get<TUsageWindow>(key),
      );

      await this.cacheManager.set(key, next, next.resetAt - Date.now());

      return next.count;
    } catch (error) {
      this.logger.error(`Contagem de uso indisponível (${key})`, error);
      return 0;
    }
  }

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
    const sends = await this.countUsage(
      `auth:code-sends:${body.email.toLowerCase()}`,
    );

    // Sem teto, o endpoint serve para lotar a caixa de alguém e gastar envios
    if (sends > AUTH_CODE_MAX_SENDS) {
      throw new HttpException(
        'Muitos códigos pedidos. Tente de novo em alguns minutos.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

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
      // Código novo, contagem nova
      await this.resetAttempts(user.id);
    }

    await this.notificationService.sendEmailOTP(body.email, authCode.code);

    return { isNewUser };
  }

  async validateCode(body: ValidationCodeDto) {
    const user = await this.userService.findByOne({
      email: body.email,
      telephone: body.telephone,
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const authCode = await this.userService.findAuthCode(user.id);

    // Sem código pendente (nunca pedido, já usado ou descartado) nada confere
    if (!authCode?.authCode) {
      throw new UnauthorizedException('Invalid code');
    }

    if (authCode.authCode !== body.code) {
      const attempts = await this.countUsage(this.attemptsKey(user.id));

      // São só 1 milhão de combinações: sem teto, dá para testar todas em 20 min
      if (attempts >= AUTH_CODE_MAX_ATTEMPTS) {
        await this.userService.clearAuthCode(user.id);
        await this.resetAttempts(user.id);

        throw new HttpException(
          'Muitas tentativas. Peça um novo código.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      throw new UnauthorizedException('Invalid code');
    }

    if (authCode.authCodeExpiresAt < new Date()) {
      throw new UnauthorizedException('Code expired');
    }

    // O código vale uma vez: depois de entrar, ele deixa de abrir a conta
    await this.userService.clearAuthCode(
      user.id,
      user.isDeleted ? { isDeleted: false } : {},
    );
    await this.resetAttempts(user.id);

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

  /**
   * Primeiro passo da troca de e-mail: manda um código para o endereço novo.
   * O e-mail só muda depois de confirmar, e o código não abre a conta.
   */
  async requestEmailChange(userId: string, email: string) {
    const nextEmail = email.trim();
    const sends = await this.countUsage(`auth:email-change-sends:${userId}`);

    if (sends > AUTH_CODE_MAX_SENDS) {
      throw new HttpException(
        'Muitos códigos pedidos. Tente de novo em alguns minutos.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const owner = await this.userService.findByOne({ email: nextEmail });

    if (owner && owner.id !== userId) {
      throw new ConflictException('Este e-mail já está em uso');
    }

    const code = generateAuthCode();

    await this.userService.setPendingEmail(
      userId,
      nextEmail,
      code.code,
      code.expiresIn,
    );
    await this.cacheManager
      .del(this.emailChangeAttemptsKey(userId))
      .catch(() => undefined);
    await this.notificationService.sendEmailOTP(nextEmail, code.code);

    return { email: nextEmail };
  }

  /** Confere o código do e-mail novo, troca o e-mail e devolve sessão nova. */
  async confirmEmailChange(userId: string, code: string) {
    const pending = await this.userService.findPendingEmail(userId);

    if (!pending?.pendingEmail || !pending.pendingEmailCode) {
      throw new BadRequestException('No e-mail change pending');
    }

    if (pending.pendingEmailCode !== code) {
      const attempts = await this.countUsage(
        this.emailChangeAttemptsKey(userId),
      );

      if (attempts >= AUTH_CODE_MAX_ATTEMPTS) {
        await this.userService.resolvePendingEmail(userId);

        throw new HttpException(
          'Muitas tentativas. Peça um novo código.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      throw new BadRequestException('Invalid code');
    }

    if (pending.pendingEmailExpiresAt < new Date()) {
      throw new BadRequestException('Code expired');
    }

    // Alguém pode ter cadastrado o endereço enquanto o código esperava
    const owner = await this.userService.findByOne({
      email: pending.pendingEmail,
    });

    if (owner && owner.id !== userId) {
      await this.userService.resolvePendingEmail(userId);
      throw new ConflictException('Este e-mail já está em uso');
    }

    const user = await this.userService.resolvePendingEmail(
      userId,
      pending.pendingEmail,
    );
    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      telephone: user.telephone,
      paymentCustomerId: user.paymentCustomerId,
    });

    return { tokens, user };
  }

  private emailChangeAttemptsKey(userId: string) {
    return `auth:email-change-attempts:${userId}`;
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
