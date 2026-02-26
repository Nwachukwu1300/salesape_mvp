import { createContext, useContext, useEffect, ReactNode, useState } from "react";

type ThemeChoice = 'system' | 'light' | 'dark';

interface ThemeContextType {
  isDark: boolean;
  theme: ThemeChoice;
  setTheme: (t: ThemeChoice) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemPrefersDark() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>(() => {
    if (typeof window === 'undefined') return 'system';
    try {
      const saved = localStorage.getItem('themeChoice') as ThemeChoice | null;
      return saved || 'system';
    } catch (e) {
      return 'system';
    }
  });

  useEffect(() => {
    const apply = (choice: ThemeChoice) => {
      const isDark = choice === 'dark' ? true : choice === 'light' ? false : getSystemPrefersDark();
      if (isDark) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark');
    };

    apply(theme);

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (theme === 'system') apply('system');
    };

    if (mq.addEventListener) mq.addEventListener('change', handler); else mq.addListener(handler as any);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler as any); else mq.removeListener(handler as any);
    };
  }, [theme]);

  const setTheme = (t: ThemeChoice) => {
    try { localStorage.setItem('themeChoice', t); } catch (e) {}
    setThemeState(t);
  };

  const isDark = theme === 'dark' ? true : theme === 'light' ? false : getSystemPrefersDark();

  return <ThemeContext.Provider value={{ isDark, theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
