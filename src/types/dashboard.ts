export type WeeklySalesPoint = {
  date: string;
  sales: number;
};

export type DashboardShortcutKey =
  | "MEMBER_SEARCH"
  | "PRODUCT_CREATE"
  | "NOTICE"
  | "SEARCH_KEYWORD";

export type DashboardShortcut = {
  key: DashboardShortcutKey | string;
  label: string;
  path: string;
};

export type DashboardResponse = {
  todaySales: number;
  todayOrderCount: number;
  newMembersToday: number;
  newMembersThisMonth: number;
  weeklySalesTrend: WeeklySalesPoint[];
  shortcuts: DashboardShortcut[];
};
