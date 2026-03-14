import { io, type Socket } from 'socket.io-client';
import type { ISocketClient } from '@/application/ports';

export class SocketIOClient implements ISocketClient {
  private socket: Socket | null = null;
  private errorHandler: ((error: Error) => void) | null = null;

  connect(url: string, token?: string): void {
    if (this.socket?.connected) return;
    this.socket = io(url, {
      transports: ['websocket'],
      ...(token ? { auth: { token } } : {}),
    });

    this.socket.on('connect_error', (err) => {
      this.errorHandler?.(new Error(`Socket connection error: ${err.message}`));
    });

    this.socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect' || reason === 'transport close') {
        this.errorHandler?.(new Error(`Socket disconnected: ${reason}`));
      }
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  emit(event: string, data?: unknown): void {
    if (!this.socket?.connected) {
      this.errorHandler?.(
        new Error(`Cannot emit "${event}": socket not connected`),
      );
      return;
    }
    this.socket.emit(event, data);
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

  onError(handler: (error: Error) => void): void {
    this.errorHandler = handler;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}
