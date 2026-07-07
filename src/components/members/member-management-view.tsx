"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import { getMemberSummary } from "@/lib/api/members";
import { cn } from "@/lib/utils";
import type { MemberStatus } from "@/types/member-api";
import type { MemberSummaryResponse } from "@/types/member-api";
import {
  MemberListSection,
  type StatusFilter,
} from "@/components/members/member-list-section";
import { formatNumber } from "@/components/members/member-ui";

export function MemberManagementView() {
  const [summary, setSummary] = useState<MemberSummaryResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [error, setError] = useState("");

  useEffect(() => {
    getMemberSummary()
      .then(setSummary)
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "회원 통계를 불러오지 못했습니다.",
        ),
      );
  }, []);

  const statCards: {
    key: StatusFilter;
    label: string;
    value: number;
    accent: string;
    dot?: string;
  }[] = [
    { key: "ALL", label: "전체 회원", value: summary?.totalCount ?? 0, accent: "text-neutral-900" },
    { key: "ACTIVE", label: "정상", value: summary?.activeCount ?? 0, accent: "text-starbucks-green", dot: "bg-starbucks-green" },
    { key: "SUSPENDED", label: "정지", value: summary?.suspendedCount ?? 0, accent: "text-amber-600", dot: "bg-amber-500" },
    { key: "WITHDRAWN", label: "탈퇴", value: summary?.withdrawnCount ?? 0, accent: "text-rose-600", dot: "bg-rose-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">회원 관리</h1>
        <p className="mt-1 text-sm text-neutral-500">
          회원 명단을 조회하고 상태를 관리하세요.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-2 text-sm text-rose-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-neutral-500">신규 회원 (오늘)</p>
          <p className="mt-2 text-2xl font-bold text-starbucks-green">
            {formatNumber(summary?.newMembersToday ?? 0)}
            <span className="ml-1 text-sm font-normal text-neutral-400">명</span>
          </p>
        </div>
        <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-neutral-500">이번 달 회원</p>
          <p className="mt-2 text-2xl font-bold text-neutral-900">
            {formatNumber(summary?.newMembersThisMonth ?? 0)}
            <span className="ml-1 text-sm font-normal text-neutral-400">명</span>
          </p>
        </div>
        {statCards.slice(0, 2).map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() => setStatusFilter(card.key)}
            className={cn(
              "rounded-xl border bg-white p-5 text-left shadow-sm transition-colors",
              statusFilter === card.key
                ? "border-starbucks-green ring-1 ring-starbucks-green/30"
                : "border-neutral-100 hover:border-neutral-200",
            )}
          >
            <p className="flex items-center gap-1.5 text-sm text-neutral-500">
              {card.dot && <span className={cn("size-2 rounded-full", card.dot)} />}
              {card.label}
            </p>
            <p className={cn("mt-2 text-2xl font-bold", card.accent)}>
              {formatNumber(card.value)}
              <span className="ml-1 text-sm font-normal text-neutral-400">명</span>
            </p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {statCards.slice(2).map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() => setStatusFilter(card.key as MemberStatus)}
            className={cn(
              "rounded-xl border bg-white p-5 text-left shadow-sm transition-colors",
              statusFilter === card.key
                ? "border-starbucks-green ring-1 ring-starbucks-green/30"
                : "border-neutral-100 hover:border-neutral-200",
            )}
          >
            <p className="flex items-center gap-1.5 text-sm text-neutral-500">
              {card.dot && <span className={cn("size-2 rounded-full", card.dot)} />}
              {card.label}
            </p>
            <p className={cn("mt-2 text-2xl font-bold", card.accent)}>
              {formatNumber(card.value)}
              <span className="ml-1 text-sm font-normal text-neutral-400">명</span>
            </p>
          </button>
        ))}
      </div>

      <MemberListSection
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
    </div>
  );
}
