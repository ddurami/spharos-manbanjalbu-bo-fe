"use client";

import { Bell, Calendar, Settings } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";

export function AdminHeader() {
  const { admin } = useAuth();
  const now = new Date();
  const formattedDate = now.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
  const formattedTime = now.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const displayName = admin?.name ?? "관리자";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 bg-neutral-50 px-8">
      <h1 className="text-lg">
        <span className="font-semibold text-starbucks-green">{displayName}</span>
        <span className="font-semibold text-neutral-800">님, 환영합니다!</span>
      </h1>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Calendar className="size-4" />
          <span>
            {formattedDate} {formattedTime} 기준
          </span>
        </div>

        <div className="h-5 w-px bg-neutral-200" />

        <button
          type="button"
          className="relative text-neutral-500 transition-colors hover:text-neutral-700"
          aria-label="알림"
        >
          <Bell className="size-5" />
          <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-starbucks-green text-[10px] font-medium text-white">
            3
          </span>
        </button>

        <button
          type="button"
          className="text-neutral-500 transition-colors hover:text-neutral-700"
          aria-label="설정"
        >
          <Settings className="size-5" />
        </button>
      </div>
    </header>
  );
}
