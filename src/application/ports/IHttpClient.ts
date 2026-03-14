import type { ApiResponse } from '@/domain/dtos';

export interface IHttpClient {
  post<T>(path: string, body: unknown): Promise<ApiResponse<T>>;
  get<T>(path: string): Promise<ApiResponse<T>>;
  setToken(token: string): void;
  clearToken(): void;
}
