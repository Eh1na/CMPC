// src/hooks/useBooks.ts
import { useState, useEffect } from 'react';
import { fetchBooks, createBook, updateBook, deleteBook, exportBooksToExcel, deleteBookImage as dbi } from '../services/bookService';
import { Book, PaginationParams } from '../types/book';
import { useSnackbar } from 'notistack';

interface UseBooksReturn {
  books: Book[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    limit: number;
    total: number;
    lastPage: number;
  };
  fetchBooks: (params: PaginationParams) => Promise<void>;
  addBook: (
    bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>,
    image?: File
  ) => Promise<Book>;

  updateBook: (
    id: number,
    bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>,
    image?: File | null
  ) => Promise<Book>;
  deleteBook: (id: number) => Promise<void>;
  exportBooksToExcel: () => Promise<Blob>;
  deleteBookImage: (bookId: number) => Promise<void>;
}

export const useBooks = (initialParams: PaginationParams): UseBooksReturn => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: initialParams.page,
    pageSize: initialParams.limit,
    limit: initialParams.limit,
    total: 0,
    lastPage: 0
  });
  const { enqueueSnackbar } = useSnackbar();

  const fetchBooksData = async (params: PaginationParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchBooks(params);
      setBooks(response.data);
      setPagination(prev => ({
        ...prev,
        page: params.page,
        pageSize: params.limit,
        limit: params.limit,
        total: response.meta.total,
        lastPage: response.meta.last_page
      }));
    } catch (err: any) {
      console.error('Error fetching books:', err);
      setError(err.response?.data?.message || err.message || 'Error al cargar libros');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const addBookData = async (
    bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>,
    image?: File
  ) => {
    setLoading(true);
    try {
      const result = await createBook({
        ...bookData,
        disponibilidad: Boolean(bookData.disponibilidad)
      }, image);

      await fetchBooksData({
        ...initialParams,
        page: 1,
        limit: pagination.limit
      });
      return result;
    } catch (err: any) {
      enqueueSnackbar(err.message || 'Error al crear el libro', { variant: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBookData = async (
    id: number,
    bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>,
    image?: File | null
  ) => {
    setLoading(true);
    try {
      const updatedBook = await updateBook(id, bookData, image);
      await fetchBooksData({
        ...initialParams,
        page: pagination.page,
        limit: pagination.limit
      });
      return updatedBook;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error al actualizar el libro');
    } finally {
      setLoading(false);
    }
  };

  const deleteBookData = async (id: number) => {
    setLoading(true);
    try {
      await deleteBook(id);
      await fetchBooksData({
        ...initialParams,
        page: pagination.page,
        limit: pagination.limit
      });
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleExportBooksToExcel = async (): Promise<Blob> => {
    setLoading(true);
    try {
      const blob = await exportBooksToExcel();
      return blob;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteBookImage = async (bookId: number): Promise<void> => {
    setLoading(true);
    try {
      await dbi(bookId);
     
      await fetchBooksData(initialParams);
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : 'Error al eliminar la imagen', {
        variant: 'error',
        anchorOrigin: { vertical: 'top', horizontal: 'center' }
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooksData(initialParams);
  }, []);

  return {
    books,
    loading,
    error,
    pagination,
    fetchBooks: fetchBooksData,
    addBook: addBookData,
    updateBook: updateBookData,
    deleteBook: deleteBookData,
    exportBooksToExcel: handleExportBooksToExcel,
    deleteBookImage
  };
};