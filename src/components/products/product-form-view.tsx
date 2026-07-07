"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImageIcon, Loader2, X } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import {
  createProduct,
  getProductCategories,
  getProductDetail,
  getProductPolicies,
  updateProduct,
} from "@/lib/api/products";
import { cn } from "@/lib/utils";
import {
  PRODUCT_CAPACITY_LABELS,
  PRODUCT_SALE_TYPE_LABELS,
  type ProductCapacity,
  type ProductFormInput,
  type ProductSaleType,
  type ProductStatus,
} from "@/types/product";
import type {
  CategoryPathItem,
  CategoryResponse,
  ProductDetailResponse,
  ProductPolicyResponse,
} from "@/types/product-api";

const SummernoteEditor = dynamic(
  () =>
    import("@/components/products/summernote-editor").then(
      (mod) => mod.SummernoteEditor,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-80 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-sm text-neutral-400">
        에디터 로딩 중...
      </div>
    ),
  },
);

const SALE_TYPES = Object.keys(PRODUCT_SALE_TYPE_LABELS) as ProductSaleType[];
const CAPACITIES = Object.keys(PRODUCT_CAPACITY_LABELS) as ProductCapacity[];

const EMPTY: ProductFormInput = {
  name: "",
  categoryId: "",
  policyId: "",
  price: "",
  saleType: "NORMAL",
  capacity: "",
  shortDescription: "",
  thumbnailUrl: "",
  detailHtml: "",
  badges: { best: false, isNew: false },
};

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-neutral-700">
      {children}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </label>
  );
}

