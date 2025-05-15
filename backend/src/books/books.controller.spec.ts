import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { StorageService } from './storage.service';
import {
  NotFoundException,
  ConflictException,
  InternalServerErrorException
} from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PaginatedBooksResponse } from './dto/paginated-books-response.dto';
import { Book } from './entities/book.entity';
import { Response } from 'express';
import { ExcelResponseDto } from './dto/excel-response.dto';

// Mock para el archivo subido
const mockFile = {
  fieldname: 'image',
  originalname: 'test.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  buffer: Buffer.from('test'),
  size: 1024,
} as Express.Multer.File;

// Mock para la respuesta HTTP
const mockResponse = {
  setHeader: jest.fn(),
  send: jest.fn(),
  sendFile: jest.fn(),
} as unknown as Response;

describe('BooksController', () => {
  let controller: BooksController;
  let booksService: jest.Mocked<BooksService>;
  let storageService: jest.Mocked<StorageService>;

  // Mock completo del libro con todas las propiedades requeridas
 const mockBook: Book = {
  id: 1,
  title: 'Cien años de soledad',
  author: 'Gabriel García Márquez',
  editorial: 'Editorial Sudamericana',
  price: 25.99,
  disponibilidad: true,
  gender: 'Novela',
  imageUrl: 'http://example.com/image.jpg',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  
  // Métodos de Sequelize
  save: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  reload: jest.fn(),
  toJSON: jest.fn().mockReturnThis(),
  
  // Propiedades de Sequelize (puedes mockear las que necesites)
  $add: jest.fn(),
  $set: jest.fn(),
  $get: jest.fn(),
  $count: jest.fn(),
  $create: jest.fn(),
  $has: jest.fn(),
  $remove: jest.fn(),
  
  // Otras propiedades que puedan ser necesarias
  _model: {} as any,
  isNewRecord: false,
  
  // Cast para evitar tener que mockear todas las propiedades
} as unknown as Book;

  const mockPaginatedResponse: PaginatedBooksResponse = {
    data: [mockBook],
    meta: {
      total: 1,
      page: 1,
      limit: 10,
      last_page: 1
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        {
          provide: BooksService,
          useValue: {
            
            create: jest.fn().mockResolvedValue({
              message: 'Libro creado exitosamente',
              book: mockBook
            }),
            findAllPaginated: jest.fn().mockImplementation((params) => {
              const parsedParams = {
                page: parseInt(params.page, 10) || 1,
                limit: parseInt(params.limit, 10) || 10,
                ...params
              };
              return Promise.resolve(mockPaginatedResponse);
            }),
            findOne: jest.fn().mockResolvedValue(mockBook),
          updateOne: jest.fn().mockImplementation(async (id, data) => {
            return { ...mockBook, ...data };
          }),
            deleteOne: jest.fn().mockResolvedValue({
              message: 'Libro marcado como eliminado exitosamente',
              bookId: mockBook.id
            }),
            removeImageFromBook: jest.fn().mockResolvedValue(mockBook),
            exportAllBooksToExcel: jest.fn().mockResolvedValue({
              filename: 'libros.xlsx',
              buffer: Buffer.from('excel-content')
            }),
          },
        },
        {
          provide: StorageService,
          useValue: {
            saveBookImage: jest.fn().mockResolvedValue(mockBook.imageUrl),
            deleteBookImage: jest.fn().mockResolvedValue(undefined),
            getFullImagePath: jest.fn().mockImplementation((filename) =>
              filename ? `/path/to/images/${filename}` : null
            ),
            deleteImageByUrl: jest.fn().mockResolvedValue(undefined),
            
          },
        },
      ],
    }).compile();

    controller = module.get<BooksController>(BooksController);
    booksService = module.get(BooksService);
    storageService = module.get(StorageService);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('debería crear un libro exitosamente sin imagen', async () => {
      const createBookDto: CreateBookDto = {
        title: 'Cien años de soledad',
        author: 'Gabriel García Márquez',
        editorial: 'Editorial Sudamericana',
        price: 25.99,
        disponibilidad: true,
        gender: 'Novela'
      };

      const result = await controller.create(createBookDto);
      expect(result).toEqual({
        message: 'Libro creado exitosamente',
        book: mockBook
      });
      expect(booksService.create).toHaveBeenCalledWith({
        ...createBookDto,
        imageUrl: null,
      });
    });

    it('debería manejar error cuando el libro ya existe', async () => {
      const createBookDto: CreateBookDto = {
        title: 'Cien años de soledad',
        author: 'Gabriel García Márquez',
        editorial: 'Editorial Sudamericana',
        price: 25.99,
        disponibilidad: true,
        gender: 'Novela'
      };

      booksService.create.mockRejectedValue(new ConflictException('El libro ya existe'));

      await expect(controller.create(createBookDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAllPaginated()', () => {
    it('debería retornar libros paginados', async () => {
      const queryParams = {
        page: '1',
        limit: '10',
        search: 'soledad'
      };

      const result = await controller.findAllPaginated(queryParams);
      expect(result).toEqual(mockPaginatedResponse);
      expect(booksService.findAllPaginated).toHaveBeenCalledWith({
        page: '1',
        limit: '10',
        search: 'soledad'
      });
    });
  });

  describe('update()', () => {
    it('debería actualizar un libro exitosamente', async () => {
      const updateBookDto: UpdateBookDto = {
        title: 'El amor en los tiempos del cólera',
        price: 29.99
      };

      const result = await controller.update(mockBook.id, updateBookDto);
      expect(result).toEqual({
        message: 'Libro actualizado exitosamente',
        book: mockBook
      });
    });

    it('debería lanzar NotFoundException si el libro no existe', async () => {
      booksService.updateOne.mockRejectedValue(new NotFoundException('Libro no encontrado'));

      await expect(controller.update(999, { title: 'Nuevo título' }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('remove()', () => {
    it('debería eliminar un libro (soft delete)', async () => {
      const result = await controller.remove(mockBook.id);
      expect(result).toEqual({
        message: 'Libro marcado como eliminado exitosamente',
        bookId: mockBook.id
      });
    });

    it('debería lanzar NotFoundException si el libro no existe', async () => {
      booksService.deleteOne.mockRejectedValue(new NotFoundException('Libro no encontrado'));

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('exportToExcel()', () => {
    it('debería exportar libros a Excel', async () => {
      await controller.exportToExcel(mockResponse);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      expect(mockResponse.send).toHaveBeenCalledWith(Buffer.from('excel-content'));
    });
  });

  describe('getImage()', () => {
    it('debería retornar la imagen del libro', async () => {
      const filename = 'test.jpg';
      await controller.getImage(filename, mockResponse);

      expect(mockResponse.sendFile).toHaveBeenCalledWith(`/path/to/images/${filename}`);
    });

    it('debería lanzar NotFoundException si la imagen no existe', async () => {
      storageService.getFullImagePath.mockReturnValue(null);

      await expect(controller.getImage('nonexistent.jpg', mockResponse))
        .rejects.toThrow(NotFoundException);
    });
  });
});