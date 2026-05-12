import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'cosmic-night';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  resolvedTheme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Use 'cosmic-night' as the default starting point for your aesthetic
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'cosmic-night';
  });

  const [resolvedTheme, setResolvedTheme] = useState<Theme>(theme);

  // 🌍 SHARJAH TIME LOGIC
  useEffect(() => {
    const updateThemeBasedOnTime = () => {
      // If the user manually picked a theme, don't override it
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        setResolvedTheme(savedTheme as Theme);
        return;
      }

      // Check current time in Sharjah
      const now = new Date();
      const hour = now.getHours();

      // Cosmic Night is active from 6 PM (18:00) to 6 AM (06:00)
      if (hour >= 18 || hour < 6) {
        setResolvedTheme('cosmic-night');
      } else {
        setResolvedTheme('light');
      }
    };

    updateThemeBasedOnTime();
    const interval = setInterval(updateThemeBasedOnTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [theme]);

  // Handle manual theme switching (The Sun/Moon button in your header)
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'cosmic-night' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  // Apply the theme class to the HTML body so the CSS variables work
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'cosmic-night');
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
