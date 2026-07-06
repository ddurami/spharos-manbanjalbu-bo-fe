"use client";

import { Eye, EyeOff, Lock, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

const SAVED_ID_KEY = "starbucks-admin-saved-id";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberId, setRememberId] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const savedId = localStorage.getItem(SAVED_ID_KEY);
    if (savedId) {
      setUserId(savedId);
      setRememberId(true);
    }
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    if (rememberId) {
      localStorage.setItem(SAVED_ID_KEY, userId);
    } else {
      localStorage.removeItem(SAVED_ID_KEY);
    }

    try {
      await login({ loginId: userId.trim(), password });
      router.push("/");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "로그인에 실패했습니다. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-10 flex items-center gap-2.5">
        <div className="size-9 shrink-0 overflow-hidden rounded-full">
          <Image
            src="/starbucks-logo.png"
            alt="Starbucks"
            width={36}
            height={36}
            priority
            className="size-full object-cover"
          />
        </div>
        <span className="text-lg font-bold tracking-[0.08em] text-black">
          STARBUCKS
        </span>
      </div>

      <div className="mb-8">
        <h1 className="text-[28px] font-bold leading-tight text-black">
          스타벅스 관리자 페이지
        </h1>
        <p className="mt-3 text-xl font-bold text-starbucks-green">로그인</p>
        <p className="mt-2 text-sm text-neutral-400">
          관리자 계정으로 로그인하여 시스템을 이용하세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-neutral-400"
            aria-hidden
          />
          <input
            id="userId"
            type="text"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            placeholder="아이디를 입력해주세요"
            autoComplete="username"
            required
            className={cn(
              "h-12 w-full rounded-lg border border-neutral-200 bg-white pr-4 pl-11 text-sm text-black",
              "placeholder:text-neutral-400",
              "transition-colors outline-none",
              "focus:border-starbucks-green focus:ring-2 focus:ring-starbucks-green/20",
            )}
          />
        </div>

        <div className="relative">
          <Lock
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-neutral-400"
            aria-hidden
          />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호를 입력해주세요"
            autoComplete="current-password"
            required
            className={cn(
              "h-12 w-full rounded-lg border border-neutral-200 bg-white pr-11 pl-11 text-sm text-black",
              "placeholder:text-neutral-400",
              "transition-colors outline-none",
              "focus:border-starbucks-green focus:ring-2 focus:ring-starbucks-green/20",
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute top-1/2 right-4 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-600"
            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-500">
            <input
              type="checkbox"
              checked={rememberId}
              onChange={(event) => setRememberId(event.target.checked)}
              className="size-4 rounded border-neutral-300 accent-starbucks-green"
            />
            아이디 저장
          </label>
          <button
            type="button"
            className="text-sm text-neutral-400 transition-colors hover:text-neutral-600"
          >
            비밀번호 찾기 &gt;
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "mt-2 h-12 w-full rounded-lg bg-starbucks-green text-sm font-semibold text-white",
            "transition-colors hover:bg-starbucks-green-dark",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          {isSubmitting ? "로그인 중..." : "로그인"}
        </button>

        {errorMessage && (
          <p className="text-center text-sm text-red-500">{errorMessage}</p>
        )}
      </form>
    </div>
  );
}
