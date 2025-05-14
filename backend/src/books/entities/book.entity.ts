import { Table, Column, Model, PrimaryKey, AutoIncrement, DataType } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

interface BookCreationAttributes {
  title: string;
  author: string;
  editorial: string;
  price: number;
  disponibilidad: boolean;
  gender: string;
  imageUrl?: string | null;
}

@Table({
  tableName: 'books',
  timestamps: true,
  paranoid: true,
})
export class Book extends Model<Book, BookCreationAttributes> {
  @ApiProperty({
    example: 1,
    description: 'ID único del libro',
    readOnly: true
  })
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number;

  @ApiProperty({
    example: 'Cien años de soledad',
    description: 'Título del libro',
    required: true
  })
  @Column
  declare title: string;

  @ApiProperty({
    example: 'Gabriel García Márquez',
    description: 'Autor del libro',
    required: true
  })
  @Column
  declare author: string;

  @ApiProperty({
    example: 'Editorial Sudamericana',
    description: 'Editorial que publicó el libro',
    required: true
  })
  @Column
  declare editorial: string;

  @ApiProperty({
    example: 25.99,
    description: 'Precio del libro en dólares',
    type: 'number',
    format: 'float',
    minimum: 0
  })
  @Column
  declare price: number;

  @ApiProperty({
    example: true,
    description: 'Disponibilidad actual del libro',
    type: 'boolean',
    default: true
  })
  @Column
  declare disponibilidad: boolean;

  @ApiProperty({
    example: 'Realismo mágico',
    description: 'Género literario',
    enum: ['Novela', 'Ciencia Ficción', 'Fantasía', 'Realismo mágico', 'Biografía', 'Poesía']
  })
  @Column
  declare gender: string;

  @ApiProperty({
    example: 'https://ejemplo.com/imagen.jpg',
    description: 'URL de la imagen de portada',
    nullable: true,
    required: false
  })
  @Column({
    type: DataType.STRING(512),
    allowNull: true,
  })
  declare imageUrl: string | null;

  @ApiProperty({
    example: '2023-05-14T12:00:00.000Z',
    description: 'Fecha de creación del registro',
    type: 'string',
    format: 'date-time',
    readOnly: true
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW
  })
  declare createdAt: Date;

  @ApiProperty({
    example: '2023-05-14T12:30:00.000Z',
    description: 'Fecha de última actualización',
    type: 'string',
    format: 'date-time',
    readOnly: true
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW
  })
  declare updatedAt: Date;

  @ApiProperty({
    example: null,
    description: 'Fecha de eliminación (soft delete)',
    type: 'string',
    format: 'date-time',
    nullable: true,
    readOnly: true
  })
  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare deletedAt: Date | null;
}