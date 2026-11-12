import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { AuditLog } from './audit-log.entity';
import { AuditInterceptor } from './audit.interceptor';
import { AuditService } from './audit.service';

/**
 * Global e sem dependência de outros módulos: qualquer serviço registra uma
 * ação sensível (ex.: leitura de anamnese) sem criar ciclo de imports.
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLog, User])],
  providers: [
    AuditService,
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
  exports: [AuditService],
})
export class AuditModule {}
