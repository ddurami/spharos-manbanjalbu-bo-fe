"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Ban,
  PackagePlus,
  PackageX,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";

import { ApiError } from "@/lib/api/client";
import {
  deleteProduct,
  getProductCategories,
  getProductSummary,
  getProducts,
  markProductSoldOut,
  stopProductSelling,
} from "@/lib/api/products";
import { mapListItemToRow, type ProductListRow } from "@/lib/product-mappers";
import { buildProductSearchParams } from "@/lib/product-search";
import { cn } from "@/lib/utils";
import { ReasonDialog } from "@/components/products/reason-dialog";
import type { ProductStatus } from "@/types/product";
import type { CategoryResponse, ProductSummaryResponse } from "@/types/product-api";
import {
  BadgeChips,
  SaleTypeChip,
  StatusBadge,
  Thumbnail,
  formatDate,
  formatNumber,
  formatWon,
} from "@/components/products/product-ui";

type StatusFilter = "ALL" | ProductStatus;
type SearchField = "all" | "name" | "category" | "price" | "date";
type BulkAction = "SOLD_OUT" | "HIDDEN" | "DELETE";

const PAGE_SIZE = 10;

const SEARCH_FIELDS: { value: SearchField; label: string; placeholder: string }[] = [
  { value: "all", label: "전체", placeholder: "상품명으로 검색" },
  { value: "name", label: "상품명", placeholder: "상품명을 입력하세요" },
  { value: "category", label: "카테고리", placeholder: "카테고리명을 입력하세요" },
  { value: "price", label: "가격", placeholder: "가격(숫자)을 입력하세요" },
  { value: "date", label: "등록일", placeholder: "예: 2026-07 또는 2026-07-07" },
];

const BULK_META: Record<
  BulkAction,
  { label: string; title: string; tone: "danger" | "warning" }
> = {
  SOLD_OUT: { label: "품절 처리", title: "선택 상품 품절 처리", tone: "warning" },
  HIDDEN: { label: "판매 중지", title: "선택 상품 판매 중지", tone: "warning" },
  DELETE: { label: "삭제", title: "선택 상품 삭제", tone: "danger" },
};

