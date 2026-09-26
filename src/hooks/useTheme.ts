"use client";

import { useCallback, useEffect, useState } from "react";
import type { Theme } from "@/types";

const STORAGE_KEY = "mtp:theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // storage unavailable
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Dark / light theme with localStorage persistence and a toggle callback
 * so consumers can surface notifications on change.
 */
export function useTheme(onChanged?: (theme: Theme) => void) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // storage unavailable
      }
      onChanged?.(next);
      return next;
    });
  }, [onChanged]);

  return { theme, toggleTheme } as const;
}
