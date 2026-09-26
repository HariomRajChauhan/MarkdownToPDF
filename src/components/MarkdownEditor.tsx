"use client";

import { useEffect, useRef } from "react";
import Toolbar, { type InsertHandler } from "@/components/Toolbar";
import type { DocumentStats } from "@/types";
import type { FullscreenTarget } from "@/components/Toolbar";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  stats: DocumentStats;
  fullscreen: FullscreenTarget;
  onToggleFullscreen: (target: Exclude<FullscreenTarget, null>) => void;
}

/**
 * Auto-resizing markdown textarea with a formatting toolbar and an
 * inline live word/character/line counter.
 */
export default function MarkdownEditor({
  value,
  onChange,
  stats,
  fullscreen,
  onToggleFullscreen,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize to content height so the editor never shows a nested scrollbar.
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.max(ta.scrollHeight, 240)}px`;
  }, [value, fullscreen]);

  const handleInsert: InsertHandler = (newText, selStart, selEnd) => {
    onChange(newText);
    const ta = textareaRef.current;
    if (ta) {
      requestAnimationFrame(() => {
        ta.setSelectionRange(selStart, selEnd);
      });
    }
  };

  // Keyboard shortcuts: Ctrl/Cmd+B bold, Ctrl/Cmd+I italic.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(e.metaKey || e.ctrlKey)) return;
    const key = e.key.toLowerCase();
    if (key === "b" || key === "i") {
      e.preventDefault();
      const ta = e.currentTarget;
      const wrap = key === "b" ? "**" : "*";
      const { selectionStart: s, selectionEnd: en } = ta;
      const selected = ta.value.slice(s, en) || "text";
      const newText = `${ta.value.slice(0, s)}${wrap}${selected}${wrap}${ta.value.slice(en)}`;
      handleInsert(newText, s + wrap.length, s + wrap.length + selected.length);
    }
  };

  return (
    <section
      aria-label="Markdown editor"
      className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-soft ${
        fullscreen === "editor"
          ? "fixed inset-0 z-50 rounded-none"
          : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Editor
        </h2>
        <p
          className="hidden text-[11px] tabular-nums text-[var(--muted)] sm:block"
          aria-live="off"
        >
          {stats.words.toLocaleString()} words · {stats.characters.toLocaleString()}{" "}
          chars · {stats.lines.toLocaleString()} lines
        </p>
      </div>

      <Toolbar
        textareaRef={textareaRef}
        onInsert={handleInsert}
        fullscreen={fullscreen}
        onToggleFullscreen={onToggleFullscreen}
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck
          aria-label="Markdown source"
          placeholder="# Start writing Markdown…"
          className="markdown-textarea block min-h-[240px] w-full resize-none border-0 bg-transparent p-4 font-mono text-sm leading-relaxed text-[var(--text)] focus:outline-none focus-visible:outline-none"
        />
      </div>
    </section>
  );
}
