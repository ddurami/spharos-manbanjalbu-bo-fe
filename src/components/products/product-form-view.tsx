"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Loader2, X } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import { uploadThumbnail } from "@/lib/api/files";
import {
  createProduct,
  getProductCategories,
  getProductPolicies,
} from "@/lib/api/products";
import { cn } from "@/lib/utils";
import {
  PRODUCT_CAPACITY_LABELS,
  PRODUCT_SALE_TYPE_LABELS,
  type ProductCapacity,
  type ProductFormInput,
  type ProductSaleType,
} from "@/types/product";
import type { CategoryResponse, ProductPolicyResponse } from "@/types/product-api";

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
const THUMBNAIL_ACCEPT = "image/jpeg,image/png,image/gif,image/webp,image/bmp";

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

const inputClass =
  "w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none transition-colors focus:border-starbucks-green focus:ring-2 focus:ring-starbucks-green/20";

export function ProductFormView({ mode }: { mode: "create" | "edit" }) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormInput>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [policies, setPolicies] = useState<ProductPolicyResponse[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [editorError, setEditorError] = useState("");

  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [thumbnailFileName, setThumbnailFileName] = useState("");
  const [thumbnailUploading, setThumbnailUploading] = useState(false);

  const [largeId, setLargeId] = useState<number | "">("");
  const [mediumId, setMediumId] = useState<number | "">("");

  useEffect(() => {
    Promise.all([getProductCategories(), getProductPolicies()])
      .then(([cats, pols]) => {
        setCategories(cats);
        setPolicies(pols);
      })
      .catch((err) => {
        setLoadError(
          err instanceof ApiError
            ? err.message
            : "카테고리/정책 정보를 불러오지 못했습니다.",
        );
      });
  }, []);

  useEffect(() => {
    return () => {
      if (thumbnailPreview.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

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

  if (mode === "edit") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-neutral-100 bg-white p-16 text-center shadow-sm">
        <p className="text-sm text-neutral-600">
          상품 수정 화면은 추후 API 연동 예정입니다.
        </p>
        <Link
          href="/products"
          className="rounded-lg bg-starbucks-green px-4 py-2 text-sm font-medium text-white"
        >
          상품 목록으로
        </Link>
      </div>
    );
  }

  const update = <K extends keyof ProductFormInput>(
    key: K,
    value: ProductFormInput[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const clearThumbnail = () => {
    if (thumbnailPreview.startsWith("blob:")) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setThumbnailPreview("");
    setThumbnailFileName("");
    update("thumbnailUrl", "");
    setErrors((prev) => {
      const next = { ...prev };
      delete next.thumbnailUrl;
      return next;
    });
  };

  const handleThumbnailChange = async (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        thumbnailUrl: "이미지 파일만 업로드할 수 있습니다.",
      }));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (thumbnailPreview.startsWith("blob:")) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setThumbnailPreview(previewUrl);
    setThumbnailFileName(file.name);
    setThumbnailUploading(true);
    setLoadError("");

    try {
      const uploaded = await uploadThumbnail(file);
      update("thumbnailUrl", uploaded.url);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.thumbnailUrl;
        return next;
      });
    } catch (err) {
      clearThumbnail();
      setLoadError(
        err instanceof ApiError
          ? err.message
          : "썸네일 업로드 중 오류가 발생했습니다.",
      );
    } finally {
      setThumbnailUploading(false);
    }
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "상품명을 입력하세요.";
    if (!form.categoryId) next.categoryId = "카테고리를 선택하세요.";
    if (!form.price.trim() || Number(form.price) <= 0)
      next.price = "가격을 올바르게 입력하세요.";
    if (!form.shortDescription.trim())
      next.shortDescription = "간단 설명을 입력하세요.";
    if (!form.thumbnailUrl.trim())
      next.thumbnailUrl = "썸네일 이미지를 업로드하세요.";
    if (isEmptyHtml(form.detailHtml))
      next.detailHtml = "상품 상세 정보를 입력하세요.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (thumbnailUploading) {
      setLoadError("썸네일 업로드가 완료될 때까지 기다려주세요.");
      return;
    }
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
      const created = await createProduct({
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
      router.push(`/products/${created.productId}`);
    } catch (err) {
      setLoadError(
        err instanceof ApiError
          ? err.message
          : "상품 등록 중 오류가 발생했습니다.",
      );
    } finally {
      setSubmitting(false);
    }
  };

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
          <h1 className="text-xl font-bold text-neutral-900">상품 등록</h1>
          <p className="mt-1 text-sm text-neutral-500">
            썸네일·상품명·카테고리·가격·간단 설명·상세 정보는 필수입니다.
          </p>
        </div>
      </div>

      {(loadError || editorError) && (
        <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-2 text-sm text-rose-600">
          {loadError || editorError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
            <FieldLabel required>썸네일 이미지</FieldLabel>
            <label
              className={cn(
                "relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed border-neutral-200 text-center transition-colors hover:border-starbucks-green/40 hover:bg-starbucks-green/5",
                thumbnailUploading && "pointer-events-none opacity-60",
              )}
            >
              {thumbnailPreview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnailPreview}
                    alt="썸네일 미리보기"
                    className="absolute inset-0 size-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors hover:bg-black/20" />
                </>
              ) : thumbnailUploading ? (
                <Loader2 className="size-8 animate-spin text-starbucks-green" />
              ) : (
                <ImagePlus className="size-8 text-neutral-400" />
              )}
              {!thumbnailPreview && (
                <>
                  <span className="text-sm font-medium text-neutral-700">
                    {thumbnailUploading ? "업로드 중..." : "클릭하여 이미지 선택"}
                  </span>
                  <span className="px-4 text-xs text-neutral-400">
                    JPG, PNG, GIF, WEBP (최대 10MB)
                  </span>
                </>
              )}
              <input
                type="file"
                accept={THUMBNAIL_ACCEPT}
                className="hidden"
                disabled={thumbnailUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  void handleThumbnailChange(file);
                  e.target.value = "";
                }}
              />
            </label>

            {thumbnailPreview && !thumbnailUploading && (
              <button
                type="button"
                onClick={clearThumbnail}
                className="mt-2 inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-rose-500"
              >
                <X className="size-3.5" />
                썸네일 제거
              </button>
            )}
            {thumbnailFileName && (
              <p className="mt-2 text-xs text-neutral-500">
                {thumbnailFileName}
                {form.thumbnailUrl ? " · 업로드 완료" : ""}
              </p>
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
              Summernote 에디터에서 텍스트·이미지·파일 첨부를 작성할 수
              있습니다. 이미지/파일은 서버에 자동 업로드됩니다.
            </p>
            <SummernoteEditor
              value={form.detailHtml}
              onChange={(html) => update("detailHtml", html)}
              onUploadError={setEditorError}
            />
            {errors.detailHtml && (
              <p className="mt-1 text-xs text-rose-500">{errors.detailHtml}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => router.push("/products")}
              className="rounded-lg border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || thumbnailUploading}
              className="rounded-lg bg-starbucks-green px-5 py-2.5 text-sm font-medium text-white hover:bg-starbucks-green-dark disabled:opacity-60"
            >
              {submitting ? "등록 중..." : "상품 등록"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
