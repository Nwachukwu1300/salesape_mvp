import { createContext, useContext, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  // System-only theme - no manual control
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemPrefersDark() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Apply theme based on system preference
    const apply = (isDark: boolean) => {
      if (isDark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    };

    // Set initial theme
    apply(getSystemPrefersDark());

    // Listen for system preference changes
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => apply(e.matches);
    
    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
    } else {
      mq.addListener(handler as any);
    }

    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', handler as any);
      } else {
        mq.removeListener(handler as any);
      }
    };
  }, []);

  const isDark = getSystemPrefersDark();

  return (
    <ThemeContext.Provider value={{ isDark }}>
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