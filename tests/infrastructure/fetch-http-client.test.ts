import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FetchHttpClient } from '@/infrastructure/http/FetchHttpClient';

const BASE_URL = 'http://localhost:8080';

describe('FetchHttpClient — Authorization header', () => {
  let client: FetchHttpClient;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: null, error: null }),
    });
    vi.stubGlobal('fetch', mockFetch);
    client = new FetchHttpClient(BASE_URL);
  });

  // ── POST ────────────────────────────────────────────────────

  describe('post()', () => {
    it('should NOT include Authorization header when no token is set', async () => {
      await client.post('/api/test', { foo: 'bar' });

      const [, init] = mockFetch.mock.calls[0];
      expect(init.headers).not.toHaveProperty('Authorization');
      expect(init.headers['Content-Type']).toBe('application/json');
    });

    it('should include Bearer token in Authorization header after setToken', async () => {
      client.setToken('my-jwt-token');

      await client.post('/api/test', { foo: 'bar' });

      const [, init] = mockFetch.mock.calls[0];
      expect(init.headers['Authorization']).toBe('Bearer my-jwt-token');
    });

    it('should send to correct URL', async () => {
      await client.post('/api/players/register', { nickname: 'Ash' });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toBe(`${BASE_URL}/api/players/register`);
    });

    it('should serialize body as JSON', async () => {
      await client.post('/api/players/register', { nickname: 'Ash' });

      const [, init] = mockFetch.mock.calls[0];
      expect(init.body).toBe(JSON.stringify({ nickname: 'Ash' }));
    });
  });

  // ── GET ─────────────────────────────────────────────────────

  describe('get()', () => {
    it('should NOT include Authorization header when no token is set', async () => {
      await client.get('/api/leaderboard');

      const [, init] = mockFetch.mock.calls[0];
      expect(init.headers).not.toHaveProperty('Authorization');
    });

    it('should include Bearer token in Authorization header after setToken', async () => {
      client.setToken('my-jwt-token');

      await client.get('/api/leaderboard');

      const [, init] = mockFetch.mock.calls[0];
      expect(init.headers['Authorization']).toBe('Bearer my-jwt-token');
    });
  });

  // ── Token lifecycle ─────────────────────────────────────────

  describe('token lifecycle', () => {
    it('should stop sending Authorization after clearToken', async () => {
      client.setToken('my-jwt-token');
      await client.post('/api/test', {});

      client.clearToken();
      await client.post('/api/test', {});

      const [, firstInit] = mockFetch.mock.calls[0];
      const [, secondInit] = mockFetch.mock.calls[1];

      expect(firstInit.headers['Authorization']).toBe('Bearer my-jwt-token');
      expect(secondInit.headers).not.toHaveProperty('Authorization');
    });

    it('should update Authorization when token changes', async () => {
      client.setToken('token-v1');
      await client.get('/api/test');

      client.setToken('token-v2');
      await client.get('/api/test');

      const [, first] = mockFetch.mock.calls[0];
      const [, second] = mockFetch.mock.calls[1];

      expect(first.headers['Authorization']).toBe('Bearer token-v1');
      expect(second.headers['Authorization']).toBe('Bearer token-v2');
    });
  });
});
