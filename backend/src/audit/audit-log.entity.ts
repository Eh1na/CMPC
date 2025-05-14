// src/audit/audit-log.entity.ts
import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

@Table({ tableName: 'audit_logs' })
export class AuditLog extends Model {
  @ApiProperty({ example: 1, description: 'ID del log' })
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ApiProperty({ example: '/api/books', description: 'Ruta accedida' })
  @Column(DataType.STRING)
  route: string;

  @ApiProperty({ example: 'POST', description: 'Método HTTP' })
  @Column(DataType.STRING(10))
  method: string;

  @ApiProperty({ example: 200, description: 'Código de respuesta HTTP' })
  @Column(DataType.INTEGER)
  statusCode: number;

  @ApiProperty({ example: 'admin', description: 'Nombre de usuario' })
  @Column(DataType.STRING)
  username: string;

  @ApiProperty({ example: '127.0.0.1', description: 'IP del cliente' })
  @Column(DataType.STRING)
  ipAddress: string;

  @ApiProperty({ example: 'Mozilla/5.0', description: 'User Agent' })
  @Column(DataType.TEXT)
  userAgent: string;

  @ApiProperty({ example: 'Create book', description: 'Acción realizada' })
  @Column(DataType.STRING)
  action: string;

  @ApiProperty({ example: { title: 'Nuevo libro' }, description: 'Datos enviados' })
  @Column(DataType.JSON)
  params: Record<string, any>;

  @ApiProperty({ example: 1, description: 'ID del usuario' })
  @Column(DataType.INTEGER)
  userId: number;

  @ApiProperty({ example: '2023-05-15T10:00:00Z', description: 'Fecha de creación' })
  @Column(DataType.DATE)
  declare createdAt: Date;
}