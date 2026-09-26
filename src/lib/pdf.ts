/**
 * Client-side PDF generation.
 *
 * Pipeline: html2canvas renders the styled preview clone to a canvas,
 * jsPDF paginates that canvas into an A4 document with 10 mm margins.
 * (We drive html2canvas + jsPDF directly instead of html2pdf.js because
 * its bundled worker copies the source node into an `overflow: hidden`
 * container whose height is measured unreliably under Tailwind's
 * box-sizing reset — which produced blank pages in the exported PDF.)
 *
 * Both libraries are lazy-loaded so the initial bundle stays small.
 */

/** Convert millimetres to CSS pixels at 96 dpi. */
const MM_TO_PX = 96 / 25.4;

interface PdfDoc {
  internal: { pageSize: { getWidth(): number; getHeight(): number } };
  addPage(format?: string, orientation?: string): void;
  addImage(
    imageData: string,
    format: string,
    x: number,
    y: number,
    width: number,
    height: number,
    alias?: string,
    compression?: string,
    rotation?: number
  ): void;
  save(filename: string): void;
}

async function loadHtml2Canvas(): Promise<
  (el: HTMLElement, opts: Record<string, unknown>) => Promise<HTMLCanvasElement>
> {
  const mod = await import("html2canvas");
  return (mod.default ?? mod) as unknown as (
    el: HTMLElement,
    opts: Record<string, unknown>
  ) => Promise<HTMLCanvasElement>;
}

async function loadJsPdf(): Promise<new (opts: Record<string, unknown>) => PdfDoc> {
  const mod = await import("jspdf");
  return (mod.jsPDF ?? mod) as unknown as new (
    opts: Record<string, unknown>
  ) => PdfDoc;
}

export interface PdfExportSettings {
  filename?: string;
  /** Page margins in millimetres. */
  marginMm?: number;
  /** Render scale multiplier (2 = high quality). */
  scale?: number;
}

/**
 * Build a print-friendly, fully visible copy of the rendered markdown
 * preview inside an off-screen container. The clone is detached from any
 * scrollable/overflow-hidden ancestors so html2canvas captures the entire
 * document height (this was the cause of blank PDF pages).
 */
function buildPrintSurface(element: HTMLElement): {
  surface: HTMLElement;
  cleanup: () => void;
} {
  const pageWidthPx = Math.round(210 * MM_TO_PX); // A4 width ≈ 794 px

  const container = document.createElement("div");
  container.setAttribute("aria-hidden", "true");
  Object.assign(container.style, {
    position: "fixed",
    top: "0",
    left: "-10000px",
    width: `${pageWidthPx}px`,
    background: "#ffffff",
    color: "#111827",
    overflow: "visible",
  } as Partial<CSSStyleDeclaration>);
  container.className = "pdf-export-surface";

  const clone = element.cloneNode(true) as HTMLElement;
  Object.assign(clone.style, {
    width: "100%",
    maxWidth: "100%",
    height: "auto",
    minHeight: "0",
    maxHeight: "none",
    overflow: "visible",
    margin: "0",
    transform: "none",
    opacity: "1",
  } as Partial<CSSStyleDeclaration>);
  clone.classList.remove("prose-invert");

  container.appendChild(clone);
  document.body.appendChild(container);

  return {
    surface: clone,
    cleanup: () => {
      if (container.parentNode) container.parentNode.removeChild(container);
    },
  };
}

/**
 * Render an element containing the styled markdown preview to a
 * high-quality, paginated A4 PDF and trigger a download.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  settings: PdfExportSettings = {}
): Promise<void> {
  const {
    filename = "document.pdf",
    marginMm = 10,
    scale = 2,
  } = settings;

  const [html2canvas, JsPDF] = await Promise.all([
    loadHtml2Canvas(),
    loadJsPdf(),
  ]);

  const { surface, cleanup } = buildPrintSurface(element);

  try {
    // Ensure images inside the clone have finished loading before capture.
    const images = Array.from(surface.querySelectorAll("img"));
    await Promise.all(
      images.map(
        (img) =>
          img.complete
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                img.onload = () => resolve();
                img.onerror = () => resolve();
              })
      )
    );
    // Give layout/fonts one frame to settle in the print surface.
    await new Promise((r) => requestAnimationFrame(() => r(null)));

    const canvas = await html2canvas(surface, {
      scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      imageTimeout: 15000,
      windowWidth: surface.scrollWidth,
      windowHeight: surface.scrollHeight,
      scrollX: 0,
      scrollY: 0,
    });

    const docWidthPx = canvas.width;
    const docHeightPx = canvas.height;

    if (docWidthPx === 0 || docHeightPx === 0) {
      throw new Error("Preview has nothing to render.");
    }

    const pdf = new JsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
      compress: true,
    });

    const pageW = pdf.internal.pageSize.getWidth(); // 210
    const pageH = pdf.internal.pageSize.getHeight(); // 297
    const contentW = pageW - marginMm * 2;
    const contentH = pageH - marginMm * 2;

    // Height (in canvas px) that fits on one PDF page.
    const sliceHpx = Math.floor((contentH * docHeightPx) / contentW);

    let rendered = 0;
    let pageIndex = 0;

    while (rendered < docHeightPx) {
      const sliceH = Math.min(sliceHpx, docHeightPx - rendered);

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = docWidthPx;
      pageCanvas.height = sliceH;
      const ctx = pageCanvas.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D context unavailable.");

      // White base so JPEG compression doesn't bleed black through
      // transparent regions.
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, docWidthPx, sliceH);
      ctx.drawImage(
        canvas,
        0,
        rendered,
        docWidthPx,
        sliceH,
        0,
        0,
        docWidthPx,
        sliceH
      );

      const imgData = pageCanvas.toDataURL("image/jpeg", 0.95);
      const imgH = (sliceH * contentW) / docWidthPx; // mm

      if (pageIndex > 0) pdf.addPage("a4", "portrait");
      pdf.addImage(
        imgData,
        "JPEG",
        marginMm,
        marginMm,
        contentW,
        imgH,
        undefined,
        "FAST"
      );

      rendered += sliceH;
      pageIndex += 1;
    }

    pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
  } finally {
    cleanup();
  }
}
