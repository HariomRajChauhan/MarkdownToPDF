"use client";

import { Clock3, FileType, AlignLeft, BookOpenCheck } from "lucide-react";
import type { DocumentStats } from "@/types";

interface StatsBarProps {
  stats: DocumentStats;
  savedAt: number | null;
}

const cell =
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 tabular-nums";

/** Footer bar with live word analytics and autosave status. */
export default function StatsBar({ stats, savedAt }: StatsBarProps) {
  return (
    <footer
      aria-label="Document statistics"
      className="glass fixed inset-x-0 bottom-0 z-40 w-full border-t border-[var(--border)]"
    >
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 text-xs text-[var(--muted)]">
        <span className={cell} title="Character count">
          <FileType size={13} aria-hidden="true" />
          {stats.characters.toLocaleString()} characters
        </span>
        <span className={cell} title="Word count">
          <AlignLeft size={13} aria-hidden="true" />
          {stats.words.toLocaleString()} words
        </span>
        <span className={cell} title="Line count">
          <BookOpenCheck size={13} aria-hidden="true" />
          {stats.lines.toLocaleString()} lines
        </span>
        <span className={cell} title="Estimated reading time (~200 wpm)">
          <Clock3 size={13} aria-hidden="true" />
          {stats.readingMinutes === 0
            ? "0 min"
            : `${stats.readingMinutes} min read`}
        </span>
        <span className="ml-auto hidden items-center gap-1.5 sm:inline-flex" aria-live="polite">
          {savedAt ? (
            <>
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-emerald-500"
              />
              Auto-saved{" "}
              {new Date(savedAt).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </>
          ) : (
            <>Autosave active</>
          )}
        </span>
      </div>
    </footer>
  );
}
