// src/components/layout/RootLayout.tsx
import { Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleTheme } from '../../store/slices/themeSlice';
import { 
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Box,
  Tooltip,
  styled
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const APP_BAR_HEIGHT = 64;

const LayoutContainer = styled('div')({
  position: 'relative',
});

const MainContent = styled('div')({
  paddingTop: `${APP_BAR_HEIGHT}px`, // Asegura que el contenido no quede detrás del AppBar
});

const RootLayout = () => {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.theme.darkMode);
  const navigate = useNavigate();

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  const handleLogout = () => {
    // Eliminar la cookie authToken
    document.cookie = 'authToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    // Redirigir a la página de autenticación
    navigate('/auth');
  };

  return (
    <LayoutContainer>
      {/* AppBar con posición fixed y alto z-index */}
      <AppBar 
        position="fixed"  // Cambiado de absolute a fixed
        sx={{ 
          zIndex: (theme) => theme.zIndex.modal - 1, // Justo debajo de los modales
          width: '100%',
          height: `${APP_BAR_HEIGHT}px`,
          backgroundColor: (theme) => theme.palette.background.paper,
          color: (theme) => theme.palette.text.primary,
          boxShadow: 'none',
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`
        }}
      >
        <Toolbar sx={{ minHeight: `${APP_BAR_HEIGHT}px !important` }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CMPC-libros
          </Typography>
          
          {/* Menú de navegación */}
          <Box sx={{ display: 'flex', gap: 2, mr: 4 }}>
            <Button color="inherit" href="/books">Libros</Button>
            <Button color="inherit" onClick={handleLogout}>Cerrar Sesión</Button>
          </Box>

          {/* Botón de cambio de tema */}
          <Tooltip title={darkMode ? 'Modo claro' : 'Modo oscuro'}>
            <IconButton
              color="inherit"
              onClick={handleToggleTheme}
              sx={{ ml: 1 }}
              aria-label="Cambiar tema"
            >
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      
        <Outlet />
      
    </LayoutContainer>
  );
};

export default RootLayout;