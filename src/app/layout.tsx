import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MarkdownToPDF — Write Markdown, Export Beautiful PDFs",
  description:
    "A fast, modern, fully client-side Markdown editor with live preview and one-click A4 PDF export. GitHub-Flavored Markdown, dark mode, templates, drag & drop upload — no backend required.",
  keywords: [
    "markdown to pdf",
    "markdown editor",
    "pdf converter",
    "gfm",
    "live preview",
    "client-side",
  ],
  authors: [{ name: "MarkdownToPDF" }],
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "MarkdownToPDF — Write Markdown, Export Beautiful PDFs",
    description:
      "Modern client-side Markdown editor with live preview, GFM support, templates and one-click PDF export.",
    type: "website",
    siteName: "MarkdownToPDF",
  },
  twitter: {
    card: "summary_large_image",
    title: "MarkdownToPDF — Write Markdown, Export Beautiful PDFs",
    description:
      "Modern client-side Markdown editor with live preview and one-click PDF export.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1120" },
  ],
};

/** Apply persisted theme before first paint to avoid a flash of wrong theme. */
const themeInitScript = `
try {
  var t = localStorage.getItem("mtp:theme");
  if (t === null) {
    t = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  document.documentElement.classList.toggle("dark", JSON.parse(t) === "dark" || t === "dark");
} catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
