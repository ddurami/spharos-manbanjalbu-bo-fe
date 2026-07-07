"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownRight,
  ArrowUpRight,
  Coffee,
  Megaphone,
  Minus,
  RefreshCw,
  Search,
  Tags,
  UserPlus,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { getDashboard } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api/client";
import type {
  DashboardResponse,
  DashboardShortcut,
  WeeklySalesPoint,
} from "@/types/dashboard";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const CHART_WIDTH = 520;
const CHART_HEIGHT = 200;
const CHART_PADDING = { top: 20, right: 16, bottom: 28, left: 48 };

const SHORTCUT_ICONS: Record<string, LucideIcon> = {
  MEMBER_SEARCH: Search,
  PRODUCT_CREATE: Coffee,
  NOTICE: Megaphone,
  SEARCH_KEYWORD: Tags,
};

// 백엔드 공지사항 API가 아직 없어 프론트 더미 데이터로 표시한다.
// 추후 GET /api/admin/notices 연동 시 이 상수를 API 응답으로 대체하면 된다.
type NoticeTag = "중요" | "일반" | "안내";

type Notice = {
  id: number;
  tag: NoticeTag;
  title: string;
  date: string;
};

const NOTICE_TAG_STYLES: Record<NoticeTag, string> = {
  중요: "bg-red-50 text-red-500",
  일반: "bg-green-50 text-starbucks-green",
  안내: "bg-neutral-100 text-neutral-500",
};

const DUMMY_NOTICES: Notice[] = [
  { id: 1, tag: "중요", title: "2026 여름 시즌 한정 음료 프로모션 안내", date: "2026.07.06" },
  { id: 2, tag: "일반", title: "7월 10일 새벽 시스템 정기 점검 안내 (02시~04시)", date: "2026.07.05" },
  { id: 3, tag: "일반", title: "개인정보 처리방침 개정 사항 안내", date: "2026.07.03" },
  { id: 4, tag: "안내", title: "2026년 하반기 신입 바리스타 채용 공고", date: "2026.07.01" },
  { id: 5, tag: "안내", title: "리워드 적립 정책 변경 및 이용 안내", date: "2026.06.28" },
];

function formatWon(value: number): string {
  return `₩ ${Math.round(value).toLocaleString("ko-KR")}`;
}

function formatCount(value: number, unit: string): string {
  return `${Math.round(value).toLocaleString("ko-KR")} ${unit}`;
}

function weekdayFromDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return WEEKDAY_LABELS[parsed.getDay()];
}

type Trend = {
  direction: "up" | "down" | "flat";
  label: string;
};

/**
 * 백엔드는 오늘/어제 비교 지표를 별도로 주지 않으므로,
 * 주간 매출 추이의 마지막 두 지점(어제→오늘)으로 증감률을 유도한다.
 */
function deriveSalesTrend(points: WeeklySalesPoint[]): Trend | null {
  if (points.length < 2) {
    return null;
  }
  const today = points[points.length - 1].sales;
  const yesterday = points[points.length - 2].sales;

  if (yesterday === 0) {
    return today > 0 ? { direction: "up", label: "전일 매출 없음" } : null;
  }

  const rate = ((today - yesterday) / yesterday) * 100;
  const rounded = Math.abs(rate).toFixed(1);

  if (rate > 0) {
    return { direction: "up", label: `전일 대비 ${rounded}%` };
  }
  if (rate < 0) {
    return { direction: "down", label: `전일 대비 ${rounded}%` };
  }
  return { direction: "flat", label: "전일과 동일" };
}

function TrendBadge({ trend }: { trend: Trend | null }) {
  if (!trend) {
    return null;
  }

  const config = {
    up: { Icon: ArrowUpRight, className: "text-starbucks-green" },
    down: { Icon: ArrowDownRight, className: "text-red-500" },
    flat: { Icon: Minus, className: "text-neutral-400" },
  }[trend.direction];

  const { Icon } = config;

  return (
    <p className={`mt-1 flex items-center gap-1 text-xs ${config.className}`}>
      <Icon className="size-3.5" />
      {trend.label}
    </p>
  );
}

