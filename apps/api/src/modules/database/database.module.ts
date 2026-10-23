import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          url: configService.get<string>('DB_URL'),
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
          logging: configService.get<boolean>('DB_LOGGING', false),
          ssl: false,
          autoLoadEntities: true,
          // Serverless: default ~10 retries (~30s) turns a bad DB_URL into
          // multi-second TTFB even for Upstash-only routes. Fail fast instead.
          retryAttempts: 1,
          retryDelay: 500,
          extra: {
            max: 5,
            connectionTimeoutMillis: 3000,
            idleTimeoutMillis: 30000,
            statement_timeout: 15000,
          },
        };
      },
    }),
  ],
})
export class DatabaseModule {}
