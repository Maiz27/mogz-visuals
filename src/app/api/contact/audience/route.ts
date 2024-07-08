import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);
const audienceId = process.env.RESEND_AUDIENCE_ID!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    const { data, error } = await resend.contacts.create({
      email,
      unsubscribed: false,
      audienceId,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error });
  }
}
