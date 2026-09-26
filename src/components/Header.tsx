"use client";

import { FileUp, FileType2, LayoutTemplate, Moon, Sun } from "lucide-react";
import type { Theme } from "@/types";

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  onUploadClick: () => void;
  onTemplatesClick: () => void;
  onCopyMarkdown: () => void;
  onCopyHtml: () => void;
  onDownloadMd: () => void;
  onDownloadPdf: () => void;
  exportingPdf: boolean;
}

const ghostBtn =
  "inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm font-medium text-[var(--text)] shadow-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";

const primaryBtn =
  "inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70";

/** Application header: logo + all primary actions. */
export default function Header({
  theme,
  onToggleTheme,
  onUploadClick,
  onTemplatesClick,
  onCopyMarkdown,
  onCopyHtml,
  onDownloadMd,
  onDownloadPdf,
  exportingPdf,
}: HeaderProps) {
  return (
    <header className="glass sticky top-0 z-40 w-full">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2 px-4 py-3 sm:gap-3">
        <div className="mr-auto flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-500 text-white shadow-glow"
          >
            <FileType2 size={18} strokeWidth={2.2} />
          </span>
          <div className="leading-tight">
            <h1 className="text-base font-bold tracking-tight">
              Markdown<span className="text-[var(--accent)]">ToPDF</span>
            </h1>
            <p className="hidden text-[11px] text-[var(--muted)] sm:block">
              Write · Preview · Export
            </p>
          </div>
        </div>

        <nav
          aria-label="Main actions"
          className="flex flex-wrap items-center gap-2"
        >
          <button
            type="button"
            onClick={onUploadClick}
            className={ghostBtn}
            aria-label="Upload markdown file"
          >
            <FileUp size={15} aria-hidden="true" />
            <span className="hidden md:inline">Upload</span>
          </button>

          <button
            type="button"
            onClick={onTemplatesClick}
            className={ghostBtn}
            aria-label="Open templates"
          >
            <LayoutTemplate size={15} aria-hidden="true" />
            <span className="hidden md:inline">Templates</span>
          </button>

          <button
            type="button"
            onClick={onCopyMarkdown}
            className={ghostBtn}
            aria-label="Copy markdown source"
          >
            <span className="hidden lg:inline">Copy</span>
            <span className="font-mono text-xs">MD</span>
          </button>

          <button
            type="button"
            onClick={onCopyHtml}
            className={ghostBtn}
            aria-label="Copy rendered HTML"
          >
            <span className="hidden lg:inline">Copy</span>
            <span className="font-mono text-xs">HTML</span>
          </button>

          <button
            type="button"
            onClick={onDownloadMd}
            className={ghostBtn}
            aria-label="Download markdown file"
          >
            <span className="hidden sm:inline">Download</span>
            <span className="font-mono text-xs">.md</span>
          </button>

          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={exportingPdf}
            className={primaryBtn}
            aria-label="Download PDF"
            aria-busy={exportingPdf}
          >
            {exportingPdf ? (
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              />
            ) : (
              <FileDownIcon />
            )}
            {exportingPdf ? "Exporting…" : "Download PDF"}
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            role="switch"
            aria-checked={theme === "dark"}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] shadow-sm transition hover:border-[var(--accent)] active:scale-95"
          >
            {theme === "dark" ? (
              <Sun size={16} aria-hidden="true" />
            ) : (
              <Moon size={16} aria-hidden="true" />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}

function FileDownIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
