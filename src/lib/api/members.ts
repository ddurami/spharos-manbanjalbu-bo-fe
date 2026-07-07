import { apiRequest } from "@/lib/api/client";
import type {
  MemberActionRequest,
  MemberDetailResponse,
  MemberListItem,
  MemberMemoRequest,
  MemberSearchParams,
  MemberSummaryResponse,
  SpringPage,
} from "@/types/member-api";

const BASE = "/api/admin/members";

function toQuery(params: MemberSearchParams): string {
  const search = new URLSearchParams();
  if (params.keyword) search.set("keyword", params.keyword);
  if (params.name) search.set("name", params.name);
  if (params.grade) search.set("grade", params.grade);
  if (params.status) search.set("status", params.status);
  if (params.registeredFrom) search.set("registeredFrom", params.registeredFrom);
  if (params.registeredTo) search.set("registeredTo", params.registeredTo);
  if (params.minAmount != null) search.set("minAmount", String(params.minAmount));
  if (params.maxAmount != null) search.set("maxAmount", String(params.maxAmount));
  search.set("page", String(params.page ?? 0));
  search.set("size", String(params.size ?? 10));
  search.set("sort", params.sort ?? "createdAt,desc");
  return `?${search.toString()}`;
}

export function getMemberSummary() {
  return apiRequest<MemberSummaryResponse>(`${BASE}/summary`);
}

export function getMembers(params: MemberSearchParams = {}) {
  return apiRequest<SpringPage<MemberListItem>>(`${BASE}${toQuery(params)}`);
}

export function getMemberDetail(memberId: number) {
  return apiRequest<MemberDetailResponse>(`${BASE}/${memberId}`);
}

export function addMemberMemo(memberId: number, body: MemberMemoRequest) {
  return apiRequest<MemberDetailResponse["memos"][number]>(
    `${BASE}/${memberId}/memos`,
    { method: "POST", body: JSON.stringify(body) },
  );
}

export function suspendMember(memberId: number, body: MemberActionRequest) {
  return apiRequest<null>(`${BASE}/${memberId}/suspend`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function withdrawMember(memberId: number, body: MemberActionRequest) {
  return apiRequest<null>(`${BASE}/${memberId}/withdraw`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
