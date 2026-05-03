import type { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: Role[];
}

export interface AuthenticatedRequestUser {
  userId: string;
  email: string;
  roles: Role[];
}

export interface AuthResponseUser {
  id: string;
  email: string;
  username: string;
  balance: string;
  roles: Role[];
}

export interface AuthResponse {
  user: AuthResponseUser;
  accessToken: string;
  refreshToken: string;
}
