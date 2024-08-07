import { NextRequest, NextResponse } from 'next/server';
import { Contact } from '@/components/email/Templates';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);
const EMAIL = process.env.EMAIL!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email } = body;

    const { data, error } = await resend.emails.send({
      from: `Website <website@mogz.studio>`,
      reply_to: email,
      to: [EMAIL!],
      subject: `Website Message from ${name}`,
      react: Contact({ ...body }),
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
