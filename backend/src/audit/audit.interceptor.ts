// src/audit/audit.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { AuditService } from './audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest() as any;
    const user = request.user || { id: 0, username: 'anonymous' };

    const now = Date.now();
    const action = `${context.getClass().name}.${context.getHandler().name}`;

    return next.handle().pipe(
      tap({
        next: (response) => {
          this.auditService.log(
            request,
            action,
            response?.statusCode || 200,
            { ...request.body, ...request.params, ...request.query },
            user.id,
            user.username,
          );
        },
        error: (err) => {
          this.auditService.log(
            request,
            action,
            err.status || 500,
            { ...request.body, ...request.params, ...request.query },
            user.id,
            user.username,
          );
        },
      }),
    );
  }
}