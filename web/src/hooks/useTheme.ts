import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'guia-interactiva:theme:v1';

/**
 * Fuente de verdad del tema. Prioridad:
 *   1. lo que el usuario haya elegido (localStorage)
 *   2. la preferencia del SO (prefers-color-scheme)
 *   3. light por default
 *
 * Se lee UNA vez, antes del primer render, con `useState(initial)`. Asi el DOM
 * arranca ya en el tema correcto y no hay flash de light->dark al montar.
 */
function readInitialTheme(): Theme {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // localStorage bloqueado (modo privado). Caemos al fallback.
  }
  if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    // La clase `dark` en <html> es la que dispara todas las utilities dark: y
    // el switch de --color-* en index.css.
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // idem: si no se puede guardar, la sesion actual sigue funcionando.
    }
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggle };
}
