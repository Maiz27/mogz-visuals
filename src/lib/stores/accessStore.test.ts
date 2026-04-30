import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAccessStore } from './accessStore';

describe('useAccessStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAccessStore.getState().reset();
    global.fetch = vi.fn();
  });

  it('stores the token and verifies access successfully', async () => {
    useAccessStore.getState().setToken('turnstile-token');

    (global.fetch as any).mockResolvedValue({
      json: async () => ({
        status: 200,
        message: 'Access granted',
        id: 'abc123',
        secret: 'encrypted-secret',
      }),
    });

    const response = await useAccessStore
      .getState()
      .verifyAccess({ id: 'abc123', password: 'secret123' });

    expect(response.status).toBe(200);
    expect(useAccessStore.getState().response?.message).toBe('Access granted');

    const body = JSON.parse((global.fetch as any).mock.calls[0][1].body);
    expect(body.token).toBe('turnstile-token');
  });

  it('returns a fallback response when verification fails', async () => {
    (global.fetch as any).mockRejectedValue(new Error('network'));

    const response = await useAccessStore
      .getState()
      .verifyAccess({ id: 'abc123', password: 'secret123' });

    expect(response.status).toBe(500);
    expect(useAccessStore.getState().loading).toBe(false);
    expect(useAccessStore.getState().response?.message).toBe(
      'Unable to verify access.',
    );
  });

  it('resets shared state', () => {
    useAccessStore.setState({
      loading: true,
      response: {
        status: 400,
        message: 'Invalid',
        id: 'bad',
        secret: '',
      },
      token: 'abc',
    });

    useAccessStore.getState().reset();

    expect(useAccessStore.getState().loading).toBe(false);
    expect(useAccessStore.getState().response).toBeNull();
    expect(useAccessStore.getState().token).toBe('');
  });
});
