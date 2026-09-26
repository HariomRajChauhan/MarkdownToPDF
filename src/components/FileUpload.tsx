"use client";

import { useEffect, useRef } from "react";
import { FileUp } from "lucide-react";
import { isMarkdownFile, readFileAsText } from "@/lib/markdown";

interface FileUploadProps {
  /** Called with the parsed file content + original filename. */
  onFileLoaded: (content: string, filename: string) => void;
  onError: (message: string) => void;
  /** Expose a click-handle so the header "Upload" button can open it. */
  inputId?: string;
}

/**
 * Hidden file input for .md / .markdown uploads. The actual drop-zone
 * behaviour lives in the page-level drag & drop overlay; this component
 * only handles the classic "click → pick file" flow.
 */
export default function FileUpload({
  onFileLoaded,
  onError,
  inputId = "mtp-file-input",
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Allow other components to trigger the picker via a custom event or by
  // calling document.getElementById(inputId).click(). Registering globally
  // keeps the header decoupled from this component.
  useEffect(() => {
    const handler = () => inputRef.current?.click();
    window.addEventListener("mtp:open-file-picker", handler);
    return () => window.removeEventListener("mtp:open-file-picker", handler);
  }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!isMarkdownFile(file)) {
      onError("Only .md and .markdown files are supported.");
      return;
    }
    try {
      const content = await readFileAsText(file);
      onFileLoaded(content, file.name);
    } catch {
      onError("Could not read the selected file.");
    }
  };

  return (
    <>
      <label htmlFor={inputId} className="sr-only">
        Upload markdown file
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept=".md,.markdown,text/markdown,text/x-markdown"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.target.value = ""; // allow re-uploading the same file
        }}
      />
      {/* Accessible helper affordance for keyboard users on small screens */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-20 focus:z-50 focus:inline-flex focus:items-center focus:gap-2 focus:rounded-lg focus:border focus:border-[var(--border)] focus:bg-[var(--panel)] focus:px-3 focus:py-2 focus:text-sm"
        aria-label="Choose markdown file to upload"
      >
        <FileUp size={15} aria-hidden="true" /> Choose .md file
      </button>
    </>
  );
}
