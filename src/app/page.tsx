"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Inbox } from "lucide-react";
import Header from "@/components/Header";
import MarkdownEditor from "@/components/MarkdownEditor";
import MarkdownPreview from "@/components/MarkdownPreview";
import FileUpload from "@/components/FileUpload";
import StatsBar from "@/components/StatsBar";
import TemplateSelector from "@/components/TemplateSelector";
import ToastContainer from "@/components/ToastContainer";
import type { FullscreenTarget } from "@/components/Toolbar";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useTheme } from "@/hooks/useTheme";
import { useToasts } from "@/hooks/useToasts";
import {
  DEFAULT_MARKDOWN,
  copyToClipboard,
  downloadTextFile,
  getDocumentStats,
  isMarkdownFile,
  readFileAsText,
  sanitizeFilename,
} from "@/lib/markdown";
import { exportElementToPdf } from "@/lib/pdf";
import type { Template, Theme } from "@/types";

const AUTOSAVE_KEY = "mtp:document";
const FILENAME_KEY = "mtp:filename";

export default function Home() {
  const { toasts, toast, dismiss } = useToasts();

  // ---- Theme -----------------------------------------------------------
  const themeRef = useRef<Theme>("light");
  const { theme, toggleTheme } = useTheme((t) => {
    themeRef.current = t;
    toast(`Switched to ${t === "dark" ? "dark" : "light"} mode`, "info");
  });
  themeRef.current = theme;

  // ---- Document state (auto-save via localStorage) ----------------------
  const {
    value: markdown,
    setValue: setMarkdown,
    hydrated,
  } = useLocalStorage<string>(AUTOSAVE_KEY, DEFAULT_MARKDOWN);
  const { value: filename, setValue: setFilename } = useLocalStorage<string>(
    FILENAME_KEY,
    "document"
  );

  // Debounced "last saved" indicator for the footer.
  const [savedAt, setSavedAt] = useState<number | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    const id = setTimeout(() => setSavedAt(Date.now()), 1200);
    return () => clearTimeout(id);
  }, [markdown, hydrated]);

  // ---- Refs & fullscreen ------------------------------------------------
  const previewContentRef = useRef<HTMLElement | null>(null);
  const [fullscreen, setFullscreen] = useState<FullscreenTarget>(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const toggleFullscreen = useCallback((target: "editor" | "preview") => {
    setFullscreen((prev) => (prev === target ? null : target));
  }, []);

  // ---- Stats ------------------------------------------------------------
  const stats = useMemo(() => getDocumentStats(markdown), [markdown]);

  // ---- File loading (upload + drag & drop) ------------------------------
  const loadFile = useCallback(
    async (file: File) => {
      if (!isMarkdownFile(file)) {
        toast("Only .md and .markdown files are supported.", "error");
        return;
      }
      try {
        const content = await readFileAsText(file);
        setMarkdown(content);
        setFilename(sanitizeFilename(file.name));
        toast(`File uploaded: ${file.name}`, "success");
      } catch {
        toast("Could not read the dropped file.", "error");
      }
    },
    [setMarkdown, setFilename, toast]
  );

  const handleFileLoaded = useCallback(
    (content: string, name: string) => {
      setMarkdown(content);
      setFilename(sanitizeFilename(name));
      toast(`File uploaded: ${name}`, "success");
    },
    [setMarkdown, setFilename, toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) void loadFile(file);
    },
    [loadFile]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current += 1;
    if (e.dataTransfer.types?.includes("Files")) setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setDragActive(false);
    }
  }, []);

  // ---- Header actions ----------------------------------------------------
  const openFilePicker = useCallback(() => {
    window.dispatchEvent(new Event("mtp:open-file-picker"));
  }, []);

  const handleCopyMarkdown = useCallback(async () => {
    const ok = await copyToClipboard(markdown);
    toast(ok ? "Markdown copied to clipboard" : "Copy failed", ok ? "success" : "error");
  }, [markdown, toast]);

  const handleCopyHtml = useCallback(async () => {
    const el = previewContentRef.current;
    if (!el) {
      toast("Preview is not ready yet.", "error");
      return;
    }
    const ok = await copyToClipboard(el.innerHTML);
    toast(ok ? "HTML copied to clipboard" : "Copy failed", ok ? "success" : "error");
  }, [toast]);

  const handleDownloadMd = useCallback(() => {
    downloadTextFile(markdown, `${sanitizeFilename(filename)}.md`);
    toast("Markdown downloaded", "success");
  }, [markdown, filename, toast]);

  const handleDownloadPdf = useCallback(async () => {
    const el = previewContentRef.current;
    if (!el) {
      toast("Preview is not ready yet.", "error");
      return;
    }
    setExportingPdf(true);
    try {
      await exportElementToPdf(el, {
        filename: `${sanitizeFilename(filename)}.pdf`,
        marginMm: 10,
        scale: 2,
      });
      toast("PDF downloaded", "success");
    } catch {
      toast("PDF export failed. Please try again.", "error");
    } finally {
      setExportingPdf(false);
    }
  }, [filename, toast]);

  const handleTemplate = useCallback(
    (template: Template) => {
      setMarkdown(template.content);
      setFilename(sanitizeFilename(template.id));
      toast(`Loaded template: ${template.name}`, "success");
    },
    [setMarkdown, setFilename, toast]
  );

  const handleThemeToggle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  return (
    <div
      className="flex min-h-screen flex-col"
      onDragEnter={handleDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Header
        theme={theme}
        onToggleTheme={handleThemeToggle}
        onUploadClick={openFilePicker}
        onTemplatesClick={() => setTemplatesOpen(true)}
        onCopyMarkdown={handleCopyMarkdown}
        onCopyHtml={handleCopyHtml}
        onDownloadMd={handleDownloadMd}
        onDownloadPdf={handleDownloadPdf}
        exportingPdf={exportingPdf}
      />

      <FileUpload onFileLoaded={handleFileLoaded} onError={(m) => toast(m, "error")} />

      <main
        aria-label="Editor and preview workspace"
        className={`mx-auto grid w-full max-w-[1600px] flex-1 gap-4 px-4 pb-16 pt-4 lg:h-[calc(100dvh-8rem)] lg:min-h-0 lg:grid-cols-2`}
      >
        <MarkdownEditor
          value={markdown}
          onChange={setMarkdown}
          stats={stats}
          fullscreen={fullscreen}
          onToggleFullscreen={toggleFullscreen}
        />
        <MarkdownPreview
          markdown={markdown}
          theme={theme}
          contentRef={previewContentRef}
          fullscreen={fullscreen === "preview"}
          onToggleFullscreen={() => toggleFullscreen("preview")}
        />
      </main>

      <StatsBar stats={stats} savedAt={savedAt} />

      <TemplateSelector
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onSelect={handleTemplate}
      />

      {/* Drag & drop overlay */}
      {dragActive && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[95] flex items-center justify-center bg-blue-950/40 backdrop-blur-sm"
        >
          <div className="glass flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-blue-400 px-12 py-10 text-blue-100">
            <Inbox size={40} strokeWidth={1.5} aria-hidden="true" />
            <p className="text-lg font-semibold">Drop your .md file to import</p>
            <p className="text-sm opacity-80">Markdown will load instantly</p>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
