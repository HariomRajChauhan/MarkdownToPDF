declare module "html2pdf.js" {
  interface Html2PdfWorker {
    set(options: Record<string, unknown>): Html2PdfWorker;
    from(element: HTMLElement | string): Html2PdfWorker;
    save(): Promise<void>;
    to(key?: string): Html2PdfWorker;
    output(type?: string, options?: unknown, filename?: string): Promise<unknown>;
  }

  function html2pdf(): Html2PdfWorker;
  function html2pdf(
    element: HTMLElement | string,
    container?: HTMLElement | string
  ): Html2PdfWorker;

  export default html2pdf;
}
