"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Search } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import { getMembers } from "@/lib/api/members";
import {
  buildMemberSearchParams,
  type MemberSearchField,
} from "@/lib/member-search";
import { cn } from "@/lib/utils";
import type { MemberListItem, MemberStatus } from "@/types/member-api";
import {
  GradeBadge,
  MEMBER_SEARCH_FIELDS,
  StatusBadge,
  formatDate,
  formatNumber,
  formatWon,
} from "@/components/members/member-ui";

const PAGE_SIZE = 10;

type StatusFilter = "ALL" | MemberStatus;

type MemberListSectionProps = {
  statusFilter?: StatusFilter;
  onStatusFilterChange?: (filter: StatusFilter) => void;
};

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-1 py-4">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm disabled:opacity-40"
      >
        이전
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .slice(Math.max(0, page - 3), page + 2)
        .map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={cn(
              "min-w-8 rounded-lg px-2 py-1.5 text-sm",
              p === page
                ? "bg-starbucks-green text-white"
                : "border border-neutral-200 text-neutral-600 hover:bg-neutral-50",
            )}
          >
            {p}
          </button>
        ))}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm disabled:opacity-40"
      >
        다음
      </button>
    </div>
  );
}

export function MemberListSection({
  statusFilter: externalStatusFilter,
  onStatusFilterChange,
}: MemberListSectionProps) {
  const [items, setItems] = useState<MemberListItem[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [internalStatusFilter, setInternalStatusFilter] =
    useState<StatusFilter>("ALL");
  const statusFilter = externalStatusFilter ?? internalStatusFilter;
  const setStatusFilter = onStatusFilterChange ?? setInternalStatusFilter;
  const [searchField, setSearchField] = useState<MemberSearchField>("all");
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = buildMemberSearchParams(
        searchField,
        appliedQuery,
        page,
        statusFilter,
        PAGE_SIZE,
      );
      const pageData = await getMembers(params);
      setItems(pageData.content);
      setTotalElements(pageData.totalElements);
      setTotalPages(Math.max(1, pageData.totalPages));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "회원 목록을 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, [appliedQuery, page, searchField, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchField, appliedQuery]);

  const handleSearch = () => {
    setAppliedQuery(query);
    setPage(1);
  };

  const placeholder =
    MEMBER_SEARCH_FIELDS.find((f) => f.value === searchField)?.placeholder ?? "";
  const currentPage = Math.min(page, totalPages);
  const rangeStart =
    totalElements === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, totalElements);

  return (
    <div className="rounded-xl border border-neutral-100 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-neutral-100 p-4 sm:flex-row sm:items-center">
        <select
          value={searchField}
          onChange={(e) => setSearchField(e.target.value as MemberSearchField)}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 outline-none focus:border-starbucks-green"
        >
          {MEMBER_SEARCH_FIELDS.map((field) => (
            <option key={field.value} value={field.value}>
              {field.label}
            </option>
          ))}
        </select>
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={placeholder}
            className="w-full rounded-lg border border-neutral-200 py-2 pr-3 pl-9 text-sm outline-none focus:border-starbucks-green focus:ring-2 focus:ring-starbucks-green/20"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className="rounded-lg bg-starbucks-green px-4 py-2 text-sm font-medium text-white hover:bg-starbucks-green-dark"
        >
          검색
        </button>
      </div>

      {error && (
        <div className="flex items-center justify-between border-b border-rose-100 bg-rose-50 px-4 py-2 text-sm text-rose-600">
          <span>{error}</span>
          <button type="button" onClick={loadData} className="inline-flex items-center gap-1">
            <RefreshCw className="size-3.5" />
            재시도
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-[960px] w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50 text-left text-neutral-500">
              <th className="px-4 py-3 font-medium">이름</th>
              <th className="px-4 py-3 font-medium">아이디</th>
              <th className="px-4 py-3 font-medium">등급</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">이메일</th>
              <th className="px-4 py-3 font-medium">누적 금액</th>
              <th className="px-4 py-3 font-medium">가입일</th>
              <th className="px-4 py-3 font-medium">관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center text-neutral-400">
                  불러오는 중...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center text-neutral-400">
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              items.map((member) => (
                <tr
                  key={member.memberId}
                  className="border-b border-neutral-50 hover:bg-neutral-50/80"
                >
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {member.name}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{member.loginId}</td>
                  <td className="px-4 py-3">
                    <GradeBadge grade={member.grade} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={member.status} />
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{member.email}</td>
                  <td className="px-4 py-3 text-neutral-800">
                    {formatWon(member.totalPurchaseAmount)}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {formatDate(member.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/members/${member.memberId}`}
                      className="rounded-lg border border-starbucks-green/30 px-3 py-1 text-xs font-medium text-starbucks-green hover:bg-green-50"
                    >
                      상세
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 border-t border-neutral-100 px-4 py-3 sm:flex-row">
        <p className="text-xs text-neutral-500">
          전체 {formatNumber(totalElements)}명 중 {rangeStart}-{rangeEnd} 표시
        </p>
        <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
}

export type { StatusFilter };
