import { NextRequest, NextResponse } from 'next/server';
import { BookingEmail } from '@/components/email/Templates';
import { Resend } from 'resend';
import { fetchSanityData } from '@/lib/sanity/client';
import { getBookingCategoryBySlug } from '@/lib/sanity/queries';
import type { BookingCategory } from '@/lib/types';

const resend = new Resend(process.env.RESEND_API_KEY!);
const EMAIL = process.env.EMAIL!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, categoryId, packageId, addOnIds, date, notes, token } = body;

    // 1. Verify Turnstile Token
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

    // 2. Fetch Category Details from Sanity for Price Resolution
    const categoryData: BookingCategory | null = await fetchSanityData(getBookingCategoryBySlug, {
      slug: categoryId,
    });

    if (!categoryData) {
      return NextResponse.json(
        { message: 'Invalid Category ID' },
        { status: 400 },
      );
    }

    // 3. Resolve Package and Add-on Prices
    const selectedPackage = categoryData.packages?.find((p) => p.name === packageId);
    const resolvedAddOns = (addOnIds as string[]).map((name) => {
      const addOn = categoryData.addOns?.find((a) => a.name === name);
      return { name, price: addOn?.price ?? 0 };
    });

    const packagePrice = selectedPackage?.price ?? 0;
    const totalPrice = packagePrice + resolvedAddOns.reduce((sum, a) => sum + a.price, 0);

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
      subject: `New Booking Request from ${name} — ${categoryData.name}`,
      react: BookingEmail({
        name,
        email,
        phone,
        category: categoryData.name,
        packageName: packageId,
        packagePrice: packagePrice,
        addOns: resolvedAddOns,
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
