// src/store/slices/booksSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../api/client';
import { Book } from '../../types/book';
import { RootState } from '../index'; // Importar RootState desde el store

interface BooksState {
  items: Book[];
  filteredItems: Book[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  filters: {
    gender: string;
    editorial: string;
    disponibilidad: boolean | null;
    search: string;
  };
}

const initialState: BooksState = {
  items: [],
  filteredItems: [],
  loading: false,
  error: null,
  pagination: {
    page: 0,
    pageSize: 10,
    total: 0,
  },
  filters: {
    gender: '',
    editorial: '',
    disponibilidad: null,
    search: '',
  },
};

export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const { page, pageSize } = state.books.pagination;
      const { gender, editorial, disponibilidad, search } = state.books.filters;
      
      const params = {
        page: page + 1,
        limit: pageSize,
        gender,
        editorial,
        disponibilidad,
        search,
      };
      
      const response = await apiClient.get('/books', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error desconocido');
    }
  }
);

export const createBook = createAsyncThunk(
  'books/createBook',
  async (bookData: Omit<Book, 'id'>, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/books', bookData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear libro');
    }
  }
);

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<BooksState['filters']>>) {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 0;
    },
    setPagination(state, action: PayloadAction<Partial<BooksState['pagination']>>) {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    resetBooksState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action: PayloadAction<{ data: Book[]; total: number }>) => {
        state.loading = false;
        state.items = action.payload.data;
        state.filteredItems = action.payload.data; // Puedes añadir lógica de filtrado aquí
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Error al cargar libros';
      })
      .addCase(createBook.fulfilled, (state, action: PayloadAction<Book>) => {
        state.items.unshift(action.payload);
        state.filteredItems.unshift(action.payload);
      })
      .addCase(createBook.rejected, (state, action) => {
        state.error = action.payload as string || 'Error al crear libro';
      });
  },
});

export const { setFilters, setPagination, resetBooksState } = booksSlice.actions;
export default booksSlice.reducer;