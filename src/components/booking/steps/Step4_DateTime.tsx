'use client';

import { useBookingStore } from '@/lib/stores/bookingStore';
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
  const prevStep = useBookingStore((s) => s.prevStep);
  const [minDate, setMinDate] = useState('');

  useEffect(() => {
    setMinDate(setInputMinDate({ addDays: 1 }));
  }, []);

  return (
    <LocomotiveScrollSection className='pb-32 px-4 sm:px-8 max-w-7xl mx-auto'>
      <div className='w-full'>
        {/* Editorial Header */}
        <div className='mb-16 mt-4 md:mt-8 flex flex-col md:flex-row md:justify-between md:items-end gap-8'>
          <div className='max-w-2xl'>
            <BookingNavigation
              onBack={prevStep}
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

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-32 items-stretch'>
          {/* Date/Time Input */}
          <Input
            type='datetime-local'
            label='Preferred Date & Time'
            name='date'
            state={{ date }}
            value={date}
            min={minDate}
            variant='premium'
            description='Select an initial timeframe. We will confirm exact availability seamlessly after you finalize your booking.'
            onChange={(e) => updateField('date', e.target.value)}
            required
          />

          {/* Notes Input */}
          <Textarea
            label='Notes / Special Requests'
            name='notes'
            state={{ notes }}
            value={notes}
            variant='premium'
            placeholder='Any specific locations, themes, props, or aesthetic requirements you have in mind...'
            onChange={(e) => updateField('notes', e.target.value)}
          />
        </div>
      </div>
    </LocomotiveScrollSection>
  );
}
