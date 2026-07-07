"use client";

import { MemberListSection } from "@/components/members/member-list-section";

export function MemberSearchView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">회원 검색</h1>
        <p className="mt-1 text-sm text-neutral-500">
          이름, 등급, 가입일, 누적 금액, 상태 등으로 회원을 검색하세요.
        </p>
      </div>

      <MemberListSection />
    </div>
  );
}
