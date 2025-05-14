// src/providers/ThemeProvider.tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '../store/slices/themeSlice';
import { getTheme } from '../theme/theme';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { RootState } from '../store/index';

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);

  // Cargar el tema guardado al iniciar
  useEffect(() => {
    const savedTheme = localStorage.getItem('themeMode');
    if (savedTheme) {
      dispatch(setTheme(savedTheme === 'dark'));
    }
  }, [dispatch]);

  return (
    <MuiThemeProvider theme={getTheme(darkMode ? 'dark' : 'light')}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

export default ThemeProvider;