import { NextRequest, NextResponse } from 'next/server';
import {
  BookingEmail,
  getBookingEmailText,
} from '@/components/email/Templates';
import { Resend } from 'resend';
import { fetchSanityDataUncached } from '@/lib/sanity/client';
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
import {
  enforceRateLimitRules,
  getClientIp,
  hashRateLimitValue,
  normalizeRateLimitEmail,
  normalizeRateLimitPhone,
  parseRateLimitNumber,
} from '@/lib/server/rateLimit';
import {
  createRateLimitedResponse,
  isJsonObject,
  verifyTurnstileToken,
} from '@/lib/server/request';
import type {
  BookingCategory,
  BookingCategoryCombination,
  BookingSubmission,
} from '@/lib/types';

const resend = new Resend(process.env.RESEND_API_KEY!);
const EMAIL = process.env.EMAIL!;
const BOOKING_IP_LIMIT = parseRateLimitNumber(
  process.env.BOOKING_RATE_LIMIT_IP,
  5,
);
const BOOKING_IP_WINDOW_MS = parseRateLimitNumber(
  process.env.BOOKING_RATE_LIMIT_WINDOW,
  60 * 60 * 1000,
);
const BOOKING_IDENTITY_LIMIT = parseRateLimitNumber(
  process.env.BOOKING_IDENTITY_RATE_LIMIT,
  3,
);
const BOOKING_IDENTITY_WINDOW_MS = parseRateLimitNumber(
  process.env.BOOKING_IDENTITY_RATE_LIMIT_WINDOW,
  12 * 60 * 60 * 1000,
);
const BOOKING_DUPLICATE_LIMIT = parseRateLimitNumber(
  process.env.BOOKING_DUPLICATE_RATE_LIMIT,
  1,
);
const BOOKING_DUPLICATE_WINDOW_MS = parseRateLimitNumber(
  process.env.BOOKING_DUPLICATE_RATE_LIMIT_WINDOW,
  5 * 60 * 1000,
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!isJsonObject(body)) {
      return NextResponse.json(
        { message: 'Invalid booking payload.' },
        { status: 400 },
      );
    }

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

    const normalizedEmail = normalizeRateLimitEmail(email);
    const normalizedPhone = normalizeRateLimitPhone(phone);
    const normalizedItems = [...items]
      .map((item) => ({
        categoryId: item.categoryId,
        packageId: item.packageId,
        addOnIds: [...item.addOnIds].sort(),
      }))
      .sort(
        (left, right) =>
          left.categoryId.localeCompare(right.categoryId) ||
          (left.packageId ?? '').localeCompare(right.packageId ?? ''),
      );
    const duplicateSubmissionHash = hashRateLimitValue(
      JSON.stringify({
        name: name.trim().toLowerCase(),
        email: normalizedEmail,
        phone: normalizedPhone,
        items: normalizedItems,
        date: date.trim(),
        notes: (notes ?? '').trim(),
        timeZone: (timeZone ?? '').trim(),
      }),
    );

    const ipRateLimitResult = await enforceRateLimitRules([
      {
        keyParts: ['booking', 'ip', getClientIp(req)],
        limit: BOOKING_IP_LIMIT,
        windowMs: BOOKING_IP_WINDOW_MS,
        message: 'Too many booking attempts. Please try again later.',
      },
    ]);

    if (!ipRateLimitResult.ok) {
      return createRateLimitedResponse(ipRateLimitResult);
    }

    if (!(await verifyTurnstileToken(token))) {
      return NextResponse.json(
        { message: 'Invalid Turnstile Token' },
        { status: 400 },
      );
    }

    const submissionRateLimitResult = await enforceRateLimitRules([
      {
        keyParts: [
          'booking',
          'identity',
          hashRateLimitValue(`${normalizedEmail}:${normalizedPhone}`),
        ],
        limit: BOOKING_IDENTITY_LIMIT,
        windowMs: BOOKING_IDENTITY_WINDOW_MS,
        message:
          'We recently received several booking attempts with these contact details. Please wait before trying again.',
      },
      {
        keyParts: ['booking', 'duplicate', duplicateSubmissionHash],
        limit: BOOKING_DUPLICATE_LIMIT,
        windowMs: BOOKING_DUPLICATE_WINDOW_MS,
        message:
          'We already received a similar booking request recently. Please wait a few minutes before sending it again.',
      },
    ]);

    if (!submissionRateLimitResult.ok) {
      return createRateLimitedResponse(submissionRateLimitResult);
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
      fetchSanityDataUncached(getBookingCategoriesByIds, { ids: categoryIds }),
      fetchSanityDataUncached(getBookingCategoryCombinations),
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
        : emailItems.map((item) => item.category).join(' + ');

    const { data, error } = await resend.emails.send({
      from: `Mogz Visuals Bookings <website@mogz.studio>`,
      reply_to: email,
      to: [EMAIL!],
      subject: `Booking enquiry: ${serviceSummary}`,
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
