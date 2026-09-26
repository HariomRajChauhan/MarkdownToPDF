"use client";

import {
  Bold,
  CheckSquare,
  Code,
  Heading2,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Quote,
  Strikethrough,
  Table,
} from "lucide-react";

export type FullscreenTarget = "editor" | "preview" | null;

/**
 * Applies a full replacement of the textarea value and restores the
 * selection to `[selStart, selEnd)` in the new text.
 */
export type InsertHandler = (
  newText: string,
  selStart: number,
  selEnd: number
) => void;

interface ToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onInsert: InsertHandler;
  fullscreen: FullscreenTarget;
  onToggleFullscreen: (target: Exclude<FullscreenTarget, null>) => void;
}

type WrapKind = "bold" | "italic" | "strike" | "code" | "link";

const WRAPS: Record<WrapKind, [string, string]> = {
  bold: ["**", "**"],
  italic: ["*", "*"],
  strike: ["~~", "~~"],
  code: ["`", "`"],
  link: ["[", "](https://)"],
};

const btn =
  "inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-[var(--border)] hover:text-[var(--text)] active:scale-95";

/** Markdown formatting toolbar for the editor. */
export default function Toolbar({
  textareaRef,
  onInsert,
  fullscreen,
  onToggleFullscreen,
}: ToolbarProps) {
  const applyWrap = (kind: WrapKind) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const [pre, post] = WRAPS[kind];
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = ta.value.slice(start, end);
    const replacement = `${pre}${selected || "text"}${post}`;
    onInsert(replacement, start, end);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + pre.length, start + pre.length + (selected || "text").length);
    });
  };

  const applyLinePrefix = (prefix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = ta.value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    const next = `${ta.value.slice(0, lineStart)}${prefix}${ta.value.slice(lineStart)}`;
    onInsert(next, 0, ta.value.length);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + prefix.length;
      ta.setSelectionRange(pos, pos);
    });
  };

  const insertBlock = (block: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const needsNewline = start > 0 && ta.value[start - 1] !== "\n";
    const newText = `${ta.value.slice(0, start)}${needsNewline ? "\n" : ""}${block}${ta.value.slice(end)}`;
    const caret = start + (needsNewline ? 1 : 0) + block.length;
    onInsert(newText, caret, caret);
    requestAnimationFrame(() => ta.focus());
  };

  return (
    <div
      role="toolbar"
      aria-label="Markdown formatting toolbar"
      className="flex flex-wrap items-center gap-0.5 border-b border-[var(--border)] bg-[var(--panel)]/60 px-2 py-1.5"
    >
      <button type="button" className={btn} title="Bold (wrap ** **)" aria-label="Bold" onClick={() => applyWrap("bold")}>
        <Bold size={14} aria-hidden="true" />
      </button>
      <button type="button" className={btn} title="Italic (wrap * *)" aria-label="Italic" onClick={() => applyWrap("italic")}>
        <Italic size={14} aria-hidden="true" />
      </button>
      <button type="button" className={btn} title="Strikethrough" aria-label="Strikethrough" onClick={() => applyWrap("strike")}>
        <Strikethrough size={14} aria-hidden="true" />
      </button>
      <span aria-hidden="true" className="mx-1 h-5 w-px bg-[var(--border)]" />
      <button type="button" className={btn} title="Heading" aria-label="Insert heading" onClick={() => applyLinePrefix("## ")}>
        <Heading2 size={14} aria-hidden="true" />
      </button>
      <button type="button" className={btn} title="Bullet list" aria-label="Insert bullet list" onClick={() => applyLinePrefix("- ")}>
        <List size={14} aria-hidden="true" />
      </button>
      <button type="button" className={btn} title="Numbered list" aria-label="Insert numbered list" onClick={() => applyLinePrefix("1. ")}>
        <ListOrdered size={14} aria-hidden="true" />
      </button>
      <button type="button" className={btn} title="Task list" aria-label="Insert task list" onClick={() => applyLinePrefix("- [ ] ")}>
        <CheckSquare size={14} aria-hidden="true" />
      </button>
      <button type="button" className={btn} title="Blockquote" aria-label="Insert blockquote" onClick={() => applyLinePrefix("> ")}>
        <Quote size={14} aria-hidden="true" />
      </button>
      <span aria-hidden="true" className="mx-1 h-5 w-px bg-[var(--border)]" />
      <button type="button" className={btn} title="Inline code" aria-label="Insert inline code" onClick={() => applyWrap("code")}>
        <Code size={14} aria-hidden="true" />
      </button>
      <button type="button" className={btn} title="Link" aria-label="Insert link" onClick={() => applyWrap("link")}>
        <LinkIcon size={14} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={btn}
        title="Insert table"
        aria-label="Insert table"
        onClick={() =>
          insertBlock(
            "| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Cell     | Cell     | Cell     |\n"
          )
        }
      >
        <Table size={14} aria-hidden="true" />
      </button>

      <span aria-hidden="true" className="mx-1 hidden h-5 w-px bg-[var(--border)] sm:block" />
      <div className="ml-auto flex items-center gap-0.5">
        <button
          type="button"
          className={btn}
          title={fullscreen === "editor" ? "Exit fullscreen editor" : "Fullscreen editor"}
          aria-label={fullscreen === "editor" ? "Exit fullscreen editor" : "Fullscreen editor"}
          aria-pressed={fullscreen === "editor"}
          onClick={() => onToggleFullscreen("editor")}
        >
          {fullscreen === "editor" ? (
            <Minimize2 size={14} aria-hidden="true" />
          ) : (
            <Maximize2 size={14} aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          className={btn}
          title={fullscreen === "preview" ? "Exit fullscreen preview" : "Fullscreen preview"}
          aria-label={fullscreen === "preview" ? "Exit fullscreen preview" : "Fullscreen preview"}
          aria-pressed={fullscreen === "preview"}
          onClick={() => onToggleFullscreen("preview")}
        >
          {fullscreen === "preview" ? (
            <Minimize2 size={14} aria-hidden="true" />
          ) : (
            <Maximize2 size={14} aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}
