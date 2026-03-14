import type { ISocketClient } from '@/application/ports';

interface ConnectCall {
  url: string;
  token?: string;
}

interface EmitCall {
  event: string;
  data?: unknown;
}

export class FakeSocketClient implements ISocketClient {
  readonly connectCalls: ConnectCall[] = [];
  readonly emitCalls: EmitCall[] = [];
  private listeners: Map<string, ((data: unknown) => void)[]> = new Map();
  private errorHandler: ((error: Error) => void) | null = null;
  private _connected = false;

  connect(url: string, token?: string): void {
    this.connectCalls.push({ url, token });
    this._connected = true;
    // Auto-fire connect event
    this.fireEvent('connect', undefined);
  }

  disconnect(): void {
    this._connected = false;
  }

  emit(event: string, data?: unknown): void {
    this.emitCalls.push({ event, data });
  }

  on(event: string, callback: (data: unknown) => void): void {
    const listeners = this.listeners.get(event) ?? [];
    listeners.push(callback);
    this.listeners.set(event, listeners);
  }

  off(event: string, callback?: (data: unknown) => void): void {
    if (!callback) {
      this.listeners.delete(event);
      return;
    }
    const listeners = this.listeners.get(event) ?? [];
    this.listeners.set(
      event,
      listeners.filter((l) => l !== callback),
    );
  }

  onError(handler: (error: Error) => void): void {
    this.errorHandler = handler;
  }

  isConnected(): boolean {
    return this._connected;
  }

  // ── Test helpers ────────────────────────────────────────────

  fireEvent(event: string, data: unknown): void {
    const listeners = this.listeners.get(event) ?? [];
    for (const listener of listeners) {
      listener(data);
    }
  }

  fireError(error: Error): void {
    this.errorHandler?.(error);
  }

  lastConnectToken(): string | undefined {
    return this.connectCalls[this.connectCalls.length - 1]?.token;
  }
}
