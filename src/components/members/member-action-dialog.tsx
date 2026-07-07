"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type MemberActionDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  tone?: "danger" | "warning";
  defaultEmailSubject?: string;
  defaultEmailBody?: string;
  onConfirm: (payload: {
    reason: string;
    emailSubject: string;
    emailBody: string;
  }) => void;
  onClose: () => void;
};

export function MemberActionDialog({
  open,
  title,
  description,
  confirmLabel,
  tone = "warning",
  defaultEmailSubject = "",
  defaultEmailBody = "",
  onConfirm,
  onClose,
}: MemberActionDialogProps) {
  const [reason, setReason] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
      setEmailSubject(defaultEmailSubject);
      setEmailBody(defaultEmailBody);
      setError("");
    }
  }, [open, defaultEmailSubject, defaultEmailBody]);

  if (!open) return null;

  const handleConfirm = () => {
    if (reason.trim().length < 5) {
      setError("사유를 5자 이상 입력해주세요.");
      return;
    }
    if (!emailSubject.trim()) {
      setError("메일 제목을 입력해주세요.");
      return;
    }
    if (!emailBody.trim()) {
      setError("메일 내용을 입력해주세요.");
      return;
    }
    onConfirm({
      reason: reason.trim(),
      emailSubject: emailSubject.trim(),
      emailBody: emailBody.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/40" onClick={onClose} aria-hidden />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
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
            className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100"
            aria-label="닫기"
          >
            <X className="size-5" />
          </button>
        </div>

        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          처리 사유 <span className="text-rose-500">*</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (error) setError("");
          }}
          rows={3}
          placeholder="처리 사유를 입력하세요."
          className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-starbucks-green focus:ring-2 focus:ring-starbucks-green/20"
        />

        <label className="mt-4 mb-1.5 block text-sm font-medium text-neutral-700">
          메일 제목 <span className="text-rose-500">*</span>
        </label>
        <input
          value={emailSubject}
          onChange={(e) => {
            setEmailSubject(e.target.value);
            if (error) setError("");
          }}
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-starbucks-green focus:ring-2 focus:ring-starbucks-green/20"
        />

        <label className="mt-4 mb-1.5 block text-sm font-medium text-neutral-700">
          메일 내용 <span className="text-rose-500">*</span>
        </label>
        <textarea
          value={emailBody}
          onChange={(e) => {
            setEmailBody(e.target.value);
            if (error) setError("");
          }}
          rows={6}
          placeholder="회원에게 발송할 메일 내용을 작성하세요."
          className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-starbucks-green focus:ring-2 focus:ring-starbucks-green/20"
        />

        {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium text-white",
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
