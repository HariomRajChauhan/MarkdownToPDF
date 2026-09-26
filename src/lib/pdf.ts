/**
 * Client-side PDF generation.
 *
 * html2pdf.js bundles html2canvas + jsPDF internally, so we use it as the
 * single rendering pipeline and lazy-load it only when the user exports
 * (keeps the initial bundle small).
 */

interface Html2PdfOptions {
  margin: [number, number, number, number];
  filename: string;
  image: { type: "jpeg"; quality: number };
  html2canvas: {
    scale: number;
    useCORS: boolean;
    backgroundColor: string;
    logging: boolean;
  };
  jsPDF: {
    unit: string;
    format: string;
    orientation: string;
    putOnlyUsedFonts: boolean;
  };
  pagebreak: { mode: string[] };
}

interface Html2PdfWorker {
  set: (options: Partial<Html2PdfOptions>) => Html2PdfWorker;
  from: (element: HTMLElement) => Html2PdfWorker;
  save: () => Promise<void>;
}

type Html2PdfFactory = () => Html2PdfWorker;

async function loadHtml2Pdf(): Promise<Html2PdfFactory> {
  const mod = (await import("html2pdf.js")) as unknown as {
    default: Html2PdfFactory | (() => Html2PdfWorker);
  };
  const factory = mod.default ?? (mod as unknown as () => Html2PdfWorker);
  return factory as Html2PdfFactory;
}

export interface PdfExportSettings {
  filename?: string;
  /** Page margins in millimetres. */
  marginMm?: number;
  /** Render scale multiplier (2 = high quality). */
  scale?: number;
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

  const html2pdf = await loadHtml2Pdf();

  // Clone into an off-screen container so the live DOM is untouched and
  // dark-mode previews still render on a white, print-friendly surface.
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.style.width = "794px"; // ~A4 width at 96dpi
  container.style.background = "#ffffff";
  container.style.color = "#111827";
  container.className = "pdf-export-surface";

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = "100%";
  clone.classList.remove("prose-invert");
  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    const options: Partial<Html2PdfOptions> = {
      margin: [marginMm, marginMm, marginMm, marginMm],
      filename: filename.endsWith(".pdf") ? filename : `${filename}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        putOnlyUsedFonts: true,
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    await html2pdf().set(options).from(clone).save();
  } finally {
    document.body.removeChild(container);
  }
}
