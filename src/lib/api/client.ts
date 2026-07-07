import type { ApiResponse } from "@/types/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";

export const ACCESS_TOKEN_KEY = "manbanjalbu-bo-access-token";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const accessToken = getAccessToken();
  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      `백엔드 서버(${API_BASE_URL})에 연결할 수 없습니다. BO-BE 실행 여부와 CORS 설정(현재 FE 포트)을 확인해주세요.`,
      0,
    );
  }

  let body: ApiResponse<T> | null = null;

  try {
    body = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(
      `서버 응답을 처리할 수 없습니다. (${API_BASE_URL})`,
      response.status,
    );
  }

  if (!response.ok || !body.success) {
    throw new ApiError(
      body.message ?? "요청 처리 중 오류가 발생했습니다.",
      response.status,
    );
  }

  return body.data as T;
}

type UploadOptions = {
  /** ApiResponse 래핑 여부 (Summernote 업로드는 false) */
  wrapped?: boolean;
};

export async function apiUploadFormData<T>(
  path: string,
  formData: FormData,
  options: UploadOptions = {},
): Promise<T> {
  const { wrapped = true } = options;
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new ApiError(
      "로그인이 필요합니다. 다시 로그인한 뒤 업로드를 시도해주세요.",
      401,
    );
  }

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${accessToken}`);

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: formData,
    });
  } catch {
    throw new ApiError(
      `백엔드 서버(${API_BASE_URL})에 연결할 수 없습니다. BO-BE 실행 여부와 CORS 설정(현재 FE 포트)을 확인해주세요.`,
      0,
    );
  }

  if (wrapped) {
    let body: ApiResponse<T> | null = null;

    try {
      body = (await response.json()) as ApiResponse<T>;
    } catch {
      throw new ApiError(
        `서버 응답을 처리할 수 없습니다. (${API_BASE_URL})`,
        response.status,
      );
    }

    if (!response.ok || !body.success) {
      throw new ApiError(
        body.message ?? "파일 업로드 중 오류가 발생했습니다.",
        response.status,
      );
    }

    return body.data as T;
  }

  let body: T | { message?: string } | null = null;

  try {
    body = (await response.json()) as T;
  } catch {
    throw new ApiError(
      `서버 응답을 처리할 수 없습니다. (${API_BASE_URL})`,
      response.status,
    );
  }

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "message" in body && body.message
        ? String(body.message)
        : "파일 업로드 중 오류가 발생했습니다.";
    throw new ApiError(message, response.status);
  }

  return body as T;
}