function isEmptyHtml(html: string): boolean {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length === 0;
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function applyCategoryPath(
  categoryPath: CategoryPathItem[],
): { largeId: number | ""; mediumId: number | "" } {
  const sorted = [...categoryPath].sort((a, b) => a.depth - b.depth);
  const large = sorted.find((item) => item.depth === 1);
  const medium = sorted.find((item) => item.depth === 2);

  if (medium) {
    return {
      largeId: large?.categoryId ?? "",
      mediumId: medium.categoryId,
    };
  }

  if (large) {
    return { largeId: large.categoryId, mediumId: "" };
  }

  const leaf = sorted.at(-1);
  return { largeId: leaf?.categoryId ?? "", mediumId: "" };
}

function detailToFormInput(detail: ProductDetailResponse): ProductFormInput {
  return {
    name: detail.name,
    categoryId: detail.categoryId ?? "",
    policyId: detail.policyId ?? "",
    price: String(detail.price),
    saleType: detail.saleType,
    capacity: detail.capacity ?? "",
    shortDescription: detail.shortDescription,
    thumbnailUrl: detail.thumbnailUrl ?? "",
    detailHtml: detail.detailHtml ?? "",
    badges: {
      best: detail.best,
      isNew: detail.isNew,
    },
  };
}

const inputClass =
  "w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none transition-colors focus:border-starbucks-green focus:ring-2 focus:ring-starbucks-green/20";

export function ProductFormView({
  mode,
  productId,
}: {
  mode: "create" | "edit";
  productId?: number;
}) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [form, setForm] = useState<ProductFormInput>(EMPTY);
  const [productStatus, setProductStatus] = useState<ProductStatus>("ON_SALE");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [policies, setPolicies] = useState<ProductPolicyResponse[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState("");
  const [editorNotice, setEditorNotice] = useState("");

  const [largeId, setLargeId] = useState<number | "">("");
  const [mediumId, setMediumId] = useState<number | "">("");

  useEffect(() => {
    let cancelled = false;

    async function loadFormData() {
      setLoading(true);
      setLoadError("");

      try {
        const [cats, pols] = await Promise.all([
          getProductCategories(),
          getProductPolicies(),
        ]);

        if (cancelled) return;

        setCategories(cats);
        setPolicies(pols);

        if (isEdit) {
          if (!productId || Number.isNaN(productId)) {
            throw new ApiError("유효하지 않은 상품 ID입니다.", 400);
          }

          const detail = await getProductDetail(productId);
          if (cancelled) return;

          setForm(detailToFormInput(detail));
          setProductStatus(detail.status);

          const { largeId: nextLargeId, mediumId: nextMediumId } =
            applyCategoryPath(detail.categoryPath);
          setLargeId(nextLargeId);
          setMediumId(nextMediumId);
        }
      } catch (err) {
        if (cancelled) return;
        setLoadError(
          err instanceof ApiError
            ? err.message
            : isEdit
              ? "상품 정보를 불러오지 못했습니다."
              : "카테고리/정책 정보를 불러오지 못했습니다.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadFormData();

    return () => {
      cancelled = true;
    };
  }, [isEdit, productId]);

  const largeCategories = useMemo(
    () => categories.filter((c) => c.depth === 1),
    [categories],
  );
  const mediumCategories = useMemo(
    () =>
      largeId === ""
        ? []
        : categories.filter((c) => c.parentId === largeId),
    [categories, largeId],
  );

  const leafCategoryId = useMemo(() => {
    if (mediumId !== "") return mediumId;
    if (mediumCategories.length === 0 && largeId !== "") return largeId;
    return "";
  }, [largeId, mediumCategories.length, mediumId]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      categoryId: leafCategoryId === "" ? "" : leafCategoryId,
    }));
  }, [leafCategoryId]);

  const update = <K extends keyof ProductFormInput>(
    key: K,
    value: ProductFormInput[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const clearThumbnail = () => {
    update("thumbnailUrl", "");
    setErrors((prev) => {
      const next = { ...prev };
      delete next.thumbnailUrl;
      return next;
    });
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "상품명을 입력하세요.";
    if (!form.categoryId) next.categoryId = "카테고리를 선택하세요.";
    if (!form.price.trim() || Number(form.price) <= 0)
      next.price = "가격을 올바르게 입력하세요.";
    if (!form.shortDescription.trim())
      next.shortDescription = "간단 설명을 입력하세요.";

    const thumbnail = form.thumbnailUrl.trim();
    if (!thumbnail) {
      next.thumbnailUrl = "썸네일 이미지 URL을 입력하세요.";
    } else if (!isValidHttpUrl(thumbnail)) {
      next.thumbnailUrl = "http:// 또는 https:// 로 시작하는 URL을 입력하세요.";
    }

    if (isEmptyHtml(form.detailHtml))
      next.detailHtml = "상품 상세 정보를 입력하세요.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildPayload = (resolvedPolicyId: number) => ({
    categoryId: Number(form.categoryId),
    policyId: resolvedPolicyId,
    name: form.name.trim(),
    shortDescription: form.shortDescription.trim(),
    price: Number(form.price),
    saleType: form.saleType,
    thumbnailUrl: form.thumbnailUrl.trim(),
    best: form.badges.best,
    isNew: form.badges.isNew,
    detailHtml: form.detailHtml.trim(),
    capacity: form.capacity === "" ? undefined : form.capacity,
  });

  const handleSubmit = async () => {
    if (!validate()) return;

    const resolvedPolicyId =
      form.policyId !== "" ? Number(form.policyId) : policies[0]?.policyId;
    if (!resolvedPolicyId) {
      setLoadError("등록 가능한 배송/교환 정책이 없습니다. 관리자에게 문의해주세요.");
      return;
    }

    setSubmitting(true);
    setLoadError("");

    try {
      if (isEdit) {
        if (!productId) {
          throw new ApiError("유효하지 않은 상품 ID입니다.", 400);
        }

        await updateProduct(productId, {
          ...buildPayload(resolvedPolicyId),
          status: productStatus,
        });
        router.push(`/products/${productId}`);
        return;
      }

      const created = await createProduct(buildPayload(resolvedPolicyId));
      router.push(`/products/${created.productId}`);
    } catch (err) {
      setLoadError(
        err instanceof ApiError
          ? err.message
          : isEdit
            ? "상품 수정 중 오류가 발생했습니다."
            : "상품 등록 중 오류가 발생했습니다.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-neutral-100 bg-white p-16 shadow-sm">
        <Loader2 className="size-8 animate-spin text-starbucks-green" />
      </div>
    );
  }

  const thumbnailPreviewUrl = form.thumbnailUrl.trim();
  const showThumbnailPreview =
    thumbnailPreviewUrl.length > 0 && isValidHttpUrl(thumbnailPreviewUrl);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/products")}
          className="rounded-lg border border-neutral-200 p-2 text-neutral-500 hover:bg-neutral-50"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-neutral-900">
            {isEdit ? "상품 수정" : "상품 등록"}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            썸네일·상품명·카테고리·가격·간단 설명·상세 정보는 필수입니다.
          </p>
        </div>
      </div>

      {(loadError || editorNotice) && (
        <div
          className={cn(
            "rounded-lg border px-4 py-2 text-sm",
            loadError
              ? "border-rose-100 bg-rose-50 text-rose-600"
              : "border-amber-100 bg-amber-50 text-amber-700",
          )}
        >
          {loadError || editorNotice}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
            <FieldLabel required>썸네일 이미지 URL</FieldLabel>
            <input
              type="url"
              value={form.thumbnailUrl}
              onChange={(e) => update("thumbnailUrl", e.target.value)}
              placeholder="https://example.com/images/thumbnail.jpg"
              className={inputClass}
            />
            <p className="mt-2 text-xs text-neutral-400">
              외부 이미지 URL을 입력하세요. (http/https)
            </p>

            <div className="relative mt-4 flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
              {showThumbnailPreview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnailPreviewUrl}
                    alt="썸네일 미리보기"
                    className="absolute inset-0 size-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-neutral-400">
                  <ImageIcon className="size-8" />
                  <span className="text-xs">미리보기</span>
                </div>
              )}
            </div>

            {form.thumbnailUrl.trim() && (
              <button
                type="button"
                onClick={clearThumbnail}
                className="mt-2 inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-rose-500"
              >
                <X className="size-3.5" />
                URL 초기화
              </button>
            )}
            {errors.thumbnailUrl && (
              <p className="mt-1 text-xs text-rose-500">{errors.thumbnailUrl}</p>
            )}
          </div>

          <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
            <FieldLabel>뱃지 (선택)</FieldLabel>
            <div className="space-y-2">
              {[
                { key: "best" as const, label: "BEST" },
                { key: "isNew" as const, label: "NEW" },
              ].map((badge) => (
                <label
                  key={badge.key}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-100 px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={form.badges[badge.key]}
                    onChange={(e) =>
                      update("badges", {
                        ...form.badges,
                        [badge.key]: e.target.checked,
                      })
                    }
                    className="size-4 accent-starbucks-green"
                  />
                  {badge.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-neutral-900">기본 정보</h2>
            <div className="space-y-4">
              <div>
                <FieldLabel required>상품명</FieldLabel>
                <input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className={inputClass}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-rose-500">{errors.name}</p>
                )}
              </div>

              <div>
                <FieldLabel required>카테고리</FieldLabel>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <select
                    value={String(largeId)}
                    onChange={(e) => {
                      setLargeId(
                        e.target.value === "" ? "" : Number(e.target.value),
                      );
                      setMediumId("");
                    }}
                    className={inputClass}
                  >
                    <option value="">대분류 선택</option>
                    {largeCategories.map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={String(mediumId)}
                    onChange={(e) =>
                      setMediumId(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    disabled={largeId === "" || mediumCategories.length === 0}
                    className={cn(
                      inputClass,
                      "disabled:bg-neutral-50 disabled:text-neutral-400",
                    )}
                  >
                    <option value="">
                      {mediumCategories.length === 0
                        ? "중분류 없음"
                        : "중분류 선택"}
                    </option>
                    {mediumCategories.map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.categoryId && (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors.categoryId}
                  </p>
                )}
              </div>

              <div>
                <FieldLabel>배송/교환 정책</FieldLabel>
                <select
                  value={String(form.policyId)}
                  onChange={(e) =>
                    update(
                      "policyId",
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  className={inputClass}
                >
                  <option value="">정책 선택 (미선택 시 기본 정책 적용)</option>
                  {policies.map((p) => (
                    <option key={p.policyId} value={p.policyId}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel required>가격 (원)</FieldLabel>
                  <input
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(e) => update("price", e.target.value)}
                    className={inputClass}
                  />
                  {errors.price && (
                    <p className="mt-1 text-xs text-rose-500">{errors.price}</p>
                  )}
                </div>
                <div>
                  <FieldLabel>판매 유형</FieldLabel>
                  <select
                    value={form.saleType}
                    onChange={(e) =>
                      update("saleType", e.target.value as ProductSaleType)
                    }
                    className={inputClass}
                  >
                    {SALE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {PRODUCT_SALE_TYPE_LABELS[type]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <FieldLabel>용량 (음료 등)</FieldLabel>
                <select
                  value={form.capacity}
                  onChange={(e) =>
                    update("capacity", e.target.value as ProductCapacity | "")
                  }
                  className={inputClass}
                >
                  <option value="">해당 없음</option>
                  {CAPACITIES.map((cap) => (
                    <option key={cap} value={cap}>
                      {PRODUCT_CAPACITY_LABELS[cap]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel required>간단 설명</FieldLabel>
                <textarea
                  value={form.shortDescription}
                  onChange={(e) => update("shortDescription", e.target.value)}
                  rows={3}
                  className={cn(inputClass, "resize-none")}
                />
                {errors.shortDescription && (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors.shortDescription}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
            <FieldLabel required>상품 상세 정보</FieldLabel>
            <p className="mb-3 text-xs text-neutral-500">
              Summernote 에디터에서 텍스트를 작성하고, 이미지·링크는 URL로
              삽입하세요. (그림/링크 버튼 사용)
            </p>
            {!loading && (
              <SummernoteEditor
                value={form.detailHtml}
                onChange={(html) => update("detailHtml", html)}
                onBlockedAction={setEditorNotice}
              />
            )}
            {errors.detailHtml && (
              <p className="mt-1 text-xs text-rose-500">{errors.detailHtml}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() =>
                router.push(isEdit && productId ? `/products/${productId}` : "/products")
              }
              className="rounded-lg border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-lg bg-starbucks-green px-5 py-2.5 text-sm font-medium text-white hover:bg-starbucks-green-dark disabled:opacity-60"
            >
              {submitting
                ? isEdit
                  ? "수정 중..."
                  : "등록 중..."
                : isEdit
                  ? "상품 수정"
                  : "상품 등록"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
