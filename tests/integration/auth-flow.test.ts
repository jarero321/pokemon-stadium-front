import { describe, it, expect, beforeEach } from 'vitest';
import { useConnectionStore } from '@/application/stores';
import { FakeHttpClient, FakeSocketClient, FakeStorage } from '../fakes/index';
import type { RegisterResponseDTO } from '@/domain/dtos';
import type { ApiResponse } from '@/domain/dtos';

const STORAGE_KEYS = {
  NICKNAME: 'pokemon-stadium-nickname',
  TOKEN: 'pokemon-stadium-token',
};

describe('Auth Flow Integration', () => {
  let httpClient: FakeHttpClient;
  let socketClient: FakeSocketClient;
  let storage: FakeStorage;

  beforeEach(() => {
    useConnectionStore.getState().reset();
    httpClient = new FakeHttpClient();
    socketClient = new FakeSocketClient();
    storage = new FakeStorage();
  });

  // ── Registration → Token Flow ───────────────────────────────

  describe('Registration saves token', () => {
    it('should store token in storage and store after successful registration', async () => {
      // Simulate backend response
      const registerResponse: ApiResponse<RegisterResponseDTO> = {
        success: true,
        data: {
          player: {
            nickname: 'Ash',
            wins: 0,
            losses: 0,
            totalBattles: 0,
            winRate: 0,
          },
          isNewPlayer: true,
          token: 'jwt-token-for-ash',
        },
        error: null,
        traceId: 'trace-1',
        timestamp: new Date().toISOString(),
      };

      httpClient.stubResponse('/api/players/register', registerResponse);

      // Simulate what NicknameScreen does
      const res = await httpClient.post<RegisterResponseDTO>(
        '/api/players/register',
        { nickname: 'Ash' },
      );

      expect(res.success).toBe(true);
      expect(res.data!.token).toBe('jwt-token-for-ash');

      // Simulate handleJoinBattle
      const { token, player } = res.data!;
      storage.set(STORAGE_KEYS.NICKNAME, player.nickname);
      storage.set(STORAGE_KEYS.TOKEN, token);
      useConnectionStore.getState().setNickname(player.nickname);
      useConnectionStore.getState().setToken(token);
      httpClient.setToken(token);

      // Verify everything is saved
      expect(storage.get(STORAGE_KEYS.TOKEN)).toBe('jwt-token-for-ash');
      expect(storage.get(STORAGE_KEYS.NICKNAME)).toBe('Ash');
      expect(useConnectionStore.getState().token).toBe('jwt-token-for-ash');
      expect(useConnectionStore.getState().nickname).toBe('Ash');
      expect(httpClient.getToken()).toBe('jwt-token-for-ash');
    });
  });

  // ── Token Restoration ───────────────────────────────────────

  describe('Token restoration from storage', () => {
    it('should restore token from storage on app init (GameProvider logic)', () => {
      // Pre-populate storage (simulating a previous session)
      storage.set(STORAGE_KEYS.NICKNAME, 'Ash');
      storage.set(STORAGE_KEYS.TOKEN, 'saved-jwt-token');

      // Simulate GameProvider useEffect
      const savedNickname = storage.get(STORAGE_KEYS.NICKNAME);
      const savedToken = storage.get(STORAGE_KEYS.TOKEN);

      if (savedNickname) {
        useConnectionStore.getState().setNickname(savedNickname);
      }
      if (savedToken) {
        useConnectionStore.getState().setToken(savedToken);
        httpClient.setToken(savedToken);
      }

      // Verify state restored
      expect(useConnectionStore.getState().nickname).toBe('Ash');
      expect(useConnectionStore.getState().token).toBe('saved-jwt-token');
      expect(httpClient.getToken()).toBe('saved-jwt-token');
    });

    it('should not set token when storage is empty', () => {
      const savedToken = storage.get(STORAGE_KEYS.TOKEN);

      expect(savedToken).toBeNull();
      expect(useConnectionStore.getState().token).toBeNull();
    });
  });

  // ── Socket connects with token ──────────────────────────────

  describe('Socket connection uses token', () => {
    it('should pass token when connecting socket', () => {
      useConnectionStore.getState().setToken('jwt-token-123');

      const token = useConnectionStore.getState().token;
      socketClient.connect('http://localhost:8080', token ?? undefined);

      expect(socketClient.lastConnectToken()).toBe('jwt-token-123');
    });

    it('should not connect socket without token (useSocket behavior)', () => {
      const baseUrl = 'http://localhost:8080';
      const token = useConnectionStore.getState().token;

      // useSocket gate: if (!baseUrl || !token) return;
      if (!baseUrl || !token) {
        // Should not connect
        expect(socketClient.connectCalls).toHaveLength(0);
        return;
      }

      socketClient.connect(baseUrl, token);
    });

    it('should connect socket once token becomes available', () => {
      const baseUrl = 'http://localhost:8080';

      // Initially no token — no connection
      let token = useConnectionStore.getState().token;
      expect(token).toBeNull();
      expect(socketClient.connectCalls).toHaveLength(0);

      // Token arrives (after registration)
      useConnectionStore.getState().setToken('jwt-token-456');
      token = useConnectionStore.getState().token;

      // Now connect (simulating useSocket effect re-run)
      if (baseUrl && token) {
        socketClient.connect(baseUrl, token);
      }

      expect(socketClient.connectCalls).toHaveLength(1);
      expect(socketClient.lastConnectToken()).toBe('jwt-token-456');
    });
  });

  // ── HTTP requests use token ─────────────────────────────────

  describe('HTTP requests include token', () => {
    it('should send authenticated requests after token is set', async () => {
      httpClient.setToken('jwt-token-789');

      await httpClient.get('/api/leaderboard');

      expect(httpClient.calls).toHaveLength(1);
      expect(httpClient.calls[0].hadToken).toBe(true);
      expect(httpClient.calls[0].tokenValue).toBe('jwt-token-789');
    });

    it('should send unauthenticated register request', async () => {
      await httpClient.post('/api/players/register', { nickname: 'Ash' });

      expect(httpClient.calls).toHaveLength(1);
      expect(httpClient.calls[0].hadToken).toBe(false);
    });
  });

  // ── Full lifecycle ──────────────────────────────────────────

  describe('Full auth lifecycle', () => {
    it('should handle: register → save token → connect socket → make requests', async () => {
      // 1. Register (no token yet)
      const registerResponse: ApiResponse<RegisterResponseDTO> = {
        success: true,
        data: {
          player: {
            nickname: 'Ash',
            wins: 0,
            losses: 0,
            totalBattles: 0,
            winRate: 0,
          },
          isNewPlayer: true,
          token: 'fresh-jwt-token',
        },
        error: null,
        traceId: null,
        timestamp: '',
      };
      httpClient.stubResponse('/api/players/register', registerResponse);

      const res = await httpClient.post<RegisterResponseDTO>(
        '/api/players/register',
        { nickname: 'Ash' },
      );

      // First call: no token
      expect(httpClient.calls[0].hadToken).toBe(false);

      // 2. Save token everywhere
      const { token } = res.data!;
      storage.set(STORAGE_KEYS.TOKEN, token);
      storage.set(STORAGE_KEYS.NICKNAME, 'Ash');
      useConnectionStore.getState().setToken(token);
      useConnectionStore.getState().setNickname('Ash');
      httpClient.setToken(token);

      // 3. Connect socket with token
      socketClient.connect('http://localhost:8080', token);
      expect(socketClient.lastConnectToken()).toBe('fresh-jwt-token');

      // 4. Subsequent HTTP requests have token
      await httpClient.get('/api/leaderboard');
      expect(httpClient.calls[1].hadToken).toBe(true);
      expect(httpClient.calls[1].tokenValue).toBe('fresh-jwt-token');

      // 5. Verify persistence
      expect(storage.get(STORAGE_KEYS.TOKEN)).toBe('fresh-jwt-token');
      expect(storage.get(STORAGE_KEYS.NICKNAME)).toBe('Ash');
    });

    it('should handle: app restart → restore token → reconnect', () => {
      // Simulate previous session data
      storage.set(STORAGE_KEYS.TOKEN, 'persisted-jwt');
      storage.set(STORAGE_KEYS.NICKNAME, 'Ash');

      // Simulate GameProvider init
      const savedToken = storage.get(STORAGE_KEYS.TOKEN)!;
      const savedNickname = storage.get(STORAGE_KEYS.NICKNAME)!;

      useConnectionStore.getState().setToken(savedToken);
      useConnectionStore.getState().setNickname(savedNickname);
      httpClient.setToken(savedToken);

      // Simulate useSocket connecting
      const token = useConnectionStore.getState().token;
      socketClient.connect('http://localhost:8080', token ?? undefined);

      // Verify reconnection used persisted token
      expect(socketClient.lastConnectToken()).toBe('persisted-jwt');
      expect(httpClient.getToken()).toBe('persisted-jwt');
      expect(useConnectionStore.getState().nickname).toBe('Ash');
    });

    it('should handle: exit → clean all state → no stale token', () => {
      // Setup: player is in a session
      storage.set(STORAGE_KEYS.TOKEN, 'active-jwt');
      storage.set(STORAGE_KEYS.NICKNAME, 'Ash');
      useConnectionStore.getState().setToken('active-jwt');
      useConnectionStore.getState().setNickname('Ash');
      httpClient.setToken('active-jwt');

      // Simulate handleExit (ResultScreen)
      useConnectionStore.getState().reset();
      storage.remove(STORAGE_KEYS.NICKNAME);
      storage.remove(STORAGE_KEYS.TOKEN);
      httpClient.clearToken();

      // Verify everything is clean
      expect(useConnectionStore.getState().token).toBeNull();
      expect(useConnectionStore.getState().nickname).toBeNull();
      expect(storage.get(STORAGE_KEYS.TOKEN)).toBeNull();
      expect(storage.get(STORAGE_KEYS.NICKNAME)).toBeNull();
      expect(httpClient.getToken()).toBeNull();
    });

    it('should not have stale token in httpClient after exit', async () => {
      // Setup
      httpClient.setToken('old-jwt');

      // Exit
      httpClient.clearToken();

      // Subsequent requests should NOT have token
      await httpClient.get('/api/leaderboard');
      expect(httpClient.calls[0].hadToken).toBe(false);
    });

    it('should not connect socket after exit (no token in store)', () => {
      // Setup: active session
      useConnectionStore.getState().setToken('active-jwt');

      // Exit
      useConnectionStore.getState().reset();

      // useSocket gate: if (!baseUrl || !token) return
      const token = useConnectionStore.getState().token;
      expect(token).toBeNull();
      // Socket should NOT connect
      expect(socketClient.connectCalls).toHaveLength(0);
    });
  });
});
