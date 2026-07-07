export type FileUploadResponse = {
  url: string;
  originalName: string;
  storedName: string;
  size: number;
  contentType: string;
};

export type SummernoteUploadResponse = {
  url: string;
};
