// src/hooks/useTheme.ts
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleTheme, setTheme } from '../store/slices/themeSlice';

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.theme.darkMode);

  return {
    darkMode,
    toggleTheme: () => dispatch(toggleTheme()),
    setTheme: (mode: boolean) => dispatch(setTheme(mode)),
  };
};