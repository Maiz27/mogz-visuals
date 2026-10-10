import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { inspect } from 'node:util';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { enforceRateLimitRules } from '@/lib/server/rateLimit';

vi.mock('@/lib/server/rateLimit', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/lib/server/rateLimit')>();
  return { ...actual, enforceRateLimitRules: vi.fn(actual.enforceRateLimitRules) };
});

// Hoisted: the route constructs `new Resend(...)` at import time.
const { contactsCreate } = vi.hoisted(() => ({ contactsCreate: vi.fn() }));

vi.mock('resend', () => ({
  Resend: class {
    contacts = { create: contactsCreate };
  },
}));

const createRequest = (body: unknown, raw?: string) =>
  new NextRequest('http://localhost/api/contact/audience', {
    method: 'POST',
    body: raw ?? JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });

const PROVIDER_FAILURE_MESSAGE =
  'Unable to save your email preference right now.';

/**
 * Every string a fixture plants that must never be written to a log. Real
 * Resend errors embed the audience ID and API key in `message`, and a thrown
 * error's stack can carry request data.
 */
const SECRETS = [
  're_live_supersecretkey',
  'aud_9f3c1b7e-secret-audience',
  'subscriber@example.com',
  'Bearer re_live_supersecretkey',
  'api.resend.com',
];

const secretLadenProviderError = () => ({
  statusCode: 422,
  name: 'validation_error',
  message:
    'Audience aud_9f3c1b7e-secret-audience not found for API key re_live_supersecretkey while adding subscriber@example.com',
  request: {
    url: 'https://api.resend.com/audiences/aud_9f3c1b7e-secret-audience/contacts',
    headers: { authorization: 'Bearer re_live_supersecretkey' },
    body: { email: 'subscriber@example.com' },
  },
});

const secretLadenThrownError = () => {
  const error: Error & { code?: string; config?: unknown } = new Error(
    'connect ETIMEDOUT api.resend.com:443 (key re_live_supersecretkey, audience aud_9f3c1b7e-secret-audience, contact subscriber@example.com)',
  );
  error.code = 'ETIMEDOUT';
  error.config = {
    headers: { authorization: 'Bearer re_live_supersecretkey' },
    data: { email: 'subscriber@example.com' },
  };
  return error;
};

