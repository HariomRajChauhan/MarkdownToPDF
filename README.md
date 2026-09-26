# MarkdownToPDF

A modern, **fully client-side** Markdown → PDF web application. Write or import
Markdown, see a live GitHub-Flavored preview with syntax highlighting, and export
a professional A4 PDF — all in the browser. **Zero backend. Deploys on Vercel Free Tier.**

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Markdown Editor** | Large auto-resizing workspace with character / word / line counters and formatting toolbar (bold, italic, headings, lists, tables, blockquotes, code, links). `Ctrl/Cmd+B`, `Ctrl/Cmd+I` shortcuts. |
| 2 | **Live Preview** | Real-time rendering via `react-markdown` + `remark-gfm`. Headings, bold/italic, nested & ordered lists, tables, images, links, blockquotes, horizontal rules, task-list checkboxes, code blocks. |
| 3 | **PDF Export** | One click → high-quality paginated **A4** PDF with **10 mm margins** (`html2pdf.js` = `html2canvas` + `jsPDF`). Preserves styling, tables, lists, images, colors and code blocks. Default filename `document.pdf` (or derived from the imported file name). |
| 4 | **File Import** | Upload `.md` / `.markdown` files; content loads instantly into the editor. |
| 5 | **Drag & Drop** | Drop a markdown file anywhere on the page — overlay feedback, instant load. |
| 6 | **Dark Mode** | Beautiful light/dark themes, persisted in `localStorage`, applied pre-paint (no flash). |
| 7 | **Syntax Highlighting** | Prism-based highlighting (`react-syntax-highlighter`) for JavaScript, TypeScript, Python, Java, Go, C++, Rust, Bash, JSON, HTML, CSS and more. |
| 8 | **Auto Save** | Document debounced-saved to `localStorage` (~1.2 s) and restored on reload. Footer shows last-save time. |
| 9 | **Copy MD / HTML** | Copy raw Markdown or rendered HTML to clipboard with toast confirmation. |
| 10 | **Download .md** | Export the current editor content as a Markdown file. |
| 11 | **Responsive** | Desktop: split Editor \| Preview. Tablet: adaptive. Mobile: stacked scrollable panels. |
| 12 | **Templates** | README, Blog Post, Meeting Notes, Project Documentation, Technical Documentation — one-click load. |
| 13 | **Fullscreen** | Fullscreen editor / fullscreen preview, exit via button or `Esc`. |
| 14 | **Word Analytics** | Live character count, word count, line count and estimated reading time (~200 wpm). |
| 15 | **Toasts** | Modern notifications for uploads, downloads, copies and theme changes. |

### Non-functional

- **Performance** — static prerender, lazy-loaded PDF pipeline (html2pdf only fetched on export), memoized preview.
- **Accessibility** — ARIA labels/roles, keyboard navigation, visible focus rings, `aria-live` toasts, dialog with Escape handling.
- **Security** — no unsafe HTML execution: rendering is sanitized with `rehype-sanitize`; links get `rel="noopener noreferrer"`.
- **SEO** — metadata, Open Graph and Twitter card tags, semantic landmarks.

---

## 🧱 Tech Stack

- **Framework:** Next.js 15 (App Router) · React 19
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS 3 + `@tailwindcss/typography`
- **Markdown:** `react-markdown`, `remark-gfm`, `rehype-sanitize`
- **PDF:** `html2pdf.js` (bundles `html2canvas` + `jspdf`)
- **Highlighting:** `react-syntax-highlighter` (Prism, One Light/Dark)
- **Icons:** `lucide-react`
- **State:** React hooks · **Storage:** `localStorage`

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Metadata, OG tags, pre-paint theme script
│   ├── page.tsx            # Main workspace (client component)
│   └── globals.css         # Design tokens, glassmorphism, prose tweaks
├── components/
│   ├── Header.tsx          # Logo + Upload/Templates/Copy/Download/Theme
│   ├── MarkdownEditor.tsx  # Auto-resize textarea + counters + shortcuts
│   ├── MarkdownPreview.tsx # GFM render, sanitization, highlighting
│   ├── FileUpload.tsx      # Hidden .md/.markdown picker
│   ├── ThemeToggle.tsx     # Standalone labelled switch
│   ├── StatsBar.tsx        # Footer analytics + autosave status
│   ├── TemplateSelector.tsx# Accessible templates modal
│   ├── Toolbar.tsx         # Formatting toolbar + fullscreen buttons
│   └── ToastContainer.tsx  # aria-live toast stack
├── hooks/
│   ├── useLocalStorage.ts  # SSR-safe persistence hook
│   ├── useTheme.ts         # Dark mode + localStorage + system default
│   └── useToasts.ts        # Minimal notification store
├── lib/
│   ├── markdown.ts         # Stats, clipboard, download, file helpers
│   ├── pdf.ts              # Lazy html2pdf A4 export pipeline
│   └── templates.ts        # Built-in markdown templates
└── types/
    ├── index.ts            # Shared interfaces
    └── html2pdf.d.ts       # Ambient typings for html2pdf.js
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js ≥ 20** and npm ≥ 10

### Install & run

```bash
git clone https://github.com/<your-user>/MarkdownToPDF.git
cd MarkdownToPDF
npm install
npm run dev        # http://localhost:3000
```

### Production build

```bash
npm run build
npm start
```

### Quality checks

```bash
npm run lint       # ESLint (flat config, next/core-web-vitals + next/typescript)
npm run typecheck  # tsc --noEmit (strict)
```

---

## ▲ Deploying to Vercel (Free Tier)

1. Push this repository to GitHub/GitLab/Bitbucket.
2. On [vercel.com](https://vercel.com) choose **Add New → Project** and import the repo.
3. Vercel auto-detects **Next.js** (`vercel.json` pins framework/build commands). No environment variables are required.
4. Click **Deploy**. The site is fully static/client-side — it runs comfortably on the free tier.

CLI alternative:

```bash
npm i -g vercel
vercel --prod
```

---

## 🔒 Privacy

Everything happens in your browser. Documents are stored only in your local
`localStorage` keys (`mtp:document`, `mtp:filename`, `mtp:theme`). Nothing is
uploaded to any server.

---

## 🗺️ Architecture Notes & Recent Changes

The repository originally contained only a placeholder README. The full
production implementation was added:

- Scaffolded a strict-TypeScript **Next.js 15 App Router** project with Tailwind CSS 3.
- Implemented the editor/preview split workspace, toolbar, drag & drop overlay, templates modal, stats footer and toast system.
- Built the PDF pipeline around lazily-imported `html2pdf.js` with an off-screen, print-friendly clone of the preview (A4, 10 mm margins, 2× scale).
- Hardened markdown rendering with `rehype-sanitize` and GFM via `remark-gfm`; added Prism syntax highlighting with theme-aware styles.
- Added ambient typings for `html2pdf.js`, ESLint flat config, `vercel.json`, favicon and SEO metadata.

## 📦 Dependencies

**Runtime:** `next`, `react`, `react-dom`, `react-markdown`, `remark-gfm`,
`rehype-sanitize`, `react-syntax-highlighter`, `html2pdf.js`, `html2canvas`,
`jspdf`, `lucide-react`

**Development:** `typescript`, `tailwindcss`, `@tailwindcss/typography`,
`postcss`, `autoprefixer`, `eslint`, `eslint-config-next`,
`@eslint/eslintrc`, `@types/node`, `@types/react`, `@types/react-dom`,
`@types/react-syntax-highlighter`

---

## 📄 License

MIT
