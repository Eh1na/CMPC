// src/routes/AppRouter.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import LoginPage from '../pages/Auth/LoginPage';
import RootLayout from '../components/layout/RootLayout';
import { checkAuthCookie } from '../utils/auth';
import BooksPage from '../pages/Books/BooksPage';

const protectedLoader = () => {
  if (!checkAuthCookie()) {
    throw new Response('Unauthorized', { status: 401 });
  }
  return null;
};

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <Navigate to="/auth" replace />,
    children: [
      {
        path: '/',
        element: <div>Home</div>,
        loader: protectedLoader
      },
      {
        path: '/cosa',
        element: <div>Home</div>,
        loader: protectedLoader
      },
      {
        path: '/books',
       element: <BooksPage/>,
        loader: protectedLoader
      },
      {
        path: '/auth',
        element: (
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        ),
      },
    ],
  },
]);