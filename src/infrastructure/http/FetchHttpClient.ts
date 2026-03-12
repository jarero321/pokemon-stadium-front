import type { IHttpClient } from '@/application/ports';
import type { ApiResponse } from '@/domain/dtos';

export class FetchHttpClient implements IHttpClient {
  constructor(private baseUrl: string) {}

  async post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${path}`);
    return res.json();
  }
}
