import type { CategoryResponse, ProductSearchParams } from "@/types/product-api";
import type { ProductStatus } from "@/types/product";

type SearchField = "all" | "name" | "category" | "price" | "date";

export function buildProductSearchParams(
  field: SearchField,
  query: string,
  page: number,
  statusFilter: "ALL" | ProductStatus,
  categories: CategoryResponse[],
  pageSize = 10,
): ProductSearchParams {
  const params: ProductSearchParams = {
    page: page - 1,
    size: pageSize,
    sort: "createdAt,desc",
  };

  if (statusFilter !== "ALL") {
    params.status = statusFilter;
  }

  const trimmed = query.trim();
  if (!trimmed) {
    return params;
  }

  switch (field) {
    case "name":
    case "all":
      params.name = trimmed;
      break;
    case "category": {
      const match = categories.find((c) =>
        c.name.toLowerCase().includes(trimmed.toLowerCase()),
      );
      if (match) {
        params.categoryId = match.categoryId;
      } else {
        params.name = trimmed;
      }
      break;
    }
    case "price": {
      const price = Number(trimmed.replace(/[^\d]/g, ""));
      if (price > 0) {
        params.minPrice = price;
        params.maxPrice = price;
      }
      break;
    }
    case "date": {
      const normalized = trimmed.replace(/\./g, "-");
      if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
        params.registeredFrom = normalized;
        params.registeredTo = normalized;
      } else if (/^\d{4}-\d{2}$/.test(normalized)) {
        const [year, month] = normalized.split("-").map(Number);
        const lastDay = new Date(year, month, 0).getDate();
        params.registeredFrom = `${normalized}-01`;
        params.registeredTo = `${normalized}-${String(lastDay).padStart(2, "0")}`;
      }
      break;
    }
    default:
      break;
  }

  return params;
}
