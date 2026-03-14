export interface ISocketClient {
  connect(url: string, token?: string): void;
  disconnect(): void;
  emit(event: string, data?: unknown): void;
  on(event: string, callback: (data: unknown) => void): void;
  off(event: string, callback?: (data: unknown) => void): void;
  onError(handler: (error: Error) => void): void;
  isConnected(): boolean;
}
