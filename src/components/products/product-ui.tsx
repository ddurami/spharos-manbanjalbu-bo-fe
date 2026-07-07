import { Coffee } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  PRODUCT_SALE_TYPE_LABELS,
  PRODUCT_STATUS_LABELS,
  type CategoryPath,
  type ProductBadges,
  type ProductSaleType,
  type ProductStatus,
} from "@/types/product";

export function formatCategoryPath(category: CategoryPath, sep = " > "): string {
  return [category.large, category.medium, category.small]
    .filter((part) => part && part.trim().length > 0)
    .join(sep);
}

export function formatWon(value: number): string {
  return `₩ ${value.toLocaleString("ko-KR")}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("ko-KR");
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return `${formatDate(iso)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const STATUS_STYLES: Record<ProductStatus, string> = {
  ON_SALE: "bg-green-50 text-starbucks-green",
  SOLD_OUT: "bg-amber-50 text-amber-600",
  HIDDEN: "bg-neutral-100 text-neutral-500",
};

const STATUS_DOT: Record<ProductStatus, string> = {
  ON_SALE: "bg-starbucks-green",
  SOLD_OUT: "bg-amber-500",
  HIDDEN: "bg-neutral-400",
};

export function StatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        STATUS_STYLES[status],
      )}
    >
      <span className={cn("mr-1.5 size-1.5 rounded-full", STATUS_DOT[status])} />
      {PRODUCT_STATUS_LABELS[status]}
    </span>
  );
}

export function SaleTypeChip({ saleType }: { saleType: ProductSaleType }) {
  const styles: Record<ProductSaleType, string> = {
    NORMAL: "bg-neutral-100 text-neutral-600",
    LIMITED: "bg-rose-50 text-rose-600",
    SEASON: "bg-sky-50 text-sky-600",
  };
  if (saleType === "NORMAL") {
    return null;
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
        styles[saleType],
      )}
    >
      {PRODUCT_SALE_TYPE_LABELS[saleType]}
    </span>
  );
}

export function BadgeChips({
  badges,
  badgeLabels,
}: {
  badges?: ProductBadges;
  badgeLabels?: string[];
}) {
  const labels = (
    badgeLabels ??
    [
      badges?.best ? "BEST" : null,
      badges?.isNew ? "NEW" : null,
      badges?.sale ? "SALE" : null,
    ].filter((label): label is string => Boolean(label))
  );

  if (labels.length === 0) {
    return <span className="text-xs text-neutral-300">-</span>;
  }

  const styles: Record<string, string> = {
    BEST: "bg-amber-100 text-amber-700",
    NEW: "bg-emerald-100 text-emerald-700",
    SALE: "bg-rose-100 text-rose-600",
    LIMITED: "bg-rose-50 text-rose-600",
    SEASON: "bg-sky-50 text-sky-600",
  };

  return (
    <span className="inline-flex flex-wrap gap-1">
      {labels.map((label) => (
        <span
          key={label}
          className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-bold ${
            styles[label] ?? "bg-neutral-100 text-neutral-600"
          }`}
        >
          {label}
        </span>
      ))}
    </span>
  );
}

const GRADIENTS = [
  "from-emerald-100 to-emerald-50",
  "from-green-100 to-lime-50",
  "from-teal-100 to-emerald-50",
  "from-amber-100 to-orange-50",
  "from-sky-100 to-cyan-50",
  "from-rose-100 to-pink-50",
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export function Thumbnail({
  name,
  url,
  className,
}: {
  name: string;
  url?: string;
  className?: string;
}) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={url}
        alt={name}
        className={cn("rounded-lg object-cover", className)}
      />
    );
  }

  const gradient = GRADIENTS[Math.abs(hashString(name)) % GRADIENTS.length];

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg bg-gradient-to-br text-starbucks-green",
        gradient,
        className,
      )}
      aria-label={name}
    >
      <Coffee className="size-1/3" />
    </div>
  );
}
