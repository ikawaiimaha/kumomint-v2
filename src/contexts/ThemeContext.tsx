import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'cosmic-night';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark'); // Default
  const [resolvedTheme, setResolvedTheme] = useState<Theme>('dark');

  useEffect(() => {
    const updateTheme = () => {
      const hour = new Date().getHours();
      const isNightTime = hour >= 18 || hour < 6; // 6 PM to 6 AM

      if (isNightTime) {
        setResolvedTheme('cosmic-night');
        document.documentElement.classList.add('cosmic-night');
        document.documentElement.classList.remove('light', 'dark');
      } else {
        setResolvedTheme(theme);
        document.documentElement.classList.add(theme);
        document.documentElement.classList.remove('cosmic-night');
      }
    };

    updateTheme();
    const interval = setInterval(updateTheme, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
