import { ApiProperty } from '@nestjs/swagger';
import { Book } from '../entities/book.entity';

export class PaginatedBooksMeta {
  @ApiProperty({
    example: 100,
    description: 'Total de libros disponibles'
  })
  total: number;

  @ApiProperty({
    example: 1,
    description: 'Página actual'
  })
  page: number;

  @ApiProperty({
    example: 10,
    description: 'Límite de items por página'
  })
  limit: number;

  @ApiProperty({
    example: 10,
    description: 'Total de páginas disponibles'
  })
  last_page: number;
}

export class PaginatedBooksResponse {
  @ApiProperty({
    type: [Book],
    description: 'Array de libros'
  })
  data: Book[];

  @ApiProperty({
    type: PaginatedBooksMeta,
    description: 'Metadatos de la paginación'
  })
  meta: PaginatedBooksMeta;
}