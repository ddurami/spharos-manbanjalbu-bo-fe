import { apiRequest } from "@/lib/api/client";
import type { AdminLoginRequest, AdminLoginResponse } from "@/types/auth";

export function loginAdmin(request: AdminLoginRequest) {
  return apiRequest<AdminLoginResponse>("/api/admin/auth/login", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function getCurrentAdmin() {
  return apiRequest<AdminLoginResponse>("/api/admin/auth/me");
}
