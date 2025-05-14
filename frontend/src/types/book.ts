// src/types/book.ts
export interface Book {
  id: number;
  title: string;
  author: string;
  editorial: string;
  price: number;
  disponibilidad: boolean;
  gender: string;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  title?: string;
  author?: string;
  editorial?: string;
  gender?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface ApiResponse {
  data: Book[];
  meta: {
    total: number;
    page: number;
    limit: number;
    last_page: number;
  };
}