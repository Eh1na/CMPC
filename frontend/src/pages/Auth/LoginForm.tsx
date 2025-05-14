import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { 
  TextField, 
  Button, 
  Box, 
  Typography,
  CircularProgress,
  useTheme
} from '@mui/material';
import { loginValidationSchema, LoginFormValues } from './LoginValidation';

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => Promise<void>;
  loading: boolean;
  error?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, loading, error }) => {
  const theme = useTheme();
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginValidationSchema),
  });

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        width: '100%',
        maxWidth: 400,
        margin: '0 auto',
        padding: 4,
        borderRadius: 2,
        boxShadow: theme.shadows[6],
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: theme.shadows[8],
        }
      }}
    >
      <Typography 
        variant="h4" 
        component="h1" 
        textAlign="center"
        sx={{
          fontWeight: 600,
          color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main,
          mb: 1
        }}
      >
        Iniciar Sesión
      </Typography>

      {error && (
        <Typography 
          color="error" 
          textAlign="center"
          sx={{
            backgroundColor: theme.palette.error.dark,
            color: theme.palette.error.contrastText,
            py: 1,
            px: 2,
            borderRadius: 1
          }}
        >
          {error}
        </Typography>
      )}

      <TextField
        label="Nombre de Usuario"
        variant="outlined"
        fullWidth
        {...register('username')}
        error={!!errors.username}
        helperText={errors.username?.message}
        disabled={loading}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: theme.palette.divider,
            },
            '&:hover fieldset': {
              borderColor: theme.palette.primary.main,
            },
          },
        }}
      />

      <TextField
        label="Contraseña"
        type="password"
        variant="outlined"
        fullWidth
        {...register('password')}
        error={!!errors.password}
        helperText={errors.password?.message}
        disabled={loading}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: theme.palette.divider,
            },
            '&:hover fieldset': {
              borderColor: theme.palette.primary.main,
            },
          },
        }}
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading}
        sx={{ 
          height: 48,
          mt: 2,
          fontWeight: 600,
          letterSpacing: 1.1,
          fontSize: '1rem',
          textTransform: 'none',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4],
          },
          transition: 'all 0.2s ease',
        }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          'Ingresar'
        )}
      </Button>
    </Box>
  );
};

export default LoginForm;