import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { mergeMap, type Observable } from 'rxjs';
import { buildRequestAuditEntry, shouldAudit } from './audit.helpers';
import { AuditService } from './audit.service';
import type { TAuditedRequest } from './audit.types';

/**
 * Registra toda alteração feita pelo painel, pela API pública e pelo painel da
 * plataforma, sem cada controller precisar lembrar. Só o que deu certo: o que
 * falhou não mudou nada. Um insert antes de responder: erro dele só vai para o
 * log (`AuditService.record`), nunca para quem chamou.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const http = context.switchToHttp();
    const request = http.getRequest<TAuditedRequest>();

    if (!shouldAudit(request)) return next.handle();

    return next.handle().pipe(
      mergeMap(async (body) => {
        const { statusCode } = http.getResponse<{ statusCode: number }>();

        await this.auditService.record(
          buildRequestAuditEntry(request, statusCode, body),
        );

        return body;
      }),
    );
  }
}
