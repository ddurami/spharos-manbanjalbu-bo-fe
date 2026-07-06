import {
  Coffee,
  Megaphone,
  Search,
  Settings,
  Store,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

const SUMMARY_CARDS = [
  {
    title: "오늘 매출",
    value: "₩ 12,345,600",
    change: "전일 대비 ▲ 8.3%",
    icon: Wallet,
  },
  {
    title: "오늘 주문건수",
    value: "1,284 건",
    change: "전일 대비 ▲ 6.7%",
    icon: Coffee,
  },
  {
    title: "신규 회원",
    value: "87 명",
    change: "전일 대비 ▲ 12.5%",
    icon: UserPlus,
  },
  {
    title: "이번 달 회원 수",
    value: "52,417 명",
    change: "전월 대비 ▲ 5.2%",
    icon: Users,
  },
];

const TOP_STORES = [
  { rank: 1, name: "강남역점", amount: "₩ 2,840,000" },
  { rank: 2, name: "코엑스몰점", amount: "₩ 2,510,000" },
  { rank: 3, name: "잠실롯데월드점", amount: "₩ 2,180,000" },
  { rank: 4, name: "홍대입구점", amount: "₩ 1,920,000" },
  { rank: 5, name: "부산센텀시티점", amount: "₩ 1,750,000" },
];

const NOTICES = [
  {
    tag: "중요",
    tagColor: "bg-red-50 text-red-500",
    title: "2026 여름 시즌 프로모션 안내",
    date: "2026.07.05",
  },
  {
    tag: "일반",
    tagColor: "bg-green-50 text-starbucks-green",
    title: "7월 10일 시스템 점검 안내",
    date: "2026.07.04",
  },
  {
    tag: "일반",
    tagColor: "bg-green-50 text-starbucks-green",
    title: "개인정보 처리방침 변경 안내",
    date: "2026.07.02",
  },
  {
    tag: "안내",
    tagColor: "bg-neutral-100 text-neutral-500",
    title: "바리스타 채용 공고",
    date: "2026.06.28",
  },
];

const QUICK_LINKS = [
  { label: "매출 현황", icon: TrendingUp },
  { label: "회원 검색", icon: Search },
  { label: "상품 등록", icon: Store },
  { label: "매장 관리", icon: Store },
  { label: "프로모션 등록", icon: Megaphone },
  { label: "리포트", icon: TrendingUp },
  { label: "공지사항", icon: Megaphone },
  { label: "시스템 설정", icon: Settings },
];

const CHART_POINTS = [42, 55, 48, 62, 58, 72, 68];
const LAST_WEEK_POINTS = [38, 45, 52, 50, 55, 60, 58];

function SummaryCard({
  title,
  value,
  change,
  icon: Icon,
}: (typeof SUMMARY_CARDS)[number]) {
  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-neutral-900">{value}</p>
          <p className="mt-1 text-xs text-starbucks-green">{change}</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-lg bg-green-50">
          <Icon className="size-5 text-starbucks-green" />
        </div>
      </div>
    </div>
  );
}

function WeeklyChart() {
  const width = 480;
  const height = 160;
  const padding = 24;

  const toPath = (points: number[]) => {
    const max = 100;
    const step = (width - padding * 2) / (points.length - 1);

    return points
      .map((point, index) => {
        const x = padding + index * step;
        const y = height - padding - (point / max) * (height - padding * 2);
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-neutral-900">주간 매출 추이</h2>
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-starbucks-green" />
            이번주
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-neutral-300" />
            지난주
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-40 w-full"
        aria-hidden
      >
        {[0, 25, 50, 75, 100].map((tick) => {
          const y =
            height - padding - (tick / 100) * (height - padding * 2);
          return (
            <g key={tick}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#f0f0f0"
                strokeWidth="1"
              />
              <text x="4" y={y + 4} fill="#aaa" fontSize="10">
                {tick}
              </text>
            </g>
          );
        })}
        <path
          d={toPath(LAST_WEEK_POINTS)}
          fill="none"
          stroke="#d4d4d4"
          strokeWidth="2"
        />
        <path
          d={toPath(CHART_POINTS)}
          fill="none"
          stroke="#00704a"
          strokeWidth="2.5"
        />
      </svg>

      <div className="mt-2 flex justify-between px-6 text-xs text-neutral-400">
        {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
    </div>
  );
}

function TopStoresCard() {
  const maxAmount = 2840000;

  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-neutral-900">
          오늘 매장별 매출 TOP 5
        </h2>
        <button type="button" className="text-xs text-neutral-400">
          더보기 &gt;
        </button>
      </div>

      <ul className="space-y-3">
        {TOP_STORES.map((store) => {
          const amount = parseInt(store.amount.replace(/[^\d]/g, ""), 10);
          const width = `${(amount / maxAmount) * 100}%`;

          return (
            <li key={store.rank} className="flex items-center gap-3">
              <span className="w-4 text-sm font-semibold text-starbucks-green">
                {store.rank}
              </span>
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-neutral-700">{store.name}</span>
                  <span className="text-neutral-500">{store.amount}</span>
                </div>
                <div className="h-1.5 rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-starbucks-green"
                    style={{ width }}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function NoticesCard() {
  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-neutral-900">공지사항</h2>
        <button type="button" className="text-xs text-neutral-400">
          더보기 &gt;
        </button>
      </div>

      <ul className="divide-y divide-neutral-100">
        {NOTICES.map((notice) => (
          <li
            key={notice.title}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium ${notice.tagColor}`}
            >
              {notice.tag}
            </span>
            <span className="flex-1 truncate text-sm text-neutral-700">
              {notice.title}
            </span>
            <span className="shrink-0 text-xs text-neutral-400">
              {notice.date}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuickLinksCard() {
  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 font-semibold text-neutral-900">바로가기</h2>
      <div className="grid grid-cols-4 gap-3">
        {QUICK_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.label}
              type="button"
              className="flex flex-col items-center gap-2 rounded-lg border border-neutral-100 bg-neutral-50 px-2 py-4 text-xs text-neutral-600 transition-colors hover:border-starbucks-green/30 hover:bg-green-50"
            >
              <Icon className="size-5 text-starbucks-green" />
              {link.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardHome() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {SUMMARY_CARDS.map((card) => (
          <SummaryCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <WeeklyChart />
        <TopStoresCard />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <NoticesCard />
        <QuickLinksCard />
      </div>
    </div>
  );
}
