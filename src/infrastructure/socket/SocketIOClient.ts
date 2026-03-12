import { io, type Socket } from 'socket.io-client';
import type { ISocketClient } from '@/application/ports';

export class SocketIOClient implements ISocketClient {
  private socket: Socket | null = null;

  connect(url: string): void {
    if (this.socket?.connected) return;
    this.socket = io(url, { transports: ['websocket'] });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  emit(event: string, data?: unknown): void {
    this.socket?.emit(event, data);
  }

  on(event: string, callback: (data: unknown) => void): void {
    this.socket?.on(event, callback as (...args: unknown[]) => void);
  }

  off(event: string, callback?: (data: unknown) => void): void {
    if (callback) {
      this.socket?.off(event, callback as (...args: unknown[]) => void);
    } else {
      this.socket?.off(event);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}
