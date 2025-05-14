// src/components/layout/AuthLayout.tsx
import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/system';

// Opción 1: Usando styled de MUI (recomendado)
const AuthContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: '#f5f5f5',
  width:'100%'
});

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <AuthContainer>
      {children}
    </AuthContainer>
  );
};

export default AuthLayout;