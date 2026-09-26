"use client";

import { Moon, Sun } from "lucide-react";
import type { Theme } from "@/types";

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

/** Standalone labelled switch used inside the footer / mobile layouts. */
export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const dark = theme === "dark";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={onToggle}
      className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel)] px-2 py-1 text-xs font-medium text-[var(--muted)] shadow-sm transition hover:border-[var(--accent)]"
    >
      <span
        aria-hidden="true"
        className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
          dark ? "bg-indigo-500/20 text-indigo-300" : "bg-amber-100 text-amber-600"
        }`}
      >
        {dark ? <Moon size={13} /> : <Sun size={13} />}
      </span>
      <span className="pr-1">{dark ? "Dark" : "Light"}</span>
    </button>
  );
}
