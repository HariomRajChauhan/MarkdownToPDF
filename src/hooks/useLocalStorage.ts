import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Persist a piece of state in localStorage (client-side only).
 * Safe against SSR hydration mismatches and private-mode storage errors.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);
  const keyRef = useRef(key);
  keyRef.current = key;

  // Restore value after mount (avoids SSR hydration issues).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(keyRef.current);
      if (stored !== null) {
        setValue(JSON.parse(stored) as T);
      }
    } catch {
      // Ignore malformed / unavailable storage.
    }
    setHydrated(true);
  }, [key]);

  // Write-through on every change once hydrated.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(keyRef.current, JSON.stringify(value));
    } catch {
      // Storage may be full or blocked; fail silently.
    }
  }, [key, value, hydrated]);

  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(keyRef.current);
    } catch {
      // no-op
    }
    setValue(initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { value, setValue, remove, hydrated } as const;
}
