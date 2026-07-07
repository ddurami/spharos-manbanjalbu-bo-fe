import type { SpringPage } from "@/types/product-api";

export type MemberStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "WITHDRAWN";
export type MemberGrade = "WELCOME" | "GREEN" | "GOLD";

export type MemberSummaryResponse = {
  totalCount: number;
  newMembersToday: number;
  newMembersThisMonth: number;
  activeCount: number;
  suspendedCount: number;
  withdrawnCount: number;
};

export type MemberListItem = {
  memberId: number;
  name: string;
  loginId: string;
  grade: MemberGrade;
  status: MemberStatus;
  email: string;
  phone: string;
  totalPurchaseAmount: number;
  createdAt: string;
};

export type MemberAddressItem = {
  addressId: number;
  addressName: string | null;
  recipientName: string;
  zipcode: string;
  baseAddress: string;
  detailAddress: string;
  phone1: string;
  isDefault: boolean;
};

export type MemberOrderItem = {
  orderId: number;
  orderNo: string;
  orderName: string;
  orderStatus: string;
  orderAmount: number;
  orderAt: string;
};

export type MemberMemoItem = {
  memoId: number;
  adminName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type MemberDetailResponse = {
  memberId: number;
  loginId: string;
  name: string;
  nickname: string | null;
  grade: MemberGrade;
  status: MemberStatus;
  email: string;
  phone: string;
  birthDate: string;
  marketingEmailAgreed: boolean;
  marketingSmsAgreed: boolean;
  totalPurchaseAmount: number;
  createdAt: string;
  lastLoginAt: string | null;
  addresses: MemberAddressItem[];
  recentOrders: MemberOrderItem[];
  memos: MemberMemoItem[];
};

export type MemberSearchParams = {
  keyword?: string;
  name?: string;
  grade?: MemberGrade;
  status?: MemberStatus;
  registeredFrom?: string;
  registeredTo?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  size?: number;
  sort?: string;
};

export type MemberActionRequest = {
  reason: string;
  emailSubject: string;
  emailBody: string;
};

export type MemberMemoRequest = {
  content: string;
};

export type { SpringPage };
