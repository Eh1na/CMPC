// src/utils/auth.ts
export const setAuthCookie = (username: string) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + 4 * 60 * 60 * 1000); // 4 horas
  
  document.cookie = `authToken=${username}; expires=${expires.toUTCString()}; path=/`;
};

export const removeAuthCookie = () => {
  document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

export const checkAuthCookie = () => {
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='));
  
  if (!authCookie) return false;
  
  // Verificar expiración
  const expiresMatch = authCookie.match(/expires=([^;]+)/);
  if (expiresMatch) {
    const expiresDate = new Date(expiresMatch[1]);
    if (expiresDate < new Date()) {
      removeAuthCookie();
      return false;
    }
  }
  
  return true;
};

export const getAuthCookieUsername = () => {
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='));
  return authCookie ? authCookie.split('=')[1] : null;
};