import { useLayoutEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'nova-library-theme';

function getInitialTheme() {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
  } catch {
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content', theme === 'dark' ? '#212529' : '#ffffff'
    );

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
    }
  }, [theme]);

  const toggleTheme = () => setTheme(current => current === 'dark' ? 'light' : 'dark');

  return { theme, toggleTheme };
}
