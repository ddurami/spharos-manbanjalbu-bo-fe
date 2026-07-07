"use client";

import { Calendar } from "lucide-react";

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
    <header className="flex h-35 shrink-0 items-center justify-between border-b border-neutral-200 bg-neutral-50 px-8 py-6">
      <h1 className="text-lg">
        <span className="font-semibold text-starbucks-green">{displayName}</span>
        <span className="font-semibold text-neutral-800">님 <br />환영합니다!</span>
      </h1>

      <div className="flex items-center gap-2.5 text-base text-neutral-500">
        <Calendar className="size-6" />
        <span>
          {formattedDate} {formattedTime} 기준
        </span>
      </div>
    </header>
  );
}
