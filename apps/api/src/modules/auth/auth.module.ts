import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { NotificationModule } from '../notification';
import { UsersModule } from '../users';
import { AuthController } from './auth.controller';
import { getJwtSecret } from './auth.helpers';
import { AuthService } from './auth.service';
import { GoogleSSOService } from './google-sso.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: getJwtSecret(configService),
        signOptions: {
          expiresIn: '1d',
        },
      }),
    }),
    NotificationModule,
    UsersModule,
  ],
  providers: [AuthService, JwtStrategy, GoogleSSOService],
  exports: [AuthService, JwtModule, PassportModule],
  controllers: [AuthController],
})
export class AuthModule {}
