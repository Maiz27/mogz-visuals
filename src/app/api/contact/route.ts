import { NextRequest, NextResponse } from 'next/server';
import { Contact, getContactEmailText } from '@/components/email/Templates';
import { Resend } from 'resend';
import {
  enforceRateLimitRules,
  getClientIp,
  hashRateLimitValue,
  normalizeRateLimitEmail,
  parseRateLimitNumber,
} from '@/lib/server/rateLimit';
import {
  createRateLimitedResponse,
  isJsonObject,
  verifyTurnstileToken,
} from '@/lib/server/request';

const resend = new Resend(process.env.RESEND_API_KEY!);
const EMAIL = process.env.EMAIL!;
const CONTACT_IP_LIMIT = parseRateLimitNumber(
  process.env.CONTACT_RATE_LIMIT,
  10,
);
const CONTACT_IP_WINDOW_MS = parseRateLimitNumber(
  process.env.CONTACT_RATE_LIMIT_WINDOW,
  60 * 60 * 1000,
);
const CONTACT_IDENTITY_LIMIT = parseRateLimitNumber(
  process.env.CONTACT_IDENTITY_RATE_LIMIT,
  3,
);
const CONTACT_IDENTITY_WINDOW_MS = parseRateLimitNumber(
  process.env.CONTACT_IDENTITY_RATE_LIMIT_WINDOW,
  24 * 60 * 60 * 1000,
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!isJsonObject(body)) {
      return NextResponse.json(
        { message: 'Invalid contact payload.' },
        { status: 400 },
      );
    }

    const { name, email, message, token } = body as {
      name?: string;
      email?: string;
      message?: string;
      token?: string;
    };
    const contactData = {
      name: typeof name === 'string' ? name : '',
      email: typeof email === 'string' ? email : '',
      message: typeof message === 'string' ? message : '',
    };
    const normalizedEmail =
      typeof email === 'string' ? normalizeRateLimitEmail(email) : '';

    const ipRateLimitResult = await enforceRateLimitRules([
      {
        keyParts: ['contact', 'ip', getClientIp(req)],
        limit: CONTACT_IP_LIMIT,
        windowMs: CONTACT_IP_WINDOW_MS,
        message: 'Too many contact attempts. Please try again later.',
      },
    ]);

    if (!ipRateLimitResult.ok) {
      return createRateLimitedResponse(ipRateLimitResult);
    }

    if (!(await verifyTurnstileToken(String(token ?? '')))) {
      return NextResponse.json(
        { message: 'Invalid Turnstile Token' },
        { status: 400 },
      );
    }

    const identityRateLimitResult = await enforceRateLimitRules([
      {
        keyParts: ['contact', 'identity', hashRateLimitValue(normalizedEmail)],
        limit: CONTACT_IDENTITY_LIMIT,
        windowMs: CONTACT_IDENTITY_WINDOW_MS,
        message:
          'We recently received several messages from this email address. Please wait before trying again.',
        skip: !normalizedEmail,
      },
    ]);

    if (!identityRateLimitResult.ok) {
      return createRateLimitedResponse(identityRateLimitResult);
    }

    const { data, error } = await resend.emails.send({
      from: `Mogz Visuals <website@mogz.studio>`,
      reply_to: contactData.email || undefined,
      to: [EMAIL!],
      subject: `Website enquiry from ${contactData.name}`,
      react: Contact(contactData),
      text: getContactEmailText(contactData),
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
