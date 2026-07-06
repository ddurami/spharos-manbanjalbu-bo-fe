export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string | null;
};

export type AdminLoginRequest = {
  loginId: string;
  password: string;
};

export type AdminLoginResponse = {
  accessToken: string | null;
  memberId: number;
  loginId: string;
  name: string;
  roleName: string;
  canManageProduct: boolean;
  canManageMember: boolean;
  canManageOrder: boolean;
  canManageSystem: boolean;
};

export type StoredAdmin = Pick<
  AdminLoginResponse,
  | "memberId"
  | "loginId"
  | "name"
  | "roleName"
  | "canManageProduct"
  | "canManageMember"
  | "canManageOrder"
  | "canManageSystem"
>;
