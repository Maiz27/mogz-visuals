import { NextRequest, NextResponse } from 'next/server';
import { BookingEmail } from '@/components/email/Templates';
import { Resend } from 'resend';
import { BOOKING_DATA } from '@/lib/Constants';

const resend = new Resend(process.env.RESEND_API_KEY!);
const EMAIL = process.env.EMAIL!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, categoryId, packageId, addOnIds, date, notes, token } = body;

    // Verify Turnstile Token
    const verifyRes = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: token,
        }),
      },
    );

    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      return NextResponse.json(
        { message: 'Invalid Turnstile Token' },
        { status: 400 },
      );
    }

    // Resolve category and package labels
    const category = BOOKING_DATA.find((c) => c.id === categoryId);
    const pkg = category?.packages.find((p) => p.id === packageId);
    const resolvedAddOns = (addOnIds as string[])
      .map((id) => {
        const addOn = category?.addOns?.find((a) => a.id === id);
        return addOn ? { name: addOn.name, price: addOn.price } : null;
      })
      .filter(Boolean);

    const totalPrice =
      (pkg?.price ?? 0) +
      resolvedAddOns.reduce((sum, a) => sum + (a?.price ?? 0), 0);

    const formattedDate = date
      ? new Date(date).toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Not Selected';

    const { data, error } = await resend.emails.send({
      from: `Mogz Visuals Booking <website@mogz.studio>`,
      reply_to: email,
      to: [EMAIL!],
      subject: `New Booking Request from ${name} — ${category?.name ?? categoryId}`,
      react: BookingEmail({
        name,
        email,
        phone,
        category: category?.name ?? categoryId,
        packageName: pkg?.name ?? packageId,
        packagePrice: pkg?.price ?? 0,
        addOns: resolvedAddOns as { name: string; price: number }[],
        totalPrice,
        date: formattedDate,
        notes,
      }),
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
