"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Ban, RefreshCw, UserX } from "lucide-react";

import { MemberActionDialog } from "@/components/members/member-action-dialog";
import {
  GradeBadge,
  StatusBadge,
  formatDate,
  formatDateTime,
  formatWon,
} from "@/components/members/member-ui";
import { ApiError } from "@/lib/api/client";
import {
  addMemberMemo,
  getMemberDetail,
  suspendMember,
  withdrawMember,
} from "@/lib/api/members";
import type { MemberDetailResponse } from "@/types/member-api";

type MemberDetailViewProps = {
  memberId: number;
};

type ActionType = "suspend" | "withdraw" | null;

export function MemberDetailView({ memberId }: MemberDetailViewProps) {
  const [member, setMember] = useState<MemberDetailResponse | null>(null);
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [memoLoading, setMemoLoading] = useState(false);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMemberDetail(memberId);
      setMember(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "회원 정보를 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleAddMemo = async () => {
    if (memo.trim().length < 2) return;
    setMemoLoading(true);
    try {
      await addMemberMemo(memberId, { content: memo.trim() });
      setMemo("");
      await loadDetail();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "메모 저장에 실패했습니다.",
      );
    } finally {
      setMemoLoading(false);
    }
  };

  const handleAction = async (payload: {
    reason: string;
    emailSubject: string;
    emailBody: string;
  }) => {
    if (!actionType) return;
    setActionLoading(true);
    try {
      if (actionType === "suspend") {
        await suspendMember(memberId, payload);
      } else {
        await withdrawMember(memberId, payload);
      }
      setActionType(null);
      await loadDetail();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "처리 중 오류가 발생했습니다.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-neutral-100 bg-white p-16 text-sm text-neutral-400">
        불러오는 중...
      </div>
    );
  }

  if (error && !member) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-neutral-100 bg-white p-16 text-center">
        <p className="text-sm text-neutral-600">{error}</p>
        <button
          type="button"
          onClick={loadDetail}
          className="inline-flex items-center gap-2 rounded-lg bg-starbucks-green px-4 py-2 text-sm font-medium text-white"
        >
          <RefreshCw className="size-4" />
          다시 시도
        </button>
      </div>
    );
  }

  if (!member) return null;

  const canSuspend =
    member.status === "ACTIVE" || member.status === "INACTIVE";
  const canWithdraw = member.status !== "WITHDRAWN";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/members"
            className="mb-2 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700"
          >
            <ArrowLeft className="size-4" />
            회원 관리
          </Link>
          <h1 className="text-xl font-bold text-neutral-900">{member.name}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {member.loginId} · {member.email}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canSuspend && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => setActionType("suspend")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50"
            >
              <Ban className="size-4" />
              일시 정지
            </button>
          )}
          {canWithdraw && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => setActionType("withdraw")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
            >
              <UserX className="size-4" />
              계정 탈퇴
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-2 text-sm text-rose-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-neutral-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-neutral-900">
            기본 정보
          </h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-neutral-500">이름</dt>
              <dd className="mt-1 font-medium text-neutral-900">{member.name}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">등급</dt>
              <dd className="mt-1">
                <GradeBadge grade={member.grade} />
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">상태</dt>
              <dd className="mt-1">
                <StatusBadge status={member.status} />
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">누적 구매 금액</dt>
              <dd className="mt-1 font-medium text-neutral-900">
                {formatWon(member.totalPurchaseAmount)}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">이메일</dt>
              <dd className="mt-1 text-neutral-800">{member.email}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">전화번호</dt>
              <dd className="mt-1 text-neutral-800">{member.phone}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">가입일</dt>
              <dd className="mt-1 text-neutral-800">
                {formatDate(member.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">생년월일</dt>
              <dd className="mt-1 text-neutral-800">
                {formatDate(member.birthDate)}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">최근 로그인</dt>
              <dd className="mt-1 text-neutral-800">
                {formatDateTime(member.lastLoginAt)}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-neutral-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-neutral-900">
            마케팅 동의
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-500">이메일 수신 동의</dt>
              <dd className="font-medium text-neutral-800">
                {member.marketingEmailAgreed ? "동의" : "미동의"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">SMS 수신 동의</dt>
              <dd className="font-medium text-neutral-800">
                {member.marketingSmsAgreed ? "동의" : "미동의"}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="rounded-xl border border-neutral-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-neutral-900">
          배송지 주소
        </h2>
        {member.addresses.length === 0 ? (
          <p className="text-sm text-neutral-400">등록된 배송지가 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {member.addresses.map((address) => (
              <li
                key={address.addressId}
                className="rounded-lg border border-neutral-100 bg-neutral-50 p-4 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-900">
                    {address.addressName ?? "배송지"}
                  </span>
                  {address.isDefault && (
                    <span className="rounded bg-starbucks-green/10 px-2 py-0.5 text-xs text-starbucks-green">
                      기본
                    </span>
                  )}
                </div>
                <p className="mt-2 text-neutral-700">
                  [{address.zipcode}] {address.baseAddress}{" "}
                  {address.detailAddress}
                </p>
                <p className="mt-1 text-neutral-500">
                  {address.recipientName} · {address.phone1}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-neutral-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-neutral-900">
          최근 주문 내역
        </h2>
        {member.recentOrders.length === 0 ? (
          <p className="text-sm text-neutral-400">주문 내역이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[640px] w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-left text-neutral-500">
                  <th className="pb-2 font-medium">주문번호</th>
                  <th className="pb-2 font-medium">상품</th>
                  <th className="pb-2 font-medium">상태</th>
                  <th className="pb-2 font-medium">금액</th>
                  <th className="pb-2 font-medium">주문일</th>
                </tr>
              </thead>
              <tbody>
                {member.recentOrders.map((order) => (
                  <tr key={order.orderId} className="border-b border-neutral-50">
                    <td className="py-3 text-neutral-700">{order.orderNo}</td>
                    <td className="py-3 text-neutral-900">{order.orderName}</td>
                    <td className="py-3 text-neutral-600">{order.orderStatus}</td>
                    <td className="py-3 text-neutral-800">
                      {formatWon(order.orderAmount)}
                    </td>
                    <td className="py-3 text-neutral-600">
                      {formatDateTime(order.orderAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-neutral-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-neutral-900">
          관리자 메모
        </h2>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            placeholder="관리자 메모를 입력하세요."
            className="flex-1 resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-starbucks-green focus:ring-2 focus:ring-starbucks-green/20"
          />
          <button
            type="button"
            disabled={memoLoading || memo.trim().length < 2}
            onClick={handleAddMemo}
            className="h-fit rounded-lg bg-starbucks-green px-4 py-2 text-sm font-medium text-white hover:bg-starbucks-green-dark disabled:opacity-50"
          >
            {memoLoading ? "저장 중..." : "메모 저장"}
          </button>
        </div>
        {member.memos.length === 0 ? (
          <p className="text-sm text-neutral-400">등록된 메모가 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {member.memos.map((item) => (
              <li
                key={item.memoId}
                className="rounded-lg border border-neutral-100 bg-neutral-50 p-4 text-sm"
              >
                <p className="text-neutral-800">{item.content}</p>
                <p className="mt-2 text-xs text-neutral-500">
                  {item.adminName} · {formatDateTime(item.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <MemberActionDialog
        open={actionType === "suspend"}
        title="회원 일시 정지"
        description="정지 사유와 회원에게 발송할 메일을 작성하세요."
        confirmLabel={actionLoading ? "처리 중..." : "정지 및 메일 발송"}
        tone="warning"
        defaultEmailSubject={`[스타벅스] ${member.name}님, 계정 이용이 일시 정지되었습니다.`}
        defaultEmailBody={`${member.name}님, 안녕하세요.\n\n관리자 검토 결과 귀하의 계정이 일시 정지 처리되었습니다.\n\n문의사항이 있으시면 고객센터로 연락해 주세요.\n\n감사합니다.`}
        onConfirm={handleAction}
        onClose={() => setActionType(null)}
      />

      <MemberActionDialog
        open={actionType === "withdraw"}
        title="회원 계정 탈퇴"
        description="탈퇴 사유와 회원에게 발송할 메일을 작성하세요."
        confirmLabel={actionLoading ? "처리 중..." : "탈퇴 및 메일 발송"}
        tone="danger"
        defaultEmailSubject={`[스타벅스] ${member.name}님, 계정 탈퇴가 완료되었습니다.`}
        defaultEmailBody={`${member.name}님, 안녕하세요.\n\n요청하신 계정 탈퇴 처리가 완료되었습니다.\n\n그동안 스타벅스를 이용해 주셔서 감사합니다.`}
        onConfirm={handleAction}
        onClose={() => setActionType(null)}
      />
    </div>
  );
}
