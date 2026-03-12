export interface ISocketClient {
  connect(url: string): void;
  disconnect(): void;
  emit(event: string, data?: unknown): void;
  on(event: string, callback: (data: unknown) => void): void;
  off(event: string, callback?: (data: unknown) => void): void;
  isConnected(): boolean;
}
