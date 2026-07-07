"use client";

import {
  ChevronDown,
  ChevronRight,
  Home,
  LogOut,
  Megaphone,
  Store,
  User,
  UserPlus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  hasSubmenu?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "홈", href: "/", icon: Home },
  { label: "회원 관리", href: "/members", icon: UserPlus, hasSubmenu: true },
  { label: "상품 관리", href: "/products", icon: Store, hasSubmenu: true },
  { label: "공지사항", href: "/notices", icon: Megaphone, hasSubmenu: true },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logout } = useAuth();

  return (
    <aside className="flex w-[290px] shrink-0 flex-col bg-starbucks-green-dark text-white">
      <div className="flex items-center gap-3 px-6 pt-8 pb-6">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          <Image
            src="/starbucks-logo.png"
            alt="스타벅스 로고"
            width={40}
            height={40}
            className="size-10 object-contain"
            priority
          />
        </span>
        <div className="min-w-0">
          <p className="text-lg font-bold tracking-[0.12em]">STARBUCKS</p>
          <p className="mt-0.5 text-sm text-white/70">관리자 페이지</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-4 px-3 pt-4">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3.5 rounded-lg px-4 py-6 text-base transition-colors",
                isActive
                  ? "bg-white/15 font-medium"
                  : "text-white/85 hover:bg-white/10",
              )}
            >
              <Icon className="size-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.hasSubmenu && (
                <ChevronRight className="size-4 text-white/50" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10">
        <button
          type="button"
          className="flex w-full items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-white/5"
        >
          <div className="flex size-9 items-center justify-center rounded-full bg-white/20">
            <User className="size-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{admin?.name ?? "관리자"}님</p>
            <p className="text-xs text-white/60">{admin?.loginId ?? "-"}</p>
          </div>
          <ChevronDown className="size-4 text-white/50" />
        </button>

        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="flex w-full items-center gap-3 border-t border-white/10 px-6 py-4 text-sm text-white/85 transition-colors hover:bg-white/5"
        >
          <LogOut className="size-[18px]" />
          로그아웃
        </button>
      </div>
    </aside>
  );
}
