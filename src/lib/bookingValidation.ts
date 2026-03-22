import { EMAIL_PATTERN } from '@/lib/Constants';
import type { BookingSelection, BookingState } from '@/lib/types';

type BookingContactFields = Pick<
  BookingState,
  'name' | 'email' | 'phone' | 'termsAccepted' | 'token'
>;

export type BookingRequestPayload = BookingContactFields & {
  items: BookingSelection[];
  date: string;
  notes?: string;
  timeZone?: string;
};

export type BookingValidationErrors = Partial<
  Record<
    'name' | 'email' | 'phone' | 'termsAccepted' | 'token' | 'date' | 'items',
    string
  >
>;

type ParsedBookingDateTime = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

const BOOKING_DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

export function isValidBookingEmail(email: string) {
  return EMAIL_PATTERN.test(email.trim());
}

export function isValidBookingPhone(phone: string) {
  return phone.trim().length > 4;
}

export function parseBookingDateTimeLocal(
  value: string,
): ParsedBookingDateTime | null {
  const trimmedValue = value.trim();
  const match = BOOKING_DATE_TIME_PATTERN.exec(trimmedValue);
  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute] = match;
  const parsed = {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
  };

  const candidate = new Date(
    parsed.year,
    parsed.month - 1,
    parsed.day,
    parsed.hour,
    parsed.minute,
  );

  if (
    Number.isNaN(candidate.getTime()) ||
    candidate.getFullYear() !== parsed.year ||
    candidate.getMonth() !== parsed.month - 1 ||
    candidate.getDate() !== parsed.day ||
    candidate.getHours() !== parsed.hour ||
    candidate.getMinutes() !== parsed.minute
  ) {
    return null;
  }

  return parsed;
}

export function isValidBookingDateTimeLocal(value: string) {
  return parseBookingDateTimeLocal(value) !== null;
}

export function validateBookingContactFields(
  fields: BookingContactFields,
): BookingValidationErrors {
  const errors: BookingValidationErrors = {};

  if (fields.name.trim().length <= 2) {
    errors.name = 'Name must be longer than 2 characters.';
  }

  if (!isValidBookingEmail(fields.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!isValidBookingPhone(fields.phone)) {
    errors.phone = 'Phone number must be longer than 4 characters.';
  }

  if (!fields.termsAccepted) {
    errors.termsAccepted = 'You must agree to the terms.';
  }

  if (!fields.token.trim()) {
    errors.token = 'Turnstile verification is required.';
  }

  return errors;
}

export function validateBookingRequest(
  payload: BookingRequestPayload,
): BookingValidationErrors {
  const errors = validateBookingContactFields(payload);

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    errors.items = 'At least one booking item is required.';
  }

  if (!isValidBookingDateTimeLocal(payload.date)) {
    errors.date = 'Please select a valid preferred date and time.';
  }

  return errors;
}

export function getBookingResumeStep(
  draft: Pick<
    BookingState,
    'step' | 'selections' | 'date' | 'name' | 'email' | 'phone' | 'termsAccepted'
  >,
) {
  const requestedStep = Math.min(Math.max(draft.step || 1, 1), 6);
  if (draft.selections.length === 0) {
    return 1;
  }

  if (draft.selections.some((selection) => !selection.packageId)) {
    return Math.min(requestedStep, 2);
  }

  if (!isValidBookingDateTimeLocal(draft.date)) {
    return Math.min(requestedStep, 4);
  }

  return Math.min(requestedStep, 5);
}

export function formatBookingDateTimeLocal(
  value: string,
  timeZone?: string,
  locale = 'en-US',
) {
  const parsed = parseBookingDateTimeLocal(value);
  if (!parsed) {
    return 'Not Selected';
  }

  const normalizedDate = new Date(
    Date.UTC(
      parsed.year,
      parsed.month - 1,
      parsed.day,
      parsed.hour,
      parsed.minute,
    ),
  );

  const formatted = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(normalizedDate);

  return timeZone ? `${formatted} (${timeZone})` : formatted;
}
