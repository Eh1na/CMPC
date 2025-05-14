// src/pages/Auth/loginValidation.ts
import * as yup from 'yup';

export interface LoginFormValues {
  username: string;
  password: string;
}

export const loginValidationSchema = yup.object().shape({
  username: yup.string()
    .required('El nombre de usuario es requerido')
    .min(3, 'El usuario debe tener al menos 3 caracteres'),
  password: yup.string()
    .required('La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});