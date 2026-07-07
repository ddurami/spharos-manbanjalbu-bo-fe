import type { MemberGrade, MemberStatus } from "@/types/member-api";
import { cn } from "@/lib/utils";

export function formatNumber(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

export function formatWon(value: number) {
  return `₩ ${formatNumber(value)}`;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("ko-KR");
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR");
}

const GRADE_LABEL: Record<MemberGrade, string> = {
  WELCOME: "Welcome",
  GREEN: "Green",
  GOLD: "Gold",
};

const STATUS_LABEL: Record<MemberStatus, string> = {
  ACTIVE: "정상",
  INACTIVE: "비활성",
  SUSPENDED: "정지",
  WITHDRAWN: "탈퇴",
};

const STATUS_CLASS: Record<MemberStatus, string> = {
  ACTIVE: "bg-green-50 text-starbucks-green",
  INACTIVE: "bg-neutral-100 text-neutral-500",
  SUSPENDED: "bg-amber-50 text-amber-600",
  WITHDRAWN: "bg-rose-50 text-rose-600",
};

export function GradeBadge({ grade }: { grade: MemberGrade }) {
  return (
    <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700">
      {GRADE_LABEL[grade]}
    </span>
  );
}

export function StatusBadge({ status }: { status: MemberStatus }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_CLASS[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export const MEMBER_SEARCH_FIELDS = [
  { value: "all", label: "전체", placeholder: "이름, 이메일, 아이디, 전화번호 검색" },
  { value: "name", label: "이름", placeholder: "회원 이름을 입력하세요" },
  { value: "grade", label: "등급", placeholder: "WELCOME, GREEN, GOLD" },
  { value: "status", label: "상태", placeholder: "ACTIVE, SUSPENDED, WITHDRAWN" },
  { value: "joinDate", label: "가입일", placeholder: "예: 2026-07 또는 2026-07-07" },
  { value: "totalAmount", label: "누적 금액", placeholder: "금액(숫자)을 입력하세요" },
] as const;
