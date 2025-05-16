import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import { lightColors, darkColors, ColorPalette } from '../theme/colors'; // Importa as paletas

// Define o que o contexto vai fornecer
interface ThemeContextProps {
  theme: 'light' | 'dark';
  colors: ColorPalette;
  // toggleTheme: () => void; // Função para trocar manualmente (opcional)
}

// Cria o contexto
const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// Cria o Provedor
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Detecta o tema inicial do sistema
  const systemColorScheme = useColorScheme(); // 'light', 'dark', ou null
  const [theme, setTheme] = useState<'light' | 'dark'>(systemColorScheme || 'light');

  // Atualiza o tema se o sistema mudar
  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      console.log('System theme changed:', colorScheme);
      setTheme(colorScheme || 'light');
    });
    return () => listener.remove(); // Limpa o listener ao desmontar
  }, []);

  // Seleciona a paleta de cores baseada no tema atual
  const colors = theme === 'dark' ? darkColors : lightColors;

  // Poderia adicionar uma função toggleTheme aqui se quisesse permitir troca manual
  // const toggleTheme = () => setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');

  const themeContextValue: ThemeContextProps = {
    theme,
    colors,
    // toggleTheme,
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook customizado para usar o tema
export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};