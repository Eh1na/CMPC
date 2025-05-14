// src/hooks/__tests__/useBooks.test.tsx
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBooks } from '../../hooks/useBooks';
import { fetchBooks, createBook, updateBook, deleteBook, exportBooksToExcel, deleteBookImage as dbi } from '../../services/bookService';
import { useSnackbar } from 'notistack';

// Mock de los servicios y dependencias
jest.mock('../../services/bookService');
jest.mock('notistack');

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});

const mockEnqueueSnackbar = jest.fn();
(useSnackbar as jest.Mock).mockReturnValue({ enqueueSnackbar: mockEnqueueSnackbar });

const mockBook = {
  id: 1,
  title: 'Test Book',
  author: 'Test Author',
  editorial: 'Test Editorial',
  price: 29.99,
  disponibilidad: true,
  gender: 'Fiction',
  imageUrl: null,
  createdAt: '2023-01-01',
  updatedAt: '2023-01-01'
};

const mockPagination = {
  page: 1,
  limit: 10,
  total: 1,
  last_page: 1
};

describe('useBooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetchBooks as jest.Mock).mockResolvedValue({
      data: [mockBook],
      meta: mockPagination
    });
  });

  it('debería inicializar correctamente y cargar libros', async () => {
    const { result } = renderHook(() => useBooks({ page: 1, limit: 10 }));

    expect(result.current.loading).toBe(true);
    expect(result.current.books).toEqual([]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.books).toEqual([mockBook]);
      expect(result.current.pagination.total).toBe(mockPagination.total);
    });
  });

  it('debería manejar errores al cargar libros', async () => {
    const errorMessage = 'Error fetching books';
    (fetchBooks as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useBooks({ page: 1, limit: 10 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.books).toEqual([]);
    });
  });

  it('debería agregar un libro correctamente', async () => {
    const newBook = {
      title: 'New Book',
      author: 'New Author',
      editorial: 'New Editorial',
      price: 19.99,
      disponibilidad: true,
      gender: 'Novel'
    };
    (createBook as jest.Mock).mockResolvedValue(mockBook);

    const { result } = renderHook(() => useBooks({ page: 1, limit: 10 }));

    await act(async () => {
      await result.current.addBook(newBook);
    });

    expect(createBook).toHaveBeenCalledWith(newBook, undefined);
    expect(fetchBooks).toHaveBeenCalledTimes(2); // Una para inicializar y otra después de agregar
  });

  it('debería manejar errores al agregar un libro', async () => {
    const errorMessage = 'Error creating book';
    (createBook as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useBooks({ page: 1, limit: 10 }));

    await act(async () => {
      await expect(result.current.addBook(mockBook)).rejects.toThrow(errorMessage);
    });

    expect(mockEnqueueSnackbar).toHaveBeenCalledWith(errorMessage, { variant: 'error' });
  });

  it('debería actualizar un libro correctamente', async () => {
    const updatedBook = { ...mockBook, title: 'Updated Title' };
    (updateBook as jest.Mock).mockResolvedValue(updatedBook);

    const { result } = renderHook(() => useBooks({ page: 1, limit: 10 }));

    await act(async () => {
      const response = await result.current.updateBook(1, updatedBook);
      expect(response).toEqual(updatedBook);
    });

    expect(updateBook).toHaveBeenCalledWith(1, updatedBook, undefined);
    expect(fetchBooks).toHaveBeenCalledTimes(2);
  });

  it('debería eliminar un libro correctamente', async () => {
    (deleteBook as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useBooks({ page: 1, limit: 10 }));

    await act(async () => {
      await result.current.deleteBook(1);
    });

    expect(deleteBook).toHaveBeenCalledWith(1);
    expect(fetchBooks).toHaveBeenCalledTimes(2);
  });

  it('debería exportar libros a Excel', async () => {
    const mockBlob = new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    (exportBooksToExcel as jest.Mock).mockResolvedValue(mockBlob);

    const { result } = renderHook(() => useBooks({ page: 1, limit: 10 }));

    await act(async () => {
      const blob = await result.current.exportBooksToExcel();
      expect(blob).toEqual(mockBlob);
    });

    expect(exportBooksToExcel).toHaveBeenCalledTimes(1);
  });

  it('debería eliminar la imagen de un libro', async () => {
    (dbi as jest.Mock).mockResolvedValue({ message: 'Imagen eliminada' });

    const { result } = renderHook(() => useBooks({ page: 1, limit: 10 }));

    await act(async () => {
      await result.current.deleteBookImage(1);
    });

    expect(dbi).toHaveBeenCalledWith(1);
    expect(fetchBooks).toHaveBeenCalledTimes(2);
  });

  it('debería manejar errores al eliminar imagen', async () => {
    const errorMessage = 'Error deleting image';
    (dbi as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useBooks({ page: 1, limit: 10 }));

    await act(async () => {
      await expect(result.current.deleteBookImage(1)).rejects.toThrow(errorMessage);
    });

    expect(mockEnqueueSnackbar).toHaveBeenCalledWith(errorMessage, {
      variant: 'error',
      anchorOrigin: { vertical: 'top', horizontal: 'center' }
    });
  });
});