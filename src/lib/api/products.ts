import { apiRequest } from "@/lib/api/client";
import type {
  CategoryResponse,
  ProductCreateRequest,
  ProductDetailResponse,
  ProductPolicyResponse,
  ProductReasonRequest,
  ProductSearchParams,
  ProductSummaryResponse,
  ProductUpdateRequest,
  ProductListItem,
  SpringPage,
} from "@/types/product-api";

const BASE = "/api/admin/products";

function toQuery(params: ProductSearchParams): string {
  const search = new URLSearchParams();
  if (params.name) search.set("name", params.name);
  if (params.categoryId != null) search.set("categoryId", String(params.categoryId));
  if (params.status) search.set("status", params.status);
  if (params.minPrice != null) search.set("minPrice", String(params.minPrice));
  if (params.maxPrice != null) search.set("maxPrice", String(params.maxPrice));
  if (params.registeredFrom) search.set("registeredFrom", params.registeredFrom);
  if (params.registeredTo) search.set("registeredTo", params.registeredTo);
  search.set("page", String(params.page ?? 0));
  search.set("size", String(params.size ?? 10));
  search.set("sort", params.sort ?? "createdAt,desc");
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function getProductSummary() {
  return apiRequest<ProductSummaryResponse>(`${BASE}/summary`);
}

export function getProducts(params: ProductSearchParams = {}) {
  return apiRequest<SpringPage<ProductListItem>>(`${BASE}${toQuery(params)}`);
}

export function getProductDetail(productId: number) {
  return apiRequest<ProductDetailResponse>(`${BASE}/${productId}`);
}

export function createProduct(body: ProductCreateRequest) {
  return apiRequest<ProductDetailResponse>(BASE, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateProduct(productId: number, body: ProductUpdateRequest) {
  return apiRequest<ProductDetailResponse>(`${BASE}/${productId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function markProductSoldOut(productId: number, body: ProductReasonRequest) {
  return apiRequest<null>(`${BASE}/${productId}/sold-out`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function stopProductSelling(productId: number, body: ProductReasonRequest) {
  return apiRequest<null>(`${BASE}/${productId}/stop-selling`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function deleteProduct(productId: number, body: ProductReasonRequest) {
  return apiRequest<null>(`${BASE}/${productId}`, {
    method: "DELETE",
    body: JSON.stringify(body),
  });
}

export function getProductCategories() {
  return apiRequest<CategoryResponse[]>(`${BASE}/categories`);
}

export function getProductPolicies() {
  return apiRequest<ProductPolicyResponse[]>(`${BASE}/policies`);
}
