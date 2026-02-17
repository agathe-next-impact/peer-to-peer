import { strapiApi } from './strapi';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
} from '@pairemancipation/shared-types';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  return strapiApi<AuthResponse>('/auth/local', {
    method: 'POST',
    body: credentials,
  });
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  return strapiApi<AuthResponse>('/auth/local/register', {
    method: 'POST',
    body: data,
  });
}

export async function forgotPassword(data: ForgotPasswordData): Promise<{ ok: boolean }> {
  return strapiApi('/auth/forgot-password', {
    method: 'POST',
    body: data,
  });
}

export async function resetPassword(data: ResetPasswordData): Promise<AuthResponse> {
  return strapiApi<AuthResponse>('/auth/reset-password', {
    method: 'POST',
    body: data,
  });
}

export async function getMe(token: string): Promise<AuthResponse['user']> {
  return strapiApi('/users/me', { token });
}

const TOKEN_KEY = 'pe_jwt';

export function persistToken(token: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

export function getPersistedToken(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export function clearPersistedToken(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}
