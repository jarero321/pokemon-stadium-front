import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock socket.io-client before importing SocketIOClient
const mockSocket = {
  connected: false,
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => {
    mockSocket.connected = true;
    return mockSocket;
  }),
}));

// Import after mock is set up
import { SocketIOClient } from '@/infrastructure/socket/SocketIOClient';
import { io } from 'socket.io-client';

describe('SocketIOClient — auth token', () => {
  let client: SocketIOClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket.connected = false;
    client = new SocketIOClient();
  });

  it('should pass auth token in socket options when token is provided', () => {
    client.connect('http://localhost:8080', 'my-jwt-token');

    expect(io).toHaveBeenCalledWith('http://localhost:8080', {
      transports: ['websocket'],
      auth: { token: 'my-jwt-token' },
    });
  });

  it('should NOT include auth when no token is provided', () => {
    client.connect('http://localhost:8080');

    expect(io).toHaveBeenCalledWith('http://localhost:8080', {
      transports: ['websocket'],
    });
  });

  it('should NOT include auth when token is undefined', () => {
    client.connect('http://localhost:8080', undefined);

    expect(io).toHaveBeenCalledWith('http://localhost:8080', {
      transports: ['websocket'],
    });
  });

  it('should not reconnect if already connected', () => {
    client.connect('http://localhost:8080', 'token-1');
    // Socket is now "connected" because mockSocket.connected = true

    client.connect('http://localhost:8080', 'token-2');

    // io should only be called once
    expect(io).toHaveBeenCalledTimes(1);
  });

  it('should register connect_error and disconnect listeners', () => {
    client.connect('http://localhost:8080', 'my-token');

    const registeredEvents = mockSocket.on.mock.calls.map(
      (call: unknown[]) => call[0] as string,
    );
    expect(registeredEvents).toContain('connect_error');
    expect(registeredEvents).toContain('disconnect');
  });
});
