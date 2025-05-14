import { Injectable, Inject, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { Op, OrderItem } from 'sequelize';
import { PaginatedBooksResponse } from './dto/paginated-books-response.dto';
import * as ExcelJS from 'exceljs';



export interface FindBooksParams {
  page?: number;
  limit?: number;
  search?: string;
  title?: string;
  author?: string;
  editorial?: string;
  gender?: string;
  minPrice?: number;
  maxPrice?: number;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
}


@Injectable()
export class BooksService {
  constructor(
    @Inject('BOOK_REPOSITORY')
    private bookRepository: typeof Book,
  ) { }

  async create(createBookDto: CreateBookDto) {
    try {
      const existingBook = await this.bookRepository.findOne({
        where: { title: createBookDto.title }
      });

      if (existingBook) {
        throw new ConflictException('Ya existe un libro con este título');
      }
      const bookData = {
        ...createBookDto,
        imageUrl: createBookDto.imageUrl ?? null
      };

      const newBook = await this.bookRepository.create(bookData);

      return {
        message: 'Libro creado exitosamente',
        book: newBook.toJSON()
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear el libro: ' + error.message);
    }
  }

  async findAll() {
    try {
      const books = await this.bookRepository.findAll();
      return {
        message: 'Libros obtenidos exitosamente',
        books: books.map(book => book.toJSON())
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener los libros: ' + error.message);
    }
  }


  async findAllPaginated(params: FindBooksParams): Promise<PaginatedBooksResponse> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 10;
      const offset = (page - 1) * limit;
      const where: any = {};

      if (params.search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${params.search}%` } },
          { author: { [Op.iLike]: `%${params.search}%` } },
          { editorial: { [Op.iLike]: `%${params.search}%` } },
        ];
      }

      if (params.title) where.title = { [Op.iLike]: `%${params.title}%` };
      if (params.author) where.author = { [Op.iLike]: `%${params.author}%` };
      if (params.editorial) where.editorial = { [Op.iLike]: `%${params.editorial}%` };
      if (params.gender) where.gender = params.gender;
      if (params.minPrice) where.price = { [Op.gte]: params.minPrice };
      if (params.maxPrice) {
        where.price = where.price || {};
        where.price[Op.lte] = params.maxPrice;
      }

      const order: OrderItem[] = [];
      if (params.sortField && params.sortOrder) {
        order.push([params.sortField, params.sortOrder] as OrderItem);
      }

      const { count, rows } = await this.bookRepository.findAndCountAll({
        where,
        limit,
        offset,
        order,
      });

      return {
        data: rows,
        meta: {
          total: count,
          page,
          limit,
          last_page: Math.ceil(count / limit),
        }
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener libros paginados: ' + error.message);
    }
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.bookRepository.findByPk(id);
    if (!book) {
      throw new NotFoundException(`Libro con ID ${id} no encontrado`);
    }
    return book;
  }


  async updateOne(
    id: number,
    updateData: {
      title?: string;
      author?: string;
      editorial?: string;
      price?: number;
      disponibilidad?: boolean;
      gender?: string;
      imageUrl?: string | null;
    }
  ) {
    try {
      const book = await this.bookRepository.findByPk(id);

      if (!book) {
        throw new NotFoundException(`Libro con ID ${id} no encontrado`);
      }
      if (updateData.title && updateData.title !== book.title) {
        const existingBook = await this.bookRepository.findOne({
          where: { title: updateData.title }
        });
        if (existingBook) {
          throw new ConflictException('Ya existe un libro con este título');
        }
      }


      const updatedBook = await book.update({
        title: updateData.title ?? book.title,
        author: updateData.author ?? book.author,
        editorial: updateData.editorial ?? book.editorial,
        price: updateData.price ?? book.price,
        disponibilidad: updateData.disponibilidad ?? book.disponibilidad,
        gender: updateData.gender ?? book.gender,
        imageUrl: updateData.imageUrl
      });

      return {
        message: 'Libro actualizado exitosamente',
        book: updatedBook.toJSON()
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el libro: ' + error.message);
    }
  }


  async deleteOne(id: number) {
    const book = await this.bookRepository.findByPk(id);
    if (!book) {
      throw new NotFoundException(`Libro con ID ${id} no encontrado`);
    }
    await book.update({
      deletedAt: new Date(),
      disponibilidad: false // Opcional: marcar como no disponible
    });
    await book.destroy(); // Esto hará un soft delete gracias a paranoid: true
    return {
      message: 'Libro marcado como eliminado exitosamente',
      bookId: id
    };
  }

  async removeImageFromBook(id: number): Promise<Book> {
    const book = await this.findOne(id);

    if (!book.imageUrl) {
      throw new NotFoundException('Este libro no tiene imagen asociada');
    }

    return book.update({ imageUrl: null });
  }

  /**
   * Genera libros iniciales (solo para primera carga)
   * @returns Resultado de la operación
   */
  async generateInitialBooks(): Promise<{ message: string, count: number }> {
    try {

      const bookCount = await this.bookRepository.count();
      if (bookCount > 0) {
        return {
          message: 'La base de datos ya contiene libros, no se generaron iniciales',
          count: 0
        };
      }

      const sampleBooks = this.getSampleBooksData();
      await this.bookRepository.bulkCreate(sampleBooks);

      return {
        message: '40 libros iniciales creados exitosamente',
        count: sampleBooks.length
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al generar libros iniciales: ' + error.message);
    }
  }


  async exportAllBooksToExcel(): Promise<{ filename: string; buffer: Buffer }> {
    try {
      // Obtener todos los libros, incluyendo los eliminados
      const books = await this.bookRepository.findAll({
        paranoid: false,
        order: [['id', 'ASC']]
      });
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Libros');

      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Título', key: 'title', width: 30 },
        { header: 'Autor', key: 'author', width: 25 },
        { header: 'Editorial', key: 'editorial', width: 20 },
        { header: 'Precio', key: 'price', width: 15 },
        { header: 'Disponible', key: 'disponibilidad', width: 15 },
        { header: 'Género', key: 'gender', width: 20 },
        { header: 'Creado', key: 'createdAt', width: 25 },
        { header: 'Actualizado', key: 'updatedAt', width: 25 },
        { header: 'Eliminado', key: 'deletedAt', width: 25 }
      ];


      books.forEach(book => {
        worksheet.addRow({
          id: book.id,
          title: book.title,
          author: book.author,
          editorial: book.editorial,
          price: book.price,
          disponibilidad: book.disponibilidad ? 'Sí' : 'No',
          gender: book.gender,
          createdAt: book.createdAt,
          updatedAt: book.updatedAt,
          deletedAt: book.deletedAt || 'No eliminado'
        });
      });


      worksheet.getRow(1).eachCell(cell => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD3D3D3' }
        };
      });


      const buffer = await workbook.xlsx.writeBuffer();

      return {
        filename: `libros_${new Date().toISOString().split('T')[0]}.xlsx`,
        buffer: buffer as Buffer
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al generar el archivo Excel: ' + error.message);
    }
  }

  /**
   * Datos de ejemplo para los libros iniciales
   * @private
   */
  private getSampleBooksData(): Array<{
    title: string;
    author: string;
    editorial: string;
    price: number;
    disponibilidad: boolean;
    gender: string;
  }> {
    const genres = ['Ciencia Ficción', 'Fantasía', 'Histórico', 'Biografía', 'Poesía', 'Ficción'];
    const editorials = ['Penguin', 'Random House', 'Planeta', 'Anaya', 'Santillana'];
    const authors = [
      'Gabriel García Márquez',
      'Jorge Luis Borges',
      'Isabel Allende',
      'Mario Vargas Llosa',
      'Julio Cortázar'
    ];

    return Array.from({ length: 40 }, (_, i) => ({
      title: `Libro de ${authors[i % authors.length].split(' ')[1]}`,
      author: authors[i % authors.length],
      editorial: editorials[i % editorials.length],
      price: parseFloat((Math.random() * 50 + 10).toFixed(2)),
      disponibilidad: Math.random() > 0.3,
      gender: genres[i % genres.length]
    }));
  }
}