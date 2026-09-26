export type Theme = "light" | "dark";

export interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
}

export interface DocumentStats {
  characters: number;
  words: number;
  lines: number;
  readingMinutes: number;
}

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}
