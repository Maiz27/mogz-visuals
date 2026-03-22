import { NextRequest, NextResponse } from 'next/server';
import {
  BookingEmail,
  getBookingEmailText,
} from '@/components/email/Templates';
import { Resend } from 'resend';
import { fetchSanityData } from '@/lib/sanity/client';
import {
  getBookingCategoriesByIds,
  getBookingCategoryCombinations,
} from '@/lib/sanity/queries';
import {
  areBookingCategoriesCompatible,
  buildBookingCompatibilityMap,
  formatBookingDateTimeLocal,
  getBookingTotal,
  toBookingCategoryMap,
  validateBookingRequest,
} from '@/lib/booking';
import type {
  BookingCategory,
  BookingCategoryCombination,
  BookingSubmission,
} from '@/lib/types';

const resend = new Resend(process.env.RESEND_API_KEY!);
const EMAIL = process.env.EMAIL!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      items,
      date,
      notes,
      token,
      termsAccepted,
      timeZone,
    } = body as BookingSubmission;

    const validationErrors = validateBookingRequest({
      name,
      email,
      phone,
      items,
      date,
      notes,
      token,
      termsAccepted,
      timeZone,
    });

    const validationMessage = Object.values(validationErrors).find(Boolean);
    if (validationMessage) {
      return NextResponse.json(
        { message: validationMessage },
        { status: 400 },
      );
    }

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

    const categoryIds = Array.from(
      new Set(items.map((item) => item.categoryId).filter(Boolean)),
    );

    if (categoryIds.length !== items.length) {
      return NextResponse.json(
        { message: 'Each booking item must use a unique category.' },
        { status: 400 },
      );
    }

    const [categories, combinations] = await Promise.all([
      fetchSanityData(getBookingCategoriesByIds, { ids: categoryIds }),
      fetchSanityData(getBookingCategoryCombinations),
    ]);

    const safeCategories = (categories ?? []) as BookingCategory[];
    const safeCombinations =
      (combinations ?? []) as BookingCategoryCombination[];

    if (safeCategories.length !== categoryIds.length) {
      return NextResponse.json(
        { message: 'One or more categories are invalid.' },
        { status: 400 },
      );
    }

    const compatibilityMap = buildBookingCompatibilityMap(
      categoryIds,
      safeCombinations,
    );

    if (
      categoryIds.length > 1 &&
      !areBookingCategoriesCompatible(categoryIds, compatibilityMap)
    ) {
      return NextResponse.json(
        { message: 'The selected categories cannot be booked together.' },
        { status: 400 },
      );
    }

    const categoryMap = toBookingCategoryMap(
      safeCategories.map((category) => ({
        ...category,
        compatibleCategoryIds: compatibilityMap[category.id] ?? [],
      })),
    );

    const emailItems = items.map((item) => {
      const category = categoryMap[item.categoryId];
      const selectedPackage = category?.packages.find(
        (pkg) => pkg.id === item.packageId,
      );
      const resolvedAddOns =
        category?.addOns?.filter((addOn) => item.addOnIds.includes(addOn.id)) ??
        [];

      if (!category || !selectedPackage) {
        throw new Error(`INVALID_PACKAGE:${item.categoryId}`);
      }

      if (resolvedAddOns.length !== item.addOnIds.length) {
        throw new Error(`INVALID_ADDON:${item.categoryId}`);
      }

      return {
        category: category.name,
        packageName: selectedPackage.name,
        packagePrice: selectedPackage.price,
        addOns: resolvedAddOns.map((addOn) => ({
          name: addOn.name,
          price: addOn.price,
        })),
        subtotal:
          selectedPackage.price +
          resolvedAddOns.reduce((sum, addOn) => sum + addOn.price, 0),
      };
    });

    const totalPrice = getBookingTotal(
      items.map((item) => ({
        categoryId: item.categoryId,
        packageId: item.packageId,
        addOnIds: item.addOnIds,
      })),
      categoryMap,
    );

    const formattedDate = formatBookingDateTimeLocal(date, timeZone);

    const serviceSummary =
      emailItems.length === 1
        ? emailItems[0].category
        : `${emailItems.length} combined services`;

    const { data, error } = await resend.emails.send({
      from: `Mogz Visuals Booking <website@mogz.studio>`,
      reply_to: email,
      to: [EMAIL!],
      subject: `New Booking Request from ${name} - ${serviceSummary}`,
      react: BookingEmail({
        name,
        email,
        phone,
        items: emailItems,
        totalPrice,
        date: formattedDate,
        notes,
      }),
      text: getBookingEmailText({
        name,
        email,
        phone,
        items: emailItems,
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
    if (error instanceof Error) {
      if (error.message.startsWith('INVALID_PACKAGE:')) {
        return NextResponse.json(
          { message: 'One or more selected packages are invalid.' },
          { status: 400 },
        );
      }

      if (error.message.startsWith('INVALID_ADDON:')) {
        return NextResponse.json(
          { message: 'One or more selected add-ons are invalid.' },
          { status: 400 },
        );
      }
    }

    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
