import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateBookDto {
  @ApiProperty({
    example: 'El amor en los tiempos del cólera',
    description: 'Título del libro',
    required: false
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    example: 'Gabriel García Márquez',
    description: 'Autor del libro',
    required: false
  })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({
    example: 'Editorial Sudamericana',
    description: 'Editorial del libro',
    required: false
  })
  @IsOptional()
  @IsString()
  editorial?: string;

  @ApiProperty({
    example: 29.99,
    description: 'Precio del libro',
    type: Number,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  price?: number;

  @ApiProperty({
    example: false,
    description: 'Disponibilidad del libro',
    type: Boolean,
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  disponibilidad?: boolean;

  @ApiProperty({
    example: 'Novela',
    description: 'Género literario',
    required: false,
    enum: ['Novela', 'Ciencia Ficción', 'Fantasía', 'Histórico', 'Biografía', 'Poesía']
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({
    description: 'URL de la imagen del libro (envía null para eliminar)',
    required: false,
    nullable: true
  })
  @IsOptional()
  imageUrl?: string | null;
}