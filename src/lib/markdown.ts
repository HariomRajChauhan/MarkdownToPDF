import type { DocumentStats } from "@/types";

export const DEFAULT_MARKDOWN = `# Welcome

Start writing markdown here.
`;

/** Compute live document statistics for the editor / footer. */
export function getDocumentStats(markdown: string): DocumentStats {
  const characters = markdown.length;
  const trimmed = markdown.trim();
  const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
  const lines = markdown.length === 0 ? 0 : markdown.split(/\r\n|\r|\n/).length;
  // ~200 words per minute average reading speed.
  const readingMinutes = Math.max(words === 0 ? 0 : 1, Math.round(words / 200));
  return { characters, words, lines, readingMinutes };
}

/** Turn arbitrary text into a safe download filename (without extension). */
export function sanitizeFilename(name: string): string {
  const cleaned = name
    .replace(/\.(md|markdown|pdf)$/i, "")
    .replace(/[^a-zA-Z0-9-_ ]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
  return cleaned || "document";
}

/** Trigger a client-side download of a text blob. */
export function downloadTextFile(
  content: string,
  filename: string,
  mime = "text/markdown;charset=utf-8"
): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke on the next tick so Safari has time to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Copy text to clipboard with a legacy fallback for non-secure contexts. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy path
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

/** Read an uploaded File as UTF-8 text. */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, "utf-8");
  });
}

/** True when the file looks like a markdown document. */
export function isMarkdownFile(file: File): boolean {
  return (
    /\.(md|markdown)$/i.test(file.name) ||
    file.type === "text/markdown" ||
    file.type === "text/x-markdown"
  );
}
