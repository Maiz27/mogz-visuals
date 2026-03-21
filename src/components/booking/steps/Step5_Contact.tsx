'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useBooking } from '../BookingContext';
import TurnstileWidget from '@/components/ui/TurnstileWidget';
import { HiArrowLongLeft, HiChevronRight } from 'react-icons/hi2';
import CTAButton from '@/components/ui/CTA/CTAButton';

export default function Step5_Contact() {
  const { state, updateField, prevStep } = useBooking();

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
            Return to Schedule
          </button>

          <h2 className='text-4xl md:text-6xl font-heading text-white font-normal mb-0 tracking-tight'>
            <span className='text-[0.6em] md:text-[0.5em] tracking-widest uppercase font-body text-secondary block mb-4'>
              Finalize Request
            </span>
            Your Details
          </h2>
        </div>

        <div className='max-w-md text-secondary font-body text-base xl:text-lg leading-relaxed mb-1 md:mb-2'>
          Almost there — please provide your contact information so we can
          reserve your booking.
        </div>
      </div>

      <div className='max-w-2xl space-y-6 mb-16'>
        {/* Name Input */}
        <div className='group relative'>
          <div className='absolute -inset-px bg-linear-to-r from-primary/30 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none' />
          <div className='relative bg-surface border border-white/5 group-focus-within:border-primary/50 p-6 md:p-8 transition-colors duration-500'>
            <label className='block text-primary text-[10px] tracking-[0.2em] uppercase font-body mb-4 font-semibold'>
              Full Name <span className='text-white/50'>*</span>
            </label>
            <input
              type='text'
              value={state.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder='Your full name'
              className='w-full bg-transparent text-white md:text-xl font-heading tracking-wide focus:outline-none placeholder:text-secondary/50'
            />
          </div>
        </div>

        {/* Email Input */}
        <div className='group relative'>
          <div className='absolute -inset-px bg-linear-to-r from-primary/30 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none' />
          <div className='relative bg-surface border border-white/5 group-focus-within:border-primary/50 p-6 md:p-8 transition-colors duration-500'>
            <label className='block text-primary text-[10px] tracking-[0.2em] uppercase font-body mb-4 font-semibold'>
              Email Address <span className='text-white/50'>*</span>
            </label>
            <input
              type='email'
              value={state.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder='you@example.com'
              className='w-full bg-transparent text-white md:text-xl font-heading tracking-wide focus:outline-none placeholder:text-secondary/50'
            />
          </div>
        </div>

        {/* Phone Input */}
        <div className='group relative'>
          <div className='absolute -inset-px bg-linear-to-r from-primary/30 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none' />
          <div className='relative bg-surface border border-white/5 group-focus-within:border-primary/50 p-6 md:p-8 transition-colors duration-500'>
            <label className='block text-primary text-[10px] tracking-[0.2em] uppercase font-body mb-4 font-semibold'>
              Phone Number <span className='text-white/50'>*</span>
            </label>
            <input
              type='tel'
              value={state.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder='+211 900 000 000'
              className='w-full bg-transparent text-white md:text-xl font-heading tracking-wide focus:outline-none placeholder:text-secondary/50'
            />
          </div>
        </div>

        {/* Turnstile */}
        <div className='py-4'>
          <TurnstileWidget
            onVerify={(t) => {
              updateField('token', t);
            }}
          />
        </div>

        {/* Terms */}
        <div
          onClick={() => updateField('termsAccepted', !state.termsAccepted)}
          className='group relative bg-surface border border-white/5 p-6 md:p-8 hover:border-primary/30 transition-colors duration-500 cursor-pointer flex items-start gap-6'
          role='checkbox'
          aria-checked={state.termsAccepted}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              updateField('termsAccepted', !state.termsAccepted);
            }
          }}
        >
          <div
            className={`mt-1 w-6 h-6 border flex items-center justify-center transition-all duration-500 rounded-sm shrink-0 ${state.termsAccepted ? 'border-primary bg-primary /10' : 'border-white/20 group-hover:border-primary/50'}`}
          >
            <div
              className={`w-3 h-3 bg-primary transition-all duration-500 scale-0 ${state.termsAccepted ? 'scale-100' : ''}`}
            />
          </div>
          <span
            className='text-secondary text-sm md:text-base font-body leading-relaxed'
            onClick={(e) => e.stopPropagation()}
          >
            I agree to the{' '}
            <Link
              href='/terms-of-use'
              target='_blank'
              className='text-white border-b border-white/20 pb-0.5 hover:text-primary hover:border-primary transition-colors'
            >
              Terms &amp; Conditions
            </Link>{' '}
            and understand the deposit policy (50% required to confirm booking).
          </span>
        </div>
      </div>
    </div>
  );
}
