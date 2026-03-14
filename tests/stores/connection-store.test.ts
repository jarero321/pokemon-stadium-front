import { describe, it, expect, beforeEach } from 'vitest';
import { useConnectionStore } from '@/application/stores';

describe('connectionStore — token management', () => {
  beforeEach(() => {
    useConnectionStore.getState().reset();
  });

  it('should start with null token', () => {
    expect(useConnectionStore.getState().token).toBeNull();
  });

  it('should store token via setToken', () => {
    useConnectionStore.getState().setToken('jwt-abc-123');

    expect(useConnectionStore.getState().token).toBe('jwt-abc-123');
  });

  it('should clear token via clearToken', () => {
    useConnectionStore.getState().setToken('jwt-abc-123');
    useConnectionStore.getState().clearToken();

    expect(useConnectionStore.getState().token).toBeNull();
  });

  it('should reset token when calling reset', () => {
    useConnectionStore.getState().setToken('jwt-abc-123');
    useConnectionStore.getState().setNickname('Ash');
    useConnectionStore.getState().reset();

    expect(useConnectionStore.getState().token).toBeNull();
    expect(useConnectionStore.getState().nickname).toBeNull();
  });

  it('should keep token independent of nickname', () => {
    useConnectionStore.getState().setToken('jwt-abc-123');
    useConnectionStore.getState().setNickname('Ash');

    expect(useConnectionStore.getState().token).toBe('jwt-abc-123');
    expect(useConnectionStore.getState().nickname).toBe('Ash');
  });

  it('should keep token when status changes', () => {
    useConnectionStore.getState().setToken('jwt-abc-123');
    useConnectionStore.getState().setStatus('connected');

    expect(useConnectionStore.getState().token).toBe('jwt-abc-123');
    expect(useConnectionStore.getState().status).toBe('connected');
  });

  it('should overwrite token when setToken called again', () => {
    useConnectionStore.getState().setToken('old-token');
    useConnectionStore.getState().setToken('new-token');

    expect(useConnectionStore.getState().token).toBe('new-token');
  });
});
