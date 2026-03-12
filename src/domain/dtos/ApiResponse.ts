export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
  traceId: string | null;
  timestamp: string;
}
