// UI 표현용 상품 타입 (백엔드 DTO → product-mappers.ts 로 변환)

export type ProductStatus = "ON_SALE" | "SOLD_OUT" | "HIDDEN";
export type ProductSaleType = "NORMAL" | "LIMITED" | "SEASON";
export type ProductCapacity =
  | "SHORT"
  | "TALL"
  | "GRANDE"
  | "VENTI"
  | "TRENTA";

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  ON_SALE: "판매중",
  SOLD_OUT: "품절",
  HIDDEN: "판매중지",
};

export const PRODUCT_SALE_TYPE_LABELS: Record<ProductSaleType, string> = {
  NORMAL: "일반",
  LIMITED: "한정",
  SEASON: "시즌",
};

export const PRODUCT_CAPACITY_LABELS: Record<ProductCapacity, string> = {
  SHORT: "Short (237ml)",
  TALL: "Tall (355ml)",
  GRANDE: "Grande (473ml)",
  VENTI: "Venti (591ml)",
  TRENTA: "Trenta (887ml)",
};

export type CategoryPath = {
  large: string;
  medium: string;
  small: string;
};

export type ProductBadges = {
  best: boolean;
  isNew: boolean;
  sale: boolean;
};

export type ProductActionType = "SOLD_OUT" | "HIDDEN" | "DELETE";

export const PRODUCT_ACTION_LABELS: Record<ProductActionType, string> = {
  SOLD_OUT: "품절 처리",
  HIDDEN: "판매 중지",
  DELETE: "상품 삭제",
};

export type ProductStatusLog = {
  id: string;
  type: ProductActionType;
  reason: string;
  createdAt: string;
};

export type Product = {
  id: number;
  code: string;
  name: string;
  shortDescription: string;
  category: CategoryPath;
  categoryId: number | null;
  policyId: number | null;
  policyTitle: string | null;
  price: number;
  saleType: ProductSaleType;
  capacity: ProductCapacity | null;
  badgeLabels: string[];
  badges: ProductBadges;
  status: ProductStatus;
  isDeleted: boolean;
  thumbnailUrl: string;
  detailImageUrls: string[];
  detailHtml: string | null;
  totalSalesCount: number;
  createdAt: string;
  updatedAt: string;
  statusLogs: ProductStatusLog[];
};

export type ProductFormInput = {
  name: string;
  categoryId: number | "";
  policyId: number | "";
  price: string;
  saleType: ProductSaleType;
  capacity: ProductCapacity | "";
  shortDescription: string;
  thumbnailUrl: string;
  detailImageUrls: string[];
  badges: Pick<ProductBadges, "best" | "isNew">;
};
