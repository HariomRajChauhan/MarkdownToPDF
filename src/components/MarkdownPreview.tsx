"use client";

import { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneLight,
  oneDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Theme } from "@/types";

interface MarkdownPreviewProps {
  markdown: string;
  theme: Theme;
  /** Ref to the rendered content node (used for PDF export + Copy HTML). */
  contentRef?: React.RefObject<HTMLElement | null>;
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const HIGHLIGHT_LANGS = new Set([
  "javascript",
  "js",
  "typescript",
  "ts",
  "tsx",
  "jsx",
  "python",
  "py",
  "java",
  "go",
  "cpp",
  "c++",
  "c",
  "rust",
  "rs",
  "bash",
  "sh",
  "shell",
  "zsh",
  "json",
  "html",
  "xml",
  "css",
  "scss",
  "sql",
  "yaml",
  "yml",
  "markdown",
  "md",
  "diff",
  "dockerfile",
  "toml",
  "text",
  "plaintext",
]);

/** Map common aliases to prism language ids understood by the highlighter. */
function normalizeLanguage(lang: string | undefined): string {
  if (!lang) return "text";
  const l = lang.toLowerCase();
  const map: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    py: "python",
    rs: "rust",
    cxx: "cpp",
    "c++": "cpp",
    sh: "bash",
    shell: "bash",
    zsh: "bash",
    md: "markdown",
    yml: "yaml",
    xml: "html",
  };
  return map[l] ?? l;
}

type CodeProps = {
  className?: string;
  children?: React.ReactNode;
  node?: unknown;
};

/**
 * Rendered markdown preview with GitHub-Flavored Markdown support,
 * sanitized output (no unsafe HTML execution) and syntax highlighting.
 */
function MarkdownPreview({
  markdown,
  theme,
  contentRef,
  fullscreen = false,
  onToggleFullscreen,
}: MarkdownPreviewProps) {
  const components: Components = {
    code(props) {
      const { className, children } = props as CodeProps;
      // react-markdown v9 no longer passes `inline`; block code is the
      // only case where a language className exists or the text has newlines.
      const match = /language-(\S+)/.exec(className ?? "");
      const text = String(children ?? "");
      const isBlock = Boolean(match) || text.includes("\n");

      if (!isBlock) {
        return <code className={className}>{children}</code>;
      }

      const lang = normalizeLanguage(match?.[1]);
      const style = theme === "dark" ? oneDark : oneLight;

      return (
        <SyntaxHighlighter
          language={HIGHLIGHT_LANGS.has(lang) ? lang : "text"}
          style={style}
          customStyle={{
            margin: 0,
            borderRadius: "0.75rem",
            fontSize: "0.825rem",
            padding: "1rem",
          }}
          codeTagProps={{ style: { fontFamily: "var(--font-mono, ui-monospace, monospace)" } }}
          wrapLongLines={false}
        >
          {text.replace(/\n$/, "")}
        </SyntaxHighlighter>
      );
    },
    pre({ children }) {
      // Avoid nested <pre> when the code renderer emits a highlighter div.
      return <div className="my-4">{children}</div>;
    },
    a({ href, children, ...rest }) {
      return (
        <a
          href={href}
          target={href?.startsWith("#") ? undefined : "_blank"}
          rel="noopener noreferrer"
          {...rest}
        >
          {children}
        </a>
      );
    },
    img({ src, alt, ...rest }) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={typeof src === "string" ? src : undefined}
          alt={alt ?? ""}
          loading="lazy"
          crossOrigin="anonymous"
          {...rest}
        />
      );
    },
    input({ type, checked, ...rest }) {
      // GFM task lists — render disabled checkboxes reflecting state.
      if (type !== "checkbox") return <input type={type} {...rest} />;
      return (
        <input
          type="checkbox"
          checked={Boolean(checked)}
          disabled
          readOnly
          aria-label="Task list item"
          {...rest}
        />
      );
    },
  };

  return (
    <section
      aria-label="Markdown preview"
      className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-soft ${
        fullscreen ? "fixed inset-0 z-50 rounded-none" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Preview
        </h2>
        {onToggleFullscreen && (
          <button
            type="button"
            onClick={onToggleFullscreen}
            aria-label={fullscreen ? "Exit fullscreen preview" : "Fullscreen preview"}
            className="rounded-md p-1.5 text-[var(--muted)] transition hover:bg-[var(--border)] hover:text-[var(--text)] lg:hidden"
          >
            {fullscreen ? "✕ Exit" : "⛶ Fullscreen"}
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--panel)]">
        <article
          ref={contentRef}
          className={`prose prose-slate max-w-none dark:prose-invert prose-headings:scroll-mt-16 prose-pre:bg-transparent prose-pre:p-0 px-4 py-5 sm:px-6 ${
            theme === "dark" ? "prose-invert" : ""
          }`}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            components={components}
          >
            {markdown}
          </ReactMarkdown>
        </article>
      </div>
    </section>
  );
}

export default memo(MarkdownPreview);
