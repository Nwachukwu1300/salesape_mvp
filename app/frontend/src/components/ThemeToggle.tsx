import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <button aria-label="System theme" className={`p-2 rounded ${theme==='system'? 'bg-gray-200 dark:bg-gray-700':''}`} onClick={() => setTheme('system')}>
        <Laptop className="w-4 h-4" />
      </button>
      <button aria-label="Light theme" className={`p-2 rounded ${theme==='light'? 'bg-gray-200 dark:bg-gray-700':''}`} onClick={() => setTheme('light')}>
        <Sun className="w-4 h-4" />
      </button>
      <button aria-label="Dark theme" className={`p-2 rounded ${theme==='dark'? 'bg-gray-200 dark:bg-gray-700':''}`} onClick={() => setTheme('dark')}>
        <Moon className="w-4 h-4" />
      </button>
    </div>
  );
}
