'use client';

import { useBookingStore } from '@/lib/stores/bookingStore';
import {
  getBookingDateTimeError,
  isValidBookingTimeZone,
} from '@/lib/bookingValidation';
import { useBrowserTimeZone } from '@/lib/hooks/useBrowserTimeZone';
import { setInputMinDate } from '@/lib/utils';
import { useState, useEffect } from 'react';
import BookingNavigation from '../BookingNavigation';
import Input from '@/components/ui/form/Input';
import Textarea from '@/components/ui/form/Textarea';
import LocomotiveScrollSection from '../../locomotiveScrollSection/LocomotiveScrollSection';

export default function Step4_DateTime() {
  const date = useBookingStore((s) => s.date);
  const notes = useBookingStore((s) => s.notes);
  const updateField = useBookingStore((s) => s.updateField);
  const goBack = useBookingStore((s) => s.goBack);
  const [minDate, setMinDate] = useState('');
  const { browserTimeZone, timeZoneReady } = useBrowserTimeZone();

  useEffect(() => {
    setMinDate(setInputMinDate({ addDays: 1 }));
  }, []);

  const timeZoneError =
    timeZoneReady && !isValidBookingTimeZone(browserTimeZone)
      ? 'We could not confirm your local time. Refresh the page and try again.'
      : null;
  const dateError =
    date && browserTimeZone ? getBookingDateTimeError(date, browserTimeZone) : null;

  return (
    <LocomotiveScrollSection className='pb-8 md:pb-10 px-4 sm:px-8 max-w-7xl mx-auto'>
      <div className='w-full'>
        {/* Editorial Header */}
        <div className='mb-16 mt-4 md:mt-8 flex flex-col md:flex-row md:justify-between md:items-end gap-8'>
          <div className='max-w-2xl'>
            <BookingNavigation
              onBack={goBack}
              backLabel='Return to Add-ons'
            />

            <h2 className='text-4xl md:text-6xl font-heading text-white font-normal mb-0 tracking-tight'>
              <span className='text-[0.6em] md:text-[0.5em] tracking-widest uppercase font-body text-secondary block mb-4'>
                Schedule your Session
              </span>
              When works for you?
            </h2>
          </div>

          <div className='max-w-md text-secondary font-body text-base xl:text-lg leading-relaxed mb-1 md:mb-2'>
            Lock in your preferred date and time, and share any special requests
            or vision you have in mind.
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-10 md:mb-12 items-stretch'>
          {/* Date/Time Input */}
          <Input
            id='booking-date'
            type='datetime-local'
            label='Preferred Date & Time'
            name='date'
            state={{ date }}
            errors={{ date: dateError ?? undefined }}
            value={date}
            min={minDate}
            variant='premium'
            description='Select an initial timeframe. We will confirm exact availability seamlessly after you finalize your booking.'
            onChange={(e) => updateField('date', e.target.value)}
            required
          />

          {/* Notes Input */}
          <Textarea
            id='booking-notes'
            label='Notes / Special Requests'
            name='notes'
            state={{ notes }}
            value={notes}
            variant='premium'
            placeholder='Any specific locations, themes, props, or aesthetic requirements you have in mind...'
            onChange={(e) => updateField('notes', e.target.value)}
          />
        </div>

        {timeZoneError && (
          <div className='max-w-3xl -mt-6 mb-8 border border-red-500/30 bg-red-950/20 px-6 py-4'>
            <p className='text-red-200 text-sm font-body leading-relaxed'>
              {timeZoneError}
            </p>
          </div>
        )}
      </div>
    </LocomotiveScrollSection>
  );
}
