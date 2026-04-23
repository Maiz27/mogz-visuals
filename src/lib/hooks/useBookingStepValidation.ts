'use client';

import type { BookingSelection } from '@/lib/types';
import {
  getBookingDateTimeError,
  validateBookingContactFields,
} from '@/lib/bookingValidation';

type UseBookingStepValidationArgs = {
  step: number;
  selections: BookingSelection[];
  date: string;
  name: string;
  email: string;
  phone: string;
  termsAccepted: boolean;
  token: string;
  timeZone?: string;
};

export function useBookingStepValidation({
  step,
  selections,
  date,
  name,
  email,
  phone,
  termsAccepted,
  token,
  timeZone,
}: UseBookingStepValidationArgs) {
  const dateError = date ? getBookingDateTimeError(date, timeZone) : null;
  const contactErrors = validateBookingContactFields({
    name,
    email,
    phone,
    termsAccepted,
    token,
  });
  const hasContactErrors = Object.keys(contactErrors).length > 0;
  const contactValidationMessage =
    contactErrors.name ??
    contactErrors.email ??
    contactErrors.phone ??
    contactErrors.termsAccepted ??
    contactErrors.token ??
    null;

  const canProceed = (() => {
    switch (step) {
      case 1:
        return selections.length > 0;
      case 2:
        return (
          selections.length > 0 &&
          selections.every((selection) => !!selection.packageId)
        );
      case 3:
        return true;
      case 4:
        return Boolean(date) && !dateError;
      case 5:
        return !hasContactErrors;
      default:
        return false;
    }
  })();

  const validationMessage = (() => {
    switch (step) {
      case 1:
        return selections.length === 0
          ? 'Select at least one service to continue.'
          : null;
      case 2:
        return selections.some((selection) => !selection.packageId)
          ? 'Choose a package for each selected service.'
          : null;
      case 4:
        if (!date) {
          return 'Choose your preferred date and time.';
        }

        return dateError;
      case 5:
        return hasContactErrors ? contactValidationMessage : null;
      default:
        return null;
    }
  })();

  return {
    canProceed,
    validationMessage,
  };
}
