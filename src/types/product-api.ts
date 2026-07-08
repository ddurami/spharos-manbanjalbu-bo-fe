import type {
  ProductCapacity,
  ProductSaleType,
  ProductStatus,
} from "@/types/product";

export type ProductSummaryResponse = {
  totalCount: number;
  onSaleCount: number;
  soldOutCount: number;
  hiddenCount: number;
  deletedCount: number;
};

export type ProductListItem = {
  productId: number;
  name: string;
  thumbnailUrl: string | null;
  categoryName: string | null;
  price: number;
  status: ProductStatus;
  saleType: ProductSaleType;
  badges: string[];
  salesCount: number;
  createdAt: string;
  updatedAt?: string;
};

export type SpringPage<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type CategoryPathItem = {
  categoryId: number;
  name: string;
  depth: number;
};

export type ProductMediaResponse = {
  mediaId: number;
  mediaType: "THUMBNAIL" | "DETAIL_IMAGE" | "DETAIL_HTML";
  mediaUrl: string;
  displayOrder: number | null;
  main: boolean;
};

export type ProductDetailResponse = {
  productId: number;
  name: string;
  shortDescription: string;
  price: number;
  status: ProductStatus;
  deleted: boolean;
  saleType: ProductSaleType;
  best: boolean;
  isNew: boolean;
  badges: string[];
  capacity: ProductCapacity | null;
  seasonId: number | null;
  seasonName: string | null;
  categoryId: number | null;
  categoryPath: CategoryPathItem[];
  policyId: number | null;
  policyTitle: string | null;
  salesCount: number;
  thumbnailUrl: string | null;
  detailImages: ProductMediaResponse[];
  detailHtml: string | null;
  statusChangeReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductCreateRequest = {
  categoryId: number;
  policyId: number;
  name: string;
  shortDescription: string;
  price: number;
  saleType: ProductSaleType;
  thumbnailUrl: string;
  seasonId?: number;
  capacity?: ProductCapacity;
  status?: ProductStatus;
  best?: boolean;
  isNew?: boolean;
  detailImageUrls?: string[];
  detailHtml?: string;
};

export type ProductUpdateRequest = {
  categoryId: number;
  policyId: number;
  name: string;
  shortDescription: string;
  price: number;
  saleType: ProductSaleType;
  thumbnailUrl: string;
  seasonId?: number;
  capacity?: ProductCapacity;
  status?: ProductStatus;
  best: boolean;
  isNew: boolean;
  detailImageUrls?: string[];
  detailHtml?: string;
};

export type ProductReasonRequest = {
  reason: string;
};

export type CategoryResponse = {
  categoryId: number;
  name: string;
  depth: number;
  parentId: number | null;
  displayOrder: number | null;
};

export type ProductPolicyResponse = {
  policyId: number;
  title: string;
};

export type SeasonResponse = {
  seasonId: number;
  name: string;
};

export type ProductSearchParams = {
  name?: string;
  categoryId?: number;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  registeredFrom?: string;
  registeredTo?: string;
  page?: number;
  size?: number;
  sort?: string;
};
