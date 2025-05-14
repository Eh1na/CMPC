// src/services/bookService.ts
import apiClient from '../api/client';
import { Book,PaginationParams,ApiResponse } from '../types/book';

export const fetchBooks = async (params: PaginationParams): Promise<ApiResponse> => {
  try {
    const response = await apiClient.get<ApiResponse>('books', { params });
    if (!response.data?.data) {
      throw new Error('Estructura de respuesta inválida');
    }
    return response.data;
  } catch (error: any) {
    if (error.message === 'Token de acceso inválido o expirado') {
      window.location.href = '/login?session_expired=true';
    }
    throw error;
  }
};

export const createBook = async (
  bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>, 
  image?: File
): Promise<Book> => {
  try {
    const formData = new FormData();
    
    // Asegurar que disponibilidad sea enviada como string 'true' o 'false'
    formData.append('title', bookData.title);
    formData.append('author', bookData.author);
    formData.append('editorial', bookData.editorial);
    formData.append('price', String(bookData.price));
    formData.append('disponibilidad', String(bookData.disponibilidad));
    formData.append('gender', bookData.gender);
    
    if (image) {
      formData.append('image', image);
    }

    const response = await apiClient.post('books', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      transformRequest: (data) => data, // Importante para FormData
    });
    
    return response.data;
  } catch (error: any) {
    if (error.message === 'Token de acceso inválido o expirado') {
      window.location.href = '/login?session_expired=true';
    }
    throw error;
  }
};

export const updateBook = async (
  id: number,
  bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>,
  image?: File | null
): Promise<Book> => {
  try {
    const formData = new FormData();
    
    // Agregar campos como strings
    formData.append('title', bookData.title);
    formData.append('author', bookData.author);
    formData.append('editorial', bookData.editorial);
    formData.append('price', String(bookData.price));
    formData.append('disponibilidad', String(bookData.disponibilidad));
    formData.append('gender', bookData.gender);
    
    // Manejo especial para imagen
    if (image) {
      formData.append('image', image);
    } else if (image === null || bookData.imageUrl === null) {
      // Marcar para eliminar imagen existente
      formData.append('imageUrl', 'null');
    }

    const response = await apiClient.put(`books/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error: any) {
    if (error.message === 'Token de acceso inválido o expirado') {
      window.location.href = '/login?session_expired=true';
    }
    throw error;
  }
};

export const deleteBook = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`books/${id}`);
  } catch (error: any) {
    if (error.message === 'Token de acceso inválido o expirado') {
      window.location.href = '/login?session_expired=true';
    }
    throw error;
  }
};

export const deleteBookImage = async (bookId: number): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete(`books/${bookId}/image`);
    return response.data;
  } catch (error: any) {
    if (error.message === 'Token de acceso inválido o expirado') {
      window.location.href = '/login?session_expired=true';
    }
    throw error;
  }
};

export const exportBooksToExcel = async (): Promise<Blob> => {
  try {
    const response = await apiClient.get('books/export/excel', {
      responseType: 'blob'
    });
    return new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  } catch (error: any) {
    if (error.message === 'Token de acceso inválido o expirado') {
      window.location.href = '/login?session_expired=true';
    }
    throw error;
  }
};
