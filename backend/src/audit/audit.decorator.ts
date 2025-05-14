// src/audit/audit.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const AUDIT_METADATA = 'AUDIT_METADATA';

export interface AuditOptions {
  action: string;
  sensitive?: boolean; // Para no registrar datos sensibles
}

export const Audit = (options: AuditOptions) =>
  SetMetadata(AUDIT_METADATA, options);