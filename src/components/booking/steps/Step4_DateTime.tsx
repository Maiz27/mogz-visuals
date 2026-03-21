'use client';
import { useBooking } from '../BookingContext';
import { setInputMinDate } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { HiArrowLongLeft } from 'react-icons/hi2';

export default function Step4_DateTime() {
  const { state, updateField, prevStep } = useBooking();
  const [minDate, setMinDate] = useState('');

  useEffect(() => {
    setMinDate(setInputMinDate({ addDays: 1 }));
  }, []);

  return (
    <div className='w-full'>
      {/* Editorial Header */}
      <div className='mb-16 mt-4 md:mt-8 flex flex-col md:flex-row md:justify-between md:items-end gap-8'>
        <div className='max-w-2xl'>
          <button
            onClick={prevStep}
            className='group flex items-center gap-2 text-secondary hover:text-primary text-xs font-body tracking-[0.2em] uppercase transition-colors mb-10 outline-none'
          >
            <HiArrowLongLeft className='text-2xl transition-transform group-hover:-translate-x-1.5' />
            Return to Add-Ons
          </button>

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
        {/* Date/Time Input Container */}
        <div className='group relative'>
          <div className='absolute -inset-px bg-linear-to-r from-primary/30 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none' />
          <div className='relative bg-surface border border-white/5 group-focus-within:border-primary/50 p-8 md:p-10 transition-colors duration-500 h-full flex flex-col justify-center'>
            <label className='block text-primary text-[10px] tracking-[0.2em] uppercase font-body mb-6 font-semibold'>
              Preferred Date &amp; Time
            </label>
            <input
              type='datetime-local'
              value={state.date}
              min={minDate}
              onChange={(e) => updateField('date', e.target.value)}
              className='w-full bg-transparent text-white md:text-xl font-heading tracking-wide focus:outline-none placeholder:text-secondary/50 cursor-pointer'
            />
            <div className='mt-8 pt-8 border-t border-white/5'>
              <p className='text-secondary text-xs font-body leading-relaxed'>
                Select an initial timeframe. We will confirm exact availability
                seamlessly after you finalize your booking.
              </p>
            </div>
          </div>
        </div>

        {/* Notes Input Container */}
        <div className='group relative'>
          <div className='absolute -inset-px bg-linear-to-r from-transparent to-primary/30 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none' />
          <div className='relative bg-surface border border-white/5 group-focus-within:border-primary/50 p-8 md:p-10 transition-colors duration-500 h-full flex flex-col'>
            <div className='flex justify-between items-center mb-6'>
              <label className='block text-primary text-[10px] tracking-[0.2em] uppercase font-body font-semibold'>
                Notes / Special Requests
              </label>
              <span className='text-secondary text-[9px] tracking-[0.2em] uppercase font-body'>
                Optional
              </span>
            </div>

            <textarea
              value={state.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder='Any specific locations, themes, props, or aesthetic requirements you have in mind...'
              className='w-full flex-1 bg-transparent text-white text-sm md:text-base font-body leading-relaxed focus:outline-none placeholder:text-secondary/30 resize-none min-h-40'
            />
          </div>
        </div>
      </div>
    </div>
  );
}
