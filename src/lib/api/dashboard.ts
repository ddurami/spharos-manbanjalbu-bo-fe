import { apiRequest } from "@/lib/api/client";
import type { DashboardResponse } from "@/types/dashboard";

export function getDashboard() {
  return apiRequest<DashboardResponse>("/api/admin/dashboard");
}
