import type { ProductDetailResponse, ProductListItem } from "@/types/product-api";
import type { CategoryPath, Product, ProductStatusLog } from "@/types/product";

export function buildProductCode(productId: number): string {
  return `PRD-${productId.toString().padStart(5, "0")}`;
}

export function categoryPathFromItems(
  items: { name: string; depth: number }[],
): CategoryPath {
  const sorted = [...items].sort((a, b) => a.depth - b.depth);
  return {
    large: sorted[0]?.name ?? "",
    medium: sorted[1]?.name ?? "",
    small: sorted[2]?.name ?? "",
  };
}

export function mapListItemToRow(item: ProductListItem) {
  return {
    id: item.productId,
    code: buildProductCode(item.productId),
    name: item.name,
    thumbnailUrl: item.thumbnailUrl ?? "",
    categoryLabel: item.categoryName ?? "-",
    price: item.price,
    status: item.status,
    saleType: item.saleType,
    badgeLabels: item.badges,
    totalSalesCount: item.salesCount,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt ?? item.createdAt,
  };
}

export function mapDetailToProduct(detail: ProductDetailResponse): Product {
  const statusLogs: ProductStatusLog[] = [];
  if (detail.statusChangeReason) {
    const type =
      detail.deleted
        ? "DELETE"
        : detail.status === "SOLD_OUT"
          ? "SOLD_OUT"
          : detail.status === "HIDDEN"
            ? "HIDDEN"
            : "HIDDEN";
    statusLogs.push({
      id: `reason-${detail.productId}`,
      type,
      reason: detail.statusChangeReason,
      createdAt: detail.updatedAt,
    });
  }

  return {
    id: detail.productId,
    code: buildProductCode(detail.productId),
    name: detail.name,
    shortDescription: detail.shortDescription,
    category: categoryPathFromItems(detail.categoryPath),
    categoryId: detail.categoryId,
    policyId: detail.policyId,
    policyTitle: detail.policyTitle,
    price: detail.price,
    saleType: detail.saleType,
    capacity: detail.capacity,
    badgeLabels: detail.badges,
    badges: {
      best: detail.best,
      isNew: detail.isNew,
      sale: detail.badges.includes("SALE"),
    },
    status: detail.status,
    isDeleted: detail.deleted,
    thumbnailUrl: detail.thumbnailUrl ?? "",
    detailImageUrls: detail.detailImages.map((m) => m.mediaUrl),
    detailHtml: detail.detailHtml,
    totalSalesCount: detail.salesCount,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
    statusLogs,
  };
}

export type ProductListRow = ReturnType<typeof mapListItemToRow>;
