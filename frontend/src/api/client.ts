// src/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true, // Envía cookies HttpOnly automáticamente
  timeout: 10000,
  headers: {
    
    'Accept': 'application/json'
  }
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    // Manejo de errores de conexión
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timeout'));
    }
    
    if (!error.response) {
      return Promise.reject(new Error('Network error'));
    }

    // Manejo específico de errores 401
    if (error.response.status === 401) {
      return Promise.reject(new Error('SESSION_EXPIRED'));
    }

    // Manejo de otros errores
    return Promise.reject(error.response.data?.message || 'Request failed');
  }
);

export default apiClient;