describe('POST /api/contact/audience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    contactsCreate.mockResolvedValue({ data: { id: 'contact-1' }, error: null });
  });

  it('subscribes an address that carries explicit consent', async () => {
    const res = await POST(
      createRequest({ email: 'john@example.com', consent: true }),
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ success: true });
    expect(contactsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'john@example.com' }),
    );
  });

  it('limits how many addresses one caller can add', async () => {
    vi.mocked(enforceRateLimitRules).mockResolvedValueOnce({
      ok: false,
      message: 'Too many requests. Please try again later.',
      retryAfterSeconds: 60,
    });
    const res = await POST(
      createRequest({ email: 'someone@example.com', consent: true }),
    );
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBe('60');
    expect(contactsCreate).not.toHaveBeenCalled();
    const [rule] = vi.mocked(enforceRateLimitRules).mock.calls[0][0];
    expect(rule.keyParts.slice(0, 2)).toEqual(['audience', 'ip']);
  });

  it('refuses to subscribe without explicit consent', async () => {
    for (const body of [
      { email: 'john@example.com' },
      { email: 'john@example.com', consent: false },
      { email: 'john@example.com', consent: 'true' },
      { email: 'john@example.com', consent: 1 },
    ]) {
      const res = await POST(createRequest(body));

      expect(res.status).toBe(400);
      expect(contactsCreate).not.toHaveBeenCalled();
    }
  });

  it('rejects a malformed email before calling the provider', async () => {
    for (const email of ['', 'not-an-email', 'a@b', 42, null]) {
      const res = await POST(createRequest({ email, consent: true }));

      expect(res.status).toBe(400);
      expect(contactsCreate).not.toHaveBeenCalled();
    }
  });

  it('rejects an unparseable body', async () => {
    const res = await POST(createRequest(null, '{not json'));

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ message: 'Invalid JSON body' });
  });

  it('returns 502 when the provider resolves with an error', async () => {
    contactsCreate.mockResolvedValue({
      data: null,
      error: {
        statusCode: 422,
        name: 'validation_error',
        message: 'Audience abc-123 not found for API key re_live_secret',
      },
    });

    const res = await POST(
      createRequest({ email: 'john@example.com', consent: true }),
    );

    expect(res.status).toBe(502);

    const body = await res.json();
    expect(body).toEqual({ message: PROVIDER_FAILURE_MESSAGE });

    // No provider internals may reach the caller.
    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain('re_live_secret');
    expect(serialized).not.toContain('abc-123');
    expect(serialized).not.toContain('validation_error');
    expect(body).not.toHaveProperty('error');
  });

  it('returns 502 when the provider request throws', async () => {
    contactsCreate.mockRejectedValue(
      new Error('connect ETIMEDOUT api.resend.com:443'),
    );

    const res = await POST(
      createRequest({ email: 'john@example.com', consent: true }),
    );

    expect(res.status).toBe(502);

    const body = await res.json();
    expect(body).toEqual({ message: PROVIDER_FAILURE_MESSAGE });
    expect(JSON.stringify(body)).not.toContain('ETIMEDOUT');
  });

  describe('logging', () => {
    let consoleSpies: Array<ReturnType<typeof vi.spyOn>>;

    beforeEach(() => {
      consoleSpies = (['error', 'warn', 'log', 'info', 'debug'] as const).map(
        (level) => vi.spyOn(console, level).mockImplementation(() => {}),
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    /** Renders every console argument the way Node would write it out. */
    const loggedOutput = () =>
      consoleSpies
        .flatMap((spy) => spy.mock.calls)
        .flat()
        .map((arg) =>
          typeof arg === 'string'
            ? arg
            : inspect(arg, { depth: null, showHidden: true }),
        )
        .join('\n');

    it('never logs secrets from a resolved provider error', async () => {
      contactsCreate.mockResolvedValue({
        data: null,
        error: secretLadenProviderError(),
      });

      const res = await POST(
        createRequest({ email: 'subscriber@example.com', consent: true }),
      );
      expect(res.status).toBe(502);

      const output = loggedOutput();
      expect(output).not.toBe('');
      for (const secret of SECRETS) {
        expect(output).not.toContain(secret);
      }
    });

    it('never logs secrets or a stack from a thrown provider error', async () => {
      contactsCreate.mockRejectedValue(secretLadenThrownError());

      const res = await POST(
        createRequest({ email: 'subscriber@example.com', consent: true }),
      );
      expect(res.status).toBe(502);

      const output = loggedOutput();
      for (const secret of SECRETS) {
        expect(output).not.toContain(secret);
      }

      // A stack trace would drag in file paths and, via `config`, request data.
      expect(output).not.toContain('at ');
      expect(output).not.toContain('authorization');
    });

    it('logs a stable message with allow-listed context only', async () => {
      contactsCreate.mockResolvedValue({
        data: null,
        error: secretLadenProviderError(),
      });

      await POST(
        createRequest({ email: 'subscriber@example.com', consent: true }),
      );

      const [message, context] = consoleSpies[0].mock.calls[0];
      expect(message).toBe('[Audience] Resend rejected the contact');
      expect(context).toEqual({
        kind: 'provider_error',
        name: 'validation_error',
        code: null,
        statusCode: 422,
      });
    });

    it('drops an identifier that does not look like a safe label', async () => {
      contactsCreate.mockRejectedValue(
        Object.assign(new Error('boom'), {
          name: 'key re_live_supersecretkey leaked via name',
          code: 'ETIMEDOUT',
        }),
      );

      await POST(
        createRequest({ email: 'subscriber@example.com', consent: true }),
      );

      const [, context] = consoleSpies[0].mock.calls[0];
      expect(context).toEqual({
        kind: 'thrown',
        name: 'unknown',
        code: 'ETIMEDOUT',
        statusCode: null,
      });
      expect(loggedOutput()).not.toContain('re_live_supersecretkey');
    });
  });

  it('uses the same public shape for both provider failure modes', async () => {
    contactsCreate.mockResolvedValue({ data: null, error: { message: 'a' } });
    const resolved = await POST(
      createRequest({ email: 'john@example.com', consent: true }),
    );

    contactsCreate.mockRejectedValue(new Error('b'));
    const thrown = await POST(
      createRequest({ email: 'john@example.com', consent: true }),
    );

    expect(resolved.status).toBe(thrown.status);
    await expect(resolved.json()).resolves.toEqual(await thrown.json());
  });
});
