'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  resolvedTheme: 'light',
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

/** Matches `globals.css` `--color-bg` for dark / light roots (browser chrome / PWA). */
const THEME_COLOR_HEX: Record<'light' | 'dark', string> = {
  dark: '#03183A',
  light: '#F5FBFD',
};

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function syncThemeColorMeta(resolved: 'light' | 'dark') {
  const hex = THEME_COLOR_HEX[resolved];
  document.querySelectorAll('meta[name="theme-color"]').forEach((el) => el.remove());
  const meta = document.createElement('meta');
  meta.setAttribute('name', 'theme-color');
  meta.setAttribute('content', hex);
  document.head.appendChild(meta);
}

function applyTheme(resolved: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', resolved);
  syncThemeColorMeta(resolved);
}

const THEME_STORAGE_KEY = 'spybot-theme-v2';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const themeRef = useRef<Theme>('light');

  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const t = getInitialTheme();
    const s = getSystemTheme();
    /* eslint-disable react-hooks/set-state-in-effect -- one-time sync from localStorage / matchMedia after SSR */
    setThemeState(t);
    setSystemTheme(s);
    /* eslint-enable react-hooks/set-state-in-effect */
    applyTheme(t === 'system' ? s : t);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (themeRef.current !== 'system') return;
      const s = getSystemTheme();
      setSystemTheme(s);
      applyTheme(s);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem(THEME_STORAGE_KEY, t);
    if (t === 'system') {
      const s = getSystemTheme();
      setSystemTheme(s);
      applyTheme(s);
    } else {
      applyTheme(t);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
