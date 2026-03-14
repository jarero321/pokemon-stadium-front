import type { IHttpClient } from '@/application/ports';
import type { ApiResponse } from '@/domain/dtos';

interface RecordedCall {
  method: 'post' | 'get';
  path: string;
  body?: unknown;
  hadToken: boolean;
  tokenValue: string | null;
}

export class FakeHttpClient implements IHttpClient {
  private token: string | null = null;
  readonly calls: RecordedCall[] = [];
  private responses: Map<string, ApiResponse<unknown>> = new Map();

  setToken(token: string): void {
    this.token = token;
  }

  clearToken(): void {
    this.token = null;
  }

  getToken(): string | null {
    return this.token;
  }

  stubResponse<T>(path: string, response: ApiResponse<T>): void {
    this.responses.set(path, response as ApiResponse<unknown>);
  }

  async post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    this.calls.push({
      method: 'post',
      path,
      body,
      hadToken: this.token !== null,
      tokenValue: this.token,
    });
    const stubbed = this.responses.get(path);
    if (stubbed) return stubbed as ApiResponse<T>;
    return {
      success: true,
      data: null as T,
      error: null,
      traceId: null,
      timestamp: '',
    };
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    this.calls.push({
      method: 'get',
      path,
      hadToken: this.token !== null,
      tokenValue: this.token,
    });
    const stubbed = this.responses.get(path);
    if (stubbed) return stubbed as ApiResponse<T>;
    return {
      success: true,
      data: null as T,
      error: null,
      traceId: null,
      timestamp: '',
    };
  }
}
