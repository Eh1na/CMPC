// src/audit/audit.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AuditLog } from './audit-log.entity';
import { Request } from 'express';

@Injectable()
export class AuditService {
  constructor(
    @Inject('AUDIT_LOG_REPOSITORY')
    private readonly auditLogRepository: typeof AuditLog,
  ) { }

  async log(
    req: Request,
    action: string,
    statusCode: number,
    params: Record<string, any>,
    userId: number,
    username: string,
  ): Promise<void> {
    try {
      await this.auditLogRepository.create({
        route: req.route?.path || req.url,
        method: req.method,
        statusCode,
        username,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
        action,
        params,
        userId,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Error al guardar log de auditoría:', error);
    }
  }
}