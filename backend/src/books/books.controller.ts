import { Controller, Get, Post, Body, UseGuards, Query, Put, Param, NotFoundException, ConflictException, InternalServerErrorException, Delete, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { PaginatedBooksResponse } from './dto/paginated-books-response.dto';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    private readonly storageService: StorageService
  ) { }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo libro' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        author: { type: 'string' },
        editorial: { type: 'string' },
        price: { type: 'number' },
        gender: { type: 'string' },
        disponibilidad: { type: 'boolean' },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  @ApiResponse({ status: 201, description: 'Libro creado exitosamente' })
  @ApiResponse({ status: 409, description: 'Conflicto, el libro ya existe' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async create(
    @Body() createBookDto: CreateBookDto,
    @UploadedFile() image?: Express.Multer.File
  ) {
    try {
      const bookData = {
        ...createBookDto,
        imageUrl: image ? await this.storageService.saveBookImage(image) : null
      };

      return await this.booksService.create(bookData);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error creating book: ' + error.message);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener listado paginado de libros' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items por página', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Texto para búsqueda general' })
  @ApiQuery({ name: 'title', required: false, description: 'Filtrar por título' })
  @ApiQuery({ name: 'author', required: false, description: 'Filtrar por autor' })
  @ApiQuery({ name: 'editorial', required: false, description: 'Filtrar por editorial' })
  @ApiQuery({ name: 'gender', required: false, description: 'Filtrar por género' })
  @ApiQuery({ name: 'minPrice', required: false, description: 'Precio mínimo', type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, description: 'Precio máximo', type: Number })
  @ApiQuery({ name: 'sortField', required: false, description: 'Campo para ordenar' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Dirección del orden' })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de libros',
    type: PaginatedBooksResponse
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAllPaginated(@Query() params: any): Promise<PaginatedBooksResponse> {
    try {
      return await this.booksService.findAllPaginated(params);
    } catch (error) {
      throw new InternalServerErrorException('Error fetching books: ' + error.message);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un libro existente' })
  @ApiParam({ name: 'id', description: 'ID del libro', type: Number })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        author: { type: 'string' },
        editorial: { type: 'string' },
        price: { type: 'number' },
        gender: { type: 'string' },
        disponibilidad: { type: 'boolean' },
        imageUrl: { type: 'string', nullable: true },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  @ApiResponse({ status: 200, description: 'Libro actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Libro no encontrado' })
  @ApiResponse({ status: 409, description: 'Conflicto en los datos' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async update(
    @Param('id') id: number,
    @Body() updateBookDto: UpdateBookDto,
    @UploadedFile() image?: Express.Multer.File
  ) {
    try {
      const book = await this.booksService.findOne(id);
      let imageUrl = book.imageUrl; if (image) {
        if (imageUrl) {
          await this.storageService.deleteBookImage(imageUrl);
        }
        imageUrl = await this.storageService.saveBookImage(image);
      } else if (updateBookDto.imageUrl === null) {
        if (imageUrl) {
          await this.storageService.deleteBookImage(imageUrl);
        }
        imageUrl = null;
      }

      const result = await this.booksService.updateOne(id, {
        ...updateBookDto,
        imageUrl
      });

      return result;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating book: ' + error.message);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un libro (borrado lógico - soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del libro', type: Number })
  @ApiResponse({ status: 200, description: 'Libro eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Libro no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async remove(@Param('id') id: number) {
    try {
      const book = await this.booksService.findOne(id);
      if (book.imageUrl) {
        await this.storageService.deleteBookImage(book.imageUrl);
      }

      const result = await this.booksService.deleteOne(id);
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error deleting book: ' + error.message);
    }
  }

  @Get('images/:filename')
  @ApiOperation({ summary: 'Obtener imagen de un libro' })
  @ApiParam({ name: 'filename', description: 'Nombre del archivo de imagen', type: String })
  @ApiResponse({ status: 200, description: 'Archivo de imagen' })
  @ApiResponse({ status: 404, description: 'Imagen no encontrada' })
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    const imagePath = this.storageService.getFullImagePath(filename);

    if (!imagePath) {
      throw new NotFoundException('Image not found');
    }

    res.sendFile(imagePath);
  }

  @Delete(':id/image')
  @ApiOperation({ summary: 'Eliminar imagen de un libro' })
  @ApiParam({ name: 'id', description: 'ID del libro', type: Number })
  @ApiResponse({ status: 200, description: 'Imagen eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Libro no encontrado o no tiene imagen' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async deleteBookImage(
    @Param('id') id: number
  ) {
    const book = await this.booksService.findOne(id);

    if (!book.imageUrl) {
      throw new NotFoundException('Este libro no tiene imagen asociada');
    }

    await this.storageService.deleteImageByUrl(book.imageUrl);

    const updatedBook = await this.booksService.updateOne(id, {
      imageUrl: null
    });

    return {
      message: 'Imagen eliminada correctamente',
      book: updatedBook
    };
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Exportar libros a Excel' })
  @ApiResponse({
    status: 200,
    description: 'Archivo Excel con todos los libros',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: { type: 'string', format: 'binary' }
      }
    }
  })
  @ApiResponse({ status: 500, description: 'Error al generar el archivo Excel' })
  async exportToExcel(@Res() res: Response) {
    try {
      const result = await this.booksService.exportAllBooksToExcel();

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${result.filename}`
      );

      return res.send(result.buffer);
    } catch (error) {
      throw new InternalServerErrorException('Error exporting to Excel: ' + error.message);
    }
  }
}