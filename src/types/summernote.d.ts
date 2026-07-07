import type JQuery from "jquery";

declare global {
  interface Window {
    jQuery: JQueryStatic;
    $: JQueryStatic;
  }

  interface JQuery {
    summernote(command: string | SummernoteOptions, ...args: unknown[]): this;
  }

  interface JQueryStatic {
    summernote: {
      ui: {
        button(options: Record<string, unknown>): { render(): JQuery };
      };
    };
  }
}

export type SummernoteOptions = {
  placeholder?: string;
  height?: number;
  lang?: string;
  tabsize?: number;
  dialogsInBody?: boolean;
  toolbar?: unknown[][];
  buttons?: Record<string, (context: JQuery) => JQuery>;
  callbacks?: {
    onChange?: (contents: string) => void;
    onImageUpload?: (files: File[]) => void;
  };
};

export {};
