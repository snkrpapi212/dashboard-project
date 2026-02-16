import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

/* --------------------------------------------------------------------------
   Types
   -------------------------------------------------------------------------- */

export type ThemeMode = 'light' | 'dark' | 'high-contrast';

export interface ThemeContextType {
  /** Current active theme */
  theme: ThemeMode;
  /** Set a specific theme */
  setTheme: (theme: ThemeMode) => void;
  /** Toggle between light and dark */
  toggleTheme: () => void;
  /** Whether current theme is dark mode */
  isDark: boolean;
}

/* --------------------------------------------------------------------------
   Constants
   -------------------------------------------------------------------------- */

const STORAGE_KEY = 'dashboard-theme';
const THEME_ATTRIBUTE = 'data-theme';

const VALID_THEMES: ThemeMode[] = ['light', 'dark', 'high-contrast'];

/* --------------------------------------------------------------------------
   Context
   -------------------------------------------------------------------------- */

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
  isDark: false,
});

/* --------------------------------------------------------------------------
   Helper: detect system preference
   -------------------------------------------------------------------------- */

function getSystemPreference(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getSavedTheme(): ThemeMode | null {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && VALID_THEMES.includes(saved as ThemeMode)) {
    return saved as ThemeMode;
  }
  return null;
}

/* --------------------------------------------------------------------------
   Provider
   -------------------------------------------------------------------------- */

export interface ThemeProviderProps {
  children: ReactNode;
  /** Override the default theme */
  defaultTheme?: ThemeMode;
}

export function ThemeProvider({ children, defaultTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    // Priority: saved > default > system preference
    return getSavedTheme() ?? defaultTheme ?? getSystemPreference();
  });

  // Apply theme attribute and persist
  useEffect(() => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // Listen for system preference changes (only if no manual override)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user has not manually selected a theme
      if (!getSavedTheme()) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    if (VALID_THEMES.includes(newTheme)) {
      setThemeState(newTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

/* --------------------------------------------------------------------------
   Hook
   -------------------------------------------------------------------------- */

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/* --------------------------------------------------------------------------
   FOUC Prevention Script
   Inline this in <head> before CSS loads to prevent flash of wrong theme
   -------------------------------------------------------------------------- */

export const themeInitScript = `
(function() {
  try {
    var saved = localStorage.getItem('${STORAGE_KEY}');
    var theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('${THEME_ATTRIBUTE}', theme);
  } catch (e) {}
})();
`;
