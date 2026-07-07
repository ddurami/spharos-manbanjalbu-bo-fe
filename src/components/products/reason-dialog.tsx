"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type ReasonDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  tone?: "danger" | "warning";
  onConfirm: (reason: string) => void;
  onClose: () => void;
};

export function ReasonDialog({
  open,
  title,
  description,
  confirmLabel,
  tone = "warning",
  onConfirm,
  onClose,
}: ReasonDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
      setError("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleConfirm = () => {
    if (reason.trim().length < 5) {
      setError("사유를 5자 이상 입력해주세요.");
      return;
    }
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-neutral-900/40"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-neutral-500">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
            aria-label="닫기"
          >
            <X className="size-5" />
          </button>
        </div>

        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          사유 <span className="text-rose-500">*</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (error) {
              setError("");
            }
          }}
          rows={4}
          placeholder="처리 사유를 입력하세요. 입력한 사유는 상품 상세에 기록됩니다."
          className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none transition-colors focus:border-starbucks-green focus:ring-2 focus:ring-starbucks-green/20"
        />
        {error && <p className="mt-1.5 text-xs text-rose-500">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors",
              tone === "danger"
                ? "bg-rose-500 hover:bg-rose-600"
                : "bg-amber-500 hover:bg-amber-600",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
