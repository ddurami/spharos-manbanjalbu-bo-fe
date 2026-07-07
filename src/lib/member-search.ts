import type { MemberGrade, MemberSearchParams, MemberStatus } from "@/types/member-api";

export type MemberSearchField =
  | "all"
  | "name"
  | "grade"
  | "status"
  | "joinDate"
  | "totalAmount";

export function buildMemberSearchParams(
  field: MemberSearchField,
  query: string,
  page: number,
  statusFilter: "ALL" | MemberStatus,
  pageSize = 10,
): MemberSearchParams {
  const params: MemberSearchParams = {
    page: page - 1,
    size: pageSize,
    sort: "createdAt,desc",
  };

  if (statusFilter !== "ALL") {
    params.status = statusFilter;
  }

  const trimmed = query.trim();
  if (!trimmed) {
    return params;
  }

  switch (field) {
    case "all":
      params.keyword = trimmed;
      break;
    case "name":
      params.name = trimmed;
      break;
    case "grade": {
      const grade = trimmed.toUpperCase() as MemberGrade;
      if (["WELCOME", "GREEN", "GOLD"].includes(grade)) {
        params.grade = grade;
      } else {
        params.keyword = trimmed;
      }
      break;
    }
    case "status": {
      const status = trimmed.toUpperCase() as MemberStatus;
      if (["ACTIVE", "INACTIVE", "SUSPENDED", "WITHDRAWN"].includes(status)) {
        params.status = status;
      } else {
        params.keyword = trimmed;
      }
      break;
    }
    case "joinDate": {
      const normalized = trimmed.replace(/\./g, "-");
      if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
        params.registeredFrom = normalized;
        params.registeredTo = normalized;
      } else if (/^\d{4}-\d{2}$/.test(normalized)) {
        const [year, month] = normalized.split("-").map(Number);
        const lastDay = new Date(year, month, 0).getDate();
        params.registeredFrom = `${normalized}-01`;
        params.registeredTo = `${normalized}-${String(lastDay).padStart(2, "0")}`;
      }
      break;
    }
    case "totalAmount": {
      const amount = Number(trimmed.replace(/[^\d]/g, ""));
      if (amount > 0) {
        params.minAmount = amount;
      }
      break;
    }
    default:
      break;
  }

  return params;
}
