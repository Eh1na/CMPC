import { fetchBooks } from '../../services/bookService';
import apiClient from '../../api/client';
import { mocked } from 'jest-mock';

jest.mock('../../api/client');

const mockedClient = apiClient as jest.Mocked<typeof apiClient>;

describe('bookService', () => {
  it('fetchBooks retorna datos correctamente', async () => {
    const mockData = {
      data: [{ id: 1, title: 'Libro 1' }],
      meta: { total: 1, last_page: 1 }
    };
    mockedClient.get.mockResolvedValue({ data: mockData });

    const result = await fetchBooks({ page: 1, limit: 10 });
    expect(result).toEqual(mockData);
    expect(mockedClient.get).toHaveBeenCalledWith('books', { params: { page: 1, limit: 10 } });
  });

  it('fetchBooks lanza error con estructura inválida', async () => {
    mockedClient.get.mockResolvedValue({ data: {} });

    await expect(fetchBooks({ page: 1, limit: 10 })).rejects.toThrow('Estructura de respuesta inválida');
  });
});
