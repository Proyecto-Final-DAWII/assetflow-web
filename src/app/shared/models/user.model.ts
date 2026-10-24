export const USER_ROLES = ['ADMIN', 'SUPPORT', 'EMPLOYEE'] as const;
export type UserRole = (typeof USER_ROLES)[number];
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface UserSummary {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly area: string;
  readonly avatar?: string;
}

export interface User extends UserSummary {
  readonly role: UserRole;
  readonly status: UserStatus;
  readonly position: string;
  readonly phone?: string;
  readonly assignedAssets: number;
  readonly lastAccessAt?: string;
  readonly createdAt: string;
}

export interface AuthSession {
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly expiresAt?: string;
  readonly user: User;
}

export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

export interface UserCreateRequest {
  readonly fullName: string;
  readonly email: string;
  readonly role: UserRole;
  readonly area: string;
  readonly position: string;
  readonly phone?: string;
}
