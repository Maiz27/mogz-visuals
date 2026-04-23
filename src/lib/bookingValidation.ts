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

type ZonedDateTimeParts = ParsedBookingDateTime & {
  second: number;
};

type BookingDateTimeValidationOptions = {
  now?: Date;
  minimumNoticeHours?: number;
};

type BookingResumeStepOptions = BookingDateTimeValidationOptions & {
  timeZone?: string;
};

const BOOKING_DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

export const BOOKING_MIN_NOTICE_HOURS = 24;

function normalizeBookingString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function getZonedDateTimeParts(
  date: Date,
  timeZone: string,
): ZonedDateTimeParts | null {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });
    const formattedParts = formatter.formatToParts(date);
    const lookup = Object.fromEntries(
      formattedParts.map((part) => [part.type, part.value]),
    );

    return {
      year: Number(lookup.year),
      month: Number(lookup.month),
      day: Number(lookup.day),
      hour: Number(lookup.hour),
      minute: Number(lookup.minute),
      second: Number(lookup.second),
    };
  } catch {
    return null;
  }
}

function getTimeZoneOffsetMilliseconds(
  timestamp: number,
  timeZone: string,
) {
  const zoned = getZonedDateTimeParts(new Date(timestamp), timeZone);
  if (!zoned) {
    return null;
  }

  return (
    Date.UTC(
      zoned.year,
      zoned.month - 1,
      zoned.day,
      zoned.hour,
      zoned.minute,
      zoned.second,
    ) - timestamp
  );
}

function isValidBookingSelectionArray(
  selections: unknown,
): selections is BookingSelection[] {
  return (
    Array.isArray(selections) &&
    selections.length > 0 &&
    selections.every((selection) => {
      if (!selection || typeof selection !== 'object') {
        return false;
      }

      const record = selection as Record<string, unknown>;
      return (
        normalizeBookingString(record.categoryId).length > 0 &&
        normalizeBookingString(record.packageId).length > 0 &&
        Array.isArray(record.addOnIds) &&
        record.addOnIds.every(
          (addOnId) => normalizeBookingString(addOnId).length > 0,
        )
      );
    })
  );
}

export function isValidBookingEmail(email: string) {
  return EMAIL_PATTERN.test(normalizeBookingString(email));
}

export function isValidBookingPhone(phone: string) {
  return normalizeBookingString(phone).length > 4;
}

export function parseBookingDateTimeLocal(
  value: string,
): ParsedBookingDateTime | null {
  const trimmedValue = normalizeBookingString(value);
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

export function isValidBookingTimeZone(timeZone?: string) {
  const normalizedTimeZone = normalizeBookingString(timeZone);
  if (!normalizedTimeZone) {
    return false;
  }

  try {
    new Intl.DateTimeFormat('en-US', {
      timeZone: normalizedTimeZone,
    }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function resolveBookingDateTimeLocal(value: string, timeZone?: string) {
  const parsed = parseBookingDateTimeLocal(value);
  const normalizedTimeZone = normalizeBookingString(timeZone);

  if (!parsed || !isValidBookingTimeZone(normalizedTimeZone)) {
    return null;
  }

  const baseUtcTimestamp = Date.UTC(
    parsed.year,
    parsed.month - 1,
    parsed.day,
    parsed.hour,
    parsed.minute,
    0,
  );

  let resolvedTimestamp = baseUtcTimestamp;
  for (let i = 0; i < 2; i += 1) {
    const offset = getTimeZoneOffsetMilliseconds(
      resolvedTimestamp,
      normalizedTimeZone,
    );

    if (offset === null) {
      return null;
    }

    resolvedTimestamp = baseUtcTimestamp - offset;
  }

  const resolvedDate = new Date(resolvedTimestamp);
  const resolvedParts = getZonedDateTimeParts(resolvedDate, normalizedTimeZone);

  if (
    !resolvedParts ||
    resolvedParts.year !== parsed.year ||
    resolvedParts.month !== parsed.month ||
    resolvedParts.day !== parsed.day ||
    resolvedParts.hour !== parsed.hour ||
    resolvedParts.minute !== parsed.minute
  ) {
    return null;
  }

  return resolvedDate;
}

export function getBookingDateTimeError(
  value: string,
  timeZone?: string,
  options: BookingDateTimeValidationOptions = {},
) {
  if (!parseBookingDateTimeLocal(value)) {
    return 'Choose a valid date and time.';
  }

  if (!isValidBookingTimeZone(timeZone)) {
    return 'We could not confirm your local time. Refresh the page and try again.';
  }

  const resolvedDate = resolveBookingDateTimeLocal(value, timeZone);
  if (!resolvedDate) {
    return 'Choose a valid date and time.';
  }

  const now = options.now ?? new Date();
  if (resolvedDate.getTime() <= now.getTime()) {
    return 'Choose a future date and time.';
  }

  const minimumNoticeHours =
    options.minimumNoticeHours ?? BOOKING_MIN_NOTICE_HOURS;
  const minimumNoticeMilliseconds =
    minimumNoticeHours * 60 * 60 * 1000;

  if (resolvedDate.getTime() < now.getTime() + minimumNoticeMilliseconds) {
    return `Choose a time at least ${minimumNoticeHours} hours from now.`;
  }

  return null;
}

export function validateBookingContactFields(
  fields: BookingContactFields,
): BookingValidationErrors {
  const errors: BookingValidationErrors = {};
  const name = normalizeBookingString(fields.name);
  const email = normalizeBookingString(fields.email);
  const phone = normalizeBookingString(fields.phone);
  const token = normalizeBookingString(fields.token);

  if (name.length <= 2) {
    errors.name = 'Enter your full name.';
  }

  if (!isValidBookingEmail(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!isValidBookingPhone(phone)) {
    errors.phone = 'Enter a valid phone number.';
  }

  if (!fields.termsAccepted) {
    errors.termsAccepted = 'Please agree to the terms to continue.';
  }

  if (!token) {
    errors.token = 'Please complete the quick human check.';
  }

  return errors;
}

export function validateBookingRequest(
  payload: BookingRequestPayload,
): BookingValidationErrors {
  const errors = validateBookingContactFields(payload);

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    errors.items = 'At least one booking item is required.';
  } else if (!isValidBookingSelectionArray(payload.items)) {
    errors.items = 'Please review your selected services and try again.';
  }

  const dateError = getBookingDateTimeError(payload.date, payload.timeZone);
  if (dateError) {
    errors.date = dateError;
  }

  return errors;
}

export function getBookingResumeStep(
  draft: Pick<
    BookingState,
    'step' | 'selections' | 'date' | 'name' | 'email' | 'phone' | 'termsAccepted'
  >,
  options: BookingResumeStepOptions = {},
) {
  const requestedStep = Math.min(Math.max(draft.step || 1, 1), 6);
  if (draft.selections.length === 0) {
    return 1;
  }

  if (draft.selections.some((selection) => !selection.packageId)) {
    return Math.min(requestedStep, 2);
  }

  if (getBookingDateTimeError(draft.date, options.timeZone, options)) {
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
