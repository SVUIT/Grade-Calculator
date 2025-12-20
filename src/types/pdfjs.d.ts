declare module 'pdfjs-dist/build/pdf.worker.mjs' {
  import { GlobalWorkerOptions as BaseGlobalWorkerOptions } from 'pdfjs-dist/types/src/display/worker_options';
  
  export const GlobalWorkerOptions: typeof BaseGlobalWorkerOptions;
}

declare module 'pdfjs-dist' {
  import { GlobalWorkerOptions as BaseGlobalWorkerOptions } from 'pdfjs-dist/types/src/display/worker_options';
  import { PDFDocumentProxy, PDFPageProxy, TextItem } from 'pdfjs-dist/types/display/api';
  
  export const GlobalWorkerOptions: typeof BaseGlobalWorkerOptions;
  
  export interface PDFDocumentLoadingTask {
    promise: Promise<PDFDocumentProxy>;
  }

  export function getDocument(src: string | ArrayBuffer | Uint8Array | { data: ArrayBuffer }): PDFDocumentLoadingTask;
  
  export interface TextContent {
    items: TextItem[];
  }
  
  export interface PDFPageProxy {
    getTextContent(): Promise<TextContent>;
  }
  
  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }
}
