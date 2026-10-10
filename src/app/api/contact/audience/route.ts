import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);
const audienceId = process.env.RESEND_AUDIENCE_ID!;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * One public failure shape for every provider problem — a resolved Resend
 * error and a thrown network error look identical from outside, so provider
 * internals never reach the browser.
 */
const PROVIDER_FAILURE = {
  message: 'Unable to save your email preference right now.',
} as const;

/**
 * Provider errors carry unredacted secrets: Resend puts the audience ID and
 * the API key straight into `message`, and a thrown error's stack can hold
 * request data. Nothing from the error is logged except an allow-listed
 * identifier and status, so no fixture secret can reach stdout or stderr.
 */
const SAFE_LABEL = /^[A-Za-z0-9_.-]{1,64}$/;

type SafeErrorContext = {
  kind: 'provider_error' | 'thrown' | 'unknown';
  name: string;
  code: string | null;
  statusCode: number | null;
};

const toSafeErrorContext = (
  error: unknown,
  kind: SafeErrorContext['kind'],
): SafeErrorContext => {
  const safeLabel = (value: unknown) =>
    typeof value === 'string' && SAFE_LABEL.test(value) ? value : null;

  if (!error || typeof error !== 'object') {
    return { kind: 'unknown', name: 'unknown', code: null, statusCode: null };
  }

  const { name, code, statusCode } = error as Record<string, unknown>;

  return {
    kind,
    name: safeLabel(name) ?? 'unknown',
    code: safeLabel(code),
    statusCode:
      typeof statusCode === 'number' && Number.isFinite(statusCode)
        ? statusCode
        : null,
  };
};

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { message: 'Invalid JSON body' },
        { status: 400 },
      );
    }
    const { email, consent } = body ?? {};

    // Downloads never require a subscription: this endpoint only accepts a
    // request that carries the caller's explicit marketing opt-in.
    if (consent !== true) {
      return NextResponse.json(
        { message: 'Explicit marketing consent is required' },
        { status: 400 },
      );
    }

    if (typeof email !== 'string' || !EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { message: 'A valid email address is required' },
        { status: 400 },
      );
    }

    try {
      const { error } = await resend.contacts.create({
        email,
        unsubscribed: false,
        audienceId,
      });

      if (error) {
        console.error(
          '[Audience] Resend rejected the contact',
          toSafeErrorContext(error, 'provider_error'),
        );
        return NextResponse.json(PROVIDER_FAILURE, { status: 502 });
      }
    } catch (error) {
      // A thrown error (network failure, misconfigured key, SDK bug) must not
      // escape as a 200 — the caller decides what to do with a real failure.
      console.error(
        '[Audience] Resend request failed',
        toSafeErrorContext(error, 'thrown'),
      );
      return NextResponse.json(PROVIDER_FAILURE, { status: 502 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(
      '[Audience] Unexpected error',
      toSafeErrorContext(error, 'thrown'),
    );
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
