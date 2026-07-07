import { apiUploadFormData } from "@/lib/api/client";
import type {
  FileUploadResponse,
  SummernoteUploadResponse,
} from "@/types/file-api";

const BASE = "/api/admin/files";

export function uploadThumbnail(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiUploadFormData<FileUploadResponse>(`${BASE}/thumbnail`, formData);
}

export function uploadSummernoteImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiUploadFormData<SummernoteUploadResponse>(
    `${BASE}/summernote/image`,
    formData,
    { wrapped: false },
  );
}

export function uploadSummernoteFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiUploadFormData<SummernoteUploadResponse>(
    `${BASE}/summernote/file`,
    formData,
    { wrapped: false },
  );
}
