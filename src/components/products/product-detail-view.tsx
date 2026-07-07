"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Ban,
  ImageIcon,
  PackageX,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { ApiError } from "@/lib/api/client";
import {
  deleteProduct,
  getProductDetail,
  markProductSoldOut,
  stopProductSelling,
} from "@/lib/api/products";
import { mapDetailToProduct } from "@/lib/product-mappers";
import { ReasonDialog } from "@/components/products/reason-dialog";
import {
  BadgeChips,
  SaleTypeChip,
  StatusBadge,
  Thumbnail,
  formatCategoryPath,
  formatDateTime,
  formatNumber,
  formatWon,
} from "@/components/products/product-ui";
import {
  PRODUCT_ACTION_LABELS,
  PRODUCT_CAPACITY_LABELS,
  PRODUCT_SALE_TYPE_LABELS,
  type Product,
  type ProductActionType,
} from "@/types/product";

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 py-3">
      <span className="w-28 shrink-0 text-sm text-neutral-500">{label}</span>
      <span className="flex-1 text-sm text-neutral-800">{children}</span>
    </div>
  );
}

export function ProductDetailView({ productId }: { productId: number }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState<ProductActionType | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadProduct = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const detail = await getProductDetail(productId);
      setProduct(mapDetailToProduct(detail));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "상품 정보를 불러오지 못했습니다.",
      );
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleConfirm = async (reason: string) => {
    if (!product) return;
    setActionLoading(true);
    try {
      if (dialog === "DELETE") {
        await deleteProduct(product.id, { reason });
        router.push("/products");
        return;
      }
      if (dialog === "SOLD_OUT") {
        await markProductSoldOut(product.id, { reason });
      } else if (dialog === "HIDDEN") {
        await stopProductSelling(product.id, { reason });
      }
      setDialog(null);
      await loadProduct();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "처리 중 오류가 발생했습니다.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-neutral-100 bg-white p-16 text-center text-sm text-neutral-400 shadow-sm">
        불러오는 중...
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-neutral-100 bg-white p-16 text-center shadow-sm">
        <p className="text-sm text-neutral-600">{error}</p>
        <button
          type="button"
          onClick={loadProduct}
          className="inline-flex items-center gap-2 rounded-lg bg-starbucks-green px-4 py-2 text-sm font-medium text-white"
        >
          <RefreshCw className="size-4" />
          다시 시도
        </button>
      </div>
    );
  }

  if (!product || product.isDeleted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-neutral-100 bg-white p-16 text-center shadow-sm">
        <p className="text-sm text-neutral-600">
          존재하지 않거나 삭제된 상품입니다.
        </p>
        <Link href="/products" className="rounded-lg bg-starbucks-green px-4 py-2 text-sm font-medium text-white">
          상품 목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.push("/products")} className="rounded-lg border border-neutral-200 p-2 text-neutral-500 hover:bg-neutral-50" aria-label="목록으로">
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-neutral-900">{product.name}</h1>
              <StatusBadge status={product.status} />
            </div>
            <p className="mt-1 font-mono text-xs text-neutral-400">{product.code}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {product.status !== "SOLD_OUT" && (
            <button type="button" onClick={() => setDialog("SOLD_OUT")} disabled={actionLoading} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 px-3 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50">
              <PackageX className="size-4" />품절 처리
            </button>
          )}
          {product.status !== "HIDDEN" && (
            <button type="button" onClick={() => setDialog("HIDDEN")} disabled={actionLoading} className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50">
              <Ban className="size-4" />판매 중지
            </button>
          )}
          <button type="button" onClick={() => setDialog("DELETE")} disabled={actionLoading} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50">
            <Trash2 className="size-4" />삭제
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-2 text-sm text-rose-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="h-full rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
            <div className="relative">
              <Thumbnail name={product.name} url={product.thumbnailUrl || undefined} className="aspect-square w-full" />
              <div className="absolute top-3 left-3">
                <BadgeChips badgeLabels={product.badgeLabels} />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-neutral-50 p-3">
                <p className="text-xs text-neutral-400">누적 판매량</p>
                <p className="mt-1 font-bold text-neutral-800">{formatNumber(product.totalSalesCount)}</p>
              </div>
              <div className="rounded-lg bg-neutral-50 p-3">
                <p className="text-xs text-neutral-400">판매 가격</p>
                <p className="mt-1 font-bold text-starbucks-green">{formatWon(product.price)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="h-full rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
            <h2 className="mb-2 font-semibold text-neutral-900">기본 정보</h2>
            <div className="divide-y divide-neutral-100">
              <InfoRow label="상품코드"><span className="font-mono">{product.code}</span></InfoRow>
              <InfoRow label="상품명">{product.name}</InfoRow>
              <InfoRow label="뱃지"><BadgeChips badgeLabels={product.badgeLabels} /></InfoRow>
              <InfoRow label="카테고리">{formatCategoryPath(product.category)}</InfoRow>
              <InfoRow label="판매 유형">
                {PRODUCT_SALE_TYPE_LABELS[product.saleType]}
                {product.saleType !== "NORMAL" && <span className="ml-2"><SaleTypeChip saleType={product.saleType} /></span>}
              </InfoRow>
              <InfoRow label="배송/교환 정책">{product.policyTitle ?? "-"}</InfoRow>
              <InfoRow label="용량">{product.capacity ? PRODUCT_CAPACITY_LABELS[product.capacity] : "-"}</InfoRow>
              <InfoRow label="가격">{formatWon(product.price)}</InfoRow>
              <InfoRow label="간단 설명">{product.shortDescription}</InfoRow>
              <InfoRow label="등록일">{formatDateTime(product.createdAt)}</InfoRow>
              <InfoRow label="최종 수정일">{formatDateTime(product.updatedAt)}</InfoRow>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-neutral-900">상품 정보</h2>
        {product.detailImageUrls.length > 0 ? (
          <div className="space-y-4">
            {product.detailImageUrls.map((url, index) => (
              <Thumbnail key={`${url}-${index}`} name={`${product.name} 상세 ${index + 1}`} url={url} className="w-full" />
            ))}
          </div>
        ) : product.detailHtml ? (
          <div className="prose prose-sm max-w-none text-neutral-700" dangerouslySetInnerHTML={{ __html: product.detailHtml }} />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-200 py-12 text-neutral-400">
            <ImageIcon className="size-8" />
            <p className="text-sm">등록된 상품 정보가 없습니다.</p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-neutral-900">상태 변경 · 삭제 사유</h2>
        {product.statusLogs.length > 0 ? (
          <ul className="space-y-3">
            {product.statusLogs.map((log) => (
              <li key={log.id} className="flex gap-3 rounded-lg border border-neutral-100 p-3">
                <span className="mt-0.5 inline-flex h-fit items-center rounded bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">
                  {PRODUCT_ACTION_LABELS[log.type]}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-neutral-700">{log.reason}</p>
                  <p className="mt-1 text-xs text-neutral-400">{formatDateTime(log.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-sm text-neutral-400">등록된 사유가 없습니다.</p>
        )}
      </div>

      <ReasonDialog
        open={dialog !== null}
        title={dialog ? `${PRODUCT_ACTION_LABELS[dialog]} 사유 입력` : ""}
        description="입력한 사유는 상품 상세에 기록됩니다."
        confirmLabel={dialog ? PRODUCT_ACTION_LABELS[dialog] : ""}
        tone={dialog === "DELETE" ? "danger" : "warning"}
        onConfirm={handleConfirm}
        onClose={() => !actionLoading && setDialog(null)}
      />
    </div>
  );
}
