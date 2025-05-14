// src/App.tsx
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/AppRouter';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { checkAuthCookie, getAuthCookieUsername } from './utils/auth';
import { loginSuccess } from './store/slices/authSlice';
import { Button } from '@mui/material';
import { toggleTheme } from './store/slices/themeSlice';
import { SnackbarProvider } from 'notistack';
import { Slide } from '@mui/material';

export default function App() {
  const dispatch = useAppDispatch();
  const [initialized, setInitialized] = useState(false);
  const darkMode = useAppSelector((state) => state.theme.darkMode);

  useEffect(() => {
    const initializeAuth = async () => {
      if (checkAuthCookie()) {
        const username = getAuthCookieUsername();
        if (username) {
          dispatch(loginSuccess({ username }));
        }
      }
      setInitialized(true);
    };

    initializeAuth();
  }, [dispatch]);

  if (!initialized) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{  // Posición (centro abajo)
          vertical: 'bottom',
          horizontal: 'center',
        }}
        TransitionComponent={Slide} // Animación de deslizamiento (abajo hacia arriba)
      >
        <RouterProvider router={router} fallbackElement={<div>Loading router...</div>} />
      </SnackbarProvider>

    </div>
  );
}
