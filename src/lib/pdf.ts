/**
 * Client-side PDF generation.
 *
 * Pipeline: html2canvas renders the styled preview clone to a canvas,
 * jsPDF paginates that canvas into an A4 document with 10 mm margins.
 *
 * Large-document strategy (documents of thousands of lines):
 *  - Browsers cap total canvas area at roughly 16.8 million pixels
 *    (~268 MP on some engines). A single full-document capture exceeds
 *    that limit for long markdown, producing a blank or failing export.
 *  - Instead we capture the print surface in horizontal STRIPS whose
 *    pixel area stays under the safe budget, blit each strip onto
 *    per-page canvases, and assemble the PDF page by page.
 *  - Memory is bounded: only one strip canvas + one page canvas are
 *    alive at a time; a full-height master canvas is never created.
 *
 * Both libraries are lazy-loaded so the initial bundle stays small.
 */

/** Convert millimetres to CSS pixels at 96 dpi. */
const MM_TO_PX = 96 / 25.4;

/**
 * Hard browser ceiling for canvas area is ~268 MP (Safari/Chrome iOS) but
 * many desktop engines fail past ~16.8 MP. We stay conservative.
 */
const MAX_CANVAS_PIXELS = 15_000_000;

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

type Html2CanvasFn = (
  el: HTMLElement,
  opts: Record<string, unknown>
) => Promise<HTMLCanvasElement>;

async function loadHtml2Canvas(): Promise<Html2CanvasFn> {
  const mod = await import("html2canvas");
  return (mod.default ?? mod) as unknown as Html2CanvasFn;
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
  /** Progress callback (fraction 0..1) for large-document exports. */
  onProgress?: (progress: number) => void;
}

/**
 * Build a print-friendly, fully visible copy of the rendered markdown
 * preview inside an off-screen container. The clone is detached from any
 * scrollable/overflow-hidden ancestors so html2canvas can capture the
 * entire document height.
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

  // Syntax-highlighter clones keep inline `overflow-x: auto` wrappers;
  // force them open so wide code lines are not clipped in the capture.
  clone.querySelectorAll<HTMLElement>("pre").forEach((pre) => {
    pre.style.overflow = "visible";
    const wrap = pre.parentElement;
    if (wrap && wrap.style && wrap.style.overflowX === "auto") {
      wrap.style.overflow = "visible";
    }
  });

  container.appendChild(clone);
  document.body.appendChild(container);

  return {
    surface: clone,
    cleanup: () => {
      if (container.parentNode) container.parentNode.removeChild(container);
    },
  };
}

/** Wait until every <img> inside the subtree has finished loading/erroring. */
async function waitForImages(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll("img"));
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
}

/** Release a canvas' backing store so long exports don't accumulate memory. */
function disposeCanvas(canvas: HTMLCanvasElement): void {
  canvas.width = 0;
  canvas.height = 0;
}

// Allow stashing "rows already filled" on a page canvas without subclassing.
declare global {
  interface HTMLCanvasElement {
    __usedH?: number;
  }
}

