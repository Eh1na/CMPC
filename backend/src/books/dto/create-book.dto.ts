import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({
    example: 'Cien años de soledad',
    description: 'Título del libro',
    required: true
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Gabriel García Márquez',
    description: 'Autor del libro',
    required: true
  })
  @IsString()
  author: string;

  @ApiProperty({
    example: 'Editorial Sudamericana',
    description: 'Editorial del libro',
    required: true
  })
  @IsString()
  editorial: string;

  @ApiProperty({
    example: 25.99,
    description: 'Precio del libro',
    type: Number,
    required: true
  })
  @IsNumber()
  @Type(() => Number)
  price: number;

  @ApiProperty({
    example: true,
    description: 'Disponibilidad del libro',
    type: Boolean,
    required: true
  })
  @IsBoolean()
  @Type(() => Boolean)
  disponibilidad: boolean;

  @ApiProperty({
    example: 'Novela',
    description: 'Género literario',
    required: true,
    enum: ['Novela', 'Ciencia Ficción', 'Fantasía', 'Histórico', 'Biografía', 'Poesía']
  })
  @IsString()
  gender: string;

  @ApiProperty({
    description: 'URL de la imagen del libro',
    required: false,
    nullable: true
  })
  @IsOptional()
  @IsString()
  imageUrl?: string | null;
}