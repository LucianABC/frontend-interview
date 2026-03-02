import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// 1. Definir los tipos para el contexto
interface ThemeContextType {
  theme: string;
  toggleTheme: () => void;
}

// 2. Crear el contexto
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 3. Crear el Provider
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    // Aplicar el tema al HTML
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 4. Crear un hook personalizado para usar este contexto fácilmente
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};