/**
 * Render an element containing the styled markdown preview to a
 * high-quality, paginated A4 PDF and trigger a download.
 *
 * Uses strip-wise capture + incremental page assembly so documents far
 * beyond the browser canvas-size limit still export correctly.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  settings: PdfExportSettings = {}
): Promise<void> {
  const {
    filename = "document.pdf",
    marginMm = 10,
    scale = 2,
    onProgress,
  } = settings;

  const [html2canvas, JsPDF] = await Promise.all([
    loadHtml2Canvas(),
    loadJsPdf(),
  ]);

  const { surface, cleanup } = buildPrintSurface(element);

  try {
    await waitForImages(surface);
    // Give layout/fonts two frames to settle in the print surface.
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(() => r(null)))
    );

    const cssW = Math.max(1, surface.scrollWidth);
    const cssH = Math.max(1, surface.scrollHeight);

    const scaledW = Math.round(cssW * scale);
    const scaledH = Math.round(cssH * scale);

    if (scaledW <= 0 || scaledH <= 0) {
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

    // Device pixels of source height that fit on one PDF page.
    const pageSliceH = Math.floor(((contentH * cssW) / contentW) * scale);

    // Strip size: at least one page tall, but capped so a single capture
    // canvas stays under the browser's max-area limit.
    const maxStripHByArea = Math.floor(MAX_CANVAS_PIXELS / scaledW);
    const stripsPerPage = Math.max(
      1,
      Math.min(4, Math.floor(maxStripHByArea / pageSliceH))
    );
    const stripH = Math.min(pageSliceH * stripsPerPage, maxStripHByArea);

    let pageIndex = 0; // pages written to the PDF
    let srcY = 0; // next unread row (device px) in the source document
    let pendingPageCanvas: HTMLCanvasElement | null = null;
    let pendingCtx: CanvasRenderingContext2D | null = null;

    const flushPage = () => {
      if (!pendingPageCanvas || !pendingCtx) return;
      const used = pendingPageCanvas.__usedH ?? 0;
      if (used > 0) {
        // Crop data URL to just the filled rows to save bytes/memory.
        const imgData = pendingPageCanvas.toDataURL("image/jpeg", 0.92);
        const imgH = (used * contentW) / scaledW; // mm
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
        pageIndex += 1;
      }
      disposeCanvas(pendingPageCanvas);
      pendingPageCanvas = null;
      pendingCtx = null;
    };

    const ensurePageCanvas = (): {
      canvas: HTMLCanvasElement;
      ctx: CanvasRenderingContext2D;
    } => {
      if (!pendingPageCanvas || !pendingCtx) {
        pendingPageCanvas = document.createElement("canvas");
        pendingPageCanvas.width = scaledW;
        pendingPageCanvas.height = pageSliceH;
        pendingPageCanvas.__usedH = 0;
        const ctx = pendingPageCanvas.getContext("2d");
        if (!ctx) throw new Error("Canvas 2D context unavailable.");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, scaledW, pageSliceH);
        pendingCtx = ctx;
      }
      return { canvas: pendingPageCanvas, ctx: pendingCtx };
    };

    while (srcY < scaledH) {
      const remaining = scaledH - srcY;
      const thisStripH = Math.min(stripH, remaining);

      // Capture one strip of the print surface. html2canvas lays out the
      // full element but crops rendering to the requested region, keeping
      // each capture canvas well under the browser's max-area limit.
      const stripCanvas = await html2canvas(surface, {
        scale,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 15000,
        windowWidth: cssW,
        windowHeight: cssH,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: srcY / scale,
        width: cssW,
        height: thisStripH / scale,
      });

      // Blit the strip into page-sized canvases, splitting across the
      // strip boundary whenever a page fills up mid-strip.
      let readY = 0; // rows consumed within this strip (device px)
      while (readY < thisStripH) {
        const { canvas: pageCanvas, ctx } = ensurePageCanvas();
        const filled = pageCanvas.__usedH ?? 0;
        const spaceLeft = pageSliceH - filled;
        const take = Math.min(spaceLeft, thisStripH - readY);

        ctx.drawImage(
          stripCanvas,
          0,
          readY,
          scaledW,
          take,
          0,
          filled,
          scaledW,
          take
        );
        pageCanvas.__usedH = filled + take;
        readY += take;

        if ((pageCanvas.__usedH ?? 0) >= pageSliceH) {
          flushPage();
        }
      }

      disposeCanvas(stripCanvas);
      srcY += thisStripH;

      if (onProgress) {
        onProgress(Math.min(1, srcY / scaledH));
      }
      // Yield to the event loop so the UI/toast can update between strips.
      await new Promise((r) => setTimeout(r, 0));
    }

    // Flush the final partially-filled page.
    flushPage();

    if (pageIndex === 0) {
      throw new Error("Preview has nothing to render.");
    }

    pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
  } finally {
    cleanup();
  }
}
