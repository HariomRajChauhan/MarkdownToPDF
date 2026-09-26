"use client";

import { useEffect, useRef } from "react";
import { Check, X } from "lucide-react";
import type { Template } from "@/types";
import { TEMPLATES } from "@/lib/templates";

interface TemplateSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
}

/** Modal dialog listing the built-in markdown templates. */
export default function TemplateSelector({
  open,
  onClose,
  onSelect,
}: TemplateSelectorProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  // Escape to close + basic focus management.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    firstButtonRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="templates-title"
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close templates dialog"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm"
        tabIndex={-1}
      />

      <div
        ref={dialogRef}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h2 id="templates-title" className="text-sm font-semibold">
            Load a template
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-[var(--muted)] transition hover:bg-[var(--border)] hover:text-[var(--text)]"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <ul className="max-h-[60vh] overflow-y-auto p-3">
          {TEMPLATES.map((t, i) => (
            <li key={t.id}>
              <button
                ref={i === 0 ? firstButtonRef : undefined}
                type="button"
                onClick={() => {
                  onSelect(t);
                  onClose();
                }}
                className="group mb-1 flex w-full items-start gap-3 rounded-xl border border-transparent px-4 py-3 text-left transition hover:border-[var(--border)] hover:bg-[var(--bg)] focus-visible:border-[var(--accent)]"
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600/90 to-indigo-500/90 text-white opacity-90 transition group-hover:opacity-100"
                >
                  <Check size={15} />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-[var(--text)]">
                    {t.name}
                  </span>
                  <span className="block text-xs text-[var(--muted)]">
                    {t.description}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <p className="border-t border-[var(--border)] px-5 py-3 text-[11px] text-[var(--muted)]">
          Loading a template replaces the current document. Your work is
          auto-saved separately — copy it first if unsure.
        </p>
      </div>
    </div>
  );
}