type SummaryCardProps = {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: Trend | null;
  caption?: string;
};

function SummaryCard({ title, value, icon: Icon, trend, caption }: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm text-neutral-500">{title}</p>
          <p className="mt-2 truncate text-2xl font-bold text-neutral-900">
            {value}
          </p>
          {trend ? (
            <TrendBadge trend={trend} />
          ) : caption ? (
            <p className="mt-1 text-xs text-neutral-400">{caption}</p>
          ) : null}
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-50">
          <Icon className="size-5 text-starbucks-green" />
        </div>
      </div>
    </div>
  );
}

function WeeklyChart({ points }: { points: WeeklySalesPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(CHART_WIDTH);
  const height = CHART_HEIGHT;
  const padding = CHART_PADDING;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }
    const update = () => setWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const chart = useMemo(() => {
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;
    const maxSales = Math.max(...points.map((p) => p.sales), 1);
    const step = points.length > 1 ? innerW / (points.length - 1) : 0;

    const coords = points.map((point, index) => {
      const x = padding.left + index * step;
      const y = padding.top + innerH - (point.sales / maxSales) * innerH;
      return { x, y, point };
    });

    const linePath = coords
      .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`)
      .join(" ");

    const areaPath =
      coords.length > 0
        ? `${linePath} L ${coords[coords.length - 1].x} ${
            padding.top + innerH
          } L ${coords[0].x} ${padding.top + innerH} Z`
        : "";

    const gridLines = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
      y: padding.top + innerH - ratio * innerH,
      value: maxSales * ratio,
    }));

    return { coords, linePath, areaPath, gridLines, innerH };
  }, [points, width, height, padding]);

  const compactWon = (value: number) => {
    if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(1)}억`;
    if (value >= 10_000) return `${Math.round(value / 10_000).toLocaleString("ko-KR")}만`;
    return Math.round(value).toLocaleString("ko-KR");
  };

  return (
    <div className="flex flex-col rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-neutral-900">주간 매출 추이</h2>
          <p className="mt-0.5 text-xs text-neutral-400">최근 7일 · 단위 원</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-neutral-500">
          <span className="size-2 rounded-full bg-starbucks-green" />
          일별 매출
        </span>
      </div>

      <div ref={containerRef} className="w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height={height}
          preserveAspectRatio="none"
          className="block"
        >
        <defs>
          <linearGradient id="salesArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00704a" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#00704a" stopOpacity="0" />
          </linearGradient>
        </defs>

        {chart.gridLines.map((grid) => (
          <g key={grid.y}>
            <line
              x1={padding.left}
              y1={grid.y}
              x2={width - padding.right}
              y2={grid.y}
              stroke="#f1f1f1"
              strokeWidth="1"
            />
            <text
              x={padding.left - 8}
              y={grid.y + 4}
              textAnchor="end"
              fill="#bbb"
              fontSize="10"
            >
              {compactWon(grid.value)}
            </text>
          </g>
        ))}

        {chart.areaPath ? (
          <path d={chart.areaPath} fill="url(#salesArea)" />
        ) : null}
        <path
          d={chart.linePath}
          fill="none"
          stroke="#00704a"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {chart.coords.map((c) => (
          <g key={c.point.date}>
            <circle cx={c.x} cy={c.y} r="3.5" fill="#fff" stroke="#00704a" strokeWidth="2" />
            <title>
              {c.point.date} · {formatWon(c.point.sales)}
            </title>
            <text
              x={c.x}
              y={height - 8}
              textAnchor="middle"
              fill="#999"
              fontSize="11"
            >
              {weekdayFromDate(c.point.date)}
            </text>
          </g>
        ))}
        </svg>
      </div>
    </div>
  );
}

function QuickLinksCard({
  shortcuts,
  onNavigate,
}: {
  shortcuts: DashboardShortcut[];
  onNavigate: (path: string) => void;
}) {
  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 font-semibold text-neutral-900">바로가기</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {shortcuts.map((shortcut) => {
          const Icon = SHORTCUT_ICONS[shortcut.key] ?? Tags;
          return (
            <button
              key={shortcut.key}
              type="button"
              onClick={() => onNavigate(shortcut.path)}
              className="flex flex-col items-center justify-center gap-2.5 rounded-lg border border-neutral-100 bg-neutral-50 px-2 py-6 text-sm font-medium text-neutral-600 transition-colors hover:border-starbucks-green/40 hover:bg-green-50 hover:text-starbucks-green"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-white shadow-sm">
                <Icon className="size-5 text-starbucks-green" />
              </span>
              {shortcut.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NoticesCard({
  notices,
  onSelect,
}: {
  notices: Notice[];
  onSelect: () => void;
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold text-neutral-900">공지사항</h2>
        <button
          type="button"
          onClick={onSelect}
          className="text-xs text-neutral-400 transition-colors hover:text-starbucks-green"
        >
          더보기 &gt;
        </button>
      </div>

      <ul className="flex-1 divide-y divide-neutral-100">
        {notices.map((notice) => (
          <li key={notice.id}>
            <button
              type="button"
              onClick={onSelect}
              className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:text-starbucks-green"
            >
              <span
                className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${NOTICE_TAG_STYLES[notice.tag]}`}
              >
                {notice.tag}
              </span>
              <span className="flex-1 truncate text-sm text-neutral-700">
                {notice.title}
              </span>
              <span className="shrink-0 text-xs text-neutral-400">
                {notice.date}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl border border-neutral-100 bg-white"
          />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl border border-neutral-100 bg-white" />
      <div className="h-40 animate-pulse rounded-xl border border-neutral-100 bg-white" />
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-neutral-100 bg-white p-12 text-center shadow-sm">
      <p className="text-sm text-neutral-600">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center gap-2 rounded-lg bg-starbucks-green px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-starbucks-green-dark"
      >
        <RefreshCw className="size-4" />
        다시 시도
      </button>
    </div>
  );
}

export function DashboardHome() {
  const router = useRouter();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState("");

  const loadDashboard = useCallback(async () => {
    setStatus("loading");
    try {
      const result = await getDashboard();
      setData(result);
      setStatus("success");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "대시보드 정보를 불러오지 못했습니다.";
      setErrorMessage(message);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (status === "loading") {
    return <DashboardSkeleton />;
  }

  if (status === "error" || !data) {
    return <ErrorState message={errorMessage} onRetry={loadDashboard} />;
  }

  const salesTrend = deriveSalesTrend(data.weeklySalesTrend);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="오늘 매출"
          value={formatWon(data.todaySales)}
          icon={Wallet}
          trend={salesTrend}
        />
        <SummaryCard
          title="오늘 주문건수"
          value={formatCount(data.todayOrderCount, "건")}
          icon={Coffee}
          caption="오늘 누적 주문"
        />
        <SummaryCard
          title="신규 회원"
          value={formatCount(data.newMembersToday, "명")}
          icon={UserPlus}
          caption="오늘 신규 가입"
        />
        <SummaryCard
          title="이번 달 신규 회원"
          value={formatCount(data.newMembersThisMonth, "명")}
          icon={Users}
          caption="이번 달 누적 가입"
        />
      </div>

      <WeeklyChart points={data.weeklySalesTrend} />

      <QuickLinksCard
        shortcuts={data.shortcuts}
        onNavigate={(path) => router.push(path)}
      />

      <NoticesCard
        notices={DUMMY_NOTICES}
        onSelect={() => router.push("/notices")}
      />
    </div>
  );
}