export function ProductListView() {
  const [summary, setSummary] = useState<ProductSummaryResponse | null>(null);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [items, setItems] = useState<ProductListRow[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [searchField, setSearchField] = useState<SearchField>("all");
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkDialog, setBulkDialog] = useState<BulkAction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const searchParams = buildProductSearchParams(
        searchField,
        appliedQuery,
        page,
        statusFilter,
        categories,
        PAGE_SIZE,
      );

      const [summaryData, pageData] = await Promise.all([
        getProductSummary(),
        getProducts(searchParams),
      ]);

      setSummary(summaryData);
      setItems(pageData.content.map(mapListItemToRow));
      setTotalElements(pageData.totalElements);
      setTotalPages(Math.max(1, pageData.totalPages));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "상품 목록을 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, [appliedQuery, categories, page, searchField, statusFilter]);

  useEffect(() => {
    getProductCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

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

  const pageIds = items.map((p) => p.id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePage = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleBulkConfirm = async (reason: string) => {
    const ids = Array.from(selected);
    setBulkLoading(true);
    try {
      await Promise.all(
        ids.map(async (id) => {
          if (bulkDialog === "DELETE") {
            await deleteProduct(id, { reason });
          } else if (bulkDialog === "SOLD_OUT") {
            await markProductSoldOut(id, { reason });
          } else if (bulkDialog === "HIDDEN") {
            await stopProductSelling(id, { reason });
          }
        }),
      );
      setSelected(new Set());
      setBulkDialog(null);
      await loadData();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "일괄 처리 중 오류가 발생했습니다.",
      );
    } finally {
      setBulkLoading(false);
    }
  };

  const statCards: {
    key: StatusFilter;
    label: string;
    value: number;
    accent: string;
    dot?: string;
  }[] = [
    { key: "ALL", label: "전체 상품", value: summary?.totalCount ?? 0, accent: "text-neutral-900" },
    { key: "ON_SALE", label: "판매중", value: summary?.onSaleCount ?? 0, accent: "text-starbucks-green", dot: "bg-starbucks-green" },
    { key: "SOLD_OUT", label: "품절", value: summary?.soldOutCount ?? 0, accent: "text-amber-600", dot: "bg-amber-500" },
    { key: "HIDDEN", label: "판매중지", value: summary?.hiddenCount ?? 0, accent: "text-neutral-500", dot: "bg-neutral-400" },
  ];

  const placeholder =
    SEARCH_FIELDS.find((f) => f.value === searchField)?.placeholder ?? "";
  const selectedCount = selected.size;
  const currentPage = Math.min(page, totalPages);
  const rangeStart =
    totalElements === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, totalElements);

  if (error && !summary && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-neutral-100 bg-white p-16 text-center shadow-sm">
        <p className="text-sm text-neutral-600">{error}</p>
        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center gap-2 rounded-lg bg-starbucks-green px-4 py-2 text-sm font-medium text-white"
        >
          <RefreshCw className="size-4" />
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">상품 관리</h1>
          <p className="mt-1 text-sm text-neutral-500">
            등록된 상품을 조회하고 상태를 관리하세요.
          </p>
        </div>
        <Link
          href="/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-starbucks-green px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-starbucks-green-dark"
        >
          <PackagePlus className="size-4" />
          상품 등록
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {statCards.map((card) => {
          const isActive = statusFilter === card.key;
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => setStatusFilter(card.key)}
              className={cn(
                "rounded-xl border bg-white p-5 text-left shadow-sm transition-colors",
                isActive
                  ? "border-starbucks-green ring-1 ring-starbucks-green/30"
                  : "border-neutral-100 hover:border-neutral-200",
              )}
            >
              <p className="flex items-center gap-1.5 text-sm text-neutral-500">
                {card.dot && (
                  <span className={cn("size-2 rounded-full", card.dot)} />
                )}
                {card.label}
              </p>
              <p className={cn("mt-2 text-2xl font-bold", card.accent)}>
                {formatNumber(card.value)}
                <span className="ml-1 text-sm font-normal text-neutral-400">개</span>
              </p>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-neutral-100 p-4 sm:flex-row sm:items-center">
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value as SearchField)}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 outline-none focus:border-starbucks-green"
          >
            {SEARCH_FIELDS.map((field) => (
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
              className="w-full rounded-lg border border-neutral-200 py-2 pr-3 pl-9 text-sm text-neutral-800 outline-none transition-colors focus:border-starbucks-green focus:ring-2 focus:ring-starbucks-green/20"
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
          <div className="border-b border-rose-100 bg-rose-50 px-4 py-2 text-sm text-rose-600">
            {error}
          </div>
        )}

        {selectedCount > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 bg-green-50/60 px-4 py-3">
            <span className="text-sm font-medium text-starbucks-green">
              {selectedCount}개 상품 선택됨
            </span>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setBulkDialog("SOLD_OUT")} disabled={bulkLoading} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-600">
                <PackageX className="size-3.5" />품절 처리
              </button>
              <button type="button" onClick={() => setBulkDialog("HIDDEN")} disabled={bulkLoading} className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600">
                <Ban className="size-3.5" />판매 중지
              </button>
              <button type="button" onClick={() => setBulkDialog("DELETE")} disabled={bulkLoading} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-600">
                <Trash2 className="size-3.5" />삭제
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {loading ? (
            <div className="px-4 py-16 text-center text-sm text-neutral-400">
              불러오는 중...
            </div>
          ) : (
            <table className="w-full min-w-[960px] text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-left text-xs text-neutral-500">
                  <th className="w-10 px-4 py-3">
                    <input type="checkbox" checked={allPageSelected} onChange={togglePage} className="size-4 accent-starbucks-green" />
                  </th>
                  <th className="px-4 py-3 font-medium">상품</th>
                  <th className="px-4 py-3 font-medium">카테고리</th>
                  <th className="px-4 py-3 text-right font-medium">가격</th>
                  <th className="px-4 py-3 text-right font-medium">누적 판매량</th>
                  <th className="px-4 py-3 font-medium">상태</th>
                  <th className="px-4 py-3 font-medium">최종 수정</th>
                  <th className="px-4 py-3 text-right font-medium">관리</th>
                </tr>
              </thead>
              <tbody>
                {items.map((product) => (
                  <tr key={product.id} className={cn("border-b border-neutral-50 last:border-0 transition-colors", selected.has(product.id) ? "bg-green-50/40" : "hover:bg-neutral-50/60")}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(product.id)} onChange={() => toggleOne(product.id)} className="size-4 accent-starbucks-green" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Thumbnail name={product.name} url={product.thumbnailUrl || undefined} className="size-12 shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-medium text-neutral-800">{product.name}</span>
                            <SaleTypeChip saleType={product.saleType} />
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="font-mono text-xs text-neutral-400">{product.code}</span>
                            <BadgeChips badgeLabels={product.badgeLabels} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-neutral-600">{product.categoryLabel}</td>
                    <td className="px-4 py-3 text-right font-medium text-neutral-800">{formatWon(product.price)}</td>
                    <td className="px-4 py-3 text-right text-neutral-600">{formatNumber(product.totalSalesCount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={product.status} /></td>
                    <td className="px-4 py-3 whitespace-nowrap text-neutral-500">{formatDate(product.updatedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/products/${product.id}`} className="inline-flex items-center rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-starbucks-green hover:text-starbucks-green">
                        상세
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && items.length === 0 && (
            <div className="px-4 py-16 text-center text-sm text-neutral-400">
              조건에 맞는 상품이 없습니다.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-neutral-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-neutral-400">
            전체 {formatNumber(totalElements)}개 중 {rangeStart}-{rangeEnd} 표시
          </span>
          <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      <ReasonDialog
        open={bulkDialog !== null}
        title={bulkDialog ? BULK_META[bulkDialog].title : ""}
        description={`선택한 ${selectedCount}개 상품에 일괄 적용됩니다.`}
        confirmLabel={bulkDialog ? BULK_META[bulkDialog].label : ""}
        tone={bulkDialog ? BULK_META[bulkDialog].tone : "warning"}
        onConfirm={handleBulkConfirm}
        onClose={() => !bulkLoading && setBulkDialog(null)}
      />
    </div>
  );
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  if (totalPages <= 1) return null;
  const pages: (number | "...")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (end < totalPages - 1) pages.push("...");
  if (totalPages > 1) pages.push(totalPages);

  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1} className="rounded-md px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100 disabled:opacity-40">&lt;</button>
      {pages.map((p, index) =>
        p === "..." ? (
          <span key={`gap-${index}`} className="px-2 text-sm text-neutral-300">…</span>
        ) : (
          <button key={p} type="button" onClick={() => onChange(p)} className={cn("min-w-8 rounded-md px-2 py-1 text-sm transition-colors", p === page ? "bg-starbucks-green font-medium text-white" : "text-neutral-600 hover:bg-neutral-100")}>{p}</button>
        ),
      )}
      <button type="button" onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="rounded-md px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100 disabled:opacity-40">&gt;</button>
    </div>
  );
}
