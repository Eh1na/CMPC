// src/pages/Auth/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import apiClient from '../../api/client';
import LoginForm from './LoginForm';
import { setAuthCookie } from '../../utils/auth';
import { Box } from '@mui/material';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    setError(null);
    dispatch(loginStart());

    try {
      const response = await apiClient.post('/users/login', values);
      
      setAuthCookie(response.data.user.username);
      dispatch(loginSuccess({
        username: response.data.user.username,
        id: response.data.user.id,
      }));

      navigate('/books');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al iniciar sesión';
      setError(errorMessage);
      dispatch(loginFailure(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'background.default',
        width: '100%'
      }}
    >
      <LoginForm 
        onSubmit={handleLogin} 
        loading={loading} 
        error={error || undefined} 
      />
    </Box>
  );
};

export default LoginPage;